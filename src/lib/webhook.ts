import { prisma } from "./db"
import crypto from "crypto"

export type WebhookEvent =
  | "link.created"
  | "link.updated"
  | "link.deleted"
  | "link.clicked"
  | "dashboard.updated"
  | "category.created"
  | "category.deleted"

export interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  dashboardId: string
  data: Record<string, unknown>
}

/**
 * Sign webhook payload with HMAC SHA256
 */
function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
}

/**
 * Trigger webhooks for a specific event
 */
export async function triggerWebhook(
  dashboardId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  try {
    // Find all active webhooks for this dashboard that listen to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        dashboardId,
        isActive: true
      }
    })

    // Filter webhooks that listen to this specific event
    const relevantWebhooks = webhooks.filter(webhook => {
      const events = webhook.events.split(",").map(e => e.trim())
      return events.includes(event) || events.includes("*")
    })

    // Trigger each webhook
    const deliveryPromises = relevantWebhooks.map(webhook =>
      deliverWebhook(webhook.id, event, dashboardId, data)
    )

    // Execute all deliveries in parallel (don't await to avoid blocking)
    Promise.all(deliveryPromises).catch(error => {
      console.error("Error delivering webhooks:", error)
    })
  } catch (error) {
    console.error("Error triggering webhooks:", error)
  }
}

/**
 * Deliver webhook to endpoint
 */
async function deliverWebhook(
  webhookId: string,
  event: WebhookEvent,
  dashboardId: string,
  data: Record<string, unknown>
): Promise<void> {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId }
  })

  if (!webhook) return

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    dashboardId,
    data
  }

  const payloadString = JSON.stringify(payload)

  // Create delivery record
  const delivery = await prisma.webhookDelivery.create({
    data: {
      webhookId,
      event,
      payload: payloadString,
      status: "pending",
      attempts: 0
    }
  })

  // Attempt delivery with retries
  await attemptDelivery(delivery.id, webhook.url, payloadString, webhook.secret)

  // Update last triggered time
  await prisma.webhook.update({
    where: { id: webhookId },
    data: { lastTriggered: new Date() }
  })
}

/**
 * Attempt webhook delivery with exponential backoff retry
 */
async function attemptDelivery(
  deliveryId: string,
  url: string,
  payload: string,
  secret: string | null,
  attempt: number = 1
): Promise<void> {
  const maxAttempts = 3
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId }
  })

  if (!delivery) return

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "PersonalLinkDashboard-Webhook/1.0"
    }

    // Add signature if secret is provided
    if (secret) {
      const signature = signPayload(payload, secret)
      headers["X-Webhook-Signature"] = signature
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: payload,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    const responseText = await response.text()

    if (response.ok) {
      // Success
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: "success",
          attempts: attempt,
          response: responseText.substring(0, 1000) // Store first 1000 chars
        }
      })
    } else {
      throw new Error(`HTTP ${response.status}: ${responseText}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    if (attempt < maxAttempts) {
      // Retry with exponential backoff
      const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, delay))
      await attemptDelivery(deliveryId, url, payload, secret, attempt + 1)
    } else {
      // Max attempts reached, mark as failed
      await prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: "failed",
          attempts: attempt,
          response: errorMessage.substring(0, 1000)
        }
      })
    }
  }
}

/**
 * Test webhook endpoint
 */
export async function testWebhook(url: string, secret?: string): Promise<{
  success: boolean
  message: string
  statusCode?: number
}> {
  try {
    const payload: WebhookPayload = {
      event: "link.clicked",
      timestamp: new Date().toISOString(),
      dashboardId: "test",
      data: {
        test: true,
        message: "This is a test webhook delivery"
      }
    }

    const payloadString = JSON.stringify(payload)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "PersonalLinkDashboard-Webhook/1.0"
    }

    if (secret) {
      const signature = signPayload(payloadString, secret)
      headers["X-Webhook-Signature"] = signature
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(10000)
    })

    if (response.ok) {
      return {
        success: true,
        message: "Webhook test successful",
        statusCode: response.status
      }
    } else {
      return {
        success: false,
        message: `HTTP ${response.status}: ${await response.text()}`,
        statusCode: response.status
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

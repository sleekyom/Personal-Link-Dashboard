# Personal Link Dashboard

A modern, customizable web application for managing and sharing personal, professional, or project-specific links in a beautiful dashboard. Built with Next.js, TypeScript, and TailwindCSS.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth support
- 📊 **Dashboard Management**: Create and manage multiple dashboards
- 🔗 **Link Organization**: Add, edit, and reorder links with drag-and-drop
- 🌐 **Public Sharing**: Share dashboards with custom slugs
- 📱 **Responsive Design**: Works perfectly on all devices
- 🎨 **Customizable Themes**: Personalize your dashboard appearance
- 📈 **Analytics**: Track link clicks and visitor statistics
- 🐳 **Docker Ready**: Easy deployment with Docker and Docker Compose

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js
- **Deployment**: Docker, Nginx, Hetzner Cloud

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for deployment)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd personal-link-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` and add your configuration:

   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Using Docker (Recommended)

1. **Build the Docker image**

   ```bash
   docker build -t personal-link-dashboard .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Deploy to Hetzner

1. **Set up your Hetzner server**

   - Create a new server (Ubuntu 22.04 recommended)
   - Install Docker and Docker Compose
   - Configure your domain DNS

2. **Deploy using the provided script**

   ```bash
   export SERVER_HOST="your-server-ip"
   export SERVER_USER="root"
   ./deploy.sh
   ```

3. **Set up SSL certificates**
   ```bash
   # On your server
   mkdir -p /opt/personal-link-dashboard/ssl
   # Add your SSL certificates (cert.pem and key.pem)
   ```

## Usage

### Creating Your First Dashboard

1. **Sign up/Sign in** using Google OAuth or email
2. **Create a new dashboard** by clicking "Create New Dashboard"
3. **Add links** to your dashboard with titles, URLs, and descriptions
4. **Customize** your dashboard theme and settings
5. **Share** your dashboard publicly with a custom slug

### Managing Links

- **Add Links**: Click the "Add New Link" card
- **Edit Links**: Click the edit icon on any link
- **Delete Links**: Click the trash icon to remove links
- **Reorder Links**: Drag and drop to reorder (coming soon)

### Public Sharing

- **Make Public**: Toggle the public setting in dashboard settings
- **Custom Slug**: Set a custom URL slug for your dashboard
- **Share URL**: Share `yourdomain.com/your-slug` with others

## API Endpoints

### Authentication

- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Dashboards

- `GET /api/dashboards` - Get user's dashboards
- `POST /api/dashboards` - Create new dashboard
- `GET /api/dashboards/[id]` - Get specific dashboard
- `PUT /api/dashboards/[id]` - Update dashboard
- `DELETE /api/dashboards/[id]` - Delete dashboard

### Links

- `GET /api/dashboards/[id]/links` - Get dashboard links
- `POST /api/dashboards/[id]/links` - Add new link
- `PUT /api/links/[id]` - Update link
- `DELETE /api/links/[id]` - Delete link
- `POST /api/links/[id]/click` - Track link click

### Public Access

- `GET /api/public/[slug]` - Get public dashboard by slug

## Configuration

### Environment Variables

| Variable               | Description                | Required |
| ---------------------- | -------------------------- | -------- |
| `DATABASE_URL`         | Database connection string | Yes      |
| `NEXTAUTH_URL`         | Your application URL       | Yes      |
| `NEXTAUTH_SECRET`      | Secret for JWT signing     | Yes      |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID     | No       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No       |

### Database Configuration

The application uses Prisma ORM with support for:

- **SQLite** (development)
- **PostgreSQL** (production)
- **MySQL** (production)

To switch databases, update the `DATABASE_URL` and run:

```bash
npx prisma migrate dev
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact support at support@yourdomain.com

## Roadmap

- [ ] Drag and drop link reordering
- [ ] Advanced analytics dashboard
- [ ] Custom domain support
- [ ] Link categories and tags
- [ ] QR code generation
- [ ] Mobile app
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Webhook support

---

Built with ❤️ using Next.js, TypeScript, and TailwindCSS

# 🚽 Poop Problems

A comprehensive web application for finding, reviewing, and sharing public bathroom locations. Built with Vue 3, TypeScript, and Supabase.

![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38BDF8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)

## ✨ Features

### 🗺️ **Interactive Maps**
- Interactive map powered by Leaflet + OpenStreetMap
- GPS-based location detection and distance calculations
- Custom pin-drop functionality for precise bathroom locations
- Map/list view toggle for different browsing preferences

### 📍 **Location Management**
- Add new bathroom locations with geocoding validation
- Duplicate location detection and warning system
- City geofencing (currently San Francisco and Boston)
- Distance-based search and filtering

### ⭐ **Review System**
- Half-star rating system (1-5 stars in 0.5 increments)
- Photo uploads (up to 4 photos per review)
- Address notes for specific location details
- 500-character review text limit

### 👍 **Community Features**
- Upvote/downvote system for locations and reviews
- User favorites with special map indicators
- Search by keywords across titles, notes, and reviews
- Anonymous user interactions

### 🔐 **Authentication & Access**
- Google OAuth integration via Supabase Auth
- Invitation-only system with access codes
- Progressive invitation rewards (earn invites by contributing)
- Two-tier user system (Users + Admins)

### 👨‍💼 **Admin Panel**
- User management and promotion tools
- Content moderation capabilities
- Configurable app settings
- Activity logging and audit trails

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console account (for OAuth)
- OpenCage API account (for geocoding)
- Mailgun account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd poop-problems
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your API keys in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_OPENCAGE_API_KEY=your_opencage_api_key_here
   VITE_MAILGUN_API_KEY=your_mailgun_api_key_here
   VITE_MAILGUN_DOMAIN=your_mailgun_domain_here
   ```

4. **Set up the database**
   - Copy contents of `supabase/seed.sql`
   - Run in your Supabase SQL Editor

5. **Configure authentication**
   - Set up Google OAuth in Supabase Auth settings
   - Configure redirect URLs

6. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5173` to see the application running!

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── NavBar.vue      # Navigation with auth
│   ├── MapComponent.vue # Interactive map
│   ├── LocationCard.vue # Location display cards
│   ├── SearchFilters.vue # Search and filter UI
│   └── ...
├── views/              # Page components
│   ├── HomeView.vue    # Main map/list interface
│   ├── Dashboard.vue   # User profile and data
│   ├── LocationDetail.vue # Individual location pages
│   ├── AddLocation.vue # Location creation workflow
│   ├── Admin.vue       # Admin panel
│   └── ...
├── stores/             # Pinia state management
│   ├── auth.ts         # Authentication state
│   └── locations.ts    # Location/review state
├── services/           # API and utility services
│   └── geocoding.ts    # OpenCage integration
└── lib/               # Configuration
    └── supabase.ts     # Database client
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with Row Level Security:

- **users** - Extended user profiles with admin flags
- **cities** - Supported cities with geofencing boundaries
- **locations** - Bathroom locations with coordinates and pins
- **reviews** - Star ratings, text, photos, and metadata
- **votes** - Upvote/downvote system for content
- **favorites** - User-saved locations
- **invitations** - Access code based invite system
- **admin_actions** - Moderation activity logging
- **app_settings** - Configurable application parameters

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

### Deployment Options

The built `dist/` folder can be deployed to:
- **Vercel** (recommended for Vue apps)
- **Netlify**
- **AWS S3 + CloudFront**
- Any static hosting service

### Production Setup

1. Update environment variables for production
2. Configure Supabase Auth redirect URLs
3. Update Google OAuth settings with production domains
4. Set up Mailgun domain for email sending

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Google OAuth** - Secure authentication
- **Invitation System** - Controlled user access
- **Content Moderation** - Admin tools for managing content
- **Input Validation** - Client and server-side validation

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup and configuration guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment instructions
- **[PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)** - Complete technical overview
- **[supabase/seed.sql](supabase/seed.sql)** - Database schema and seed data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - The progressive JavaScript framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Leaflet](https://leafletjs.com/) - Mobile-friendly interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) - Free geographic data
- [OpenCage](https://opencagedata.com/) - Geocoding API service

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the [Setup Guide](SETUP.md) for detailed configuration
- Review the [Project Summary](PROJECT-SUMMARY.md) for technical details

---

**Built with ❤️ for the community**

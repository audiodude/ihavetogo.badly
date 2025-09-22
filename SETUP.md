# BathroomFinder Setup Instructions

This is a Vue 3 + Supabase web application for finding and reviewing public bathrooms. Follow these steps to get the app running.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Mailgun account
- OpenCage API account (for geocoding)
- Google Cloud Console account (for OAuth)

## 1. Install Dependencies

```bash
npm install
```

## 2. Database Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully set up
3. Note your project URL and anon key from the API settings

### Run Database Migration

1. Copy the contents of `supabase/seed.sql`
2. Go to your Supabase project dashboard
3. Navigate to SQL Editor
4. Paste and run the migration script
5. Verify tables are created successfully

### Configure Storage

1. In Supabase dashboard, go to Storage
2. Create a new bucket called `review-photos`
3. Set the bucket to public
4. Configure RLS policies for photo uploads

## 3. Authentication Setup

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure origins:
   - Authorized JavaScript origins: `http://localhost:5173` (for dev)
   - Authorized redirect URIs: `http://localhost:5173/auth/callback`
6. Note your Client ID

### Configure Supabase Auth

1. In Supabase dashboard, go to Authentication → Settings
2. Add Google as a provider
3. Enter your Google OAuth Client ID and Secret
4. Set redirect URL to: `http://localhost:5173/auth/callback`

## 4. External API Setup

### OpenCage Geocoding API

1. Sign up at [opencagedata.com](https://opencagedata.com)
2. Get your free API key (2,500 requests/day)
3. Note the API key for environment variables

### Mailgun Email API

1. Sign up at [mailgun.com](https://mailgun.com)
2. Verify your domain or use sandbox domain for testing
3. Get your API key and domain from the dashboard
4. Note both values for environment variables

## 5. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENCAGE_API_KEY=your_opencage_api_key
VITE_MAILGUN_API_KEY=your_mailgun_api_key
VITE_MAILGUN_DOMAIN=your_mailgun_domain
```

Replace all values with your actual credentials.

## 6. Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 7. First Admin Setup

1. Open the app in your browser
2. Sign in with Google
3. The first user to sign in will automatically become an admin
4. You'll be redirected to `/admin/setup` to configure app settings
5. Set the configurable values:
   - Pin validation distance (default: 500 feet)
   - Invitation progression (default: 1, 5, 20 reviews)
   - Invitation cooldown (default: 7 days)

## 8. Production Deployment

### Build the Application

```bash
npm run build
```

### Environment Variables for Production

Update your production environment with the same variables, but use your production URLs:

- Update Supabase redirect URLs to your domain
- Update Google OAuth origins and redirect URIs
- Use production Mailgun domain

### Deploy Options

The built `dist/` folder can be deployed to:
- Vercel (recommended for Vue apps)
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### Update Authentication Redirect URLs

After deployment, update:
1. Google OAuth settings with production URLs
2. Supabase Auth settings with production callback URL

## Features Included

- ✅ Vue 3 + TypeScript + TailwindCSS
- ✅ Supabase authentication with Google OAuth
- ✅ Interactive map with Leaflet + OpenStreetMap
- ✅ Location geocoding with pin-drop functionality
- ✅ Review system with star ratings and photos
- ✅ Voting system (upvotes/downvotes)
- ✅ Favorites functionality
- ✅ Search and filtering
- ✅ User dashboard with profile management
- ✅ Invitation system with access codes
- ✅ Admin panel for moderation
- ✅ City geofencing restrictions
- ✅ Progressive invitation rewards
- ✅ Duplicate location detection
- ✅ Row Level Security (RLS) policies
- ✅ Responsive design

## TODO Items

The following features need additional implementation:

- [ ] Photo upload to Supabase Storage
- [ ] Mailgun email integration for notifications
- [ ] Admin setup page for configurable settings
- [ ] Location detail page
- [ ] Invite acceptance page
- [ ] Admin moderation tools
- [ ] Email notifications for moderation actions

## Troubleshooting

### Common Issues

1. **Auth not working**: Check Google OAuth configuration and redirect URLs
2. **Map not loading**: Verify internet connection and Leaflet CSS import
3. **Geocoding failing**: Check OpenCage API key and request limits
4. **Database errors**: Verify RLS policies and user permissions

### Development Tips

- Use browser dev tools to check console for errors
- Check Supabase dashboard for database issues
- Verify environment variables are loaded correctly
- Test with different user accounts for permissions

## Support

For issues specific to this implementation, check:
1. Browser console for JavaScript errors
2. Supabase dashboard for database/auth errors
3. Network tab for failed API requests

This application follows Vue 3 Composition API patterns and uses modern web development practices.
# 🚀 BathroomFinder Deployment Guide

This guide covers deploying your BathroomFinder application to production environments.

## 📋 Pre-Deployment Checklist

- [ ] All external services configured (Supabase, Google OAuth, OpenCage, Mailgun)
- [ ] Database migration executed successfully
- [ ] Environment variables configured for production
- [ ] Application builds successfully (`npm run build`)
- [ ] All required API keys and secrets obtained

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest and most recommended option for Vue.js applications.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add all environment variables from `.env.example`
   - Set production values for each variable

#### Vercel Configuration File (Optional)

Create `vercel.json` in your root directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Netlify

Great alternative with good Vue.js support and easy Git integration.

#### Steps:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

3. **Or use Git Integration:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Configure environment variables in Netlify dashboard

#### Netlify Configuration File

Create `netlify.toml` in your root directory:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: AWS S3 + CloudFront

For enterprise deployments with full AWS integration.

#### Prerequisites:
- AWS CLI installed and configured
- S3 bucket created
- CloudFront distribution set up

#### Steps:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Sync to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Invalidate CloudFront cache**
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

#### AWS Deployment Script

Create `deploy-aws.sh`:

```bash
#!/bin/bash
set -e

echo "Building application..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://your-bucket-name --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "Deployment complete!"
```

### Option 4: Docker Deployment

For containerized deployments on any platform.

#### Dockerfile

Create `Dockerfile` in your root directory:

```dockerfile
# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage

# Copy built app to nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Handle Vue.js routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Gzip compression
        gzip on;
        gzip_types text/css application/javascript application/json image/svg+xml;
        gzip_comp_level 9;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### Build and Deploy Docker

```bash
# Build the image
docker build -t bathroomfinder .

# Run locally for testing
docker run -p 8080:80 bathroomfinder

# Deploy to container registry
docker tag bathroomfinder your-registry/bathroomfinder:latest
docker push your-registry/bathroomfinder:latest
```

## 🔧 Production Configuration

### Environment Variables

Update your production environment variables:

```env
# Production Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Production APIs
VITE_OPENCAGE_API_KEY=your_production_opencage_key
VITE_MAILGUN_API_KEY=your_production_mailgun_key
VITE_MAILGUN_DOMAIN=your_production_domain.com
```

### Supabase Production Setup

1. **Update Auth Settings**
   - Add production domain to allowed origins
   - Update redirect URLs: `https://yourdomain.com/auth/callback`
   - Configure Google OAuth with production URLs

2. **Database Considerations**
   - Ensure RLS policies are properly configured
   - Set up database backups
   - Monitor database performance
   - Consider connection pooling for high traffic

3. **Storage Configuration**
   - Configure Supabase Storage for photo uploads
   - Set up proper bucket policies
   - Configure CDN for image delivery

### Security Configuration

1. **SSL/HTTPS**
   - Ensure your deployment platform handles SSL
   - Redirect all HTTP traffic to HTTPS
   - Update all OAuth redirect URLs to use HTTPS

2. **Content Security Policy**

   Add to your `index.html`:
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self';
                  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com;
                  style-src 'self' 'unsafe-inline' https://unpkg.com;
                  img-src 'self' data: https: blob:;
                  connect-src 'self' https://*.supabase.co https://api.opencagedata.com https://api.mailgun.net;
                  font-src 'self' https:;">
   ```

3. **API Rate Limiting**
   - Monitor OpenCage API usage
   - Implement client-side rate limiting
   - Consider API key rotation policies

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run type check
      run: npm run type-check

    - name: Run linting
      run: npm run lint

    - name: Build application
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_OPENCAGE_API_KEY: ${{ secrets.VITE_OPENCAGE_API_KEY }}
        VITE_MAILGUN_API_KEY: ${{ secrets.VITE_MAILGUN_API_KEY }}
        VITE_MAILGUN_DOMAIN: ${{ secrets.VITE_MAILGUN_DOMAIN }}

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

## 📊 Monitoring and Maintenance

### Health Checks

1. **Application Health**
   - Monitor build status
   - Check for JavaScript errors
   - Verify all routes are accessible
   - Test authentication flow

2. **Database Health**
   - Monitor Supabase dashboard
   - Check query performance
   - Monitor storage usage
   - Review RLS policy performance

3. **API Health**
   - Monitor OpenCage API usage and limits
   - Check Mailgun delivery rates
   - Verify Google OAuth functionality

### Performance Monitoring

1. **Frontend Monitoring**
   - Use Vercel Analytics (if using Vercel)
   - Monitor Core Web Vitals
   - Track user engagement metrics

2. **Error Tracking**
   - Consider integrating Sentry for error tracking
   - Monitor console errors
   - Track failed API requests

### Backup Strategy

1. **Database Backups**
   - Enable Supabase automated backups
   - Consider point-in-time recovery
   - Test backup restoration process

2. **Code Backups**
   - Ensure GitHub repository is properly maintained
   - Tag releases for easy rollbacks
   - Maintain deployment documentation

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Working**
   - Verify all variables are prefixed with `VITE_`
   - Check variable names match exactly
   - Ensure no extra spaces in values

3. **Authentication Redirect Issues**
   - Verify all redirect URLs are HTTPS
   - Check Google OAuth console settings
   - Ensure Supabase Auth settings match

4. **Map Not Loading**
   - Check browser console for errors
   - Verify Leaflet CSS is loaded
   - Test with different browsers

### Performance Issues

1. **Slow Initial Load**
   - Implement code splitting
   - Optimize images
   - Use CDN for static assets

2. **Map Performance**
   - Implement marker clustering for many locations
   - Optimize map tile loading
   - Consider map bounds restrictions

## 📚 Additional Resources

- [Vue.js Production Deployment Guide](https://vuejs.org/guide/best-practices/production-deployment.html)
- [Vite Production Build Guide](https://vitejs.dev/guide/build.html)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Netlify Deployment Documentation](https://docs.netlify.com/)

---

**Need help with deployment? Check the troubleshooting section or open an issue on GitHub!**
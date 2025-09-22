# Netlify Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prepare for Deployment
```bash
# Run the deployment preparation script
npm run deploy:prepare
```

### 2. Deploy to Netlify

#### Option A: Git-based Deployment (Recommended)
1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Netlify will auto-detect the configuration from `netlify.toml`

#### Option B: Manual Deployment
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder**
   - Go to [Netlify](https://netlify.com)
   - Drag and drop the `dist` folder to deploy

## 📋 Configuration Files Created

### `netlify.toml`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18
- **Environment**: `VITE_ENVIRONMENT=development`
- **SPA redirects**: All routes → `/index.html`
- **Security headers**: XSS protection, CORS, etc.
- **Caching**: Optimized for static assets

### `.env.production`
- Production environment variables
- API endpoint configuration
- Build optimizations

### `public/_redirects`
- SPA routing support
- Backup redirect rules

### `public/_headers`
- Security headers
- Performance optimizations
- CORS configuration

## 🔧 Build Configuration

### Environment Variables
- `VITE_ENVIRONMENT=development` (uses dev server API)
- `NODE_ENV=production`
- API Base URL: `https://dev.kaha.com.np/hostel/api/v1`

### Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18
- **Package Manager**: npm

## 🌐 API Configuration

The app is configured to use the development server:
- **API Base URL**: `https://dev.kaha.com.np/hostel/api/v1`
- **Environment**: `development`
- **CORS**: Configured for cross-origin requests

## 🔒 Security Features

### Headers Applied
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### CORS Configuration
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## ⚡ Performance Optimizations

### Caching Strategy
- **Static Assets**: 1 year cache (`max-age=31536000`)
- **HTML Files**: 1 hour cache (`max-age=3600`)
- **Service Worker**: No cache (`max-age=0`)

### Build Optimizations
- Code splitting enabled
- Minification with Terser
- Tree shaking
- Modern ES modules

## 🧪 Testing Deployment

### Local Testing
```bash
# Test build process
npm run deploy:build

# Preview built app
npm run preview
```

### Deployment Verification
1. Check build logs in Netlify dashboard
2. Verify API calls work with dev server
3. Test all routes and navigation
4. Check browser console for errors

## 🔧 Troubleshooting

### Common Issues

#### Build Fails
- Check Node.js version (should be 18+)
- Run `npm install` to ensure dependencies
- Check for TypeScript errors: `npm run lint`

#### API Calls Fail
- Verify dev server is running: `https://dev.kaha.com.np/hostel/api/v1`
- Check CORS configuration
- Verify environment variables

#### Routing Issues
- Ensure `_redirects` file is in `public/` directory
- Check `netlify.toml` redirect rules
- Verify SPA routing configuration

#### Performance Issues
- Check bundle size: `npm run build:analyze`
- Verify caching headers
- Test with Lighthouse audit

## 📝 Deployment Checklist

- [ ] All configuration files created
- [ ] Environment variables set correctly
- [ ] Build process tested locally
- [ ] API endpoints verified
- [ ] Security headers configured
- [ ] CORS settings applied
- [ ] Caching strategy implemented
- [ ] SPA routing configured
- [ ] Git repository updated
- [ ] Netlify site connected
- [ ] Deployment successful
- [ ] Live site tested

## 🎯 Expected Results

After successful deployment:
- ✅ App accessible at `https://your-app-name.netlify.app`
- ✅ All routes work correctly (SPA routing)
- ✅ API calls connect to `https://dev.kaha.com.np/hostel/api/v1`
- ✅ Fast loading with optimized caching
- ✅ Secure headers applied
- ✅ Mobile responsive design

## 📞 Support

If you encounter issues:
1. Check Netlify build logs
2. Verify configuration files
3. Test locally with `npm run preview`
4. Check browser developer tools
5. Verify API server status
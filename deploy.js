#!/usr/bin/env node

/**
 * Deployment preparation script for Netlify
 * This script ensures everything is ready for deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Preparing for Netlify deployment...\n');

// Check if required files exist
const requiredFiles = [
  'netlify.toml',
  'public/_redirects',
  'public/_headers',
  '.env.production'
];

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
    process.exit(1);
  }
});

// Check environment configuration
console.log('\n🔧 Checking environment configuration...');
try {
  const envContent = fs.readFileSync('src/config/environment.ts', 'utf8');
  if (envContent.includes("|| 'development'")) {
    console.log('✅ Environment config - Using development server');
  } else {
    console.log('⚠️  Environment config - Check default environment setting');
  }
} catch (error) {
  console.log('❌ Could not read environment config');
  process.exit(1);
}

// Run build test
console.log('\n🔨 Testing build process...');
try {
  console.log('Running: npm run build');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed');
  process.exit(1);
}

// Check build output
console.log('\n📦 Checking build output...');
if (fs.existsSync('dist/index.html')) {
  console.log('✅ dist/index.html - Found');
} else {
  console.log('❌ dist/index.html - Missing');
  process.exit(1);
}

// Check for assets
const assetsDir = 'dist/assets';
if (fs.existsSync(assetsDir)) {
  const assets = fs.readdirSync(assetsDir);
  console.log(`✅ Assets directory - ${assets.length} files found`);
} else {
  console.log('❌ Assets directory - Missing');
  process.exit(1);
}

console.log('\n🎉 Deployment preparation complete!');
console.log('\n📝 Next steps:');
console.log('1. Push your code to GitHub/GitLab');
console.log('2. Connect your repository to Netlify');
console.log('3. Netlify will automatically detect the netlify.toml configuration');
console.log('4. Your app will be deployed with the dev server API');
console.log('\n🔗 API Endpoint: https://dev.kaha.com.np/hostel/api/v1');
console.log('🌐 Your app will be available at: https://your-app-name.netlify.app');

console.log('\n💡 Tips:');
console.log('- Build command: npm run build');
console.log('- Publish directory: dist');
console.log('- Node version: 18');
console.log('- Environment: VITE_ENVIRONMENT=development');
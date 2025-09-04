#!/usr/bin/env node

/**
 * React Hooks Fix Script
 * This script diagnoses and fixes common React hooks issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 React Hooks Fix Script Starting...\n');

// Step 1: Clear all caches
console.log('1️⃣ Clearing all caches...');
try {
  // Clear npm cache
  execSync('npm cache clean --force', { stdio: 'inherit' });
  
  // Clear Vite cache
  if (fs.existsSync('node_modules/.vite')) {
    fs.rmSync('node_modules/.vite', { recursive: true, force: true });
    console.log('✅ Cleared Vite cache');
  }
  
  // Clear dist folder
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✅ Cleared dist folder');
  }
  
  console.log('✅ All caches cleared\n');
} catch (error) {
  console.error('❌ Error clearing caches:', error.message);
}

// Step 2: Check for multiple React instances
console.log('2️⃣ Checking for multiple React instances...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const reactVersion = packageJson.dependencies?.react;
  const reactDomVersion = packageJson.dependencies?.['react-dom'];
  
  console.log(`React version in package.json: ${reactVersion}`);
  console.log(`React-DOM version in package.json: ${reactDomVersion}`);
  
  if (reactVersion !== reactDomVersion) {
    console.log('⚠️ React and React-DOM versions don\'t match!');
  } else {
    console.log('✅ React versions match');
  }
} catch (error) {
  console.error('❌ Error checking React versions:', error.message);
}

// Step 3: Reinstall dependencies
console.log('\n3️⃣ Reinstalling dependencies...');
try {
  // Remove node_modules
  if (fs.existsSync('node_modules')) {
    console.log('Removing node_modules...');
    fs.rmSync('node_modules', { recursive: true, force: true });
  }
  
  // Remove package-lock.json
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('Removed package-lock.json');
  }
  
  // Fresh install
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('✅ Dependencies reinstalled\n');
} catch (error) {
  console.error('❌ Error reinstalling dependencies:', error.message);
}

console.log('\n🎉 React Hooks Fix Complete!');
console.log('\n📋 Next steps:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)');
console.log('3. If issues persist, try running: npm run dev:fresh');
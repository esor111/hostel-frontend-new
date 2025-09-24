#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Check if required dependencies are available
const requiredDeps = [
  'autoprefixer',
  'postcss',
  'tailwindcss',
  'vite',
  'axios'
];

console.log('Checking required dependencies...');

let allFound = true;

requiredDeps.forEach(dep => {
  try {
    const resolved = require.resolve(dep);
    console.log(`✓ ${dep} found at ${resolved}`);
  } catch (e) {
    console.error(`✗ ${dep} NOT found: ${e.message}`);
    allFound = false;
  }
});

if (allFound) {
  console.log('All dependencies found!');
  process.exit(0);
} else {
  console.error('Some dependencies are missing!');
  process.exit(1);
}
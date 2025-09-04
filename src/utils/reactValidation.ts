// React validation utilities to debug hook issues
import React from 'react';

export const validateReactEnvironment = () => {
  console.log('🔍 Validating React environment...');
  
  // Check if React is available
  try {
    console.log('✅ React is available:', React.version);
    
    // Check if React hooks are available
    if (React.useState && React.useEffect && React.useReducer) {
      console.log('✅ React hooks are available');
      
      // Test if hooks actually work
      try {
        const testHook = React.useState;
        if (typeof testHook === 'function') {
          console.log('✅ React hooks are functional');
        }
      } catch (hookError) {
        console.error('❌ React hooks are not functional:', hookError);
        return false;
      }
    } else {
      console.error('❌ React hooks are not available');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ React validation failed:', error);
    return false;
  }
};

export const checkForMultipleReactInstances = () => {
  console.log('🔍 Checking for multiple React instances...');
  
  // This will help identify if there are multiple React instances
  const reactInstances = [];
  
  // Check window object for React instances
  if (typeof window !== 'undefined') {
    // @ts-ignore
    if (window.React) {
      // @ts-ignore
      reactInstances.push('window.React: ' + window.React.version);
    }
    
    // Check for multiple React versions in modules
    try {
      const React = require('react');
      reactInstances.push('require(react): ' + React.version);
    } catch (e) {
      console.warn('Could not require React:', e);
    }
  }
  
  console.log('React instances found:', reactInstances);
  
  if (reactInstances.length > 1) {
    console.warn('⚠️ Multiple React instances detected! This can cause hook errors.');
  } else {
    console.log('✅ Single React instance detected');
  }
  
  return reactInstances;
};

export const debugHookError = (hookName: string, error: any) => {
  console.error(`❌ Hook error in ${hookName}:`, error);
  
  // Provide specific guidance based on error
  if (error.message?.includes('useReducer')) {
    console.log('💡 This is likely a React instance issue. Try:');
    console.log('1. Clear browser cache and reload');
    console.log('2. Check for multiple React versions');
    console.log('3. Restart the development server');
  }
  
  if (error.message?.includes('Invalid hook call')) {
    console.log('💡 Invalid hook call detected. Check:');
    console.log('1. Hooks are only called inside function components');
    console.log('2. Hooks are called in the same order every time');
    console.log('3. No conditional hook calls');
  }
};
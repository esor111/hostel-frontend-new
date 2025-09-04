// Clear browser cache and service worker script
console.log('🧹 Clearing browser cache and service worker...');

// Clear localStorage
try {
  localStorage.clear();
  console.log('✅ localStorage cleared');
} catch (e) {
  console.warn('⚠️ Could not clear localStorage:', e);
}

// Clear sessionStorage
try {
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');
} catch (e) {
  console.warn('⚠️ Could not clear sessionStorage:', e);
}

// Unregister service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(boolean) {
        console.log('✅ Service worker unregistered:', boolean);
      });
    }
  }).catch(function(error) {
    console.warn('⚠️ Could not unregister service workers:', error);
  });
}

// Clear caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name).then(function(success) {
        console.log('✅ Cache deleted:', name, success);
      });
    }
  }).catch(function(error) {
    console.warn('⚠️ Could not clear caches:', error);
  });
}

console.log('🎉 Cache clearing complete! Please refresh the page.');
// Test script to verify offline functionality
console.log('Testing offline functionality...\n');

// Check if service worker is registered
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
            console.log('✅ Service Worker is registered');
            registrations.forEach(reg => {
                console.log(`   - Scope: ${reg.scope}`);
                console.log(`   - Active: ${reg.active ? 'Yes' : 'No'}`);
            });
        } else {
            console.log('❌ No Service Worker registered');
        }
    });
}

// Check cache contents
if ('caches' in window) {
    caches.keys().then(cacheNames => {
        console.log('\n📦 Available caches:');
        cacheNames.forEach(name => {
            console.log(`   - ${name}`);
            caches.open(name).then(cache => {
                cache.keys().then(requests => {
                    console.log(`     Total items: ${requests.length}`);
                });
            });
        });
    });
}

console.log('\n🌐 Current online status:', navigator.onLine ? 'Online' : 'Offline');
console.log('\n💡 To test offline mode:');
console.log('   1. Open DevTools (F12)');
console.log('   2. Go to Network tab');
console.log('   3. Check "Offline" or select "Offline" from throttling dropdown');
console.log('   4. Try navigating to different pages');
console.log('\n✨ The app should work offline for cached pages!');
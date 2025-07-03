/**
 * Teacher AI Service Worker
 * خدمة العمل في الخلفية لتطبيق المدرس AI
 */

const CACHE_NAME = 'teacher-ai-v1.0.0';
const STATIC_CACHE = 'teacher-ai-static-v1.0.0';
const DYNAMIC_CACHE = 'teacher-ai-dynamic-v1.0.0';

// Files to cache
const STATIC_FILES = [
    '/',
    '/static/css/style.css',
    '/static/js/script.js',
    '/static/images/favicon.ico',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Tajawal:wght@200;300;400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/axios/1.5.0/axios.min.js'
];

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache dynamic content
                        if (shouldCacheRequest(event.request)) {
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch(error => {
                        console.log('Service Worker: Fetch failed', error);
                        
                        // Return offline fallback if available
                        if (event.request.destination === 'document') {
                            return caches.match('/offline.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Helper function to determine if request should be cached
function shouldCacheRequest(request) {
    const url = new URL(request.url);
    
    // Cache API responses (except chat which might be too large)
    if (url.pathname.startsWith('/api/') && !url.pathname.includes('/chat')) {
        return true;
    }
    
    // Cache static assets
    if (request.destination === 'style' || 
        request.destination === 'script' || 
        request.destination === 'font' || 
        request.destination === 'image') {
        return true;
    }
    
    return false;
}

// Background sync for offline functionality
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

// Background sync function
async function doBackgroundSync() {
    try {
        // Sync pending uploads or messages when back online
        const pendingData = await getStoredPendingData();
        
        if (pendingData.length > 0) {
            for (const item of pendingData) {
                try {
                    await syncPendingItem(item);
                    await removePendingItem(item.id);
                } catch (error) {
                    console.error('Failed to sync item:', error);
                }
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Get stored pending data
async function getStoredPendingData() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const response = await cache.match('/pending-sync');
        if (response) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error getting pending data:', error);
    }
    return [];
}

// Sync pending item
async function syncPendingItem(item) {
    const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
    });
    
    if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
    }
    
    return response;
}

// Remove pending item
async function removePendingItem(itemId) {
    try {
        const pendingData = await getStoredPendingData();
        const updatedData = pendingData.filter(item => item.id !== itemId);
        
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put('/pending-sync', new Response(JSON.stringify(updatedData)));
    } catch (error) {
        console.error('Error removing pending item:', error);
    }
}

// Push notification handler
self.addEventListener('push', event => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/static/images/icon-192.png',
        badge: '/static/images/badge.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: [
            {
                action: 'open',
                title: 'فتح التطبيق'
            },
            {
                action: 'close',
                title: 'إغلاق'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handler for communication with main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'content-sync') {
        event.waitUntil(doPeriodicSync());
    }
});

// Periodic sync function
async function doPeriodicSync() {
    try {
        // Update cache with fresh content periodically
        const response = await fetch('/api/health');
        if (response.ok) {
            console.log('Periodic sync: Server is healthy');
        }
    } catch (error) {
        console.error('Periodic sync failed:', error);
    }
}

console.log('Service Worker: Loaded successfully');
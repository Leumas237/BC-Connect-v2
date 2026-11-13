// BC Connect Service Worker
// Version: 1.0.0

const CACHE_NAME = 'bc-connect-v1';
const STATIC_CACHE = 'bc-connect-static-v1';
const DYNAMIC_CACHE = 'bc-connect-dynamic-v1';
const IMAGE_CACHE = 'bc-connect-images-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/discover',
  '/matches',
  '/messages',
  '/profile',
  '/manifest.json',
  // Note: Actual static assets (JS, CSS) are handled by Next.js
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fallback to cache - for API calls
  networkFirst: ['/api/'],
  // Cache first, fallback to network - for static assets
  cacheFirst: ['/icons/', '/images/', '/fonts/'],
  // Stale while revalidate - for pages
  staleWhileRevalidate: ['/discover', '/matches', '/messages', '/profile'],
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { credentials: 'same-origin' })));
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except for Supabase)
  if (url.origin !== location.origin && !url.hostname.includes('supabase.co')) {
    return;
  }

  // Skip Supabase realtime WebSocket connections
  if (url.pathname.includes('/realtime') || url.pathname.includes('/websocket')) {
    return;
  }

  // Determine cache strategy
  let strategy = 'networkOnly';

  if (CACHE_STRATEGIES.networkFirst.some(path => url.pathname.startsWith(path))) {
    strategy = 'networkFirst';
  } else if (CACHE_STRATEGIES.cacheFirst.some(path => url.pathname.startsWith(path))) {
    strategy = 'cacheFirst';
  } else if (CACHE_STRATEGIES.staleWhileRevalidate.some(path => url.pathname.startsWith(path))) {
    strategy = 'staleWhileRevalidate';
  } else if (request.destination === 'image') {
    strategy = 'cacheFirst';
  } else if (request.destination === 'document') {
    strategy = 'staleWhileRevalidate';
  }

  // Apply strategy
  switch (strategy) {
    case 'networkFirst':
      event.respondWith(networkFirst(request));
      break;
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(networkOnly(request));
  }
});

// Network first strategy
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/');
    }

    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cache = await caches.open(IMAGE_CACHE);

  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response);
      }
    }).catch(() => {});
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#e0e0e0" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="system-ui" font-size="16">Image non disponible</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Network only (no caching)
async function networkOnly(request) {
  return fetch(request);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-likes') {
    event.waitUntil(syncLikes());
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncLikes() {
  // Sync pending likes when back online
  console.log('[SW] Syncing pending likes');
}

async function syncMessages() {
  // Sync pending messages when back online
  console.log('[SW] Syncing pending messages');
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: true,
    tag: data.tag || 'bc-connect-notification',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Message from client
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded');
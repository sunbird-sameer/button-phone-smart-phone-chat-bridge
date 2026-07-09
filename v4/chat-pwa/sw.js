const CACHE_NAME = 'chat-pwa-v1';
const urlsToCache = [
  './index.html',
  './manifest.json'
];

// Install and cache local assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Handle incoming background notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "New Message";
  const options = {
    body: data.body || "You have a new message.",
    icon: 'https://via.placeholder.com/192/3cff8f/000000?text=C',
    badge: 'https://via.placeholder.com/192/3cff8f/000000?text=C'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Focus the app when the notification is clicked
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/index.html'));
});
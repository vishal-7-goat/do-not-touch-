const CACHE_NAME = 'streak-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener('periodicsync', e => {
  if (e.tag === 'streak-reminder') {
    e.waitUntil(checkAndNotify());
  }
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'streak-reminder',
        renotify: true,
        actions: [{ action: 'open', title: 'Keep it alive 🔥' }]
      });
    }, delay);
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(cls => {
      if (cls.length > 0) { cls[0].focus(); return; }
      clients.openWindow('./index.html');
    })
  );
});

async function checkAndNotify() {
  const allClients = await clients.matchAll();
  if (allClients.length > 0) return;
  self.registration.showNotification("🔥 Don't break your streak!", {
    body: "You haven't checked in today. Keep the fire alive, bhai.",
    icon: './icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'streak-reminder',
    renotify: true
  });
}

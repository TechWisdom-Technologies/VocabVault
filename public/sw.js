// VocabVault Service Worker
// Standard service worker required for Progressive Web App (PWA) installation.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Simple pass-through fetch event handler required for PWA installability.
  // This satisfies Chrome's installation criteria while ensuring that
  // the app's online logic, data syncing, and dynamic state are completely untouched.
  event.respondWith(fetch(event.request));
});

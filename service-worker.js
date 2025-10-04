// Version du cache. Changez ceci à chaque mise à jour majeure de l'application.
const CACHE_NAME = 'mother-store-v1';

// Fichiers à mettre en cache pour le mode hors ligne
const urlsToCache = [
    '/',
    '/LOC5.html',
    '/manifest.json',
    // Les icônes
    '/icon-192.png',
    '/icon-512.png',
    // Les librairies externes
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Installation du Service Worker et mise en cache des assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache ouvert, ajout des URLs.');
                return cache.addAll(urlsToCache);
            })
    );
});

// Interception des requêtes : sert les fichiers depuis le cache si disponibles
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retourne la ressource mise en cache si trouvée
                if (response) {
                    return response;
                }
                // Sinon, fait une requête réseau
                return fetch(event.request);
            })
    );
});

// Mise à jour du Service Worker : supprime les anciens caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Suppression de l\'ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

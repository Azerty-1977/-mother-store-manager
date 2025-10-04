// Nom du cache, il doit être mis à jour à chaque fois que vous modifiez les fichiers
const CACHE_NAME = 'mother-store-cache-v1';

// Liste des ressources essentielles à mettre en cache pour le mode hors ligne
// Cela inclut votre fichier principal et les dépendances externes utilisées.
const urlsToCache = [
    'LOC5.html', // Le fichier principal de l'application
    'https://cdn.tailwindcss.com', // Tailwind CSS
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js', // Chart.js
    // Ajoutez ici tout autre fichier statique que vous pourriez utiliser (comme des images ou des icônes)
];

// --- Événement d'Installation (Caching des Ressources) ---
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installation...');
    // Attendre que le cache soit ouvert et que tous les fichiers essentiels soient ajoutés
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Mise en cache des ressources : succès.');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('[Service Worker] Échec de la mise en cache :', error);
            })
    );
});


// --- Événement d'Activation (Nettoyage des Anciens Caches) ---
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activation et nettoyage des anciens caches...');
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Supprimer les caches qui ne sont pas dans la liste blanche (ancienne version)
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log(`[Service Worker] Suppression de l'ancien cache : ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Assure que le service worker prend immédiatement le contrôle
    return self.clients.claim();
});


// --- Événement Fetch (Stratégie Cache-First) ---
self.addEventListener('fetch', (event) => {
    // Ne pas intercepter les requêtes non-HTTP (comme chrome-extension)
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    // Stratégie Cache-First : Essayer d'abord de récupérer la ressource du cache. 
    // Si elle n'est pas trouvée, aller sur le réseau.
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si la ressource est dans le cache, la retourner immédiatement
                if (response) {
                    // console.log(`[Service Worker] Servie depuis le cache: ${event.request.url}`);
                    return response;
                }
                
                // Sinon, la récupérer via le réseau
                // console.log(`[Service Worker] Récupération réseau: ${event.request.url}`);
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Optionnel : Mettre en cache la nouvelle ressource si la requête est réussie
                        // Ceci est important pour les ressources dynamiques ou les assets non listés dans urlsToCache
                        return networkResponse;
                    });
            })
            .catch((error) => {
                // Ceci se produit si la requête réseau échoue (ex: déconnecté) ET que la ressource n'était pas dans le cache.
                console.error('[Service Worker] Erreur de Fetch:', event.request.url, error);
                // Vous pouvez retourner une page d'erreur hors ligne ici si vous en avez une
                // return caches.match('offline-error.html');
            })
    );
});

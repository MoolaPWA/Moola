importScripts('https://unpkg.com/dexie@3.2.4/dist/dexie.js');

const CACHE_NAME = 'moola-cache-v1';

// Статические ресурсы для кеширования
const APP_SHELL = [
    '/',
    '/index.html',
    '/logo-192x192.png',
    '/logo-512x512.png',
    '/favicon.svg',
];

const db = new Dexie('MoolaDB');

db.version(3).stores({
    users: 'id',
    categories: 'id, user_id, is_deleted',
    transactions: 'id, user_id, category_id, transaction_date, is_synced, is_deleted',
});

const SW_ALLOWED_STORES = ['transactions'];

// Кешируем app shell при установке
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching app shell');
            return cache.addAll(APP_SHELL);
        }).then(() => self.skipWaiting())
    );
});

// Удаляем старые кеши при активации
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Отдаём из кеша, если есть — иначе из сети
self.addEventListener('fetch', (event) => {
    // API запросы не кешируем
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request);
        })
    );
});

// Сообщения от приложения
self.addEventListener('message', async (event) => {
    const { type } = event.data;
    switch (type) {
        case 'SYNC_REQUEST': {
            await handleSync(event);
            break;
        }
        case 'SKIP_WAITING': {
            self.skipWaiting();
            break;
        }
    }
});

self.addEventListener('sync', async (event) => {
    if (event.tag === 'finance-sync') {
        event.waitUntil(syncUnsyncedTransactions());
    }
});

async function handleSync(event) {
    try {
        const result = await syncUnsyncedTransactions();
        event.ports[0]?.postMessage({ success: true, synced: result });
    } catch (error) {
        event.ports[0]?.postMessage({ success: false, error: error.message });
    }
}

async function syncUnsyncedTransactions() {
    const unsynced = await db.transactions
        .where('is_synced').equals(0)
        .toArray();

    if (unsynced.length === 0) return 0;

    const response = await fetch('/api/transactions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unsynced),
    });

    if (!response.ok) throw new Error('Sync failed');

    const syncedIds = unsynced.map((t) => t.id);

    await db.transaction('rw', SW_ALLOWED_STORES, async () => {
        for (const id of syncedIds) {
            await db.transactions.update(id, { is_synced: 1 });
        }
    });

    return syncedIds.length;
}
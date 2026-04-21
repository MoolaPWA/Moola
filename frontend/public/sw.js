importScripts('https://unpkg.com/dexie@3.2.4/dist/dexie.js');

const db = new Dexie('MoolaDB');

// Схема должна совпадать с database.ts
db.version(2).stores({
    users: 'id',
    categories: 'id, user_id',
    transactions: 'id, user_id, category_id, transaction_date, is_synced',
});

const SW_ALLOWED_STORES = ['transactions'];

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
        .where('is_synced')
        .equals(0)
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

self.addEventListener('install', (event) => {
    console.log('[SW] Installed');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activated');
    event.waitUntil(self.clients.claim());
});
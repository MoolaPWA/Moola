export const DB_NAME = 'MoolaDB';
export const DB_VERSION = 4; // увеличиваем версию

export const STORES = {
    users: 'id',
    categories: 'id, user_id',
    transactions: 'id, user_id, category_id, transaction_date, is_synced, is_deleted',
    auth: 'key', // новый стор для refresh_token
} as const;

export const STORE_NAMES = {
    USERS: 'users',
    CATEGORIES: 'categories',
    TRANSACTIONS: 'transactions',
    AUTH: 'auth',
} as const;
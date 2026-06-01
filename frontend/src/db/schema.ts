export const DB_NAME = 'MoolaDB';

// v1 — начальная схема (спринт 2)
// v2 — добавлено поле is_deleted для мягкого удаления
export const DB_VERSION = 3;

export const STORES = {
    users: 'id',
    categories: 'id, user_id, is_deleted',
    // is_deleted индексируем (будем фильтровать по нему при каждом запросе)
    transactions: 'id, user_id, category_id, transaction_date, is_synced, is_deleted',
} as const;

export const STORE_NAMES = {
    USERS: 'users',
    CATEGORIES: 'categories',
    TRANSACTIONS: 'transactions',
} as const;
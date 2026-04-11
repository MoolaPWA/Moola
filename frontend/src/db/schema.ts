export const DB_NAME = 'MoolaDB';

// Текущая версия БД.
// Увеличивай на 1 при каждом изменении структуры (новые поля, индексы, сторы).
// Dexie автоматически запустит миграцию при следующем открытии БД у пользователя.
// ВАЖНО: старые версии в database.ts никогда не удалять —
// Dexie строит цепочку миграций от v1 до текущей.
export const DB_VERSION = 1;

// Текущая схема сторов и их индексов.
// Формат: 'primaryKey, index1, index2'
// Индексируем только те поля, по которым делаем запросы (where/equals).
// Остальные поля хранятся автоматически — индекс им не нужен.
//
// История версий:
// v1 — начальная схема. Сторы: users, categories, transactions.
//       Индексы: user_id, category_id, transaction_date, is_synced.
//
// v2 и далее — добавлять новую константу STORES_V2 и регистрировать
//       в database.ts через this.version(2).stores(STORES_V2).upgrade(...)
export const STORES = {
    users: 'id',
    categories: 'id, user_id',
    transactions: 'id, user_id, category_id, transaction_date, is_synced',
} as const;

// Константы названий сторов.
// Используй их везде вместо строк — защита от опечаток.
// Например: db.table(STORE_NAMES.TRANSACTIONS) вместо db.table('transactons')
export const STORE_NAMES = {
    USERS: 'users',
    CATEGORIES: 'categories',
    TRANSACTIONS: 'transactions',
} as const;
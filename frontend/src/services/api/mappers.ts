import type { Transaction, Category } from '@/db/database';

/**
 * Транзакция как её возвращает сервер (TransactionRead).
 */
export interface ApiTransaction {
    id: string;
    user_id: string;
    category_id: string;
    created_at: string;
    updated_at: string;
    amount: string;            // на сервере сумма — строка
    type: 'income' | 'expense';
    transaction_date: string;
    description: string;
}

/**
 * Элемент для отправки в /transactions/sync (TransactionSyncItem).
 */
export interface ApiSyncItem {
    id: string;
    updated_at: string;
    amount: string;
    type: 'income' | 'expense';
    date: string;              // в sync поле называется date, не transaction_date
    description: string;
    category_id: string;
    is_deleted: boolean;       // на сервере boolean, локально 0 | 1
    is_synced: boolean;
}

/**
 * Преобразует локальную транзакцию в элемент для отправки на сервер.
 */
export function toSyncItem(t: Transaction): ApiSyncItem {
    return {
        id: t.id,
        updated_at: t.updated_at,
        amount: t.amount.toString(),         // number → string
        type: t.type,
        date: t.transaction_date,            // transaction_date → date
        description: t.description,
        category_id: t.category_id,
        is_deleted: t.is_deleted === 1,      // 0 | 1 → boolean
        is_synced: t.is_synced === 1,
    };
}

/**
 * Преобразует транзакцию с сервера в локальный формат.
 * Помечает is_synced=1, так как данные пришли с сервера и уже синхронизированы.
 */
export function fromApiTransaction(t: ApiTransaction): Transaction {
    return {
        id: t.id,
        user_id: t.user_id,
        category_id: t.category_id,
        amount: Number(t.amount),            // string → number
        type: t.type,
        transaction_date: t.transaction_date,
        description: t.description,
        created_at: t.created_at,
        updated_at: t.updated_at,
        is_synced: 1,                        // пришло с сервера = синхронизировано
        is_deleted: 0,                       // сервер не возвращает удалённые
    };
}

/**
 * Категория как её возвращает сервер (CategoryRead).
 */
export interface ApiCategory {
    id: string;
    user_id: string;
    name: string;
    type: 'income' | 'expense';
    icon_path: string;
    background_color: string;
    icon_color: string;
    cat_limit: number | null;
}

/**
 * Тело для создания категории на сервере (CategoryCreateRequest).
 */
export interface ApiCategoryCreate {
    name: string;
    type: 'income' | 'expense';
    icon_path: string;
    background_color: string;
    icon_color: string;
}


/**
 * Преобразует локальную категорию в тело запроса создания на сервере.
 */
export function toApiCategoryCreate(c: Category): ApiCategoryCreate {
    return {
        name: c.name,
        type: c.type,
        icon_path: c.icon_path,
        background_color: c.background_color,
        icon_color: c.icon_color,
    };
}

/**
 * Преобразует категорию с сервера в локальный формат.
 * Лишние поля (иконки, лимит) отбрасываем — в локальной схеме их нет.
 */
export function fromApiCategory(c: ApiCategory): Category {
    return {
        id: c.id,
        user_id: c.user_id,
        name: c.name,
        type: c.type,
        is_deleted: 0,
        icon_path: c.icon_path,
        background_color: c.background_color,
        icon_color: c.icon_color,
    };
}
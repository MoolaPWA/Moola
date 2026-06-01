import type { Category } from '../database';

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
    { user_id: 'system', name: 'Продукты', type: 'expense', is_deleted: 0 },
    { user_id: 'system', name: 'Транспорт', type: 'expense', is_deleted: 0 },
    { user_id: 'system', name: 'Развлечения', type: 'expense', is_deleted: 0 },
    { user_id: 'system', name: 'Здоровье', type: 'expense', is_deleted: 0 },
    { user_id: 'system', name: 'Образование', type: 'expense', is_deleted: 0 },
    { user_id: 'system', name: 'Покупки', type: 'expense', is_deleted: 0 },
    { user_id: 'system', name: 'Зарплата', type: 'income', is_deleted: 0 },
    { user_id: 'system', name: 'Фриланс', type: 'income', is_deleted: 0 },
    { user_id: 'system', name: 'Инвестиции', type: 'income', is_deleted: 0 },
    { user_id: 'system', name: 'Другое', type: 'expense', is_deleted: 0 },
];
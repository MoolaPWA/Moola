import { db, type Category } from '../database';
import { generateUUID } from '../utils/uuid';

export const categoryService = {

    async getById(id: string): Promise<Category | undefined> {
        return db.categories.get(id);
    },

    // Возвращаем только не удалённые
    async getAllByUser(user_id: string): Promise<Category[]> {
        const userCategories = await db.categories
            .where('user_id').equals(user_id)
            .filter((c) => c.is_deleted === 0)
            .toArray();

        const systemCategories = await db.categories
            .where('user_id').equals('system')
            .filter((c) => c.is_deleted === 0)
            .toArray();

        return [...systemCategories, ...userCategories];
    },

    async create(data: Omit<Category, 'id'>): Promise<string> {
        const category: Category = {
            id: generateUUID(),
            ...data,
            is_deleted: 0,
        };
        await db.categories.add(category);
        return category.id;
    },

    async update(id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> {
        await db.categories.update(id, data);
    },

    // Мягкое удаление (помечаем, не удаляем)
    async softDelete(id: string): Promise<void> {
        await db.categories.update(id, {
            is_deleted: 1,
        });
    },

    // Жёсткое удаление (только после синхронизации с сервером)
    async hardDelete(id: string): Promise<void> {
        await db.categories.delete(id);
    },

};
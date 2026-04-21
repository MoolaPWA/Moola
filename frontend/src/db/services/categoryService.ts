import { db, type Category } from '../database';

export const categoryService = {

    async getById(id: string): Promise<Category | undefined> {
        return db.categories.get(id);
    },

    async getAllByUser(user_id: string): Promise<Category[]> {
        return db.categories.where('user_id').equals(user_id).toArray();
    },

    async create(data: Omit<Category, 'id'>): Promise<string> {
        const category: Category = {
            id: crypto.randomUUID(),
            ...data,
        };
        await db.categories.add(category);
        return category.id;
    },

    async update(id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> {
        await db.categories.update(id, data);
    },

    async delete(id: string): Promise<void> {
        await db.categories.delete(id);
    },

};
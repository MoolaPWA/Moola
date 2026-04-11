import { db, type User } from '../database';

export const userService = {

    async getById(id: string): Promise<User | undefined> {
        return db.users.get(id);
    },

    async getByEmail(email: string): Promise<User | undefined> {
        return db.users.where('email').equals(email).first();
    },

    async create(data: Omit<User, 'id'>): Promise<string> {
        const user: User = {
            id: crypto.randomUUID(),
            ...data,
        };
        await db.users.add(user);
        return user.id;
    },

    async update(id: string, data: Partial<Omit<User, 'id'>>): Promise<void> {
        await db.users.update(id, data);
    },

    async delete(id: string): Promise<void> {
        await db.users.delete(id);
    },

};
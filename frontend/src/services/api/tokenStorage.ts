import { db } from '@/db/database.ts';

const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Хранилище токенов авторизации.
 *
 * Access-токен живёт только в памяти модуля — обнуляется при перезагрузке страницы.
 * Refresh-токен сохраняется в IndexedDB для восстановления сессии.
 */
class TokenStorage {
    private accessToken: string | null = null;

    /**
     * Возвращает access-токен из памяти.
     */
    getAccessToken(): string | null {
        return this.accessToken;
    }

    /**
     * Сохраняет access-токен в памяти.
     */
    setAccessToken(token: string | null): void {
        this.accessToken = token;
    }

    /**
     * Возвращает refresh-токен из IndexedDB.
     */
    async getRefreshToken(): Promise<string | null> {
        const record = await db.auth.get(REFRESH_TOKEN_KEY);
        return record?.value ?? null;
    }

    /**
     * Сохраняет refresh-токен в IndexedDB.
     */
    async setRefreshToken(token: string): Promise<void> {
        await db.auth.put({ key: REFRESH_TOKEN_KEY, value: token });
    }

    /**
     * Удаляет оба токена. Вызывается при логауте.
     */
    async clear(): Promise<void> {
        this.userId = null;
        this.accessToken = null;
        await db.auth.delete(REFRESH_TOKEN_KEY);
    }

    private userId: string | null = null;

    getUserId(): string | null {
        return this.userId;
    }

    setUserId(id: string): void {
        this.userId = id;
    }
}

export const tokenStorage = new TokenStorage();
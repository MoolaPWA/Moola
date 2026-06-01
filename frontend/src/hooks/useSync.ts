import { useState, useCallback } from 'react';
import { syncAll } from '@/services/api/syncManager';
import { toast } from 'sonner';
import type { ApiError } from '@/types/auth';

/**
 * Хук для запуска синхронизации с сервером.
 * Управляет состоянием загрузки и обработкой ошибок.
 */
export function useSync() {
    const [isSyncing, setIsSyncing] = useState(false);

    const sync = useCallback(async (silent = false): Promise<boolean> => {
        setIsSyncing(true);
        try {
            const result = await syncAll();
            if (!silent) {
                toast.success(`Синхронизировано: ${result.pushed} отправлено, ${result.pulled} получено`);
            }
            return true;
        } catch (err) {
            console.error('SYNC ERROR:', err);
            const error = err as ApiError;
            if (error.kind === 'network') {
                if (!silent) toast.error('Нет соединения — данные сохранены локально');
            } else if (error.kind === 'unauthorized') {
                // 401 уже обработан в client.ts (refresh или логаут)
            } else {
                if (!silent) toast.error('Ошибка синхронизации');
            }
            return false;
        } finally {
            setIsSyncing(false);
        }
    }, []);

    return { sync, isSyncing };
}
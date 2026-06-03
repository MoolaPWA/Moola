import { useEffect, useRef } from 'react';
import { useSync } from './useSync';
import { useUser } from '@/context/UserContext';

/**
 * Автоматическая синхронизация при возврате пользователя в приложение.
 * Срабатывает когда вкладка становится видимой или окно получает фокус.
 * Защищён от слишком частых вызовов (не чаще раза в 10 секунд).
 */
export function useAutoSync() {
    const { sync } = useSync();
    const { userId } = useUser();
    const lastSyncRef = useRef(0);

    useEffect(() => {
        if (!userId) return;

        const MIN_INTERVAL = 3_000; // не чаще раза в 10 секунд

        const trigger = () => {
            if (document.visibilityState !== 'visible') return;

            const now = Date.now();
            const diff = now - lastSyncRef.current;
            if (diff < MIN_INTERVAL) {
                return;
            }
            lastSyncRef.current = now;
            sync(true);
        };

        document.addEventListener('visibilitychange', trigger);
        window.addEventListener('focus', trigger);
        window.addEventListener('online', trigger);

        return () => {
            document.removeEventListener('visibilitychange', trigger);
            window.removeEventListener('focus', trigger);
            window.removeEventListener('online', trigger);
        };
    }, [userId, sync]);
}
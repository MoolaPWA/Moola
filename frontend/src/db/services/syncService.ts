// Сервис-мост между приложением и Service Worker
// Приложение никогда не обращается к SW напрямую, только через этот сервис

export const syncService = {

    // Регистрация Service Worker
    async register(): Promise<void> {
        if (!('serviceWorker' in navigator)) {
            console.warn('[Sync] Service Worker не поддерживается');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });
            console.log('[Sync] SW зарегистрирован:', registration.scope);
        } catch (error) {
            console.error('[Sync] Ошибка регистрации SW:', error);
        }
    },

    // Запросить синхронизацию у SW через MessageChannel
    // MessageChannel создаёт изолированный канал (SW и приложение)
    // общаются через него, не мешая друг другу работать с БД
    async requestSync(): Promise<{ success: boolean; synced?: number }> {
        const registration = await navigator.serviceWorker.ready;

        return new Promise((resolve, reject) => {
            const channel = new MessageChannel();

            // Слушаем ответ от SW
            channel.port1.onmessage = (event) => {
                if (event.data.success) {
                    resolve(event.data);
                } else {
                    reject(new Error(event.data.error));
                }
            };

            // Отправляем запрос SW через изолированный канал
            registration.active?.postMessage(
                { type: 'SYNC_REQUEST' },
                [channel.port2]
            );
        });
    },

    // Фоновая синхронизация через Background Sync API (когда появится сеть)
    async scheduleBackgroundSync(): Promise<void> {
        const registration = await navigator.serviceWorker.ready;

        if ('sync' in registration) {
            await (registration as any).sync.register('finance-sync');
            console.log('[Sync] Фоновая синхронизация запланирована');
        }
    },

};
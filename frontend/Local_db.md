# Спринт 2 — Реализация локального хранилища

**Проект:** Moola — PWA приложение для контроля личных финансов  
**Роль:** Frontend разработчик  
**Стек:** React · TypeScript · Vite · shadcn/ui · Tailwind CSS · IndexedDB (Dexie.js) · Recharts

---

## Содержание

- [Обзор](#обзор)
- [2.5.1 + 2.5.2 — Инициализация и версионирование БД](#251--252--инициализация-и-версионирование-бд)
- [2.5.3 + 2.5.4 — Создание хранилищ и индексация](#253--254--создание-хранилищ-и-индексация)
- [2.5.5 — Интерфейс асинхронного доступа к БД](#255--интерфейс-асинхронного-доступа-к-бд)
- [2.5.6 — Логика «операция = транзакция»](#256--логика-операция--транзакция)
- [2.5.7 — Подключение БД к Service Worker](#257--подключение-бд-к-service-worker)
- [2.5.8 — Логика миграции данных](#258--логика-миграции-данных)
- [Итоговая структура модуля](#итоговая-структура-модуля)
- [Ключевые технические решения](#ключевые-технические-решения)

---

## Обзор

Реализовано локальное хранилище на базе IndexedDB через обёртку Dexie.js. Локальная БД отражает схему backend-разработчика с одним дополнением — поле `is_synced` в таблице `transactions` для поддержки будущей двусторонней синхронизации.

**Ключевые отличия локальной БД от серверной:**

| | Серверная БД | Локальная БД |
|---|---|---|
| `users.password` | ✅ есть | ❌ не храним |
| `transactions.is_synced` | ❌ нет | ✅ есть |
| Тип первичного ключа | автоинкремент | UUID |
| Доступ | SQL | IndexedDB (Dexie.js) |

---

## 2.5.1 + 2.5.2 — Инициализация и версионирование БД

Создан класс `FinanceDatabase` на базе Dexie.js, который при первом запуске автоматически инициализирует IndexedDB в браузере под именем `FinanceAppDB`. Версионирование реализовано через механизм `this.version()` — при изменении схемы достаточно добавить новую версию, Dexie самостоятельно запустит миграцию у всех пользователей.

**Файлы:** `src/db/schema.ts`, `src/db/database.ts`

```typescript
// src/db/database.ts
class FinanceDatabase extends Dexie {
  users!: Table<User, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores(STORES);
  }
}

export const db = new FinanceDatabase();
```

---

## 2.5.3 + 2.5.4 — Создание хранилищ и индексация

Созданы три Object Store, повторяющие схему backend-разработчика.

**Файл:** `src/db/schema.ts`

```typescript
export const STORES = {
  users:        'id',
  categories:   'id, user_id',
  transactions: 'id, user_id, category_id, transaction_date, is_synced',
} as const;
```

**Индексы по ТЗ:**

| Store | Индексы |
|---|---|
| `users` | — |
| `categories` | `user_id` |
| `transactions` | `user_id`, `category_id`, `transaction_date`, `is_synced` |

> Индексируются только поля, по которым выполняются запросы (`where` / `equals`). Остальные поля хранятся автоматически без индекса.

---

## 2.5.5 — Интерфейс асинхронного доступа к БД

Реализованы три сервиса — по одному на каждый стор. Компоненты никогда не обращаются к `db` напрямую — только через методы сервисов. Каждый метод возвращает `Promise`.

**Файлы:** `src/db/services/userService.ts`, `categoryService.ts`, `transactionService.ts`

```
Компонент  →  вызывает метод сервиса  →  сервис обращается к db  →  возвращает Promise
```

**Методы сервисов:**

| Сервис | Методы |
|---|---|
| `userService` | `getById`, `getByEmail`, `create`, `update`, `delete` |
| `categoryService` | `getById`, `getAllByUser`, `create`, `update`, `delete` |
| `transactionService` | `getById`, `getAllByUser`, `getByCategory`, `getByDateRange`, `getUnsynced`, `create`, `update`, `delete` |

**UUID генерируется в сервисе**, а не в компоненте — компонент передаёт только данные:

```typescript
async create(data: Omit<Transaction, 'id'>): Promise<string> {
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    ...data,
  };
  await db.transactions.add(transaction);
  return transaction.id;
}
```

---

## 2.5.6 — Логика «операция = транзакция»

Создан файл `transactionOperations.ts` с атомарными операциями. Любое связанное изменение данных оборачивается в `db.transaction()` — если любой шаг падает, Dexie автоматически откатывает все изменения.

**Файл:** `src/db/services/transactionOperations.ts`

| Функция | Описание |
|---|---|
| `createCategoryWithTransaction()` | Создаёт категорию и первую транзакцию атомарно |
| `deleteCategoryWithTransactions()` | Удаляет категорию вместе со всеми её транзакциями атомарно |
| `updateTransactionAndMarkUnsynced()` | Обновляет транзакцию и сбрасывает `is_synced` атомарно |
| `markTransactionsSynced()` | Помечает список транзакций как синхронизированные атомарно |

```typescript
// Пример: удаление категории вместе с транзакциями
await db.transaction('rw', [db.categories, db.transactions], async () => {
  const transactions = await transactionService.getByCategory(categoryId);
  for (const t of transactions) {
    await transactionService.delete(t.id);
  }
  await categoryService.delete(categoryId);
  // Если любой шаг упал — Dexie откатит всё
});
```

---

## 2.5.7 — Подключение БД к Service Worker

Создан `public/sw.js` — Service Worker с доступом к IndexedDB через Dexie (подключена через `importScripts`). Создан `syncService.ts` — мост между приложением и SW.

**Файлы:** `public/sw.js`, `src/db/services/syncService.ts`

**Проблема конкуренции** — основное приложение и SW могут одновременно открывать `rw` транзакции на один стор, что вызывает зависания.

**Решение — три уровня изоляции:**

**1. Разделение зон ответственности**
```
Основное приложение → создание, чтение, обновление, удаление данных
Service Worker      → только чтение is_synced=0 и запись is_synced=1
```

**2. MessageChannel — изолированный канал связи**
```typescript
// Приложение не ждёт SW в общем потоке
const channel = new MessageChannel();
channel.port1.onmessage = (event) => resolve(event.data);
registration.active?.postMessage({ type: 'SYNC_REQUEST' }, [channel.port2]);
```

**3. Background Sync API — фоновая синхронизация**

SW запускает синхронизацию когда появляется сеть, не мешая основному потоку приложения.

```typescript
// syncService.ts — методы
register()                // регистрация SW при старте приложения
requestSync()             // запрос синхронизации через MessageChannel
scheduleBackgroundSync()  // планирование фоновой синхронизации
```

---

## 2.5.8 — Логика миграции данных

Миграции реализованы через цепочку версий Dexie. Правила зафиксированы в комментариях `schema.ts`.

**Файл:** `src/db/schema.ts`

**Как добавить новую версию:**

```typescript
// 1. Добавить новую константу схемы в schema.ts
export const STORES_V2 = {
  users:        'id',
  categories:   'id, user_id',
  transactions: 'id, user_id, category_id, transaction_date, is_synced',
  budgets:      'id, user_id',  // новый стор
} as const;

// 2. Увеличить версию
export const DB_VERSION = 2;

// 3. Зарегистрировать в database.ts
this.version(1).stores(STORES);     // старую версию не удалять
this.version(2).stores(STORES_V2).upgrade(async (tx) => {
  // если нужно изменить существующие данные
});

// 4. Обновить схему в public/sw.js
```

**Правила для команды:**

- ❌ Никогда не удалять старые версии — Dexie строит цепочку от v1 до текущей
- ✅ Если добавляешь только индекс — `.upgrade()` не нужен
- ✅ Если меняешь данные — `.upgrade()` обязателен
- ✅ После изменения схемы — обновить `sw.js` в соответствии

---

## Итоговая структура модуля

```
public/
└── sw.js                          ← Service Worker

src/
└── db/
    ├── schema.ts                  ← константы, версии, индексы
    ├── database.ts                ← класс БД, TypeScript интерфейсы
    └── services/
        ├── userService.ts         ← CRUD пользователей
        ├── categoryService.ts     ← CRUD категорий
        ├── transactionService.ts  ← CRUD транзакций
        ├── transactionOperations.ts  ← атомарные операции
        └── syncService.ts         ← мост приложение ↔ SW
```

---

## Ключевые технические решения

| Решение | Причина |
|---|---|
| UUID вместо автоинкремента | Двусторонняя синхронизация без конфликтов ID между устройствами |
| `is_synced: 0 \| 1` вместо `boolean` | IndexedDB не индексирует булевы значения |
| Сервисный слой | Компоненты не зависят от реализации БД — можно менять хранилище не трогая UI |
| `importScripts` в SW | Service Worker не поддерживает ES module импорты |
| MessageChannel | Изоляция потоков приложения и SW при обращении к БД |
| `password` не в локальной БД | Аутентификация только на сервере — безопасность |
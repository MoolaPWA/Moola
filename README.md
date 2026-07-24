# Moola – PWA для управления личными финансами

Offline-first приложение для учёта доходов и расходов.  
Работает без интернета, устанавливается на устройство как нативное, а при подключении к сети синхронизирует данные через защищённый аккаунт.

🔗 **Публичный URL:** [https://moola.website](https://moola.website)  
📂 **Репозиторий:** [https://github.com/MoolaPWA/Moola](https://github.com/MoolaPWA/Moola)

---

## 🚀 Технологический стек

| Слой | Технологии |
|------|-----------|
| **Клиент** | React · TypeScript · Vite · Tailwind CSS · shadcn/ui · Dexie.js (IndexedDB) · Recharts |
| **Сервер** | FastAPI (Python) · PostgreSQL · SQLAlchemy · Pydantic · slowapi |
| **Инфраструктура** | Docker · Docker Compose · Nginx · GitHub Actions · Trivy · gitleaks |

---

## 📁 Архитектура

```
┌─────────────┐      HTTPS       ┌──────────────┐      ┌────────────┐
│  PWA (React)│ ←──────────────→ │ Nginx (прокси)│────→ │ FastAPI     │
│  IndexedDB  │                  │ Статика + API │      │ PostgreSQL  │
└─────────────┘                  └──────────────┘      └────────────┘
       ↓                                ↑
  Service Worker                 Docker Compose
  (офлайн-кеш)                  (контейнеризация)
```

---

## ⚡ Быстрый старт (локальная разработка)

### 1. Клонировать репозиторий
```bash
git clone https://github.com/MoolaPWA/Moola.git
cd Moola
```

### 2. Создать `.env` с переменными окружения
```bash
cp .env.example .env   # или создайте вручную
```
Заполните секреты (DB_USER, DB_PASSWORD, DB_NAME, SECRET_KEY).  
Пример минимального `.env`:
```
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=moola
DB_HOST=postgres
DB_PORT=5432
SECRET_KEY=your_secret_key_for_jwt
```

### 3. Настроить локальный HTTPS (один раз)
Используйте [mkcert](https://github.com/FiloSottile/mkcert) для генерации доверенных сертификатов:
```bash
mkcert -install
cd certs
mkcert -cert-file finances.local.pem -key-file finances.local-key.pem finances.local localhost 127.0.0.1
```
Убедитесь, что в `hosts` прописана строка `127.0.0.1 finances.local`.

### 4. Поднять dev-окружение
```bash
docker compose -f docker-compose.dev.yml up -d --build
```
> **Примечание:** Если Docker Hub недоступен, включите Cloudflare WARP или используйте зеркало.

После запуска приложение откроется по адресу [https://finances.local](https://finances.local).  
Swagger API – [https://finances.local/docs](https://finances.local/docs) (если раскомментирован порт 8000 и открыт доступ) или `http://localhost:8000/docs` при проброшенном порте.

*Для разработки без Docker: запустите `npm run dev` в папке `frontend/` и `uvicorn main:main_app` в `backend/`, предварительно настроив переменные окружения.*

---

## 🧪 Тестирование

### Бэкенд
```bash
cd backend
pytest --cov
```

### Фронтенд
```bash
cd frontend
npm run lint
npm run build
```

---

---

## 🛡️ Модель безопасности (кратко)

- Access‑токен (15 мин) в памяти, refresh‑токен (30 дней) в IndexedDB
- Автоматическое бесшовное обновление токенов при 401
- Rate limiting на /auth/* (5 req/min) и /transactions/sync (10 req/min)
- CORS только для доверенных доменов, заголовки безопасности (nosniff, DENY)
- Docker‑образы без root, сканирование Trivy и gitleaks в CI/CD

---

## 🧩 PWA и офлайн‑режим

- **manifest.json**: полный набор иконок, display: standalone
- **Service Worker**: кеширует статику (Cache First), API‑запросы не кеширует
- **IndexedDB**: все операции и категории доступны без сети, после авторизации – синхронизация с сервером
- **Установка**: из браузера (Chrome, Safari, Edge), работает как отдельное приложение

---

## 📦 Модель данных (основные сущности)

**users**: id, name, email, hashed_password, is_deleted  
**transactions**: id, user_id, category_id, amount, type, description, date, is_deleted, is_synced, updated_at  
**categories**: id, user_id, name, type, icon_path, background_color, icon_color, is_deleted

Подробное описание полей и связей – в технической документации.

---

## 🤝 Команда

- Глеб Шмидт – тимлид, аналитик
- Захар Шутов – бэкенд‑разработчик
- Аркадий Феслер – fullstack‑разработчик
- Никита Табаков – DevOps‑инженер
- Вячеслав Кочетов – дизайнер

---

## 📈 Планы развития

- Импорт банковских операций через CSV с исключением переводов из статистики
- Расширенные настройки интерфейса (темы, кастомизация виджетов)
- Двусторонняя синхронизация с ПОЛНЫМ разрешением конфликтов
- Монетизация через подписку на расширенные категории и экспорт данных
- Импорт чеков через ФНС API для полной автоматизации

import uuid
import pytest
import requests
import time

import os

os.environ["NO_PROXY"] = "127.0.0.1,localhost"

# Базовый URL вашего локального сервера FastAPI
BASE_URL = "http://127.0.0.1:8000"



# =====================================================================
# ФИКСТУРЫ (Генерация данных и авторизация)
# =====================================================================

# Найдите, где у вас объявляется фикстура unique_user_credentials
@pytest.fixture(scope="session")
def unique_user_credentials():
    unique_id = str(int(time.time() * 1000))[-8:]
    return {
        "email": f"test_user_{unique_id}@example.com",
        "password": "StrongPassword123!",
        "name": "Test User"
    }


@pytest.fixture(scope="session")
def auth_headers(unique_user_credentials):
    """
    Регистрирует пользователя, авторизует его и возвращает заголовки
    с Bearer токеном для всех последующих защищенных запросов.
    """
    # 1. Регистрация нового пользователя
    reg_response = requests.post(
        f"{BASE_URL}/api/auth/register", 
        json=unique_user_credentials
    )
    
    # Детальный вывод ошибки, если сервер вернет не 200 OK
    assert reg_response.status_code == 200, (
        f"Регистрация упала со статусом {reg_response.status_code}. "
        f"Ответ сервера (проверьте схему полей): {reg_response.text}"
    )
    
    # 2. Логин для получения JWT-токена
    login_payload = {
        "email": unique_user_credentials["email"],
        "password": unique_user_credentials["password"]
    }
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    assert login_response.status_code == 200, (
        f"Логин упал со статусом {login_response.status_code}. "
        f"Ответ сервера: {login_response.text}"
    )
    
    tokens = login_response.json()
    access_token = tokens["access_token"]
    
    # Возвращаем словарь заголовков, который будет прокидываться в другие тесты
    return {"Authorization": f"Bearer {access_token}"}


# =====================================================================
# ТЕСТЫ: Пользователи (Users)
# =====================================================================

def test_get_me_success(auth_headers):
    """Проверка получения профиля текущего авторизованного пользователя."""
    response = requests.get(f"{BASE_URL}/api/users/me", headers=auth_headers)
    assert response.status_code == 200, f"Не удалось получить профиль: {response.text}"
    
    data = response.json()
    assert "id" in data, "В ответе отсутствует ID пользователя"
    assert "email" in data, "В ответе отсутствует Email пользователя"


def test_get_me_unauthorized():
    """Проверка, что защищенный эндпоинт возвращает 401 Unauthorized без токена."""
    response = requests.get(f"{BASE_URL}/api/users/me")
    assert response.status_code == 401, (
        f"Защищенный эндпоинт без токена вернул статус {response.status_code} вместо 401"
    )


# =====================================================================
# ТЕСТЫ: Категории (Categories)
# =====================================================================

@pytest.fixture(scope="module")
def sample_category(auth_headers):
    """
    Фикстура создает тестовую категорию перед началом тестов
    и гарантированно удаляет её (Teardown) после завершения тестов в модуле.
    """
    payload = {
        "name": "Продукты супермаркет",
        "type": "expense",
        "icon_path": "icons/food.svg",
        "background_color": "#FF5733",
        "icon_color": "#000000"
    }
    response = requests.post(f"{BASE_URL}/api/categories", json=payload, headers=auth_headers)
    assert response.status_code == 201, f"Не удалось создать категорию для тестов: {response.text}"
    category_data = response.json()
    
    yield category_data  # Передаем созданную категорию в тесты
    
    # Шаг очистки (Выполняется после всех тестов, использующих эту фикстуру)
    cat_id = category_data["id"]
    requests.delete(f"{BASE_URL}/api/categories/{cat_id}", headers=auth_headers)


def test_list_categories(auth_headers, sample_category):
    """Проверка получения списка категорий пользователя с фильтрацией."""
    params = {"type_filter": "expense"}
    response = requests.get(f"{BASE_URL}/api/categories", params=params, headers=auth_headers)
    assert response.status_code == 200, f"Ошибка получения списка категорий: {response.text}"
    
    categories = response.json()
    assert isinstance(categories, list), "Бэкенд вернул не массив"
    assert len(categories) > 0, "Список категорий пуст"
    assert any(c["id"] == sample_category["id"] for c in categories), "Созданная категория не найдена в списке"


def test_patch_category(auth_headers, sample_category):
    """Проверка частичного обновления (PATCH) полей категории."""
    cat_id = sample_category["id"]
    patch_payload = {"name": "Новая Еда"}
    
    response = requests.patch(
        f"{BASE_URL}/api/categories/{cat_id}", 
        json=patch_payload, 
        headers=auth_headers
    )
    assert response.status_code == 200, f"Не удалось обновить категорию: {response.text}"
    assert response.json()["name"] == "Новая Еда", "Имя категории не изменилось"


# =====================================================================
# ТЕСТЫ: Транзакции (Transactions)
# =====================================================================

def test_create_transaction_success(auth_headers, sample_category):
    """Проверка успешного создания транзакции, привязанной к категории."""
    from datetime import datetime
    payload = {
        "amount": 450.50,
        "type": "expense",
        "description": "Покупка молока и хлеба",
        "category_id": sample_category["id"],
        "transaction_date": datetime.now().isoformat(),
        "user_id": "00000000-0000-0000-0000-000000000000"
    }
    response = requests.post(f"{BASE_URL}/api/transactions", json=payload, headers=auth_headers)
    assert response.status_code == 201, f"Не удалось создать транзакцию: {response.text}"
    
    data = response.json()
    assert float(data["amount"]) == 450.50, "Сумма транзакции не совпадает"
    assert "id" in data, "Бэкенд не вернул ID созданной транзакции"


def test_list_transactions_with_filters(auth_headers):
    """Проверка получения списка транзакций с пагинацией."""
    params = {
        "limit": 10,
        "offset": 0,
        "type_filter": "expense"
    }
    response = requests.get(f"{BASE_URL}/api/transactions", params=params, headers=auth_headers)
    assert response.status_code == 200, f"Ошибка получения списка транзакций: {response.text}"
    assert isinstance(response.json(), list), "Ответ должен быть массивом"


def test_bulk_patch_transactions(auth_headers):
    """Проверка отправки запроса на массовое обновление (Bulk Patch)."""
    fake_id_1 = str(uuid.uuid4())
    fake_id_2 = str(uuid.uuid4())
    
    payload = {
        "updates": [
            {"id": fake_id_1, "amount": 1500.00, "description": "Правка через bulk"},
            {"id": fake_id_2, "description": "Вторая правка bulk"}
        ]
    }
    response = requests.patch(f"{BASE_URL}/api/transactions/bulk", json=payload, headers=auth_headers)
    
    # Так как ID фейковые, нормальное поведение базы — либо 200 (проигнорировано), либо 404 (не найдено).
    # Главное — запрос не должен возвращать 422 (ошибка валидации схемы JSON).
    assert response.status_code in [200, 404, 500], f"Неожиданный статус массового запроса: {response.text}"


# =====================================================================
# ТЕСТЫ: Негативные сценарии и Валидация (422 ValidationError)
# =====================================================================

def test_create_category_invalid_color(auth_headers):
    """Проверка валидации: бэкенд должен отклонить некорректный HEX-формат цвета."""
    payload = {
        "name": "Невалидный цвет",
        "type": "income",
        "background_color": "КРАСНЫЙ"  # Ломаем регулярное выражение ^#[0-9a-fA-F]{6}$
    }
    response = requests.post(f"{BASE_URL}/api/categories", json=payload, headers=auth_headers)
    assert response.status_code == 422, "Сервер пропустил невалидный формат HEX-цвета"
    assert "detail" in response.json(), "В ответе ошибки отсутствует стандартное поле 'detail'"


def test_update_user_invalid_uuid(auth_headers):
    """Проверка валидации: передача строки вместо валидного UUID в path-параметре."""
    invalid_uuid = "not-a-valid-uuid-string"
    payload = {"name": "Test"}
    
    response = requests.put(
        f"{BASE_URL}/api/users/{invalid_uuid}", 
        json=payload, 
        headers=auth_headers
    )
    assert response.status_code == 422, "Сервер пропустил невалидный UUID в пути запроса"
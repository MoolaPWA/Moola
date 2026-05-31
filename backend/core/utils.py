from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

DEFAULT_EXPENSE_CATEGORIES = [
    {"name": "Развлечения", "type": "expense", "icon_path": "static/icons/entertainment.svg", "background_color": "#FF5733", "icon_color": "#FFFFFF"},
    {"name": "Здоровье",     "type": "expense", "icon_path": "static/icons/health.svg",       "background_color": "#33FF57", "icon_color": "#FFFFFF"},
    {"name": "Продукты",     "type": "expense", "icon_path": "static/icons/groceries.svg",    "background_color": "#3357FF", "icon_color": "#FFFFFF"},
    {"name": "Покупки",      "type": "expense", "icon_path": "static/icons/shopping.svg",     "background_color": "#FF33F5", "icon_color": "#FFFFFF"},
    {"name": "Образование",  "type": "expense", "icon_path": "static/icons/education.svg",    "background_color": "#33FFF5", "icon_color": "#FFFFFF"},
    {"name": "Транспорт",    "type": "expense", "icon_path": "static/icons/transport.svg",    "background_color": "#F5FF33", "icon_color": "#FFFFFF"},
    {"name": "Другое",       "type": "expense", "icon_path": "static/icons/other.svg",        "background_color": "#FF8C33", "icon_color": "#FFFFFF"},
]

DEFAULT_INCOME_CATEGORIES = [
    {"name": "Инвестиции",   "type": "income",  "icon_path": "static/icons/investments.svg", "background_color": "#8C33FF", "icon_color": "#FFFFFF"},
    {"name": "Зарплата",     "type": "income",  "icon_path": "static/icons/salary.svg",      "background_color": "#33FF8C", "icon_color": "#FFFFFF"},
    {"name": "Фриланс",      "type": "income",  "icon_path": "static/icons/freelance.svg",   "background_color": "#FF3333", "icon_color": "#FFFFFF"},
]

async def _create_default_categories(session: AsyncSession, user_id: UUID) -> None:
    """
    Создаёт стандартные категории расходов и доходов для нового пользователя.
    Использует функцию create_category из crud.
    """
    from core.schemas.category import CategoryCreate
    from crud.categories import create_category

    all_defaults = DEFAULT_EXPENSE_CATEGORIES + DEFAULT_INCOME_CATEGORIES
    for cat_data in all_defaults:
        category_in = CategoryCreate(
            user_id=user_id,
            name=cat_data["name"],
            type=cat_data["type"],
            cat_limit=None,
            icon_path=cat_data["icon_path"],
            background_color=cat_data["background_color"],
            icon_color=cat_data["icon_color"]
        )
        await create_category(session, category_in)

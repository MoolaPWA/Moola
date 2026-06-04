from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

DEFAULT_EXPENSE_CATEGORIES = [
    {"name": "Развлечения", "type": "expense", "icon_path": "static/icons/entertainment.svg", "background_color": "#FFFFFF", "icon_color": "#000000"},
    {"name": "Здоровье",     "type": "expense", "icon_path": "static/icons/health.svg",       "background_color": "#FFFFFF", "icon_color": "#000000"},
    {"name": "Продукты",     "type": "expense", "icon_path": "static/icons/groceries.svg",    "background_color": "#FFFFFF", "icon_color": "#000000"},
    {"name": "Покупки",      "type": "expense", "icon_path": "static/icons/shopping.svg",     "background_color": "#FFFFFF", "icon_color": "#000000"},
    {"name": "Образование",  "type": "expense", "icon_path": "static/icons/education.svg",    "background_color": "#FFFFFF", "icon_color": "#000000"},
    {"name": "Транспорт",    "type": "expense", "icon_path": "static/icons/transport.svg",    "background_color": "#FFFFFF", "icon_color": "#000000"},
    {"name": "Другое",       "type": "expense", "icon_path": "static/icons/other.svg",        "background_color": "#FFFFFF", "icon_color": "#000000"},
]

DEFAULT_INCOME_CATEGORIES = [
    {"name": "Инвестиции",   "type": "income",  "icon_path": "static/icons/investments.svg", "background_color": "#FFFFFF", "icon_color": "#000000"},
    {"name": "Зарплата",     "type": "income",  "icon_path": "static/icons/salary.svg",      "background_color": "#FFFFFF", "icon_color": "#000000"},
    {"name": "Фриланс",      "type": "income",  "icon_path": "static/icons/freelance.svg",   "background_color": "#FFFFFF", "icon_color": "#000000"},
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

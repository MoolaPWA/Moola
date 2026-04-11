from fastapi import APIRouter
from .users import router as router_user
from .transactions import router as router_transactions
from .categories import router as router_categories

router = APIRouter()
router.include_router(router_user)
router.include_router(router_transactions)
router.include_router(router_categories)

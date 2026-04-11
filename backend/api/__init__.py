from fastapi import APIRouter
from .users import router as router_user

router = APIRouter()
router.include_router(router_user)


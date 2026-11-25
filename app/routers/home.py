from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from app.config import settings
from app.templates import render_template

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
def base():
    return render_template(settings.home_page_template)

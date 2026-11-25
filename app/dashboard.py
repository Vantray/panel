import logging
from pathlib import Path

from fastapi.staticfiles import StaticFiles

from app import app, on_startup
from app.config import settings

logger = logging.getLogger("uvicorn.error")

base_dir = Path(__file__).parent.parent / "dashboard"
build_dir = base_dir / "dist"
statics_dir = build_dir / "statics"


@on_startup
def mount_dashboard():
    if not build_dir.is_dir():
        if not settings.debug:
            logger.warning(
                "Dashboard build not found in %s — serving API only. "
                "Run `pnpm install && pnpm build` inside dashboard/ to build it.",
                build_dir,
            )
        return

    app.mount(settings.dashboard_path, StaticFiles(directory=build_dir, html=True), name="dashboard")
    app.mount("/statics/", StaticFiles(directory=statics_dir, html=True), name="statics")

import inspect
import logging
from collections.abc import Callable
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute

from app.config import settings

__version__ = "0.1.0"

# Startup/shutdown handlers collected from submodules at import time and run
# by the lifespan below (replacement for the deprecated @app.on_event API)
startup_handlers: list[Callable] = []
shutdown_handlers: list[Callable] = []


def on_startup(func: Callable) -> Callable:
    startup_handlers.append(func)
    return func


def on_shutdown(func: Callable) -> Callable:
    shutdown_handlers.append(func)
    return func


@asynccontextmanager
async def lifespan(app_: FastAPI):
    for handler in startup_handlers:
        result = handler()
        if inspect.isawaitable(result):
            await result
    yield
    for handler in shutdown_handlers:
        result = handler()
        if inspect.isawaitable(result):
            await result


app = FastAPI(
    title="VantrayAPI",
    description="Unified GUI Censorship Resistant Solution Powered by Xray",
    version=__version__,
    docs_url="/docs" if settings.docs else None,
    redoc_url="/redoc" if settings.docs else None,
    lifespan=lifespan,
)

scheduler = BackgroundScheduler({"apscheduler.job_defaults.max_instances": 20}, timezone="UTC")
logger = logging.getLogger("uvicorn.error")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from app import dashboard, jobs, routers, telegram  # noqa
from app.routers import api_router  # noqa

app.include_router(api_router)


def use_route_names_as_operation_ids(app: FastAPI) -> None:
    for route in app.routes:
        if isinstance(route, APIRoute):
            route.operation_id = route.name


use_route_names_as_operation_ids(app)


@on_startup
def on_startup():
    paths = [f"{r.path}/" for r in app.routes if hasattr(r, "path")]
    paths.append("/api/")
    if f"/{settings.xray_subscription_path}/" in paths:
        raise ValueError(
            f"you can't use /{settings.xray_subscription_path}/ as subscription path it reserved for {app.title}"
        )
    scheduler.start()


@on_shutdown
def on_shutdown():
    scheduler.shutdown()


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = {}
    for error in exc.errors():
        details[error["loc"][-1]] = error.get("msg")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": details}),
    )

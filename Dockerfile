ARG PYTHON_VERSION=3.14.10
ARG UV_VERSION=0.13.6
ARG XRAY_VERSION=latest

FROM alpine:3.24 AS xray

ARG TARGETARCH
ARG TARGETVARIANT
ARG XRAY_VERSION

# hadolint ignore=DL3018
RUN apk add --no-cache curl unzip

COPY install-xray.sh /tmp/install-xray.sh
RUN sh /tmp/install-xray.sh

FROM python:${PYTHON_VERSION}-alpine3.24 AS builder

ARG UV_VERSION

# hadolint ignore=DL3018
RUN apk add --no-cache \
    build-base \
    libffi-dev \
    openssl-dev \
    postgresql-dev \
    mariadb-dev \
    linux-headers \
    cargo \
    rust

RUN pip install --no-cache-dir uv==${UV_VERSION}

ENV UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_PYTHON_DOWNLOADS=never \
    UV_PYTHON_PREFERENCE=only-system \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project

FROM python:${PYTHON_VERSION}-alpine3.24 AS production

# hadolint ignore=DL3018
RUN apk add --no-cache \
    libpq \
    libffi \
    libstdc++ \
    mariadb-connector-c \
    ca-certificates \
    tzdata

COPY --from=builder /opt/venv /opt/venv
COPY --from=xray /out/bin/xray /usr/local/bin/xray
COPY --from=xray /out/share/ /usr/local/share/xray/

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONIOENCODING=utf-8

WORKDIR /code

COPY . /code

RUN ln -s /code/vantray-cli.py /usr/local/bin/vantray-cli \
    && chmod +x /code/vantray-cli.py

CMD ["sh", "-c", "alembic upgrade head && exec python main.py"]
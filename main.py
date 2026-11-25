import contextlib
import logging
import os
import ssl

import click
import uvicorn
from cryptography import x509
from cryptography.hazmat.backends import default_backend

from app import app, logger  # noqa: F401 -- `app` is referenced by string in uvicorn.run("main:app")
from app.config import settings


def validate_cert_and_key(cert_file_path, key_file_path, ca_type):
    if ca_type == "private":
        logger.warning(f"""
{click.style("IMPORTANT!", blink=True, bold=True, fg="yellow")}
You're running Vantray with: {click.style("UVICORN_SSL_CA_TYPE", italic=True, fg="magenta")}:
{click.style(f"{ca_type}", bold=True, fg="yellow")}.
Self-signed CAs are useful in testing or internal use cases,
they’re not suitable for secure public internet communications.
        """)
        return

    if not os.path.isfile(cert_file_path):
        raise ValueError(f"SSL certificate file '{cert_file_path}' does not exist.")
    if not os.path.isfile(key_file_path):
        raise ValueError(f"SSL key file '{key_file_path}' does not exist.")

    try:
        context = ssl.create_default_context()
        context.load_cert_chain(certfile=cert_file_path, keyfile=key_file_path)
    except ssl.SSLError as e:
        raise ValueError(f"SSL Error: {e}")

    try:
        with open(cert_file_path, "rb") as cert_file:
            cert_data = cert_file.read()
            cert = x509.load_pem_x509_certificate(cert_data, default_backend())

        if cert.issuer == cert.subject:
            raise ValueError("The certificate is self-signed and not issued by a trusted CA.")

    except Exception as e:
        raise ValueError(f"Certificate verification failed: {e}")


if __name__ == "__main__":
    # Do NOT change workers count for now
    # multi-workers support isn't implemented yet for APScheduler and XRay module

    bind_args = {}
    if settings.uvicorn_ssl_ca_type not in ["public", "private"]:
        settings.uvicorn_ssl_ca_type = "public"

    if settings.uvicorn_ssl_certfile and settings.uvicorn_ssl_keyfile and settings.uvicorn_ssl_ca_type:
        validate_cert_and_key(settings.uvicorn_ssl_certfile, settings.uvicorn_ssl_keyfile, settings.uvicorn_ssl_ca_type)

        bind_args["ssl_certfile"] = settings.uvicorn_ssl_certfile
        bind_args["ssl_keyfile"] = settings.uvicorn_ssl_keyfile

        if settings.uvicorn_uds:
            bind_args["uds"] = settings.uvicorn_uds
        else:
            bind_args["host"] = settings.uvicorn_host
            bind_args["port"] = settings.uvicorn_port

    else:
        if settings.uvicorn_uds:
            bind_args["uds"] = settings.uvicorn_uds
        else:
            logger.warning(f"""
{click.style("IMPORTANT!", blink=True, bold=True, fg="yellow")}
You're running Vantray without specifying {click.style("UVICORN_SSL_CERTFILE", italic=True, fg="magenta")}
and {click.style("UVICORN_SSL_KEYFILE", italic=True, fg="magenta")}.
The application will only be accessible through localhost. This means that
{click.style("Vantray and subscription URLs will not be accessible externally", bold=True)}.

If you need external access, please provide the SSL files to allow the server to bind to 0.0.0.0.
Alternatively, you can run the server on localhost or a Unix socket and use a reverse proxy,
such as Nginx or Caddy, to handle SSL termination and provide external access.

If you wish to continue without SSL, you can use SSH port forwarding to access the application from your machine.
note that in this case, subscription functionality will not work.

Use the following command:

{click.style(f"ssh -L {settings.uvicorn_port}:localhost:{settings.uvicorn_port} user@server", italic=True, fg="cyan")}

Then, navigate to {click.style(f"http://127.0.0.1:{settings.uvicorn_port}", bold=True)} on your computer.
            """)

            bind_args["host"] = "127.0.0.1"
            bind_args["port"] = settings.uvicorn_port

    if settings.debug:
        bind_args["uds"] = None
        bind_args["host"] = "0.0.0.0"

    with contextlib.suppress(FileNotFoundError):  # to prevent error on removing unix sock
        uvicorn.run(
            "main:app",
            **bind_args,
            workers=1,
            reload=settings.debug,
            log_level=logging.DEBUG if settings.debug else logging.INFO,
        )

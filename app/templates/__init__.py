import jinja2

from app.config import settings
from app.utils.helpers import utcnow

from .filters import CUSTOM_FILTERS

template_directories = ["app/templates"]
if settings.custom_templates_directory:
    # User's templates have priority over default templates
    template_directories.insert(0, settings.custom_templates_directory)

env = jinja2.Environment(loader=jinja2.FileSystemLoader(template_directories))
env.filters.update(CUSTOM_FILTERS)
env.globals["now"] = utcnow


def render_template(template: str, context: dict | None = None) -> str:
    return env.get_template(template).render(context or {})

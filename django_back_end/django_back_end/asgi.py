# django_back_end/asgi.py
import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import sih.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_back_end.settings")
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(sih.routing.websocket_urlpatterns)
    ),
})

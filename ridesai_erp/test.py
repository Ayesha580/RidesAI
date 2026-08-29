import os
import django

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings"
)

django.setup()

from django.conf import settings
from openai import OpenAI

client = OpenAI(
    api_key=settings.OPENAI_API_KEY
)

models = client.models.list()

for model in models.data:
    print(model.id)
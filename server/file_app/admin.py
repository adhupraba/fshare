from django.contrib import admin
from . import models

# Register your models here.
admin.site.register(models.File)
admin.site.register(models.FileShare)

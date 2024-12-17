from django.contrib import admin
from . import models


class FileAdmin(admin.ModelAdmin):
    readonly_fields = ["id"]


class FileShareAdmin(admin.ModelAdmin):
    readonly_fields = ["id", "encrypted_file_key"]


# Register your models here.
admin.site.register(models.File, FileAdmin)
admin.site.register(models.FileShare, FileShareAdmin)

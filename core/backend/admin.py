from django.contrib import admin
from .models import UserProfile, Restaurant

# Register your models here.

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('nume', 'prenume', 'email', 'telefon', 'created_at')
    search_fields = ('nume', 'prenume', 'email')

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('nume', 'adresa', 'email_contact', 'rating', 'created_at')
    search_fields = ('nume', 'adresa', 'email_contact')

from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.api_login, name='api_login'),
    path('register/', views.api_register, name='api_register'),
    path('register-restaurant/', views.api_register_restaurant, name='api_register_restaurant'),
    path('generate-description/', views.api_generate_description, name='api_generate_description'),
]
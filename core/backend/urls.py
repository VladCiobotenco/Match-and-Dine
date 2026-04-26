from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.api_login),
    path('register/', views.api_register),
    path('register-restaurant/', views.api_register_restaurant),
    path('restaurants/', views.api_get_restaurants),
    path('restaurants/<int:pk>/', views.api_get_restaurant_details),
    path('dashboard-stats/', views.api_dashboard_stats),
    path('menu/', views.api_menu),
    path('menu/<int:item_id>/', views.api_menu_detail),
    path('reservations/', views.api_reservations),
    path('generate-description/', views.api_generate_description, name='api_generate_description'),
]
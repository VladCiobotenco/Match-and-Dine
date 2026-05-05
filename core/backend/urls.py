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
    path('owner-restaurants/', views.api_owner_restaurants, name='api_owner_restaurants'),
    path('password-reset/', views.api_password_reset_request, name='password_reset_request'),
    path('password-reset/confirm/', views.api_password_reset_confirm, name='password_reset_confirm'),
    path('swipe-deck/', views.api_swipe_deck, name='api_swipe_deck'),
    path('record-swipe/', views.api_record_swipe, name='api_record_swipe'),
    path('my-matches/', views.api_my_matches, name='api_my_matches'),
    path('restaurants/<int:pk>/reserve/', views.api_create_reservation, name='api_create_reservation'),
    path('my-reservations/', views.api_user_reservations, name='api_user_reservations'),
    path('rate-reservation/<int:res_id>/', views.api_rate_reservation, name='api_rate_reservation'),
]
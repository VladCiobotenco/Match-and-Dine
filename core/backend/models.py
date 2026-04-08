from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    nume = models.CharField(max_length=100)
    prenume = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telefon = models.CharField(max_length=20, blank=True, null=True)
    
    gastronomie_preferata = models.CharField(max_length=150, blank=True, null=True)
    fel_de_mancare_preferat = models.CharField(max_length=150, blank=True, null=True)
    bautura_preferata = models.CharField(max_length=150, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.prenume} {self.nume} ({self.email})"
    
class Restaurant(models.Model):
    nume = models.CharField(max_length=100)
    adresa = models.CharField(max_length=200)
    telefon_contact = models.CharField(max_length=20, blank=True, null=True)
    email_contact = models.EmailField(unique=True)

    descriere = models.TextField(blank=True, null=True)
    rating = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.nume

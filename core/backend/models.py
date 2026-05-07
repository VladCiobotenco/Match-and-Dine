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
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='restaurants', null=True, blank=True)
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

class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    nume = models.CharField(max_length=100)
    pret = models.DecimalField(max_digits=6, decimal_places=2)
    categorie = models.CharField(max_length=50, blank=True, null=True)

class Reservation(models.Model):
    STATUS_CHOICES = [('Așteptare', 'În așteptare'), ('Confirmat', 'Confirmat'), ('Respins', 'Respins')]
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reservations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rezervari_client', null=True, blank=True)
    nume_client = models.CharField(max_length=100)
    data_timp = models.DateTimeField()
    numar_persoane = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Așteptare')
    nota_acordata = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class UserInteraction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactions')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=[('LIKE', 'Like'), ('REJECT', 'Reject')])
    match_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'restaurant')
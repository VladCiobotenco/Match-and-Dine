import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from backend.models import Restaurant, MenuItem
from django.contrib.auth.models import User

profiluri = [
    {"nume": "La Mama", "tip": "Tradițional", "desc": "Mâncare tradițională românească autentică. Avem sarmale, mămăliguță, ciorbă de burtă și papanași delicioși."},
    {"nume": "Pizza Napoli", "tip": "Italian", "desc": "Cea mai bună pizza napoletană, focaccia și paste carbonara cu guanciale adevărat. O mică Italie în orașul tău."},
    {"nume": "Burger Joint", "tip": "American", "desc": "Burgeri suculenți din vită Angus, cartofi prăjiți crocanți și sosuri făcute în casă. Perfect pentru o poftă de fast food premium."},
    {"nume": "Sushi Zen", "tip": "Asiatic", "desc": "Rulouri de sushi proaspăt, sashimi de somon și ton, ramen fierbinte și atmosferă japoneză relaxantă."},
    {"nume": "El Torito", "tip": "Mexican", "desc": "Tacos, burritos, quesadilla și guacamole autentic. Mâncare mexicană ușor picantă, ideală cu o margarita rece."},
    {"nume": "Veggie Life", "tip": "Vegan", "desc": "Preparate 100% plant-based. Salate proaspete, burgeri vegani, smoothie-uri și deserturi raw vegane super sănătoase."},
    {"nume": "Steakhouse 101", "tip": "Grill", "desc": "Pentru iubitorii de carne: Ribeye, Tomahawk și T-Bone steak, maturate și gătite exact cum îți place."},
    {"nume": "Sweet Bakery", "tip": "Desert", "desc": "Prăjituri artizanale, torturi de ciocolată, clătite și o cafea de specialitate perfectă pentru dimineți dulci."}
]

meniuri_dictionar = {
    "Tradițional": [("Sarmale cu mămăliguță", 45, "Principal"), ("Ciorbă de burtă", 25, "Supe"), ("Papanași", 28, "Desert")],
    "Italian": [("Pizza Diavola", 38, "Pizza"), ("Paste Carbonara", 42, "Paste"), ("Tiramisu", 25, "Desert")],
    "American": [("Cheeseburger Angus", 55, "Burgeri"), ("Cartofi cu usturoi și parmezan", 18, "Garnituri"), ("Milkshake de vanilie", 22, "Băuturi")],
    "Asiatic": [("Sushi Dragon Roll", 60, "Sushi"), ("Ramen de porc", 45, "Supe"), ("Mochi cu ceai verde", 20, "Desert")],
    "Mexican": [("Tacos de vită", 35, "Tacos"), ("Burrito mare", 40, "Principal"), ("Churros", 20, "Desert")],
    "Vegan": [("Burger de soia", 45, "Principal"), ("Salată Quinoa", 35, "Salate"), ("Limonadă Detox", 20, "Băuturi")],
    "Grill": [("Ribeye Steak 300g", 120, "Carne"), ("Tomahawk 1kg", 250, "Carne"), ("Legume la grătar", 25, "Garnituri")],
    "Desert": [("Cheesecake", 25, "Prăjituri"), ("Clătite cu ciocolată", 22, "Clătite"), ("Cafea Latte", 15, "Băuturi")]
}

strazi = ["Victoriei", "Eminescu", "Unirii", "Independenței", "Libertății", "Bălcescu", "Republicii", "Avram Iancu", "Primăverii", "Dorobanți"]
sufixe = ['Premium', 'Bistro', 'Express', 'Lounge', 'Garden', 'Downtown', 'Classic', 'Gold', '& Co', 'Star']

def seed():
    print("Ștergem datele vechi (pentru a curăța orfanii)...")
    Restaurant.objects.all().delete()
    
    # Creăm un Owner care să primească restaurantele generate
    owner_email = "owner_test@test.ro"
    owner, created = User.objects.get_or_create(username=owner_email, defaults={'email': owner_email, 'first_name': 'Patron', 'last_name': 'Suprem'})
    if created:
        owner.set_password('parola123')
        owner.save()
    
    print("Începem generarea a 50 de restaurante...")
    for i in range(1, 51):
        profil = random.choice(profiluri)
        nume = f"{profil['nume']} {random.choice(sufixe)} {i}"
        adresa = f"Str. {random.choice(strazi)} nr. {random.randint(1, 150)}, București"
        telefon = f"07{random.randint(10000000, 99999999)}"
        email = f"contact_test_{i}_{random.randint(1000,9999)}@example.com"
        descriere = profil['desc']
        rating = round(random.uniform(3.8, 5.0), 1)

        rest = Restaurant.objects.create(
            owner=owner, # Asignăm restaurantul ownerului!
            nume=nume,
            adresa=adresa,
            telefon_contact=telefon,
            email_contact=email,
            descriere=descriere,
            rating=rating
        )
        
        # Generăm meniul specific
        tip = profil['tip']
        preparate = meniuri_dictionar.get(tip, meniuri_dictionar["Italian"])
        for prep in preparate:
            MenuItem.objects.create(restaurant=rest, nume=prep[0], pret=prep[1], categorie=prep[2])
            
    print("Gata! Cele 50 de restaurante au fost adăugate.")
    print(f"** Poți testa Owner Dashboard logându-te cu: {owner_email} / parola123 **")

if __name__ == '__main__':
    seed()
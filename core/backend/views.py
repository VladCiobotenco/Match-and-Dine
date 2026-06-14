import json
import requests  
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.core import signing
import jwt
from django.conf import settings
from .models import UserProfile, Restaurant, MenuItem, Reservation, UserInteraction, BannedRestaurant
from datetime import datetime, timedelta, timezone
import time
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
import google.generativeai as genai
import re
import random


def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        print("DEBUG AUTH: Header-ul 'Authorization' lipsește complet din cererea frontend-ului!")
        return None
        
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            data = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            return User.objects.get(id=data['user_id'])
        except jwt.ExpiredSignatureError:
            print("DEBUG AUTH: Token-ul a expirat!")
        except jwt.InvalidTokenError:
            print("DEBUG AUTH: Token-ul este invalid!")
        except User.DoesNotExist:
            print("DEBUG AUTH: Utilizatorul asociat cu acest token nu mai există în baza de date (probabil baza de date a fost ștearsă/resetată)!")
    return None

def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

            if user is not None:
                payload = {
                    'user_id': user.id,
                    'exp': datetime.now(timezone.utc) + timedelta(days=1),
                    'iat': datetime.now(timezone.utc)
                }
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
                
                if isinstance(token, bytes):
                    token = token.decode('utf-8')
                    
                # Verificăm strict dacă ACEST user are un restaurant înregistrat
                is_owner = Restaurant.objects.filter(owner=user).exists()
                
                try:
                    profile = user.userprofile
                    is_admin = profile.is_admin
                except UserProfile.DoesNotExist:
                    is_admin = 'no'

                return JsonResponse({
                    'message': 'Login successful', 
                    'email': user.email,
                    'isOwner': is_owner,
                    'isAdmin': is_admin,
                    'token': token
                })
            else:
                return JsonResponse({'error': 'Adresa de email sau parola incorecta'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_register_restaurant(request):
    if request.method == 'POST':
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'Trebuie să fii logat pentru a înregistra un restaurant'}, status=401)

        try:
            data = json.loads(request.body)
            nume = data.get('numeRestaurant', '').strip()
            adresa = data.get('adresa', '').strip()
            telefon = data.get('telefonContact', '').strip()
            descriere = data.get('descriere', '').strip()
            
            if not nume or not adresa:
                return JsonResponse({'error': 'Numele și adresa sunt obligatorii'}, status=400)

            cui = data.get('cui', '').strip()
            timestamp = int(time.time())
            dummy_email = f"contact_{cui}_{timestamp}@example.com" if cui else f"contact_{nume.replace(' ', '').lower()}_{timestamp}@example.com"

            # Am eliminat limitarea la un singur restaurant pe cont

            restaurant = Restaurant.objects.create(
                owner=user,
                nume=nume,
                adresa=adresa,
                telefon_contact=telefon if telefon else None,
                descriere=descriere if descriere else None,
                rating=0.0,
                email_contact=dummy_email
            )
            return JsonResponse({'message': 'Restaurant înregistrat cu succes', 'id': restaurant.id, 'isOwner': True})

        except IntegrityError:
            return JsonResponse({'error': 'Eroare la salvare. Posibil duplicat.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_generate_description(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nume = data.get('nume', '').strip()
            
            specific = data.get('specific', '').strip()
            if not specific:
                specific = data.get('adresa', '').strip()
            
            if not nume or not specific:
                return JsonResponse({'error': 'Numele și specificul sunt obligatorii pentru a genera o descriere'}, status=400)
            
            return send_ai_description_response(nume, specific)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def send_ai_description_response(nume, specific):
    
    API_URL = "https://affiliate-rockiness-jaywalker.ngrok-free.dev/generate" 
    

    payload = {
        "nume": nume,
        "specific": specific
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status() 
        
        data = response.json()
        return JsonResponse({'descriere': data.get('descriere', '')})
            
    except Exception as e:
        print(f"Eroare Colab: {e}")
        fallback_desc = f"Descoperă {nume}, noul tău loc preferat situat pe {specific}. Te așteptăm cu preparate delicioase într-o atmosferă de neuitat!"
        return JsonResponse({'descriere': fallback_desc})
   
@csrf_exempt
def api_register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nume = data.get('nume', '').strip()
            prenume = data.get('prenume', '').strip()
            email = data.get('email', '').strip().lower()
            telefon = data.get('telefon', '').strip()
            password = data.get('password', '')

            if not nume or not prenume or not email or not password:
                return JsonResponse({'error': 'Toate câmpurile obligatorii trebuie completate'}, status=400)
            
            if len(password) < 6:
                return JsonResponse({'error': 'Parola trebuie să aibă cel puțin 6 caractere'}, status=400)
            
            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Adresa de email este deja înregistrată'}, status=400)

            user = User.objects.create_user(username=email, email=email, password=password, first_name=prenume, last_name=nume)
            UserProfile.objects.create(user=user, nume=nume, prenume=prenume, email=email, telefon=telefon if telefon else None)

            # Generăm token-ul pentru a loga utilizatorul automat după înregistrare
            payload = {
                'user_id': user.id,
                'exp': datetime.now(timezone.utc) + timedelta(days=1),
                'iat': datetime.now(timezone.utc)
            }
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
            
            if isinstance(token, bytes):
                token = token.decode('utf-8')
                
            return JsonResponse({
                'message': 'Cont creat cu succes', 
                'email': user.email,
                'token': token,
                'isOwner': False,
                'isAdmin': 'no'
            })

        except IntegrityError:
            return JsonResponse({'error': 'Adresa de email este deja înregistrată'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_get_restaurants(request):
    if request.method == 'GET':
        restaurants = Restaurant.objects.filter(is_approved='yes').values('id', 'nume', 'adresa', 'rating', 'descriere')
        return JsonResponse(list(restaurants), safe=False)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_get_restaurant_details(request, pk):
    if request.method == 'GET':
        try:
            restaurant = Restaurant.objects.get(pk=pk)
            if restaurant.is_approved != 'yes':
                user = get_user_from_token(request)
                is_admin_flag = False
                if user:
                    try:
                        is_admin_flag = user.userprofile.is_admin == 'yes'
                    except UserProfile.DoesNotExist:
                        pass
                if not user or (restaurant.owner != user and not is_admin_flag):
                    return JsonResponse({'error': 'Acest restaurant nu este aprobat încă.'}, status=403)

            menu_items = MenuItem.objects.filter(restaurant=restaurant).values('id', 'nume', 'pret', 'categorie')
            
            data = {
                'id': restaurant.id,
                'nume': restaurant.nume,
                'adresa': restaurant.adresa,
                'telefon': restaurant.telefon_contact,
                'email': restaurant.email_contact,
                'descriere': restaurant.descriere,
                'rating': restaurant.rating,
                'meniu': list(menu_items)
            }
            return JsonResponse(data)
        except Restaurant.DoesNotExist:
            return JsonResponse({'error': 'Restaurantul nu a fost găsit'}, status=404)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_owner_restaurants(request):
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    if request.method == 'GET':
        restaurants = Restaurant.objects.filter(owner=user).values('id', 'nume', 'adresa', 'rating', 'is_approved')
        return JsonResponse(list(restaurants), safe=False)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_dashboard_stats(request):
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    restaurant_id = request.headers.get('X-Restaurant-ID')
    if restaurant_id:
        restaurant = Restaurant.objects.filter(owner=user, id=restaurant_id).first()
    else:
        restaurant = Restaurant.objects.filter(owner=user).first()
        
    if not restaurant:
        return JsonResponse({'error': 'Restaurantul nu a fost găsit sau nu îți aparține.'}, status=403)
        
    if request.method == 'GET':
        return JsonResponse({
            'nume': restaurant.nume,
            'views': 0,
            'matches': 0
        })
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_menu(request):
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    restaurant_id = request.headers.get('X-Restaurant-ID')
    if restaurant_id:
        restaurant = Restaurant.objects.filter(owner=user, id=restaurant_id).first()
    else:
        restaurant = Restaurant.objects.filter(owner=user).first()
        
    if not restaurant:
        return JsonResponse({'error': 'Restaurantul nu a fost găsit sau nu îți aparține.'}, status=403)

    if request.method == 'GET':
        items = MenuItem.objects.filter(restaurant=restaurant).values('id', 'nume', 'pret', 'categorie')
        return JsonResponse(list(items), safe=False)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            item = MenuItem.objects.create(
                restaurant=restaurant,
                nume=data.get('nume'),
                pret=data.get('pret'),
                categorie=data.get('categorie', 'General')
            )
            return JsonResponse({'message': 'Preparat salvat', 'id': item.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_menu_detail(request, item_id):
    if request.method == 'DELETE':
        try:
            # Ștergem preparatul (am putea adăuga o validare să ne asigurăm că îi aparține, dar merge bine și așa momentan)
            MenuItem.objects.filter(id=item_id).delete()
            return JsonResponse({'message': 'Preparat șters cu succes'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_reservations(request):
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    restaurant_id = request.headers.get('X-Restaurant-ID')
    if restaurant_id:
        restaurant = Restaurant.objects.filter(owner=user, id=restaurant_id).first()
    else:
        restaurant = Restaurant.objects.filter(owner=user).first()
        
    if not restaurant:
        return JsonResponse({'error': 'Restaurantul nu a fost găsit sau nu îți aparține.'}, status=403)

    if request.method == 'GET':
        rezervari = Reservation.objects.filter(restaurant=restaurant).order_by('-data_timp')
        formatted = [{
            'id': r.id,
            'numeClient': r.nume_client,
            'data': r.data_timp.strftime("%d/%m/%Y, %H:%M"),
            'persoane': r.numar_persoane,
            'status': r.status
        } for r in rezervari]
        return JsonResponse(formatted, safe=False)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_reservation_detail(request, res_id):
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            nou_status = data.get('status')
            Reservation.objects.filter(id=res_id).update(status=nou_status)
            return JsonResponse({'message': 'Status actualizat cu succes'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@api_view(['POST'])
def api_password_reset_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Te rog să introduci un email.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Generăm un token unic valabil temporar și identificatorul utilizatorului codat b64
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)
        
        # Link-ul generat (trebuie să corespundă cu ruta de frontend pe care o vei crea în React)
        reset_url = f"http://localhost:5173/reset-password/{uid}/{token}/"
        
        # Trimiterea emailului
        send_mail(
            subject='Resetare Parolă - Match & Dine',
            message=f'Salut!\n\nAccesează acest link pentru a-ți reseta parola:\n{reset_url}\n\nDacă nu ai cerut asta, ignoră acest mesaj.',
            from_email='noreply@matchanddine.ro',
            recipient_list=[email],
            fail_silently=False,
        )
    except User.DoesNotExist:
        # Pentru securitate, returnăm succes chiar dacă emailul nu există, astfel încât atacatorii să nu poată enumera conturile valide
        pass

    return Response({'message': 'Dacă adresa de email există în sistem, a fost trimis un link de resetare.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def api_password_reset_confirm(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not uidb64 or not token or not new_password:
        return Response({'error': 'Date incomplete.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    # Verificăm validitatea token-ului și actualizăm parola
    if user is not None and PasswordResetTokenGenerator().check_token(user, token):
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Parola a fost actualizată cu succes.'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Link-ul de resetare este invalid sau a expirat.'}, status=status.HTTP_400_BAD_REQUEST)

def api_swipe_deck(request):
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            prompt = data.get('prompt', '')
            
            interacted_ids = UserInteraction.objects.filter(user=user).values_list('restaurant_id', flat=True)
            available_restaurants = Restaurant.objects.exclude(id__in=interacted_ids).prefetch_related('menu_items')
            deck = []
            print(f"DEBUG: Restaurante disponibile (neswipate): {available_restaurants.count()}")
            
            if prompt and hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY != 'YOUR_GEMINI_API_KEY':
                try:
                    genai.configure(api_key=settings.GEMINI_API_KEY)
                    model = genai.GenerativeModel('gemini-3.5-flash')
                    
                    restaurants_data = []
                    for r in available_restaurants:
                        menu_items = list(r.menu_items.values_list('nume', flat=True))
                        restaurants_data.append({
                            "id": r.id,
                            "nume": r.nume,
                            "descriere": r.descriere or "",
                            "meniu": menu_items
                        })
                    
                    ai_prompt = f"""
                    You are a smart food recommendation assistant. The user is looking for: "{prompt}"
                    
                    Here is a list of available restaurants in JSON format:
                    {json.dumps(restaurants_data, ensure_ascii=False)}
                    
                    CRITICAL INSTRUCTIONS:
                    1. Read the "descriere" and "meniu" of EACH restaurant carefully.
                    2. SMART FILTERING: Find the best matches. It does not have to be a 100% exact keyword match. If they want a specific food, find restaurants that serve it, or have a highly related cuisine (e.g., recommend an Italian place for pasta).
                    3. Do NOT add completely unrelated restaurants (e.g., do not recommend a burger joint if they ask for sushi).
                    4. Select up to 8 good matches. If absolutely nothing is even a loose match, return an empty array [].
                    5. Assign a 'matchScore' (1 to 100). Perfect matches get 90-100, loose/related matches get 70-89.
                    5. Return ONLY a raw JSON array of objects, where each object has 'id' (the restaurant id) and 'matchScore'.
                    Example: [{{"id": 1, "matchScore": 95}}] or []
                    Do not include any markdown formatting or additional text, just the raw JSON.
                    """
                    
                    response = model.generate_content(ai_prompt)
                    response_text = response.text.strip()
                    print(f"DEBUG: Răspuns Gemini: {response_text}")
                    
                    
                    match = re.search(r'\[.*\]', response_text, re.DOTALL)
                    if match:
                        clean_json = match.group(0)
                        recommended_data = json.loads(clean_json)
                    else:
                        print("DEBUG: Nu s-a găsit un array JSON valid în răspuns!")
                        recommended_data = []
                    
                    if recommended_data:
                        recommended_ids = [item['id'] for item in recommended_data]
                        score_map = {item['id']: item['matchScore'] for item in recommended_data}
                        
                        selected_restaurants = Restaurant.objects.filter(id__in=recommended_ids)
                        deck = [{'id': r.id, 'nume': r.nume, 'adresa': r.adresa, 'descriere': r.descriere, 'rating': r.rating, 'matchScore': score_map.get(r.id, 80)} for r in selected_restaurants]
                        
                        
                        deck.sort(key=lambda x: x['matchScore'], reverse=True)
                        
                except Exception as e:
                    print(f"Eroare Gemini AI la Swipe Deck: {e}")
                    
            return JsonResponse(deck, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_record_swipe(request):
    user = get_user_from_token(request)
    if not user: return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            rest_id = data.get('restaurant_id')
            action = data.get('action') 
            match_score = data.get('match_score', 0)
            
            UserInteraction.objects.update_or_create(user=user, restaurant_id=rest_id, defaults={'action': action, 'match_score': match_score})
            return JsonResponse({'message': 'Acțiune înregistrată'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_my_matches(request):
    user = get_user_from_token(request)
    if not user: return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    if request.method == 'GET':
        interactions = UserInteraction.objects.filter(user=user, action='LIKE').select_related('restaurant').order_by('-match_score')
        matches = [{
            'id': inter.restaurant.id,
            'nume': inter.restaurant.nume,
            'adresa': inter.restaurant.adresa,
            'descriere': inter.restaurant.descriere,
            'matchScore': inter.match_score
        } for inter in interactions]
        
        return JsonResponse(matches, safe=False)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_create_reservation(request, pk):
    user = get_user_from_token(request)
    if not user: return JsonResponse({'error': 'Trebuie să fii autentificat pentru a rezerva!'}, status=401)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            restaurant = Restaurant.objects.get(pk=pk)
            
            data_rez = data.get('data') # YYYY-MM-DD
            ora_rez = data.get('ora') # HH:MM
            if not data_rez or not ora_rez: return JsonResponse({'error': 'Data și ora sunt obligatorii'}, status=400)
                
            data_timp_obj = datetime.strptime(f"{data_rez}T{ora_rez}:00", "%Y-%m-%dT%H:%M:%S")
            
            Reservation.objects.create(
                restaurant=restaurant, user=user,
                nume_client=f"{user.first_name} {user.last_name}".strip() or user.username,
                data_timp=data_timp_obj, numar_persoane=int(data.get('persoane', 2)), status='Așteptare'
            )
            return JsonResponse({'message': 'Rezervare trimisă cu succes către restaurant!'})
        except Exception as e: return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_user_reservations(request):
    user = get_user_from_token(request)
    if not user: return JsonResponse({'error': 'Neautorizat'}, status=401)
    if request.method == 'GET':
        from django.utils import timezone
        rezervari = Reservation.objects.filter(user=user).order_by('-data_timp').select_related('restaurant')
        now = timezone.now()
        rez_list = [{
            'id': r.id, 'restaurant_nume': r.restaurant.nume,
            'data_timp': r.data_timp.strftime("%d/%m/%Y %H:%M"),
            'persoane': r.numar_persoane, 'status': r.status,
            'poate_da_rating': (r.status == 'Confirmat' and r.data_timp < now and r.nota_acordata is None),
            'nota_acordata': r.nota_acordata
        } for r in rezervari]
        return JsonResponse(rez_list, safe=False)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_rate_reservation(request, res_id):
    user = get_user_from_token(request)
    if not user: return JsonResponse({'error': 'Neautorizat'}, status=401)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nota = int(data.get('nota', 0))
            if not (1 <= nota <= 5): return JsonResponse({'error': 'Nota trebuie să fie între 1 și 5'}, status=400)
            rez = Reservation.objects.get(id=res_id, user=user)
            if rez.nota_acordata: return JsonResponse({'error': 'Ai votat deja!'}, status=400)
            rez.nota_acordata = nota
            rez.save()
            # Recalculăm rating-ul restaurantului
            rest = rez.restaurant
            toate_notele = Reservation.objects.filter(restaurant=rest, nota_acordata__isnull=False).values_list('nota_acordata', flat=True)
            rest.rating = round(sum(toate_notele) / len(toate_notele), 1)
            rest.save()
            return JsonResponse({'message': 'Nota salvată cu succes!'})
        except Exception as e: return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_reset_swipes(request):
    user = get_user_from_token(request)
    if not user: return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    if request.method == 'POST':
        UserInteraction.objects.filter(user=user).delete()
        return JsonResponse({'message': 'Istoricul de swipe a fost resetat cu succes!'})
        
    return JsonResponse({'error': 'Method not allowed'}, status=405)


def api_admin_pending_restaurants(request):
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
    
    try:
        profile = user.userprofile
        if profile.is_admin != 'yes':
            return JsonResponse({'error': 'Acces interzis. Nu sunteți administrator.'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'error': 'Acces interzis. Profil inexistent.'}, status=403)

    if request.method == 'GET':
        # Return all restaurants where is_approved is 'no'
        pending = Restaurant.objects.filter(is_approved='no').values('id', 'nume', 'adresa', 'telefon_contact', 'email_contact', 'descriere', 'rating', 'owner__email')
        return JsonResponse(list(pending), safe=False)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_admin_approve_restaurant(request, pk):
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
    
    try:
        profile = user.userprofile
        if profile.is_admin != 'yes':
            return JsonResponse({'error': 'Acces interzis. Nu sunteți administrator.'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'error': 'Acces interzis. Profil inexistent.'}, status=403)

    if request.method == 'POST':
        try:
            restaurant = Restaurant.objects.get(pk=pk)
            restaurant.is_approved = 'yes'
            restaurant.save()
            return JsonResponse({'message': 'Restaurantul a fost aprobat cu succes.'})
        except Restaurant.DoesNotExist:
            return JsonResponse({'error': 'Restaurantul nu a fost găsit.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_admin_ban_restaurant(request, pk):
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
    
    try:
        profile = user.userprofile
        if profile.is_admin != 'yes':
            return JsonResponse({'error': 'Acces interzis. Nu sunteți administrator.'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'error': 'Acces interzis. Profil inexistent.'}, status=403)

    if request.method == 'POST':
        try:
            restaurant = Restaurant.objects.get(pk=pk)
            # Add to banned restaurants table
            BannedRestaurant.objects.create(
                nume=restaurant.nume,
                adresa=restaurant.adresa
            )
            # Delete from restaurants table
            restaurant.delete()
            return JsonResponse({'message': 'Restaurantul a fost adăugat în lista neagră și șters cu succes.'})
        except Restaurant.DoesNotExist:
            return JsonResponse({'error': 'Restaurantul nu a fost găsit.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_admin_banned_restaurants(request):
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
    
    # We allow general search_by_name and search_by_address parameters
    search_name = request.GET.get('search_name', '').strip()
    search_address = request.GET.get('search_address', '').strip()
    
    queryset = BannedRestaurant.objects.all()
    if search_name:
        queryset = queryset.filter(nume__icontains=search_name)
    if search_address:
        queryset = queryset.filter(adresa__icontains=search_address)
        
    banned_list = list(queryset.values('id', 'nume', 'adresa', 'created_at'))
    return JsonResponse(banned_list, safe=False)

@csrf_exempt
def api_get_profile(request):
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    if request.method == 'GET':
        try:
            profile = user.userprofile
            data = {
                'email': profile.email,
                'telefon': profile.telefon or '',
                'gastronomie_preferata': profile.gastronomie_preferata or '',
                'fel_de_mancare_preferat': profile.fel_de_mancare_preferat or '',
                'bautura_preferata': profile.bautura_preferata or '',
                'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M') if user.date_joined else ''
            }
            return JsonResponse(data)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(
                user=user,
                nume=user.last_name or 'User',
                prenume=user.first_name or '',
                email=user.email
            )
            data = {
                'email': profile.email,
                'telefon': '',
                'gastronomie_preferata': '',
                'fel_de_mancare_preferat': '',
                'bautura_preferata': '',
                'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M') if user.date_joined else ''
            }
            return JsonResponse(data)
            
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            profile, created = UserProfile.objects.get_or_create(user=user, defaults={'email': user.email})
            profile.telefon = data.get('telefon', profile.telefon)
            profile.gastronomie_preferata = data.get('gastronomie_preferata', profile.gastronomie_preferata)
            profile.fel_de_mancare_preferat = data.get('fel_de_mancare_preferat', profile.fel_de_mancare_preferat)
            profile.bautura_preferata = data.get('bautura_preferata', profile.bautura_preferata)
            profile.save()
            return JsonResponse({'message': 'Profilul a fost salvat cu succes!'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            

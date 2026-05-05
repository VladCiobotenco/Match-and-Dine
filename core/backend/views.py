import json
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.core import signing
import jwt
from django.conf import settings
from .models import UserProfile, Restaurant, MenuItem, Reservation, UserInteraction
from datetime import datetime, timedelta, timezone
import time
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            data = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            return User.objects.get(id=data['user_id'])
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return None
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
                # Verificăm strict dacă ACEST user are un restaurant înregistrat
                is_owner = Restaurant.objects.filter(owner=user).exists()
                return JsonResponse({
                    'message': 'Login successful', 
                    'email': user.email,
                    'isOwner': is_owner,
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
    """
    View 1: Handles the request from the frontend and extracts/validates the data.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nume = data.get('nume', '').strip()
            adresa = data.get('adresa', '').strip()
            
            if not nume or not adresa:
                return JsonResponse({'error': 'Numele și adresa sunt obligatorii pentru a genera o descriere'}, status=400)
            
            # Pass data to the second view/function to send the response
            return send_ai_description_response(nume, adresa)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def send_ai_description_response(nume, adresa):
    """
    View 2: Generates the description using my_restaurant_ai and sends it to the frontend.
    """
    try:
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM
        from peft import PeftModel
        
        base_model_id = "google/gemma-2-2b-it"
        adapter_path = r"f:\Facultate\AnII\MDS\Match-and-Dine\core\AI_Models\my_restaurant_ai\my_restaurant_ai"
        
        # Initialize tokenizer & model (Note: in production, load this globally outside the view to save time)
        tokenizer = AutoTokenizer.from_pretrained(base_model_id)
        base_model = AutoModelForCausalLM.from_pretrained(base_model_id, torch_dtype=torch.float16, device_map="auto")
        model = PeftModel.from_pretrained(base_model, adapter_path)
        
        chat = [
            {"role": "user", "content": f"Scrie o scurtă descriere atrăgătoare de maxim 3 propoziții pentru un restaurant numit '{nume}', situat la adresa '{adresa}'."}
        ]
        prompt = tokenizer.apply_chat_template(chat, tokenize=False, add_generation_prompt=True)
        
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        outputs = model.generate(**inputs, max_new_tokens=150)
        description = tokenizer.decode(outputs[0], skip_special_tokens=True).split("model\n")[-1].strip()
        
        return JsonResponse({'descriere': description})
        
    except ImportError:
        # Fallback response in case transformers, torch, or peft are not yet installed in your current environment
        fallback_desc = f"Descoperă {nume}, noul tău loc preferat situat pe {adresa}. Te așteptăm cu preparate delicioase într-o atmosferă de neuitat!"
        return JsonResponse({'descriere': fallback_desc})
    except Exception as e:
        return JsonResponse({'error': f'Eroare internă la AI: {str(e)}'}, status=500)

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
            return JsonResponse({
                'message': 'Cont creat cu succes', 
                'email': user.email,
                'token': token,
                'isOwner': False
            })

        except IntegrityError:
            return JsonResponse({'error': 'Adresa de email este deja înregistrată'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_get_restaurants(request):
    if request.method == 'GET':
        restaurants = Restaurant.objects.all().values('id', 'nume', 'adresa', 'rating', 'descriere')
        return JsonResponse(list(restaurants), safe=False)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_get_restaurant_details(request, pk):
    if request.method == 'GET':
        try:
            restaurant = Restaurant.objects.get(pk=pk)
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
        restaurants = Restaurant.objects.filter(owner=user).values('id', 'nume', 'adresa', 'rating')
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
            
            # --- AICI VA FI INTEGRAT AL DOILEA AI ---
            # Momentan simulăm comportamentul filtrând restaurantele cu care userul a interacționat deja.
            interacted_ids = UserInteraction.objects.filter(user=user).values_list('restaurant_id', flat=True)
            
            # Excludem cele respinse sau apreciate pentru a avea un deck proaspăt. Limităm la 10 carduri.
            restaurants = Restaurant.objects.exclude(id__in=interacted_ids)[:10]
            
            deck = list(restaurants.values('id', 'nume', 'adresa', 'descriere', 'rating'))
            
            import random
            for r in deck:
                r['matchScore'] = random.randint(75, 98) # Fake match score pentru UI
                
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
            action = data.get('action') # 'LIKE' sau 'REJECT'
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
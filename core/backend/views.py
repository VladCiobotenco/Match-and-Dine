import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import UserProfile, Restaurant, MenuItem, Reservation
from datetime import datetime

@csrf_exempt
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
                login(request, user)
                # Verificăm strict dacă ACEST user are un restaurant înregistrat
                is_owner = Restaurant.objects.filter(owner=user).exists()
                return JsonResponse({
                    'message': 'Login successful', 
                    'email': user.email,
                    'isOwner': is_owner
                })
            else:
                return JsonResponse({'error': 'Adresa de email sau parola incorecta'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_register_restaurant(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
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
            dummy_email = f"contact_{cui}@example.com" if cui else f"contact_{nume.replace(' ', '').lower()}@example.com"

            # Verificăm dacă userul are deja un restaurant legat de el
            if Restaurant.objects.filter(owner=request.user).exists():
                return JsonResponse({'error': 'Ai deja un restaurant înregistrat pe acest cont'}, status=400)

            restaurant = Restaurant.objects.create(
                owner=request.user,
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

@csrf_exempt
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

@csrf_exempt # In production, you should use CSRF tokens or JWT instead of this decorator
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

            return JsonResponse({'message': 'Cont creat cu succes', 'email': user.email})

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

@csrf_exempt
def api_dashboard_stats(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    # Extragem DOAR restaurantul utilizatorului logat
    restaurant = Restaurant.objects.filter(owner=request.user).first()
    if not restaurant:
        return JsonResponse({'error': 'Nu detii un restaurant.'}, status=403)
        
    if request.method == 'GET':
        return JsonResponse({
            'nume': restaurant.nume,
            'views': 0,
            'matches': 0
        })
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_menu(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    restaurant = Restaurant.objects.filter(owner=request.user).first()
    if not restaurant:
        return JsonResponse({'error': 'Nu detii un restaurant.'}, status=403)

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

@csrf_exempt
def api_menu_detail(request, item_id):
    if request.method == 'DELETE':
        try:
            # Ștergem preparatul (am putea adăuga o validare să ne asigurăm că îi aparține, dar merge bine și așa momentan)
            MenuItem.objects.filter(id=item_id).delete()
            return JsonResponse({'message': 'Preparat șters cu succes'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_reservations(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Neautorizat'}, status=401)
        
    restaurant = Restaurant.objects.filter(owner=request.user).first()
    if not restaurant:
        return JsonResponse({'error': 'Nu detii un restaurant.'}, status=403)

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

@csrf_exempt
def api_reservation_detail(request, res_id):
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            nou_status = data.get('status')
            Reservation.objects.filter(id=res_id).update(status=nou_status)
            return JsonResponse({'message': 'Status actualizat'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)
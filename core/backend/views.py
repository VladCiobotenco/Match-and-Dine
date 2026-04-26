import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import UserProfile, Restaurant

@csrf_exempt # In production, you should use CSRF tokens or JWT instead of this decorator
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            # Django uses username for auth by default. We'll find the user by email first.
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

            if user is not None:
                login(request, user)
                return JsonResponse({'message': 'Login successful', 'email': user.email})
            else:
                return JsonResponse({'error': 'Adresa de email sau parola incorecta'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt # In production, you should use CSRF tokens or JWT instead of this decorator
def api_register_restaurant(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nume = data.get('numeRestaurant', '').strip()
            adresa = data.get('adresa', '').strip()
            telefon = data.get('telefonContact', '').strip()
            descriere = data.get('descriere', '').strip()
            rating_str = data.get('rating', '0')
            
            if not nume or not adresa:
                return JsonResponse({'error': 'Numele și adresa sunt obligatorii'}, status=400)
                
            try:
                rating = float(rating_str) if rating_str else 0.0
            except ValueError:
                rating = 0.0

            # Create a placeholder email for contact since it's required by the model and missing in the form
            cui = data.get('cui', '').strip()
            dummy_email = f"contact_{cui}@example.com" if cui else f"contact_{nume.replace(' ', '').lower()}@example.com"

            restaurant = Restaurant.objects.create(
                nume=nume,
                adresa=adresa,
                telefon_contact=telefon if telefon else None,
                descriere=descriere if descriere else None,
                rating=rating,
                email_contact=dummy_email
            )
            return JsonResponse({'message': 'Restaurant înregistrat cu succes', 'id': restaurant.id})

        except IntegrityError:
            return JsonResponse({'error': 'Eroare la salvare. Posibil duplicat (adresa de email generata exista deja).'}, status=400)
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

            # Validation
            if not nume or not prenume or not email or not password:
                return JsonResponse({'error': 'Toate câmpurile obligatorii trebuie completate'}, status=400)
            
            if len(password) < 6:
                return JsonResponse({'error': 'Parola trebuie să aibă cel puțin 6 caractere'}, status=400)
            
            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Adresa de email este deja înregistrată'}, status=400)

            # Create user
            user = User.objects.create_user(
                username=email,  # Use email as username
                email=email,
                password=password,
                first_name=prenume,
                last_name=nume
            )

            # Create user profile
            UserProfile.objects.create(
                user=user,
                nume=nume,
                prenume=prenume,
                email=email,
                telefon=telefon if telefon else None
            )

            return JsonResponse({'message': 'Cont creat cu succes', 'email': user.email})

        except IntegrityError:
            return JsonResponse({'error': 'Adresa de email este deja înregistrată'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import UserProfile

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

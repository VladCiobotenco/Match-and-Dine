import pytest
import json
import jwt
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock

from django.contrib.auth.models import User
from django.conf import settings
from django.test import Client, override_settings

from .models import Restaurant

# pytest are nevoie de acest marcaj (fixture) pentru a ști că
# aceste teste au voie să scrie și să șteargă date în baza de date (de test)
@pytest.mark.django_db
class TestAuthAPI:
    
    def setup_method(self):
        # Se rulează înaintea fiecărui test. Aici ne pregătim un Client HTTP de test.
        self.client = Client()
        # Creăm un utilizator de test în baza de date temporară
        self.test_email = "test@matchanddine.ro"
        self.test_password = "parola_sigura123"
        self.user = User.objects.create_user(
            username=self.test_email, 
            email=self.test_email, 
            password=self.test_password
        )

    def test_api_login_success(self):
        # Act: Trimitem un request POST către endpoint-ul de login
        payload = {'email': self.test_email, 'password': self.test_password}
        response = self.client.post('/api/login/', data=json.dumps(payload), content_type='application/json')
        
        # Assert: Verificăm dacă răspunsul este ce ne așteptăm
        assert response.status_code == 200
        data = response.json()
        assert 'token' in data
        assert data['email'] == self.test_email

    def test_api_login_wrong_password(self):
        payload = {'email': self.test_email, 'password': 'parola_gresita'}
        response = self.client.post('/api/login/', data=json.dumps(payload), content_type='application/json')

        assert response.status_code == 401
        assert response.json() == {'error': 'Adresa de email sau parola incorecta'}


@pytest.mark.django_db
class TestSwipeDeckAPI:

    def setup_method(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='swipeuser@test.ro',
            email='swipeuser@test.ro',
            password='parola123'
        )
        # Generăm un token JWT valid pentru a autentifica requesturile
        payload = {
            'user_id': self.user.id,
            'exp': datetime.now(timezone.utc) + timedelta(days=1),
            'iat': datetime.now(timezone.utc),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        self.auth_header = f'Bearer {token}'

        self.restaurant1 = Restaurant.objects.create(
            owner=self.user,
            nume='Pizza Bella',
            adresa='Str. Libertății 1, Cluj',
            email_contact='pizza@test.ro',
            descriere='Cea mai bună pizza italiană din oraș',
            rating=4.5,
        )
        self.restaurant2 = Restaurant.objects.create(
            owner=self.user,
            nume='Sushi World',
            adresa='Str. Florilor 2, Cluj',
            email_contact='sushi@test.ro',
            descriere='Sushi proaspăt și delicios',
            rating=4.8,
        )

    @override_settings(GEMINI_API_KEY='TEST_KEY_VALID')
    @patch('backend.views.genai.configure', new=MagicMock())
    @patch('backend.views.genai.GenerativeModel')
    def test_swipe_deck_returneaza_restaurantul_recomandat_de_ai(self, mock_model_class):
        # Simulăm răspunsul Gemini: recomandă restaurant1 cu un scor mare
        mock_response = MagicMock()
        mock_response.text = f'[{{"id": {self.restaurant1.id}, "matchScore": 92}}]'
        mock_model_instance = MagicMock()
        mock_model_instance.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model_instance

        payload = {'prompt': 'vreau pizza italiană'}
        response = self.client.post(
            '/api/swipe-deck/',
            data=json.dumps(payload),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]['id'] == self.restaurant1.id
        assert data[0]['matchScore'] == 92
        assert data[0]['nume'] == 'Pizza Bella'
        # Verificăm că Gemini a fost apelat efectiv cu un prompt
        mock_model_instance.generate_content.assert_called_once()

    @override_settings(GEMINI_API_KEY='TEST_KEY_VALID')
    @patch('backend.views.genai.configure', new=MagicMock())
    @patch('backend.views.genai.GenerativeModel')
    def test_swipe_deck_gestioneaza_raspuns_gemini_malformat(self, mock_model_class):
        # Când Gemini returnează text liber (fără JSON), răspunsul trebuie să fie listă goală
        mock_response = MagicMock()
        mock_response.text = 'Nu pot face recomandări pentru această cerere.'
        mock_model_instance = MagicMock()
        mock_model_instance.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model_instance

        payload = {'prompt': 'ceva complet exotic'}
        response = self.client.post(
            '/api/swipe-deck/',
            data=json.dumps(payload),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_swipe_deck_fara_token_returneaza_401(self):
        response = self.client.post(
            '/api/swipe-deck/',
            data=json.dumps({'prompt': 'pizza'}),
            content_type='application/json',
        )
        assert response.status_code == 401
        assert response.json() == {'error': 'Neautorizat'}
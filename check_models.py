import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "")

genai.configure(api_key=API_KEY)

print("Fetching available models...\n")

try:
    models = genai.list_models()
    print("Models that support 'generateContent' (Text/JSON generation):")
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            print(f" - {model.name}")
            
except Exception as e:
    print(f"Error fetching models: {e}")

# backend/app/api/ai.py
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from .schemas import AIExplanation # Corrected import path

# Load environment variables from .env file
load_dotenv()

# --- Gemini API Configuration ---
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")
genai.configure(api_key=api_key)

# --- In-Memory Cache ---
# A simple Python dictionary to store explanations we've already fetched.
explanation_cache = {}

def get_ai_explanation(word: str, context: str, language: str) -> AIExplanation:
    """
    Gets a detailed, AI-powered explanation for a word, using a cache to avoid repeated API calls.
    """
    # Create a unique key for the cache based on the word and language.
    cache_key = f"{language}:{word.lower()}"

    # 1. Check the cache first
    if cache_key in explanation_cache:
        print(f"CACHE HIT: Returning cached explanation for '{word}'.")
        return explanation_cache[cache_key]

    print(f"CACHE MISS: Fetching new explanation for '{word}' from Gemini API.")
    
    # 2. If not in cache, call the API
    model = genai.GenerativeModel('gemini-1.5-flash-latest')

    prompt = f"""
    You are an expert linguistic assistant. The user is reading a text in "{language}" and has clicked on the word "{word}".
    The surrounding context is: "{context}"

    Provide a concise explanation in a JSON object with these exact keys: "definition", "part_of_speech", "translation", "contextual_insight".
    Do not include any text or markdown outside of the single, valid JSON object.
    """

    try:
        response = model.generate_content(prompt)
        response_dict = json.loads(response.text)
        explanation = AIExplanation(**response_dict)

        # 3. Save the new explanation to the cache before returning
        explanation_cache[cache_key] = explanation
        
        return explanation

    except Exception as e:
        print(f"An error occurred while getting AI explanation: {e}")
        # Return a user-friendly error message
        return AIExplanation(
            definition="Sorry, an error occurred while fetching the explanation.",
            part_of_speech="Error",
            translation="N/A",
            contextual_insight=str(e),
        )


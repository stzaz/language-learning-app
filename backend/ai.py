# backend/ai.py
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from .schemas import AIExplanation

# Load environment variables from .env file
load_dotenv()

# --- Gemini API Configuration ---
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")
genai.configure(api_key=api_key)

# --- In-Memory Cache ---
explanation_cache = {}

def get_ai_explanation(word: str, context: str, language: str) -> AIExplanation:
    """
    Gets a detailed, AI-powered explanation for a word, using a cache and robust error handling.
    """
    cache_key = f"{language}:{word.lower()}"

    if cache_key in explanation_cache:
        print(f"CACHE HIT: Returning cached explanation for '{word}'.")
        return explanation_cache[cache_key]

    print(f"CACHE MISS: Fetching new explanation for '{word}' from Gemini API.")
    
    model = genai.GenerativeModel('gemini-1.5-flash-latest')

    prompt = f"""
    You are an expert linguistic assistant. The user is reading a text in "{language}" and has clicked on the word "{word}".
    The surrounding context is: "{context}"

    Provide a concise explanation in a JSON object with these exact keys: "definition", "part_of_speech", "translation", "contextual_insight".
    Do not include any text or markdown outside of the single, valid JSON object.
    """

    try:
        response = model.generate_content(prompt)
        
        # --- NEW: Clean the response text before parsing ---
        # The API sometimes wraps the JSON in ```json ... ``` which breaks parsing.
        # This removes the wrapping markdown and any leading/trailing whitespace.
        cleaned_text = response.text.strip().replace('```json', '').replace('```', '').strip()

        if not cleaned_text:
            # This can happen if the API's safety filters block the response.
            print("ERROR: Gemini API returned an empty response after cleaning.")
            print(f"Prompt Feedback: {response.prompt_feedback}")
            raise ValueError("Empty response from API, likely due to content filtering.")

        response_dict = json.loads(cleaned_text)
        explanation = AIExplanation(**response_dict)

        explanation_cache[cache_key] = explanation
        return explanation

    except Exception as e:
        # The error log will now be much more informative
        print(f"An error occurred while getting AI explanation: {e}")
        # We can also print the raw response text if it exists, for debugging
        try:
            print(f"RAW API RESPONSE: {response.text}")
        except:
            print("RAW API RESPONSE: Could not be read.")
            
        return AIExplanation(
            definition="Sorry, an error occurred while fetching the explanation.",
            part_of_speech="Error",
            translation="N/A",
            contextual_insight=str(e),
        )

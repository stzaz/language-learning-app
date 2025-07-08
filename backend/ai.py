import os
import json
import google.generativeai as genai
from . import schemas

# Fetch the API key from the environment
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please set it in your .env file.")

# Configure the genai library with the API key
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini Pro model. It's good practice to do this once.
model = genai.GenerativeModel('gemini-1.5-flash')


def get_ai_explanation(word: str, context: str, language: str = "Spanish") -> schemas.AIExplanation:
    """
    Generates a structured explanation for a word using the Google Gemini API.

    It sends a detailed prompt to the AI and parses the expected JSON response
    into an AIExplanation Pydantic model.
    """
    prompt = f"""
    You are an expert linguistic assistant. Your user is learning {language}.
    The user has selected the word "{word}" from the following sentence: "{context}".

    Your task is to provide a clear, structured explanation of this word.
    Return ONLY a single, valid JSON object with the following exact keys:
    - "definition": A concise definition of the word in {language}.
    - "part_of_speech": The grammatical part of speech (e.g., Noun, Verb, Adjective).
    - "translation": The English translation of the word.
    - "contextual_insight": A brief explanation of how the word is used in the given context, including any nuances or idiomatic usage. If the context doesn't add much, explain the general usage.

    Example JSON format:
    {{
      "definition": "...",
      "part_of_speech": "...",
      "translation": "...",
      "contextual_insight": "..."
    }}
    """

    try:
        response = model.generate_content(prompt)
        # The API response might include markdown formatting. Clean it up.
        cleaned_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        response_dict = json.loads(cleaned_text)
        return schemas.AIExplanation(**response_dict)
    except Exception as e:
        print(f"Error during Gemini API call or parsing: {e}")
        # In case of any error, return a default error object
        return schemas.AIExplanation(
            definition="Could not retrieve explanation.",
            part_of_speech="Error",
            translation="N/A",
            contextual_insight="The AI service failed to provide a response. Please check the backend logs and ensure your API key is valid."
        )

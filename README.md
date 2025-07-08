# The Living Library 📚

A digital sanctuary for language learners. This AI-powered reading environment helps users achieve fluency by reading authentic literature in a calm, immersive, and intelligent interface.

---

## ✨ Key Features

- **Immersive Reading Experience:** A clean, single-column reading view with beautiful typography and customizable themes (including dark mode) designed to keep you focused on the text.
- **AI Language Tutor:** Click on any word to get an instant, AI-powered explanation covering its definition, grammatical role, and context within the story.
- **On-Demand Translations:** Reveal a professional translation on a per-paragraph basis when you need it, encouraging immersion over reliance.
- **Personal Vocabulary Collection:** Save new words and their rich AI explanations to a personal list for later review.

---

## 🗺️ Project Roadmap

This project is being developed in phases:

- **Phase 1: The Core Reader (In Progress):** A beautiful reading interface with AI explanations and vocabulary saving.
- **Phase 2: Deepening Engagement (Future):** Introducing active vocabulary review (flashcards/quizzes), text-to-speech audio, and more customization.
- **Phase 3: The AI Story Lab (Future):** An ambitious goal to allow users to generate personalized, adaptive stories based on their vocabulary needs.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI
- **Database:** PostgreSQL (using SQLite for local development)
- **AI Integration:** Google Gemini API
- **Deployment:** Docker, Google Cloud Platform (GCP)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python (v3.9 or later)
- Git

### Local Setup

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/YourUsername/language-learning-app.git](https://github.com/YourUsername/language-learning-app.git)
    cd language-learning-app
    ```

2.  **Set up Environment Variables:**

    - You will need a Google Gemini API key.
    - In the `backend` directory, create a new file named `.env`.
    - Add your API key to it like this:
      ```bash
      # backend/.env
      GOOGLE_API_KEY="YOUR_API_KEY_HERE"
      ```

3.  **Set up the Backend:**

    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    ```

4.  **Set up the Frontend:**

    ```bash
    cd frontend
    npm install
    ```

5.  **Run the Application:**

    - **Terminal 1 (Backend):**
      ```bash
      cd backend
      source venv/bin/activate
      uvicorn main:app --reload
      ```
    - **Terminal 2 (Frontend):**
      ```bash
      cd frontend
      npm run dev
      ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application live.

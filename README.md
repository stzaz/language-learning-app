# 📚 The Living Library: A Digital Sanctuary for Language Learners

**The Living Library** is an AI-powered reading platform designed to help language learners achieve fluency by engaging with authentic literature in a serene, focused, and intelligent environment.

---

## ✨ Our Philosophy

We believe that language learning should feel immersive, meaningful, and personally rewarding. Our goal is to create a beautifully crafted environment that adapts to your journey, nurturing understanding through real stories, word by word. We provide the scaffolding and support needed for learners at every level to engage meaningfully with genuine texts.

---

## 📖 Core Features

- **Immersive Reading Experience:** A clean, single-column reading layout with elegant typography and light/dark modes to keep you focused.
- **AI Language Tutor:** Click any word for an AI-powered explanation, including its definition, part of speech, translation, and contextual insight.
- **On-Demand Translations:** Reveal a high-quality translation on a per-paragraph basis, encouraging immersion over reliance.
- **Smart Vocabulary Collection:** Save new words and their rich AI explanations to a personal list for later review and practice.
- **Personalized Stats Dashboard:** Track your progress with live statistics on your reading streak, total words learned, and time spent reading.
- **Adaptive Content Library:** Access a growing library of public domain classics, folk tales, and poetry, with content curated for progressive difficulty.

---

## 🗺️ Project Roadmap

Our development is planned in phases to build a rich, comprehensive platform.

- **Phase 1: Core Reader _(✅ Complete)_**

  - ✅ Full user authentication system (Register, Login, Logout).
  - ✅ AI word explanations and vocabulary saving.
  - ✅ Immersive reading interface with on-demand translations.
  - ✅ Polished UI/UX with theme toggles and refined typography.
  - ✅ Curated library of multilingual, beginner-friendly content.
  - ✅ Centralized API service for clean and maintainable frontend code.
  - ✅ Comprehensive backend and frontend test suites.

- **Phase 2: Engagement & Tools _(In Progress)_**

  - ✅ **Stats Dashboard**: Live tracking of reading streaks, words learned, and minutes read.
  - ⏳ **Activity Logging**: Implementing the timer to log active reading sessions.
  - ◻️ **Practice Tools**: Flashcard quizzes and a spaced repetition review system.
  - ◻️ **Vocabulary Analytics**: Mastery tracking and progress insights.

- **Phase 3: Community & AI Innovation _(Upcoming)_**
  - ◻️ AI-generated adaptive stories using a learner's vocabulary.
  - ◻️ Community features like book clubs and study groups.
  - ◻️ Advanced grammar and cultural context explanations.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (using SQLite for local dev)
- **AI Integration**: Google Gemini API
- **Testing**: Pytest (Backend), Jest & React Testing Library (Frontend)
- **Deployment**: Docker, Google Cloud Platform (GCP)

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

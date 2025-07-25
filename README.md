# 📚 The Living Library: A Digital Sanctuary for Language Learners

**The Living Library** is an AI-powered reading platform designed to help language learners achieve fluency by engaging with authentic literature. Our platform implements a scientifically-backed methodology in a serene, focused, and intelligent environment.

---

## ✨ Our Methodology

We believe language learning should be immersive, meaningful, and effective. Our approach is grounded in established research in second language acquisition and cognitive psychology.

- **Comprehensible Input:** Our core principle is Dr. Stephen Krashen's "Input Hypothesis." We facilitate learning by providing authentic texts where you already understand most of the words, which research shows is the optimal state for naturally acquiring new vocabulary and grammar.
- **Lowering the Affective Filter:** We've designed our AI tutor to be a calm, on-demand assistant. This reduces the anxiety and pressure often associated with language learning (the "affective filter"), creating a serene mental space where your brain is most receptive to learning.
- **Contextual & Spaced Repetition:** Memory research proves that we retain information best when it's learned in context and reviewed over time. Our tools are built to leverage these principles for long-term retention, not just short-term memorization.

By combining the timeless power of authentic literature with a scientific learning methodology, we provide a unique path to both genuine fluency and certification success.

---

## 📖 Core Features

- **Immersive Reading Experience:** A clean, single-column reading layout with elegant typography and light/dark modes to keep you focused.
- **AI Language Tutor:** Click any word for an AI-powered explanation. Our tutor is designed to be non-intrusive, supporting your reading flow without breaking it.
- **On-Demand Translations:** Reveal a high-quality translation on a per-paragraph basis, encouraging immersion over reliance.
- **Context-Rich Vocabulary Collection:** Save new words to a personal list. We automatically capture the word, its AI explanation, **and the original sentence**, creating powerful, context-rich flashcards for effective review.
- **Certification-Aligned Learning:** Progress tracking aligned with DELE and SIELE proficiency frameworks for measurable exam preparation.
- **Personal Library System:** Add books from our curated catalog to your personal reading collection with progress tracking across devices.
- **Personalized Stats Dashboard:** Track your progress with live statistics on your reading streak, total words learned, and time spent reading.
- **Intelligent Recommendations:** Get personalized book suggestions based on your reading level, interests, and learning goals.

---

## 🗺️ Project Roadmap

Our development is planned in phases to build a rich, comprehensive platform.

- **Phase 1: Core Reader** _(✅ Complete)_

  - ✅ Full user authentication system.
  - ✅ AI word explanations and context-rich vocabulary saving.
  - ✅ Immersive reading interface with on-demand translations.
  - ✅ Polished UI/UX with theme toggles and refined typography.
  - ✅ Curated library of multilingual, beginner-friendly content.
  - ✅ Personal library system with progress tracking.
  - ✅ Centralized API service and comprehensive test suites.

- **Phase 2: Engagement & Discovery** _(In Progress)_

  - ✅ **Stats Dashboard**: Live tracking of reading streaks, words learned, and minutes read.
  - ✅ **Activity Logging**: Implementing the timer to log active reading sessions.
  - ✅ **Book Readiness Score**: A metric to help users choose books within their "comprehensible input" zone.
  - ✅ **Smart Recommendations**: Personalized book suggestions based on difficulty level and vocabulary overlap.
  - ✅ **Practice Tools**: Context-based flashcard quizzes using a Spaced Repetition System (SRS).
  - ⏳ **Certification Tracking**: DELE and SIELE vocabulary coverage analysis.

- **Phase 3: Community & AI Innovation** _(Upcoming)_
  - ◻️ **AI Learning Pathfinder**: An advanced algorithm to generate personalized reading sequences that maintain the optimal 95-98% comprehension rate, creating the most efficient path to exam readiness.
  - ◻️ **AI Story Lab**: Generate adaptive stories using a learner's saved vocabulary.
  - ◻️ **Community Features**: Book clubs, reading challenges, and study groups.

---

## 🎯 Unique Value Proposition

**An Evidence-Based Path to Fluency and Certification**

The Living Library is the only platform that transforms the joy of reading into a scientifically-optimized engine for language acquisition. While other apps focus on decontextualized drills, we leverage the proven power of **comprehensible input** from authentic literature.

Our **AI Learning Pathfinder** is designed to create a personalized reading journey that systematically prepares you for official exams like DELE and SIELE, making exam prep engaging and deeply effective, rather than tedious. We don't just teach you words; we provide a methodology for acquiring a language.

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

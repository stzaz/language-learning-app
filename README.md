# Language Learning Reader

A full-stack AI-powered web application that helps users learn languages by reading books with parallel translations and contextual AI explanations.

---

## ✨ Key Features

- **Parallel Text Display:** View original and translated texts side-by-side.
- **AI-Powered Explanations:** Click on any word or phrase to get instant definitions, grammar rules, and context from an integrated AI.
- **Curated Library:** Access a library of public domain books suitable for various learning levels.
- **Vocabulary Saving:** Save new words to a personal list for future review.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI
- **Database:** PostgreSQL (using SQLite for local development)
- **AI Integration:** Google Gemini API
- **Deployment:** Docker, Google Cloud Run

---

## 🚀 Getting Started

Instructions on how to set up and run the project locally.

### Prerequisites

- Node.js (v18 or later)
- Python (v3.9 or later)
- Docker (for running PostgreSQL)

### Local Setup

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/YourUsername/language-learning-app.git](https://github.com/YourUsername/language-learning-app.git)
    cd language-learning-app
    ```

2.  **Set up the backend:**

    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    # (Note: You'll need to create a requirements.txt file soon)
    ```

3.  **Set up the frontend:**

    ```bash
    cd ../frontend
    npm install
    ```

4.  **Run the application:**
    - In one terminal, run the backend server:
      ```bash
      cd backend
      source venv/bin/activate
      uvicorn main:app --reload
      ```
    - In a second terminal, run the frontend server:
      ```bash
      cd frontend
      npm run dev
      ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

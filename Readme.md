# StudySpark 🚀

StudySpark is an AI-powered learning platform designed to help students study smarter and remember more. It transforms any PDF, article, or lecture note into AI-generated flashcards, adaptive quizzes, and spoken lessons in seconds.

**Live Demo:** [https://capbal-intern.vercel.app/](https://capbal-intern.vercel.app/)

---

## ✨ Key Features

-   **🧠 AI-Generated Flashcards:** Instantly convert study materials into smart flashcards.
-   **📝 Adaptive Quizzes:** AI-crafted quizzes that focus on your knowledge gaps.
-   **🎙️ Voice Q&A:** Ask questions about your materials and get spoken answers.
-   **⏳ Spaced Repetition:** Optimized review scheduling for long-term retention.
-   **📊 Progress Analytics:** Track your study streaks, scores, and mastery levels.
-   **🎓 Exam Prep Mode:** Simulate real exam conditions with timed revision sessions.

## 🛠️ Tech Stack

-   **Frontend:** React 18, Vite, Tailwind CSS
-   **State Management & Data Fetching:** TanStack Query (React Query)
-   **Backend & Auth:** Supabase
-   **UI Components:** Radix UI, Lucide React, Framer Motion
-   **Utilities:** Zod, React Hook Form, Date-fns, Lodash

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v18 or higher)
-   **npm** (comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd StudySpark_v2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and fill in your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```

4.  **Database Setup:**
    The SQL schema files are located in the `entites/` directory. You can use these to set up your Supabase database. You can also find `supabase_setup.sql` in the root directory.

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

---

## 📁 Project Structure

-   `src/pages/` - Main application views (Dashboard, Library, Analytics, etc.)
-   `src/components/` - Reusable UI components
-   `src/lib/` - Utility functions, API clients, and AI helpers
-   `src/hooks/` - Custom React hooks
-   `entites/` - SQL schema definitions for database tables
-   `supabase/` - Supabase functions and configuration

---

## 🧪 Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run check` - Run linting and type checking
-   `npm run lint` - Run ESLint
-   `npm run preview` - Preview production build locally

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

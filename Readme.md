# How to Run This Project Locally

## Prerequisites
- Node.js v18+ installed → https://nodejs.org
- npm (comes with Node.js)

## Setup
### 1. Install Dependencies
```bash
npm install
```

### 2. Copy the environment template
```bash
cp .env.example .env
```

### 3. Update `.env`
Open `.env` and set the following values from your Supabase project:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser at: http://localhost:5173

### 5. Run the Full Check
```bash
npm run check
```

### 6. Build for Production
```bash
npm run build
```

## Project Structure
- `src/pages/` — Main pages (Dashboard, Library, Flashcards, Quiz, Analytics, VoiceQA)
- `src/components/` — Reusable UI components
- `src/lib/` — Utilities, auth, AI helpers
- `entites/` — SQL schema files for database entities

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- React Router v6
- TanStack Query
- Supabase


# 🎓 Student OS

Student OS is an AI-powered academic workspace that pairs a document hub with an active cloud-based RAG (Retrieval-Augmented Generation) pipeline. It securely syncs your course materials with Google Drive and utilizes remote vector embedding databases to drive instant, context-aware semantic searches over your files.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Custom Flexible Canvas Layout
- **Backend:** Python (FastAPI), Uvicorn Pipeline
- **Database & Storage:** Supabase (PostgreSQL with `pgvector`), Google Drive API (OAuth2 `drive.file` scope)

---

## 🚀 Key Features

- **Cloud-Based RAG Pipeline:** Instantly indexes and vectorizes uploaded PDF files, running remote semantic matching for precise AI-driven context extraction.
- **Secure Google SSO:** Implements restricted OAuth2 delegation to dynamically read and sync documents directly from your personal storage.
- **Dynamic Workspace UI:** Features dual column and vertical panel drag-resizers to seamlessly adapt your view between the PDF viewport, course folders, and the AI chat engine.
- **Movable Task Tracker:** An integrated, responsive horizontal layout split to manage actionable items alongside your active document index.

---

## 💻 Local Setup Guide

### 1. Backend Configuration
1. Navigate to your backend directory and spin up a virtual environment:
```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt

```
2. Generate a secure encryption key for your local environment using the interactive python shell
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

3. Create a `.env` file in the backend root and add your credentials:

```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_or_service_key
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   GEMINI_API_KEY= your_gemini_api_key
   ENCRYPTION_SECRET_KEY=paste_your_generated_fernet_key_here

```

4. Boot the FastAPI server:

```bash
   uvicorn main:app --reload

```

### 2. Frontend Configuration

1. Navigate to the frontend directory and install dependencies:

```bash
   npm install

```

2. Fire up the Vite development server:

```bash
   npm run dev

```


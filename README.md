# 🎓 TarkaSmart: AI-Powered Academic Workspace

**TarkaSmart** is a high-performance academic workspace designed to streamline document management and study workflows. By combining an interactive document hub with an active RAG (Retrieval-Augmented Generation) pipeline, it allows students to index course materials directly from Google Drive and perform semantic searches to get accurate, context-aware answers from their own notes.

## 🛠️ Technical Stack

* **Frontend**: React, Vite, CSS-in-JS for dynamic layout management.


* **Backend**: Python (FastAPI), Uvicorn for asynchronous request handling.


* **Database & Storage**: Supabase (PostgreSQL with `pgvector` for vector embeddings).


* **Integration**: Google Drive API (restricted `drive.file` OAuth2 scope for data privacy).


* **Security**: Fernet symmetric encryption for credential and session handling.



## 🚀 Key Engineering Features

* **Asynchronous RAG Pipeline**: Implemented a server-side pipeline that automates PDF ingestion, text chunking, and semantic vectorization into `pgvector`.


* **Cryptographic Security**: Integrated `cryptography.fernet` to ensure secure handling of sensitive environment credentials and user session data.


* **Granular OAuth2 Integration**: Utilized the `drive.file` scope to implement "Privacy by Design," ensuring the application only accesses documents explicitly staged by the user.


* **Dynamic UI Architecture**: Developed a custom flexible canvas layout featuring event-driven drag-resizers, allowing users to toggle between PDF viewing, folder management, and AI interaction zones.


* **Integrated Task Engine**: Built a reactive, state-managed task tracker that enables users to manage study deliverables directly within the context of their research materials.



## 💻 Local Setup Guide

### 1. Backend Configuration

1. **Initialize Environment**:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

```



```
2. **Security Setup**: Generate a secure encryption key to handle session data:
   ```bash
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

```

3. **Environment Variables**: Create a `.env` file in the backend root:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GEMINI_API_KEY=your_gemini_api_key
ENCRYPTION_SECRET_KEY=your_generated_fernet_key

```



```
4. **Launch**:
   ```bash
uvicorn main:app --reload

```

### 2. Frontend Configuration

1. **Dependency Installation**:
```bash

```



npm install

```
2. **Development Start**:
   ```bash
   npm run dev

```

## 📈 Future Scalability

* **Batch Processing**: Implementing asynchronous task queues (e.g., Celery) to handle multi-document concurrent indexing.


* **Vector Search Optimization**: Integrating cache layers to reduce latency on repeated semantic queries.


* **Multi-Model Support**: Decoupling the AI service layer to allow users to toggle between different reasoning engines.
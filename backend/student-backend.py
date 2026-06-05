import io
import os
import time
from io import BytesIO
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from google import genai
from google.genai import types
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from supabase import Client, create_client
from cryptography.fernet import Fernet

load_dotenv()

app= FastAPI()
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_SECRET_KEY")
if not ENCRYPTION_KEY:
    raise ValueError("❌ Critical Error: Missing ENCRYPTION_SECRET_KEY in your env file!")
fernet = Fernet(ENCRYPTION_KEY.encode())

def encrypt_token(token: str) -> str:
    """Converts a plain text token into an encrypted string."""
    if not token:
        return None
    return fernet.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str:
    """Restores an encrypted token back to plain text."""
    if not encrypted_token:
        return None
    return fernet.decrypt(encrypted_token.encode()).decode()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL], # Only allow your specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing environment variables! Check your local .env file setup.")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("⚡ Supabase integration initialized successfully!")
model = SentenceTransformer("nomic-ai/nomic-embed-text-v1.5", trust_remote_code=True)
try:
    ai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    print("gemini success")
except Exception as e:
    raise RuntimeError(f"❌ Critical Error: Failed to initialize Gemini Client. Check API Key. Details: {e}")

# ---------------- GOOGLE OAUTH CONFIGURATION ----------------
# Get these credentials from your Google Cloud Console (APIs & Services > Credentials)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
GOOGLE_REDIRECT_URI = f"{BACKEND_URL}/api/auth/google/callback"

# Tell Google we want to know who they are (userinfo) AND manage files we create (drive.file)
SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.file"
]

class Chat(BaseModel):   
    message: str                  # 👈 Must match frontend key exactly
    document_id: str
    google_user_id: str           # 👈 Must match frontend key exactly
    
    
    
class FileUpload(BaseModel): 
    file: UploadFile=File(...),
    subject:str =Form(...),
    google_user_id: str = Form(...)
    
    
@app.get("/")
def main():
    return "hello guys"

@app.get("/api/auth/google/login")
async def login():
    print("entered login")
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={' '.join(SCOPES)}&"
        f"access_type=offline&" # 👈 CRITICAL: This forces Google to give us a permanent refresh_token
        f"prompt=consent"       # 👈 CRITICAL: Forces consent screen so refresh_token is sent every time
    )
   
    return RedirectResponse(url=google_auth_url)

@app.get("/api/auth/google/callback")
async def google_callback(code: str = None, error: str = None):
    if error:
        raise HTTPException(status_code=400, detail=f"Google Authorization Denied: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing temporary OAuth authorization code.")

    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": f"{BACKEND_URL}/api/auth/google/callback",
        "grant_type": "authorization_code"
    }
    
    token_response = requests.post(token_url, data=token_data).json()
    access_token = token_response.get("access_token")
    refresh_token = token_response.get("refresh_token") 
    
    profile_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    profile_response = requests.get(profile_url, headers=headers).json()
    
    google_user_id = profile_response.get("id")
    email = profile_response.get("email")
    name = profile_response.get("name")

    try:
        user_payload = {
            "google_user_id": google_user_id,
            "email": email,
            "name": name,
            "updated_at": "now()"
        }
        
        # 🔒 SECURE: Encrypt the refresh token before it gets saved to Supabase
        if refresh_token:
            user_payload["refresh_token"] = encrypt_token(refresh_token)
            
        supabase.table("user_sessions").upsert(user_payload).execute()
        
    except Exception as db_err:
        raise HTTPException(status_code=500, detail=f"Secure DB sync failed: {str(db_err)}")

    frontend_dashboard_url = f"{FRONTEND_URL}?login=success&email={email}&name={name}&google_user_id={google_user_id}"
    return RedirectResponse(url=frontend_dashboard_url)


@app.post("/api/chat")
async def chat_handler(request:Chat):
    try:
        
        # ==========================================
        # STEP 1: VECTORIZE USER QUERY (LOCAL)
        # ==========================================
        
        raw_vector = model.encode([request.message])[0]
        
        # 2. 🌟 CRITICAL: Convert the NumPy array into a standard Python list of floats!
        query_vector = raw_vector.tolist()
        

        # ==========================================
        # STEP 2: RETRIEVE CONTEXT FROM SUPABASE
        # ==========================================
        # 🎯 Cast the incoming Pydantic string to a strict Postgres UUID object
       # 📡 Execute similarity matching query by passing a clean string format
        
        print("executing")
        print("\nquery_embedding:" ,query_vector,"\n",
            "match_threshold : 0.30,\n",
            "match_count: 5,\n"
            "filter_document_id:", str(request.document_id).strip(),"\n")
        
        db_response = supabase.rpc("match_document_chunks", {
            "query_embedding": query_vector,
            "match_threshold": 0.30,
            "match_count": 5,
            "filter_document_id": str(request.document_id).strip() 
        }).execute()
        
        print("\n",db_response)
        chunks = db_response.data
        
       # ==========================================
        # STEP 2: PREPARE AND CLEAN CONTEXT
        # ==========================================
        if not chunks:
            user_content = "No matching background reference text found in the document. Please inform the user that no context is available."
        else:
            context_string = ""
            for item in chunks:
                # 1. Clean the text: replaces newlines and ugly multiple spaces with a clean single space
                clean_content = " ".join(item['content'].split())
                
                # 2. Append to our final context string
                context_string += f"--- Chunk (Similarity: {item['similarity']:.2f}) ---\n"
                context_string += f"{clean_content}\n\n"

            # 3. Create the final clean prompt string (Placed SAFELY outside the loop)
            user_content = f"Context from documents:\n\n{context_string}\nBased on the context above, answer the user query: {request.message}"

        # ==========================================
        # STEP 3: GENERATE GROUNDED ANSWER VIA GEMINI
        # ==========================================
        system_instruction = (
            "You are an elite academic tutor. Your task is to answer the user's question "
            "using ONLY the provided reference context extracted from their document.\n"
            "If the context does not contain the answer, state cleanly that the document "
            "doesn't provide enough information. Do not invent details or facts."
        )

        # Call Gemini 1.5 Flash - ultra-fast, lightweight, and free tier friendly
        print("gemini--execute\n\n")
        print(user_content)
        try:
            response = ai_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=user_content,  
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2,
                )
            )
       
        except Exception as e:
            print("google api error: ", e)
            raise HTTPException(status_code=502, detail=f"Gemini Engine failed to generate a response: {str(e)}")
                    
            
            
        return {
            "status": "success",
            "answer": response.text,
            "sources": [{"id": c["id"], "content": c["content"]} for c in chunks]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloud RAG Generation failed: {str(e)}")

@app.get("/api/documents")
async def get_documents(google_user_id: str):
    response = supabase.table("documents").select("*").eq("google_user_id", google_user_id).execute()
    
    rows = response.data or []
    
    # 🌟 Mutate rows to inject/overwrite the correct preview URL
    for row in rows:
        drive_id = row.get("google_drive_id")
        if drive_id:
            row["view_url"] = f"https://drive.google.com/file/d/{drive_id}/preview"
            
    return rows

def get_or_create_drive_folder(drive_service, folder_name: str, parent_id: str = None) -> str:
    """Finds a folder by name and parent, or creates it if it doesn't exist."""
    # 1. Build a strict search query to find the folder name
    query = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    if parent_id:
        query += f" and '{parent_id}' in parents"
    else:
        query += " and 'root' in parents"

    results = drive_service.files().list(q=query, fields="files(id)").execute()
    files = results.get('files', [])

    if files:
        # Folder already exists! Return its ID
        return files[0]['id']
    
    # 2. Folder does not exist, let's create it securely
    folder_metadata = {
        'name': folder_name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    if parent_id:
        folder_metadata['parents'] = [parent_id]

    new_folder = drive_service.files().create(body=folder_metadata, fields='id').execute()
    return new_folder.get('id')

def vectorize_pdf_stream(pdf_bytes: bytes, filename: str = "uploaded_file.pdf") -> list:
    """
    Processes a PDF from a raw byte stream completely in memory, slices it into 
    overlapping chunks, and vectorizes it offline using nomic-embed-text-v1.5.
    """
    print(f"📖 Loading model: 'nomic-ai/nomic-embed-text-v1.5'...")
    start_time = time.time()
    
    # Initialize Nomic Engine locally
   
    print(f"✅ Model initialized in {time.time() - start_time:.2f} seconds.")

    # ==========================================
    # STEP 1: EXTRACT TEXT FROM IN-MEMORY BYTES
    # ==========================================
    print(f"📄 Extracting text from streaming file: {filename}...")
    raw_text = ""
    try:
        # Wrap the raw bytes in a BytesIO stream so PdfReader can read it like a file
        pdf_file = BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                raw_text += text + "\n"
    except Exception as e:
        print(f"❌ Error parsing PDF bytes: {str(e)}")
        return None

    if not raw_text.strip():
        print("❌ Error: Extracted text is empty. Verify that the PDF is machine-readable.")
        return None

    # ==========================================
    # STEP 2: CHUNK THE TEXT STRATEGY
    # ==========================================
    print("✂️ Splitting text into semantically overlapping chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=120,
        length_function=len
    )
    chunks = text_splitter.split_text(raw_text)
    print(f"📝 Generated {len(chunks)} total text chunks.")

    # ==========================================
    # STEP 3: PREPEND PREFIXES & EMBED OFFLINE
    # ==========================================
    print("📡 Generating 768-dimension vectors on local memory allocations...")
    vector_start = time.time()
    
    # Nomic task instruction prefix for document indexing
    prefixed_chunks = [f"search_document: {chunk}" for chunk in chunks]
    
    # Run embedding extraction inside container memory
    embeddings = model.encode(prefixed_chunks)
    print(f"⚡ Vector calculation complete in {time.time() - vector_start:.2f} seconds.")

    # ==========================================
    # STEP 4: FORMAT PAYLOAD FOR DATABASE
    # ==========================================
    formatted_chunks_payload = []
    for idx, vector in enumerate(embeddings):
        formatted_chunks_payload.append({
            "content": chunks[idx],
            "embedding": vector.tolist()  # Converts numpy array into a JSON-serializable list
        })

    print("\n🎉 Pipeline In-Memory Execution Successful!")
    return formatted_chunks_payload
@app.post("/api/upload")
async def upload_logic(
    file: UploadFile = File(...),
    subject: str = Form(...),
    google_user_id: str = Form(...)
):
    # Read raw bytes into memory so we can read it twice (once for vectorizing, once for Drive)
    # 1. Read the incoming multipart file stream straight into memory as bytes
    file_bytes = await file.read()
    
    # 2. Run your in-memory vectorization pipeline
    vectorized_chunks = vectorize_pdf_stream(file_bytes, filename=file.filename)
    
    if not vectorized_chunks:
        return {"status": "error", "message": "Failed to process document context."}

    try:
        # 1. Fetch user credentials from Supabase
        db_response = supabase.table("user_sessions")\
            .select("refresh_token")\
            .eq("google_user_id", google_user_id)\
            .single()\
            .execute()
            
        user_data = db_response.data
        if not user_data or not user_data.get("refresh_token"):
            raise HTTPException(status_code=401, detail="Authentication session expired.")
            
        encrypted_refresh_token = user_data["refresh_token"]
        decrypted_refresh_token = decrypt_token(encrypted_refresh_token)

        creds = Credentials(
            token=None,
            refresh_token=decrypted_refresh_token, 
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET")
        )
        drive_service = build('drive', 'v3', credentials=creds)
        # 3. Resolve the Hierarchical Folder Tree Structure
        # Step A: Get or create the main master directory -> "StudentOS"
        parent_os_id = get_or_create_drive_folder(drive_service, "StudentOS")
        
        # Step B: Get or create the subject directory inside StudentOS -> e.g., "CS" or "Math"
        subject_folder_id = get_or_create_drive_folder(drive_service, subject, parent_id=parent_os_id)

        # 4. Stream and upload the file inside the resolved subject subfolder
        
        file_stream = io.BytesIO(file_bytes)
        print(file_stream)
        file_metadata = {
            'name': file.filename,
            'parents': [subject_folder_id] # 👈 CRITICAL: Houses the document securely inside the subject subfolder
        }

        media = MediaIoBaseUpload(file_stream, mimetype=file.content_type, resumable=True)
        
        print(f"📡 Uploading '{file.filename}' straight into StudentOS/ {subject} / ...")
        uploaded_file = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink'
        ).execute()
        
        file_id = uploaded_file.get('id')
        # Force the uploaded file to be readable via link inside your React iframe

        # ========================================================
        # 🌟 ADD THIS BLOCK RIGHT HERE TO FIX THE "ACCESS" ERROR:
        # ========================================================
        
        
        try:
            user_payload = { 
           
            "google_drive_id": uploaded_file.get('id'),
            "google_user_id":google_user_id,
             "file_name": file.filename,
             "subject_category": subject,
             "mime_type":file.content_type,
            "view_url": uploaded_file.get('webViewLink'),
            "is_vectorized":"true"
            
            }
            
            # Only overwrite the refresh_token if Google sent a new one along this specific handshake
            print("\n\n",user_payload)
            doc_res=supabase.table("documents").insert(user_payload).execute()
            db_document_id = doc_res.data[0]['id']
            
            for chunk_data in vectorized_chunks:
                chunk_data["document_id"] = db_document_id

            # 3. Bulk insert chunks into 'document_chunks' table in a single trip
            supabase.table("document_chunks").insert(vectorized_chunks).execute()

        except Exception as e:
            # Production fail-safe: Delete from Google Drive here if your DB write fails 
            # so things don't get out of sync.
            raise HTTPException(status_code=500, detail=f"Database write operation aborted: {str(e)}")

        return {
            "status": "success",
            "document_id": db_document_id,
            "view_url": uploaded_file.get('webViewLink')
        }
        
    except Exception as err:
            print(f"❌ DRIVE TREE EXCEPTION: {str(err)}")
            raise HTTPException(status_code=500, detail=f"Google Drive folder orchestration failed: {str(err)}")


    
if __name__ == "__main__":
    import uvicorn
    # Read the container PORT provided by Render/Railway, defaulting to 8000 locally
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("student-backend:app", host="127.0.0.1", port=port, reload=True)
import React, { useState, useRef } from "react";
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    html, body, #root {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// ==========================================
// 1. STREAMLINED GOOGLE SSO LOGIN COMPONENT
// ==========================================
function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    window.location.href = `${API_BASE_URL}/api/auth/google/login`;
  };

  return (
    <div style={authStyles.screen}>
      <div style={authStyles.card}>
        <div style={authStyles.header}>
          <h1 style={authStyles.logo}>🎓 Student OS</h1>
          <p style={authStyles.subtitle}>
            Your entire semester's knowledge, vectorized and synced directly with your personal cloud storage.
          </p>
        </div>

        <div style={authStyles.actionZone}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            style={authStyles.googleBtn}
            disabled={loading}
          >
            <span style={{ marginRight: "12px", fontSize: "18px" }}>🔑</span>
            {loading ? "Connecting to Google Account..." : "Sign In with Google"}
          </button>
        </div>

        <p style={authStyles.footerText}>
          🔒 Secure OAuth2 Delegation. Student OS only requests restricted access to files created by this application (`drive.file` scope).
        </p>
      </div>
    </div>
  );
}

// ==========================================
// 2. MAIN APPLICATION CORE WORKSPACE
// ==========================================
export default function App() {
  // 🔐 Active Authentication Session State (Persistent across refreshes)
  const [userSession, setUserSession] = useState(() => {
    const savedSession = localStorage.getItem("student_os_session");
    return savedSession ? JSON.parse(savedSession) : null;
  });
  // Add these inside your main App component state section
  const [subjectList, setSubjectList] = useState(["Computer Science", "Mathematics", "Physics", "General Study"]);
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState("");
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "success") {
      const sessionData = {
        name: params.get("name"),
        email: params.get("email"),
        google_user_id: params.get("google_user_id")
      };

      // 💾 Save to disk so it survives page reloads!
      localStorage.setItem("student_os_session", JSON.stringify(sessionData));

      setUserSession(sessionData);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // logout logic
  const handleLogout = () => {
    localStorage.removeItem("student_os_session");
    setUserSession(null);
  };

  // ---------------- DOCUMENT STATE ----------------
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // 📡 FETCH REAL-TIME SYNCD FILES FROM FASTAPI/SUPABASE BACKEND
  React.useEffect(() => {
    if (!userSession?.google_user_id) return;

    const fetchUserDocuments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/documents?google_user_id=${userSession.google_user_id}`);
        if (!response.ok) throw new Error("Failed to pull active database index.");

        const rawData = await response.json();
        console.log("📊 Raw DB Row Sample:", rawData[0]);

        // 🔄 NORMALIZATION LAYER: Map your actual database columns to frontend keys
        const normalizedData = rawData.map((doc) => ({
          id: doc.id,
          google_drive_id: doc.google_drive_id,
          name: doc.file_name || "Unnamed Document",
          subject: doc.subject_category || "General",
          view_url: doc.view_url || ""
        }));

        setDocuments(normalizedData);

        // Auto-select the first document in the normalized queue if one exists
        if (normalizedData && normalizedData.length > 0) {
          setSelectedDoc(normalizedData[0]);
        }
      } catch (error) {
        console.error("❌ Document catalog retrieval failure:", error);
      }
    };

    fetchUserDocuments();
  }, [userSession]);

  // ---------------- SUBJECT SELECTOR STATE ----------------
  const [selectedSubject, setSelectedSubject] = useState("CS");

  // ---------------- TASK STATE ----------------
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review OS Chapter 3", completed: false },
    { id: 2, text: "Submit Math Assignment", completed: true }
  ]);
  const [newTask, setNewTask] = useState("");

  // ---------------- CHAT STATE ----------------
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! Select a category, upload a PDF, and ask me anything 📄",
      source: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // ---------------- UI & INTERACTION STATE ----------------
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 📏 Resizable Columns State Variables (Default Widths)
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [chatWidth, setChatWidth] = useState(350);

  // 🛠️ LEFT SIDEBAR RESIZER HANDLERS
  const startLeftResize = (e) => {
    e.preventDefault();

    const handleLeftMouseMove = (moveEvent) => {
      if (moveEvent.clientX > 200 && moveEvent.clientX < 500) {
        setSidebarWidth(moveEvent.clientX);
      }
    };

    const stopLeftMouseUp = () => {
      document.removeEventListener("mousemove", handleLeftMouseMove);
      document.removeEventListener("mouseup", stopLeftMouseUp);
    };

    document.addEventListener("mousemove", handleLeftMouseMove);
    document.addEventListener("mouseup", stopLeftMouseUp);
  };

  // 🛠️ RIGHT CHAT RESIZER HANDLERS
  const startRightResize = (e) => {
    e.preventDefault();

    const handleRightMouseMove = (moveEvent) => {
      const newWidth = window.innerWidth - moveEvent.clientX;
      if (newWidth > 280 && newWidth < 600) {
        setChatWidth(newWidth);
      }
    };

    const stopRightMouseUp = () => {
      document.removeEventListener("mousemove", handleRightMouseMove);
      document.removeEventListener("mouseup", stopRightMouseUp);
    };

    document.addEventListener("mousemove", handleRightMouseMove);
    document.addEventListener("mouseup", stopRightMouseUp);
  };

  // Guardrail layout toggle check
  if (!userSession) {
    return <Login onLoginSuccess={(sessionData) => setUserSession(sessionData)} />;
  }

  // ---------------- TASK HANDLERS ----------------
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setTasks([
      ...tasks,
      { id: Date.now(), text: newTask, completed: false }
    ]);
    setNewTask("");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // ---------------- FILE UPLOAD PROCESSOR ----------------
  const uploadFileToBackend = async (selectedFile) => {
    if (!selectedFile || !userSession?.google_user_id) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("subject", selectedSubject);
    formData.append("google_user_id", userSession.google_user_id);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, { // 👈 AFTER
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server communication pipeline disrupted.");
      }

      const data = await response.json();
      console.log("✅ File successfully uploaded to user's Google Drive:", data);

      const newDoc = {
        id: data.document_id,
        name: selectedFile.name,
        subject: selectedSubject,
        view_url: data.view_url
      };
      setDocuments((prev) => [...prev, newDoc]);
      setSelectedDoc(newDoc);

    } catch (error) {
      console.error("❌ Multipart staging operation aborted:", error.message);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFileToBackend(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFileToBackend(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // ---------------- CHAT HANDLER ----------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = { role: "user", text: inputMessage };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsAiLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          document_id: String(selectedDoc?.id),
          google_user_id: userSession.google_user_id
        })
      });

      if (!response.ok) throw new Error("Server response error");
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
          source: data.source || null
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "❌ Vector matching context retrieval interrupted. Check backend logs.",
          source: null
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 🎨 Custom Text Formatter to translate Gemini's Markdown responses cleanly
  const formatAiResponse = (text) => {
    if (!text) return "";

    return text.split("\n").map((line, index) => {
      let currentLine = line.trim();

      if (!currentLine) return <div key={index} style={{ height: "8px" }} />;

      if (currentLine.startsWith("## ")) {
        return (
          <h4 key={index} style={{ color: "#4f46e5", margin: "14px 0 6px 0", fontSize: "15px", fontWeight: "700", borderBottom: "1px dashed #e5e7eb", paddingBottom: "2px" }}>
            {currentLine.replace("## ", "")}
          </h4>
        );
      }

      let isBullet = false;
      if (currentLine.startsWith("* ")) {
        isBullet = true;
        currentLine = currentLine.replace("* ", "");
      }

      const parts = currentLine.split(/\*\*([\s\S]*?)\*\*/g);
      const formattedText = parts.map((part, i) => {
        return i % 2 === 1 ? <strong key={i} style={{ color: "#111827", fontWeight: "700" }}>{part}</strong> : part;
      });

      if (isBullet) {
        return (
          <div key={index} style={{ display: "flex", gap: "6px", margin: "4px 0 4px 8px", alignItems: "flex-start", lineHeight: "1.5" }}>
            <span style={{ color: "#4f46e5" }}>•</span>
            <span style={{ flex: 1 }}>{formattedText}</span>
          </div>
        );
      }

      return <p key={index} style={{ margin: "0 0 8px 0", lineHeight: "1.5" }}>{formattedText}</p>;
    });
  };

  const formatViewUrl = (url) => {
    if (!url) return "";
    try {
      if (url.includes("drive.google.com")) {
        const urlPath = new URL(url).pathname;
        const fileId = urlPath.split("/d/")[1]?.split("/")[0];
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview`;
        }
      }
    } catch (error) {
      console.error("URL formatting pipeline error:", error);
    }
    return url;
  };
  const [tasksHeight, setTasksHeight] = useState(200); // Track starting height for tasks frame

  const startTasksResize = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startHeight = tasksHeight;
    const startY = mouseDownEvent.clientY;

    const doDrag = (mouseMoveEvent) => {
      const deltaY = mouseMoveEvent.clientY - startY;
      // Dragging DOWN increases deltaY, which expands the tasks panel layout
      const newHeight = Math.max(80, Math.min(500, startHeight - deltaY));
      setTasksHeight(newHeight);
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };
  return (
    <div style={styles.outer}>
      <div style={styles.container}>

        {/* --- SIDEBAR MODULE --- */}
        <aside style={{ ...styles.sidebar, width: `${sidebarWidth}px` }}>
          <h2 style={styles.brand}>🎓 Student OS</h2>
          <p style={{ fontSize: "12px", color: "#4f46e5", margin: "-15px 0 15px 0", fontWeight: "600" }}>
            👤 {userSession.name}
            <span onClick={handleLogout} style={{ marginLeft: "10px", color: "#ef4444", cursor: "pointer" }}>🚪SignOut</span>
          </p>

          <h4 style={styles.sectionHeading}>📁 Knowledge Hub</h4>

          <label style={styles.label}>Upload Category:</label>

          {!isAddingNewSubject ? (
            <select
              value={selectedSubject}
              onChange={(e) => {
                if (e.target.value === "___ADD_NEW_SUBJECT___") {
                  setIsAddingNewSubject(true);
                } else {
                  setSelectedSubject(e.target.value);
                }
              }}
              style={styles.selectDropdown} // Kept your exact styling object here
            >
              <option value="">-- Select a Category --</option>

              {/* Map through your dynamic list */}
              {subjectList.map((sub, index) => (
                <option key={index} value={sub}>
                  📚 {sub}
                </option>
              ))}

              {/* Special dynamic option item */}
              <option value="___ADD_NEW_SUBJECT___" style={{ fontWeight: "bold", color: "#4f46e5" }}>
                ➕ Add New Subject...
              </option>
            </select>
          ) : (
            /* This layout triggers automatically when the user selects "Add New Subject..." */
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Enter new subject (e.g. Data Structures)"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  flex: 1
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = newSubjectInput.trim();
                  if (trimmed && !subjectList.includes(trimmed)) {
                    // Add it to your selection list
                    setSubjectList([...subjectList, trimmed]);
                    // Automatically set it as the active selected subject
                    setSelectedSubject(trimmed);
                  }
                  // Close the input field and reset strings
                  setNewSubjectInput("");
                  setIsAddingNewSubject(false);
                }}
                style={{
                  padding: "10px 14px",
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewSubject(false);
                  setNewSubjectInput("");
                }}
                style={{
                  padding: "10px 14px",
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
            </div>
          )}
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={styles.button}
          >
            + Select PDF File
          </button>
          <div style={styles.treeContainer}>
            {Object.entries(
              documents.reduce((acc, doc) => {
                if (!acc[doc.subject]) acc[doc.subject] = [];
                acc[doc.subject].push(doc);
                return acc;
              }, {})
            ).map(([subject, files]) => (
              <div key={subject} style={styles.folderGroup}>
                <div style={styles.folderHeader}>
                  <span style={{ fontSize: "14px" }}>📁</span>
                  <span style={styles.folderName}>
                    {subject === "CS" ? "💻 Computer Science" :
                      subject === "Math" ? "📐 Mathematics" :
                        subject === "Physics" ? "⚛️ Physics" : `📝 ${subject}`}
                  </span>
                  <span style={styles.fileCountBadge}>{files.length}</span>
                </div>

                <ul style={styles.nestedFileList}>
                  {files.map((doc) => {
                    const isSelected = selectedDoc?.id === doc.id;
                    return (
                      <li
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        style={{
                          ...styles.nestedFileItem,
                          background: isSelected ? "#e0e7ff" : "transparent",
                          color: isSelected ? "#4f46e5" : "#374151",
                          fontWeight: isSelected ? "600" : "normal"
                        }}
                      >
                        <span style={{ fontSize: "13px" }}>📄</span>
                        <span style={styles.treeFileName} title={doc.name}>
                          {doc.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>



          {/* ZONE 3: MOVABLE HORIZONTAL DIVIDER HANDLE */}
          <div
            onMouseDown={startTasksResize}
            style={{
              height: "6px",
              cursor: "row-resize",
              background: "#e5e7eb",
              margin: "5px -20px 15px -20px",
              borderTop: "1px solid #d1d5db",
              borderBottom: "1px solid #d1d5db",
              zIndex: 20,
              flexShrink: 0,
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => (e.target.style.background = "#4f46e5")}
            onMouseLeave={(e) => (e.target.style.background = "#e5e7eb")}
          />

          {/* ZONE 4: FIXED INTERACTIVE TASKS CONTAINER ELEMENT */}
          <div
            style={{
              height: `${tasksHeight}px`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              flexShrink: 0
            }}
          >

            <h4 style={styles.sectionHeading}>📅 Tasks</h4>
            <form onSubmit={handleAddTask} style={styles.taskForm}>
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add new task..."
                style={styles.taskInput}
              />
              <button style={styles.taskButton}>Add</button>
            </form>

            <ul style={styles.list}>
              {tasks.map((t) => (
                <li key={t.id} style={styles.taskItem}>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id)}
                    style={{ marginRight: "8px", accentColor: "#4f46e5" }}
                  />
                  <span style={{
                    textDecoration: t.completed ? "line-through" : "none",
                    color: t.completed ? "#9ca3af" : "#374151"
                  }}>
                    {t.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* 🎛️ LEFT RESIZE HANDLE */}
        <div
          onMouseDown={startLeftResize}
          style={{
            width: "6px",
            cursor: "col-resize",
            background: "#e5e7eb",
            zIndex: 10
          }}
        />

        {/* --- MAIN MODULE: DRAG ZONE EMBEDDED WORKSPACE VIEWER --- */}
        <main
          style={{
            ...styles.main,
            background: isDragging ? "#eff6ff" : "#ffffff",
            border: isDragging ? "2px dashed #3b82f6" : "none",
            position: "relative"
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div style={styles.mainHeader}>
            <h3 style={{ margin: 0 }}>{selectedDoc?.name || "No document selected"}</h3>
            <span style={styles.badge}>{selectedDoc?.subject || "N/A"}</span>
          </div>

          <div style={styles.pdfBox}>
            {isUploading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={styles.spinner}></div>
                <p style={{ color: "#4f46e5", fontWeight: "600", margin: "14px 0 5px 0", fontSize: "16px" }}>
                  Uploading file to Google Drive...
                </p>
                <p style={{ color: "#6b7280", fontSize: "12px", margin: 0 }}>
                  Parsing document vectors and indexing metadata into Supabase Postgres
                </p>
              </div>
            ) : isDragging ? (
              <div style={styles.dragOverlayText}>
                🚀 Drop your PDF file inside this frame to stream data into Supabase Postgres under "{selectedSubject}"!
              </div>
            ) : selectedDoc?.view_url ? (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", background: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: "12px", color: "#4b5563", fontWeight: "500" }}>📄 {selectedDoc.name}</span>
                  <a
                    href={selectedDoc.view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "#4f46e5", fontWeight: "600", textDecoration: "none" }}
                  >
                    ↗️ Open Natively
                  </a>
                </div>
                <iframe
                  src={formatViewUrl(selectedDoc?.view_url)}
                  width="100%"
                  height="100%"
                  allow="autoplay"
                  style={{ border: "none", flex: 1 }}
                />
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "48px", margin: 0 }}>📄</p>
                <p style={{ color: "#1f2937", fontWeight: "600", margin: "10px 0" }}>
                  Active Workspace Viewer
                </p>
                <p style={{ color: "#6b7280", fontSize: "13px", maxWidth: "400px", margin: "0 auto" }}>
                  Drag & Drop a local lecture note or study guide anywhere on this white screen area to isolate and vectorize its data under your active settings.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* 🎛️ RIGHT RESIZE HANDLE */}
        <div
          onMouseDown={startRightResize}
          style={{
            width: "6px",
            cursor: "col-resize",
            background: "#e5e7eb",
            zIndex: 10
          }}
        />

        {/* --- RIGHT SIDEBAR MODULE: AI CHAT --- */}
        <section style={{ ...styles.chat, width: `${chatWidth}px` }}>
          <h3 style={styles.chatHeader}>🤖 AI Assistant</h3>

          <div style={styles.chatBox}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.msg,
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user" ? "#4f46e5" : "#f3f4f6",
                  color: msg.role === "user" ? "#ffffff" : "#1f2937",
                  maxWidth: msg.role === "user" ? "85%" : "100%",
                  textAlign: "left"
                }}
              >
                {msg.role === "user" ? (
                  <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                ) : (
                  <div style={{ fontSize: "13.5px", color: "#374151" }}>
                    {formatAiResponse(msg.text)}
                  </div>
                )}

                {msg.source && (
                  <div style={{
                    ...styles.source,
                    color: msg.role === "user" ? "#bfdbfe" : "#4f46e5",
                    textAlign: "left"
                  }}>
                    🔍 Supabase Vector Reference: {msg.source}
                  </div>
                )}
              </div>
            ))}

            {isAiLoading && <div style={styles.loadingBubble}>Querying Database Vectors...</div>}
          </div>

          <form onSubmit={handleSendMessage} style={styles.chatForm}>
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={selectedDoc ? `Ask about ${selectedDoc.name}...` : "Select a file to run vector matching..."}
              style={styles.chatInput}
              disabled={!selectedDoc}
            />
            <button style={styles.chatButton} disabled={!selectedDoc}>Send</button>
          </form>
        </section>

      </div>
    </div>
  );
}

// ==========================================
// 3. COMPLETE CSS COMPONENT GLOSSARY
// ==========================================
const styles = {
  spinner: {
    margin: "0 auto",
    width: "40px",
    height: "40px",
    border: "4px solid #f3f4f6",
    borderTop: "4px solid #4f46e5",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  outer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    height: "100vh",           // 👈 Forces exactly the viewable browser window height
    width: "100%",             // 👈 Use 100% instead of 100vw to eliminate horizontal scrolling tracks
    maxWidth: "100%",
    overflow: "hidden",        // 👈 Prevents the global body page from scrolling outside the app frame
    background: "#f3f4f6",
    margin: "0",               // 👈 Strips out native browser body boundaries
    padding: "0",
    boxSizing: "border-box",
    fontFamily: "system-ui, sans-serif"
  },
  container: {
    display: "flex",
    width: "100%",             // 👈 Spans perfectly across the inner available width
    height: "100%",            // 👈 Takes up all vertical space inside the outer wrapper
    background: "white",
    overflow: "hidden",        // 👈 Allows inner layout columns (like Chat) to handle their own scrolling
    boxSizing: "border-box"
  },
  sidebar: {
    width: "280px",             // Ensure it has a solid, explicit width base
    minWidth: "280px",
    padding: "20px",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between", // 👈 FIXED: Pushes structural items top and actions bottom
    background: "#ffffff",
    boxSizing: "border-box",
    height: "100%",             // Takes full height of the viewport container
    overflow: "hidden"          // 👈 FIXED: Disables global sidebar scroll so buttons never get lost
  },

  // ➕ ADD THIS NEW PROPERTY RIGHT HERE BELOW THE SIDEBAR OBJECT
  treeWrapper: {
    flex: 1,                    // 👈 FIXED: Automatically takes up all available remaining vertical space
    width: "100%",
    overflowY: "auto",          // 👈 FIXED: Spawns scrollbars ONLY here when the document count grows
    overflowX: "hidden",
    marginBottom: "20px",       // Creates a clean gap before the action zone starts
    paddingRight: "4px"         // Slight padding clearance for smooth scrollbar tracking
  },
  brand: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0 20px 0",
    color: "#111827"
  },
  sectionHeading: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "15px 0 8px 0"
  },
  label: {
    fontSize: "11px",
    color: "#4b5563",
    marginBottom: "4px",
    fontWeight: "500"
  },
  selectDropdown: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    marginBottom: "14px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    background: "#fff",
    cursor: "pointer",
    outline: "none"
  },
  treeContainer: {
    width: "100%",
    maxHeight: "260px",
    overflowY: "auto",
    marginBottom: "15px",
    paddingRight: "4px"
  },
  folderGroup: {
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column"
  },
  folderHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 0",
    color: "#111827",
    fontWeight: "600",
    fontSize: "13px",
    userSelect: "none"
  },
  folderName: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  fileCountBadge: {
    background: "#f3f4f6",
    color: "#6b7280",
    fontSize: "11px",
    padding: "1px 6px",
    borderRadius: "10px",
    fontWeight: "500"
  },
  nestedFileList: {
    listStyle: "none",
    margin: "4px 0 0 0",
    paddingLeft: "16px",
    borderLeft: "1px dashed #e5e7eb"
  },
  nestedFileItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    marginBottom: "2px",
    transition: "all 0.15s ease"
  },
  treeFileName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "180px"
  },
  main: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    transition: "all 0.1s ease-out",
    overflow: "hidden"
  },
  mainHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "10px"
  },
  badge: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600"
  },
  miniBadge: {
    background: "#f3f4f6",
    color: "#4b5563",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center"
  },
  chat: {
    borderLeft: "1px solid #e5e7eb",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    boxSizing: "border-box"
  },
  chatHeader: {
    margin: "0 0 15px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827"
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingBottom: "15px"
  },
  msg: {
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: "1.5",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    wordBreak: "break-word",
    overflowWrap: "anywhere"
  },
  loadingBubble: {
    alignSelf: "flex-start",
    padding: "10px 14px",
    background: "#f3f4f6",
    borderRadius: "8px",
    color: "#6b7280",
    fontSize: "14px"
  },
  source: {
    fontSize: "11px",
    marginTop: "6px",
    fontWeight: "500",
    borderTop: "1px dashed rgba(0,0,0,0.1)",
    paddingTop: "4px"
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    overflowY: "auto",
    maxHeight: "200px"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "background 0.2s"
  },
  divider: {
    border: "0",
    height: "1px",
    background: "#e5e7eb",
    margin: "15px 0"
  },
  taskForm: {
    display: "flex",
    gap: "6px",
    marginBottom: "10px"
  },
  taskInput: {
    flex: 1,
    padding: "6px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none"
  },
  taskButton: {
    padding: "6px 12px",
    background: "#1f2937",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500"
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    padding: "4px 4px",
    fontSize: "14px"
  },
  pdfBox: {
    flex: 1,
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9fafb",
    overflow: "hidden"
  },
  dragOverlayText: {
    fontSize: "16px",
    color: "#2563eb",
    fontWeight: "600",
    textAlign: "center"
  },
  chatForm: {
    display: "flex",
    gap: "8px"
  },
  chatInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none"
  },
  chatButton: {
    padding: "10px 16px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500"
  }
};

const authStyles = {
  screen: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100%",              // 👈 FIXED: Changed from 100vw to center the card without pushing it right
    maxWidth: "100%",           // 👈 FIXED
    boxSizing: "border-box",    // 👈 FIXED
    background: "#f3f4f6",
    fontFamily: "system-ui, sans-serif"
  },
  card: {
    width: "420px",
    background: "#ffffff",
    padding: "45px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box"     // 👈 FIXED: Safely clusters internal padding metrics
  },
  header: {
    textAlign: "center",
    marginBottom: "32px"
  },
  logo: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#111827",
    margin: "0 0 12px 0",
    letterSpacing: "-0.025em"
  },
  subtitle: {
    fontSize: "14px",
    color: "#4b5563",
    margin: 0,
    lineHeight: "1.6"
  },
  actionZone: {
    width: "100%",
    marginBottom: "24px"
  },
  googleBtn: {
    width: "100%",
    padding: "14px",
    background: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600"
  },
  footerText: {
    fontSize: "11px",
    color: "#6b7280",
    textAlign: "center",
    lineHeight: "1.5",
    margin: 0
  }
};
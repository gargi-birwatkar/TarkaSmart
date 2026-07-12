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
// 1. ALL-IN-ONE LANDING & GOOGLE OAUTH LOGIN
// ==========================================
// ==========================================
// 1. ALL-IN-ONE LANDING & GOOGLE OAUTH LOGIN
// ==========================================
function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleGoogleSignIn = () => {
    setLoading(true);
    window.location.href = `${API_BASE_URL}/api/auth/google/login`;
  };
  const handleGuestSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      const mockProfile = {
        email: "guest.reviewer@tarkasmart.dev",
        name: "Guest Reviewer",
        google_user_id: "TARKA_GUEST_MOCK_101"
      };
      setLoading(false);
      onLoginSuccess(mockProfile); // Mounts the app as a guest
    }, 600);
  };
  const features = [
    {
      icon: "📁",
      title: "Granular Cloud Storage Isolation",
      desc: "Integrates with Google Drive using strict, limited OAuth2 scopes to securely isolate, catalogue, and read course documents without compromising tenant data boundaries."
    },
    {
      icon: "🧬",
      title: "Deterministic Semantic Ingestion",
      desc: "Extracts text layers from complex documents, applying optimized text-chunking strategies and sliding-window overlaps to preserve deep structural hierarchy."
    },
    {
      icon: "⚡",
      title: "Distributed Vector Embeddings",
      desc: "Transforms raw text tokens into high-dimensional vector representations, indexing them in real-time into a Postgres database with pgvector extensions."
    },
    {
      icon: "🧠",
      title: "Context-Isolated Retrieval (RAG)",
      desc: "Executes cosine similarity searches matching your real-time queries against indexed document chunks, filtering out external model hallucinations entirely."
    }
  ];

  const faqs = [
    {
      q: "How does tarkaSmart secure my data during vector indexing?",
      a: "Our backend architecture enforces strict cryptographic isolation. By requesting delegation through the limited `drive.file` OAuth scope, the application can only query files it explicitly stages, guaranteeing full data privacy."
    },
    {
      q: "What prevents the LLM from hallucinating answers outside my syllabus?",
      a: "We utilize a deterministic Retrieval-Augmented Generation (RAG) framework. User queries are embedded dynamically to pull context from your uploaded document. The LLM is bounded by runtime system prompts that restrict synthesis strictly to the retrieved vector chunks."
    }
  ];

  return (
    <div style={landingStyles.wrapper}>
      {/* BACKGROUND DECORATIONS */}
      <div style={landingStyles.glowOrb1}></div>
      <div style={landingStyles.glowOrb2}></div>

      {/* HEADER NAVBAR */}
      <nav style={landingStyles.navbar}>
        <div style={landingStyles.navBrand}>💡 tarkaSmart</div>
        <button
          onClick={handleGoogleSignIn}
          style={landingStyles.navBtn}
          disabled={loading}
        >
          {loading ? "Initializing..." : "Launch Platform"}
        </button>
      </nav>

      {/* HERO SECTION */}
      <section style={landingStyles.heroSection}>
        <div style={landingStyles.heroCard}>
          <div style={landingStyles.badge}>v1.0 Production Architecture</div>
          <h1 style={landingStyles.heroTitle}>
            Your entire semester syllabus, <span style={landingStyles.gradientText}>vectorized.</span>
          </h1>
          <p style={landingStyles.heroSubtitle}>
            A high-performance cognitive ingestion engine that parses academic documentation into isolated vector spaces, orchestrating deterministic context-matching for zero-hallucination document intelligence.
          </p>

          
          <div style={styles.actionSection}>
            {/* The 3-Button Grid Container */}
            <div style={styles.buttonContainer}>

              {/* 1. Primary Google Login */}
              <button
                onClick={handleGoogleSignIn}
                style={styles.primaryBtn}
                disabled={loading}
              >
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>🔑</span>
                {loading ? "Initializing..." : "Sign In with Google"}
              </button>

              {/* 2. Aesthetic Guest Sandbox Pass */}
              <button
                type="button"
                onClick={handleGuestSignIn}
                style={styles.secondaryBtn}
                disabled={loading}
              >
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>⚡</span>
                Explore as Guest
              </button>

              {/* 3. New Video Walkthrough Trigger */}
              <button
                type="button"
                onClick={() => window.open('https://www.youtube.com/watch?v=YOUR_VIDEO_ID', '_blank')}
                style={styles.videoBtn}
              >
                <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>🎥</span>
                Watch Demo
              </button>

            </div>


            {/* Short On Time Context Subtext */}
            <p style={styles.timeNotice}>
              ⏱️ <strong>Short on time?</strong> Click <em>Watch Demo</em> for a 90-second system walkthrough, or use <em>Explore as Guest</em> to test the live pipeline instantly.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTIONS */}
      <section style={landingStyles.section}>
        <h2 style={landingStyles.sectionTitle}>High-Retention Infrastructure Stack</h2>
        <p style={landingStyles.sectionSubtitle}>Ditch flat directories. Leverage a modern computational pipeline built for immediate contextual discovery.</p>

        <div style={landingStyles.featureGrid}>
          {features.map((f, idx) => (
            <div key={idx} style={landingStyles.featureCard}>
              <div style={landingStyles.featureIcon}>{f.icon}</div>
              <h3 style={landingStyles.featureCardTitle}>{f.title}</h3>
              <p style={landingStyles.featureCardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE BREAKDOWN VISUAL */}
      <section style={landingStyles.section}>
        <div style={landingStyles.pipelineCard}>
          <h3 style={landingStyles.pipelineTitle}>The Storage-to-Recall Pipeline</h3>
          <div style={landingStyles.pipelineSteps}>
            <div style={landingStyles.step}>
              <div style={landingStyles.stepNum}>1</div>
              <h4 style={landingStyles.stepHeader}>Drive Ingestion</h4>
              <p style={landingStyles.stepDesc}>Secure Multipart API Upload & cloud staging</p>
            </div>
            <div style={landingStyles.pipelineArrow}>➔</div>
            <div style={landingStyles.step}>
              <div style={landingStyles.stepNum}>2</div>
              <h4 style={landingStyles.stepHeader}>Tokenization & Chunking</h4>
              <p style={landingStyles.stepDesc}>Recursive text splitting and meta-tag partitioning</p>
            </div>
            <div style={landingStyles.pipelineArrow}>➔</div>
            <div style={landingStyles.step}>
              <div style={landingStyles.stepNum}>3</div>
              <h4 style={landingStyles.stepHeader}>Vector Indexing</h4>
              <p style={landingStyles.stepDesc}>Embedding extraction into Postgres pgvector store</p>
            </div>
            <div style={landingStyles.pipelineArrow}>➔</div>
            <div style={landingStyles.step}>
              <div style={landingStyles.stepNum}>4</div>
              <h4 style={landingStyles.stepHeader}>Semantic Synthesis</h4>
              <p style={landingStyles.stepDesc}>Isolated context-matching via LLM reasoning</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={landingStyles.section}>
        <h2 style={landingStyles.sectionTitle}>Architectural FAQ</h2>
        <div style={landingStyles.faqContainer}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={landingStyles.faqItem}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div style={landingStyles.faqHeader}>
                <span style={landingStyles.faqQuestion}>{faq.q}</span>
                <span style={landingStyles.faqToggle}>{activeFaq === idx ? "−" : "+"}</span>
              </div>
              {activeFaq === idx && (
                <div style={landingStyles.faqAnswer}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SIMPLE FOOTER */}
      <footer style={landingStyles.footer}>
        <p>© 2026 tarkaSmart. Built for deep high-performance learning ecosystems.</p>
      </footer>
    </div>
  );
}

// ==========================================
// 2. MAIN APPLICATION CORE WORKSPACE
// ==========================================
export default function App() {
  // 🔐 Active Authentication Session State (Persistent across refreshes)
  const [userSession, setUserSession] = useState(() => {
    const saved = localStorage.getItem("TarkaSmart_session");
    return saved ? JSON.parse(saved) : null;
  });

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
      localStorage.setItem("TarkaSmart_session", JSON.stringify(sessionData));
      setUserSession(sessionData);
      window.history.replaceState(null, '', window.location.pathname);
      window.location.reload();
    }
  }, []);
  
  const handleLoginSuccess = (profilePayload) => {
    setUserSession(profilePayload);
    window.location.reload();
  };

  if (!userSession) {
    return <Login onLoginSuccess={(sessionData) => {
      localStorage.setItem("TarkaSmart_session", JSON.stringify(sessionData));
      setUserSession(sessionData);
      window.location.reload();
    }} />;
  }
 
  const handleLogout = () => {
    localStorage.removeItem("TarkaSmart_session");
    setUserSession(null);
    window.location.reload();
  };

  // ---------------- DOCUMENT STATE ----------------
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // 📡 FETCH REAL-TIME SYNCD FILES FROM FASTAPI/SUPABASE BACKEND
  React.useEffect(() => {
    
    if (!userSession) {
      // PASS THE CALLBACK TO SET THE SESSION
      return <Login onLoginSuccess={(sessionData) => setUserSession(sessionData)} />;
    }
    const fetchUserDocuments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/documents?google_user_id=${userSession.google_user_id}`);
        if (!response.ok) throw new Error("Failed to pull active database index.");

        const rawData = await response.json();
        //console.log("Raw DB Row Sample:", rawData[0]);

        // 🔄 NORMALIZATION LAYER: Map your actual database columns to frontend keys
        const normalizedData = rawData.map((doc) => ({
          id: doc.id,
          google_drive_id: doc.google_drive_id,
          name: doc.file_name || "Unnamed Document",
          subject: doc.subject_category || "General",
          view_url: doc.view_url || ""
        }));

        setDocuments(normalizedData);

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
  const [selectedSubject, setSelectedSubject] = useState("Computer Science");

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
      sources: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef(null);
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // ---------------- UI & INTERACTION STATE ----------------
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 📏 Resizable Columns State Variables (Default Widths)
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [chatWidth, setChatWidth] = useState(350);
  const [tasksHeight, setTasksHeight] = useState(200);
 
  
  // 2. Add this effect to track changes
  
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

  // 🛠️ TASKS PANEL HEIGHT RESIZER HANDLER
  const startTasksResize = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startHeight = tasksHeight;
    const startY = mouseDownEvent.clientY;

    const doDrag = (mouseMoveEvent) => {
      const deltaY = mouseMoveEvent.clientY - startY;
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
      tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
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
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
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
          google_user_id: userSession.google_user_id
        })
      });

      if (!response.ok) throw new Error("Server response error");

      // Initialize the assistant message with empty text
      setMessages((prev) => [...prev, { role: "assistant", text: "", sources: null }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullBuffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullBuffer += chunk;

        // Check if we have hit the metadata marker
        if (fullBuffer.includes("[METADATA_START]")) {
          const [textPart, metaPartWithEnd] = fullBuffer.split("[METADATA_START]");

          // Only parse if we have the full [METADATA_END] tag
          if (metaPartWithEnd.includes("[METADATA_END]")) {
            const metaPart = metaPartWithEnd.split("[METADATA_END]")[0];
            const meta = JSON.parse(metaPart);

            setMessages((prev) => {
              const newMsgs = [...prev];
              const lastIdx = newMsgs.length - 1;
              newMsgs[lastIdx] = { ...newMsgs[lastIdx], text: textPart, sources: meta.sources };
              return newMsgs;
            });
            break; // Stream finished
          } else {
            // Metadata tag started, but not complete yet. 
            // Update UI with just the text part so far.
            setMessages((prev) => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1].text = textPart;
              return newMsgs;
            });
          }
        } else {
          // Standard streaming update
          setMessages((prev) => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1].text = fullBuffer;
            return newMsgs;
          });
        }
      }
    }
      catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "❌ Connection error.", sources: null }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };
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

  return (
    
    <div style={styles.outer}>
      <div style={styles.container}>

        {/* --- SIDEBAR MODULE --- */}
        <aside style={{ ...styles.sidebar, width: `${sidebarWidth}px` }}>
          <div>
            <h2 style={styles.brand}>🧠 TarkaSmart</h2>
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
                style={styles.selectDropdown}
              >
                <option value="">-- Select a Category --</option>
                {subjectList.map((sub, index) => (
                  <option key={index} value={sub}>
                    📚 {sub}
                  </option>
                ))}
                <option value="___ADD_NEW_SUBJECT___" style={{ fontWeight: "bold", color: "#4f46e5" }}>
                  ➕ Add New Subject...
                </option>
              </select>
            ) : (
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "14px" }}>
                <input
                  type="text"
                  placeholder="E.g. Operating Systems"
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  style={{
                    padding: "8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
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
                      setSubjectList([...subjectList, trimmed]);
                      setSelectedSubject(trimmed);
                    }
                    setNewSubjectInput("");
                    setIsAddingNewSubject(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}
                >
                  Save
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
          </div>

          {/* Dynamic Scrollable Folder Tree Box */}
          <div style={styles.treeWrapper}>
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
                    {subject === "Computer Science" ? "💻 Computer Science" :
                      subject === "Mathematics" ? "📐 Mathematics" :
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

          {/* ROW DIVIDER HANDLE FOR TASKS HEIGHT */}
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

          {/* FIXED INTERACTIVE TASKS CONTAINER */}
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

        {/* LEFT COLUMN COL-RESIZE HANDLE */}
        <div
          onMouseDown={startLeftResize}
          style={{
            width: "6px",
            cursor: "col-resize",
            background: "#e5e7eb",
            zIndex: 10
          }}
        />

        {/* --- MAIN MODULE: PDF VIEWER & WORKSPACE --- */}
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
                  Drag & Drop a local lecture note or study guide anywhere on this screen area to isolate and vectorize its data under your active settings.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT COLUMN COL-RESIZE HANDLE */}
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

                {/* 2. The Professional Citation Footer */}
                {msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                  <div style={{
                    marginTop: "16px",
                    padding: "12px",
                    backgroundColor: "#f8fafc",
                    borderLeft: "4px solid #4f46e5",
                    borderRadius: "8px",
                    fontSize: "0.85rem"
                  }}>
                    <div style={{ fontWeight: "800", color: "#4338ca", marginBottom: "10px", fontSize: "0.7rem", textTransform: "uppercase" }}>
                      📖 Academic References
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {msg.sources.map((src, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: "#e0e7ff",
                            color: "#3730a3",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            border: "1px solid #c7d2fe"
                          }}
                        >
                          {src.source_name} (Pg. {src.page_number})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />

            {isAiLoading && <div style={styles.loadingBubble}>Querying Database Vectors...</div>}
          </div>

          <form onSubmit={handleSendMessage} style={styles.chatForm}>
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={"Ask about anything..." }
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
// 3. CORE FRONTEND COMPONENT GLOSSARY
// ==========================================
const styles = {
  spinner: {
    margin: "0 auto",
    width: "40px",
    height: "40px",
    border: "4px solid #f3f4f6",
    borderTop: "4px solid #4f46e5",
    borderRadius: "50%"
  },
  outer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    height: "100vh",
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    background: "#f3f4f6",
    margin: "0",
    padding: "0",
    boxSizing: "border-box",
    fontFamily: "system-ui, sans-serif"
  },
  container: {
    display: "flex",
    width: "100%",
    height: "100%",
    background: "white",
    overflow: "hidden",
    boxSizing: "border-box"
  },
  sidebar: {
    padding: "20px",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "#ffffff",
    boxSizing: "border-box",
    height: "100%",
    overflow: "hidden"
  },
  treeWrapper: {
    flex: 1,
    width: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    marginBottom: "15px",
    paddingRight: "4px"
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
  button: {
    width: "100%",
    padding: "10px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    marginBottom: "15px"
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
    overflow: "hidden"
  },
  mainHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px"
  },
  badge: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600"
  },
  pdfBox: {
    flex: 1,
    background: "#f9fafb",
    border: "1px dashed #e5e7eb",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  dragOverlayText: {
    color: "#2563eb",
    fontWeight: "600",
    padding: "40px",
    textAlign: "center",
    fontSize: "15px"
  },
  chat: {
    borderLeft: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    height: "100%",
    boxSizing: "border-box"
  },
  chatHeader: {
    padding: "16px 20px",
    margin: 0,
    borderBottom: "1px solid #e5e7eb",
    fontSize: "16px",
    fontWeight: "700"
  },
  chatBox: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  msg: {
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: "1.4"
  },
  sources: {
    fontSize: "11px",
    marginTop: "6px",
    fontWeight: "500"
  },
  loadingBubble: {
    alignSelf: "flex-start",
    color: "#6b7280",
    fontSize: "13px",
    fontStyle: "italic",
    padding: "4px 0"
  },
  chatForm: {
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: "10px"
  },
  chatInput: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none"
  },
  chatButton: {
    padding: "10px 16px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer"
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
    fontSize: "13px",
    outline: "none"
  },
  taskButton: {
    padding: "6px 12px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500"
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    overflowY: "auto",
    flex: 1
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    padding: "6px 4px",
    fontSize: "13px"
  },
 
    actionSection: {
      width: '100%',
      maxWidth: '720px',   /* Expanded slightly to fit 3 columns cleanly */
      margin: '32px auto',
      textAlign: 'center',
      boxSizing: 'border-box',
    },
    buttonContainer: {
      display: 'flex',
      gap: '12px',         /* Tightened gap for better three-column aesthetics */
      width: '100%',
      marginBottom: '16px',
    },
    primaryBtn: {
      flex: 1,
      backgroundColor: '#ffffff',
      color: '#121212',
      border: 'none',
      padding: '14px 16px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease',
    },
    secondaryBtn: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      padding: '14px 16px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    },
    videoBtn: {
      flex: 1,
      backgroundColor: 'rgba(168, 85, 247, 0.1)', /* Subtle tech-purple tint */
      color: '#c084fc',
      border: '1px solid rgba(168, 85, 247, 0.3)',
      padding: '14px 16px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    },
    timeNotice: {
      fontSize: '0.85rem',
      color: '#a3a3a3',
      margin: '12px 0 0 0',
      lineHeight: '1.4',
      letterSpacing: '0.2px',
    }

};

// ==========================================
// 4. LANDING PAGE INLINE MODERN THEME STYLES
// ==========================================
const landingStyles = {
  wrapper: {
    backgroundColor: "#0d0e12",
    color: "#f3f4f6",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
    overflowY: "auto",
    paddingBottom: "40px",
    width: "100%"
  },
  glowOrb1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)",
    top: "-100px",
    left: "-100px",
    zIndex: 0
  },
  glowOrb2: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(0,0,0,0) 70%)",
    top: "400px",
    right: "-100px",
    zIndex: 0
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px 20px",
    position: "relative",
    zIndex: 10
  },
  navBrand: {
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.5px"
  },
  navBtn: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500"
  },
  heroSection: {
    maxWidth: "900px",
    margin: "40px auto 80px auto",
    padding: "0 20px",
    position: "relative",
    zIndex: 10
  },
  heroCard: {
    background: "rgba(20, 22, 28, 0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "24px",
    padding: "60px 40px",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
  },
  badge: {
    display: "inline-block",
    background: "linear-gradient(90deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
    border: "1px solid rgba(168,85,247,0.4)",
    color: "#c084fc",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "24px",
    letterSpacing: "0.5px"
  },
  heroTitle: {
    fontSize: "44px",
    fontWeight: "800",
    letterSpacing: "-1.5px",
    lineHeight: "1.2",
    margin: "0 0 20px 0",
    color: "#ffffff"
  },
  gradientText: {
    background: "linear-gradient(90deg, #6366f1, #a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  heroSubtitle: {
    fontSize: "17px",
    lineHeight: "1.6",
    color: "#9ca3af",
    maxWidth: "700px",
    margin: "0 auto 40px auto"
  },
  actionZone: {
    maxWidth: "480px",
    margin: "0 auto"
  },
  googleBtn: {
    width: "100%",
    backgroundColor: "#ffffff",
    color: "#111827",
    border: "none",
    padding: "15px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(255,255,255,0.1)"
  },
  securityFooter: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "16px",
    lineHeight: "1.4"
  },
  section: {
    maxWidth: "1100px",
    margin: "0 auto 100px auto",
    padding: "0 20px",
    position: "relative",
    zIndex: 10,
    textAlign: "center"
  },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    margin: "0 0 12px 0"
  },
  sectionSubtitle: {
    fontSize: "16px",
    color: "#9ca3af",
    marginBottom: "48px"
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px"
  },
  featureCard: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "32px 24px",
    textAlign: "left"
  },
  featureIcon: {
    fontSize: "28px",
    marginBottom: "16px",
    background: "rgba(255,255,255,0.04)",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px"
  },
  featureCardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 10px 0",
    color: "#ffffff"
  },
  featureCardDesc: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#9ca3af",
    margin: 0
  },
  pipelineCard: {
    background: "linear-gradient(135deg, rgba(20,22,28,0.8) 0%, rgba(10,11,14,0.8) 100%)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "left"
  },
  pipelineTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "32px",
    textAlign: "center"
  },
  pipelineSteps: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px"
  },
  step: {
    flex: "1",
    minWidth: "160px",
    textAlign: "center"
  },
  stepNum: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#6366f1",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px auto",
    fontWeight: "700"
  },
  stepHeader: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    color: "#ffffff"
  },
  stepDesc: {
    margin: 0,
    fontSize: "13px",
    color: "#9ca3af"
  },
  pipelineArrow: {
    color: "#4b5563",
    fontSize: "20px",
    fontWeight: "700"
  },
  faqContainer: {
    maxWidth: "760px",
    margin: "0 auto",
    textAlign: "left"
  },
  faqItem: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "12px",
    cursor: "pointer"
  },
  faqHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  faqQuestion: {
    fontWeight: "600",
    fontSize: "16px"
  },
  faqToggle: {
    color: "#9ca3af",
    fontSize: "18px"
  },
  faqAnswer: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#9ca3af",
    lineHeight: "1.5",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    paddingTop: "12px"
  },
  footer: {
    textAlign: "center",
    paddingTop: "40px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    maxWidth: "1100px",
    margin: "0 auto",
    color: "#4b5563",
    fontSize: "13px"
  }
};
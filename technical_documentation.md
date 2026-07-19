# 🧠 TarkaSmart — Technical Deep-Dive & Engineering Log

This document is the companion to the [README](./README.md). Where the README sells the *what*, this covers the *why* and *how* — the architecture decisions, the trade-offs, and the real production problems encountered while building TarkaSmart, along with how each was diagnosed and solved.

---

## 1. Authentication & Session Security

**Flow:** User authenticates via Google OAuth 2.0 → tokens are encrypted with `cryptography.fernet` → encrypted tokens are stored in Supabase.

**Why encryption at the token layer:** Access/refresh tokens are effectively credentials — storing them in plaintext in the database would mean a single DB leak compromises every connected Google account. Fernet gives authenticated symmetric encryption (confidentiality + integrity) with minimal implementation overhead, which was the right trade-off for a single-service backend that doesn't yet need asymmetric key distribution.

## 2. Scoped Drive Access

**Decision:** Use the restricted `drive.file` OAuth scope instead of broader Drive scopes.

**Why:** `drive.file` limits the application to only the files a user explicitly opens/creates through the app's file picker — not their entire Drive. This was a deliberate "privacy by design" trade-off: it costs a slightly less seamless UX (no ambient access to existing folders) in exchange for a meaningfully smaller trust footprint, which matters for an app handling academic/personal material.

## 3. Data Layer: Why Supabase

Supabase (Postgres + `pgvector`) was chosen so that **relational data (users, sessions, tasks) and vector embeddings live in the same database**, avoiding the operational overhead of syncing a separate vector store (e.g., Pinecone) with a separate relational DB. For a single-developer project, one database to reason about, back up, and query is a meaningful simplification.

## 4. Embedding Model: A Deployment-Driven Pivot

**Original plan:** LangChain + a HuggingFace local embedding model.

**What went wrong:** After deploying to Railway, the HuggingFace embedder proved too heavy to load in a constrained deployment environment — cold starts and load times were unacceptably slow for a responsive product.

**Fix:** Switched to the **Gemini embedding model** (API-based, no local model weights to load). This removed the cold-start/model-loading bottleneck entirely, at the cost of adding an external API dependency (which later contributed to the rate-limit issue in §8).

> **Engineering takeaway:** Local models look free until you account for deployment infrastructure. On resource-constrained hosting, an API-based embedding call was strictly better than shipping model weights.

## 5. Chunking Strategy

**Method:** Recursive, sentence-aware splitting — **600 tokens per chunk, 120 token overlap**.

**Why overlap matters:** A hard cut at 600 tokens with no overlap risks slicing a sentence or idea in half at the chunk boundary, so the model retrieving that chunk sees a fragment instead of a complete thought. A ~20% overlap (120/600) preserves enough shared context between adjacent chunks that meaning isn't lost at the seams, without so much overlap that storage/embedding cost balloons.

## 6. Embedding Dimensionality

**Choice:** 768-dimensional vectors.

**Why:** At this scale of data (per-user academic documents, not a web-scale corpus), 768 dimensions is a deliberately conservative choice — enough representational capacity for strong retrieval accuracy without the storage and query-latency cost of higher-dimensional vectors (e.g., 1536+) that a small `pgvector` instance doesn't need yet. This is flagged as a future scaling lever, not a limitation — dimensionality can be increased later if retrieval accuracy demands it.

## 7. Hybrid Retrieval: Vector + Keyword

**Method:** Semantic search via cosine similarity **combined with** keyword (full-text, indexed) search over the same Supabase store. Top-5 chunks are returned with source file name and page number for citation.

**Why hybrid, not vector-only:** Pure semantic search struggles with exact terms — acronyms, names, numerical values, code identifiers — where lexical overlap matters more than semantic similarity. Adding indexed keyword search closes that gap. This wasn't the original design — it was added *after* evaluation (see §8) revealed vector-only retrieval was underperforming.

**Fallback behavior:** If no chunk clears the relevance threshold, the system does **not** silently answer from the base model as if it were grounded. It falls back to general model reasoning *and surfaces an explicit warning* that the answer isn't backed by the user's own material. This was a deliberate anti-hallucination design choice — a wrong answer with a warning is safer than a fluent, ungrounded answer with no warning.

**Function**
``sql
  SELECT 
    dc.id,
    dc.content,
    dc.source_name, -- Added
    dc.pg_no,       -- Added
    -- Combined score logic
    ((1 - (dc.embedding <=> query_embedding)) * 0.7) + 
    (ts_rank(to_tsvector('english', dc.content), plainto_tsquery('english', query_text)) * 0.3) AS similarity
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE 
    d.google_user_id = user_id_filter
    AND (
      (1 - (dc.embedding <=> query_embedding)) > match_threshold
      OR to_tsvector('english', dc.content) @@ plainto_tsquery('english', query_text)
    )
  ORDER BY similarity DESC
  LIMIT match_count;
``

## 8. RAG Evaluation

**Framework:** [RAGAS](https://docs.ragas.io/), measuring faithfulness, answer relevancy, context precision, and context recall.

**Results:**

| Metric | Score |
|---|---|
| Faithfulness | **0.9778** |
| Context Precision | **1.0000** |
| Context Recall | **1.0000** |
| Answer Relevancy | **0.9512** |

**Finding:** Initial evaluation surfaced that **vector-only retrieval had a measurable accuracy gap** — this finding is what directly motivated adding keyword search into the retrieval layer (§7). The scores above reflect the system *after* that fix, with near-perfect context precision/recall confirming the hybrid retrieval layer is surfacing the right chunks, and high faithfulness confirming generated answers stay grounded in those chunks rather than drifting.

**Why evaluation, not intuition:** Without a scoring framework, a "the answers feel pretty good" assessment can hide real gaps. RAGAS made the accuracy problem visible and quantifiable, which is what made the fix targeted rather than guesswork.

## 9. Deployment & Latency

Deployed across **Vercel** (frontend) and **Render/Railway** (backend). To address perceived latency on longer generations, responses are **token-streamed** to the client rather than returned as a single blocking response — the user sees the answer forming in real time instead of staring at a loading spinner.

---

## 🚧 Problems Encountered & How They Were Solved

### Problem 1: API Rate Limiting (HTTP 429)
Frequent rate-limit errors were hit against the embedding/generation APIs under normal use.

**Fix:** Implemented a **retry mechanism with exponential backoff**, retrying up to 3 times with increasing wait intervals before failing. This smooths over transient rate-limit spikes without requiring the user to manually retry a failed request.

### Problem 2: Evaluation Bottleneck — Rate Limits, Not Compute
Running RAGAS evaluation kept hitting API rate limits (HTTP 429) against the Gemini API, well beyond what the retry-with-backoff logic in Problem 1 could absorb — RAGAS fires multiple LLM calls per row per metric (e.g. faithfulness alone decomposes an answer into individual statements and verifies each one separately), so a full evaluation run generates far more requests than the row count suggests.

**First hypothesis (incorrect):** Assumed the issue was local hardware — switched the evaluator to a local **Ollama** model, which introduced a new problem: too slow/heavy to run at usable speed. Suspecting GPU availability was the real constraint, the evaluation was then moved to **Google Colab** for GPU access. The error persisted identically.

**Correct diagnosis:** The bottleneck was never compute — it was API quota. Since the evaluator LLM calls go out over the network to Google's API regardless of whether the script runs locally or on a Colab GPU, moving *where* the code executes does nothing to change *how many requests per minute the API key is allowed*. This ruled out hardware entirely as the constraint.

**Actual fix:** Rather than trying to fit the full evaluation through a single API key's rate limit, the evaluation set was **split across 4 parallel scripts, each running with a separate Gemini API key**, distributing the total request volume across four independent quota allocations instead of funneling it through one.

**Result:** Full evaluation completed successfully — **Faithfulness 0.9778, Context Precision 1.0000, Context Recall 1.0000, Answer Relevancy 0.9512**.

> **Engineering takeaway:** A fix that "works" (moving to Colab, in this case it didn't — but easily could have appeared to) can mask the wrong diagnosis if you don't isolate the variable. Here, because Colab produced the *identical* error, it correctly ruled out compute and pointed straight at quota — which is what made "parallelize across API keys" the right fix instead of another dead end.

---

## 📌 Summary of Key Trade-offs

| Decision | Chosen Approach | Trade-off Accepted |
|---|---|---|
| Embedding model | Gemini API over local HuggingFace model | External API dependency, in exchange for fast cold-starts on constrained hosting |
| OAuth scope | `drive.file` over full Drive scope | Slightly less seamless UX, in exchange for minimal trust footprint |
| Retrieval | Hybrid (vector + keyword) over vector-only | Added complexity, in exchange for measurable accuracy gains (confirmed via RAGAS) |
| Embedding dimension | 768-dim over higher-dimensional | Slightly lower ceiling on nuance, in exchange for lower storage/latency cost at current scale |
| Evaluation throughput | Parallel execution across 4 API keys | Added orchestration complexity, in exchange for bypassing a single-key rate-limit ceiling that persisted across local, Ollama, and Colab environments |

---

*This document is intended to be read alongside commit history / PRs where relevant, and updated as the architecture evolves.*
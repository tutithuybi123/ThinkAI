# THINKAI KIDS — System Architecture [DRAFT / PRE-FLIGHT DISCOVERY]

> **Current Competition Demo context:** Read [CURRENT.md](CURRENT.md) before using this document.
>
> This is historical pre-flight discovery architecture. It must not override the current Competition Demo v1.1 source-of-truth or active supporting architecture references.

> [!IMPORTANT]
> **Status**: DRAFT / PRE-FLIGHT DISCOVERY.
> All architectural components, data boundaries, tech stacks, and deployment targets are candidate proposals undergoing evaluation. Nothing in this document represents a final implementation commitment.

---

## 1. Candidate Overview Diagram

```
[ User / Web Client ]
         │ (HTTP / WebSockets)
         ▼
[ Web Application Server ]
   ├── [ Auth & Session Guard ]
   ├── [ AI Hint Pipeline ] ──► [ LLM Provider / Local Model ]
   └── [ Database Boundary ] ──► [ Database Candidate ]
```

---

## 2. Candidate Components Under Evaluation

### Frontend Web Client (`[UNKNOWN: Candidate evaluation underway]`)
- Candidate frameworks: React, Next.js, Vite.

### Backend Application Server (`[UNKNOWN: Candidate evaluation underway]`)
- Candidate stacks: Node.js, Python API server.

### AI Boundary (`[UNKNOWN: Candidate evaluation underway]`)
- Candidate providers: OpenAI API, Gemini, local models.

### Database Boundary (`[UNKNOWN: Candidate evaluation underway]`)
- Candidate stores: SQLite, PostgreSQL, embedded DB.

---

## 3. External Tooling Integration

- **Documentation Lookup**: Context7 (`ctx7`).
- **Task Tracking**: Beads (`bd`).
- **Browser Automation**: Playwright CLI (`playwright-cli`).

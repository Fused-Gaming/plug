# Swarm Orchestration Flowchart

## Main Orchestration Flow

```mermaid
flowchart TD
    START["🚀 Coordinator: Setup<br/>integration-map-app branch"] --> WAVE1["⏱️ WAVE 1: Foundations<br/>A01, A03, A08, A09<br/>(Parallel 2h)"]
    
    WAVE1 --> A01["A01: Static Build Contract<br/>vite.config.js, dist/ output<br/>npm run build passing"]
    WAVE1 --> A03["A03: SQLite Schema & Seed<br/>locations.db schema<br/>10-location seed data"]
    WAVE1 --> A08["A08: Security Draft<br/>CSP rules, dependency audit<br/>SECURITY.md"]
    WAVE1 --> A09["A09: Docs Skeleton<br/>README template<br/>docs/ structure"]
    
    A01 --> FREEZE{"Coordinator:<br/>Freeze Contracts?"}
    A03 --> FREEZE
    A08 --> FREEZE
    A09 --> FREEZE
    
    FREEZE -->|Yes| FREEZE_GATE["✅ Contracts Locked<br/>UI boundaries defined<br/>Data shape frozen<br/>Dependencies locked"]
    FREEZE -->|No| REPAIR_W1["🔧 Repair Wave 1<br/>Create repair/ branch<br/>Fix failures"]
    REPAIR_W1 --> FREEZE
    
    FREEZE_GATE --> WAVE2["⏱️ WAVE 2: Implementation<br/>A02, A04, A05, A06, A10<br/>(Parallel 4h)"]
    
    WAVE2 --> A02["A02: Data Adapter<br/>Location queries<br/>Geolocation handling"]
    WAVE2 --> A04["A04: Map Shell<br/>MapLibre integration<br/>Marker rendering"]
    WAVE2 --> A05["A05: Filters & Details<br/>Filter controls<br/>Location cards"]
    WAVE2 --> A06["A06: Accessibility<br/>Keyboard navigation<br/>ARIA labels"]
    WAVE2 --> A10["A10: Pages Integration<br/>GitHub Actions workflow<br/>Deployment verification"]
    
    A02 --> PR02["PR: agent/02-data-reader<br/>→ integration-map-app"]
    A04 --> PR04["PR: agent/04-map-shell<br/>→ integration-map-app"]
    A05 --> PR05["PR: agent/05-filter-details<br/>→ integration-map-app"]
    A06 --> PR06["PR: agent/06-accessibility<br/>→ integration-map-app"]
    A10 --> PR10["PR: agent/10-pages-integration<br/>→ integration-map-app"]
    
    PR02 --> QUEUE["📋 Serial Merge Queue<br/>(Dependency order)<br/>1. A01 2. A03 3. A02<br/>4. A04 5. A05 6. A06<br/>7. A09 8. A10"]
    PR04 --> QUEUE
    PR05 --> QUEUE
    PR06 --> QUEUE
    PR10 --> QUEUE
    
    QUEUE --> MERGE_LOOP{"Merge one PR?"}
    
    MERGE_LOOP -->|Yes| MERGE_STEP["✅ Merge PR into integration"]
    MERGE_STEP --> VALIDATE["🧪 Integrated Validation<br/>• npm run build<br/>• npm run test<br/>• Map loads<br/>• DB integrity<br/>• Mobile responsive"]
    
    VALIDATE --> VALIDATE_CHECK{"All checks<br/>pass?"}
    
    VALIDATE_CHECK -->|No| REPAIR_W2["🔧 Repair Wave 2<br/>Create repair/ branch<br/>Fix integration issue"]
    REPAIR_W2 --> MERGE_STEP
    
    VALIDATE_CHECK -->|Yes| MORE_PRS{"More queued<br/>PRs?"}
    
    MORE_PRS -->|Yes| MERGE_LOOP
    MORE_PRS -->|No| WAVE3["⏱️ WAVE 3: Validation<br/>A07, A08, A10<br/>(Parallel 2h)"]
    
    WAVE3 --> A07["A07: Full Test Suite<br/>E2E tests<br/>Performance benchmarks"]
    WAVE3 --> A08_FINAL["A08: Final Security<br/>Vulnerability scan<br/>CSP validation"]
    WAVE3 --> A10_FINAL["A10: Deployment Check<br/>Pages artifact loads<br/>All routes resolve"]
    
    A07 --> FINAL_CHECK{"Final Integration<br/>Complete?"}
    A08_FINAL --> FINAL_CHECK
    A10_FINAL --> FINAL_CHECK
    
    FINAL_CHECK -->|No| REPAIR_W3["🔧 Repair Wave 3<br/>Create repair/ branch"]
    REPAIR_W3 --> MERGE_STEP
    
    FINAL_CHECK -->|Yes| FINAL_PR["📤 Final PR<br/>integration-map-app → main<br/>With full validation report"]
    
    FINAL_PR --> REVIEW["👥 Human Review<br/>Code review checks<br/>Required CI passed"]
    
    REVIEW --> APPROVED{"PR Approved?"}
    
    APPROVED -->|No| FEEDBACK["📝 Feedback<br/>Return to owning agent<br/>or repair branch"]
    FEEDBACK --> MERGE_STEP
    
    APPROVED -->|Yes| MERGE_MAIN["🎯 Merge into main<br/>Squash or merge commit"]
    
    MERGE_MAIN --> DEPLOY["🚀 GitHub Actions Deploy<br/>• npm install<br/>• npm run build<br/>• Deploy dist/ to Pages<br/>• Verify plug.vln.gg"]
    
    DEPLOY --> VERIFY["✅ Production Live<br/>plug.vln.gg live<br/>All features working"]
    
    VERIFY --> CLEANUP["🧹 Cleanup<br/>Delete temp branches<br/>• integration-map-app<br/>• agent/* branches<br/>• repair/* branches"]
    
    CLEANUP --> END["✨ Release Complete"]
    
    style START fill:#e8f4f8
    style FREEZE_GATE fill:#d4edda
    style QUEUE fill:#fff3cd
    style FINAL_PR fill:#e7d4f5
    style MERGE_MAIN fill:#90ee90
    style DEPLOY fill:#87ceeb
    style END fill:#ffd700
```

---

## Agent Parallel Workflow

```mermaid
flowchart LR
    subgraph Wave1 ["WAVE 1: Foundations (Parallel)"]
        A01["A01: Static Build"]
        A03["A03: SQLite Owner"]
        A08["A08: Security Draft"]
        A09["A09: Docs"]
    end
    
    subgraph Wave2 ["WAVE 2: Implementation (Parallel)"]
        A02["A02: Data Adapter"]
        A04["A04: Map UI"]
        A05["A05: Filters"]
        A06["A06: Accessibility"]
        A10["A10: Pages Setup"]
    end
    
    subgraph Wave3 ["WAVE 3: Validation (Parallel)"]
        A07["A07: Tests"]
        A08F["A08: Security Final"]
        A10F["A10: Deployment"]
    end
    
    subgraph SerialQueue ["📋 SERIAL MERGE QUEUE"]
        M1["Merge A01"]
        M2["Merge A03"]
        M3["Merge A02"]
        M4["Merge A04"]
        M5["Merge A05"]
        M6["Merge A06"]
        M7["Merge A09"]
        M8["Merge A10"]
        M9["Merge A07"]
        M10["Merge A08"]
        
        M1 --> M2
        M2 --> M3
        M3 --> M4
        M4 --> M5
        M5 --> M6
        M6 --> M7
        M7 --> M8
        M8 --> M9
        M9 --> M10
    end
    
    Wave1 --> FREEZE["✅ Contracts Frozen"]
    FREEZE --> Wave2
    Wave2 --> SerialQueue
    SerialQueue --> Wave3
    Wave3 --> FINAL["🎯 Final PR to main"]
    
    style Wave1 fill:#e8f5e9
    style Wave2 fill:#fff9c4
    style Wave3 fill:#f3e5f5
    style SerialQueue fill:#ffecb3
    style FINAL fill:#90ee90
```

---

## SQLite Single-Writer Pattern

```mermaid
flowchart TD
    IntegrationBranch["integration-map-app<br/>(temporary feature)"]
    
    IntegrationBranch -->|One writer| DataAgent["data/03-oakland-locations<br/>(A03: SQLite Owner)"]
    
    DataAgent -->|✏️ Schema edits| Schema["src/data/locations.db<br/>✓ Schema locked<br/>✓ Integrity check<br/>✓ WAL checkpoint"]
    
    DataAgent -->|✏️ Seed data| Seed["📍 10-location sample<br/>✓ Lat/long verified<br/>✓ Amenities tagged<br/>✓ Deterministic"]
    
    Schema -->|PR| IntegrationQueue["integration-map-app<br/>(after A01 merge)"]
    Seed -->|PR| IntegrationQueue
    
    IntegrationQueue -->|Merge A03| Validated["✅ Database validated<br/>PRAGMA integrity_check<br/>PRAGMA wal_checkpoint"]
    
    Validated -->|Locked| A02["A02: Data Adapter<br/>(read-only)"]
    Validated -->|Locked| A04["A04: Map UI<br/>(read-only)"]
    Validated -->|Locked| A05["A05: Filters<br/>(read-only)"]
    
    A02 --> Consumer["🔒 Only queries,<br/>no mutations"]
    A04 --> Consumer
    A05 --> Consumer
    
    style DataAgent fill:#ffcccc
    style Schema fill:#ffebee
    style Seed fill:#ffebee
    style Consumer fill:#e8f5e9
    style Validated fill:#c8e6c9
```

---

## Dependency Wave Graph

```mermaid
graph TD
    START["Acceptance Criteria"] --> CONTRACTS["Define Contracts"]
    
    CONTRACTS -->|A01| BUILD["Static Build Contract"]
    CONTRACTS -->|A03| DATA["SQLite Schema"]
    CONTRACTS -->|A08| SECURITY["Privacy Review"]
    CONTRACTS -->|A09| DOCS["Docs Skeleton"]
    
    BUILD -->|→| A02["A02: Data Adapter"]
    DATA -->|→| A02
    BUILD -->|→| A04["A04: Map UI"]
    BUILD -->|→| A10["A10: Pages Integration"]
    
    A02 -->|→| A04
    A02 -->|→| A05["A05: Filters"]
    A04 -->|→| A05
    A04 -->|→| A06["A06: Accessibility"]
    A05 -->|→| A06
    
    A06 -->|→| A07["A07: Tests"]
    A05 -->|→| A07
    A04 -->|→| A07
    
    A10 -->|→| DEPLOY["Final Deployment"]
    A07 -->|→| DEPLOY
    SECURITY -->|→| DEPLOY
    
    style BUILD fill:#e3f2fd
    style DATA fill:#f3e5f5
    style SECURITY fill:#fff3e0
    style DOCS fill:#e8f5e9
    style DEPLOY fill:#90ee90
```

---

## Merge Queue Validation Loop

```mermaid
flowchart TD
    QUEUE["📋 Approved PR<br/>in merge queue"]
    
    QUEUE --> STEP1["STEP 1: Update from integration<br/>git fetch origin<br/>git rebase origin/integration-map-app"]
    
    STEP1 --> STEP2["STEP 2: Run CI checks<br/>npm run format:check<br/>npm run lint<br/>npm run typecheck<br/>npm run test"]
    
    STEP2 --> CI_PASS{"All CI<br/>pass?"}
    
    CI_PASS -->|No| REJECT["❌ Reject merge<br/>Return to agent branch<br/>Fix issues"]
    REJECT --> AGENT_FIX["Agent fixes on own branch"]
    AGENT_FIX --> STEP1
    
    CI_PASS -->|Yes| STEP3["STEP 3: Merge one PR<br/>Squash into integration"]
    
    STEP3 --> STEP4["STEP 4: Build integration<br/>npm run build<br/>npm run test<br/>npm run preview"]
    
    STEP4 --> VALIDATE["STEP 5: Full validation<br/>✓ dist/ valid<br/>✓ Map loads<br/>✓ DB integrity<br/>✓ Mobile responsive<br/>✓ No secrets<br/>✓ Asset size OK"]
    
    VALIDATE --> PASS_VALIDATION{"Integration<br/>healthy?"}
    
    PASS_VALIDATION -->|No| STOP["🛑 STOP QUEUE<br/>Integration broken"]
    STOP --> CREATE_REPAIR["Create repair/ branch<br/>Fix failure<br/>Return to merge loop"]
    CREATE_REPAIR --> STEP1
    
    PASS_VALIDATION -->|Yes| CHECK_MORE{"More queued<br/>PRs?"}
    
    CHECK_MORE -->|Yes| NEXT_PR["→ Next PR in queue"]
    NEXT_PR --> STEP1
    
    CHECK_MORE -->|No| FINAL_READY["✅ Integration ready<br/>for final PR into main"]
    
    style QUEUE fill:#fff9c4
    style STEP1 fill:#e3f2fd
    style STEP4 fill:#f3e5f5
    style VALIDATE fill:#c8e6c9
    style FINAL_READY fill:#90ee90
    style STOP fill:#ffcdd2
```


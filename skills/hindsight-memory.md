---
name: hindsight-memory
description: Persistent memory skill powered by Hindsight. Use to store, recall, and reflect on learnings, preferences, session context, and decisions across all .ziggy sessions. Triggers on any request to "remember", "recall", "store a memory", "what did I say about", "retain this", "forget", "search my memory", or when the user wants you to use past context to inform a decision.
---

# Hindsight Memory Skill

You have access to a **persistent memory bank** via the Hindsight local memory system. Use this proactively to make every session smarter than the last.

**Proactively retain learnings and recall context** before taking action on non-trivial tasks.

---

## Setup Status

✅ `uv` is installed at `C:\Users\richm\.local\bin`  
✅ Profile `ziggy` created at `C:\Users\richm\.hindsight\profiles\ziggy.env`  
✅ Provider: `gemini` | Model: `gemini-2.0-flash` | Port: `9100`  
⏳ **API key pending** — open the config file and replace both `YOUR_GEMINI_API_KEY_HERE` placeholders with your real Gemini API key:

```
C:\Users\richm\.hindsight\profiles\ziggy.env
```

Then start the daemon:

```powershell
$env:PATH += ";$env:USERPROFILE\.local\bin"
uvx hindsight-embed -p ziggy daemon start
```

> **Memory bank:** All data is stored locally in `~/.pg0/` — nothing leaves your machine.

---

## How Hindsight Works

When you call `retain`, Hindsight does **not** store the string verbatim. It runs an internal pipeline that:

1. **Extracts structured facts** from the content using an LLM
2. **Identifies entities** (people, tools, concepts, projects) and links related facts
3. **Builds temporal and causal relationships** between facts
4. **Generates embeddings** for semantic search

This means you should pass **rich, full-context content** — more context means better extraction. Your job is to decide **when** to store, not **what** to extract.

---

## Core Commands

> All commands use the `ziggy` profile (`-p ziggy`) and the `default` memory bank.

### 1. Store a Memory (`retain`)

Use when you learn something worth keeping — a user preference, a decision, a bug fix, a successful output, or any session outcome.

```bash
uvx hindsight-embed -p ziggy memory retain default "<rich description of what was learned>"
uvx hindsight-embed -p ziggy memory retain default "<content>" --context learnings
uvx hindsight-embed -p ziggy memory retain default "<content>" --context preferences
uvx hindsight-embed -p ziggy memory retain default "<content>" --context procedures
```

**Context types:**
| Context | When to use |
|---|---|
| `learnings` | Bug fixes, unexpected results, things that failed |
| `preferences` | User style, output format, tone, tool choices |
| `procedures` | Workflows that worked, commands with specific flags |
| *(none)* | General facts, decisions, project notes |

**Examples:**

```bash
uvx hindsight-embed -p ziggy memory retain default "User prefers short, punchy bullet points over long paragraphs. Avoid academic tone."
uvx hindsight-embed -p ziggy memory retain default "The .ziggy AIOS is hosted at OneDrive/Desktop/.ziggy. Skills are flat markdown files in skills/. Registered in config/skills.json." --context procedures
uvx hindsight-embed -p ziggy memory retain default "Brand colors: Primary Green #098E5E, Secondary Blue #0062FF, Violet #6366F1." --context preferences
uvx hindsight-embed -p ziggy memory retain default "Brand fonts: Space Grotesk for headings, Plus Jakarta Sans for body." --context preferences
```

### 2. Recall Context (`recall`)

Use **before starting any non-trivial task** to surface relevant past knowledge.

```bash
uvx hindsight-embed -p ziggy memory recall default "<natural language query>"
```

**Examples:**

```bash
uvx hindsight-embed -p ziggy memory recall default "user preferences for output format and tone"
uvx hindsight-embed -p ziggy memory recall default "how are .ziggy skills structured"
uvx hindsight-embed -p ziggy memory recall default "what brand colors and fonts does ziggy use"
uvx hindsight-embed -p ziggy memory recall default "previous decisions about this project"
```

### 3. List All Memories

```bash
uvx hindsight-embed -p ziggy memory list default
```

### 4. Forget a Memory

```bash
uvx hindsight-embed -p ziggy memory forget default <memory-id>
```

---

## When to Use Memory

### Always recall first when:
- Starting any task the user has touched before
- Making architectural or design decisions
- Suggesting tools, libraries, or approaches
- Writing content in Ziggy AI's voice/style

### Always retain after:
- User explicitly states a preference
- A skill produces an output the user approves
- A bug is fixed or a workaround is found
- A procedure is confirmed to work
- An important decision is made about the AIOS

### Never retain:
- Sensitive credentials or passwords
- Redundant or trivial facts
- Content the user asked you to discard

---

## Proactive Memory Behavior

When the user says something like:
- *"Remember that..."* → Immediately call `retain` with the full context
- *"What did I say about..."* → Call `recall` with the topic as the query
- *"Forget that..."* → List memories, identify the match, call `forget`
- *"I prefer..."* → Store immediately with `--context preferences`

When starting a **new session** on a topic you've covered before, call `recall` with a relevant query and tell the user: *"I recalled some context from previous sessions — here's what I found: [results]."*

---

## Memory Bank Reference

| Field | Value |
|---|---|
| Profile name | `ziggy` |
| Profile config | `C:\Users\richm\.hindsight\profiles\ziggy.env` |
| Bank ID | `default` |
| Port | `9100` |
| Provider | `gemini` (`gemini-2.0-flash`) |
| Storage location | `~/.pg0/` (local, private) |
| Mode | Local (no cloud required) |
| ⏳ API key | Replace `YOUR_GEMINI_API_KEY_HERE` in profile config |

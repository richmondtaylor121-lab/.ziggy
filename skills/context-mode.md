---
name: context-mode
description: >
  Context window optimization for AI coding agents. Sandboxes tool output (98% reduction), persists session memory, and enforces routing across 17 platforms via MCP + hooks. Triggers on requests to optimize context, run sandbox commands, view token/context savings, run diagnostics, or manage context-mode database.
---

# Context Mode Skill

This skill integrates **context-mode** into your AIOS. Context Mode is an optimization layer for AI coding agents that intercepts tool calls, sandboxes tool output (reducing context consumption by up to 98%), persists session memory in SQLite, and provides powerful sandbox execution commands.

---

## Core Capabilities

1. **Context Savings**: Sandbox tools keep large raw outputs (Playwright snapshots, raw curl/wget outputs, grep dumps, etc.) out of the context window by summarizing or extracting only relevant search results.
2. **Session Continuity**: Edits, git actions, tasks, and decisions are indexed in an SQLite FTS5 database to preserve continuity across compacted sessions.
3. **Think in Code**: Write scripts via sandbox tools (like `ctx_execute`) to run analysis locally and return only the output, replacing multiple file reads.

---

## Prerequisites & Installation

Ensure Node.js >= 22.5 is installed.

```powershell
# 1. Install context-mode globally
npm install -g context-mode

# 2. Or run it locally from the cloned repo
node context-mode/start.mjs
```

### Config Registration
To configure with `Gemini CLI` or similar hosts, add `context-mode` to the MCP servers configuration:
```json
{
  "mcpServers": {
    "context-mode": {
      "command": "context-mode"
    }
  }
}
```

---

## Command Reference

When interacting with the user or executing tasks, you can use these commands or their underlying MCP tools:

| Command | Action |
|---------|--------|
| `ctx stats` | Displays context savings, per-tool breakdown, and efficiency ratio. |
| `ctx doctor` | Runs diagnostics to validate runtimes, hooks, FTS5, and plugin registration. |
| `ctx index` | Indexes local files or directories into the persistent FTS5 knowledge base. |
| `ctx search` | Searches previously indexed content in the database using BM25 ranking. |
| `ctx upgrade` | Pulls the latest version, rebuilds, migrates cache, and fixes hooks. |
| `ctx purge` | Permanently deletes all indexed content and starts fresh. |

---

## Sandbox Tools Reference

Use the following MCP tools to execute commands and gather data efficiently:

### `ctx_execute(language, code)`
Executes code (e.g., `javascript`, `shell`) in a sandbox and returns only standard output/errors, preventing context bloat.

### `ctx_batch_execute(commands, queries, concurrency?)`
Executes multiple commands in parallel, indexes the results, and returns only matches matching the queries. Use concurrency (up to 8) for network/IO-bound commands.

### `ctx_execute_file(path, language, code)`
Executes a script file in the sandbox and returns its output.

### `ctx_fetch_and_index(url, source)` / `ctx_fetch_and_index(requests, concurrency?)`
Fetches web content (or multiple URLs in batch) and indexes them into the database without flooding the context with raw HTML. Use `ctx_search` to query the fetched content.

### `ctx_index(content, source)`
Explicitly indexes content into the database.

### `ctx_search(queries, sort?)`
Queries the SQLite knowledge base for relevant context matching the queries list.

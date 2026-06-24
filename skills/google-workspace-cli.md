# Google Workspace CLI (gws) Skill

## Overview

You have access to `gws` — the Google Workspace CLI. It is a single command-line tool that covers **all Google Workspace APIs**: Drive, Gmail, Calendar, Sheets, Docs, Chat, Meet, Admin, and more. Every response is structured JSON, making it ideal for AI agent workflows.

**Installed version:** `@googleworkspace/cli@0.22.5`
**Binary:** `gws` (available globally in PATH as `gws.ps1` on Windows)

---

## Core Principles

1. **Always use `--dry-run` first** for any write/mutate operation before executing it for real.
2. **All responses are JSON** — parse and summarize the output for the user; don't dump raw JSON unless asked.
3. **Authentication is required** — if a command fails with an auth error, guide the user through `gws auth setup` or `gws auth login`.
4. **Dynamic discovery** — `gws` reads Google's Discovery Service at runtime. Use `gws schema <method>` to introspect schemas on the fly.
5. **Use `--params` for query parameters** (GET params, pagination, filters) and `--json` for request bodies (POST/PATCH).

---

## Authentication Setup

### First-Time Setup (requires `gcloud` CLI)
```powershell
gws auth setup    # Creates GCP project, enables APIs, runs OAuth login
```

### Manual Setup (no gcloud)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create an OAuth 2.0 Desktop App credential
3. Download `client_secret.json` → save to `~/.config/gws/client_secret.json`
4. Add yourself as a Test User in the OAuth consent screen
5. Run: `gws auth login -s drive,gmail,calendar,sheets,docs,chat`

### Subsequent Logins
```powershell
gws auth login                                      # All recommended scopes
gws auth login -s drive,gmail,sheets                # Specific services only
```

> ⚠️ **Scope limit warning:** Unverified apps (testing mode) are limited to ~25 scopes. Use `-s service1,service2` to select specific services instead of `recommended` which includes 85+ scopes.

### Headless / Export Credentials
```powershell
gws auth export --unmasked > credentials.json       # Export from authenticated machine
$env:GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE = "C:\path\to\credentials.json"  # Use on headless
```

---

## Command Reference by Service

### 📁 Google Drive

```powershell
# List files (most recent 10)
gws drive files list --params '{"pageSize": 10, "orderBy": "modifiedTime desc"}'

# Search for files
gws drive files list --params '{"q": "name contains \"budget\" and mimeType=\"application/vnd.google-apps.spreadsheet\"", "pageSize": 20}'

# Get file metadata
gws drive files get --params '{"fileId": "FILE_ID", "fields": "id,name,mimeType,modifiedTime,size"}'

# Upload a file
gws drive files create --json '{"name": "MyFile.txt", "parents": ["FOLDER_ID"]}' --dry-run

# Download a file (export Google Doc as PDF)
gws drive files export --params '{"fileId": "FILE_ID", "mimeType": "application/pdf"}'

# Create a folder
gws drive files create --json '{"name": "New Folder", "mimeType": "application/vnd.google-apps.folder"}' --dry-run

# List all files (paginated, streamed as NDJSON)
gws drive files list --params '{"pageSize": 100}' --page-all

# Move file to trash
gws drive files update --params '{"fileId": "FILE_ID"}' --json '{"trashed": true}' --dry-run

# Share a file
gws drive permissions create --params '{"fileId": "FILE_ID"}' --json '{"role": "reader", "type": "user", "emailAddress": "user@example.com"}' --dry-run
```

### 📧 Gmail

```powershell
# List inbox messages (recent 10)
gws gmail users messages list --params '{"userId": "me", "maxResults": 10}'

# Search messages
gws gmail users messages list --params '{"userId": "me", "q": "from:boss@company.com is:unread", "maxResults": 20}'

# Get message content
gws gmail users messages get --params '{"userId": "me", "id": "MESSAGE_ID", "format": "full"}'

# Send an email (dry-run first!)
gws gmail users messages send --params '{"userId": "me"}' --json '{"raw": "BASE64_ENCODED_EMAIL"}' --dry-run

# List labels
gws gmail users labels list --params '{"userId": "me"}'

# Mark message as read
gws gmail users messages modify --params '{"userId": "me", "id": "MESSAGE_ID"}' --json '{"removeLabelIds": ["UNREAD"]}' --dry-run

# Get thread
gws gmail users threads get --params '{"userId": "me", "id": "THREAD_ID"}'

# Create draft
gws gmail users drafts create --params '{"userId": "me"}' --json '{"message": {"raw": "BASE64_ENCODED_EMAIL"}}' --dry-run
```

### 📅 Google Calendar

```powershell
# List calendars
gws calendar calendarlist list

# List upcoming events (next 10)
gws calendar events list --params '{"calendarId": "primary", "maxResults": 10, "timeMin": "2025-01-01T00:00:00Z", "orderBy": "startTime", "singleEvents": true}'

# Create an event
gws calendar events insert --params '{"calendarId": "primary"}' \
  --json '{"summary": "Team Meeting", "start": {"dateTime": "2025-06-01T10:00:00-07:00"}, "end": {"dateTime": "2025-06-01T11:00:00-07:00"}, "attendees": [{"email": "colleague@example.com"}]}' \
  --dry-run

# Update an event
gws calendar events patch --params '{"calendarId": "primary", "eventId": "EVENT_ID"}' \
  --json '{"summary": "Updated Meeting Title"}' --dry-run

# Delete an event
gws calendar events delete --params '{"calendarId": "primary", "eventId": "EVENT_ID"}' --dry-run

# Find free/busy times
gws calendar freebusy query --json '{"timeMin": "2025-06-01T00:00:00Z", "timeMax": "2025-06-07T23:59:59Z", "items": [{"id": "primary"}]}'
```

### 📊 Google Sheets

```powershell
# List all spreadsheets (via Drive)
gws drive files list --params '{"q": "mimeType=\"application/vnd.google-apps.spreadsheet\"", "pageSize": 20}'

# Create a spreadsheet
gws sheets spreadsheets create --json '{"properties": {"title": "Q1 Budget 2025"}}' --dry-run

# Get spreadsheet metadata
gws sheets spreadsheets get --params '{"spreadsheetId": "SPREADSHEET_ID"}'

# Read cell values
gws sheets spreadsheets values get --params '{"spreadsheetId": "SPREADSHEET_ID", "range": "Sheet1!A1:D10"}'

# Write values to cells
gws sheets spreadsheets values update \
  --params '{"spreadsheetId": "SPREADSHEET_ID", "range": "Sheet1!A1", "valueInputOption": "USER_ENTERED"}' \
  --json '{"values": [["Name", "Amount", "Date"], ["Alice", 1500, "2025-01-15"]]}' \
  --dry-run

# Append rows
gws sheets spreadsheets values append \
  --params '{"spreadsheetId": "SPREADSHEET_ID", "range": "Sheet1!A:D", "valueInputOption": "USER_ENTERED"}' \
  --json '{"values": [["Bob", 2200, "2025-01-16"]]}' --dry-run

# Clear a range
gws sheets spreadsheets values clear --params '{"spreadsheetId": "SPREADSHEET_ID", "range": "Sheet1!A5:D10"}' --dry-run

# Batch update (add formatting, etc.)
gws sheets spreadsheets batchUpdate --params '{"spreadsheetId": "SPREADSHEET_ID"}' \
  --json '{"requests": [{"addSheet": {"properties": {"title": "New Tab"}}}]}' --dry-run
```

### 📄 Google Docs

```powershell
# List documents (via Drive)
gws drive files list --params '{"q": "mimeType=\"application/vnd.google-apps.document\"", "pageSize": 20}'

# Create a new document
gws docs documents create --json '{"title": "Meeting Notes - June 2025"}' --dry-run

# Get document content
gws docs documents get --params '{"documentId": "DOCUMENT_ID"}'

# Insert text into a document
gws docs documents batchUpdate --params '{"documentId": "DOCUMENT_ID"}' \
  --json '{"requests": [{"insertText": {"location": {"index": 1}, "text": "Hello, world!\n"}}]}' --dry-run
```

### 💬 Google Chat

```powershell
# List spaces (rooms/DMs)
gws chat spaces list

# List messages in a space
gws chat spaces messages list --params '{"parent": "spaces/SPACE_ID", "pageSize": 25}'

# Send a message to a space
gws chat spaces messages create \
  --params '{"parent": "spaces/SPACE_ID"}' \
  --json '{"text": "Hello from gws! 🚀"}' \
  --dry-run

# Send a card message (rich formatting)
gws chat spaces messages create \
  --params '{"parent": "spaces/SPACE_ID"}' \
  --json '{"cardsV2": [{"card": {"header": {"title": "Update"}, "sections": [{"widgets": [{"textParagraph": {"text": "Deployment complete."}}]}]}}]}' \
  --dry-run

# Get a specific message
gws chat spaces messages get --params '{"name": "spaces/SPACE_ID/messages/MESSAGE_ID"}'

# Delete a message
gws chat spaces messages delete --params '{"name": "spaces/SPACE_ID/messages/MESSAGE_ID"}' --dry-run

# List members in a space
gws chat spaces members list --params '{"parent": "spaces/SPACE_ID"}'
```

### 👥 Google Admin (Workspace Admin)

```powershell
# List users in domain
gws admin directory users list --params '{"customer": "my_customer", "maxResults": 50}'

# Get a specific user
gws admin directory users get --params '{"userKey": "user@yourdomain.com"}'

# Create a user
gws admin directory users insert \
  --json '{"primaryEmail": "newuser@yourdomain.com", "name": {"givenName": "Jane", "familyName": "Doe"}, "password": "TemporaryPass123!"}' \
  --dry-run

# List groups
gws admin directory groups list --params '{"customer": "my_customer"}'

# Add member to group
gws admin directory members insert \
  --params '{"groupKey": "group@yourdomain.com"}' \
  --json '{"email": "user@yourdomain.com", "role": "MEMBER"}' \
  --dry-run

# Suspend a user
gws admin directory users update \
  --params '{"userKey": "user@yourdomain.com"}' \
  --json '{"suspended": true}' --dry-run
```

---

## Advanced Usage

### Introspect API Schemas
```powershell
# See the full request/response schema for any API method
gws schema drive.files.list
gws schema gmail.users.messages.send
gws schema calendar.events.insert
gws schema sheets.spreadsheets.values.update
```

### Pagination
```powershell
# Stream all results across multiple pages as NDJSON
gws drive files list --params '{"pageSize": 100}' --page-all | ConvertFrom-Json
```

### Dry Run (Preview)
```powershell
# Always preview write operations before executing
gws drive files create --json '{"name": "test.txt"}' --dry-run
```

### Output Formatting
```powershell
# Pretty print JSON
gws calendar events list --params '{"calendarId": "primary", "maxResults": 5}' | ConvertFrom-Json | Format-List

# Extract specific fields
(gws drive files list --params '{"pageSize": 10}' | ConvertFrom-Json).files | Select-Object name, id, modifiedTime
```

### Environment Variables
| Variable | Purpose |
|---|---|
| `GOOGLE_WORKSPACE_CLI_TOKEN` | Pre-obtained OAuth access token |
| `GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE` | Path to exported credentials JSON |
| `GOOGLE_WORKSPACE_CLI_KEYRING_BACKEND` | Set to `file` to avoid OS keyring |

---

## Error Handling Patterns

### Auth Errors
- **"Access blocked"** → You haven't added yourself as a Test User in the OAuth consent screen
- **"Scope limit"** → Use `-s drive,gmail,sheets` instead of `recommended` for unverified apps
- **Token expired** → Run `gws auth login` again

### Common Fix Pattern
```powershell
# Re-authenticate with specific scopes
gws auth login -s drive,gmail,calendar,sheets,docs,chat
```

---

## Skill Activation Triggers

Use this skill when the user asks to:
- Read, list, search, or manage **Google Drive files and folders**
- Read, send, search, or manage **Gmail messages, threads, or drafts**
- List, create, update, or delete **Google Calendar events**
- Read or write data in **Google Sheets**
- Create or edit **Google Docs**
- Send messages or list spaces in **Google Chat**
- Manage users, groups, or domains via **Google Admin**
- Automate any **Google Workspace** workflow
- Use **gws** CLI commands

---

## Quick Reference Card

```powershell
# Auth
gws auth setup                    # First-time setup
gws auth login -s drive,gmail     # Login with specific scopes
gws auth export --unmasked        # Export credentials

# Drive
gws drive files list --params '{"pageSize":10}'
gws drive files get --params '{"fileId":"ID"}'

# Gmail
gws gmail users messages list --params '{"userId":"me","maxResults":10}'
gws gmail users messages get --params '{"userId":"me","id":"MSG_ID","format":"full"}'

# Calendar
gws calendar events list --params '{"calendarId":"primary","maxResults":10,"singleEvents":true,"orderBy":"startTime","timeMin":"2025-01-01T00:00:00Z"}'

# Sheets
gws sheets spreadsheets values get --params '{"spreadsheetId":"ID","range":"Sheet1!A1:Z100"}'

# Chat
gws chat spaces list
gws chat spaces messages create --params '{"parent":"spaces/ID"}' --json '{"text":"Hello!"}' --dry-run

# Discover any schema
gws schema drive.files.list
```

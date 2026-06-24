---
name: autoresearch
description: >
  Autonomous AI research skill based on Karpathy's autoresearch framework.
  Give an AI agent a single-GPU LLM training setup (train.py) and let it
  experiment autonomously. It modifies train.py, trains for 5 minutes, checks
  if val_bpb improved, keeps or discards the change, and repeats. Triggers on
  requests to "start autoresearch", "run autonomous training experiments",
  "kick off a research run", "automate training experiments", or any reference
  to autoresearch or train.py experiments.
---

# Autoresearch Skill

> *"Give an AI agent a small but real LLM training setup and let it experiment autonomously overnight."*  
> — @karpathy, March 2026

This skill plugs Karpathy's [autoresearch](https://github.com/karpathy/autoresearch) framework into your AIOS. You are the **research agent**. You modify `train.py`, run experiments, track results, and iterate — all autonomously on a single GPU.

---

## What This Skill Does

- Reads the repo context (`README.md`, `prepare.py`, `train.py`)
- Sets up a fresh experiment branch
- Runs a **5-minute training loop** as the fixed time budget per experiment
- Tracks `val_bpb` (validation bits-per-byte) — **lower is better**
- Iterates: propose → modify → train → evaluate → keep/revert → repeat

---

## Prerequisites

Before running autoresearch, ensure the following are in place:

```powershell
# 1. Install uv package manager (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Clone the repo (one-time)
git clone https://github.com/karpathy/autoresearch
cd autoresearch

# 3. Install dependencies
uv sync

# 4. Download data + train BPE tokenizer (one-time, ~2 min)
uv run prepare.py

# 5. Verify single training run works (~5 min)
uv run train.py
```

> **Platform note:** Requires a single NVIDIA GPU (tested on H100). For Windows RTX, see the [jsegov/autoresearch-win-rtx](https://github.com/jsegov/autoresearch-win-rtx) fork.

---

## How to Start an Experiment Run

When the user says "kick off autoresearch" or "start a research run", follow this protocol:

### Step 1 — Agree on a Run Tag
Propose a tag based on today's date (e.g. `jun24`). The branch `autoresearch/<tag>` must not already exist.

### Step 2 — Create the Branch
```bash
git checkout -b autoresearch/<tag>
```

### Step 3 — Read the In-Scope Files
Read these files for full context before touching anything:
- `README.md` — repository background
- `prepare.py` — **read-only**. Fixed constants, data prep, tokenizer, dataloader, evaluation harness.
- `train.py` — **the only file you edit**. Model architecture, optimizer, training loop, hyperparameters.

### Step 4 — Verify Data Exists
Check that `~/.cache/autoresearch/` contains data shards and a tokenizer.  
If not, instruct the user to run: `uv run prepare.py`

### Step 5 — Initialize results.tsv
```
experiment	val_bpb	training_seconds	total_seconds	peak_vram_mb	mfu_percent	notes
```

### Step 6 — Confirm and Go
Confirm setup looks good, then start the experimentation loop.

---

## Experimentation Loop

Each iteration:

1. **Propose** a hypothesis (what change and why)
2. **Modify** `train.py` — the ONLY file you edit
3. **Run** `uv run train.py`
4. **Parse** the output summary:
   ```
   val_bpb:          0.997900
   training_seconds: 300.1
   total_seconds:    325.9
   peak_vram_mb:     45060.2
   mfu_percent:      39.80
   ```
5. **Compare** to best known `val_bpb`
6. **Keep or revert** the change
7. **Log** result to `results.tsv`
8. **Repeat** — aim for ~12 experiments/hour, ~100 overnight

---

## Rules

### ✅ You CAN:
- Modify `train.py` freely — architecture, optimizer, hyperparameters, batch size, model size, training loop — everything is fair game
- Remove code that doesn't help (simplification wins are great)

### ❌ You CANNOT:
- Modify `prepare.py` — it is strictly read-only
- Install new packages or add dependencies (only what's in `pyproject.toml`)
- Modify the evaluation harness (`evaluate_bpb` in `prepare.py`)

---

## Optimization Target

**Goal: minimize `val_bpb`** (validation bits per byte).

- Lower is better
- Vocab-size-independent, so architectural changes are fairly compared
- Fixed 5-minute training budget makes experiments directly comparable

**Simplicity criterion:** All else equal, simpler is better.
- A tiny improvement + 20 lines of hacky code? Not worth it.
- A tiny improvement from deleting code? Keep it.
- Neutral result but much simpler code? Keep it.

**VRAM:** Soft constraint. Some increase is fine for meaningful gains, but it should not blow up dramatically.

---

## First Run Protocol

Your **very first run** must always be to establish the baseline:
```bash
# Run train.py as-is, without any modifications
uv run train.py
```
Record this as experiment `0` (baseline) in `results.tsv`.

---

## Tuning for Smaller Compute (Non-H100)

If running on a smaller GPU, Macbook, or CPU, adjust these knobs in order:

| Parameter | Default | Suggestion |
|---|---|---|
| Dataset | FineWeb | Use [TinyStories](https://huggingface.co/datasets/karpathy/tinystories-gpt4-clean) for less entropy |
| `vocab_size` | 8192 | Lower to 4096, 2048, or even 256 (byte-level) |
| `MAX_SEQ_LEN` (prepare.py) | ~1024 | Lower to 512, 256 |
| `DEVICE_BATCH_SIZE` | — | Increase slightly to compensate for shorter sequences |
| `EVAL_TOKENS` | — | Lower for faster validation |
| `DEPTH` | 8 | Lower to 4 for much smaller models |
| `WINDOW_PATTERN` | `SSSL` | Try `L` only — banded attention may be inefficient on small GPUs |
| `TOTAL_BATCH_SIZE` | ~2^17 | Lower to 2^14 (~16K) |

---

## Output Tracking

After each run, append to `results.tsv`:

```
<experiment_id>\t<val_bpb>\t<training_seconds>\t<total_seconds>\t<peak_vram_mb>\t<mfu_percent>\t<notes>
```

Example notes: `baseline`, `increased depth 8→10`, `switched optimizer to AdamW only`, `removed banded attention`, etc.

---

## Repo Structure Reference

```
prepare.py   — constants, data prep, tokenizer, dataloader, evaluation (DO NOT MODIFY)
train.py     — model, optimizer, training loop (AGENT MODIFIES THIS)
program.md   — original bare-bones agent instructions from Karpathy
pyproject.toml — dependencies
results.tsv  — your experiment log (you create and maintain this)
```

---

## Notable Forks

| Fork | Platform |
|---|---|
| [miolini/autoresearch-macos](https://github.com/miolini/autoresearch-macos) | macOS |
| [trevin-creator/autoresearch-mlx](https://github.com/trevin-creator/autoresearch-mlx) | macOS (MLX) |
| [jsegov/autoresearch-win-rtx](https://github.com/jsegov/autoresearch-win-rtx) | Windows RTX |
| [andyluo7/autoresearch](https://github.com/andyluo7/autoresearch) | AMD GPU |

---

## Source

- **Repo:** https://github.com/karpathy/autoresearch  
- **License:** MIT  
- **Author:** Andrej Karpathy  

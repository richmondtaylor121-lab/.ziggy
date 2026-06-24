#!/usr/bin/env python3
"""
autoresearch_agent.py
=====================
Autonomous AI research loop for karpathy/autoresearch.

This script is the "meta-agent" that:
  1. Sets up a fresh experiment branch
  2. Reads train.py + prepare.py for context
  3. Calls the Gemini API to propose a code change to train.py
  4. Applies the change
  5. Runs `uv run train.py` for 5 minutes
  6. Parses val_bpb from stdout
  7. Keeps the change if it improved, reverts otherwise
  8. Logs everything to results.tsv
  9. Repeats until --max-experiments is reached or time budget exceeded

Usage:
    python autoresearch_agent.py --repo-dir C:/path/to/autoresearch-win-rtx
    python autoresearch_agent.py --repo-dir . --max-experiments 20 --tag jun24
    python autoresearch_agent.py --repo-dir . --max-experiments 100  # overnight run

Requirements:
    pip install google-genai
    GEMINI_API_KEY must be set in environment (or pass --api-key)
"""

import argparse
import csv
import datetime
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

MODEL_ID = "gemini-2.5-pro"   # Upgrade to gemini-2.5-pro for best code quality
MAX_OUTPUT_TOKENS = 8192
TEMPERATURE = 1.0              # Slight creativity for hypothesis generation

SYSTEM_PROMPT = """\
You are an autonomous AI research agent running experiments on a single-GPU \
LLM training setup (nanochat/GPT-style). Your job is to iterate on train.py \
to minimize val_bpb (validation bits-per-byte).

Rules:
- You may ONLY modify train.py. Never touch prepare.py.
- You cannot install new packages. Only use what is already in pyproject.toml.
- Do not modify the evaluate_bpb function or the evaluation harness.
- All else equal, simpler code is better. Removing code that doesn't help is a win.
- VRAM is a soft constraint — modest increases are fine for real gains.

Your response format MUST be exactly:
---HYPOTHESIS---
<one paragraph explaining what you're changing and why>
---TRAIN_PY---
<the complete, updated contents of train.py>
---END---

Do not include any other text outside these delimiters.
"""

# ---------------------------------------------------------------------------
# Gemini API helper
# ---------------------------------------------------------------------------

def call_gemini(api_key: str, prompt: str) -> str:
    """Call the Gemini API and return the text response."""
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("[ERROR] google-genai not installed. Run: pip install google-genai")
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=MODEL_ID,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            max_output_tokens=MAX_OUTPUT_TOKENS,
            temperature=TEMPERATURE,
        ),
    )
    return response.text

# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def parse_agent_response(response: str) -> tuple[str | None, str | None]:
    """Extract hypothesis and updated train.py from agent response."""
    hyp_match = re.search(r"---HYPOTHESIS---\s*(.*?)\s*---TRAIN_PY---", response, re.DOTALL)
    code_match = re.search(r"---TRAIN_PY---\s*(.*?)\s*---END---", response, re.DOTALL)
    hypothesis = hyp_match.group(1).strip() if hyp_match else None
    new_code = code_match.group(1).strip() if code_match else None
    return hypothesis, new_code


def parse_training_output(output: str) -> dict:
    """Parse the summary block from train.py stdout."""
    result = {}
    patterns = {
        "val_bpb":          r"val_bpb:\s*([\d.]+)",
        "training_seconds": r"training_seconds:\s*([\d.]+)",
        "total_seconds":    r"total_seconds:\s*([\d.]+)",
        "peak_vram_mb":     r"peak_vram_mb:\s*([\d.]+)",
        "mfu_percent":      r"mfu_percent:\s*([\d.]+)",
    }
    for key, pattern in patterns.items():
        m = re.search(pattern, output)
        if m:
            result[key] = float(m.group(1))
    return result

# ---------------------------------------------------------------------------
# Git helpers
# ---------------------------------------------------------------------------

def git(repo_dir: Path, *args) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git", *args],
        cwd=repo_dir,
        capture_output=True,
        text=True,
    )


def setup_branch(repo_dir: Path, tag: str) -> str:
    """Create and checkout autoresearch/<tag> branch."""
    branch = f"autoresearch/{tag}"
    result = git(repo_dir, "checkout", "-b", branch)
    if result.returncode != 0:
        # Branch might already exist — checkout it
        git(repo_dir, "checkout", branch)
    print(f"[BRANCH] {branch}")
    return branch


def commit_change(repo_dir: Path, experiment_id: int, hypothesis: str):
    git(repo_dir, "add", "train.py")
    git(repo_dir, "commit", "-m", f"exp{experiment_id:04d}: {hypothesis[:72]}")


def revert_to_last_commit(repo_dir: Path):
    git(repo_dir, "checkout", "HEAD", "--", "train.py")

# ---------------------------------------------------------------------------
# Training runner
# ---------------------------------------------------------------------------

def run_training(repo_dir: Path, timeout: int = 600) -> tuple[bool, str]:
    """
    Run `uv run train.py` and capture output.
    Returns (success, combined_stdout_stderr).
    timeout: wall-clock seconds before we kill the process (default 10 min — 5 min training + 5 min buffer).
    """
    print("[TRAIN] Starting uv run train.py ...")
    start = time.time()
    try:
        proc = subprocess.run(
            ["uv", "run", "train.py"],
            cwd=repo_dir,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        elapsed = time.time() - start
        output = proc.stdout + "\n" + proc.stderr
        success = proc.returncode == 0
        print(f"[TRAIN] Finished in {elapsed:.1f}s (returncode={proc.returncode})")
        return success, output
    except subprocess.TimeoutExpired:
        print("[TRAIN] TIMEOUT — killed after", timeout, "seconds")
        return False, "TIMEOUT"
    except Exception as e:
        return False, str(e)

# ---------------------------------------------------------------------------
# Results logging
# ---------------------------------------------------------------------------

RESULTS_HEADER = [
    "experiment", "val_bpb", "training_seconds", "total_seconds",
    "peak_vram_mb", "mfu_percent", "kept", "notes"
]


def init_results_tsv(results_path: Path):
    if not results_path.exists():
        with open(results_path, "w", newline="") as f:
            writer = csv.writer(f, delimiter="\t")
            writer.writerow(RESULTS_HEADER)
        print(f"[LOG] Created {results_path}")


def log_result(results_path: Path, exp_id: int, metrics: dict, kept: bool, notes: str):
    with open(results_path, "a", newline="") as f:
        writer = csv.writer(f, delimiter="\t")
        writer.writerow([
            exp_id,
            metrics.get("val_bpb", "N/A"),
            metrics.get("training_seconds", "N/A"),
            metrics.get("total_seconds", "N/A"),
            metrics.get("peak_vram_mb", "N/A"),
            metrics.get("mfu_percent", "N/A"),
            "YES" if kept else "NO",
            notes,
        ])

# ---------------------------------------------------------------------------
# Main agent loop
# ---------------------------------------------------------------------------

def run_agent_loop(
    repo_dir: Path,
    api_key: str,
    tag: str,
    max_experiments: int,
    log_file: Path,
):
    results_path = repo_dir / "results.tsv"
    train_py_path = repo_dir / "train.py"
    prepare_py_path = repo_dir / "prepare.py"
    readme_path = repo_dir / "README.md"

    setup_branch(repo_dir, tag)
    init_results_tsv(results_path)

    # Read static context once
    prepare_py = prepare_py_path.read_text(encoding="utf-8")
    readme = readme_path.read_text(encoding="utf-8") if readme_path.exists() else ""

    best_val_bpb: float | None = None
    history: list[str] = []

    with open(log_file, "a", encoding="utf-8") as log:
        def tee(msg: str):
            print(msg)
            log.write(msg + "\n")
            log.flush()

        tee(f"\n{'='*60}")
        tee(f"AUTORESEARCH SESSION — {tag}")
        tee(f"Started: {datetime.datetime.now().isoformat()}")
        tee(f"Repo: {repo_dir}")
        tee(f"Max experiments: {max_experiments}")
        tee(f"{'='*60}\n")

        for exp_id in range(max_experiments):
            tee(f"\n--- Experiment {exp_id} ---")
            tee(f"Time: {datetime.datetime.now().isoformat()}")

            # Read current train.py
            current_train_py = train_py_path.read_text(encoding="utf-8")

            # Build prompt for the agent
            history_str = "\n".join(history[-10:]) if history else "No experiments yet."
            prompt = f"""
## Context

### README
{readme[:2000]}

### prepare.py (READ ONLY — do not modify)
```python
{prepare_py}
```

### Current train.py
```python
{current_train_py}
```

### Experiment History (last 10)
{history_str}

### Best val_bpb so far
{best_val_bpb if best_val_bpb is not None else "Not yet established (this is the baseline run)"}

## Your Task
{"This is experiment 0. Run train.py as-is to establish the baseline. Return the EXACT same train.py content with no changes." if exp_id == 0 else "Propose ONE focused change to train.py that you hypothesize will lower val_bpb. Be surgical — change one thing at a time so results are interpretable."}

Respond in EXACTLY this format:
---HYPOTHESIS---
<your hypothesis>
---TRAIN_PY---
<complete train.py content>
---END---
"""

            # Call Gemini
            tee("[AGENT] Calling Gemini for next hypothesis...")
            try:
                response = call_gemini(api_key, prompt)
            except Exception as e:
                tee(f"[ERROR] Gemini call failed: {e}")
                time.sleep(30)
                continue

            hypothesis, new_train_py = parse_agent_response(response)

            if not new_train_py:
                tee("[ERROR] Could not parse train.py from agent response. Skipping.")
                tee(f"[RESPONSE PREVIEW] {response[:500]}")
                continue

            tee(f"[HYPOTHESIS] {hypothesis}")

            # Write the new train.py
            train_py_path.write_text(new_train_py, encoding="utf-8")

            # Run training
            success, output = run_training(repo_dir)

            if not success:
                tee("[TRAIN FAILED] Reverting to last known good train.py")
                revert_to_last_commit(repo_dir)
                log_result(results_path, exp_id, {}, kept=False, notes=f"CRASHED: {hypothesis[:80]}")
                history.append(f"exp{exp_id}: CRASHED — {hypothesis[:80]}")
                continue

            # Parse results
            metrics = parse_training_output(output)
            val_bpb = metrics.get("val_bpb")

            if val_bpb is None:
                tee("[WARN] Could not parse val_bpb from output. Reverting.")
                tee(f"[OUTPUT TAIL] {output[-1000:]}")
                revert_to_last_commit(repo_dir)
                log_result(results_path, exp_id, {}, kept=False, notes=f"NO_METRIC: {hypothesis[:80]}")
                continue

            tee(f"[RESULT] val_bpb={val_bpb:.6f} | vram={metrics.get('peak_vram_mb', '?')}MB | mfu={metrics.get('mfu_percent', '?')}%")

            # Decide: keep or revert
            if best_val_bpb is None or val_bpb < best_val_bpb:
                tee(f"[KEEP] ✅ Improved! {best_val_bpb} → {val_bpb}")
                best_val_bpb = val_bpb
                commit_change(repo_dir, exp_id, hypothesis or "no hypothesis")
                log_result(results_path, exp_id, metrics, kept=True, notes=hypothesis or "baseline")
                history.append(f"exp{exp_id}: KEPT val_bpb={val_bpb:.6f} — {hypothesis}")
            else:
                tee(f"[REVERT] ❌ No improvement ({val_bpb:.6f} >= best {best_val_bpb:.6f})")
                revert_to_last_commit(repo_dir)
                log_result(results_path, exp_id, metrics, kept=False, notes=hypothesis or "no hypothesis")
                history.append(f"exp{exp_id}: REVERTED val_bpb={val_bpb:.6f} — {hypothesis}")

            tee(f"[PROGRESS] Best so far: {best_val_bpb:.6f}")

        tee(f"\n{'='*60}")
        tee(f"SESSION COMPLETE — {max_experiments} experiments done")
        tee(f"Best val_bpb: {best_val_bpb}")
        tee(f"Results saved to: {results_path}")
        tee(f"{'='*60}")

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Autonomous autoresearch agent loop")
    parser.add_argument("--repo-dir", default=".", help="Path to autoresearch repo root")
    parser.add_argument("--max-experiments", type=int, default=50,
                        help="Max number of experiments to run (default: 50)")
    parser.add_argument("--tag", default=None,
                        help="Run tag for branch name (default: today's date, e.g. jun24)")
    parser.add_argument("--api-key", default=None,
                        help="Gemini API key (defaults to GEMINI_API_KEY env var)")
    args = parser.parse_args()

    # Resolve paths
    repo_dir = Path(args.repo_dir).resolve()
    if not (repo_dir / "train.py").exists():
        print(f"[ERROR] train.py not found in {repo_dir}. Check --repo-dir.")
        sys.exit(1)
    if not (repo_dir / "prepare.py").exists():
        print(f"[ERROR] prepare.py not found in {repo_dir}. Check --repo-dir.")
        sys.exit(1)

    # API key
    api_key = args.api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[ERROR] Set GEMINI_API_KEY environment variable or pass --api-key")
        sys.exit(1)

    # Run tag
    tag = args.tag or datetime.datetime.now().strftime("%b%d").lower()

    # Log file
    log_file = repo_dir / f"autoresearch_{tag}.log"

    print(f"[SETUP] repo={repo_dir}  tag={tag}  max_experiments={args.max_experiments}")
    print(f"[SETUP] log={log_file}")
    print(f"[SETUP] model={MODEL_ID}")

    run_agent_loop(
        repo_dir=repo_dir,
        api_key=api_key,
        tag=tag,
        max_experiments=args.max_experiments,
        log_file=log_file,
    )


if __name__ == "__main__":
    main()

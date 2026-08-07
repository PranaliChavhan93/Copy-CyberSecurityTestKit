"""
engine.py
---------
Entry point used by the Django backend to turn raw tool output into:
  1. A parsed data dict (via parsers.py)
  2. A human-readable narrative + "what to do next" write-up (via knowledge_base.py)
  3. A stage-completeness verdict, used by the frontend to decide whether the
     "Continue" button is allowed to advance the tester to the next stage.

This module has no dependency on Streamlit, Django, or any network/LLM call —
it is the same fully offline, rule-based logic used by the standalone
Pentest Workflow Assistant, wired up so the CyberToolKit backend can call it
directly for any tool output pasted/produced by the tester.
"""

from .parsers import parse_tool_output
from .knowledge_base import STAGE_BY_ID, STAGES, build_narrative

# ------------------------------------------------------------------
# Stage code <-> stage id mapping
#
# The CyberToolKit `Stages` model uses short codes (INFO, SCAN, VULN,
# EXPLOIT, POST) with a stage_order 1-5. The knowledge_base module (ported
# from the standalone assistant) keys everything off an integer id 1-5 in
# the same order, so the mapping below is a straight lookup.
# ------------------------------------------------------------------

STAGE_CODE_TO_ID = {
    "INFO": 1,
    "SCAN": 2,
    "VULN": 3,
    "EXPLOIT": 4,
    "POST": 5,
}

STAGE_ID_TO_CODE = {v: k for k, v in STAGE_CODE_TO_ID.items()}

# Fallback: guess a stage from the tool name alone, for callers that don't
# supply an explicit stage code.
TOOL_TO_STAGE_ID = {}
for _stage in STAGES:
    for _tool in _stage["tools"]:
        TOOL_TO_STAGE_ID.setdefault(_tool, _stage["id"])

# ------------------------------------------------------------------
# Stage-completeness heuristic
#
# For each stage, list the parsed-data keys that indicate the stage
# actually produced something usable to hand off to the next stage. If
# none of a stage's relevant keys have any content, we tell the tester the
# stage doesn't look complete yet rather than silently advancing them.
# ------------------------------------------------------------------

STAGE_RELEVANT_KEYS = {
    1: ["domains", "ips", "emails", "urls"],                 # Information Gathering
    2: ["ports", "ips", "technologies", "paths"],             # Scanning & Enumeration
    3: ["vulns", "cves", "osvdb"],                             # Vulnerability Assessment
    4: ["injectable", "dbms", "params", "hooked_events", "sessions"],  # Exploitation
    5: ["sessions", "agents", "ips"],                          # Post-Exploitation
}


def _is_nonempty(value):
    if value is None:
        return False
    if isinstance(value, (list, tuple, set, dict, str)):
        return len(value) > 0
    if isinstance(value, bool):
        return value
    return bool(value)


def evaluate_stage_completeness(stage_id, data):
    """
    Returns (complete: bool, reason: str).
    """
    relevant_keys = STAGE_RELEVANT_KEYS.get(stage_id, [])
    hits = [k for k in relevant_keys if _is_nonempty(data.get(k))]

    total_lines = data.get("_line_stats", {}).get("total_lines", 0)

    if not total_lines:
        return False, (
            "No output was provided to analyze, so this stage can't be "
            "marked complete yet. Run the tool and paste its output first."
        )

    if hits:
        return True, (
            "This stage produced usable findings ("
            + ", ".join(hits)
            + ") to carry forward to the next stage."
        )

    return False, (
        "The output was received, but no findings relevant to this stage "
        "were detected. Consider re-running the tool with broader options, "
        "or running another tool for this stage, before moving on."
    )


def analyze(tool_name, raw_text, stage_code=None):
    """
    Main entry point.

    tool_name : str, e.g. "Amass", "Nmap"
    raw_text  : str, raw tool output pasted/captured from the terminal
    stage_code: optional str, one of INFO/SCAN/VULN/EXPLOIT/POST. If not
                supplied, it is guessed from tool_name.

    Returns a dict:
        {
            "stage_id": int,
            "stage_code": str,
            "stage_name": str,
            "narrative": str,          # markdown-ish text for display
            "summary_points": [str],
            "data": {...},             # extracted structured data
            "stage_complete": bool,
            "completeness_reason": str,
        }
    """
    stage_id = STAGE_CODE_TO_ID.get(stage_code) if stage_code else None
    if not stage_id:
        stage_id = TOOL_TO_STAGE_ID.get(tool_name, 1)

    parsed = parse_tool_output(tool_name, raw_text or "")
    narrative = build_narrative(stage_id, tool_name, parsed)

    complete, reason = evaluate_stage_completeness(stage_id, parsed.get("data", {}))

    stage_meta = STAGE_BY_ID[stage_id]

    return {
        "stage_id": stage_id,
        "stage_code": STAGE_ID_TO_CODE.get(stage_id),
        "stage_name": stage_meta["name"],
        "narrative": narrative,
        "summary_points": parsed.get("summary_points", []),
        "data": parsed.get("data", {}),
        "stage_complete": complete,
        "completeness_reason": reason,
    }

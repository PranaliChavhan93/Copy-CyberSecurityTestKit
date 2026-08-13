"""
engine.py
---------
Entry point used by the Django backend to turn raw tool output into:
  1. A parsed data dict (via parsers.py)
  2. A structured "AI Analysis Report" (via knowledge_base.py's
     build_report / render_report_markdown), optionally augmented with
     custom guidance retrieved from an offline RAG document store
     (rag_engine.py) and, if available, a local LLM (llm_helper.py).
  3. A stage-completeness verdict, used by the frontend to decide whether
     the "Continue" button is allowed to advance the tester to the next
     stage.

This module has no hard dependency on Streamlit, Django, or any
network/LLM call — the local-LLM integration in llm_helper.py is
entirely optional and only used if a caller explicitly wires it up.
It is the same fully offline, rule-based logic used by the standalone
Pentest Workflow RAG Assistant, wired up so the CyberToolKit backend can
call it directly for any tool output pasted/produced by the tester.

NOTE: The public analyze() signature and returned dict keys are kept
identical to the previous version of this module so that
account/views.py (ai_analyze) keeps working unmodified.
"""

from .parsers import parse_tool_output
from .knowledge_base import STAGE_BY_ID, STAGES, build_report, render_report_markdown

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


def _completeness_reason(report, total_lines):
    """
    Mirrors the previous evaluate_stage_completeness() messaging so the
    frontend text stays consistent, while sourcing the actual verdict
    from the new success_criteria-based report.
    """
    if not total_lines:
        return (
            "No output was provided to analyze, so this stage can't be "
            "marked complete yet. Run the tool and paste its output first."
        )

    if report["success_criteria_met"]:
        return (
            "This stage produced usable findings and meets its success "
            f"criteria ({report['success_criteria_text']})."
        )

    return (
        "The output was received, but the stage's success criteria "
        f"({report['success_criteria_text']}) were not met. Consider "
        "re-running the tool with broader options, or running another "
        "tool for this stage, before moving on."
    )


def analyze(tool_name, raw_text, stage_code=None, rag_store=None):
    """
    Main entry point.

    tool_name : str, e.g. "Amass", "Nmap"
    raw_text  : str, raw tool output pasted/captured from the terminal
    stage_code: optional str, one of INFO/SCAN/VULN/EXPLOIT/POST. If not
                supplied, it is guessed from tool_name.
    rag_store : optional rag_engine.RagStore instance. If supplied and it
                has relevant uploaded reference material (playbooks,
                OWASP notes, prior reports, etc.), that guidance is
                surfaced as "custom guidance" inside the report/narrative.
                Purely additive — the built-in rule-based logic always
                still runs as the offline fallback/baseline.

    Returns a dict:
        {
            "stage_id": int,
            "stage_code": str,
            "stage_name": str,
            "narrative": str,          # markdown "AI Analysis Report"
            "summary_points": [str],
            "data": {...},             # extracted structured data
            "stage_complete": bool,
            "completeness_reason": str,
            "report": {...},           # full structured report dict
        }
    """
    stage_id = STAGE_CODE_TO_ID.get(stage_code) if stage_code else None
    if not stage_id:
        stage_id = TOOL_TO_STAGE_ID.get(tool_name, 1)

    parsed = parse_tool_output(tool_name, raw_text or "")
    total_lines = parsed.get("data", {}).get("_line_stats", {}).get("total_lines", 0)

    report = build_report(stage_id, tool_name, parsed, rag_store=rag_store)
    narrative = render_report_markdown(report)

    stage_meta = STAGE_BY_ID[stage_id]
    stage_complete = bool(total_lines) and report["success_criteria_met"]

    return {
        "stage_id": stage_id,
        "stage_code": STAGE_ID_TO_CODE.get(stage_id),
        "stage_name": stage_meta["name"],
        "narrative": narrative,
        "summary_points": parsed.get("summary_points", []),
        "data": parsed.get("data", {}),
        "stage_complete": stage_complete,
        "completeness_reason": _completeness_reason(report, total_lines),
        "report": report,
    }

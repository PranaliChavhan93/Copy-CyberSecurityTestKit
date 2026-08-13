"""
knowledge_base.py
------------------
Stage/tool definitions plus the rule-based logic that builds the structured
"AI Analysis Report" for each stage:

    Current Stage        -> 1-2 line stage/tool/analysis summary
    Extracted Info        -> precise bullet list of parsed artifacts
    Recommended Next Stage -> tool(s), summary, scan-for, expected output, priority
    Success Criteria      -> the condition that must hold to move on
    Proceed to Next Stage  -> yes/no gate based on that condition

If a RagStore is supplied and it has relevant uploaded reference material
(playbooks, OWASP notes, prior reports, etc.), that guidance is surfaced
first as "custom guidance"; the built-in rule logic always still runs as
the offline fallback/baseline, matching a hybrid retrieval-then-reason flow.
"""

STAGES = [
    {
        "id": 1,
        "name": "Information Gathering",
        "tools": ["theHarvester", "Amass", "Sublist3r", "Assetfinder",
                   "Recon-ng", "Waybackurls", "OWASP ZAP"],
        "blurb": "Passive/active recon: domains, subdomains, emails, historical URLs.",
    },
    {
        "id": 2,
        "name": "Scanning & Enumeration",
        "tools": ["Nmap", "WhatWeb", "Dirsearch", "Burp Suite Community Edition"],
        "blurb": "Identify live hosts, open ports, running services, tech stack, and content.",
    },
    {
        "id": 3,
        "name": "Vulnerability Assessment",
        "tools": ["OWASP ZAP", "Nikto", "Wapiti", "Burp Suite Professional"],
        "blurb": "Map discovered services/endpoints to known weaknesses and misconfigurations.",
    },
    {
        "id": 4,
        "name": "Exploitation",
        "tools": ["SQLmap", "BeEF", "Metasploit Framework", "Burp Suite Professional"],
        "blurb": "Attempt to actively exploit identified vulnerabilities to gain access.",
    },
    {
        "id": 5,
        "name": "Post-Exploitation",
        "tools": ["Empire", "Metasploit Framework", "Netcat"],
        "blurb": "Maintain access, escalate privileges, pivot, and gather evidence.",
    },
]

STAGE_BY_ID = {s["id"]: s for s in STAGES}


def get_tools_for_stage(stage_id):
    return STAGE_BY_ID[stage_id]["tools"]


def _fmt_list(items, limit=8):
    items = list(items)
    if not items:
        return "none"
    shown = items[:limit]
    extra = f" (+{len(items) - limit} more)" if len(items) > limit else ""
    return ", ".join(str(i) for i in shown) + extra

def build_extracted_info(data):
    bullets = []
    if data.get("domains"):
        bullets.append(f"Domains/subdomains ({len(data['domains'])}): {_fmt_list(data['domains'])}")
    if data.get("ips"):
        bullets.append(f"IP addresses ({len(data['ips'])}): {_fmt_list(data['ips'])}")
    if data.get("emails"):
        bullets.append(f"Emails ({len(data['emails'])}): {_fmt_list(data['emails'])}")
    if data.get("urls"):
        bullets.append(f"URLs ({len(data['urls'])}): {_fmt_list(data['urls'])}")
    if data.get("ports"):
        port_strs = [f"{p['port']}/{p['proto']} ({p['service']})" for p in data["ports"]]
        bullets.append(f"Open ports ({len(data['ports'])}): {_fmt_list(port_strs)}")
    if data.get("technologies"):
        bullets.append(f"Technologies ({len(data['technologies'])}): {_fmt_list(data['technologies'])}")
    if data.get("paths"):
        path_strs = [f"{p}[{c}]" for p, c in data["paths"]]
        bullets.append(f"Discovered paths ({len(data['paths'])}): {_fmt_list(path_strs)}")
    if data.get("vulns"):
        bullets.append(f"Vulnerability categories ({len(data['vulns'])}): {_fmt_list(data['vulns'])}")
    if data.get("cves"):
        bullets.append(f"CVE references ({len(data['cves'])}): {_fmt_list(data['cves'])}")
    if data.get("osvdb"):
        bullets.append(f"OSVDB references ({len(data['osvdb'])}): {_fmt_list(data['osvdb'])}")
    if data.get("dbms"):
        bullets.append(f"DBMS fingerprinted: {_fmt_list(data['dbms'])}")
    if data.get("params"):
        bullets.append(f"Injectable parameters ({len(data['params'])}): {_fmt_list(data['params'])}")
    if data.get("sessions"):
        bullets.append(f"Sessions opened ({len(data['sessions'])}): {_fmt_list(data['sessions'])}")
    if data.get("agents"):
        bullets.append(f"C2 agents ({len(data['agents'])}): {_fmt_list(data['agents'])}")
    if data.get("hooked_events"):
        bullets.append(f"Hooked-browser events: {len(data['hooked_events'])}")
    if not bullets:
        bullets.append("No structured artifacts could be extracted from this output.")
    return bullets


def _priority(condition_high, condition_medium=True):
    if condition_high:
        return "High"
    if condition_medium:
        return "Medium"
    return "Low"


def get_recommendations(stage_id, data):
    """Returns a list of recommendation dicts for the NEXT stage's tools."""
    recs = []

    if stage_id == 1:
        has_targets = bool(data.get("domains") or data.get("ips"))
        recs.append({
            "tool": "Nmap", "priority": _priority(has_targets, True),
            "summary": "Port and service scan against discovered hosts/domains.",
            "scan_for": "Open TCP/UDP ports, service versions, OS fingerprint.",
            "expected_output": "List of open ports with service/version banners.",
        })
        recs.append({
            "tool": "WhatWeb", "priority": _priority(False, has_targets),
            "summary": "Fingerprint web technologies on discovered web hosts.",
            "scan_for": "CMS, frameworks, server software, JS libraries.",
            "expected_output": "Technology stack summary per host.",
        })
        recs.append({
            "tool": "Dirsearch", "priority": _priority(False, has_targets),
            "summary": "Brute-force content discovery on discovered web hosts.",
            "scan_for": "Hidden directories/files, admin panels, backup files.",
            "expected_output": "List of accessible paths with HTTP status codes.",
        })

    elif stage_id == 2:
        web_ports = any(str(p.get("port")) in ("80", "443", "8080", "8443")
                         or p.get("service", "").lower() in ("http", "https")
                         for p in data.get("ports", []))
        has_paths = bool(data.get("paths"))
        recs.append({
            "tool": "OWASP ZAP", "priority": _priority(web_ports, True),
            "summary": "Automated web vulnerability scan against discovered services/paths.",
            "scan_for": "OWASP Top 10 issues (XSS, SQLi, misconfiguration, etc.).",
            "expected_output": "Vulnerability list with risk ratings and affected URLs.",
        })
        recs.append({
            "tool": "Nikto", "priority": _priority(False, web_ports),
            "summary": "Web server vulnerability and misconfiguration scan.",
            "scan_for": "Outdated software, default files/pages, server misconfigurations.",
            "expected_output": "Flagged issues with OSVDB/CVE references.",
        })
        recs.append({
            "tool": "Wapiti", "priority": _priority(False, has_paths),
            "summary": "Black-box web application vulnerability scan.",
            "scan_for": "Injection flaws, file disclosure, XSS.",
            "expected_output": "Per-endpoint vulnerability report.",
        })

    elif stage_id == 3:
        vulns = [v.lower() for v in data.get("vulns", [])]
        has_sqli = any("sql" in v for v in vulns)
        has_xss = any("xss" in v or "cross-site scripting" in v for v in vulns)
        has_cves = bool(data.get("cves"))
        recs.append({
            "tool": "SQLmap", "priority": _priority(has_sqli, has_cves),
            "summary": "Automated exploitation of suspected SQL injection points.",
            "scan_for": "Injectable parameters, back-end DBMS, data exfiltration paths.",
            "expected_output": "Confirmed injection, DBMS fingerprint, extracted data (if authorized).",
        })
        recs.append({
            "tool": "Metasploit Framework", "priority": _priority(has_cves, True),
            "summary": "Exploit known CVEs / vulnerable services using matching modules.",
            "scan_for": "Exploitable services matching identified CVEs/versions.",
            "expected_output": "Shell/session on target if exploit succeeds.",
        })
        recs.append({
            "tool": "BeEF", "priority": _priority(has_xss, False),
            "summary": "Hook and exploit browsers via confirmed XSS vectors.",
            "scan_for": "Exploitable XSS injection points.",
            "expected_output": "Hooked browser session(s) for client-side exploitation.",
        })

    elif stage_id == 4:
        exploited = bool(data.get("injectable") or data.get("sessions") or data.get("hooked_events"))
        recs.append({
            "tool": "Metasploit Framework", "priority": _priority(exploited, True),
            "summary": "Deploy post-exploitation modules on the compromised host.",
            "scan_for": "Local privilege escalation paths, stored credentials, sensitive files.",
            "expected_output": "Elevated privileges, additional loot, persistence options.",
        })
        recs.append({
            "tool": "Empire", "priority": _priority(exploited, False),
            "summary": "Establish a C2 channel for persistence and lateral movement.",
            "scan_for": "Domain trusts, reachable internal hosts, credential material.",
            "expected_output": "Active agent(s) with persistence configured.",
        })
        recs.append({
            "tool": "Netcat", "priority": _priority(False, exploited),
            "summary": "Set up additional listeners/pivots as needed.",
            "scan_for": "Reachable internal segments for pivoting.",
            "expected_output": "Working reverse/bind shell or pivot tunnel.",
        })

    elif stage_id == 5:
        recs.append({
            "tool": "Reporting / Cleanup", "priority": "High",
            "summary": "Document access gained, privilege level, and lateral movement paths.",
            "scan_for": "N/A — evidence collection and engagement close-out.",
            "expected_output": "Final report with timeline, evidence, and remediation guidance.",
        })

    return sorted(recs, key=lambda r: {"High": 0, "Medium": 1, "Low": 2}[r["priority"]])

def success_criteria(stage_id, data):
    """Returns (met: bool, criteria_text: str)."""
    if stage_id == 1:
        met = bool(data.get("domains") or data.get("ips") or data.get("emails"))
        return met, "at least one domain, IP address, or email has been identified."
    if stage_id == 2:
        met = bool(data.get("ports") or data.get("paths") or data.get("technologies"))
        return met, "at least one open port, discovered path, or technology fingerprint has been identified."
    if stage_id == 3:
        met = bool(data.get("vulns") or data.get("cves") or data.get("osvdb"))
        return met, "at least one vulnerability category or CVE/OSVDB reference has been identified."
    if stage_id == 4:
        met = bool(data.get("injectable") or data.get("sessions") or data.get("hooked_events") or data.get("log_hits"))
        return met, "exploitation success has been confirmed (session opened, injection confirmed, or browser hooked)."
    if stage_id == 5:
        met = bool(data.get("sessions") or data.get("agents") or data.get("ips") or data.get("hooked_events"))
        return met, "post-exploitation evidence (active session, C2 agent, or access artifact) has been documented."
    return False, "n/a"


def current_stage_summary(stage_id, tool_name, summary_points):
    stage = STAGE_BY_ID[stage_id]
    headline = summary_points[0] if summary_points else "No significant findings in this output."
    return (f"Stage {stage_id} – {stage['name']} was analyzed using **{tool_name}**. {headline}.")


def get_custom_guidance(rag_store, stage_id, tool_name):
    """
    Hybrid retrieval: search the user's uploaded knowledge base for guidance
    relevant to this stage/tool. Returns a list of {"doc", "text", "score"}
    or an empty list if no store is attached / nothing relevant is found.
    This is purely additive — built-in recommendations always still apply.
    """
    if rag_store is None or rag_store.is_empty():
        return []
    stage = STAGE_BY_ID[stage_id]
    query = f"{stage['name']} {tool_name} stage {stage_id} recommendations methodology"
    return rag_store.search(query, top_k=2, min_score=0.08)


def build_report(stage_id, tool_name, parsed_result, rag_store=None):
    """
    Builds the structured AI Analysis Report as a dict. Rendering to
    markdown is handled separately by render_report_markdown().
    """
    data = parsed_result.get("data", {})
    summary_points = parsed_result.get("summary_points", [])

    met, criteria_text = success_criteria(stage_id, data)
    next_stage = STAGE_BY_ID.get(stage_id + 1)

    report = {
        "stage_id": stage_id,
        "stage_name": STAGE_BY_ID[stage_id]["name"],
        "tool": tool_name,
        "current_stage_summary": current_stage_summary(stage_id, tool_name, summary_points),
        "extracted_info": build_extracted_info(data),
        "recommendations": get_recommendations(stage_id, data) if next_stage else [],
        "next_stage_name": next_stage["name"] if next_stage else None,
        "success_criteria_met": met,
        "success_criteria_text": criteria_text,
        "proceed_to_next_stage": met and next_stage is not None,
        "custom_guidance": get_custom_guidance(rag_store, stage_id, tool_name),
    }
    return report


def render_report_markdown(report):
    """Formats the structured report dict into the requested markdown layout."""
    lines = []
    lines.append("## 🧾 AI Analysis Report")
    lines.append("")
    lines.append(f"**Current Stage:** {report['current_stage_summary']}")
    lines.append("")
    lines.append("**Extracted Info:**")
    for b in report["extracted_info"]:
        lines.append(f"- {b}")
    lines.append("")

    if report["recommendations"]:
        lines.append(f"**Recommended Next Stage — {report['next_stage_name']}:**")
        lines.append("")
        lines.append("| Priority | Tool | Summary | Scan For | Expected Output |")
        lines.append("|---|---|---|---|---|")
        badge = {"High": "🔴 High", "Medium": "🟡 Medium", "Low": "🟢 Low"}
        for r in report["recommendations"]:
            lines.append(
                f"| {badge[r['priority']]} | {r['tool']} | {r['summary']} "
                f"| {r['scan_for']} | {r['expected_output']} |"
            )
        lines.append("")

    if report["custom_guidance"]:
        lines.append("**📚 Custom guidance from your knowledge base:**")
        for g in report["custom_guidance"]:
            snippet = g["text"].strip().replace("\n", " ")
            if len(snippet) > 280:
                snippet = snippet[:280].rsplit(" ", 1)[0] + "…"
            lines.append(f"- _(from **{g['doc']}**, relevance {g['score']})_ {snippet}")
        lines.append("")

    gate = "✅ Met" if report["success_criteria_met"] else "❌ Not met"
    lines.append(f"**Success Criteria:** Processed only when {report['success_criteria_text']} — {gate}")
    lines.append("")
    proceed = "✅ Yes — proceed to next stage." if report["proceed_to_next_stage"] else (
        "⛔ No — stay on this stage / gather more data before proceeding."
        if report["next_stage_name"] else "🏁 Final stage — engagement analysis complete."
    )
    lines.append(f"**Proceed to Next Stage:** {proceed}")

    return "\n".join(lines)

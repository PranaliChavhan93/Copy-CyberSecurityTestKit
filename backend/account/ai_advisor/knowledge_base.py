"""
knowledge_base.py
------------------
Offline Pentest Workflow Knowledge Base

Contains:
    • Pentest stages
    • Tool mapping
    • Narrative generation
    • Recommendation engine
"""

# ==========================================================
# Pentest Workflow Stages
# ==========================================================

STAGES = [

    {
        "id": 1,
        "name": "Information Gathering",
        "tools": [
            "theHarvester",
            "Amass",
            "Sublist3r",
            "Assetfinder",
            "Recon-ng",
            "Waybackurls",
            "OWASP ZAP"
        ],
        "blurb": (
            "Collect publicly available information about the target including "
            "domains, subdomains, IP addresses, DNS records, technologies, "
            "emails and historical URLs."
        ),
    },

    {
        "id": 2,
        "name": "Scanning & Enumeration",
        "tools": [
            "Nmap",
            "WhatWeb",
            "Dirsearch",
            "Burp Suite Community Edition"
        ],
        "blurb": (
            "Identify live systems, running services, technologies, "
            "web directories and application endpoints."
        ),
    },

    {
        "id": 3,
        "name": "Vulnerability Assessment",
        "tools": [
            "OWASP ZAP",
            "Nikto",
            "Wapiti",
            "Burp Suite Professional"
        ],
        "blurb": (
            "Identify vulnerabilities, CVEs, insecure configurations, "
            "authentication weaknesses and web application flaws."
        ),
    },

    {
        "id": 4,
        "name": "Exploitation",
        "tools": [
            "SQLmap",
            "BeEF",
            "Metasploit Framework",
            "Burp Suite Professional"
        ],
        "blurb": (
            "Validate discovered vulnerabilities through controlled exploitation "
            "to demonstrate real-world impact."
        ),
    },

    {
        "id": 5,
        "name": "Post-Exploitation",
        "tools": [
            "Empire",
            "Metasploit Framework",
            "Netcat"
        ],
        "blurb": (
            "Privilege escalation, persistence, lateral movement, evidence "
            "collection and engagement cleanup."
        ),
    }

]

# ==========================================================

STAGE_BY_ID = {stage["id"]: stage for stage in STAGES}

# ==========================================================


def get_tools_for_stage(stage_id):
    return STAGE_BY_ID[stage_id]["tools"]


# ==========================================================


def _fmt_list(items, limit=10):

    items = list(items)

    if not items:
        return "None"

    shown = items[:limit]

    if len(items) > limit:
        return ", ".join(map(str, shown)) + f" (+{len(items)-limit} more)"

    return ", ".join(map(str, shown))


# ==========================================================


def build_narrative(stage_id, tool_name, parsed_result):

    stage = STAGE_BY_ID[stage_id]

    data = parsed_result.get("data", {})
    summary = parsed_result.get("summary_points", [])

    report = []

    report.append(f"# Stage {stage_id}: {stage['name']}")
    # report.append("")
    report.append(f"## Tool Used")
    report.append(f"**{tool_name}**")
    # report.append("")
    # report.append("---")
    # report.append("")
    report.append("## Objective")
    report.append(stage["blurb"])
    # report.append("")
    # report.append("---")
    # report.append("")
    report.append("## Analysis Summary")

    if summary:

        for item in summary:
            report.append(f"- {item}")

    else:

        report.append("- No significant findings detected.")

    report.append("")
    report.append("---")
    report.append("")
    report.append("## Extracted Information")

    if data.get("domains"):
        report.append(
            f"**Domains/Subdomains** : {_fmt_list(data['domains'])}"
        )

    if data.get("ips"):
        report.append(
            f"**IP Addresses** : {_fmt_list(data['ips'])}"
        )

    if data.get("emails"):
        report.append(
            f"**Emails** : {_fmt_list(data['emails'])}"
        )

    if data.get("urls"):
        report.append(
            f"**URLs** : {_fmt_list(data['urls'])}"
        )

    if data.get("ports"):

        ports = []

        for p in data["ports"]:
            ports.append(
                f"{p['port']}/{p['proto']} ({p['service']})"
            )

        report.append(
            f"**Open Ports** : {_fmt_list(ports)}"
        )

    if data.get("paths"):

        paths = []

        for path, code in data["paths"]:
            paths.append(f"{path} [{code}]")

        report.append(
            f"**Directories** : {_fmt_list(paths)}"
        )

    if data.get("vulns"):
        report.append(
            f"**Vulnerabilities** : {_fmt_list(data['vulns'])}"
        )

    if data.get("cves"):
        report.append(
            f"**CVEs** : {_fmt_list(data['cves'])}"
        )

    if data.get("dbms"):
        report.append(
            f"**Database** : {_fmt_list(data['dbms'])}"
        )

    if data.get("params"):
        report.append(
            f"**Injectable Parameters** : {_fmt_list(data['params'])}"
        )

    if data.get("sessions"):
        report.append(
            f"**Sessions** : {_fmt_list(data['sessions'])}"
        )

    if data.get("agents"):
        report.append(
            f"**Agents** : {_fmt_list(data['agents'])}"
        )

    report.append("")
    report.append("---")
    report.append("")
    report.append("# Recommended Next Step")
    report.append("")
    report.append(next_step_hint(stage_id, data))

    return "\n".join(report)


# ==========================================================


def next_step_hint(stage_id, data):

    # ==========================================================
    # STAGE 1
    # ==========================================================

    if stage_id == 1:

        domains = len(data.get("domains", []))
        ips = len(data.get("ips", []))
        emails = len(data.get("emails", []))
        urls = len(data.get("urls", []))

        return f"""
## Objective

The Information Gathering phase has successfully collected publicly
available intelligence about the target organization.

The next objective is to enumerate every discovered asset to determine
which systems are reachable and identify the services exposed to the network.

---

## Assets Collected

• Domains / Subdomains : {domains}

• IP Addresses : {ips}

• Email Addresses : {emails}

• Historical URLs : {urls}

---

# Recommended Workflow

## Step 1 – Host Discovery

### Tool
**Nmap**

### Purpose

Determine which discovered hosts are alive.

### Recommended Commands

- Ping Scan
- TCP SYN Scan
- Version Detection
- OS Detection

### Expected Output

• Live Hosts

• Open Ports

• Running Services

• Operating System

---

## Step 2 – Technology Fingerprinting

### Tool

**WhatWeb**

### Purpose

Identify technologies running on every web application.

Collect

• Web Server

• CMS

• Framework

• Programming Language

• JavaScript Libraries

• CDN

• WAF

---

## Step 3 – Directory Enumeration

### Tool

**Dirsearch**

### Purpose

Discover hidden resources.

Look for

• /admin

• /login

• /dashboard

• /backup

• /config

• /uploads

• API endpoints

---

## Step 4 – Manual Enumeration

### Tool

**Burp Suite Community Edition**

### Verify

• Authentication

• Session Cookies

• HTTP Headers

• Parameters

• Forms

• APIs

---

# Expected Deliverables

Before moving to Stage 3 you should have:

✅ Live Hosts

✅ Open Ports

✅ Technologies

✅ Hidden Directories

✅ Web Applications

✅ API Endpoints

---

# Data Passed to Stage 2

The following information should be available:

• Host List

• Open Ports

• Technologies

• HTTP Services

• Directories

• Parameters

Proceed to **Stage 2 – Scanning & Enumeration**
"""

    # ==========================================================
    # STAGE 2
    # ==========================================================

    elif stage_id == 2:

        ports = len(data.get("ports", []))
        paths = len(data.get("paths", []))

        return f"""
## Objective

The Scanning & Enumeration stage has identified the network services,
applications and exposed endpoints.

The next objective is to determine whether these services contain known
security vulnerabilities.

---

## Enumeration Summary

Open Services : {ports}

Directories Found : {paths}

---

# Recommended Workflow

## Step 1 – Automated Web Scan

### Tool

**OWASP ZAP**

### Scan For

• SQL Injection

• Cross Site Scripting

• CSRF

• Authentication Issues

• Session Issues

• Sensitive Information Disclosure

Expected Output

• Risk Rating

• Vulnerable URLs

• Attack Evidence

---

## Step 2 – Web Server Assessment

### Tool

**Nikto**

### Scan For

• Default Files

• Dangerous HTTP Methods

• Missing Security Headers

• Backup Files

• Known Server Vulnerabilities

• Weak SSL Configuration

---

## Step 3 – Application Vulnerability Scan

### Tool

**Wapiti**

Focus On

• SQL Injection

• File Inclusion

• Command Injection

• XXE

• SSRF

• Open Redirect

• CRLF Injection

---

## Step 4 – Manual Verification

### Tool

**Burp Suite Professional**

Verify

• Every High Severity Issue

• Authentication Logic

• Session Handling

• Authorization

• Input Validation

• Business Logic

---

# Prioritize Findings

High Priority

• Remote Code Execution

• SQL Injection

• Authentication Bypass

• SSRF

Medium Priority

• XSS

• File Inclusion

• Directory Traversal

Low Priority

• Information Disclosure

• Missing Headers

• Cookie Issues

---

# Success Criteria

Proceed only when

✅ Every service has been scanned

✅ Every endpoint assessed

✅ False positives removed

✅ CVEs identified

✅ Risk levels assigned

---

# Data Passed to Stage 3

• Vulnerability List

• CVEs

• Risk Levels

• Vulnerable URLs

• Injectable Parameters

Proceed to **Stage 3 – Vulnerability Assessment**
"""

    # ==========================================================
    # STAGE 3
    # ==========================================================

    elif stage_id == 3:

        vulns = len(data.get("vulns", []))
        cves = len(data.get("cves", []))
        params = len(data.get("params", []))

        return f"""
## Objective

The Vulnerability Assessment phase has identified potential security
weaknesses within the target environment.

The next objective is to validate these findings through controlled
exploitation while remaining within the authorized engagement scope.

---

## Assessment Summary

Vulnerabilities Identified : {vulns}

CVE References : {cves}

Injectable Parameters : {params}

---

# Recommended Workflow

## Step 1 – Prioritize Vulnerabilities

Prioritize vulnerabilities according to business impact.

### Critical

• Remote Code Execution

• Authentication Bypass

• SQL Injection

• Privilege Escalation

### High

• Command Injection

• Deserialization

• SSRF

### Medium

• Cross Site Scripting

• File Inclusion

• Directory Traversal

### Low

• Missing Headers

• Version Disclosure

• Cookie Issues

---

## Step 2 – Database Exploitation

### Tool

**SQLmap**

### Verify

• SQL Injection

• Database Type

• Database Enumeration

• Tables

• Columns

• Sensitive Records

---

## Step 3 – Network Exploitation

### Tool

**Metasploit Framework**

Perform

• Version Matching

• CVE Validation

• Exploit Execution

• Session Verification

• Payload Testing

Expected Output

• Meterpreter Session

• Shell Access

• Evidence of Exploitation

---

## Step 4 – Browser Exploitation

### Tool

**BeEF**

Use when

• XSS exists

• Browser Hook is possible

Validate

• Session Hijacking

• Browser Fingerprinting

• Client-side Impact

---

## Verification Checklist

Before moving to the next stage ensure:

✅ Exploit successfully reproduced

✅ Screenshots captured

✅ Commands logged

✅ Evidence collected

✅ Business impact documented

---

# Data Passed to Stage 4

• Successful Exploits

• Shell Access

• Database Dump

• Credentials

• Sessions

Proceed to **Stage 4 – Exploitation**
"""

    # ==========================================================
    # STAGE 4
    # ==========================================================

    elif stage_id == 4:

        success = (
            data.get("injectable")
            or data.get("sessions")
            or data.get("hooked_events")
        )

        if success:

            return """
## Objective

Exploitation was successful.

The next objective is to determine the potential impact after gaining
authorized access.

---

# Recommended Workflow

## Step 1 – Privilege Escalation

Identify

• Administrator Privileges

• Root Privileges

• Misconfigured Services

• Weak Permissions

• SUID Files

---

## Step 2 – Credential Collection

Collect

• Password Hashes

• Tokens

• SSH Keys

• API Keys

• Browser Credentials

---

## Step 3 – Persistence

### Tool

**Empire**

Create temporary persistence only if explicitly authorized.

Examples

• Scheduled Tasks

• Startup Entries

• PowerShell Agents

---

## Step 4 – Internal Enumeration

Discover

• Internal Hosts

• File Shares

• Active Directory

• Domain Controllers

• Sensitive Servers

---

## Step 5 – Network Pivoting

If permitted

• Route Traffic

• Access Internal Services

• Validate Segmentation

---

## Step 6 – Evidence Collection

Document

• Screenshots

• Command Output

• Session IDs

• Files Accessed

• Proof of Impact

---

## Success Criteria

✅ Privilege Level Recorded

✅ Evidence Captured

✅ No Unauthorized Changes

✅ All Actions Logged

Proceed to **Stage 5 – Post-Exploitation**
"""

        return """
## Objective

No successful exploitation was detected.

---

## Recommended Actions

• Verify the vulnerability manually.

• Remove false positives.

• Check software versions.

• Confirm authentication requirements.

• Try an alternative exploit.

• Review exploit parameters.

• Re-run SQLmap or Metasploit with corrected options.

---

Only proceed to Post-Exploitation after successful exploitation has been demonstrated.
"""

    # ==========================================================
    # STAGE 5
    # ==========================================================

    elif stage_id == 5:

        return """
## Objective

The penetration test is complete.

The final phase focuses on documenting findings,
removing temporary artifacts, and preparing the final report.

---

# Final Checklist

## Documentation

Include

• Executive Summary

• Technical Summary

• Scope

• Methodology

• Timeline

• Risk Matrix

---

## Evidence

Attach

• Screenshots

• Logs

• Terminal Output

• Exploit Commands

• Vulnerable Requests

• Responses

---

## Risk Assessment

Document

• Critical Findings

• High Findings

• Medium Findings

• Low Findings

Assign

• CVSS Score

• Business Impact

• Remediation Priority

---

## Cleanup

Remove

• Test Accounts

• Sessions

• Payloads

• Temporary Files

• Persistence Mechanisms

• Scheduled Tasks

• Registry Changes

---

## Remediation Guidance

Provide

• Root Cause

• Affected Assets

• Recommended Fix

• Verification Steps

• References

---

## Deliverables

The engagement should include:

✅ Executive Report

✅ Technical Report

✅ Vulnerability List

✅ CVE References

✅ Screenshots

✅ Proof of Concept

✅ Remediation Recommendations

✅ Cleanup Confirmation

---

# Engagement Status

**Penetration Test Completed Successfully**

The final report is now ready for delivery to the client.
"""

    return "Continue to the next stage."
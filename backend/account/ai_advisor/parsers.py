"""
parsers.py
----------
Fully offline, regex/rule-based parsing engine for pentest tool output.

Every function here works purely on the text the user pastes in — no network
calls, no external services. Add a new tool by writing a small parse_xxx()
function and registering it in TOOL_PARSERS at the bottom of the file.
"""

import re
from collections import Counter

# ============================================================
# GENERIC EXTRACTORS (reused across many tools)
# ============================================================

def extract_emails(text):
    return sorted(set(re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)))


def extract_ips(text):
    ips = re.findall(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', text)
    # drop obviously invalid octets like 999.999.999.999
    valid = [ip for ip in ips if all(0 <= int(o) <= 255 for o in ip.split('.'))]
    return sorted(set(valid))


def extract_domains(text):
    candidates = re.findall(
        r'\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b', text
    )
    # filter out things that are actually IPs
    return sorted(set(c for c in candidates if not re.match(r'^\d+\.\d+\.\d+\.\d+$', c)))


def extract_urls(text):
    return sorted(set(re.findall(r'https?://[^\s"\'<>\)\]]+', text)))


def extract_cves(text):
    return sorted(set(re.findall(r'CVE-\d{4}-\d{4,7}', text, re.IGNORECASE)))


def extract_open_ports(text):
    """Matches nmap-style lines: '80/tcp   open  http    Apache httpd 2.4.41'"""
    rows = re.findall(
        r'(\d{1,5})/(tcp|udp)\s+open\s+(\S+)\s*(.*)', text, re.IGNORECASE
    )
    return [{"port": p, "proto": proto, "service": svc, "banner": banner.strip()}
            for p, proto, svc, banner in rows]


def extract_status_paths(text):
    """Matches dirsearch/ffuf/gobuster style: '/admin  (Status: 200)' or '/admin 200'"""
    rows = re.findall(r'(/[\w\-./]*)\s*[\[\(]?(?:Status:?\s*)?(\d{3})', text)
    return sorted(set(rows))


def extract_creds(text):
    rows = re.findall(
        r'([\w.\-@]+)\s*[:/]\s*(\S{3,})\s*(?=.*?(?:login|success|valid|granted|password))',
        text, re.IGNORECASE
    )
    return rows


def extract_sessions(text):
    return re.findall(r'(?:session|meterpreter)\s*(\d+)\s*(?:opened|created)', text, re.IGNORECASE)


def extract_vuln_keywords(text):
    keywords = [
        "sql injection", "xss", "cross-site scripting", "csrf", "rce",
        "remote code execution", "lfi", "rfi", "xxe", "ssrf", "idor",
        "authentication bypass", "privilege escalation", "buffer overflow",
        "directory traversal", "outdated", "vulnerable", "misconfiguration",
        "weak password", "default credential", "clickjacking", "open redirect"
    ]
    found = []
    low = text.lower()
    for kw in keywords:
        if kw in low:
            found.append(kw)
    return sorted(set(found))


def line_stats(text):
    lines = [l for l in text.splitlines() if l.strip()]
    return {"total_lines": len(lines)}


# ============================================================
# TOOL-SPECIFIC PARSERS
# Each returns a dict: {"summary_points": [...], "data": {...}}
# ============================================================

def parse_theharvester(text):
    emails = extract_emails(text)
    domains = extract_domains(text)
    ips = extract_ips(text)
    return {
        "summary_points": [
            f"{len(emails)} email address(es) discovered" if emails else "No emails found",
            f"{len(domains)} host/subdomain name(s) discovered" if domains else "No subdomains found",
            f"{len(ips)} IP address(es) discovered" if ips else "No IPs found",
        ],
        "data": {"emails": emails, "domains": domains, "ips": ips}
    }


def parse_amass(text):
    domains = extract_domains(text)
    ips = extract_ips(text)
    return {
        "summary_points": [
            f"{len(domains)} subdomain(s) enumerated",
            f"{len(ips)} associated IP address(es) resolved" if ips else "No resolved IPs in output",
        ],
        "data": {"domains": domains, "ips": ips}
    }


def parse_sublist3r(text):
    domains = extract_domains(text)
    return {
        "summary_points": [f"{len(domains)} subdomain(s) found"],
        "data": {"domains": domains}
    }


def parse_assetfinder(text):
    domains = extract_domains(text)
    return {
        "summary_points": [f"{len(domains)} asset/subdomain entries found"],
        "data": {"domains": domains}
    }


def parse_recon_ng(text):
    emails = extract_emails(text)
    domains = extract_domains(text)
    ips = extract_ips(text)
    return {
        "summary_points": [
            "Recon-ng module output captured",
            f"{len(domains)} domain(s), {len(emails)} email(s), {len(ips)} IP(s) parsed"
        ],
        "data": {"domains": domains, "emails": emails, "ips": ips}
    }


def parse_waybackurls(text):
    urls = extract_urls(text)
    # interesting params/extensions worth flagging for later stages
    interesting = [u for u in urls if re.search(r'\.(php|asp|aspx|jsp)\?|=', u)]
    return {
        "summary_points": [
            f"{len(urls)} historical URL(s) pulled from the Wayback Machine",
            f"{len(interesting)} URL(s) contain parameters — candidates for injection testing"
        ],
        "data": {"urls": urls, "parameterized_urls": interesting}
    }


def parse_owasp_zap(text):
    vulns = extract_vuln_keywords(text)
    urls = extract_urls(text)
    cves = extract_cves(text)
    return {
        "summary_points": [
            f"{len(vulns)} vulnerability categor(y/ies) referenced: {', '.join(vulns) if vulns else 'none matched'}",
            f"{len(urls)} URL(s)/endpoints referenced in scan output",
            f"{len(cves)} CVE reference(s) found" if cves else "No CVE IDs found"
        ],
        "data": {"vulns": vulns, "urls": urls, "cves": cves}
    }


def parse_nmap(text):
    ports = extract_open_ports(text)
    ips = extract_ips(text)
    services = Counter(p["service"] for p in ports)
    return {
        "summary_points": [
            f"{len(ports)} open port(s) identified across {len(ips) or 1} host(s)",
            f"Top services: {', '.join(f'{s}({c})' for s, c in services.most_common(5))}" if services else "No services identified"
        ],
        "data": {"ports": ports, "ips": ips}
    }


def parse_whatweb(text):
    techs = re.findall(r'\[([^\]]+)\]', text)
    ips = extract_ips(text)
    return {
        "summary_points": [
            f"{len(set(techs))} technology fingerprint tag(s) detected",
        ],
        "data": {"technologies": sorted(set(techs)), "ips": ips}
    }


def parse_dirsearch(text):
    paths = extract_status_paths(text)
    interesting = [p for p, code in paths if code in ("200", "301", "302", "403")]
    return {
        "summary_points": [
            f"{len(paths)} path(s)/endpoint(s) discovered",
            f"{len(interesting)} return interesting status codes (200/301/302/403)"
        ],
        "data": {"paths": paths}
    }


def parse_burp(text):
    vulns = extract_vuln_keywords(text)
    urls = extract_urls(text)
    return {
        "summary_points": [
            f"{len(vulns)} issue categor(y/ies) referenced",
            f"{len(urls)} URL(s)/request target(s) referenced"
        ],
        "data": {"vulns": vulns, "urls": urls}
    }


def parse_nikto(text):
    vulns = extract_vuln_keywords(text)
    osvdb = re.findall(r'OSVDB-\d+', text)
    cves = extract_cves(text)
    return {
        "summary_points": [
            f"{len(osvdb)} OSVDB reference(s) found",
            f"{len(cves)} CVE reference(s) found" if cves else "No CVE IDs found",
            f"Keyword hits: {', '.join(vulns)}" if vulns else "No known vuln keywords matched"
        ],
        "data": {"osvdb": osvdb, "cves": cves, "vulns": vulns}
    }


def parse_wapiti(text):
    vulns = extract_vuln_keywords(text)
    urls = extract_urls(text)
    return {
        "summary_points": [
            f"{len(vulns)} vulnerability categor(y/ies) referenced",
            f"{len(urls)} affected URL(s) listed"
        ],
        "data": {"vulns": vulns, "urls": urls}
    }


def parse_sqlmap(text):
    injectable = "vulnerable" in text.lower() or "is vulnerable" in text.lower()
    dbms = re.findall(r'back-end DBMS:\s*(.+)', text, re.IGNORECASE)
    params = re.findall(r"Parameter:\s*'?([\w\-]+)'?", text)
    return {
        "summary_points": [
            "Target parameter appears injectable" if injectable else "No confirmed injection in this output",
            f"DBMS fingerprinted: {dbms[0].strip()}" if dbms else "DBMS not identified in output",
            f"{len(set(params))} parameter(s) flagged as injectable" if params else "No specific parameters flagged"
        ],
        "data": {"injectable": injectable, "dbms": dbms, "params": sorted(set(params))}
    }


def parse_beef(text):
    hooked = re.findall(r'(?:hooked|new browser)[^\n]*', text, re.IGNORECASE)
    ips = extract_ips(text)
    return {
        "summary_points": [
            f"{len(hooked)} hooked-browser event line(s) found",
            f"{len(ips)} IP(s) referenced"
        ],
        "data": {"hooked_events": hooked, "ips": ips}
    }


def parse_metasploit(text):
    sessions = extract_sessions(text)
    exploited = re.findall(r'\[?\+?\]?\s*(?:exploit completed|command shell session|meterpreter session)[^\n]*',
                            text, re.IGNORECASE)
    return {
        "summary_points": [
            f"{len(sessions)} session(s) reported opened" if sessions else "No new sessions detected in this output",
            f"{len(exploited)} exploitation-related log line(s) found"
        ],
        "data": {"sessions": sessions, "log_hits": exploited}
    }


def parse_empire(text):
    agents = re.findall(r'(?:new agent|agent)\s*[:\s]\s*([\w\-]+)', text, re.IGNORECASE)
    return {
        "summary_points": [
            f"{len(set(agents))} C2 agent reference(s) found" if agents else "No agent check-ins matched"
        ],
        "data": {"agents": sorted(set(agents))}
    }


def parse_netcat(text):
    ips = extract_ips(text)
    listening = "listening on" in text.lower()
    connected = "connect to" in text.lower() or "open" in text.lower()
    return {
        "summary_points": [
            "Listener/connection activity detected" if (listening or connected) else "No clear connection markers found",
            f"{len(ips)} IP(s) referenced"
        ],
        "data": {"ips": ips}
    }


def parse_generic(text):
    """Fallback parser used for any tool without a dedicated handler."""
    return {
        "summary_points": [
            "Generic extraction applied (no dedicated parser for this tool)",
        ],
        "data": {
            "emails": extract_emails(text),
            "domains": extract_domains(text),
            "ips": extract_ips(text),
            "urls": extract_urls(text),
            "cves": extract_cves(text),
            "vulns": extract_vuln_keywords(text),
        }
    }


# ============================================================
# REGISTRY: tool name -> parser function
# ============================================================

TOOL_PARSERS = {
    "theHarvester": parse_theharvester,
    "Amass": parse_amass,
    "Sublist3r": parse_sublist3r,
    "Assetfinder": parse_assetfinder,
    "Recon-ng": parse_recon_ng,
    "Waybackurls": parse_waybackurls,
    "OWASP ZAP": parse_owasp_zap,

    "Nmap": parse_nmap,
    "WhatWeb": parse_whatweb,
    "Dirsearch": parse_dirsearch,
    "Burp Suite Community Edition": parse_burp,

    "Nikto": parse_nikto,
    "Wapiti": parse_wapiti,
    "Burp Suite Professional": parse_burp,

    "SQLmap": parse_sqlmap,
    "BeEF": parse_beef,
    "Metasploit Framework": parse_metasploit,

    "Empire": parse_empire,
    "Netcat": parse_netcat,
}


def parse_tool_output(tool_name, raw_text):
    """Main entry point used by the Streamlit app."""
    if not raw_text or not raw_text.strip():
        return {"summary_points": ["No input provided."], "data": {}}
    parser = TOOL_PARSERS.get(tool_name, parse_generic)
    result = parser(raw_text)
    result["data"]["_line_stats"] = line_stats(raw_text)
    return result

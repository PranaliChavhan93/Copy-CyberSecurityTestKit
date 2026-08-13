"""
llm_helper.py
-------------
Optional integration with a LOCAL LLM served by Ollama (http://localhost:11434).
This is entirely optional and entirely offline — Ollama runs models on your own
machine, no internet/API key required. If Ollama isn't running, everything in
this app still works using the rule-based narratives from knowledge_base.py.
"""

import json
import urllib.request
import urllib.error

OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3"
TIMEOUT_SECONDS = 6


def is_ollama_available():
    try:
        req = urllib.request.Request("http://localhost:11434/api/tags")
        urllib.request.urlopen(req, timeout=2)
        return True
    except Exception:
        return False


def ask_local_llm(prompt, model=DEFAULT_MODEL, context_text=""):
    """
    Sends a prompt to a locally running Ollama model. Returns the response
    text, or None if Ollama is unavailable/errors out (caller should fall
    back to rule-based logic in that case).
    """
    full_prompt = prompt if not context_text else f"{prompt}\n\nContext:\n{context_text}"
    payload = {
        "model": model,
        "prompt": full_prompt,
        "stream": False,
    }
    try:
        req = urllib.request.Request(
            OLLAMA_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return body.get("response", "").strip() or None
    except (urllib.error.URLError, TimeoutError, Exception):
        return None

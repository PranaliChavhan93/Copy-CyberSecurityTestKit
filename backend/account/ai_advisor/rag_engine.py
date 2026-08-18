"""
rag_engine.py
--------------
A small, fully offline Retrieval-Augmented layer.

Design goals (per requirements):
- No internet / no embedding API calls — everything runs locally.
- "Hybrid search": combines (a) TF-IDF cosine similarity (captures topical
  relevance even without exact word matches) with (b) an exact lexical
  match bonus (rewards chunks that literally contain the query terms/phrase).
- Works over documents the user uploads (methodology guides, playbooks,
  OWASP testing notes, prior reports, cheat sheets, etc.) stored as plain
  text/markdown, or PDF if `pypdf` is installed.
 
Usage:
    store = RagStore()
    store.add_document("playbook.md", text)
    store.build_index()
    hits = store.search("nmap recommendations for stage 2", top_k=3)
"""

import re
import math
from collections import Counter, defaultdict

_STOPWORDS = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are",
    "was", "were", "be", "been", "with", "as", "by", "at", "this", "that",
    "it", "from", "we", "you", "your", "our", "i", "if", "then", "so", "do",
    "does", "did", "will", "shall", "can", "could", "should", "would",
}

CHUNK_SIZE_WORDS = 160
CHUNK_OVERLAP_WORDS = 40


def _tokenize(text):
    words = re.findall(r"[a-zA-Z0-9\-']+", text.lower())
    return [w for w in words if w not in _STOPWORDS and len(w) > 1]


def _chunk_text(text, size=CHUNK_SIZE_WORDS, overlap=CHUNK_OVERLAP_WORDS):
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + size, len(words))
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        if end == len(words):
            break
        start = end - overlap
    return chunks


def try_extract_pdf_text(file_bytes):
    """Best-effort local PDF text extraction. Returns '' if pypdf isn't installed."""
    try:
        from pypdf import PdfReader
        import io
        reader = PdfReader(io.BytesIO(file_bytes))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception:
        return ""


class RagStore:
    """In-memory, session-scoped document store + hybrid search index."""

    def __init__(self):
        self.documents = {}      # doc_name -> full text (for reference)
        self.chunk_records = []  # list of {"doc": str, "text": str, "tf": Counter, "len": int}
        self._df = Counter()     # document frequency of each term across chunks
        self._n_chunks = 0
        self._indexed = False

    # ---------------- Ingestion ----------------

    def add_document(self, name, text):
        if not text or not text.strip():
            return 0
        self.documents[name] = text
        chunks = _chunk_text(text)
        for c in chunks:
            self.chunk_records.append({"doc": name, "text": c})
        self._indexed = False
        return len(chunks)

    def remove_document(self, name):
        self.documents.pop(name, None)
        self.chunk_records = [r for r in self.chunk_records if r["doc"] != name]
        self._indexed = False

    def is_empty(self):
        return len(self.chunk_records) == 0

    # ---------------- Indexing (TF-IDF) ----------------

    def build_index(self):
        self._df = Counter()
        for rec in self.chunk_records:
            tokens = _tokenize(rec["text"])
            tf = Counter(tokens)
            rec["tf"] = tf
            rec["len"] = max(len(tokens), 1)
            for term in set(tokens):
                self._df[term] += 1
        self._n_chunks = max(len(self.chunk_records), 1)
        self._indexed = True

    def _idf(self, term):
        df = self._df.get(term, 0)
        return math.log((self._n_chunks + 1) / (df + 1)) + 1.0

    def _vector_score(self, query_tokens, rec):
        if not query_tokens:
            return 0.0
        score = 0.0
        for term in query_tokens:
            tf = rec["tf"].get(term, 0)
            if tf == 0:
                continue
            tf_weight = tf / rec["len"]
            score += tf_weight * self._idf(term)
        return score

    def _lexical_bonus(self, query, chunk_text):
        """Rewards chunks containing the literal query phrase or most of its words."""
        q_low = query.lower().strip()
        c_low = chunk_text.lower()
        bonus = 0.0
        if q_low and q_low in c_low:
            bonus += 0.5
        q_words = set(_tokenize(query))
        c_words = set(_tokenize(chunk_text))
        if q_words:
            overlap_ratio = len(q_words & c_words) / len(q_words)
            bonus += 0.3 * overlap_ratio
        return bonus


    def search(self, query, top_k=3, min_score=0.05):
        """
        Hybrid search: TF-IDF cosine-style score + lexical overlap bonus.
        Returns a list of dicts: {"doc": name, "text": chunk, "score": float}
        sorted by score descending, filtered to those above min_score.
        """
        if not self._indexed:
            self.build_index()
        if self.is_empty() or not query or not query.strip():
            return []

        query_tokens = _tokenize(query)
        results = []
        for rec in self.chunk_records:
            vscore = self._vector_score(query_tokens, rec)
            lbonus = self._lexical_bonus(query, rec["text"])
            total = vscore + lbonus
            if total > 0:
                results.append({"doc": rec["doc"], "text": rec["text"], "score": round(total, 4)})

        results.sort(key=lambda r: r["score"], reverse=True)
        # normalize scores to 0-1 range for readability if we have any hits
        if results:
            max_score = results[0]["score"] or 1.0
            for r in results:
                r["score"] = round(r["score"] / max_score, 3)

        filtered = [r for r in results if r["score"] >= min_score]
        return filtered[:top_k]

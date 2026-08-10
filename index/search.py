#!/usr/bin/env python3
"""Quick search over indexed lecture extracts.
Usage: python3 index/search.py пролежни
"""
import json, sys
from pathlib import Path

idx = json.loads((Path(__file__).parent / 'search_index.json').read_text(encoding='utf-8'))
q = ' '.join(sys.argv[1:]).lower().strip()
if not q:
    print('Usage: python3 index/search.py <слова>'); sys.exit(1)
terms = [t for t in q.replace(',',' ').split() if len(t) >= 3]
scores = {}
for t in terms:
    # exact + prefix
    keys = [k for k in idx['inverted'] if k == t or k.startswith(t)]
    for k in keys:
        for cid in idx['inverted'][k]:
            scores[cid] = scores.get(cid, 0) + (3 if k == t else 1)
if not scores:
    print('Ничего не найдено'); sys.exit(0)
for cid, sc in sorted(scores.items(), key=lambda x: -x[1])[:12]:
    c = idx['chunks'][cid]
    print(f"[{sc}] {c['source']}")
    print(f"    {c['preview'][:180]}…")
    print()

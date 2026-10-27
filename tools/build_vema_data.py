#!/usr/bin/env python3
"""Z importní tabulky Vemy (Zaváděcí formulář – dlouhé věty) připraví data pro export:
  data/vema_zhlav.json      sloupce listu ZHLAV (kód, popis z 1. řádku, typ a formát z Metadat)
  data/vema_ciselniky.json  číselníky potřebné k převodu textů na kódy (obce, okresy, školy, obory, ...)
Použití: python3 tools/build_vema_data.py <tabulka.xlsx> [výstupní_složka=data]"""
import sys, os, json, openpyxl

src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else 'data'
os.makedirs(out, exist_ok=True)
wb = openpyxl.load_workbook(src, read_only=True)

meta_rows = list(wb['Metadata'].iter_rows(values_only=True))
mh = meta_rows[0]
meta = {r[1]: dict(zip(mh, r)) for r in meta_rows[1:] if r[0] == 'zhlav'}

ws = wb['ZHLAV']
rows = list(ws.iter_rows(min_row=1, max_row=2, values_only=True))
cols = []
for desc, name in zip(rows[0], rows[1]):
    code = str(name)[:-2] if str(name).endswith('-A') else str(name)
    m = meta[code]
    cols.append({'code': code, 'desc': desc or '', 'typpol': m['typpol'], 'rozsah': m['rozsah'], 'desmist': m['desmist'], 'cis': m['cis'], 'popis': m['popis']})
json.dump(cols, open(os.path.join(out, 'vema_zhlav.json'), 'w'), ensure_ascii=False, separators=(',', ':'))

want = {'tobec': 'obce', 'tokres': 'okresy', 'tskola': 'skoly', 'tobork': 'obory_kody', 'tobvz': 'obory_vzdelani', 'tstvz': 'stupne_vzdelani', 'tstat': 'staty'}
cis = {v: [] for v in want.values()}
for r in wb['Číselníky'].iter_rows(min_row=2, values_only=True):
    if r[0] in want: cis[want[r[0]]].append([str(r[1]), '' if r[2] is None else str(r[2])])
json.dump(cis, open(os.path.join(out, 'vema_ciselniky.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print({k: len(v) for k, v in cis.items()}, len(cols), 'sloupců')

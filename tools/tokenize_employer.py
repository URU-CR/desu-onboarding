#!/usr/bin/env python3
"""Nahradí v šablonách templates/*.docx natvrdo zapsané údaje zaměstnavatele (DESÚ) zástupnými poli {{org_*}},
která se při generování doplní podle data nástupu (DESÚ do 31. 12. 2026, ÚRÚ ČR od 1. 1. 2027) z Nastavení.
Skript je opakovatelný (už nahrazené texty přeskočí). Použití: python3 tools/tokenize_employer.py templates"""
import sys, glob, zipfile, shutil, re
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W = lambda t: '{%s}%s' % (NS, t)
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

def replace_in_par(p, old, new):
    ts = list(p.iter(W('t')))
    texts = [t.text or '' for t in ts]
    full = ''.join(texts)
    pos = full.find(old)
    if pos < 0: return False
    end = pos + len(old); off = 0; first = True
    for t, tx in zip(ts, texts):
        a, b = off, off + len(tx); off = b
        if b <= pos or a >= end: continue
        s_ = max(pos, a) - a; e_ = min(end, b) - a
        t.text = tx[:s_] + (new if first else '') + tx[e_:]
        t.set(XML_SPACE, 'preserve'); first = False
    return True

def ptext(p): return ''.join(t.text or '' for t in p.iter(W('t')))

# (část dokumentu: 'body' / 'footer', když obsahuje text, starý text, nové pole) – pořadí = pořadí nahrazování v odstavci
COMMON = [
    ('Dopravním a energetickém stavebním úřadu', '{{org_l}}'),
    ('Dopravního a energetického stavebního úřadu', '{{org_g}}'),
    ('Dopravní a energetický stavební úřad', '{{org_n}}'),
    ('Nábřeží Ludvíka Svobody 1222/12, 110 00 Praha 1', '{{org_adresa}}'),
    ('Nábřeží Ludvíka Svobody 1222/12, 110 00 Praha', '{{org_adresa}}'),
    ('nábř. Ludvíka Svobody 1222/12, 110 00 Praha 1', '{{org_adresa_pata}}'),
    ('nábřeží Ludvíka Svobody 1222/12, 110 00 Praha 1', '{{org_adresa}}'),
    ('IDDS: 7mnrnuu', 'IDDS: {{org_idds}}'),
    ('e-mail: posta@desu.gov.cz', 'e-mail: {{org_email}}'),
    ('IČO: 19139314', 'IČO: {{org_ico}}'),
    ('Mgr. Bc. Martin Kozák', '{{org_statutar}}'),
    ('Bc. Martinem Kozákem', '{{org_statutar_i}}'),
    ('ředitelem', '{{org_funkce_i}}'),
    ('DESU', '{{org_zkr}}'),
]

def process(path):
    zin = zipfile.ZipFile(path)
    out = {}
    changed = 0
    for n in zin.namelist():
        data = zin.read(n)
        if re.match(r'word/(document|header\d*|footer\d*)\.xml$', n):
            root = etree.fromstring(data)
            for p in root.iter(W('p')):
                for old, new in COMMON:
                    while replace_in_par(p, old, new): changed += 1
                # samostatný řádek podpisu „ředitel“ (funkce v 1. pádě)
                if ptext(p).strip() == 'ředitel': replace_in_par(p, 'ředitel', '{{org_funkce}}'); changed += 1
                if ptext(p).strip().startswith('ředitel {{org_g}}'): replace_in_par(p, 'ředitel', '{{org_funkce}}'); changed += 1
            data = etree.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)
        out[n] = data
    if changed:
        tmp = path + '.tmp'
        with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zo:
            for it in zin.infolist(): zo.writestr(it, out[it.filename])
        zin.close(); shutil.move(tmp, path)
    return changed

if __name__ == '__main__':
    for f in sorted(glob.glob(sys.argv[1] + '/*.docx')):
        print(f, process(f))

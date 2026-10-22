#!/usr/bin/env python3
"""Připraví šablony dokumentů (templates/*.docx) ze vzorů: vloží zástupná pole {{pole}}.
Použití: python3 tools/build_templates.py <složka_se_vzory_docx> <výstupní_složka>
Vzory ve formátu .doc je nejdřív třeba převést na .docx (soffice --headless --convert-to docx)."""
import sys, os, glob, copy, re, docx
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

W = qn
def ptext(p): return ''.join(t.text or '' for t in p.iter(W('w:t')))
def all_pars(root):
    return list(root.iter(W('w:p')))

def replace(p, old, new, nth=0):
    """Nahradí nth-tý výskyt textu `old` v odstavci (i přes hranice textových uzlů w:t; tabulátory a formát zůstávají)."""
    ts = list(p.iter(W('w:t')))
    texts = [t.text or '' for t in ts]
    full = ''.join(texts)
    pos = -1
    for _ in range(nth + 1):
        pos = full.find(old, pos + 1)
        if pos < 0: return False
    end = pos + len(old)
    off = 0; first = True
    for t, tx in zip(ts, texts):
        a, b = off, off + len(tx); off = b
        if b <= pos or a >= end: continue
        s_ = max(pos, a) - a; e_ = min(end, b) - a
        t.text = tx[:s_] + (new if first else '') + tx[e_:]
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        first = False
    return True

def find_par(root, contains):
    for p in all_pars(root):
        if contains in ptext(p): return p
    raise SystemExit('Odstavec nenalezen: ' + contains)

def edit(root, contains, old, new, nth=0):
    p = find_par(root, contains)
    if not replace(p, old, new, nth): raise SystemExit(f'Text nenalezen: {old!r} v {ptext(p)!r}')

def cell_fill(root, tbl_idx, row, col, token, like=(0, 0)):
    tbl = list(root.iter(W('w:tbl')))[tbl_idx]
    trs = tbl.findall(W('w:tr'))
    def cell(r, c): return trs[r].findall(W('w:tc'))[c]
    src = cell(like[0], like[1] if like[1] is not None else col)
    src_r = next(src.iter(W('w:r')), None)
    p = next(cell(row, col).iter(W('w:p')))
    r = OxmlElement('w:r')
    if src_r is not None and src_r.find(W('w:rPr')) is not None:
        r.append(copy.deepcopy(src_r.find(W('w:rPr'))))
    t = OxmlElement('w:t'); t.text = token; t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve'); r.append(t)
    p.append(r)

def name_cells(root):
    cell_fill(root, 0, 1, 0, '{{jmeno_cele}}', like=(0, 0))
    cell_fill(root, 0, 1, 1, '{{osobni_cislo}}', like=(0, 1))

def unmark_tokens(b):
    # doplněné údaje mají být černé (vzory mívají místa k vyplnění vybarvená červeně / zvýrazněná)
    for r in b.iter(W('w:r')):
        if any('{{' in (t.text or '') for t in r.findall(W('w:t'))):
            rpr = r.find(W('w:rPr'))
            if rpr is None: continue
            for tag in ('w:color', 'w:highlight', 'w:shd'):
                for e in rpr.findall(W(tag)): rpr.remove(e)

def doc_edit(src, dst, fn):
    d = docx.Document(src)
    fn(d.element.body)
    unmark_tokens(d.element.body)
    d.save(dst)

def append_text(root, contains, token, nth=0):
    """Připojí na konec odstavce (obsahujícího `contains`) text/pole ve formátu posledního běhu odstavce."""
    p = [q for q in all_pars(root) if contains in ptext(q)][nth]
    runs = [r for r in p.iter(W('w:r')) if r.find(W('w:t')) is not None]
    src = runs[-1] if runs else None
    r = OxmlElement('w:r')
    if src is not None and src.find(W('w:rPr')) is not None:
        r.append(copy.deepcopy(src.find(W('w:rPr'))))
    t = OxmlElement('w:t'); t.text = token; t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve'); r.append(t)
    p.append(r)

def f_vymer(b):
    """Platový výměr – státní zaměstnanci (vzor A, 10/2026)."""
    append_text(b, 'Příjmení a jméno, titul:', '{{prijmeni_jmeno_titul}}')
    append_text(b, 'Datum narození:', '{{datum_narozeni}}')
    append_text(b, 'Osobní číslo:', '{{osobni_cislo}}')
    append_text(b, 'Pozice:', '{{pozice}}')
    edit(b, 'ode dne', '01.11.2026', '{{datum_nastupu}}')
    append_text(b, 'Platová třída/stupeň:', '{{platova_trida}} / {{platovy_stupen}}')
    append_text(b, 'Při úvazku/hod. týdně:', '{{uvazek_hodiny}}')
    append_text(b, 'ZÁKLADNÍ PLAT', '{{tarif}} Kč')
    append_text(b, 'OSOBNÍ PŘÍPLATEK', '0 Kč')
    append_text(b, 'CELKEM', '{{celkem}} Kč')
    edit(b, 'je zaměstnán', 'xxxxxx', '{{pozice}}')
    append_text(b, 'V Praze dne', '……………………')

def f_smlouva(b):
    """Pracovní smlouva – státní zaměstnanci (vzor B, 10/2026)."""
    edit(b, 'Osobní číslo', 'xxxx', '{{osobni_cislo}}')
    edit(b, 'a paní / pan', 'paní / pan', '{{pan_pani}}')
    append_text(b, 'jméno a příjmení:', '{{jmeno_cele}}')
    append_text(b, 'nar.:', '{{datum_narozeni}}')
    append_text(b, 'bytem:', '{{adresa_trvala}}')
    edit(b, 'syst.', 'název pozice', '{{pozice}}')
    edit(b, 'syst.', 'xxx', '…………')
    edit(b, 'Místem výkonu práce', 'xxx', '{{misto_vykonu}}')
    edit(b, 'Pravidelným pracovištěm', 'xxx', '{{pracoviste_adresa}}')
    edit(b, 'Nástupní den', 'xx.xx.xxxx', '{{datum_nastupu}}')
    edit(b, 'se sjednává na dobu', 'neurčitou', '{{doba_trvani_mala}}')
    edit(b, 'zkušební doba činí', '6 měsíců', '{{zkusebni_doba_text}}')

def f_name_table(b): name_cells(b)

def f_dohoda(b):
    edit(b, 'titul, jméno a příjmení:', 'XXX', '{{jmeno_cele}}')
    edit(b, 'adresa trvalého pobytu', 'XXX', '{{adresa_trvala}}')
    edit(b, 'osobní číslo státního', 'XXX', '{{osobni_cislo}}')
    edit(b, 'zařazen/a na služebním místě', 'v\u00a0oddělení XXXXXXXX odboru XXXXXXXX', 'v útvaru {{utvar}}')
    edit(b, 'kterým je', 'XXXXXXXX (adresa)', '{{adresa_jine_misto}}')
    edit(b, 'XXXXXXXX dne', 'XXXXXXXX', 'Praze')
    edit(b, 'Praze dne', 'X.X.XXXX', '……………………')

def f_osv(b):
    ps = [p for p in all_pars(b) if ptext(p).strip().startswith('.....')]
    # první dvě řady teček = jméno a datum/místo narození (třetí případná řada je podpis)
    replace(ps[0], ptext(ps[0]).strip(), '{{jmeno_cele}}')
    replace(ps[1], ptext(ps[1]).strip(), '{{datum_misto_narozeni}}')

def f_priloha(b):
    ps = [p for p in all_pars(b) if ptext(p).strip().startswith('.....') and len(ptext(p).strip()) > 60]
    replace(ps[0], ptext(ps[0]).strip(), '{{prijmeni_jmeno_titul}}')
    replace(ps[1], ptext(ps[1]).strip(), '{{osobni_cislo}}, {{utvar}}')
    replace(ps[2], ptext(ps[2]).strip(), '{{adresa_jine_misto}}')

# id -> (hledaný fragment názvu souboru, výstupní název, úprava)
JOBS = [
    ('vymer',   'A_Platov',     '01_platovy_vymer.docx',            f_vymer),
    ('smlouva', 'B_Pracovn',    '02_pracovni_smlouva.docx',         f_smlouva),
    ('hodnoceni','03_hodnot',   '03_hodnotici_kriteria.docx',       f_name_table),
    ('foto',    '04_po',        '04_portretni_fotografie.docx',     f_name_table),
    ('bozp',    '05_Pou',       '05_pouceni_BOZP_PO.docx',          None),
    ('osv_oc',  'Osvedceni_OC', 'osvedceni_obecna_cast.docx',   f_osv),
    ('osv_zc',  'Osvedceni_ZC', 'osvedceni_zvlastni_cast.docx', f_osv),
    ('info',    '07_Info',      '07_informace_o_pracovnim_pomeru.docx', None),
    ('predpisy','08_Prev',      '08_prohlaseni_interni_predpisy.docx', f_name_table),
    ('dohoda',  'Dohoda_o',     'dohoda_o_vykonu_sluzby_z_jineho_mista.docx', f_dohoda),
    ('priloha', 'Příloha',      'priloha_1_prohlaseni_BOZP.docx',  f_priloha),
]

if __name__ == '__main__':
    src_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    files = sorted(glob.glob(os.path.join(src_dir, '*.docx')))   # lze zadat i složku jen s některými vzory – ostatní se přeskočí
    import unicodedata
    norm = lambda s: unicodedata.normalize('NFC', s)
    for key, frag, out, fn in JOBS:
        m = [f for f in files if norm(frag) in norm(os.path.basename(f))]
        if len(m) == 0: print('PŘESKOČENO (vzor nenalezen):', frag); continue
        if len(m) != 1: raise SystemExit(f'Vzor {frag}: nalezeno {len(m)}')
        dst = os.path.join(out_dir, out)
        if fn: doc_edit(m[0], dst, fn)
        else:
            import shutil; shutil.copy(m[0], dst)
        print('OK', key, '->', out)

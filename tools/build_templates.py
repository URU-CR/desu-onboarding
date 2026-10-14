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

def f_vymer(b):
    # šedé stínování polí vzniklo při převodu ze starého .doc (ve Wordu je to jen stínování formulářových polí na obrazovce)
    for shd in list(b.iter(W('w:shd'))):
        if (shd.get(W('w:fill')) or '').upper() == 'F3F3F3': shd.getparent().remove(shd)
    edit(b, 'paní:', '…', '{{jmeno_cele}}', 0)
    edit(b, 'paní:', 'paní', '{{pan_pani}}')
    edit(b, 'Osobní číslo', '…', '{{osobni_cislo}}', 0)
    pp = find_par(b, 'Osobní číslo')
    for tb in list(pp.iter(W('w:tab'))): tb.getparent().remove(tb)
    replace(pp, 'Osobní číslo:', '      Osobní číslo:')
    edit(b, 'funkce:', '…', '{{pozice}}')
    edit(b, 'útvar:', '…', '{{utvar}}')
    edit(b, 'účinností od', '…', '{{datum_nastupu}}')
    edit(b, 'v platové třídě', ':…', ': {{platova_trida}}')
    edit(b, 'v platovém stupni', '…', '{{platovy_stupen}}')
    edit(b, 'tarifní plat ve výši', '0 Kč', '{{tarif}} Kč')
    edit(b, 'celkem', '0 Kč', '{{celkem}} Kč')

def f_smlouva(b):
    edit(b, 'Zaměstnanec:', 'xxx', '{{jmeno_cele}}')
    edit(b, 'Narozena', 'Narozena', '{{narozen_a}}')
    edit(b, '{{narozen_a}}', 'xxx', '{{datum_narozeni}}')
    edit(b, 'Trvale bytem', 'xxx', '{{adresa_trvala}}')
    edit(b, 'nastoupí do práce', 'xxx', '{{datum_nastupu}}')
    edit(b, 'bude vykonávat práci', 'xxx', '{{pozice}}')
    edit(b, 'Zkušební doba', 'xxx', '{{zkusebni_doba}}')
    edit(b, 'se sjednává na dobu', 'Neurčitou', '{{doba_trvani}}')
    edit(b, 'Týdenní pracovní doba', '40 hodin', '{{tydenni_hodiny}} hodin')
    edit(b, 'pravidelné pracoviště', 'xxx', '{{pracoviste}}')

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
    ('vymer',   '01_Platovy',   '01_platovy_vymer.docx',            f_vymer),
    ('smlouva', '02_pracovn',   '02_pracovni_smlouva.docx',         f_smlouva),
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
    files = sorted(glob.glob(os.path.join(src_dir, '*.docx')))
    import unicodedata
    norm = lambda s: unicodedata.normalize('NFC', s)
    for key, frag, out, fn in JOBS:
        m = [f for f in files if norm(os.path.basename(f)).startswith(norm(frag))]
        if len(m) != 1: raise SystemExit(f'Vzor {frag}: nalezeno {len(m)}')
        dst = os.path.join(out_dir, out)
        if fn: doc_edit(m[0], dst, fn)
        else:
            import shutil; shutil.copy(m[0], dst)
        print('OK', key, '->', out)

#!/usr/bin/env python3
"""Vyrobí vzory pro zaměstnance podle zákoníku práce (templates/zp_*.docx) ze vzorů dodaných personálním oddělením
(.doc → .docx přes LibreOffice) tak, že ručně vyplněná místa nahradí zástupnými poli {{…}}.
Použití: python3 tools/build_zp_templates.py <vymer.docx> <smlouva.docx> templates"""
import sys, zipfile, os
from lxml import etree
sys.path.insert(0, os.path.dirname(__file__))
from tokenize_employer import replace_in_par, ptext, W

def process(src, dst, reps, trim_empty=0, part_names=('word/document.xml', 'word/header1.xml', 'word/header2.xml', 'word/footer1.xml', 'word/footer2.xml')):
    zin = zipfile.ZipFile(src); out = {}
    for n in zin.namelist():
        data = zin.read(n)
        if n in part_names:
            root = etree.fromstring(data)
            # zbytkové pole slučování (MERGEFIELD) → prostý text: odstranit řídicí znaky a kód pole, výsledek zůstane
            for el in list(root.iter(W('fldChar'), W('instrText'))):
                r = el.getparent()
                if r is not None and r.getparent() is not None and len(r) == 1 + (1 if r.find(W('rPr')) is not None else 0):
                    r.getparent().remove(r)
            if n == 'word/document.xml' and trim_empty:       # pojistka proti přetečení výměru na 2. stranu: ubrat prázdné odstavce před podpisem
                ps = list(root.iter(W('p')))
                idx = [i for i, p in enumerate(ps) if ptext(p).startswith('měsíčně')]
                if idx:
                    gap = []
                    for p in ps[idx[0] + 1:]:
                        if ptext(p).strip(): break
                        gap.append(p)
                    for p in gap[:min(trim_empty, max(len(gap) - 1, 0))]: p.getparent().remove(p)
            for p in root.iter(W('p')):
                for old, new in reps:
                    if old[0] and old[0] not in ptext(p): continue
                    if old[1] == '<<END>>':            # připojit na konec odstavce (za poslední tabulátor)
                        ts = list(p.iter(W('t')))
                        if ts: ts[-1].text = (ts[-1].text or '').rstrip() + new; ts[-1].set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                    else:
                        replace_in_par(p, old[1], new)
            data = etree.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)
        out[n] = data
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for n in zin.namelist(): z.writestr(n, out[n])

# (text, který musí odstavec obsahovat – '' = libovolný) , starý text) → nové pole
def R(ctx, old, new): return ((ctx, old), new)
VYMER = [
    R('', 'DOPRAVNÍ A ENERGETICKÝ STAVEBNÍ ÚŘAD', '{{org_n_vel}}'),
    R('', 'NÁBŘEŽÍ LUDVÍKA SVOBODY 1222, PRAHA 110 00', '{{org_adresa_vel}}'),
    R('V\xa0Praze dne', 'xx. listopadu 2026', '……………………'),
    R('Č. j.', 'Č. j.: ', 'Č. j.: {{cj_a}}'),
    R('Pan/í', 'Pan/í: ', 'Pan/í: {{prijmeni_jmeno_titul}}'),
    R('Osobní číslo', 'Osobní číslo:                                                     ', 'Osobní číslo: {{osobni_cislo}}'),
    R('Funkce', '<<END>>', '{{pozice}}'),
    R('Útvar', '<<END>>', '{{utvar}}'),
    R('účinností od', 'xx.xx.2026', '{{datum_nastupu}}'),
    R('v platové třídě', 'x', '{{platova_trida}}'),
    R('v platovém stupni', 'x', '{{platovy_stupen}}'),
    R('tarifní plat', 'xx xxx', '{{tarif}}'),
    R('osobní příplatek', 'x xxx', '0'),
    R('příplatek za vedení', 'x xxx', '0'),
    R('Celkem', 'xx xxx', '{{celkem}}'),
    R('Převzal', 'Mgr. Bc. Martin Kozák', '{{org_statutar}}'),
    R('Dne:', 'ředitel', '{{org_funkce}}'),
]
SMLOUVA = [
    R('Česká republika, Dopravní', 'Dopravní a energetický stavební úřad', '{{org_n}}'),
    R('nábřeží Ludvíka', 'nábřeží Ludvíka Svobody 1222/12, 110 00 Praha 1', '{{org_adresa}}'),
    R('zastoupený', 'Mgr. Bc. Martinem Kozákem, ředitelem', '{{org_statutar_i}}, {{org_funkce_i}}'),
    R('Pan/í', 'xxx', '{{jmeno_cele}}'),
    R('Narozen/a', 'xxx', '{{datum_narozeni}}'),
    R('Trvalé bydliště', 'xxx', '{{adresa_trvala}}'),
    R('Den nástupu', 'xx. listopadu 2026', '{{datum_nastupu}}'),
    R('bude vykonávat práci', 'xx', '{{pozice}}'),
    R('Místem výkonu práce', 'xx', '{{misto_vykonu}}'),
    R('cestovních náhrad', 'xx', '{{pracoviste_adresa}}'),
    R('na dobu', 'neurčitou', '{{doba_trvani_mala}}'),
    R('Zkušební doba', '4 měsíce', '{{zkusebni_doba_text}}'),
    R('Týdenní pracovní doba', '40 hodin', '{{tydenni_hodiny}} hodin'),
    R('Č. j.', 'Č. j.: xx', 'Č. j.: {{cj}}'),
    R('Martin Kozák', 'Mgr. Bc. Martin Kozák', '{{org_statutar}}'),
    R('ředitel', 'ředitel', '{{org_funkce}}'),
    R('Dopravní a energetický stavební úřad', 'Dopravní a energetický stavební úřad', '{{org_n}}'),
]
if __name__ == '__main__':
    v, s, d = sys.argv[1:4]
    process(v, os.path.join(d, 'zp_platovy_vymer.docx'), VYMER, trim_empty=2)
    process(s, os.path.join(d, 'zp_pracovni_smlouva.docx'), SMLOUVA)

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

if __name__ == '__main__' and sys.argv[1] != '--signing':
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


# ---------------------------------------------------------------------------
# Podklady k podpisu A, B, C (dříve samostatný tisk z aplikace) – šablony vytvořené od nuly.
# Řádky tabulek s poli {{deti_*}}, {{praxe_*}}, {{jazyky_*}} se při generování opakují pro každou položku.
# Použití: python3 tools/build_templates.py --signing <výstupní_složka>
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

def _new_doc():
    d = docx.Document()
    s = d.sections[0]
    s.left_margin = s.right_margin = Cm(2); s.top_margin = s.bottom_margin = Cm(1.8)
    st = d.styles['Normal']; st.font.name = 'Arial'; st.font.size = Pt(10)
    st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Arial')
    st.paragraph_format.space_after = Pt(4)
    return d

def _par(d, text='', bold=False, center=False, size=None, before=0):
    p = d.add_paragraph(); r = p.add_run(text); r.bold = bold
    if size: r.font.size = Pt(size)
    if center: p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(before)
    return p

def _lab(d, label, value, before=0):
    p = d.add_paragraph(); r = p.add_run(label + ' '); r.bold = True; p.add_run(value)
    p.paragraph_format.space_before = Pt(before)
    return p

def _table(d, heads, tokens):
    t = d.add_table(rows=2, cols=len(heads)); t.style = 'Table Grid'
    for i, h in enumerate(heads):
        c = t.rows[0].cells[i]; c.text = ''; r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(9)
        t.rows[1].cells[i].text = ''
        r2 = t.rows[1].cells[i].paragraphs[0].add_run(tokens[i]); r2.font.size = Pt(9)
    return t

def _sign(d, label='Podpis:'):
    _par(d, 'V ……………………………… dne ………………………………', before=24)
    _par(d, label + ' ………………………………', before=18)

def build_A(path):
    d = _new_doc()
    _par(d, 'Osobní dotazník', bold=True, center=True, size=14)
    _lab(d, 'Titul, jméno, příjmení, titul:', '{{jmeno_cele}}')
    _lab(d, 'Osobní číslo (vyplní personální odbor):', '{{osobni_cislo}}')
    _lab(d, 'Rodné příjmení:', '{{rodne_prijmeni}}')
    _lab(d, 'Datum narození:', '{{datum_narozeni}}')
    _lab(d, 'Místo narození:', '{{misto_narozeni}}')
    _lab(d, 'Státní občanství:', '{{statni_prislusnost}}')
    _lab(d, 'Rodinný stav:', '{{rodinny_stav}}')
    _lab(d, 'Rodné číslo:', '{{rodne_cislo}}')
    _lab(d, 'Trvalý pobyt:', '{{adresa_trvala_plna}}')
    _lab(d, 'Kontaktní adresa (liší-li se):', '{{dorucovaci_adresa}}')
    _lab(d, 'Telefon:', '{{telefon}}')
    _lab(d, 'E-mail:', '{{email_soukromy}}')
    _lab(d, 'Kontaktní osoba pro mimořádnou událost:', '{{nouzovy_kontakt}}')
    _par(d, 'Rodinní příslušníci', bold=True, before=10)
    _lab(d, 'Manžel(ka), druh, družka:', '{{manzel_jmeno}}')
    _lab(d, 'Datum narození:', '{{manzel_datum_narozeni}}')
    _lab(d, 'Státní občanství:', '{{manzel_obcanstvi}}')
    _lab(d, 'Bydliště:', '{{manzel_bydliste}}')
    _par(d, 'Děti', bold=True, before=8)
    _table(d, ['Jméno a příjmení', 'Datum narození', 'Rodné číslo', 'Bydliště (nezaopatřené)'],
           ['{{deti_jmeno}}', '{{deti_datum}}', '{{deti_rodne_cislo}}', '{{deti_bydliste}}'])
    _par(d, 'Vzdělání', bold=True, before=10)
    _lab(d, 'Stav:', '{{stav_vzdelani}}')
    _lab(d, 'Stupeň:', '{{stupen_vzdelani}}')
    _lab(d, 'Škola a obor:', '{{skola_obor}}')
    _lab(d, 'Rok ukončení:', '{{rok_ukonceni}}')
    _lab(d, 'Druh zkoušky:', '{{druh_zkousky}}')
    _par(d, 'Další údaje', bold=True, before=10)
    _lab(d, 'Přiznaný důchod:', '{{duchod}}')
    _lab(d, 'Zdravotní znevýhodnění:', '{{zdravotni_znevyhodneni}}')
    _lab(d, 'Je proti Vám vedeno soudní řízení:', '{{soudni_rizeni}}')
    _lab(d, 'Zdravotní pojišťovna (doložit kopii):', '{{zdravotni_pojistovna}}')
    _par(d, 'Prohlašuji, že všechny mnou uvedené údaje jsou pravdivé a nic jsem nezamlčel(a). Dále se zavazuji všechny změny těchto údajů bezodkladně oznamovat personálnímu oddělení.', before=14)
    _sign(d)
    d.save(path)

def build_B(path):
    d = _new_doc()
    _par(d, 'Prohlášení o pravdivosti údajů a přehled praxe', bold=True, center=True, size=14)
    _par(d, 'Já, {{jmeno_cele}}, níže podepsaný/á, prohlašuji a potvrzuji svým vlastnoručním podpisem, že veškeré uvedené údaje jsou pravdivé a úplné. Jsem si vědom/a možných dopadů a důsledků (zejména přeřazení do nižšího platového stupně a pracovně právních postihů podle příslušných ustanovení zákoníku práce a zákona o státní službě) v případě, že mnou uváděné údaje budou shledány nepravdivými.')
    _par(d, 'Přehled průběhu předchozích zaměstnání, vojenské služby, mateřské dovolené, úřadu práce apod.', bold=True, before=10)
    _table(d, ['Organizace', 'Pracovní zařazení / vykonávaná činnost', 'Od', 'Do'],
           ['{{praxe_organizace}}', '{{praxe_zarazeni}}', '{{praxe_od}}', '{{praxe_do}}'])
    _par(d, 'V minulosti jsem již byl/a ve služebním poměru: {{sluzebni_pomer_drive}}', before=10)
    _par(d, 'Členství v řídících a kontrolních orgánech právnických osob provozujících podnikatelskou činnost: {{clenstvi_organy}}')
    _par(d, 'Podnikatelská nebo výdělečná činnost vyžadující předchozí souhlas zaměstnavatele: {{vydelecna_cinnost}}')
    _lab(d, 'Kurzy, specifické odborné znalosti a dovednosti:', '{{kurzy_dovednosti}}')
    _par(d, 'Jazykové znalosti', bold=True, before=10)
    _table(d, ['Jazyk', 'Stupeň znalosti', 'Stupeň osvědčení', 'Používání'],
           ['{{jazyky_jazyk}}', '{{jazyky_znalost}}', '{{jazyky_osvedceni}}', '{{jazyky_pouzivani}}'])
    _sign(d, 'Podpis:')
    d.save(path)

def build_C(path):
    d = _new_doc()
    _par(d, 'Souhlas', bold=True, center=True, size=14)
    _par(d, 's bezhotovostním zasíláním platu, cestovních náhrad a peněžitého příspěvku na stravování za kalendářní měsíc na osobní účet', bold=True, center=True)
    _lab(d, 'Jméno a příjmení zaměstnance:', '{{jmeno_cele}}', before=8)
    _lab(d, 'Osobní číslo zaměstnance:', '{{osobni_cislo}}')
    _par(d, 'Tímto vyjadřuji a svým podpisem níže stvrzuji svůj souhlas s:', before=8)
    _par(d, '1. bezhotovostním zasíláním svého platu na (níže uvedený) osobní účet: {{souhlas_plat}}')
    _par(d, '2. bezhotovostním zasíláním cestovních náhrad na (níže uvedený) osobní účet, a to jedenkrát měsíčně ve výplatním termínu společně s výplatou platu, souhrnnou částkou zahrnující všechny cestovní náhrady zúčtované v předcházejícím kalendářním měsíci. Dále prohlašuji, že jsem se se zaměstnavatelem dohodl/a a souhlasím s tím, že předložím zaměstnavateli písemné doklady potřebné k vyúčtování cestovních náhrad a vrátím případnou nevyúčtovanou zálohu po skončení pracovní/služební cesty, a to i tehdy, je-li tento termín kratší, než stanoví § 183 odst. 3 zákona č. 262/2006 Sb., Zákoník práce: {{souhlas_cestovni}}')
    _par(d, '3. bezhotovostním zasíláním peněžitého příspěvku na stravování na (níže uvedený) osobní účet, a to jedenkrát měsíčně ve výplatním termínu společně s výplatou platu: {{souhlas_stravovani}}')
    _par(d, 'Plat, cestovní náhrady a peněžitý příspěvek na stravování poukazujte na tento účet:', before=8)
    _par(d, '{{cislo_uctu_banka}}', bold=True, size=12)
    _sign(d, 'podpis zaměstnance:')
    d.save(path)

if len(sys.argv) > 2 and sys.argv[1] == '--signing':
    os.makedirs(sys.argv[2], exist_ok=True)
    build_A(os.path.join(sys.argv[2], '09_osobni_dotaznik.docx'))
    build_B(os.path.join(sys.argv[2], '10_prohlaseni_o_praxi.docx'))
    build_C(os.path.join(sys.argv[2], '11_souhlas_s_bezhotovostnim_zasilanim.docx'))
    print('OK podklady k podpisu')

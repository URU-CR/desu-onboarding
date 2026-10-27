/* Generování dokumentů: vyplnění šablon Word (.docx) a převod na PDF přímo v prohlížeči.
 * Knihovny (vendor/): JSZip, docx-preview (vykreslení docx), jsPDF (zápis PDF s písmem Liberation = metricky shodné s Arial/Times).
 * Načítají se až při prvním generování. Nic se neposílá na server. */
(function(){
  'use strict';
  const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  let ver = '';
  const loaded = {};

  function loadScript(src){
    if(loaded[src]) return loaded[src];
    loaded[src] = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src + (ver ? '?v=' + ver : '');
      s.onload = res; s.onerror = () => { delete loaded[src]; rej(new Error('Nepodařilo se načíst ' + src)); };
      document.head.appendChild(s);
    });
    return loaded[src];
  }
  async function ensureZip(){ await loadScript('vendor/jszip.min.js'); }
  async function ensurePdfLibs(){
    await ensureZip();
    await loadScript('vendor/docx-preview.min.js');
    await loadScript('vendor/jspdf.umd.min.js');
  }

  function xmlEsc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  const tplCache = {};
  async function fetchTemplate(url){
    if(!tplCache[url]){
      tplCache[url] = fetch(url + (ver ? '?v=' + ver : ''), { cache: 'no-cache' }).then(r => {
        if(!r.ok) throw new Error('Šablonu ' + url + ' se nepodařilo načíst (' + r.status + ').');
        return r.arrayBuffer();
      }).catch(e => { delete tplCache[url]; throw e; });
    }
    return tplCache[url];
  }

  /** Word někdy rozdělí zápis {{pole}} do více úseků textu (kvůli formátování/kontrole pravopisu) – tady se zase spojí. */
  function mergeSplitTokens(xml){
    return xml.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, para => {
      const re = /(<w:t(?: [^>]*)?>)([^<]*)(<\/w:t>)/g;
      const parts = []; let m;
      while((m = re.exec(para))) parts.push({ index: m.index, len: m[0].length, text: m[2] });
      if(parts.length < 2) return para;
      const full = parts.map(p => p.text).join('');
      if(full.indexOf('{{') < 0) return para;
      const starts = []; let off = 0;
      parts.forEach(p => { starts.push(off); off += p.text.length; });
      const partAt = pos => { let i = parts.length - 1; while(i > 0 && starts[i] > pos) i--; return i; };
      const emit = {}, skip = new Set();
      const tre = /\{\{\s*\w+\s*\}\}/g; let t, changed = false;
      while((t = tre.exec(full))){
        const s0 = t.index, e0 = t.index + t[0].length;
        if(partAt(s0) === partAt(e0 - 1)) continue;
        changed = true;
        emit[s0] = t[0].replace(/\s+/g, '');
        for(let k = s0; k < e0; k++) skip.add(k);
      }
      const texts = parts.map(() => '');
      for(let pos = 0; pos < full.length; pos++){
        const k = partAt(pos);
        if(pos in emit) texts[k] += emit[pos];
        else if(!skip.has(pos)) texts[k] += full[pos];
      }
      if(!changed) return para;
      let out = '', last = 0;
      parts.forEach((p, k) => {
        const orig = para.slice(p.index, p.index + p.len);
        const open = orig.slice(0, orig.indexOf('>') + 1).replace(/^<w:t(?: [^>]*)?>/, '<w:t xml:space="preserve">');
        out += para.slice(last, p.index) + open + texts[k] + '</w:t>';
        last = p.index + p.len;
      });
      return out + para.slice(last);
    });
  }
  const TEMPLATE_PARTS = /^word\/(document|header\d*|footer\d*|footnotes)\.xml$/;

  /** Vyplní zástupná pole {{pole}} v šabloně .docx hodnotami; vrací Blob (.docx).
   *  src = adresa šablony (řetězec) nebo její obsah (ArrayBuffer / Blob). */
  /** Řádky tabulky s poli {{skupina_pole}} se zopakují pro každou položku values.__rows[skupina] (pole objektů); bez položek zůstane jeden prázdný řádek. */
  function expandRows(xml, rows){
    return xml.replace(/<w:tr[ >][\s\S]*?<\/w:tr>/g, tr => {
      for(const g of Object.keys(rows)){
        if(tr.indexOf('{{' + g + '_') < 0) continue;
        const items = rows[g].length ? rows[g] : [{}];
        return items.map(it => tr.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => k.indexOf(g + '_') === 0 ? xmlEsc(it[k.slice(g.length + 1)]) : m)).join('');
      }
      return tr;
    });
  }

  async function fillTemplate(src, values){
    await ensureZip();
    let buf = src;
    if(typeof src === 'string') buf = await fetchTemplate(src);
    else if(typeof Blob !== 'undefined' && src instanceof Blob) buf = await src.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const parts = Object.keys(zip.files).filter(n => TEMPLATE_PARTS.test(n));
    for(const n of parts){
      let xml = mergeSplitTokens(await zip.file(n).async('string'));
      xml = expandRows(xml, values.__rows || {});
      xml = xml.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => xmlEsc(values[k]));
      zip.file(n, xml);
    }
    return zip.generateAsync({ type: 'blob', mimeType: DOCX_MIME, compression: 'DEFLATE' });
  }

  /** Zkontroluje nahrávaný vzor: je to platný .docx a jaká zástupná pole obsahuje. */
  async function inspectTemplate(buf){
    await ensureZip();
    let zip;
    try{ zip = await JSZip.loadAsync(buf); }catch(e){ return { ok: false, error: 'Soubor není platný dokument Word (.docx).' }; }
    if(!zip.file('word/document.xml')) return { ok: false, error: 'Soubor není platný dokument Word (.docx) – chybí word/document.xml.' };
    const tokens = new Set();
    for(const n of Object.keys(zip.files).filter(n => TEMPLATE_PARTS.test(n))){
      const xml = mergeSplitTokens(await zip.file(n).async('string'));
      (xml.match(/\{\{\s*\w+\s*\}\}/g) || []).forEach(t => tokens.add(t.replace(/[{}\s]/g, '')));
      // zbylé neúplné zápisy typu {{pole
      const text = (xml.match(/<w:t(?: [^>]*)?>[^<]*<\/w:t>/g) || []).map(x => x.replace(/<[^>]+>/g, '')).join('');
      if(/\{\{(?![^{}]*\}\})/.test(text) || /(?<!\{\{[^{}]*)\}\}/.test(text)) tokens.add('?neuplne');
    }
    const broken = tokens.delete('?neuplne');
    return { ok: true, tokens: [...tokens], broken };
  }

  /* ---------------------------------------------------------------- PDF */
  const FONT_FILES = {
    sans:  { normal: 'LiberationSans-Regular.ttf', bold: 'LiberationSans-Bold.ttf', italic: 'LiberationSans-Italic.ttf', bolditalic: 'LiberationSans-BoldItalic.ttf' },
    serif: { normal: 'LiberationSerif-Regular.ttf', bold: 'LiberationSerif-Bold.ttf', italic: 'LiberationSerif-Italic.ttf', bolditalic: 'LiberationSerif-BoldItalic.ttf' },
  };
  const fontData = {};
  async function fontBase64(file){
    if(!fontData[file]){
      fontData[file] = fetch('vendor/fonts/' + file + (ver ? '?v=' + ver : '')).then(async r => {
        if(!r.ok) throw new Error('Písmo ' + file + ' se nepodařilo načíst.');
        const u = new Uint8Array(await r.arrayBuffer());
        let bin = ''; for(let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        return btoa(bin);
      }).catch(e => { delete fontData[file]; throw e; });
    }
    return fontData[file];
  }

  function parseColor(c){
    const m = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?\s*\)/.exec(c || '');
    if(!m) return null;
    let a = m[4] == null ? 1 : (String(m[4]).endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
    if(a === 0) return null;
    return [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3])];
  }
  function fam(cs){
    const f = (cs.fontFamily || '').split(',')[0].replace(/["']/g, '').trim().toLowerCase();
    return /times|cambria|georgia|garamond|palatino|book antiqua|serif$|liberation serif/.test(f) && !/sans/.test(f) ? 'serif' : 'sans';
  }
  function fstyle(cs){
    const b = parseInt(cs.fontWeight, 10) >= 600 || cs.fontWeight === 'bold', i = cs.fontStyle === 'italic' || cs.fontStyle === 'oblique';
    return b && i ? 'bolditalic' : b ? 'bold' : i ? 'italic' : 'normal';
  }

  // --- CSS čítače (číslování odrážek a seznamů vykreslené přes ::before) ---
  function toAlpha(n, upper){ let s = ''; n = Math.max(1, n); while(n > 0){ const r = (n - 1) % 26; s = String.fromCharCode(97 + r) + s; n = Math.floor((n - 1) / 26); } return upper ? s.toUpperCase() : s; }
  function toRoman(n, upper){
    const t = [[1000,'m'],[900,'cm'],[500,'d'],[400,'cd'],[100,'c'],[90,'xc'],[50,'l'],[40,'xl'],[10,'x'],[9,'ix'],[5,'v'],[4,'iv'],[1,'i']];
    let s = ''; for(const [v, r] of t){ while(n >= v){ s += r; n -= v; } } return upper ? s.toUpperCase() : s;
  }
  function fmtCounter(n, style){
    switch((style || 'decimal').trim()){
      case 'lower-alpha': case 'lower-latin': return toAlpha(n, false);
      case 'upper-alpha': case 'upper-latin': return toAlpha(n, true);
      case 'lower-roman': return toRoman(n, false);
      case 'upper-roman': return toRoman(n, true);
      case 'decimal-leading-zero': return (n < 10 ? '0' : '') + n;
      default: return String(n);
    }
  }
  function cssUnescape(s){
    return s.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, '$1');
  }
  function bulletFix(s){
    return s.replace(/[-]/g, ch => ({ '': '•', '': '▪', '': '➢', '': '✓', '': '❖' }[ch] || '•'));
  }
  function applyCounterList(counters, spec, mode){
    if(!spec || spec === 'none') return;
    const toks = spec.trim().split(/\s+/);
    for(let i = 0; i < toks.length; i++){
      const name = toks[i]; let val = (mode === 'inc') ? 1 : 0;
      if(i + 1 < toks.length && /^-?\d+$/.test(toks[i + 1])){ val = parseInt(toks[i + 1], 10); i++; }
      if(mode === 'inc') counters[name] = (counters[name] || 0) + val; else counters[name] = val;
    }
  }
  function resolveContent(content, counters){
    if(!content || content === 'none' || content === 'normal') return '';
    let out = '', i = 0;
    while(i < content.length){
      const ch = content[i];
      if(ch === '"' || ch === "'"){
        let j = i + 1, s = '';
        while(j < content.length && content[j] !== ch){ if(content[j] === '\\' && j + 1 < content.length){ s += content[j] + content[j + 1]; j += 2; } else { s += content[j++]; } }
        out += cssUnescape(s); i = j + 1;
      } else if(content.startsWith('counter(', i)){
        const j = content.indexOf(')', i); const args = content.slice(i + 8, j).split(',');
        out += fmtCounter(counters[args[0].trim()] || 0, args[1]); i = j + 1;
      } else i++;
    }
    return out;
  }

  const PX = 0.75; // CSS px -> pt

  /** Vykreslí docx do skrytého iframe a vrátí seznam stránek s operacemi kreslení. */
  async function collectSections(docxBlob){
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;left:-30000px;top:0;width:1400px;height:1200px;border:0;visibility:hidden;';
    document.body.appendChild(iframe);
    try{
      const idoc = iframe.contentDocument;
      idoc.open(); idoc.write('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff;}</style></head><body></body></html>'); idoc.close();
      const iwin = iframe.contentWindow;
      const host = idoc.createElement('div'); idoc.body.appendChild(host);
      await docx.renderAsync(docxBlob, host, null, { className: 'docx', inWrapper: false, breakPages: true, experimental: true, ignoreLastRenderedPageBreak: true, useBase64URL: true, renderHeaders: true, renderFooters: true, renderFootnotes: true, renderEndnotes: true });
      // tabulátory podle zarážek (docx-preview je dopočítává se zpožděním ~0,5 s)
      if(host.querySelector('.docx-tab-stop')){
        const t0 = Date.now();
        while(Date.now() - t0 < 900 && ![...host.querySelectorAll('.docx-tab-stop')].some(e => e.style.wordSpacing)) await new Promise(r => setTimeout(r, 50));
        await new Promise(r => setTimeout(r, 60));
      }
      // písma: místo systémových (Arial, Calibri…) se použije Liberation (metricky shodná s Arial/Times) – rozložení je pak na každém počítači stejné jako písmo v PDF
      {
        const base = new URL('vendor/fonts/', location.href).href;
        const faces = [];
        for(const [f, name] of [['sans', 'LibSans'], ['serif', 'LibSerif']]){
          for(const [st, file] of Object.entries(FONT_FILES[f])){
            faces.push(`@font-face{font-family:'${name}';font-weight:${/bold/.test(st) ? 'bold' : 'normal'};font-style:${/italic/.test(st) ? 'italic' : 'normal'};src:url('${base}${file}${ver ? '?v=' + ver : ''}') format('truetype');}`);
          }
        }
        const stl = idoc.createElement('style'); stl.textContent = faces.join('\n'); idoc.head.appendChild(stl);
        await Promise.all(['', 'bold ', 'italic ', 'bold italic '].flatMap(w => ['LibSans', 'LibSerif'].map(n => idoc.fonts.load(w + '12px ' + n))));
        const all = [...host.querySelectorAll('*')];
        const fams = all.map(el => fam(iwin.getComputedStyle(el)));
        all.forEach((el, i) => el.style.setProperty('font-family', fams[i] === 'serif' ? 'LibSerif' : 'LibSans', 'important'));
      }
      // číslování navázané na styl: docx-preview pro takové odstavce nevytvoří značku (a/b/c, 1., odrážky) -> doplníme vlastní z numbering.xml
      try{
        const nz = await JSZip.loadAsync(docxBlob);
        const nf = nz.file('word/numbering.xml');
        if(nf){
          const nxml = await nf.async('string');
          const nums = {}; let mm; const rx = /<w:num\s+w:numId="(\d+)"[^>]*>\s*<w:abstractNumId\s+w:val="(\d+)"/g;
          while((mm = rx.exec(nxml))) nums[mm[1]] = mm[2];
          const abs = {};
          const ra = /<w:abstractNum\b[^>]*w:abstractNumId="(\d+)"[\s\S]*?<\/w:abstractNum>/g;
          while((mm = ra.exec(nxml))){
            const lv = {}; const rl = /<w:lvl\b[^>]*w:ilvl="(\d+)"[\s\S]*?<\/w:lvl>/g; let ml;
            while((ml = rl.exec(mm[0]))){
              const b = ml[0], g = (re, d) => { const x = re.exec(b); return x ? x[1] : d; };
              lv[ml[1]] = { fmt: g(/<w:numFmt\s+w:val="([^"]*)"/, 'decimal'), text: g(/<w:lvlText\s+w:val="([^"]*)"/, ''), start: parseInt(g(/<w:start\s+w:val="(\d+)"/, '1'), 10), left: parseInt(g(/<w:ind\b[^>]*w:left="(\d+)"/, '0'), 10), hang: parseInt(g(/<w:ind\b[^>]*w:hanging="(\d+)"/, '0'), 10) };
            }
            abs[mm[1]] = lv;
          }
          const synth = {};
          const fmtLvl = (n, f) => f === 'lowerLetter' ? toAlpha(n, false) : f === 'upperLetter' ? toAlpha(n, true) : f === 'lowerRoman' ? toRoman(n, false) : f === 'upperRoman' ? toRoman(n, true) : f === 'decimalZero' ? fmtCounter(n, 'decimal-leading-zero') : String(n);
          for(const p of host.querySelectorAll('p[class*="docx-num-"]')){
            const m2 = /docx-num-(\d+)-(\d+)/.exec(p.className);
            if(!m2) continue;
            const c = iwin.getComputedStyle(p, '::before').content;
            if(c && c !== 'none' && c !== 'normal') continue;
            const a = nums[m2[1]], L = parseInt(m2[2], 10), lv = a != null && abs[a] && abs[a][L];
            if(!lv) continue;
            const sc = synth[a] = synth[a] || [];
            sc[L] = sc[L] === undefined ? lv.start : sc[L] + 1;
            for(let k = L + 1; k < 10; k++) sc[k] = undefined;
            let txt;
            if(lv.fmt === 'bullet') txt = bulletFix(lv.text) || '•';
            else if(lv.fmt === 'none') txt = '';
            else txt = lv.text.replace(/%(\d)/g, (x, d) => { const k = parseInt(d, 10) - 1; const l2 = abs[a][k]; return fmtLvl(sc[k] === undefined ? (l2 ? l2.start : 1) : sc[k], l2 ? l2.fmt : 'decimal'); });
            if(!txt) continue;
            const first = p.querySelector('span');
            const mk = idoc.createElement('span');
            mk.setAttribute('style', (first ? first.getAttribute('style') : '') + ';display:inline-block;text-indent:0;width:' + (lv.hang / 20) + 'pt;');
            mk.textContent = txt;
            p.insertBefore(mk, p.firstChild);
            p.style.setProperty('margin-left', (lv.left / 20) + 'pt');
            p.style.setProperty('text-indent', (-lv.hang / 20) + 'pt');
          }
        }
      }catch(e){ /* číslování zůstane tak, jak je */ }
      await Promise.all([...host.querySelectorAll('img')].map(im => im.decode ? im.decode().catch(() => {}) : null));
      if(idoc.fonts && idoc.fonts.ready) await idoc.fonts.ready;
      const gcs = (el, pseudo) => iwin.getComputedStyle(el, pseudo);
      const sections = [...host.querySelectorAll('section.docx')];
      const counters = {};
      const imgCache = new Map();

      const result = [];
      for(const sec of sections){
        const sr = sec.getBoundingClientRect();
        const scs = gcs(sec);
        const pageW = sr.width;
        const pageH = Math.max(parseFloat(scs.minHeight) || 0, 1) || sr.height;
        const ops = [];   // {zone, kind, ...} souřadnice v px relativně k sekci
        const zoneOf = el => el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : 'body';

        // číslování seznamů: přepočet čítačů v pořadí dokumentu
        const markers = new Map();
        for(const p of sec.querySelectorAll('p')){
          const pcs = gcs(p);
          applyCounterList(counters, pcs.counterReset, 'set');
          applyCounterList(counters, pcs.counterSet, 'set');
          const bcs = gcs(p, '::before');
          if(bcs.content && bcs.content !== 'none' && bcs.content !== 'normal'){
            applyCounterList(counters, bcs.counterReset, 'set');
            applyCounterList(counters, bcs.counterSet, 'set');
            applyCounterList(counters, bcs.counterIncrement, 'inc');
            const txt = bulletFix(resolveContent(bcs.content, counters)).replace(/[\t ]/g, ' ').trim();
            if(txt) markers.set(p, { txt, cs: bcs });
          }
        }

        function pushRectOps(el, cs){
          const bg = parseColor(cs.backgroundColor);
          const rects = el.getClientRects();
          const zone = zoneOf(el);
          if(bg && !(bg[0] === 255 && bg[1] === 255 && bg[2] === 255)){
            for(const r of rects) if(r.width > 0.5 && r.height > 0.5) ops.push({ zone, kind: 'rect', x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height, color: bg });
          }
          const isInline = cs.display === 'inline';
          if(!isInline && rects.length){
            let r = el.getBoundingClientRect();
            if(el.tagName === 'P'){
              // Word spojí sousední odstavce se stejným orámováním do jednoho rámečku
              const sig = c => ['Top', 'Right', 'Bottom', 'Left'].map(sd => c['border' + sd + 'Width'] + c['border' + sd + 'Style'] + c['border' + sd + 'Color']).join('|');
              const same = (x, y) => x && y && x.tagName === 'P' && y.tagName === 'P' && sig(gcs(x)) === sig(gcs(y));
              if(same(el.previousElementSibling, el)) return;
              if(same(el, el.nextElementSibling)){
                let last = el; while(same(last, last.nextElementSibling)) last = last.nextElementSibling;
                const r2 = last.getBoundingClientRect();
                r = { left: Math.min(r.left, r2.left), right: Math.max(r.right, r2.right), top: r.top, bottom: r2.bottom };
              }
            }
            const sides = [['Top', r.left, r.top, r.right, r.top], ['Bottom', r.left, r.bottom, r.right, r.bottom], ['Left', r.left, r.top, r.left, r.bottom], ['Right', r.right, r.top, r.right, r.bottom]];
            for(const [s, x1, y1, x2, y2] of sides){
              const w = parseFloat(cs['border' + s + 'Width']); const st = cs['border' + s + 'Style'];
              if(!(w > 0) || st === 'none' || st === 'hidden') continue;
              const col = parseColor(cs['border' + s + 'Color']) || [0, 0, 0];
              const half = w / 2;
              const horiz = s === 'Top' || s === 'Bottom';
              const off = s === 'Top' || s === 'Left' ? half : -half;
              ops.push({ zone, kind: 'line', x1: x1 - sr.left + (horiz ? 0 : off), y1: y1 - sr.top + (horiz ? off : 0), x2: x2 - sr.left + (horiz ? 0 : off), y2: y2 - sr.top + (horiz ? off : 0), w, color: col, dash: st === 'dashed' || st === 'dotted' });
            }
          }
        }

        function lineBaseline(rect, cs){
          const asc = fam(cs) === 'serif' ? 0.891 : 0.905, desc = fam(cs) === 'serif' ? 0.216 : 0.212;
          return rect.top - sr.top + rect.height * asc / (asc + desc);
        }

        function pushText(node){
          const par = node.parentElement; if(!par) return;
          const cs = gcs(par);
          if(cs.visibility === 'hidden' || cs.display === 'none') return;
          const data = node.data; if(!/\S/.test(data)) return;
          const color = parseColor(cs.color) || [0, 0, 0];
          const size = parseFloat(cs.fontSize);
          const f = fam(cs), st = fstyle(cs);
          let underline = false;
          for(let e = par; e && e !== sec; e = e.parentElement){ const c = gcs(e); if(/underline/.test(c.textDecorationLine || '')){ underline = true; break; } if(c.display !== 'inline') break; }
          const upper = cs.textTransform === 'uppercase';
          const zone = zoneOf(par);
          const range = idoc.createRange();
          const re = /\S+/g; let m; const wordRects = [];
          while((m = re.exec(data))){
            range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
            const rects = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0);
            if(rects.length === 1){
              wordRects.push({ str: m[0], r: rects[0] });
            } else if(rects.length > 1){
              for(let k = 0; k < m[0].length; k++){
                range.setStart(node, m.index + k); range.setEnd(node, m.index + k + 1);
                const rr = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0)[0];
                if(rr) wordRects.push({ str: m[0][k], r: rr });
              }
            }
          }
          let prev = null;
          for(const w of wordRects){
            const r = w.r;
            const str = upper ? w.str.toUpperCase() : w.str;
            ops.push({ zone, kind: 'text', str, x: r.left - sr.left, y: r.top - sr.top, h: r.height, w: r.width, base: lineBaseline(r, cs), size, fam: f, st, color });
            if(underline){
              const ux1 = prev && Math.abs(prev.r.top - r.top) < 2 ? prev.r.right : r.left;
              ops.push({ zone, kind: 'line', x1: ux1 - sr.left, y1: lineBaseline(r, cs) + size * 0.1, x2: r.right - sr.left, y2: lineBaseline(r, cs) + size * 0.1, w: Math.max(0.6, size / 16), color, text: true });
            }
            prev = w;
          }
        }

        function walk(el){
          if(el.nodeType === 3){ pushText(el); return; }
          if(el.nodeType !== 1) return;
          const tag = el.tagName;
          if(tag === 'STYLE' || tag === 'SCRIPT' || tag === 'HEAD') return;
          const cs = gcs(el);
          if(cs.display === 'none' || cs.visibility === 'hidden') return;
          if(el !== sec) pushRectOps(el, cs);
          if(tag === 'IMG'){
            const r = el.getBoundingClientRect();
            if(r.width > 0 && r.height > 0) ops.push({ zone: zoneOf(el), kind: 'img', el, x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height });
            return;
          }
          if(tag === 'svg'){ return; }
          const mk = markers.get(el);
          if(mk){
            // značka seznamu: vlevo od prvního řádku odstavce (text-indent bývá záporný)
            const firstText = (function ft(n){ for(const c of n.childNodes){ if(c.nodeType === 3 && /\S/.test(c.data)) return c; if(c.nodeType === 1){ const x = ft(c); if(x) return x; } } return null; })(el);
            if(firstText){
              const rg = idoc.createRange(); rg.setStart(firstText, 0); rg.setEnd(firstText, Math.min(1, firstText.data.length));
              const fr = rg.getClientRects()[0];
              if(fr){
                const pr = el.getBoundingClientRect();
                const x0 = pr.left + (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.textIndent) || 0);
                const mcs = mk.cs;
                ops.push({ zone: zoneOf(el), kind: 'text', str: mk.txt, x: x0 - sr.left, y: fr.top - sr.top, h: fr.height, w: 0, base: lineBaseline(fr, mcs), size: parseFloat(mcs.fontSize), fam: fam(mcs), st: fstyle(mcs), color: parseColor(mcs.color) || [0, 0, 0] });
              }
            }
          }
          for(const c of el.childNodes) walk(c);
        }
        walk(sec);

        const hdr = sec.querySelector(':scope > header'), art = sec.querySelector(':scope > article'), ftr = sec.querySelector(':scope > footer');
        const top = el => el.getBoundingClientRect().top - sr.top;
        const padB = parseFloat(scs.paddingBottom) || 0;
        const footH = ftr ? ftr.getBoundingClientRect().height : 0;
        result.push({
          pageW, pageH, secH: sr.height, ops,
          bodyTop: art ? top(art) : (parseFloat(scs.paddingTop) || 0),
          bodyBottom: pageH - padB - footH,
          hasHeader: !!hdr, hasFooter: !!ftr,
        });
      }
      // obrázky -> dataURL (v kontextu iframe)
      for(const sd of result){
        for(const op of sd.ops){
          if(op.kind !== 'img') continue;
          const el = op.el;
          if(!imgCache.has(el.src)){
            try{
              const c = idoc.createElement('canvas');
              const nw = el.naturalWidth || Math.round(op.w), nh = el.naturalHeight || Math.round(op.h);
              const sc = Math.min(1, 1600 / Math.max(nw, nh));
              c.width = Math.max(1, Math.round(nw * sc)); c.height = Math.max(1, Math.round(nh * sc));
              c.getContext('2d').drawImage(el, 0, 0, c.width, c.height);
              imgCache.set(el.src, c.toDataURL('image/png'));
            }catch(e){ imgCache.set(el.src, null); }
          }
          op.data = imgCache.get(el.src); delete op.el;
        }
      }
      return result;
    } finally {
      iframe.remove();
    }
  }

  /** Když obsah přetéká stránku jen málo (Word/LibreOffice mívá řádkování o něco těsnější než prohlížeč), mírně se stáhnou svislé mezery, aby se vešel na jednu stránku. */
  function fitToPage(sd){
    const bodyH = Math.max(50, sd.bodyBottom - sd.bodyTop);
    let bot = 0;
    for(const op of sd.ops){ if(op.zone === 'body' && (op.kind === 'text' || op.kind === 'img')) bot = Math.max(bot, op.y + op.h); }
    const used = bot - sd.bodyTop;
    if(used <= bodyH || used > bodyH * 1.18) return;
    const f = bodyH / used, T = sd.bodyTop, sc = y => T + (y - T) * f;
    for(const op of sd.ops){
      if(op.zone !== 'body') continue;
      if(op.kind === 'line'){ op.y1 = sc(op.y1); op.y2 = sc(op.y2); }
      else { const y2 = sc(op.y + (op.h || 0)); op.y = sc(op.y); op.h = y2 - op.y; if(op.base != null) op.base = sc(op.base); }
    }
  }

  /** Rozdělí tělo sekce na stránky (po řádcích, aby nikdy nebyl řádek rozseknutý). */
  function paginate(sd){
    const bodyH = Math.max(50, sd.bodyBottom - sd.bodyTop);
    const atoms = [];
    const lines = new Map();
    for(const op of sd.ops){
      if(op.zone !== 'body') continue;
      if(op.kind === 'text'){
        const key = Math.round(op.base);
        const l = lines.get(key); const top = op.y, bot = op.y + op.h;
        if(l){ l.top = Math.min(l.top, top); l.bot = Math.max(l.bot, bot); } else lines.set(key, { top, bot });
      } else if(op.kind === 'img') atoms.push({ top: op.y, bot: op.y + op.h });
    }
    for(const l of lines.values()) atoms.push(l);
    atoms.sort((a, b) => a.top - b.top);
    const cuts = [sd.bodyTop];
    let limit = sd.bodyTop + bodyH, guard = 0;
    while(guard++ < 200){
      const over = atoms.filter(a => a.bot > limit + 0.5);
      if(!over.length) break;
      let cut = Math.min.apply(null, over.map(a => a.top));      // první řádek, který by přesáhl stránku, jde celý na další
      if(cut <= cuts[cuts.length - 1] + 1) cut = cuts[cuts.length - 1] + bodyH;   // obsah vyšší než stránka: tvrdý řez
      cuts.push(cut); limit = cut + bodyH;
    }
    return cuts;
  }

  /** Vykreslí výsledek do PDF (jsPDF). */
  async function buildPdf(sections, title){
    const { jsPDF } = window.jspdf;
    let doc = null;
    const usedFonts = new Set();
    for(const sd of sections) for(const op of sd.ops) if(op.kind === 'text') usedFonts.add(op.fam + ':' + op.st);
    const fontsToLoad = [...usedFonts];
    // písma: načtou se jen použitá
    const fontB64 = {};
    await Promise.all(fontsToLoad.map(async k => { const [f, s] = k.split(':'); fontB64[k] = await fontBase64(FONT_FILES[f][s]); }));

    const toPt = v => v * PX;
    let first = true;
    // dvouprůchodově: nejdřív rozdělení na stránky (kvůli celkovému počtu), pak kreslení
    const plans = [];
    for(const sd of sections){
      if(!sd.ops.some(o => o.zone === 'body' && (o.kind === 'text' || o.kind === 'img'))) continue;   // prázdná koncová sekce
      fitToPage(sd);
      plans.push({ sd, cuts: paginate(sd) });
      // pole „Stránka X z Y“ v záhlaví/zápatí
      const hf = sd.ops.filter(o => o.zone !== 'body' && o.kind === 'text');
      sd.pageFields = [];
      for(let i = 0; i + 3 < hf.length; i++){
        if(/^(Stránka|Strana|Page)$/i.test(hf[i].str) && /^\d+$/.test(hf[i + 1].str) && /^(z|of|\/)$/i.test(hf[i + 2].str) && /^\d+$/.test(hf[i + 3].str)) sd.pageFields.push({ pg: hf[i + 1], tot: hf[i + 3] });
      }
    }
    const totalPages = plans.reduce((n, pl) => n + pl.cuts.length, 0);
    let pageNo = 0;
    const setupFonts = d => {
      for(const k of fontsToLoad){
        const [f, s] = k.split(':'); const file = FONT_FILES[f][s];
        d.addFileToVFS(file, fontB64[k]);
        d.addFont(file, 'Lib' + f, s);
      }
    };
    for(const { sd, cuts } of plans){
      const wPt = toPt(sd.pageW), hPt = toPt(sd.pageH);
      for(let pi = 0; pi < cuts.length; pi++){
        const orient = wPt > hPt ? 'l' : 'p';
        if(first){ doc = new jsPDF({ unit: 'pt', format: [wPt, hPt], orientation: orient, compress: true }); setupFonts(doc); first = false; }
        else doc.addPage([wPt, hPt], orient);
        pageNo++;
        for(const f of sd.pageFields){ f.pg.str = String(pageNo); f.tot.str = String(totalPages); }
        const cutTop = cuts[pi], cutBot = pi + 1 < cuts.length ? cuts[pi + 1] : Infinity;
        for(const op of sd.ops){
          let dy;   // posun px: z pozice v sekci na pozici na stránce
          if(op.zone === 'header') dy = 0;
          else if(op.zone === 'footer') dy = sd.pageH - sd.secH;
          else dy = sd.bodyTop - cutTop;
          if(op.zone === 'body'){
            const y0 = op.kind === 'line' ? Math.min(op.y1, op.y2) : op.y, y1 = op.kind === 'line' ? Math.max(op.y1, op.y2) : op.y + (op.h || 0);
            if(op.kind === 'text' || op.kind === 'img'){ const yy = op.kind === 'text' ? op.base : op.y; if(!(yy >= cutTop - 0.5 && yy < cutBot - 0.5)) continue; }
            else if(y1 < cutTop || y0 >= cutBot) continue;
          }
          drawOp(doc, op, dy, op.zone === 'body' ? { top: cutTop, bot: cutBot } : null, sd);
        }
      }
    }
    if(!doc) doc = new jsPDF({ unit: 'pt', format: 'a4' });
    if(title) doc.setProperties({ title });
    return doc.output('blob');

    function drawOp(d, op, dy, clip, sd){
      if(op.kind === 'rect'){
        let y = op.y, h = op.h;
        if(clip){ const t = Math.max(y, clip.top), b = Math.min(y + h, clip.bot); if(b <= t) return; y = t; h = b - t; }
        d.setFillColor(op.color[0], op.color[1], op.color[2]);
        d.rect(toPt(op.x), toPt(y + dy), toPt(op.w), toPt(h), 'F');
      } else if(op.kind === 'line'){
        let { x1, y1, x2, y2 } = op;
        if(clip && x1 === x2){ const t = Math.max(Math.min(y1, y2), clip.top), b = Math.min(Math.max(y1, y2), clip.bot); if(b <= t) return; y1 = t; y2 = b; }
        else if(clip && !(y1 >= clip.top - 0.5 && y1 < clip.bot - 0.5)) return;
        d.setDrawColor(op.color[0], op.color[1], op.color[2]);
        d.setLineWidth(Math.max(0.3, toPt(op.w)));
        if(op.dash) d.setLineDashPattern([2, 2], 0); else d.setLineDashPattern([], 0);
        d.line(toPt(x1), toPt(y1 + dy), toPt(x2), toPt(y2 + dy));
        d.setLineDashPattern([], 0);
      } else if(op.kind === 'text'){
        d.setFont('Lib' + op.fam, op.st);
        d.setFontSize(toPt(op.size));
        d.setTextColor(op.color[0], op.color[1], op.color[2]);
        d.text(op.str, toPt(op.x), toPt(op.base + dy), { baseline: 'alphabetic' });
      } else if(op.kind === 'img' && op.data){
        try{ d.addImage(op.data, 'PNG', toPt(op.x), toPt(op.y + dy), toPt(op.w), toPt(op.h), undefined, 'FAST'); }catch(e){ /* obrázek se přeskočí */ }
      }
    }
  }

  /** Převede (vyplněný) .docx na PDF Blob. */
  async function docxToPdf(docxBlob, title){
    await ensurePdfLibs();
    const sections = await collectSections(docxBlob);
    return buildPdf(sections, title);
  }

  /** Sbalí soubory do ZIP: files = [{name, blob}] */
  async function zipFiles(files){
    await ensureZip();
    const zip = new JSZip();
    for(const f of files) zip.file(f.name, f.blob);
    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  }

  /* ---------------------------------------------------------------- Export do Vemy (ZHLAV) */
  const colLetters = (n) => { let s = ''; while(n > 0){ const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  const colIndex = (L) => L.split('').reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0);
  const xmlText = (v) => String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /** Vezme importní tabulku Vemy (.xlsx se třemi listy ZHLAV, Číselníky, Metadata) a do listu ZHLAV připíše za vzorový řádek (3.) data.
   *  Listy Číselníky a Metadata i řádky 1–3 zůstávají beze změny; formát buněk určují sloupce šablony.
   *  rows = pole řádků (hodnoty: číslo, Date, text, '' = prázdná buňka); requiredCols = indexy sloupců (od 0) označené ve 2. řádku červeně. */
  async function buildVemaXlsx(templateBuf, rows, requiredCols){
    await ensureZip();
    const zip = await JSZip.loadAsync(templateBuf);
    let xml = await zip.file('xl/worksheets/sheet1.xml').async('string');
    // styl sloupců ze šablony (formát čísla / data / textu)
    const colStyle = {};
    for(const m of xml.matchAll(/<col min="(\d+)" max="(\d+)"[^>]*?style="(\d+)"/g)) for(let c = +m[1]; c <= +m[2]; c++) colStyle[c] = m[3];

    // červené záhlaví povinných položek: nové písmo, výplň a styl v styles.xml
    let st = await zip.file('xl/styles.xml').async('string');
    const bump = (tag, add) => { st = st.replace(new RegExp('<' + tag + ' count="(\\d+)"([^>]*)>([\\s\\S]*?)</' + tag + '>'), (m, n, attrs, body) => '<' + tag + ' count="' + (+n + 1) + '"' + attrs + '>' + body + add + '</' + tag + '>'); return +(st.match(new RegExp('<' + tag + ' count="(\\d+)"'))[1]) - 1; };
    const fontId = bump('fonts', '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos Narrow"/><family val="2"/><scheme val="minor"/></font>');
    const fillId = bump('fills', '<fill><patternFill patternType="solid"><fgColor rgb="FFFF0000"/><bgColor indexed="64"/></patternFill></fill>');
    const redXf = bump('cellXfs', '<xf numFmtId="49" fontId="' + fontId + '" fillId="' + fillId + '" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1"/>');
    zip.file('xl/styles.xml', st);
    const req = new Set(requiredCols);
    xml = xml.replace(/<row r="2"[\s\S]*?<\/row>/, (row) => row.replace(/<c r="([A-Z]+)2" s="\d+"/g, (m, L) => req.has(colIndex(L) - 1) ? '<c r="' + L + '2" s="' + redXf + '"' : m));

    // datové řádky od 4. řádku
    const nCols = 151;
    const out = rows.map((r, i) => {
      const rn = 4 + i;
      let cells = '';
      r.forEach((v, ci) => {
        if(v === '' || v == null) return;
        const ref = colLetters(ci + 1) + rn, s = colStyle[ci + 1] ? ' s="' + colStyle[ci + 1] + '"' : '';
        if(v instanceof Date) cells += '<c r="' + ref + '"' + s + '><v>' + (Math.round(v.getTime() / 86400000) + 25569) + '</v></c>';
        else if(typeof v === 'number') cells += '<c r="' + ref + '"' + s + '><v>' + v + '</v></c>';
        else cells += '<c r="' + ref + '"' + s + ' t="inlineStr"><is><t xml:space="preserve">' + xmlText(v) + '</t></is></c>';
      });
      return '<row r="' + rn + '" spans="1:' + nCols + '">' + cells + '</row>';
    }).join('');
    xml = xml.replace('</sheetData>', out + '</sheetData>')
             .replace(/<dimension ref="[^"]*"\/>/, '<dimension ref="A1:' + colLetters(nCols) + (3 + rows.length) + '"/>')
             .replace(/<sortState[\s\S]*?<\/sortState>/, '');
    zip.file('xl/worksheets/sheet1.xml', xml);
    // po otevření se zobrazí list ZHLAV
    let wbx = await zip.file('xl/workbook.xml').async('string');
    zip.file('xl/workbook.xml', wbx.replace(/activeTab="\d+"/, 'activeTab="0"'));
    for(const n of ['xl/worksheets/sheet3.xml']){   // aktivní býval list Metadata (list Číselníky je velký, nečte se)
      const f = zip.file(n); if(!f) continue;
      const t = await f.async('string');
      if(t.indexOf(' tabSelected="1"') > -1 && t.indexOf(' tabSelected="1"') < 4000) zip.file(n, t.replace(' tabSelected="1"', ''));
    }
    xml = xml.replace(/<sheetView /, '<sheetView tabSelected="1" ');
    zip.file('xl/worksheets/sheet1.xml', xml);
    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', compression: 'DEFLATE', compressionOptions: { level: 1 } });
  }

  window.DocGen = { init(o){ ver = (o && o.version) || ''; }, fillTemplate, inspectTemplate, docxToPdf, zipFiles, buildVemaXlsx, DOCX_MIME };
})();

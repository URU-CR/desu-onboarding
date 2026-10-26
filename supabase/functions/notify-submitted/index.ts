// Edge Function: e-mailové upozornění, že zaměstnanec odeslal dotazník personálnímu oddělení.
// Volá ji aplikace v odkazu zaměstnance ({ id, token }) hned po úspěšném odeslání.
// Příjemce: e-mail osoby, která odkaz vygenerovala (record.linkGeneratedBy), jinak záložní e-mail z Nastavení (settings.notifyEmail).
// E-mail neobsahuje osobní údaje – jen jméno, pozici a datum nástupu. Odkaz vede na adresu aplikace (APP_URL).
//
// Secrets (supabase secrets set ...):  RESEND_API_KEY, NOTIFY_FROM (např. "Onboarding <onboarding@vase-domena.cz>"), APP_URL
// (SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY doplní Supabase sám.)
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const csDate = (iso: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? `${+m[3]}. ${+m[2]}. ${m[1]}` : (iso || ''); };
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let id = '', token = '';
  try { const b = await req.json(); id = String(b.id || ''); token = String(b.token || ''); } catch { return json({ error: 'bad request' }, 400); }
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id) || token.length < 20) return json({ error: 'bad request' }, 400);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const read = async (key: string) => {
    const { data } = await sb.from('kv_store').select('value').eq('key', key).maybeSingle();
    let v = data?.value;
    if (typeof v === 'string') { try { v = JSON.parse(v); } catch { /* ponechat */ } }
    return v ?? null;
  };

  const rec: any = await read('onboarding:record:' + id);
  if (!rec || !rec.accessToken || !safeEqual(String(rec.accessToken), token)) {
    await new Promise((r) => setTimeout(r, 500));
    return json({ error: 'denied' }, 403);
  }
  if (rec.personalStatus !== 'submitted' || rec.personalPurgedAt) return json({ sent: false, reason: 'not-submitted' });

  // ochrana proti opakovanému odeslání (několik kliknutí / opakované volání do 2 minut)
  const noteKey = 'onboarding:notified:' + id;
  const last: any = await read(noteKey);
  if (last && last.at && Date.now() - new Date(last.at).getTime() < 120000) return json({ sent: false, reason: 'recent' });

  const settings: any = await read('onboarding:settings');
  const to = String(rec.linkGeneratedBy || settings?.notifyEmail || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return json({ sent: false, reason: 'no-recipient' });

  const p = rec.personal || {};
  const name = [p.jmeno, p.prijmeni].filter(Boolean).join(' ') || 'zaměstnanec';
  const lines = [
    `Zaměstnanec ${name} vyplnil a odeslal dotazník personálnímu oddělení.`,
    p.pozice ? `Pozice: ${p.pozice}` : '',
    p.datum_nastupu ? `Datum nástupu: ${csDate(p.datum_nastupu)}` : '',
    '',
    'Údaje je potřeba zkontrolovat a schválit (nebo vrátit k doplnění) v aplikaci Onboarding.',
  ].filter((l, i, a) => l !== '' || (i > 0 && a[i - 1] !== ''));
  const appUrl = Deno.env.get('APP_URL') || '';
  const text = lines.join('\n') + (appUrl ? `\n\n${appUrl}` : '');
  const html = `<p>${lines.map(esc).join('<br>')}</p>` + (appUrl ? `<p><a href="${esc(appUrl)}">Otevřít aplikaci Onboarding</a></p>` : '');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + Deno.env.get('RESEND_API_KEY'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('NOTIFY_FROM'), to: [to], subject: `Dotazník vyplněn: ${name}`, text, html }),
  });
  if (!res.ok) { console.error('Resend', res.status, await res.text()); return json({ sent: false, reason: 'mail-failed' }, 502); }

  await sb.from('kv_store').upsert({ key: noteKey, value: JSON.stringify({ at: new Date().toISOString(), to }) }, { onConflict: 'key' });
  return json({ sent: true });
});

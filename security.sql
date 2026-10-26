-- =====================================================================
-- Onboarding – zabezpečení databáze (Supabase → SQL Editor → Run)
-- Spouštět celé najednou, v projektu Onboardingu. Je bezpečné spustit opakovaně.
--
-- Co skript dělá:
--  1) tabulku kv_store zamkne – smí do ní jen přihlášení zaměstnanci ze seznamu `staff`
--  2) zaměstnanci (bez přihlášení) se dostanou jen ke SVÉMU spisu, přes funkce
--     emp_open / emp_save a tajný token v odkazu; odkaz vyprší
--  3) po lhůtě od vygenerování tabulek pro VEMU smaže citlivé osobní údaje
--     (funkce purge_onboarding, volitelně denně přes pg_cron)
-- =====================================================================

-- 1) Seznam oprávněných zaměstnanců (personální + IT/provoz) ----------
create table if not exists public.staff (email text primary key);
alter table public.staff enable row level security;   -- bez politik: čte jen funkce níže
revoke all on public.staff from anon, authenticated;

-- Všichni, kdo už v tomto projektu mají účet, se zařadí automaticky.
-- Další přidáte:  insert into public.staff values ('jmeno@urad.cz');
insert into public.staff (email)
select lower(email) from auth.users where email is not null
on conflict do nothing;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff s
                 where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

-- 2) Zamčení kv_store ---------------------------------------------------
alter table public.kv_store enable row level security;
drop policy if exists kv_staff_all on public.kv_store;
create policy kv_staff_all on public.kv_store
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
revoke all on public.kv_store from anon;
grant select, insert, update, delete on public.kv_store to authenticated;

-- 3) Pomocné funkce (volat je smí jen jiné funkce, ne klienti) ----------
create or replace function public._kv_text(p_key text) returns text
language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  select to_jsonb(k.value) into v from public.kv_store k where k.key = p_key;
  if v is null then return null; end if;
  if jsonb_typeof(v) = 'string' then return v #>> '{}'; end if;
  return v::text;
end $$;

create or replace function public._kv_put(p_key text, p_text text) returns void
language plpgsql security definer set search_path = public as $$
declare t text;
begin
  select data_type into t from information_schema.columns
   where table_schema = 'public' and table_name = 'kv_store' and column_name = 'value';
  if t in ('jsonb', 'json') then
    execute format('update public.kv_store set value = %L::%s, updated_at = now() where key = %L',
                   to_jsonb(p_text)::text, t, p_key);
  else
    execute format('update public.kv_store set value = %L, updated_at = now() where key = %L',
                   p_text, p_key);
  end if;
end $$;

-- spis zaměstnance, pokud sedí token a odkaz nevypršel; jinak null
create or replace function public._emp_rec(p_id text, p_token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare txt text; rec jsonb;
begin
  if p_id is null or p_token is null or length(p_token) < 20 or p_id !~ '^[A-Za-z0-9_-]{1,80}$' then
    return null;
  end if;
  txt := public._kv_text('onboarding:record:' || p_id);
  if txt is null then return null; end if;
  rec := txt::jsonb;
  if coalesce(rec ->> 'accessToken', '') = '' or (rec ->> 'accessToken') <> p_token then
    perform pg_sleep(0.5);               -- zpomalení pokusů o hádání
    return null;
  end if;
  return rec;
end $$;

revoke all on function public._kv_text(text) from public, anon, authenticated;
revoke all on function public._kv_put(text, text) from public, anon, authenticated;
revoke all on function public._emp_rec(text, text) from public, anon, authenticated;

-- Seznam polí dotazníku, která vyplňuje zaměstnanec (= kroky s owner 'employee' v app.js).
-- Při změně dotazníku je třeba seznam aktualizovat zde a skript znovu spustit.
create or replace function public._emp_fields() returns text[]
language sql immutable as $$ select array[
    'titul_pred','jmeno','prijmeni','titul_za','rodne_prijmeni','prijmeni_byvale_1','prijmeni_byvale_2',
    'rodne_cislo','datum_narozeni','misto_narozeni','okres_narozeni','stat_narozeni','statni_prislusnost',
    'trvale_ulice','trvale_cp','trvale_co','trvale_obec','trvale_psc','kraj','trvale_stat','dorucovaci_adresa',
    'telefon_soukromy','email_soukromy','nouzovy_kontakt_jmeno','nouzovy_kontakt_telefon','nouzovy_kontakt_adresa',
    'zdravotni_pojistovna','cislo_uctu','kod_banky','souhlas_plat_ucet','souhlas_cestovni_nahrady','souhlas_stravovani',
    'rodinny_stav','jmeno_manzela','prijmeni_manzela','rodne_cislo_manzela','datum_narozeni_manzela',
    'statni_obcanstvi_manzela','bydliste_manzela','manzel_ztpp','deti','stav_vzdelani','rok_zahajeni','rok_ukonceni',
    'stupen_vzdelani','datum_zahajeni_vzdelani','datum_ukonceni_vzdelani','obor','ziskany_titul','skola','sidlo_skoly',
    'druh_zkousky','praxe','jazyky','prohlaseni_poplatnika','zpusob_rocniho_zuctovani','invalidita','zdrav_postizeni_ozp',
    'prukaz_zdravotni','zdrav_rozhodnuti_platnost_do','vojak','student_pripravujici_se','student_potvrzeni_do','duchod',
    'duchod_detail','pocet_vychovanych_deti','sluzebni_pomer_drive','clenstvi_organy','vydelecna_cinnost_souhlas',
    'soudni_rizeni','soudni_srazky','kurzy_dovednosti','prilohy'] $$;

-- Odstraní z kopie spisu osobní údaje zaměstnance (zůstane jméno, příjmení a údaje personálního oddělení).
create or replace function public._strip_personal(rec jsonb) returns jsonb
language plpgsql immutable set search_path = public as $$
declare np jsonb := coalesce(rec -> 'personal', '{}'::jsonb); k text;
begin
  foreach k in array public._emp_fields() loop
    continue when k in ('jmeno', 'prijmeni');
    if np ? k then
      np := jsonb_set(np, array[k], case when k in ('deti', 'praxe', 'jazyky', 'prilohy') then '[]'::jsonb else '""'::jsonb end, true);
    end if;
  end loop;
  return jsonb_set(rec, '{personal}', np, true);
end $$;
revoke all on function public._emp_fields() from public, anon, authenticated;
revoke all on function public._strip_personal(jsonb) from public, anon, authenticated;

-- 3b) Přílohy (kartička zdravotní pojišťovny, osvědčení ZOZ) -------------------
-- Soubory (zmenšené fotografie / PDF jako base64) leží v samostatné tabulce. Čtou je a mažou jen
-- přihlášení zaměstnanci ze seznamu staff; zaměstnanec (bez přihlášení) přes funkce emp_file_put / emp_file_del.
create table if not exists public.onboarding_files (
  id text primary key,
  rec_id text not null,
  kind text not null,
  name text not null,
  mime text not null,
  size int,
  data text not null,
  created_at timestamptz not null default now()
);
create index if not exists onboarding_files_rec_idx on public.onboarding_files (rec_id);
alter table public.onboarding_files enable row level security;
drop policy if exists files_staff_all on public.onboarding_files;
create policy files_staff_all on public.onboarding_files
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
revoke all on public.onboarding_files from anon;
grant select, insert, update, delete on public.onboarding_files to authenticated;

-- 4) Funkce pro zaměstnance (bez přihlášení) ---------------------------
create or replace function public.emp_open(p_id text, p_token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare rec jsonb; info_only boolean;
begin
  rec := public._emp_rec(p_id, p_token);
  if rec is null then return null; end if;
  -- Po vypršení platnosti dotazníku nebo po smazání údajů zůstane odkazu jen záložka „Co potřebujete vědět“:
  -- osobní údaje zaměstnance se v takovém případě vůbec neodešlou.
  info_only := (rec ->> 'personalPurgedAt') is not null
            or ((rec ->> 'linkExpiresAt') is not null and (rec ->> 'linkExpiresAt')::timestamptz < now());
  if info_only then rec := public._strip_personal(rec); end if;
  return jsonb_build_object(
    'record',   (rec - 'accessToken' - 'linkGeneratedBy'),
    'infoOnly', info_only,
    'settings', public._kv_text('onboarding:settings'),
    'info',     public._kv_text('onboarding:info-content'));
end $$;

-- Pole, která smí zaměstnanec měnit (= kroky dotazníku s owner 'employee' v app.js).
-- Při změně dotazníku je třeba seznam aktualizovat i tady.
create or replace function public.emp_save(p_id text, p_token text, p_patch jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  rec jsonb; cur text; nw text; np jsonb; k text; idx jsonb;
  allowed text[] := public._emp_fields();
begin
  if p_patch is null or length(p_patch::text) > 300000 then return false; end if;
  rec := public._emp_rec(p_id, p_token);
  if rec is null then return false; end if;
  if rec ->> 'linkExpiresAt' is not null and (rec ->> 'linkExpiresAt')::timestamptz < now() then return false; end if;
  if rec ->> 'personalPurgedAt' is not null then return false; end if;

  cur := coalesce(rec ->> 'personalStatus', 'draft');
  nw  := coalesce(p_patch ->> 'personalStatus', cur);

  if cur in ('draft', 'returned') then
    if nw not in (cur, 'submitted') then return false; end if;
    np := coalesce(rec -> 'personal', '{}'::jsonb);
    if jsonb_typeof(p_patch -> 'personal') = 'object' then
      for k in select jsonb_object_keys(p_patch -> 'personal') loop
        if k = any (allowed) then
          np := jsonb_set(np, array[k], p_patch -> 'personal' -> k, true);
        end if;
      end loop;
    end if;
    rec := jsonb_set(rec, '{personal}', np, true);
    -- zaměstnanec smí jen ODEBRAT označení personálního (vlajky) a vymazat vzkaz; nové přidat ani změnit nemůže
    if jsonb_typeof(p_patch -> 'fieldFlags') = 'object' and jsonb_typeof(rec -> 'fieldFlags') = 'object' then
      rec := jsonb_set(rec, '{fieldFlags}',
        coalesce((select jsonb_object_agg(e.key, e.value) from jsonb_each(rec -> 'fieldFlags') e
                  where (p_patch -> 'fieldFlags') ? e.key), '{}'::jsonb), true);
    end if;
    if p_patch ? 'returnNote' and (p_patch ->> 'returnNote') = '' then
      rec := jsonb_set(rec, '{returnNote}', '""'::jsonb, true);
    end if;
    if p_patch ? 'consentGiven' and jsonb_typeof(p_patch -> 'consentGiven') = 'boolean' then
      rec := jsonb_set(rec, '{consentGiven}', p_patch -> 'consentGiven', true);
    end if;
    if p_patch ? 'consentAt' and jsonb_typeof(p_patch -> 'consentAt') = 'string' then
      rec := jsonb_set(rec, '{consentAt}', p_patch -> 'consentAt', true);
    end if;
  elsif cur = 'submitted' then
    if nw not in ('submitted', 'draft') then return false; end if;   -- „Stáhnout zpět a opravit“
  else
    return false;                                                   -- schváleno: zaměstnanec už nic nemění
  end if;

  if p_patch ? 'firstDayDismissed' and jsonb_typeof(p_patch -> 'firstDayDismissed') = 'boolean' then
    rec := jsonb_set(rec, '{firstDayDismissed}', p_patch -> 'firstDayDismissed', true);
  end if;
  rec := jsonb_set(rec, '{personalStatus}', to_jsonb(nw), true);
  perform public._kv_put('onboarding:record:' || p_id, rec::text);

  -- stav ve společném rejstříku
  begin
    idx := public._kv_text('onboarding:index')::jsonb;
    if jsonb_typeof(idx) = 'array' then
      select coalesce(jsonb_agg(case when e ->> 'id' = p_id
                                     then jsonb_set(e, '{personalStatus}', to_jsonb(nw), true) else e end), '[]'::jsonb)
        into idx from jsonb_array_elements(idx) e;
      perform public._kv_put('onboarding:index', idx::text);
    end if;
  exception when others then null;
  end;
  return true;
end $$;

revoke all on function public.emp_open(text, text) from public;
revoke all on function public.emp_save(text, text, jsonb) from public;
grant execute on function public.emp_open(text, text) to anon, authenticated;
grant execute on function public.emp_save(text, text, jsonb) to anon, authenticated;

-- Nahrání / smazání přílohy zaměstnancem. Jen u otevřeného dotazníku (rozepsaný nebo vrácený),
-- platný odkaz, omezená velikost a počet souborů, povolené jen JPEG / PNG / PDF.
create or replace function public.emp_file_put(p_id text, p_token text, p_fid text, p_kind text,
                                               p_name text, p_mime text, p_data text) returns boolean
language plpgsql security definer set search_path = public as $$
declare rec jsonb; st text; n int;
begin
  rec := public._emp_rec(p_id, p_token);
  if rec is null then return false; end if;
  if rec ->> 'personalPurgedAt' is not null then return false; end if;
  if rec ->> 'linkExpiresAt' is not null and (rec ->> 'linkExpiresAt')::timestamptz < now() then return false; end if;
  st := coalesce(rec ->> 'personalStatus', 'draft');
  if st not in ('draft', 'returned') then return false; end if;
  if p_fid is null or p_fid !~ '^[A-Za-z0-9_-]{8,40}$' then return false; end if;
  if p_kind is null or p_kind not in ('zp_karta', 'zoz') then return false; end if;
  if p_mime is null or p_mime not in ('image/jpeg', 'image/png', 'application/pdf') then return false; end if;
  if p_data is null or length(p_data) < 100 or length(p_data) > 4200000 or p_data !~ '^[A-Za-z0-9+/=]+$' then return false; end if;
  select count(*) into n from public.onboarding_files where rec_id = p_id and id <> p_fid;
  if n >= 12 then return false; end if;
  insert into public.onboarding_files (id, rec_id, kind, name, mime, size, data)
  values (p_fid, p_id, p_kind, left(coalesce(p_name, 'soubor'), 120), p_mime, (length(p_data) * 3) / 4, p_data)
  on conflict (id) do update
    set kind = excluded.kind, name = excluded.name, mime = excluded.mime, size = excluded.size, data = excluded.data
    where public.onboarding_files.rec_id = p_id;
  return true;
end $$;

create or replace function public.emp_file_del(p_id text, p_token text, p_fid text) returns boolean
language plpgsql security definer set search_path = public as $$
declare rec jsonb; st text;
begin
  rec := public._emp_rec(p_id, p_token);
  if rec is null then return false; end if;
  if rec ->> 'personalPurgedAt' is not null then return false; end if;
  st := coalesce(rec ->> 'personalStatus', 'draft');
  if st not in ('draft', 'returned') then return false; end if;
  delete from public.onboarding_files where id = p_fid and rec_id = p_id;
  return true;
end $$;

revoke all on function public.emp_file_put(text, text, text, text, text, text, text) from public;
revoke all on function public.emp_file_del(text, text, text) from public;
grant execute on function public.emp_file_put(text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.emp_file_del(text, text, text) to anon, authenticated;

-- 5) Mazání osobních údajů po lhůtě ---------------------------------------
-- Pro spisy, u kterých od vygenerování tabulek pro VEMU uplynulo p_days dní,
-- smaže osobní údaje zaměstnance (zůstane jméno, příjmení, pozice, pracoviště,
-- datum nástupu a stavy; odkaz dál otevře jen záložku „Co potřebujete vědět“). Vrací počet vyčištěných spisů.
create or replace function public.purge_onboarding(p_days int default 60) returns int
language plpgsql security definer set search_path = public as $$
declare r record; rec jsonb; n int := 0;
begin
  for r in select key from public.kv_store where key like 'onboarding:record:%' loop
    begin
      rec := public._kv_text(r.key)::jsonb;
      continue when rec is null;
      continue when rec ->> 'personalPurgedAt' is not null;
      continue when rec ->> 'vemaExportedAt' is null;
      continue when (rec ->> 'vemaExportedAt')::timestamptz > now() - make_interval(days => p_days);
      rec := public._strip_personal(rec);
      rec := jsonb_set(rec, '{personalPurgedAt}', to_jsonb(now()), true);
      rec := jsonb_set(rec, '{consentGiven}', 'false'::jsonb, true);
      rec := jsonb_set(rec, '{fieldFlags}', '{}'::jsonb, true);
      delete from public.onboarding_files where rec_id = substr(r.key, length('onboarding:record:') + 1);
      perform public._kv_put(r.key, rec::text);   -- odkaz (accessToken) zůstává: dál otevře jen „Co potřebujete vědět“
      n := n + 1;
    exception when others then null;
    end;
  end loop;
  return n;
end $$;
revoke all on function public.purge_onboarding(int) from public, anon, authenticated;

-- Denní spuštění (volitelné): v Supabase nejdřív Database → Extensions → zapnout pg_cron, pak odkomentovat:
-- select cron.schedule('onboarding-purge', '15 3 * * *', $$select public.purge_onboarding(60)$$);
-- Ruční spuštění (počet dní od exportu do VEMY):  select public.purge_onboarding(60);

# Upozornění e-mailem: zaměstnanec odeslal dotazník

Funkce `notify-submitted` pošle e-mail osobě z personálního oddělení, která zaměstnanci vygenerovala odkaz.
Spouští ji aplikace v odkazu zaměstnance po úspěšném odeslání dotazníku. Bez nasazení funkce aplikace funguje dál, jen se nic neodesílá.

## Jednorázové nasazení

1. **Resend** (resend.com, zdarma stačí): vytvořte účet, ověřte odesílací doménu (nebo adresu) a vytvořte API klíč.
2. **Supabase CLI** (v projektu `bmvaoettvivhgdoycphz`):
   ```
   supabase login
   supabase link --project-ref bmvaoettvivhgdoycphz
   supabase secrets set RESEND_API_KEY=re_xxx NOTIFY_FROM="Onboarding <onboarding@vase-domena.cz>" APP_URL="https://adresa-aplikace/"
   supabase functions deploy notify-submitted
   ```
3. Znovu spusťte `security.sql` (odkaz zaměstnance už nevidí e-mail osoby, která odkaz vygenerovala).
4. V aplikaci v Nastavení → Upozornění na odevzdaný dotazník vyplňte záložní e-mail (pro odkazy vygenerované před touto změnou).

## Jak to funguje
- Při kopírování/e-mailování odkazu se do spisu uloží `linkGeneratedBy` (e-mail přihlášeného personalisty).
- Po odeslání dotazníku aplikace zavolá funkci s `id` spisu a tajným tokenem z odkazu. Funkce token ověří, zkontroluje stav „odesláno“ a pošle e-mail na `linkGeneratedBy`, jinak na záložní e-mail z Nastavení.
- E-mail obsahuje jen jméno, pozici a datum nástupu (žádné osobní údaje z dotazníku). Opakované volání do 2 minut se ignoruje (záznam `onboarding:notified:<id>`).

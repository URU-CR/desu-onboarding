# Onboarding – pravidla pro úpravy

- Každá funkční změna musí aktualizovat pole `HELP` v `app.js` (nápověda vlevo, pohled personálního oddělení) a zvýšit `APP_VERSION` + `?v=` v `index.html`.
- Existují dvě nápovědy: `HELP` (personální oddělení) a `HELP_EMP` (dotazník zaměstnance, jednoduchým jazykem). Změnu dotazníku promítnout do `HELP_EMP`.
- Komunikace s uživatelem česky.
- Zabezpečení: databáze je zamčená skriptem `security.sql` (RLS, tabulka `staff`, funkce `emp_open`/`emp_save`, `purge_onboarding`). Zaměstnanec přistupuje jen přes tyto funkce. Při přidání/odebrání pole v dotazníku (sekce s `owner:'employee'`) aktualizovat seznamy polí `allowed` (emp_save) a `wipe` (purge_onboarding) v `security.sql` a znovu ho spustit.

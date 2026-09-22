const STORAGE_INDEX_KEY = 'onboarding:index';
const STORAGE_INFO_KEY = 'onboarding:info-content';
const STORAGE_SETTINGS_KEY = 'onboarding:settings';
const recordKey = id => 'onboarding:record:' + id;

const OWNER_LABEL = { hr:'Personální oddělení', employee:'Zaměstnanec', admin:'IT a provoz' };

const DEFAULT_WORKPLACES = ['MD', 'Letenská', 'Olomouc', 'Plzeň', 'Brno', 'České Budějovice', 'Letiště'];
const DEFAULT_POSITIONS = ['Referent','Analytik','Metodik','Právník','Ekonom','Architekt','Specialista IT','Personalista','Asistent/ka','Vedoucí oddělení'];
const DEFAULT_ADMINS = [];
const DEFAULT_SUPERVISORS = [];
const DEFAULT_DEPARTMENTS = [
  'Kancelář předsedy',
  'Interní audit',
  'Odbor metodiky stavebního řádu',
  'Oddělení právní',
  'Oddělení metodické',
  'Oddělení technické',
  'Odbor metodiky územního plánování a rozvoje',
  'Oddělení plánování',
  'Oddělení provozních činností a digitalizace',
  'Oddělení koncepční a metodické',
  'Odbor pořizování územně plánovací dokumentace',
  'Oddělení informací o územním rozvoji',
  'Oddělení územního rozvoje',
  'Odbor ochrany životního prostředí',
  'Oddělení ochrany životního prostředí 1',
  'Oddělení ochrany životního prostředí 2',
  'Oddělení ochrany životního prostředí 3',
  'Odbor ochrany ostatních chráněných veřejných zájmů',
  'Oddělení ochrany ostatních chráněných veřejných zájmů 1',
  'Oddělení ochrany ostatních chráněných veřejných zájmů 2',
  'Oddělení ochrany veřejného zdraví',
  'Odbor stavebně správní',
  'Oddělení územně a stavebně správní I',
  'Oddělení územně a stavebně správní II',
  'Oddělení územně a stavebně správní III',
  'Odbor legislativní a právní',
  'Oddělení právní (zastupování před soudy)',
  'Oddělení legislativní',
  'Odbor transformace státní stavební správy',
  'Oddělení implementace',
  'Oddělení realizace',
  'Oddělení staveb pozemních komunikací I',
  'Oddělení staveb pozemních komunikací II',
  'Odbor staveb drah',
  'Oddělení staveb drah Praha',
  'Oddělení staveb drah Olomouc',
  'Oddělení staveb drah Plzeň',
  'Oddělení pražských městských drah',
  'Samostatné oddělení civilních leteckých staveb',
  'Samostatné oddělení staveb vodních děl a staveb pro vodní dopravu',
  'Odbor energetických a průmyslových staveb',
  'Oddělení energetických liniových staveb',
  'Oddělení staveb obnovitelných zdrojů energie',
  'Oddělení průmyslových a těžebních staveb',
  'Oddělení staveb výroben energie',
  'Odbor staveb pro bydlení',
  'Oddělení staveb pro bydlení Praha',
  'Oddělení staveb pro bydlení Plzeň/ČB',
  'Oddělení staveb pro bydlení Olomouc',
  'Oddělení vyvlastnění a právních činností Čechy I',
  'Oddělení vyvlastnění a právních činností Morava',
  'Samostatné oddělení odvolacích řízení - dopravní stavby',
  'Samostatné oddělení odvolacích řízení - energetické stavby',
  'Odbor personální, ekonomický a provozní',
  'Oddělení personální',
  'Oddělení ekonomické',
  'Oddělení provozu digitálních služeb',
  'Oddělení provozní a IT',
];
const DEFAULT_FACILITY_STAFF = [];
const DEFAULT_OFFICES = {};
const DEFAULT_WORKPLACE_VEMA_CODES = {};
const DEFAULT_WORKPLACE_LOCATIONS = {};
const ORG_TRANSITION_DATE = new Date('2027-01-01T00:00:00');
function isAfterOrgTransition(){ return new Date() >= ORG_TRANSITION_DATE; }
function currentOrgName(){ return isAfterOrgTransition() ? 'Úřad rozvoje území ČR' : 'Dopravní a energetický stavební úřad'; }
function currentOrgAbbrev(){ return isAfterOrgTransition() ? 'ÚRÚ ČR' : 'DESÚ'; }

const ONBOARDING_TYPES = [
  'Delimitace — zůstává na současném pracovišti',
  'Delimitace — přechod na nové pracoviště',
  'Nový zaměstnanec',
];
const DEFAULT_CATEGORIES = [
  { name:'Referent', systems:['vema','vema_server','issr','vita','espis','czechpoint','katastr'] },
  { name:'Metodik', systems:['vema','vema_server','espis','czechpoint','katastr'] },
  { name:'Ekonom', systems:['vema','vema_server','espis','muzo'] },
  { name:'Vše', systems:['vema','vema_server','issr','vita','espis','czechpoint','katastr','muzo'] },
];
const SYSTEM_URL_KEYS = ['vema','vita','espis','issr','czechpoint','katastr','muzo'];
const DEFAULT_SYSTEM_URLS = {};
const DEFAULT_SYSTEM_TYPES = {};

const SETTINGS_RESET_OPTIONS = [
  { key:'workplaces', label:'Pracoviště', getDefault: () => [...DEFAULT_WORKPLACES] },
  { key:'positions', label:'Pracovní pozice', getDefault: () => [...DEFAULT_POSITIONS] },
  { key:'departments', label:'Odbory / oddělení', getDefault: () => [...DEFAULT_DEPARTMENTS] },
  { key:'supervisors', label:'Nadřízení', getDefault: () => [...DEFAULT_SUPERVISORS] },
  { key:'admins', label:'Administrátoři systémů', getDefault: () => [...DEFAULT_ADMINS] },
  { key:'facilityStaff', label:'Pracovníci provozu', getDefault: () => [...DEFAULT_FACILITY_STAFF] },
  { key:'categories', label:'Kategorie a přiřazené systémy', getDefault: () => JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)) },
  { key:'offices', label:'Kanceláře podle budovy', getDefault: () => ({...DEFAULT_OFFICES}) },
  { key:'workplaceVemaCodes', label:'Kódy pracovišť pro Vemu', getDefault: () => ({...DEFAULT_WORKPLACE_VEMA_CODES}) },
  { key:'workplaceLocations', label:'Umístění pracovišť (okres/obec/sídlo)', getDefault: () => ({...DEFAULT_WORKPLACE_LOCATIONS}) },
  { key:'vemaConstants', label:'Pevné hodnoty pro export do Vemy', getDefault: () => ({}) },
  { key:'systemUrls', label:'Adresy systémů', getDefault: () => ({...DEFAULT_SYSTEM_URLS}) },
  { key:'systemTypes', label:'Typy adres systémů (web/plocha)', getDefault: () => ({...DEFAULT_SYSTEM_TYPES}) },
  { key:'hrRequiredOverrides', label:'Povinné položky personálního oddělení', getDefault: () => ({}) },
];

function systemUrls(){ return (state.settings && state.settings.systemUrls) || DEFAULT_SYSTEM_URLS; }
function systemTypes(){ return (state.settings && state.settings.systemTypes) || DEFAULT_SYSTEM_TYPES; }
function workplaceList(){ return (state.settings && state.settings.workplaces) || DEFAULT_WORKPLACES; }
function positionList(){ return (state.settings && state.settings.positions) || DEFAULT_POSITIONS; }
function adminList(){ return (state.settings && state.settings.admins) || DEFAULT_ADMINS; }
function supervisorList(){ return (state.settings && state.settings.supervisors) || DEFAULT_SUPERVISORS; }
function departmentList(){ return (state.settings && state.settings.departments) || DEFAULT_DEPARTMENTS; }
function facilityStaffList(){ return (state.settings && state.settings.facilityStaff) || DEFAULT_FACILITY_STAFF; }
function officesByWorkplace(){ return (state.settings && state.settings.offices) || DEFAULT_OFFICES; }
function officesForWorkplace(workplace){ return (officesByWorkplace()[workplace]) || []; }
function workplaceVemaCodes(){ return (state.settings && state.settings.workplaceVemaCodes) || DEFAULT_WORKPLACE_VEMA_CODES; }
function workplaceVemaCode(workplace){ return workplaceVemaCodes()[workplace] || ''; }
function workplaceLocations(){ return (state.settings && state.settings.workplaceLocations) || DEFAULT_WORKPLACE_LOCATIONS; }
function workplaceLocation(workplace){ return workplaceLocations()[workplace] || {okres:'', obec:'', sidlo:''}; }
function categoryList(){ return (state.settings && state.settings.categories) || DEFAULT_CATEGORIES; }
function categoryNames(){ return categoryList().map(c => c.name); }
function systemsForCategory(name){ const c = categoryList().find(c => c.name === name); return c ? c.systems : []; }
function resolveField(f){
  if(f.id === 'pracoviste') return {...f, options: ['', ...workplaceList()]};
  if(f.id === 'kategorie') return {...f, options: ['', ...categoryNames()]};
  if(f.id === 'pozice') return {...f, options: ['', ...positionList()]};
  if(f.id === 'nadrizeny') return {...f, options: ['', ...supervisorList()]};
  if(f.id === 'odbor_oddeleni') return {...f, options: ['', ...departmentList()]};
  return f;
}

const KRAJE = ['Hlavní město Praha','Středočeský kraj','Jihočeský kraj','Plzeňský kraj','Karlovarský kraj','Ústecký kraj','Liberecký kraj','Královéhradecký kraj','Pardubický kraj','Kraj Vysočina','Jihomoravský kraj','Olomoucký kraj','Zlínský kraj','Moravskoslezský kraj'];

const PERSONAL_SECTIONS = [
  { id:'zakladni', label:'Základní údaje', navLabel:'Základní údaje', owner:'employee', fields:[
    {id:'titul_pred', label:'Titul (před jménem)', autocomplete:'honorific-prefix'},
    {id:'jmeno', label:'Jméno', required:true, essential:true, autocomplete:'given-name'},
    {id:'prijmeni', label:'Příjmení', required:true, essential:true, autocomplete:'family-name'},
    {id:'titul_za', label:'Titul (za jménem)', autocomplete:'honorific-suffix'},
    {id:'rodne_prijmeni', label:'Rodné příjmení'},
    {id:'prijmeni_byvale_1', label:'Příjmení bývalé (1)'},
    {id:'prijmeni_byvale_2', label:'Příjmení bývalé (2)'},
    {id:'rodne_cislo', label:'Rodné číslo', placeholder:'900101/1234', validate:'rodneCislo', essential:true},
    {id:'datum_narozeni', label:'Datum narození', type:'date', validate:'birthDateVsRC', autofillFrom:'rodne_cislo', essential:true, autocomplete:'bday'},
    {id:'misto_narozeni', label:'Obec narození'},
    {id:'okres_narozeni', label:'Okres narození'},
    {id:'stat_narozeni', label:'Stát narození', placeholder:'Česká republika', default:'Česká republika', datalist:'zeme'},
    {id:'statni_prislusnost', label:'Státní příslušnost', placeholder:'Česká republika', default:'Česká republika', essential:true, autocomplete:'country-name', datalist:'zeme'},
  ]},
  { id:'kontakt', label:'Bydliště a kontakt', navLabel:'Kontakt', owner:'employee', fields:[
    {id:'trvale_ulice', label:'Ulice', essential:true, autocomplete:'address-line1'},
    {id:'trvale_cp', label:'Číslo popisné', essential:true},
    {id:'trvale_co', label:'Číslo orientační'},
    {id:'trvale_obec', label:'Obec', essential:true, autocomplete:'address-level2'},
    {id:'trvale_psc', label:'PSČ', placeholder:'123 45', validate:'psc', essential:true, autocomplete:'postal-code'},
    {id:'kraj', label:'Kraj', essential:true, type:'select', options:['', ...KRAJE]},
    {id:'trvale_stat', label:'Stát', placeholder:'Česká republika', default:'Česká republika', essential:true, autocomplete:'country-name', datalist:'zeme'},
    {id:'dorucovaci_adresa', label:'Doručovací adresa (vyplňte, jen pokud jiná než trvalá)', full:true},
    {id:'telefon_soukromy', label:'Telefon (soukromý)', type:'tel', validate:'telefon', essential:true, autocomplete:'tel'},
    {id:'email_soukromy', label:'E-mail (soukromý)', type:'email', validate:'email', essential:true, autocomplete:'email'},
    {id:'nouzovy_kontakt_jmeno', label:'Kontaktní osoba pro mimořádnou událost — jméno'},
    {id:'nouzovy_kontakt_telefon', label:'Kontaktní osoba pro mimořádnou událost — telefon', type:'tel'},
    {id:'nouzovy_kontakt_adresa', label:'Kontaktní osoba pro mimořádnou událost — adresa', full:true},
  ]},
  { id:'doklady', label:'Doklady, účet, pojišťovna', navLabel:'Doklady', owner:'employee', fields:[
    {id:'cislo_op', label:'Číslo OP', validate:'cisloOP', essential:true},
    {id:'platnost_op', label:'Platnost OP', type:'date', validate:'platnostOP'},
    {id:'cislo_pasu', label:'Číslo cestovního pasu (nepovinné)'},
    {id:'zdravotni_pojistovna', label:'Zdravotní pojišťovna', essential:true, full:true, insuranceList:true},
    {id:'cislo_uctu', label:'Číslo bankovního účtu', placeholder:'123456789', validate:'cisloUctu', essential:true},
    {id:'kod_banky', label:'Kód banky', placeholder:'např. 0100', validate:'kodBanky', bankList:true, essential:true},
    {id:'souhlas_plat_ucet', label:'Souhlasím se zasíláním platu na tento účet', essential:true, type:'select', options:['','Ano','Ne'], showIf:p=>!!p.cislo_uctu},
    {id:'souhlas_cestovni_nahrady', label:'Souhlasím se zasíláním cestovních náhrad na tento účet', essential:true, type:'select', options:['','Ano','Ne'], showIf:p=>!!p.cislo_uctu},
    {id:'souhlas_stravovani', label:'Souhlasím se zasíláním příspěvku na stravování na tento účet', essential:true, type:'select', options:['','Ano','Ne'], showIf:p=>!!p.cislo_uctu},
  ]},
  { id:'rodina', label:'Rodinný stav', navLabel:'Rodina', owner:'employee', fields:[
    {id:'rodinny_stav', label:'Rodinný stav', essential:true, type:'select', options:['','Svobodný/á','Ženatý/vdaná','Rozvedený/á','Vdovec/vdova','Registrované partnerství']},
    {id:'jmeno_manzela', label:'Jméno manžela/manželky', showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
    {id:'prijmeni_manzela', label:'Příjmení manžela/manželky', showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
    {id:'rodne_cislo_manzela', label:'Rodné číslo manžela/manželky', validate:'rodneCislo', showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
    {id:'datum_narozeni_manzela', label:'Datum narození manžela/manželky', type:'date', showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
    {id:'statni_obcanstvi_manzela', label:'Státní občanství manžela/manželky', default:'Česká republika', datalist:'zeme', showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
    {id:'bydliste_manzela', label:'Bydliště manžela/manželky', full:true, showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
    {id:'manzel_ztpp', label:'Manžel/ka je držitel/ka průkazu ZTP/P', essential:true, type:'select', options:['','Ne','Ano'], showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
  ]},
  { id:'deti', label:'Děti', navLabel:'Děti', owner:'employee', type:'repeat', optional:true, addLabel:'+ Přidat dítě', fields:[
    {id:'jmeno', label:'Jméno'},
    {id:'prijmeni', label:'Příjmení'},
    {id:'rodne_cislo', label:'Rodné číslo', placeholder:'120101/1234', validate:'rodneCislo'},
    {id:'datum_narozeni', label:'Datum narození', type:'date', validate:'birthDateVsRC', autofillFrom:'rodne_cislo'},
    {id:'studuje', label:'Soustavně studuje', essential:true, type:'select', options:['','Ano','Ne']},
    {id:'danove_zvyhodneni', label:'Uplatňuji na toto dítě daňové zvýhodnění', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'ztpp', label:'Dítě je držitel průkazu ZTP/P', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'bydliste', label:'Bydliště (jen pokud nezaopatřené dítě žije jinde)', full:true},
  ]},
  { id:'vzdelani', label:'Vzdělání', navLabel:'Vzdělání', owner:'employee', fields:[
    {id:'stav_vzdelani', label:'Stav studia', essential:true, type:'select', options:['','Dokončené','Probíhající','Nedokončené']},
    {id:'rok_zahajeni', label:'Rok zahájení studia', validate:'yearZahajeni'},
    {id:'rok_ukonceni', label:'Rok ukončení studia', validate:'yearUkonceni'},
    {id:'stupen_vzdelani', label:'Nejvyšší dosažené vzdělání', type:'select', options:['','Základní','Střední bez maturity','Střední s maturitou','Vyšší odborné','Vysokoškolské — bakalářské','Vysokoškolské — magisterské','Vysokoškolské — doktorské'], essential:true},
    {id:'datum_ukonceni_vzdelani', label:'Datum ukončení nejvyššího vzdělání', type:'date', essential:true, showIf:p=>p.stav_vzdelani==='Dokončené'},
    {id:'obor', label:'Obor', essential:true},
    {id:'skola', label:'Název školy'},
    {id:'sidlo_skoly', label:'Sídlo školy'},
    {id:'druh_zkousky', label:'Druh zkoušky (maturita, státní zkouška, certifikát…)', showIf:p=>p.stav_vzdelani==='Dokončené'},
  ]},
  { id:'praxe', label:'Předchozí zaměstnání a praxe', navLabel:'Praxe', owner:'employee', type:'repeat', optional:true, addLabel:'+ Přidat zaměstnání', fields:[
    {id:'od', label:'Od', type:'date'},
    {id:'do', label:'Do', type:'date', validate:'praxeDo'},
    {id:'organizace', label:'Organizace'},
    {id:'sidlo', label:'Sídlo organizace'},
    {id:'pracovni_zarazeni', label:'Pracovní zařazení / vykonávaná činnost', full:true},
  ]},
  { id:'jazyky', label:'Jazykové znalosti', navLabel:'Jazyky', owner:'employee', type:'repeat', optional:true, addLabel:'+ Přidat jazyk', fields:[
    {id:'jazyk', label:'Jazyk', datalist:'jazyky'},
    {id:'stupen_znalosti', label:'Stupeň znalosti', essential:true, type:'select', options:['','Základní (začátečník)','Střední (pokročilý)','Odborný']},
    {id:'stupen_osvedceni', label:'Stupeň osvědčení', placeholder:'maturita, státní zkouška, certifikát…'},
    {id:'pouzivani', label:'Používání', essential:true, type:'select', options:['','Aktivní','Pasivní']},
  ]},
  { id:'dalsi_udaje', label:'Další povinné údaje', navLabel:'Další údaje', owner:'employee', optional:true, fields:[
    {id:'prohlaseni_poplatnika', label:'Podepsal/a jsem Prohlášení poplatníka daně z příjmů', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'invalidita', label:'Invalidita (pro daňové účely)', essential:true, type:'select', options:['','Žádná','Invalidita 1. nebo 2. stupně','Invalidita 3. stupně','Držitel průkazu ZTP/P','Invalidita 1./2. stupně a zároveň ZTP/P']},
    {id:'zdrav_postizeni_ozp', label:'Osoba se zdravotním postižením (pro účely zaměstnávání OZP)', essential:true, type:'select', options:['','Ne','Invalidní v 1. nebo 2. stupni','S těžším zdravotním postižením','Zdravotně znevýhodněná osoba']},
    {id:'prukaz_zdravotni', label:'Průkaz zdravotního postižení', essential:true, type:'select', options:['','Nemám','Průkaz I. stupně (TP)','Průkaz II. stupně (ZTP)','Průkaz III. stupně (ZTP/P)']},
    {id:'zdrav_rozhodnuti_platnost_do', label:'Platnost rozhodnutí o zdravotním postižení do', type:'date', showIf:p=>(p.zdrav_postizeni_ozp && p.zdrav_postizeni_ozp!=='Ne') || (p.prukaz_zdravotni && p.prukaz_zdravotni!=='Nemám')},
    {id:'vojak', label:'Jsem voják z povolání', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'student_pripravujici_se', label:'Příprava na povolání (žák, student)', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'student_potvrzeni_do', label:'Platnost potvrzení o studiu do', type:'date', showIf:p=>p.student_pripravujici_se==='Ano'},
    {id:'duchod', label:'Pobírám důchod (starobní, invalidní, vdovský)', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'duchod_detail', label:'Druh důchodu, od kdy, plátce a číslo rozhodnutí', full:true, showIf:p=>p.duchod==='Ano'},
    {id:'pocet_vychovanych_deti', label:'Počet vychovaných dětí', showIf:p=>{ const info = rodneCisloInfo(p.rodne_cislo); return info && info.sex==='F' && info.year < 1973; }},
    {id:'sluzebni_pomer_drive', label:'V minulosti jsem již byl/a ve služebním poměru', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'clenstvi_organy', label:'Členství v řídících/kontrolních orgánech právnických osob provozujících podnikatelskou činnost', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'vydelecna_cinnost_souhlas', label:'Podnikatelská/výdělečná činnost vyžadující předchozí souhlas zaměstnavatele', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'soudni_rizeni', label:'Je proti mně vedeno soudní řízení', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'soudni_srazky', label:'Soudem stanovené srážky na plat (číslo rozhodnutí)', showIf:p=>p.soudni_rizeni==='Ano'},
    {id:'kurzy_dovednosti', label:'Kurzy, specifické odborné znalosti a dovednosti', full:true},
  ]},
  { id:'pracovni_pomer', label:'Pracovní poměr', owner:'hr', fields:[
    {id:'osobni_cislo', label:'Osobní číslo (vyplní personální oddělení)', essential:true},
    {id:'duvod_vzniku_pomeru', label:'Důvod vzniku pracovního poměru', essential:true, type:'select', options:['','Absolvent školy','Nástup z evidence úřadu práce','Ostatní osoby nastupující poprvé','Osoba měnící zaměstnání','Nástup z výběrového řízení']},
    {id:'datum_nastupu', label:'Datum nástupu', type:'date', required:true},
    {id:'pozice', label:'Pracovní pozice', type:'select', options: [''], required:true},
    {id:'pracoviste', label:'Pracoviště', type:'select', options: [''], required:true},
    {id:'typ_nastupu', label:'Typ nástupu', type:'select', options: ['', ...ONBOARDING_TYPES], required:true},
    {id:'kategorie', label:'Kategorie (dle vykonávané práce)', type:'select', options: [''], required:true},
    {id:'odbor_oddeleni', label:'Odbor / oddělení', essential:true, type:'select', options:['']},
    {id:'nadrizeny', label:'Přímý nadřízený', essential:true, type:'select', options:['']},
    {id:'rezim_zamestnani', label:'Typ úvazku', essential:true, type:'select', options:['','Pracovní poměr','Služební poměr']},
    {id:'typ_pomeru', label:'Typ pracovního poměru', essential:true, type:'select', options:['','HPP','DPP','DPČ']},
    {id:'rozsah_uvazku', label:'Rozsah úvazku', essential:true, type:'select', options:['','Plný úvazek','Zkrácený úvazek']},
    {id:'doba_trvani_pomeru', label:'Doba trvání pracovního poměru', essential:true, type:'select', options:['','Na dobu neurčitou','Na dobu určitou']},
    {id:'uvazek', label:'Výše úvazku', placeholder:'např. 1,0'},
    {id:'zkusebni_doba', label:'Zkušební doba', essential:true, type:'select', options:['','Bez zkušební doby','6 měsíců','8 měsíců (vedoucí zaměstnanec)']},
  ]},
  { id:'mzdove_udaje', label:'Mzdové a organizační údaje', owner:'hr', fields:[
    {id:'vedouci', label:'Vedoucí pozice', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'stupen_rizeni', label:'Stupeň řízení vedoucích zaměstnanců', type:'select', options:['','1. stupeň','2. stupeň','3. stupeň','4. stupeň'], essential:true, showIf:p=>p.vedouci==='Ano'},
    {id:'klasifikace_postaveni', label:'Klasifikace postavení v zaměstnání', type:'select', options:['','Zaměstnanec','Zaměstnavatel','OSVČ (samostatně výdělečně činná osoba)','Pomáhající rodinný příslušník','Člen produkčního družstva'], default:'Zaměstnanec', essential:true},
    {id:'platova_trida', label:'Platová třída', essential:true, type:'select', options:['','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16']},
    {id:'platova_skupina', label:'Platová skupina'},
    {id:'platovy_stupen', label:'Platový stupeň', essential:true, type:'select', options:['','1','2','3','4','5','6','7','8','9','10','11','12']},
    {id:'skupina_praci_zaruc_mzda', label:'Skupina prací pro zaručenou mzdu', essential:true, type:'select', options:['','1','2','3','4','5','6','7','8']},
    {id:'nastaveni_platoveho_postupu', label:'Nastavení platového postupu', essential:true, type:'select', options:['','Ano','Ne']},
    {id:'zpusob_urceni_tarifu', label:'Způsob určení platového tarifu'},
    {id:'tarifni_plat', label:'Tarifní plat (Kč/měsíc)'},
    {id:'zpusob_odmenovani', label:'Způsob odměňování', essential:true, type:'select', options:['','Měsíční plat/mzda','Hodinová mzda']},
    {id:'typ_platoveho_vymeru', label:'Typ platového výměru', essential:true, type:'select', options:['','Odměňování podle § 5 NV','Pásmové odměňování (§ 6 NV) s platovými postupy','Pásmové odměňování (§ 6 NV) bez platových postupů']},
    {id:'zkraceny_uvazek_hodiny', label:'Zkrácený úvazek — hodin týdně', showIf:p=>p.rozsah_uvazku==='Zkrácený úvazek'},
    {id:'zkraceny_uvazek_procenta', label:'Zkrácený úvazek — v %', showIf:p=>p.rozsah_uvazku==='Zkrácený úvazek'},
    {id:'individualni_rozvrh', label:'Individuální rozvrh (je-li pracovní doba upravena individuálně)'},
  ]},
];

const KROK1_HR_FIELD_IDS = ['pozice','pracoviste','typ_nastupu','kategorie','nadrizeny','rezim_zamestnani','rozsah_uvazku','datum_nastupu'];
const HR_REQUIRABLE_FIELDS = PERSONAL_SECTIONS.filter(s => s.owner === 'hr' && s.type !== 'repeat').flatMap(sec => sec.fields.filter(f => f.essential || f.required).map(f => ({ sectionLabel: sec.label, fieldId: f.id, label: f.label, stage: KROK1_HR_FIELD_IDS.includes(f.id) ? 'krok1' : 'zbytek' })));

const CHECKLIST_SECTIONS = [
  { id:'majetek', label:'Připravený majetek', owner:'admin', items:[
    {id:'notebook', label:'Notebook (kontrola VITA, OneDrive, e-mailu, jazyka)'},
    {id:'doky', label:'Dokovací stanice'},
    {id:'monitor', label:'Monitor'},
    {id:'telefon_hw', label:'Telefon (kontrola funkčnosti kontaktů)'},
  ]},
  { id:'vybaveni_kancelare', label:'Vybavení kanceláře', owner:'admin', tab:'provoz', items:[
    {id:'stul', label:'Stůl'},
    {id:'zidle', label:'Židle'},
    {id:'kontejner', label:'Kontejner'},
    {id:'kancelar_potreby', label:'Kancelářské potřeby'},
  ]},
  { id:'it_nastaveni', label:'IT nastavení', owner:'admin', items:[
    {id:'email', label:'E-mailová adresa', type:'check_value', valueLabel:'Přidělená e-mailová adresa'},
    {id:'telefon_cislo', label:'Telefonní číslo', type:'check_value', valueLabel:'Přidělené telefonní číslo'},
    {id:'sim_o2', label:'Pojmenovat SIM v O2'},
    {id:'grp_sekce', label:'Přidání do skupiny — Sekce'},
    {id:'grp_odbor', label:'Přidání do skupiny — Odbor'},
    {id:'grp_oddeleni', label:'Přidání do skupiny — Oddělení'},
    {id:'grp_desu', label:'Přidání do skupiny — celé DESÚ'},
  ]},
  { id:'entra', label:'Entra ID', owner:'admin', items:[
    {id:'entra_user', label:'Vytvoření uživatele', type:'check_value', valueLabel:'Přidělené uživatelské jméno (login)'},
    {id:'entra_password', label:'Nastavení počátečního hesla', type:'check_value', valueLabel:'Počáteční heslo (k předání zaměstnanci)'},
    {id:'entra_profile', label:'Vyplnění pozice, oddělení, nadřízeného, pobočky, tel. čísla'},
    {id:'entra_intune', label:'Přidání do skupiny Intune — Všichni', hint:'skupina zabezpečení'},
    {id:'entra_pobocka', label:'Přidání do skupiny dle pobočky', hint:'distribuční seznam'},
    {id:'entra_oddeleni', label:'Přidání do skupiny dle oddělení', hint:'distribuční seznam'},
    {id:'entra_desu_all', label:'Přidání do skupiny DESU all', hint:'distribuční seznam'},
    {id:'entra_kontakty', label:'Přidání do skupiny Sdílené kontakty'},
    {id:'entra_licence', label:'Ověřit licenci'},
  ]},
  { id:'whatspot', label:'Whatspot', owner:'admin', items:[
    {id:'whatspot_user', label:'Vytvoření uživatele', hint:'rezervace aut — vyplnit jen pro MD pracovníky'},
  ]},
  { id:'vema_server', label:'Vema server', owner:'admin', items:[
    {id:'jipkaas', label:'Import jipkaas certifikátu novému uživateli'},
  ]},
  { id:'vema', label:'Vema', owner:'hr', items:[
    {id:'vema_user', label:'Vytvoření uživatele ve Vemě (dělá Perso)'},
  ]},
  { id:'outlook', label:'Outlook', owner:'admin', items:[
    {id:'outlook_kontakt', label:'Přidání kontaktu nového uživatele do sdílených kontaktů'},
  ]},
  { id:'vita', label:'VITA', owner:'admin', items:[
    {id:'vita_user', label:'Vytvoření uživatele'},
    {id:'vita_prava', label:'Oprávnění a přístup do příslušné aplikace'},
  ]},
  { id:'espis', label:'E-spis', owner:'admin', items:[
    {id:'espis_user', label:'Vytvoření uživatele'},
    {id:'espis_reset', label:'Reset hesla kvůli prvotnímu výchozímu zadání', hint:'v G2 by mělo být opraveno'},
    {id:'espis_role', label:'Přidání na REF/VED/RED'},
  ]},
  { id:'czechpoint', label:'CzechPoint', owner:'admin', items:[
    {id:'cp_user', label:'Vytvoření uživatele'},
    {id:'cp_edoklady', label:'eDoklady — Správa ověřovatelů (DIA) — Ověřovatel'},
    {id:'cp_ismvs', label:'Informační systém digitální mapy veřejné správy (ČÚZK) — přístupová role'},
    {id:'cp_issr_mmr', label:'Informační systém stavebního řízení (MMR) — přístupová role'},
    {id:'cp_a1181', label:'A1181 — Zeměměřictví → CR112329 — Editace údajů digitální technické mapy'},
    {id:'cp_certifikat', label:'Přidání komerčního certifikátu'},
  ]},
  { id:'issr', label:'ISSŘ', owner:'admin', items:[
    {id:'issr_referent', label:'Role referent', hint:'přiděluje se spolu s Přebíráním dokumentů'},
    {id:'issr_vedouci', label:'Vedoucí role', hint:'alternativa k Referent + Přebírání dokumentů, jen pro vedoucí'},
    {id:'issr_prebirani', label:'Role přebírání dokumentů', hint:'přiděluje se spolu s Referentem'},
  ]},
  { id:'katastr', label:'Katastr nemovitostí', owner:'admin', items:[
    {id:'kn_nahlizeni', label:'Aplikace Nahlížení do KN'},
    {id:'kn_ceny', label:'Přístup k cenovým údajům', hint:'bezúplatní uživatelé'},
    {id:'kn_evidence', label:'Přístup k Evidenci práv pro osobu', hint:'bezúplatní uživatelé'},
    {id:'kn_prehled', label:'Přístup k Přehledu vlastnictví', hint:'bezúplatní uživatelé'},
    {id:'kn_sbirka', label:'Přístup ke Sbírce listin', hint:'bezúplatní uživatelé'},
    {id:'kn_standard', label:'Standardní přístup', hint:'bezúplatní uživatelé'},
  ]},
  { id:'muzo', label:'MÚZO', owner:'admin', items:[
    {id:'muzo_user', label:'Vytvoření uživatele'},
    {id:'muzo_prava', label:'Přidělení přístupových práv dle ekonomické agendy'},
  ]},
  { id:'skoleni', label:'Školení a BOZP', owner:'hr', items:[
    {id:'bozp', label:'BOZP', hint:'pro vedoucí + administraci / pro zaměstnance'},
    {id:'po', label:'PO', hint:'pro vedoucí / pro zaměstnance'},
    {id:'ridici', label:'Školení řidičů'},
    {id:'prvni_pomoc', label:'První pomoc'},
    {id:'gdpr', label:'GDPR'},
    {id:'ai_pravidla', label:'Pravidla používání umělé inteligence (AI)'},
    {id:'home_office', label:'Práce na dálku (Home office)'},
    {id:'kyber', label:'Informační a kybernetická bezpečnost'},
    {id:'whistleblowing', label:'Whistleblowing'},
  ]},
];

const ALWAYS_CHECKLIST_SECTIONS = ['majetek','vybaveni_kancelare','it_nastaveni','entra','whatspot','outlook','skoleni'];
function checklistSectionsForCategory(category, tab){
  const systems = systemsForCategory(category);
  let sections = CHECKLIST_SECTIONS;
  if(category && systems.length > 0){
    const allowed = new Set([...ALWAYS_CHECKLIST_SECTIONS, ...systems]);
    sections = CHECKLIST_SECTIONS.filter(s => allowed.has(s.id));
  }
  if(tab) sections = sections.filter(s => (s.tab || 'it') === tab);
  return sections;
}


const DEFAULT_INFO = {
  consentText: 'Pro účely personální agendy a zřízení přístupů do informačních systémů úřadu budeme zpracovávat vaše osobní údaje uvedené v tomto formuláři (identifikační a kontaktní údaje, doklady, případně údaje o rodinných příslušnících pro účely daňových slev). Správcem údajů je Dopravní a energetický stavební úřad (DESÚ), od 1. 1. 2027 Úřad rozvoje území ČR (ÚRÚ ČR). Údaje budou použity výhradně pro účely pracovněprávního vztahu a nastavení přístupů do systémů úřadu. Podrobnosti vám na vyžádání poskytne personální oddělení.',
  contacts: {
    linkLabel: 'Kontakty na úřad',
    linkUrl: 'https://desucz.sharepoint.com/SitePages/Kontakt.aspx',
    groups: [
      { title:'Sekretariát ředitele', people:[
        {name:'Markéta Perníčková', phone:'601 208 496'},
        {name:'Iveta Veselá', phone:'601 208 424'},
      ]},
      { title:'Personální dotazy', people:[
        {name:'Věra Stafová (vedoucí)', phone:'601 208 425'},
        {name:'Monika Golová (mzdová účetní)', phone:'601 208 426'},
        {name:'Veronika Vítkovská (personalistka)', phone:'601 208 435'},
        {name:'Radka Vostrovská (personalistka)', phone:'601 208 474'},
      ]},
    ],
  },
  cards: [
    {id:'c2', title:'Vybavení a přístupy', body:'Doplňte: kdy a kde vyzvednete notebook, telefon a přístupové karty.'},
    {id:'c3', title:'Praktické informace', body:'Doplňte: stravování, parkování, dress code, home office.'},
    {id:'c4', title:'O úřadu', body:'Doplňte: krátké představení DESÚ / ÚRÚ ČR, organizační struktura, poslání.'},
  ],
  workplaces: { 'MD':'', 'Letenská':'', 'Olomouc':'', 'Plzeň':'', 'Brno':'', 'České Budějovice':'', 'Letiště':'' },
  firstDayPlans: {
    [ONBOARDING_TYPES[0]]: 'Doplňte: co se pro vás mění (nadřízený, systémy, e-mail), na koho se obrátit s dotazy, kdy zhruba proběhne administrativní přechod. Fyzicky zůstáváte na svém současném pracovišti.',
    [ONBOARDING_TYPES[1]]: 'Doplňte: adresu nového pracoviště, kdy a kde se hlásit první den, kdo vás přivítá, jak se dostanete dovnitř budovy, kde bude vaše nové místo.',
    [ONBOARDING_TYPES[2]]: 'Doplňte: adresu pracoviště, kdy a kde se hlásit první den, kdo vás přivítá, co si vzít s sebou, harmonogram prvního dne (školení, přebírání vybavení, seznámení s týmem).',
  },
  glossary: [
    {term:'VITA', desc:'Doplňte vysvětlení zkratky/systému.'},
    {term:'ESPIS', desc:'Elektronická spisová služba úřadu.'},
    {term:'ISSŘ', desc:'Informační systém stavebního řízení.'},
    {term:'CzechPoint', desc:'Kontaktní místo veřejné správy — ověřování dokladů a výpisů.'},
    {term:'MÚZO', desc:'Doplňte vysvětlení zkratky/systému.'},
    {term:'VEMA', desc:'Personální a mzdový informační systém.'},
  ],
  links: [
    {label:'Intranet', url:''},
    {label:'Helpdesk IT', url:''},
  ],
};

let state = { view:'list', index:[], currentId:null, currentRecord:null, tab:'personal', loading:true, error:null, collapsed:{}, role:'hr', employeeMode:false, linkCopied:false, wizardStep:0, infoContent:null, editingInfo:false, previewingEmployee:false, returnMsgCopied:false, pendingEdit:null, filterText:'', colFilters:{pozice:'', pracoviste:'', personal:'', it:'', assigned:''}, sortKey:'created', sortDir:'desc', wizardStepError:false, editingWorkplace:null, editingFirstDayType:null, firstDayDismissPrompt:false, firstDayHiddenSession:false, settings:null, settingsDraft:null, settingsSaved:false, openItemNotes:{}, selectedExport:{}, exporting:false, hardRateLimited:false, selectedAssign:{}, bulkAssignTarget:'', bulkAssigning:false, saveStatus:null, saveStatusAt:null, standaloneMode:false, showMissingHighlights:false, userEmail:null, settingsCollapsed:{}, importQueue:[], importCurrent:null };

function emptyPersonal(){
  const p = {};
  PERSONAL_SECTIONS.forEach(s => {
    if(s.type === 'repeat') p[s.id] = [];
    else s.fields.forEach(f => p[f.id] = f.default || '');
  });
  return p;
}
function emptyChecklist(){
  const c = {};
  CHECKLIST_SECTIONS.forEach(s => s.items.forEach(it => c[it.id] = {checked:false, note:'', value:''}));
  return c;
}
function checklistTotals(checklist, category, tab){
  let total = 0, done = 0;
  checklistSectionsForCategory(category, tab).forEach(s => s.items.forEach(it => {
    total++;
    if(checklist[it.id] && checklist[it.id].checked) done++;
  }));
  return {total, done};
}

async function loadIndex(){
  try{
    const res = await window.storage.get(STORAGE_INDEX_KEY, true);
    state.index = res ? JSON.parse(res.value) : [];
  }catch(e){
    state.index = [];
  }
}
function isHardRateLimitError(e){
  return /reload to continue/i.test(String(e && e.message || e));
}
async function withRetry(fn, retries){
  retries = retries == null ? 2 : retries;
  let lastErr;
  for(let attempt = 0; attempt <= retries; attempt++){
    try{
      return await fn();
    }catch(e){
      lastErr = e;
      if(isHardRateLimitError(e)) throw e;
      if(attempt < retries){
        const base = /rate limit/i.test(String(e && e.message || e)) ? 1200 : 400;
        await new Promise(res => setTimeout(res, base * (attempt+1)));
      }
    }
  }
  throw lastErr;
}
async function saveIndex(){
  if(state.standaloneMode) return true;
  try{
    await withRetry(() => window.storage.set(STORAGE_INDEX_KEY, JSON.stringify(state.index), true));
    state.error = null;
    return true;
  }catch(e){
    console.error('saveIndex failed:', e);
    if(isHardRateLimitError(e)){
      state.hardRateLimited = true;
      state.error = 'Úložiště dosáhlo limitu požadavků. Znovu načtěte artefakt (obnovte stránku) a zkuste to prosím znovu.';
    } else {
      state.error = 'Uložení seznamu se nezdařilo (dočasný výpadek úložiště). Zkuste to prosím znovu.';
    }
    return false;
  }
}
async function loadRecord(id){
  try{
    const res = await window.storage.get(recordKey(id), true);
    const record = res ? JSON.parse(res.value) : {};
    return normalizeRecord(record);
  }catch(e){
    return normalizeRecord({});
  }
}
function normalizeRecord(record){
  const defaults = emptyPersonal();
  record.personal = record.personal || {};
  Object.keys(defaults).forEach(key => {
    if(!(key in record.personal)) record.personal[key] = defaults[key];
  });
  PERSONAL_SECTIONS.forEach(sec => {
    if(sec.type === 'repeat' && !Array.isArray(record.personal[sec.id])) record.personal[sec.id] = [];
  });
  const defaultChecklist = emptyChecklist();
  record.checklist = record.checklist || {};
  Object.keys(defaultChecklist).forEach(key => {
    if(!(key in record.checklist)) record.checklist[key] = defaultChecklist[key];
  });
  if(!record.personalStatus){
    record.personalStatus = record.personalReviewed ? 'reviewed' : (record.employeeSubmitted ? 'submitted' : 'draft');
  }
  delete record.personalReviewed;
  delete record.employeeSubmitted;
  record.fieldFlags = record.fieldFlags || {};
  record.returnNote = record.returnNote || '';
  record.assignedAdmin = record.assignedAdmin || '';
  record.assignedOffice = record.assignedOffice || '';
  record.assignedFacilityStaff = record.assignedFacilityStaff || '';
  record.firstDayDismissed = record.firstDayDismissed || false;
  record.consentGiven = record.consentGiven || false;
  record.consentAt = record.consentAt || null;
  return record;
}
async function saveRecord(id, record){
  if(state.standaloneMode) return true;
  try{
    await withRetry(() => window.storage.set(recordKey(id), JSON.stringify(record), true));
    state.error = null;
    return true;
  }catch(e){
    console.error('saveRecord failed:', e);
    if(isHardRateLimitError(e)){
      state.hardRateLimited = true;
      state.error = 'Úložiště dosáhlo limitu požadavků. Znovu načtěte artefakt (obnovte stránku) a zkuste to prosím znovu.';
    } else {
      state.error = 'Uložení záznamu se nezdařilo (dočasný výpadek úložiště). Zkuste to prosím znovu.';
    }
    return false;
  }
}
async function loadSettings(){
  const blank = () => ({ workplaces: [...DEFAULT_WORKPLACES], positions: [...DEFAULT_POSITIONS], admins: [...DEFAULT_ADMINS], supervisors: [...DEFAULT_SUPERVISORS], departments: [...DEFAULT_DEPARTMENTS], facilityStaff: [...DEFAULT_FACILITY_STAFF], offices: {...DEFAULT_OFFICES}, workplaceVemaCodes: {...DEFAULT_WORKPLACE_VEMA_CODES}, workplaceLocations: {...DEFAULT_WORKPLACE_LOCATIONS}, vemaConstants: {}, categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)), systemUrls: {...DEFAULT_SYSTEM_URLS}, systemTypes: {...DEFAULT_SYSTEM_TYPES}, hrRequiredOverrides: {} });
  try{
    const res = await window.storage.get(STORAGE_SETTINGS_KEY, true);
    state.settings = res ? JSON.parse(res.value) : blank();
  }catch(e){
    state.settings = blank();
  }
  if(!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [...DEFAULT_WORKPLACES];
  if(!Array.isArray(state.settings.positions)) state.settings.positions = [...DEFAULT_POSITIONS];
  if(!Array.isArray(state.settings.admins)) state.settings.admins = [...DEFAULT_ADMINS];
  if(!Array.isArray(state.settings.supervisors)) state.settings.supervisors = [...DEFAULT_SUPERVISORS];
  if(!Array.isArray(state.settings.departments)) state.settings.departments = [...DEFAULT_DEPARTMENTS];
  if(!Array.isArray(state.settings.facilityStaff)) state.settings.facilityStaff = [...DEFAULT_FACILITY_STAFF];
  if(!state.settings.offices || typeof state.settings.offices !== 'object') state.settings.offices = {};
  workplaceList().forEach(w => { if(!Array.isArray(state.settings.offices[w])) state.settings.offices[w] = []; });
  if(!state.settings.workplaceVemaCodes || typeof state.settings.workplaceVemaCodes !== 'object') state.settings.workplaceVemaCodes = {};
  workplaceList().forEach(w => { if(!(w in state.settings.workplaceVemaCodes)) state.settings.workplaceVemaCodes[w] = ''; });
  if(!state.settings.workplaceLocations || typeof state.settings.workplaceLocations !== 'object') state.settings.workplaceLocations = {};
  workplaceList().forEach(w => { if(!state.settings.workplaceLocations[w]) state.settings.workplaceLocations[w] = {okres:'', obec:'', sidlo:''}; });
  if(!state.settings.vemaConstants || typeof state.settings.vemaConstants !== 'object') state.settings.vemaConstants = {};
  if(!Array.isArray(state.settings.categories)) state.settings.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  if(!state.settings.systemUrls || typeof state.settings.systemUrls !== 'object') state.settings.systemUrls = {};
  SYSTEM_URL_KEYS.forEach(k => { if(!(k in state.settings.systemUrls)) state.settings.systemUrls[k] = ''; });
  if(!state.settings.systemTypes || typeof state.settings.systemTypes !== 'object') state.settings.systemTypes = {};
  if(!state.settings.hrRequiredOverrides || typeof state.settings.hrRequiredOverrides !== 'object') state.settings.hrRequiredOverrides = {};
  SYSTEM_URL_KEYS.forEach(k => { if(!(k in state.settings.systemTypes)) state.settings.systemTypes[k] = 'web'; });
}
async function saveSettings(){
  if(state.standaloneMode) return true;
  try{
    await withRetry(() => window.storage.set(STORAGE_SETTINGS_KEY, JSON.stringify(state.settings), true));
    state.error = null;
  }catch(e){
    console.error('saveSettings failed:', e);
    state.error = 'Uložení nastavení se nezdařilo (dočasný výpadek úložiště). Zkuste to prosím znovu.';
  }
}
async function loadInfoContent(){
  try{
    const res = await window.storage.get(STORAGE_INFO_KEY, true);
    state.infoContent = res ? JSON.parse(res.value) : JSON.parse(JSON.stringify(DEFAULT_INFO));
  }catch(e){
    state.infoContent = JSON.parse(JSON.stringify(DEFAULT_INFO));
  }
  if(!state.infoContent.workplaces) state.infoContent.workplaces = JSON.parse(JSON.stringify(DEFAULT_INFO.workplaces));
  workplaceList().forEach(w => { if(w && !(w in state.infoContent.workplaces)) state.infoContent.workplaces[w] = ''; });
  if(!state.infoContent.firstDayPlans) state.infoContent.firstDayPlans = JSON.parse(JSON.stringify(DEFAULT_INFO.firstDayPlans));
  ONBOARDING_TYPES.forEach(t => { if(!(t in state.infoContent.firstDayPlans)) state.infoContent.firstDayPlans[t] = ''; });
  if(!Array.isArray(state.infoContent.glossary)) state.infoContent.glossary = JSON.parse(JSON.stringify(DEFAULT_INFO.glossary));
  if(typeof state.infoContent.consentText !== 'string') state.infoContent.consentText = DEFAULT_INFO.consentText;
  if(!Array.isArray(state.infoContent.links)) state.infoContent.links = JSON.parse(JSON.stringify(DEFAULT_INFO.links));
}
async function saveInfoContent(){
  if(state.standaloneMode) return true;
  try{
    await withRetry(() => window.storage.set(STORAGE_INFO_KEY, JSON.stringify(state.infoContent), true));
    state.error = null;
  }catch(e){
    console.error('saveInfoContent failed:', e);
    state.error = 'Uložení obsahu se nezdařilo (dočasný výpadek úložiště). Zkuste to prosím znovu.';
  }
}

function fieldMarkup(f, value, disabled, attrName, attrValue){
  const val = value == null ? '' : value;
  const dis = disabled ? 'disabled' : '';
  const attr = attrName || 'data-field';
  const av = attrValue != null ? attrValue : f.id;
  if(f.type === 'select'){
    let optionList = f.options;
    if(val && !optionList.includes(val)) optionList = [...optionList, val];
    const opts = optionList.map(o => `<option value="${esc(o)}" ${o===val?'selected':''}>${esc(o || '— vyberte —')}</option>`).join('');
    return `<select ${attr}="${esc(av)}" ${dis}>${opts}</select>`;
  }
  if(f.type === 'date'){
    return dateInputHtml(val, dis, attr, av);
  }
  const acKind = f.bankList ? 'bank' : f.insuranceList ? 'insurance' : f.datalist ? f.datalist : '';
  const acAttr = acKind ? `data-autocomplete="${acKind}"` : '';
  const autocompleteAttr = f.autocomplete ? `autocomplete="${esc(f.autocomplete)}"` : (acKind ? 'autocomplete="off"' : '');
  return `<input type="${f.type||'text'}" ${attr}="${esc(av)}" value="${esc(val)}" placeholder="${esc(f.placeholder||'')}" ${acAttr} ${autocompleteAttr} ${dis}>`;
}
function dateInputHtml(val, dis, attr, av){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val || '');
  const y = m ? m[1] : '';
  const mo = m ? m[2] : '';
  const d = m ? m[3] : '';
  return `<div class="date-input-group" data-date-group>
    <input type="hidden" ${attr}="${esc(av)}" value="${esc(val)}" ${dis}>
    <input type="text" inputmode="numeric" class="date-seg date-seg-day" data-date-seg="day" maxlength="2" placeholder="DD" value="${esc(d)}" ${dis}>
    <span class="date-sep">.</span>
    <input type="text" inputmode="numeric" class="date-seg date-seg-month" data-date-seg="month" maxlength="2" placeholder="MM" value="${esc(mo)}" ${dis}>
    <span class="date-sep">.</span>
    <input type="text" inputmode="numeric" class="date-seg date-seg-year" data-date-seg="year" maxlength="4" placeholder="RRRR" value="${esc(y)}" ${dis}>
    ${dis ? '' : `<button type="button" class="date-cal-btn" data-date-cal-toggle title="Vybrat z kalendáře">📅</button>`}
  </div>`;
}
function validationNoteHtml(f, value, ctx){
  const err = runValidation(f, value, ctx);
  if(!err) return '';
  const cls = err.severity === 'warning' ? 'field-self-warning' : 'field-self-error';
  const icon = err.severity === 'warning' ? 'ⓘ' : '⚠';
  return `<div class="${cls}">${icon} ${esc(err.message)}</div>`;
}
function autofillButtonHtml(f, ctx, targetAttr, targetKey){
  if(!f.autofillFrom || !ctx) return '';
  const source = ctx[f.autofillFrom];
  if(!source || ctx[f.id]) return '';
  const rc = VALIDATORS.rodneCislo(source);
  if(!rc.ok || !birthDateFromRC(source)) return '';
  return `<button type="button" class="btn btn-ghost btn-sm" data-autofill-birthdate="${targetAttr}:${esc(targetKey)}" data-autofill-source="${esc(source)}" style="margin-top:6px;">Doplnit z rodného čísla</button>`;
}

function autocompleteItemsFor(kind){
  if(kind === 'bank') return BANK_CODES.map(([code,name]) => ({value: code, display: code, sub: name}));
  if(kind === 'insurance') return INSURANCE_CODES.map(([code,name]) => ({value: `${code} — ${name}`, display: code, sub: name}));
  return (DATALIST_OPTIONS[kind] || []).map(v => ({value: v, display: v, sub: null}));
}
function closeAutocomplete(){
  if(window.__activeAutocomplete){
    window.__activeAutocomplete.cleanup();
    window.__activeAutocomplete.popup.remove();
    window.__activeAutocomplete = null;
  }
}
function openAutocomplete(input, kind){
  closeAutocomplete();
  const items = autocompleteItemsFor(kind);
  const q = input.value.trim().toLowerCase();
  const filtered = (q ? items.filter(it => it.display.toLowerCase().includes(q) || (it.sub && it.sub.toLowerCase().includes(q))) : items).slice(0,50);
  if(filtered.length === 0) return;
  const popup = document.createElement('div');
  popup.className = 'autocomplete-popup';
  document.body.appendChild(popup);
  const rect = input.getBoundingClientRect();
  popup.style.top = (window.scrollY + rect.bottom + 3) + 'px';
  popup.style.left = (window.scrollX + rect.left) + 'px';
  popup.style.width = Math.max(rect.width, 200) + 'px';
  popup.innerHTML = filtered.map((it,i) => `
    <button type="button" class="ac-item" data-ac-idx="${i}">
      ${it.sub ? `<span class="ac-main">${esc(it.display)}</span><span class="ac-sub">${esc(it.sub)}</span>` : `<span class="ac-main">${esc(it.display)}</span>`}
    </button>
  `).join('');
  popup.querySelectorAll('[data-ac-idx]').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      const it = filtered[parseInt(btn.getAttribute('data-ac-idx'),10)];
      input.value = it.value;
      input.dispatchEvent(new Event('change', {bubbles:true}));
      closeAutocomplete();
    });
  });
  const popRect = popup.getBoundingClientRect();
  if(popRect.right > window.innerWidth) popup.style.left = Math.max(8, window.scrollX + window.innerWidth - popRect.width - 12) + 'px';
  function onOutsideClick(e){ if(!popup.contains(e.target) && e.target !== input) closeAutocomplete(); }
  function onEscape(e){ if(e.key === 'Escape') closeAutocomplete(); }
  setTimeout(() => {
    document.addEventListener('click', onOutsideClick);
    document.addEventListener('keydown', onEscape);
  }, 0);
  window.__activeAutocomplete = { popup, cleanup(){ document.removeEventListener('click', onOutsideClick); document.removeEventListener('keydown', onEscape); } };
}
function closeDatePicker(){
  if(window.__activeDatePicker){
    window.__activeDatePicker.cleanup();
    window.__activeDatePicker.popup.remove();
    window.__activeDatePicker = null;
  }
}
function openDatePicker(group, hidden, dayEl, monthEl, yearEl, commit){
  closeDatePicker();
  const now = new Date();
  let viewYear = parseInt(yearEl.value,10) || now.getFullYear();
  let viewMonth = parseInt(monthEl.value,10) || (now.getMonth()+1);

  const popup = document.createElement('div');
  popup.className = 'date-picker-popup';
  document.body.appendChild(popup);
  const btn = group.querySelector('[data-date-cal-toggle]');
  const rect = btn.getBoundingClientRect();
  popup.style.top = (window.scrollY + rect.bottom + 4) + 'px';
  popup.style.left = (window.scrollX + rect.left - 200) + 'px';

  const monthNames = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];

  function renderPopup(){
    const minYear = now.getFullYear() - 110;
    const maxYear = now.getFullYear() + 10;
    const yearOptions = [];
    for(let y=maxYear; y>=minYear; y--) yearOptions.push(y);

    const selYear = parseInt(yearEl.value,10);
    const selMonth = parseInt(monthEl.value,10);
    const selDay = parseInt(dayEl.value,10);

    const firstOfMonth = new Date(viewYear, viewMonth-1, 1);
    const startDow = (firstOfMonth.getDay()+6)%7;
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth-1, 0).getDate();

    let cells = '';
    for(let i=0;i<startDow;i++){
      const d = daysInPrevMonth - startDow + 1 + i;
      cells += `<button type="button" class="outside" data-pick-outside="prev">${d}</button>`;
    }
    for(let d=1; d<=daysInMonth; d++){
      const isSelected = selDay===d && selYear===viewYear && selMonth===viewMonth;
      const isToday = now.getFullYear()===viewYear && (now.getMonth()+1)===viewMonth && now.getDate()===d;
      cells += `<button type="button" class="${isSelected?'selected':''} ${isToday?'today':''}" data-pick-day="${d}">${d}</button>`;
    }
    const trailing = (7 - ((startDow + daysInMonth) % 7)) % 7;
    for(let d=1; d<=trailing; d++){
      cells += `<button type="button" class="outside" data-pick-outside="next">${d}</button>`;
    }

    popup.innerHTML = `
      <div class="date-picker-head">
        <select data-pick-month>${monthNames.map((n,i)=>`<option value="${i+1}" ${i+1===viewMonth?'selected':''}>${n}</option>`).join('')}</select>
        <select data-pick-year>${yearOptions.map(y=>`<option value="${y}" ${y===viewYear?'selected':''}>${y}</option>`).join('')}</select>
      </div>
      <div class="date-picker-nav">
        <button type="button" data-pick-prev>◀</button>
        <span style="font-size:12.5px;color:var(--ink-faint);">${monthNames[viewMonth-1]} ${viewYear}</span>
        <button type="button" data-pick-next>▶</button>
      </div>
      <div class="date-picker-grid">
        ${['Po','Út','St','Čt','Pá','So','Ne'].map(d=>`<div class="dow">${d}</div>`).join('')}
        ${cells}
      </div>
      <div class="date-picker-today-row"><button type="button" data-pick-today>Dnes</button></div>
    `;

    popup.querySelector('[data-pick-month]').addEventListener('change', e => { viewMonth = parseInt(e.target.value,10); renderPopup(); });
    popup.querySelector('[data-pick-year]').addEventListener('change', e => { viewYear = parseInt(e.target.value,10); renderPopup(); });
    popup.querySelector('[data-pick-prev]').addEventListener('click', () => { viewMonth--; if(viewMonth<1){viewMonth=12;viewYear--;} renderPopup(); });
    popup.querySelector('[data-pick-next]').addEventListener('click', () => { viewMonth++; if(viewMonth>12){viewMonth=1;viewYear++;} renderPopup(); });
    popup.querySelectorAll('[data-pick-day]').forEach(b => {
      b.addEventListener('click', () => {
        dayEl.value = String(parseInt(b.textContent,10)).padStart(2,'0');
        monthEl.value = String(viewMonth).padStart(2,'0');
        yearEl.value = String(viewYear);
        commit();
        closeDatePicker();
      });
    });
    popup.querySelectorAll('[data-pick-outside]').forEach(b => {
      b.addEventListener('click', () => {
        if(b.getAttribute('data-pick-outside') === 'prev'){ viewMonth--; if(viewMonth<1){viewMonth=12;viewYear--;} }
        else { viewMonth++; if(viewMonth>12){viewMonth=1;viewYear++;} }
        renderPopup();
      });
    });
    popup.querySelector('[data-pick-today]').addEventListener('click', () => {
      dayEl.value = String(now.getDate()).padStart(2,'0');
      monthEl.value = String(now.getMonth()+1).padStart(2,'0');
      yearEl.value = String(now.getFullYear());
      commit();
      closeDatePicker();
    });
  }
  renderPopup();

  const popRect = popup.getBoundingClientRect();
  if(popRect.right > window.innerWidth) popup.style.left = Math.max(8, window.scrollX + window.innerWidth - popRect.width - 12) + 'px';
  if(popRect.left < 0) popup.style.left = (window.scrollX + 8) + 'px';

  function onOutsideClick(e){ if(!popup.contains(e.target) && e.target !== btn) closeDatePicker(); }
  function onEscape(e){ if(e.key === 'Escape') closeDatePicker(); }
  setTimeout(() => {
    document.addEventListener('click', onOutsideClick);
    document.addEventListener('keydown', onEscape);
  }, 0);

  window.__activeDatePicker = { popup, cleanup(){ document.removeEventListener('click', onOutsideClick); document.removeEventListener('keydown', onEscape); } };
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function formatDate(iso){
  if(!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if(!m) return iso;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function daysUntil(dateStr){
  if(!dateStr) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if(!m) return null;
  const d = new Date(dateStr+'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((d-today)/86400000);
}
function dayWord(n){
  const abs = Math.abs(n);
  if(abs === 1) return 'den';
  if(abs >= 2 && abs <= 4) return 'dny';
  return 'dní';
}
function urgencyChip(r){
  const complete = r.itTotal > 0 && r.itDone === r.itTotal;
  const days = daysUntil(r.datumNastupu);
  if(complete) return `<span class="chip chip-done">Hotovo</span>`;
  if(days === null) return `<span class="chip chip-progress-bg">Bez data</span>`;
  if(days < 0){ const n = Math.abs(days); return `<span class="chip chip-urgent">Nástup byl před ${n} ${n===1?'dnem':'dny'}</span>`; }
  if(days === 0) return `<span class="chip chip-urgent">Nástup dnes</span>`;
  if(days <= 3) return `<span class="chip chip-urgent">Za ${days} ${dayWord(days)}</span>`;
  if(days <= 7) return `<span class="chip chip-amber">Za ${days} ${dayWord(days)}</span>`;
  return `<span class="chip chip-progress-bg">Za ${days} ${dayWord(days)}</span>`;
}

const BANK_CODES = [
  ['0100','Komerční banka'], ['0300','ČSOB'], ['0600','MONETA Money Bank'],
  ['0800','Česká spořitelna'], ['2010','Fio banka'], ['2070','TRINITY BANK'],
  ['2700','UniCredit Bank'], ['3030','Air Bank'], ['5500','Raiffeisenbank'],
  ['6210','mBank'], ['6300','PPF banka'], ['0710','Česká národní banka'],
];
const INSURANCE_CODES = [
  ['111','Všeobecná zdravotní pojišťovna ČR'],
  ['201','Vojenská zdravotní pojišťovna ČR'],
  ['205','Česká průmyslová zdravotní pojišťovna'],
  ['207','OZP — Oborová zdravotní pojišťovna zaměstnanců bank, pojišťoven a stavebnictví'],
  ['209','Zaměstnanecká pojišťovna Škoda'],
  ['211','Zdravotní pojišťovna ministerstva vnitra ČR'],
  ['213','RBP — Revírní bratrská pokladna'],
];

const DATALIST_OPTIONS = {
  zeme: ['Česká republika','Slovensko','Německo','Rakousko','Polsko','Ukrajina','Maďarsko','Francie','Itálie','Španělsko','Spojené království','Nizozemsko','Belgie','Švýcarsko','Rumunsko','Bulharsko','Chorvatsko','Slovinsko','Rusko','Vietnam','Spojené státy americké'],
  jazyky: ['Angličtina','Němčina','Francouzština','Španělština','Ruština','Italština','Polština','Slovenština','Ukrajinština','Portugalština','Čínština','Japonština','Arabština'],
};

function suggestedEmail(jmeno, prijmeni){
  const strip = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z]/g,'');
  const j = strip(jmeno), p = strip(prijmeni);
  if(!j || !p) return '';
  return `${j}.${p}@uru.gov.cz`;
}
function ensureSuggestedEmail(record){
  if(!record.checklist.email) return false;
  if(record.checklist.email.value) return false;
  const suggestion = suggestedEmail(record.personal.jmeno, record.personal.prijmeni);
  if(!suggestion) return false;
  record.checklist.email.value = suggestion;
  return true;
}

function birthDateFromRC(raw){
  if(!raw) return null;
  const cleaned = raw.replace(/\s+/g,'');
  const m = /^(\d{2})(\d{2})(\d{2})\/?(\d{3,4})$/.exec(cleaned);
  if(!m) return null;
  const rr = m[1]; let mm = parseInt(m[2],10); const dd = m[3]; const suffix = m[4];
  if(mm > 50) mm -= 50; else if(mm > 20) mm -= 20;
  if(mm < 1 || mm > 12) return null;
  const day = parseInt(dd,10);
  if(day < 1 || day > 31) return null;
  const yy = parseInt(rr,10);
  let century;
  if(suffix.length === 3){ century = 1900; }
  else { const curYY = new Date().getFullYear() % 100; century = yy <= curYY ? 2000 : 1900; }
  return `${century+yy}-${String(mm).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function rodneCisloInfo(raw){
  if(!raw) return null;
  const cleaned = raw.replace(/\s+/g,'');
  const m = /^(\d{2})(\d{2})(\d{2})\/?(\d{3,4})$/.exec(cleaned);
  if(!m) return null;
  const rr = m[1]; const mmRaw = parseInt(m[2],10); const dd = parseInt(m[3],10); const suffix = m[4];
  const sex = mmRaw >= 51 ? 'F' : 'M';
  let mm = mmRaw;
  if(mm > 70) mm -= 70; else if(mm > 50) mm -= 50; else if(mm > 20) mm -= 20;
  if(mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const yy = parseInt(rr,10);
  const curYY = new Date().getFullYear() % 100;
  const century = suffix.length === 3 ? 1900 : (yy <= curYY ? 2000 : 1900);
  return { year: century + yy, sex };
}

const VALIDATORS = {
  rodneCislo(raw){
    if(!raw) return {ok:true};
    const cleaned = raw.replace(/\s+/g,'');
    const m = /^(\d{2})(\d{2})(\d{2})\/?(\d{3,4})$/.exec(cleaned);
    if(!m) return {ok:false, severity:'error', message:'Očekávaný formát RRMMDD/XXX(X)'};
    const rr = m[1], mmRaw = m[2], dd = m[3], suffix = m[4];
    let mm = parseInt(mmRaw,10);
    if(mm > 70) return {ok:false, severity:'error', message:'Neplatný měsíc v rodném čísle'};
    if(mm > 50) mm -= 50; else if(mm > 20) mm -= 20;
    if(mm < 1 || mm > 12) return {ok:false, severity:'error', message:'Neplatný měsíc v rodném čísle'};
    const day = parseInt(dd,10);
    if(day < 1 || day > 31) return {ok:false, severity:'error', message:'Neplatný den v rodném čísle'};
    if(suffix.length === 4){
      const rem = Number(BigInt(rr+mmRaw+dd+suffix) % 11n);
      if(rem !== 0 && rem !== 10) return {ok:false, severity:'error', message:'Neplatný kontrolní součet rodného čísla'};
    }
    return {ok:true, formatted: rr+mmRaw+dd+'/'+suffix};
  },
  psc(raw){
    if(!raw) return {ok:true};
    const digits = raw.replace(/\D/g,'');
    if(digits.length !== 5) return {ok:false, severity:'error', message:'PSČ musí mít 5 číslic'};
    return {ok:true, formatted: digits.slice(0,3)+' '+digits.slice(3)};
  },
  telefon(raw){
    if(!raw) return {ok:true};
    let digits = raw.replace(/[^\d+]/g,'');
    let core = digits;
    if(core.startsWith('+420')) core = core.slice(4);
    else if(core.startsWith('00420')) core = core.slice(5);
    else if(core.startsWith('+')) return {ok:false, severity:'warning', message:'Zkontrolujte prosím mezinárodní předvolbu'};
    if(!/^\d{9}$/.test(core)) return {ok:false, severity:'error', message:'Telefon by měl mít 9 číslic, např. 601 234 567'};
    return {ok:true, formatted: '+420 '+core.slice(0,3)+' '+core.slice(3,6)+' '+core.slice(6)};
  },
  email(raw){
    if(!raw) return {ok:true};
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return {ok:false, severity:'error', message:'Zadejte platnou e-mailovou adresu'};
    return {ok:true};
  },
  cisloOP(raw){
    if(!raw) return {ok:true};
    const cleaned = raw.replace(/\s+/g,'');
    if(!/^[A-Za-z0-9]{6,10}$/.test(cleaned)) return {ok:false, severity:'warning', message:'Neobvyklý formát čísla OP — zkontrolujte prosím'};
    return {ok:true};
  },
  platnostOP(raw){
    if(!raw) return {ok:true};
    const d = new Date(raw+'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    if(d < today) return {ok:false, severity:'warning', message:'Platnost dokladu už vypršela'};
    return {ok:true};
  },
  cisloUctu(raw){
    if(!raw) return {ok:true};
    const cleaned = raw.replace(/\s+/g,'');
    if(!/^(\d{1,6}-)?\d{2,10}$/.test(cleaned)) return {ok:false, severity:'error', message:'Jen číslice, případně předčíslí oddělené pomlčkou'};
    return {ok:true, formatted: cleaned};
  },
  kodBanky(raw){
    if(!raw) return {ok:true};
    if(!/^\d{4}$/.test(raw.trim())) return {ok:false, severity:'error', message:'Kód banky má 4 číslice, např. 0100'};
    return {ok:true};
  },
  yearZahajeni(raw){
    if(!raw) return {ok:true};
    const max = new Date().getFullYear()+1;
    const y = parseInt(raw,10);
    if(!/^\d{4}$/.test(raw.trim()) || y < 1950 || y > max) return {ok:false, severity:'error', message:`Zadejte rok mezi 1950 a ${max}`};
    return {ok:true};
  },
  yearUkonceni(raw, ctx){
    if(!raw) return {ok:true};
    const max = new Date().getFullYear()+1;
    const y = parseInt(raw,10);
    if(!/^\d{4}$/.test(raw.trim()) || y < 1950 || y > max) return {ok:false, severity:'error', message:`Zadejte rok mezi 1950 a ${max}`};
    if(ctx && ctx.rok_zahajeni && /^\d{4}$/.test(ctx.rok_zahajeni) && y < parseInt(ctx.rok_zahajeni,10)) return {ok:false, severity:'error', message:'Rok ukončení je dřív než rok zahájení'};
    return {ok:true};
  },
  praxeDo(raw, ctx){
    if(!raw) return {ok:true};
    if(ctx && ctx.od && raw < ctx.od) return {ok:false, severity:'error', message:'Datum „Do“ je dřív než „Od“'};
    return {ok:true};
  },
  birthDateVsRC(raw, ctx){
    if(!raw || !ctx || !ctx.rodne_cislo) return {ok:true};
    const rcCheck = VALIDATORS.rodneCislo(ctx.rodne_cislo);
    if(!rcCheck.ok) return {ok:true};
    const derived = birthDateFromRC(ctx.rodne_cislo);
    if(derived && derived !== raw) return {ok:false, severity:'warning', message:`Neodpovídá datu z rodného čísla (${formatDate(derived)})`};
    return {ok:true};
  },
};

function runValidation(f, value, ctx){
  if(!f.validate) return null;
  const fn = VALIDATORS[f.validate];
  if(!fn) return null;
  const result = fn(value, ctx);
  return (result && !result.ok) ? result : null;
}

function render(){
  const app = document.getElementById('app');
  const active = document.activeElement;
  let focusInfo = null;
  if(active){
    let selector = null;
    if(active.id) selector = '#' + CSS.escape(active.id);
    else if(active.hasAttribute && active.hasAttribute('data-field')) selector = `[data-field="${CSS.escape(active.getAttribute('data-field'))}"]`;
    else if(active.hasAttribute && active.hasAttribute('data-repeat-field')) selector = `[data-repeat-field="${CSS.escape(active.getAttribute('data-repeat-field'))}"]`;
    else if(active.hasAttribute && active.hasAttribute('data-flag-note')) selector = `[data-flag-note="${CSS.escape(active.getAttribute('data-flag-note'))}"]`;
    if(selector){
      const isTextish = (active.tagName === 'INPUT' && !['checkbox','radio'].includes(active.type)) || active.tagName === 'TEXTAREA';
      focusInfo = { selector, start: active.selectionStart, end: active.selectionEnd, value: isTextish ? active.value : null, isTextish };
    }
  }
  app.innerHTML = `
    <div class="masthead no-print">
      <div class="masthead-left">
        <h1>Onboarding</h1>
        <p>${esc(currentOrgName())} — evidence nových zaměstnanců${!isAfterOrgTransition() ? ' <span style="color:var(--ink-faint);">(od 1.&nbsp;1.&nbsp;2027 Úřad rozvoje území ČR)</span>' : ''}</p>
      </div>
      <div class="masthead-right">${esc(currentOrgAbbrev())} · interní evidence
        ${state.userEmail ? `<div style="margin-top:4px;text-transform:none;letter-spacing:normal;">${esc(state.userEmail)} · <a href="#" id="btn-logout" style="color:var(--blue);">Odhlásit se</a></div>` : ''}
      </div>
    </div>
    <div class="no-print">
    ${state.employeeMode ? `<div class="employee-banner">Toto je váš osobní onboardingový prostor. Vyplněné údaje uvidí personální oddělení, které je zkontroluje a případně doplní.</div>` : renderRoleSwitch()}
    ${state.error ? `<div style="background:var(--red-tint);color:var(--red);padding:10px 14px;border-radius:3px;margin-bottom:16px;font-size:13px;">${esc(state.error)}</div>` : ''}
    </div>
    ${state.view === 'list' ? renderList() : state.view === 'info-admin' ? renderInfoAdminPage() : state.view === 'settings' ? renderSettingsPage() : state.view === 'print-docs' ? renderPrintDocsPage() : state.view === 'import-mapping' ? renderImportMappingPage() : renderDetail()}
  `;
  attachHandlers();
  if(focusInfo){
    const el = document.querySelector(focusInfo.selector);
    if(el){
      el.focus();
      if(focusInfo.isTextish && focusInfo.value != null && el.value !== focusInfo.value){
        el.value = focusInfo.value;
      }
      if(typeof el.setSelectionRange === 'function' && focusInfo.start != null){
        try{ el.setSelectionRange(focusInfo.start, focusInfo.end); }catch(e){}
      }
    }
  }
}

function renderRoleSwitch(){
  return `
    <div class="role-switch">
      <span class="role-switch-label">Zobrazit jako:</span>
      <button class="role-btn ${state.role==='hr'?'active':''}" data-role="hr">Personální oddělení</button>
      <button class="role-btn ${state.role==='admin'?'active':''}" data-role="admin">IT a provoz</button>
      ${state.role==='hr' ? `<button class="role-btn" id="btn-open-settings" title="Nastavení">⚙</button>` : ''}
    </div>
  `;
}

const SORT_LABEL_ARROW = { asc:' ▲', desc:' ▼' };
function sortArrow(key){
  return state.sortKey === key ? SORT_LABEL_ARROW[state.sortDir] : '';
}
const PERSONAL_STATUS_ORDER = { draft:0, submitted:1, returned:2, reviewed:3 };

function getFilteredSortedRows(){
  let rows = state.index.slice();
  const text = (state.filterText || '').trim().toLowerCase();
  if(text){
    rows = rows.filter(r => `${r.jmeno||''} ${r.prijmeni||''} ${r.pozice||''} ${r.pracoviste||''} ${r.assignedAdmin||''} ${r.ref||''}`.toLowerCase().includes(text));
  }
  const cf = state.colFilters;
  if(cf.pozice) rows = rows.filter(r => (r.pozice||'') === cf.pozice);
  if(cf.pracoviste) rows = rows.filter(r => (r.pracoviste||'') === cf.pracoviste);
  if(state.role === 'hr' && cf.personal) rows = rows.filter(r => (r.personalStatus||'draft') === cf.personal);
  if(cf.it){
    rows = rows.filter(r => {
      const complete = r.itTotal > 0 && r.itDone === r.itTotal;
      return cf.it === 'complete' ? complete : !complete;
    });
  }
  if(state.role === 'admin' && cf.assigned){
    if(cf.assigned === '__unassigned__') rows = rows.filter(r => !r.assignedAdmin);
    else rows = rows.filter(r => r.assignedAdmin === cf.assigned);
  }
  const dir = state.sortDir === 'asc' ? 1 : -1;
  rows.sort((a,b) => {
    let av, bv;
    switch(state.sortKey){
      case 'name': av = `${a.prijmeni||''} ${a.jmeno||''}`.toLowerCase(); bv = `${b.prijmeni||''} ${b.jmeno||''}`.toLowerCase(); break;
      case 'pozice': av = (a.pozice||'').toLowerCase(); bv = (b.pozice||'').toLowerCase(); break;
      case 'pracoviste': av = (a.pracoviste||'').toLowerCase(); bv = (b.pracoviste||'').toLowerCase(); break;
      case 'datumNastupu': av = a.datumNastupu || ''; bv = b.datumNastupu || ''; break;
      case 'personal': av = PERSONAL_STATUS_ORDER[a.personalStatus||'draft']; bv = PERSONAL_STATUS_ORDER[b.personalStatus||'draft']; break;
      case 'it': av = a.itTotal ? a.itDone/a.itTotal : 0; bv = b.itTotal ? b.itDone/b.itTotal : 0; break;
      default: av = a.created || 0; bv = b.created || 0;
    }
    if(av < bv) return -1 * dir;
    if(av > bv) return 1 * dir;
    return 0;
  });
  return rows;
}

function renderList(){
  if(state.loading) return `<p style="color:var(--ink-soft);">Načítání…</p>`;
  const canCreate = state.role === 'hr';
  const isAdmin = state.role === 'admin';
  const allRows = state.index;
  const rows = getFilteredSortedRows();
  const reviewedRows = rows.filter(r => (r.personalStatus||'draft') === 'reviewed');
  const selectedCount = reviewedRows.filter(r => state.selectedExport[r.id]).length;
  const allReviewedSelected = reviewedRows.length > 0 && reviewedRows.every(r => state.selectedExport[r.id]);
  const assignSelectedCount = rows.filter(r => state.selectedAssign[r.id]).length;
  const allAssignSelected = rows.length > 0 && rows.every(r => state.selectedAssign[r.id]);
  const admins = adminList();
  const cf = state.colFilters;
  const personalStatusOpts = [['', 'Vše'], ['draft', STATUS_LABEL.draft], ['submitted', STATUS_LABEL.submitted], ['returned', STATUS_LABEL.returned], ['reviewed', STATUS_LABEL.reviewed]];
  const itStatusOpts = [['', 'Vše'], ['incomplete', 'Nedokončené'], ['complete', 'Dokončené']];
  const selectHtml = (attr, options, current) => `<select data-colfilter="${attr}" style="width:100%;font-size:12px;padding:4px 6px;">${options.map(([v,l]) => `<option value="${esc(v)}" ${current===v?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
  return `
    <div class="index-toolbar">
      <h2>Rejstřík nástupů</h2>
      <div style="display:flex;gap:8px;">
        ${canCreate ? `<button class="btn btn-ghost" id="btn-import-upload">Vytěžit podklady</button><input type="file" id="import-file-input" accept=".xlsx,.xls,.json" multiple style="display:none;">` : ''}
        ${canCreate ? `<button class="btn btn-primary" id="btn-new">+ Nový nástup</button>` : ''}
      </div>
    </div>
    ${allRows.length === 0 ? `
      <div class="empty-state">
        <h3>Zatím žádný záznam</h3>
        <p>${canCreate ? 'Založte první onboardingový spis pro nového zaměstnance.' : 'Zatím nejsou k dispozici žádné spisy k nastavení přístupů.'}</p>
      </div>
    ` : `
      <div class="index-filters">
        <div style="position:relative;flex:1;">
          <input type="text" id="list-search" placeholder="Hledat jméno, pozici, referenci…" value="${esc(state.filterText||'')}" style="width:100%;padding-right:28px;">
          ${state.filterText ? `<button type="button" id="list-search-clear" class="search-clear-btn" title="Vymazat vyhledávání">×</button>` : ''}
        </div>
      </div>
      ${canCreate ? `
      <div class="export-bar">
        <span style="font-size:13px;color:var(--ink-soft);">${selectedCount ? `Vybráno ${selectedCount} ke exportu` : 'Export do VEMY — vyberte zkontrolované spisy'}</span>
        <button class="btn btn-primary btn-sm" id="btn-generate-vema" ${selectedCount===0 || state.exporting ? 'disabled':''}>${state.exporting ? 'Generuji…' : `Generovat tabulky pro VEMU${selectedCount?' ('+selectedCount+')':''}`}</button>
      </div>
      ` : ''}
      ${isAdmin ? `
      <div class="export-bar">
        <span style="font-size:13px;color:var(--ink-soft);">${assignSelectedCount ? `Vybráno ${assignSelectedCount} spisů` : 'Hromadné přiřazení — zaškrtněte spisy vlevo'}</span>
        ${admins.length ? `
          <div style="display:flex;gap:8px;align-items:center;">
            <select id="bulk-assign-select">
              <option value="">— vyberte administrátora —</option>
              ${admins.map(a => `<option value="${esc(a)}" ${state.bulkAssignTarget===a?'selected':''}>${esc(a)}</option>`).join('')}
            </select>
            <button class="btn btn-primary btn-sm" id="btn-bulk-assign" ${assignSelectedCount===0 || !state.bulkAssignTarget || state.bulkAssigning ? 'disabled':''}>${state.bulkAssigning ? 'Přiřazuji…' : `Přiřadit vybraným${assignSelectedCount?' ('+assignSelectedCount+')':''}`}</button>
          </div>
        ` : `<span style="font-size:12.5px;color:var(--ink-faint);">Nejdřív přidejte administrátory v Nastavení ⚙</span>`}
      </div>
      ` : ''}
      ${rows.length === 0 ? `<p style="color:var(--ink-soft);font-size:13.5px;">Žádný spis neodpovídá filtru.</p>` : `
      <table class="index-table">
        <thead>
        <tr>
          ${canCreate ? `<th style="width:28px;"><input type="checkbox" id="export-select-all" ${allReviewedSelected?'checked':''} ${reviewedRows.length===0?'disabled':''} title="Vybrat všechny zkontrolované"></th>` : ''}
          ${isAdmin ? `<th style="width:28px;"><input type="checkbox" id="assign-select-all" ${allAssignSelected?'checked':''} ${rows.length===0?'disabled':''} title="Vybrat všechny"></th>` : ''}
          ${canCreate ? `<th style="width:28px;"></th>` : ''}
          <th data-sort="name">Zaměstnanec${sortArrow('name')}</th>
          <th data-sort="pozice">Pozice${sortArrow('pozice')}</th>
          <th data-sort="pracoviste">Pracoviště${sortArrow('pracoviste')}</th>
          <th data-sort="datumNastupu">Nástup${sortArrow('datumNastupu')}</th>
          ${state.role==='hr'?`<th data-sort="personal">Osobní údaje${sortArrow('personal')}</th>`:''}
          <th data-sort="it">IT a přístupy${sortArrow('it')}</th>
          ${isAdmin?`<th>Termín</th><th>Přiřazeno</th>`:''}
          ${canCreate?'<th>Export VEMA</th><th></th>':''}
        </tr>
        <tr class="index-filter-row">
          ${canCreate ? `<th></th>` : ''}
          ${isAdmin ? `<th></th>` : ''}
          ${canCreate ? `<th></th>` : ''}
          <th></th>
          <th>${selectHtml('pozice', [['','Vše'], ...positionList().map(p=>[p,p])], cf.pozice)}</th>
          <th>${selectHtml('pracoviste', [['','Vše'], ...workplaceList().map(w=>[w,w])], cf.pracoviste)}</th>
          <th></th>
          ${state.role==='hr'?`<th>${selectHtml('personal', personalStatusOpts, cf.personal)}</th>`:''}
          <th>${selectHtml('it', itStatusOpts, cf.it)}</th>
          ${isAdmin?`<th></th><th>${selectHtml('assigned', [['','Vše'], ['__unassigned__','Nepřiřazeno'], ...admins.map(a=>[a,a])], cf.assigned)}</th>`:''}
          ${canCreate?'<th></th><th></th>':''}
        </tr>
        </thead>
        <tbody>
          ${rows.map(r => {
            const isReviewed = (r.personalStatus||'draft') === 'reviewed';
            return `
            <tr class="index-row" data-open="${r.id}">
              ${canCreate ? `<td><input type="checkbox" data-export-select="${r.id}" ${state.selectedExport[r.id]?'checked':''} ${isReviewed?'':'disabled'}></td>` : ''}
              ${isAdmin ? `<td><input type="checkbox" data-assign-select="${r.id}" ${state.selectedAssign[r.id]?'checked':''}></td>` : ''}
              ${canCreate ? `<td style="text-align:center;"><button class="btn-quickedit-icon" data-quickedit="${r.id}" title="Rychle doplnit základní údaje">✎</button></td>` : ''}
              <td><div class="index-name">${esc(r.jmeno)} ${esc(r.prijmeni)}</div><div class="index-ref">${esc(r.ref)}</div></td>
              <td>${esc(r.pozice || '—')}</td>
              <td>${esc(r.pracoviste || '—')}</td>
              <td>${esc(formatDate(r.datumNastupu)) || '—'}</td>
              ${state.role==='hr'?`<td>${personalChip(r)}</td>`:''}
              <td>${chip(r.itDone === r.itTotal && r.itTotal>0, `${r.itDone||0}/${r.itTotal||0}`)}</td>
              ${state.role==='admin'?`<td>${urgencyChip(r)}</td><td>${adminList().length ? `<select data-list-assign="${r.id}"><option value="">— nepřiřazeno —</option>${adminList().map(a => `<option value="${esc(a)}" ${r.assignedAdmin===a?'selected':''}>${esc(a)}</option>`).join('')}</select>` : (r.assignedAdmin ? esc(r.assignedAdmin) : '<span style="color:var(--ink-faint);">—</span>')}</td>`:''}
              ${canCreate?`<td>${r.vemaExportedAt ? `<span class="chip chip-done" title="${esc(new Date(r.vemaExportedAt).toLocaleString('cs-CZ'))}">Vygenerováno</span>` : `<span class="chip chip-progress-bg">Negenerováno</span>`}</td>
              <td style="text-align:right;"><button class="btn-delete-tiny" data-delete="${r.id}" title="Smazat spis">Smazat</button></td>`:''}
            </tr>
          `;
          }).join('')}
        </tbody>
      </table>
      `}
    `}
  `;
}
function chip(done, label){
  if(done) return `<span class="chip chip-done"><i>✓</i> ${label || 'Hotovo'}</span>`;
  return `<span class="chip chip-progress-bg">${label || 'Nevyplněno'}</span>`;
}
function draftStageInfo(missingCount, linkGeneratedAt){
  if(missingCount > 0) return { label:'K doplnění personálním oddělením', chipClass:'chip-amber' };
  if(!linkGeneratedAt) return { label:'Připraveno — vygenerujte odkaz pro zaměstnance', chipClass:'chip-blue' };
  return { label:'Čeká na zaměstnance', chipClass:'chip-progress-bg' };
}
function personalChip(r){
  const status = r.personalStatus || 'draft';
  if(status === 'reviewed') return `<span class="chip chip-done">Zkontrolováno</span>`;
  if(status === 'returned') return `<span class="chip chip-amber">Vráceno k doplnění</span>`;
  if(status === 'submitted') return `<span class="chip chip-blue">Odesláno zaměstnancem</span>`;
  const info = draftStageInfo(r.hrMissingCount || 0, r.linkGeneratedAt);
  return `<span class="chip ${info.chipClass}">${esc(info.label)}</span>`;
}

function availableTabs(){
  if(state.role === 'employee') return ['info','personal'];
  if(state.role === 'admin') return ['it','provoz'];
  return ['personal','it'];
}

function renderDetail(){
  const r = state.currentRecord;
  if(!r) return `<p>Záznam nenalezen.</p>`;
  const idxEntry = state.index.find(e => e.id === state.currentId);
  const displayName = `${r.personal.jmeno||''} ${r.personal.prijmeni||''}`.trim();
  const displayRef = idxEntry ? idxEntry.ref : '';
  const displayDatumNastupu = idxEntry ? idxEntry.datumNastupu : r.personal.datum_nastupu;
  const itTotals = checklistTotals(r.checklist, r.personal.kategorie, 'it');
  const provozTotals = checklistTotals(r.checklist, r.personal.kategorie, 'provoz');
  const itPct = itTotals.total ? Math.round(itTotals.done/itTotals.total*100) : 0;
  const provozPct = provozTotals.total ? Math.round(provozTotals.done/provozTotals.total*100) : 0;
  const complete = itTotals.total > 0 && itTotals.done === itTotals.total;
  const tabs = availableTabs();
  if(!tabs.includes(state.tab)) state.tab = tabs[0];

  if(state.role === 'employee' && !r.consentGiven){
    return `
      ${state.employeeMode || state.previewingEmployee ? '' : `<div class="back-link" id="btn-back">← Zpět na rejstřík</div>`}
      <div class="detail-head">
        <div>
          <h2 class="detail-title">${esc(displayName)}</h2>
          <div class="detail-sub">${esc(displayRef)}</div>
        </div>
      </div>
      <div class="panel">
        <h3 style="font-family:var(--font-display);font-size:1.25rem;margin:0 0 12px;">Souhlas se zpracováním osobních údajů</h3>
        <p style="font-size:14px;color:var(--ink-soft);line-height:1.6;white-space:pre-wrap;">${esc(state.infoContent.consentText)}</p>
        <div class="review-row" style="margin-top:18px;">
          <input type="checkbox" id="chk-consent">
          <label for="chk-consent">Souhlasím se zpracováním svých osobních údajů pro uvedené účely.</label>
        </div>
        <button class="btn btn-primary" id="btn-consent-confirm" disabled>Pokračovat</button>
      </div>
    `;
  }

  const personalBadge = state.role === 'employee'
    ? (r.personalStatus === 'reviewed' ? ' <span class="tab-badge">✓</span>' : ' <span class="tab-badge">●</span>')
    : '';

  return `
    ${state.employeeMode || state.previewingEmployee ? '' : `<div class="back-link" id="btn-back">← Zpět na rejstřík</div>`}
    <div class="detail-head">
      <div>
        <h2 class="detail-title">${esc(displayName)}</h2>
        <div class="detail-sub">${esc(displayRef)}${displayRef?' · ':''}nástup ${esc(formatDate(displayDatumNastupu)) || '—'}</div>
      </div>
      <div class="detail-actions">
        ${complete ? `<div class="stamp">Přístupy vyřízeny</div>` : ''}
        ${state.role==='hr' && !state.previewingEmployee ? (() => {
          const hrMissing = missingHrRequiredFields(r);
          const linkReady = hrMissing.length === 0;
          return `<button class="btn btn-ghost btn-sm" id="btn-copy-link" ${linkReady?'':'disabled title="Nejdřív doplňte povinné údaje personálního oddělení (viz Osobní údaje)"'}>${state.linkCopied ? 'Odkaz zkopírován ✓' : 'Zkopírovat odkaz pro zaměstnance'}</button>`;
        })() : ''}
      </div>
    </div>
    <div class="tabs">
      ${tabs.includes('info') ? `<div class="tab ${state.tab==='info'?'active':''}" data-tab="info">Co potřebujete vědět</div>` : ''}
      ${tabs.includes('personal') ? `<div class="tab ${state.tab==='personal'?'active':''}" data-tab="personal">${state.role==='employee'?'Vaše údaje':'Osobní údaje'}${personalBadge}</div>` : ''}
      ${tabs.includes('it') ? `<div class="tab ${state.tab==='it'?'active':''}" data-tab="it">IT a přístupy <span class="tab-badge">${itTotals.done}/${itTotals.total}</span></div>` : ''}
      ${tabs.includes('provoz') ? `<div class="tab ${state.tab==='provoz'?'active':''}" data-tab="provoz">Provoz <span class="tab-badge">${provozTotals.done}/${provozTotals.total}</span></div>` : ''}
    </div>
    <div class="panel">
      ${state.tab === 'info' ? renderInfoTab(r) : state.tab === 'personal' ? (state.role==='employee' ? renderPersonalWizard(r) : renderPersonalForm(r)) : state.tab === 'provoz' ? renderChecklist(r, provozPct, provozTotals.total>0 && provozTotals.done===provozTotals.total, 'provoz') : renderChecklist(r, itPct, complete, 'it')}
    </div>
  `;
}

function renderAssignedInfoCard(r){
  const c = r.checklist;
  const orgItems = [
    {label:'Přímý nadřízený', value: r.personal.nadrizeny},
    {label:'Pracoviště (budova)', value: r.personal.pracoviste},
    {label:'Kancelář', value: r.assignedOffice},
    {label:'Přiřazeno pro IT a přístupy', value: r.assignedAdmin},
    {label:'Přiřazeno pro provoz', value: r.assignedFacilityStaff},
  ].filter(i => i.value);
  const items = [
    {label:'Přidělená e-mailová adresa', value: c.email && c.email.value},
    {label:'Přidělené telefonní číslo', value: c.telefon_cislo && c.telefon_cislo.value},
    {label:'Uživatelské jméno (login)', value: c.entra_user && c.entra_user.value},
    {label:'Počáteční heslo', value: c.entra_password && c.entra_password.value},
  ].filter(i => i.value);
  const majetek = CHECKLIST_SECTIONS.find(s => s.id === 'majetek');
  const eqTotal = majetek.items.length;
  const eqDone = majetek.items.filter(it => c[it.id] && c[it.id].checked).length;
  if(orgItems.length === 0 && items.length === 0 && eqDone === 0) return '';
  let html = `<div class="info-card wide"><h4>Vaše přidělené údaje</h4>`;
  orgItems.forEach(i => {
    html += `<div style="margin-bottom:10px;"><div style="font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-faint);">${esc(i.label)}</div><div style="font-size:14px;">${esc(i.value)}</div></div>`;
  });
  items.forEach(i => {
    html += `<div style="margin-bottom:10px;"><div style="font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink-faint);">${esc(i.label)}</div><div style="font-size:14px;">${esc(i.value)}</div></div>`;
  });
  if(eqTotal > 0 && eqDone > 0){
    html += eqDone === eqTotal
      ? `<p style="font-size:13px;color:var(--green-dark);margin-top:4px;">✓ Vaše pracovní vybavení (notebook, telefon, přístupové karty) je připraveno k vyzvednutí.</p>`
      : `<p style="font-size:13px;color:var(--ink-soft);margin-top:4px;">Vaše pracovní vybavení se připravuje (${eqDone}/${eqTotal} položek hotovo).</p>`;
  }
  html += `</div>`;
  return html;
}

function renderSystemAccessCard(r){
  const category = r.personal.kategorie;
  const systems = systemsForCategory(category);
  if(!category || systems.length === 0) return '';
  const sectionIds = systems.filter(id => id !== 'vema_server');
  const urls = systemUrls();
  const types = systemTypes();
  const rows = sectionIds.map(id => {
    const sec = CHECKLIST_SECTIONS.find(s => s.id === id);
    if(!sec) return '';
    const total = sec.items.length;
    const done = sec.items.filter(it => r.checklist[it.id] && r.checklist[it.id].checked).length;
    const complete = total > 0 && done === total;
    const url = urls[id];
    const isDesktop = types[id] === 'desktop';
    const action = isDesktop
      ? `<span class="access-desktop-note">🖥 spouští se ikonou z plochy</span>`
      : (url ? `<a class="access-link" href="${esc(url)}" target="_blank" rel="noopener">Otevřít →</a>` : '');
    return `<div class="access-row">
      <span class="access-status ${complete?'done':''}">${complete ? '✓' : ''}</span>
      <span class="access-name">${esc(sec.label)}</span>
      ${action}
      <span class="access-meta">${complete ? 'Přístup zřízen' : `${done}/${total} dokončeno`}</span>
    </div>`;
  }).join('');
  return `<div class="info-card wide">
    <h4>Přístup do systémů</h4>
    <p style="font-size:12.5px;color:var(--ink-soft);margin:-2px 0 10px;">Podle vaší kategorie (${esc(category)}) vám administrátor systémů zřizuje přístup do těchto aplikací. Stav se aktualizuje automaticky podle postupu v checklistu administrátora.</p>
    ${rows}
  </div>`;
}

function renderInfoTab(r){
  const info = state.infoContent;
  const editable = state.role === 'hr' && !state.employeeMode;
  let html = '';
  if(editable){
    html += `<div class="info-edit-bar"><button class="btn btn-ghost btn-sm" id="btn-toggle-edit-info">${state.editingInfo ? 'Zobrazit náhled' : 'Upravit obsah'}</button></div>`;
  }
  if(editable && state.editingInfo){
    html += `<div class="info-card wide" style="margin-bottom:16px;">
      <h4>Text souhlasu se zpracováním osobních údajů</h4>
      <p style="font-size:12px;color:var(--ink-faint);margin:0 0 8px;">Zobrazí se zaměstnanci před prvním vstupem do jeho spisu.</p>
      <textarea id="consent-text-body" style="min-height:110px;">${esc(info.consentText)}</textarea>
    </div>`;
  }
  if(state.role === 'employee' && r){
    const pStatus = r.personalStatus || 'draft';
    if(pStatus === 'draft'){
      html += `<div class="wizard-pending-msg" style="margin-bottom:16px;">Nezapomeňte prosím vyplnit vaše osobní údaje v záložce „Vaše údaje" — personální oddělení je potřebuje ještě před vaším nástupem.</div>`;
    } else if(pStatus === 'returned'){
      html += `<div class="return-banner" style="margin-bottom:16px;"><strong>Personální oddělení vás žádá o doplnění údajů.</strong> Zkontrolujte prosím záložku „Vaše údaje" — zvýrazněná pole potřebují opravit nebo doplnit.</div>`;
    } else if(pStatus === 'submitted'){
      html += `<div class="wizard-pending-msg" style="margin-bottom:16px;">Vaše údaje jsme odeslali personálnímu oddělení ke kontrole — zatím není potřeba nic dalšího dělat.</div>`;
    }
  }
  html += `<div class="info-cards">`;

  const empType = (r && r.personal.typ_nastupu) || '';
  const isDismissed = state.role === 'employee' && ((r && r.firstDayDismissed) || state.firstDayHiddenSession);
  if(editable && state.editingInfo){
    const editingType = state.editingFirstDayType && ONBOARDING_TYPES.includes(state.editingFirstDayType) ? state.editingFirstDayType : (empType || ONBOARDING_TYPES[0]);
    html += `<div class="info-card wide">
      <div class="field-label-row" style="margin-bottom:8px;">
        <h4 style="margin:0;">Váš první den</h4>
        <select id="firstday-type-select">${ONBOARDING_TYPES.map(t => `<option value="${esc(t)}" ${t===editingType?'selected':''}>${esc(t)}</option>`).join('')}</select>
      </div>
      <textarea data-firstday-body="${esc(editingType)}" placeholder="Kde a v kolik se hlásit, kdo přivítá, co si vzít s sebou, harmonogram dne…">${esc(info.firstDayPlans[editingType]||'')}</textarea>
    </div>`;
  } else if(state.role === 'employee' && isDismissed){
    html += `<div class="info-card wide" style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:13px;color:var(--ink-faint);">Sekce „Váš první den" je skrytá.</span>
      <button class="btn btn-ghost btn-sm" id="btn-firstday-restore">Zobrazit znovu</button>
    </div>`;
  } else if(empType){
    const body = info.firstDayPlans[empType];
    html += `<div class="info-card wide">
      <div class="field-label-row">
        <h4>Váš první den</h4>
        ${state.role==='employee' ? `<button class="btn-delete-tiny" id="btn-firstday-dismiss" title="Skrýt tuto sekci">✕ skrýt</button>` : ''}
      </div>
      <p style="font-size:12px;color:var(--ink-faint);margin:-4px 0 8px;">${esc(empType)}</p>
      <p>${esc(body || 'Personální oddělení zatím pro tento typ nástupu nedoplnilo informace.')}</p>
      ${state.role==='employee' && state.firstDayDismissPrompt ? `
        <div class="pending-save-bar">Skrýt tuto sekci:
          <button type="button" class="btn btn-ghost btn-sm" id="btn-firstday-hide-session">Jen teď</button>
          <button type="button" class="btn btn-primary btn-sm" id="btn-firstday-hide-forever">Natrvalo</button>
          <button type="button" class="btn btn-ghost btn-sm" id="btn-firstday-hide-cancel">Zrušit</button>
        </div>` : ''}
    </div>`;
  } else if(!editable){
    html += `<div class="info-card wide"><h4>Váš první den</h4><p>Typ nástupu zatím nebyl určen — jakmile ho personální oddělení doplní, uvidíte zde přesný plán.</p></div>`;
  }

  if(state.role === 'employee' && r){
    html += renderSystemAccessCard(r);
    html += renderAssignedInfoCard(r);
  }

  html += `<div class="info-card wide"><h4>Klíčové kontakty</h4>`;
  info.contacts.groups.forEach((g, gi) => {
    html += `<div class="contact-group"><h5>${state.editingInfo ? `<input data-contact-group-title="${gi}" value="${esc(g.title)}" style="font-family:inherit;">` : esc(g.title)}</h5>`;
    g.people.forEach((p, pi) => {
      if(state.editingInfo){
        html += `<div class="contact-edit-row">
          <input data-contact-person-name="${gi}:${pi}" value="${esc(p.name)}" placeholder="Jméno">
          <input data-contact-person-phone="${gi}:${pi}" value="${esc(p.phone)}" placeholder="Telefon">
          <button class="btn btn-ghost btn-sm" type="button" data-contact-remove="${gi}:${pi}">Odebrat</button>
        </div>`;
      } else {
        html += `<div class="contact-person"><span>${esc(p.name)}</span><a href="tel:${esc(p.phone.replace(/\s+/g,''))}">${esc(p.phone)}</a></div>`;
      }
    });
    if(state.editingInfo) html += `<button class="btn btn-ghost btn-sm" type="button" data-contact-add="${gi}">+ Přidat osobu</button>`;
    html += `</div>`;
  });
  if(!state.editingInfo && info.contacts.linkUrl){
    html += `<a class="info-link" href="${esc(info.contacts.linkUrl)}" target="_blank" rel="noopener">${esc(info.contacts.linkLabel)} →</a>`;
  }
  html += `</div>`;

  html += `<div class="info-card wide"><h4>Užitečné odkazy</h4>`;
  if(state.editingInfo){
    info.links.forEach((l, li) => {
      html += `<div class="contact-edit-row">
        <input data-link-label="${li}" value="${esc(l.label)}" placeholder="Název odkazu">
        <input data-link-url="${li}" value="${esc(l.url)}" placeholder="https://…">
        <button class="btn btn-ghost btn-sm" type="button" data-link-remove="${li}">Odebrat</button>
      </div>`;
    });
    html += `<button class="btn btn-ghost btn-sm" type="button" id="btn-link-add">+ Přidat odkaz</button>`;
  } else {
    const activeLinks = info.links.filter(l => l.url);
    if(activeLinks.length === 0){
      html += `<p style="font-size:13px;color:var(--ink-soft);">Zatím nevyplněno.</p>`;
    } else {
      activeLinks.forEach(l => {
        html += `<a class="info-link" style="display:block;margin-top:4px;" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} →</a>`;
      });
    }
  }
  html += `</div>`;

  const empWorkplace = (r && r.personal.pracoviste) || '';
  if(editable && state.editingInfo){
    const editingWp = state.editingWorkplace && workplaceList().includes(state.editingWorkplace) ? state.editingWorkplace : (empWorkplace || workplaceList()[0]);
    html += `<div class="info-card wide">
      <div class="field-label-row" style="margin-bottom:8px;">
        <h4 style="margin:0;">Informace o pracovišti</h4>
        <select id="workplace-editor-select">${workplaceList().map(w => `<option value="${esc(w)}" ${w===editingWp?'selected':''}>${esc(w)}</option>`).join('')}</select>
      </div>
      <textarea data-workplace-body="${esc(editingWp)}" placeholder="Adresa, dopravní dostupnost, parkování, vstup do budovy…">${esc(info.workplaces[editingWp]||'')}</textarea>
    </div>`;
  } else if(empWorkplace){
    const body = info.workplaces[empWorkplace];
    html += `<div class="info-card wide"><h4>Vaše pracoviště: ${esc(empWorkplace)}</h4><p>${esc(body || 'Personální oddělení zatím pro toto pracoviště nedoplnilo informace.')}</p></div>`;
  } else if(!editable){
    html += `<div class="info-card wide"><h4>Vaše pracoviště</h4><p>Pracoviště zatím nebylo přiřazeno — jakmile ho personální oddělení doplní, uvidíte zde informace k němu.</p></div>`;
  }

  info.cards.forEach((c, ci) => {
    if(state.editingInfo){
      html += `<div class="info-card wide">
        <input data-card-title="${ci}" value="${esc(c.title)}" style="font-family:var(--font-display);font-size:1.125rem;font-weight:600;border:none;background:transparent;padding:0 0 8px;width:100%;">
        <textarea data-card-body="${ci}">${esc(c.body)}</textarea>
      </div>`;
    } else {
      html += `<div class="info-card"><h4>${esc(c.title)}</h4><p>${esc(c.body)}</p></div>`;
    }
  });

  html += `<div class="info-card wide"><h4>Glosář zkratek a systémů</h4>`;
  if(state.editingInfo){
    info.glossary.forEach((g, gi) => {
      html += `<div class="contact-edit-row" style="grid-template-columns:140px 1fr auto;align-items:start;">
        <input data-glossary-term="${gi}" value="${esc(g.term)}" placeholder="Zkratka">
        <textarea data-glossary-desc="${gi}" placeholder="Vysvětlení" style="min-height:38px;">${esc(g.desc)}</textarea>
        <button class="btn btn-ghost btn-sm" type="button" data-glossary-remove="${gi}">Odebrat</button>
      </div>`;
    });
    html += `<button class="btn btn-ghost btn-sm" type="button" id="btn-glossary-add">+ Přidat pojem</button>`;
  } else if(info.glossary.length === 0){
    html += `<p style="font-size:13px;color:var(--ink-soft);">Zatím nevyplněno.</p>`;
  } else {
    info.glossary.forEach(g => {
      html += `<div class="contact-person" style="align-items:flex-start;"><span style="font-family:var(--font-mono);font-weight:600;min-width:100px;">${esc(g.term)}</span><span style="text-align:left;color:var(--ink-soft);font-size:13px;flex:1;">${esc(g.desc)}</span></div>`;
    });
  }
  html += `</div>`;

  html += `</div>`;
  if(state.editingInfo){
    html += `<div style="margin-top:16px;"><button class="btn btn-primary btn-sm" id="btn-save-info">Uložit obsah</button></div>`;
  }
  return html;
}

function renderInfoAdminPage(){
  return `
    <div class="back-link" id="btn-back-info-admin">← Zpět do nastavení</div>
    <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:600;margin:0 0 16px;">Obsah pro zaměstnance — Co potřebujete vědět</h2>
    <div class="panel">
      ${renderInfoTab(null)}
    </div>
  `;
}

function toCsvValue(v){ return `"${String(v==null?'':v).replace(/"/g,'""')}"`; }
function downloadCsv(filename, headerCols, rows){
  const csv = [headerCols.map(toCsvValue).join(','), ...rows.map(r => r.map(toCsvValue).join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function isSettingsSectionCollapsed(key){
  if(!state.settingsCollapsed) state.settingsCollapsed = {};
  return state.settingsCollapsed[key] !== false;
}
function settingsPanelStart(key, title, csv){
  const collapsed = isSettingsSectionCollapsed(key);
  const csvBtn = csv ? `<button type="button" class="btn btn-ghost btn-sm settings-csv-btn" data-settings-csv="${esc(csv.field)}" data-settings-csv-label="${esc(csv.label)}">Export CSV</button>` : '';
  return `
    <div class="settings-panel-head" data-settings-toggle="${key}">
      <h4 style="font-family:var(--font-display);font-size:1.125rem;">${esc(title)}</h4>
      ${csvBtn}
      <span class="settings-toggle-arrow ${collapsed?'collapsed':''}">▾</span>
    </div>
    <div class="settings-panel-body" style="${collapsed?'display:none;':''}">
  `;
}
function settingsPanelEnd(){ return `</div>`; }

function renderSettingsPage(){
  if(!state.settingsDraft) state.settingsDraft = JSON.parse(JSON.stringify(state.settings));
  const draft = state.settingsDraft;
  const conditionalSections = CHECKLIST_SECTIONS.filter(s => !ALWAYS_CHECKLIST_SECTIONS.includes(s.id));
  return `
    <div class="back-link" id="btn-back-settings">← Zpět na rejstřík</div>
    <h2 style="font-family:var(--font-display);font-size:1.5rem;font-weight:600;margin:0 0 16px;">Nastavení</h2>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('info', 'Obsah pro zaměstnance')}
      <p style="font-size:13px;color:var(--ink-soft);margin:0 0 12px;">Kontakty, informace k jednotlivým pracovištím a obecné karty v záložce „Co potřebujete vědět".</p>
      <button class="btn btn-ghost btn-sm" id="btn-goto-info-admin">Upravit obsah →</button>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('wp', 'Pracoviště', {field:'workplaces', label:'Pracoviště'})}
      ${draft.workplaces.map((w,i) => `
        <div class="contact-edit-row" style="grid-template-columns:1fr auto;">
          <input data-wp-input="${i}" value="${esc(w)}" placeholder="Název pracoviště">
          <button class="btn btn-ghost btn-sm" type="button" data-wp-remove="${i}">Odebrat</button>
        </div>
      `).join('')}
      <button class="btn btn-ghost btn-sm" type="button" id="btn-wp-add">+ Přidat pracoviště</button>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('pos', 'Pracovní pozice', {field:'positions', label:'Pracovní pozice'})}
      ${draft.positions.map((w,i) => `
        <div class="contact-edit-row" style="grid-template-columns:1fr auto;">
          <input data-pos-input="${i}" value="${esc(w)}" placeholder="Název pozice">
          <button class="btn btn-ghost btn-sm" type="button" data-pos-remove="${i}">Odebrat</button>
        </div>
      `).join('')}
      <button class="btn btn-ghost btn-sm" type="button" id="btn-pos-add">+ Přidat pozici</button>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('admins', 'Administrátoři systémů', {field:'admins', label:'Administrátoři systémů'})}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Slouží k přiřazování spisů — kdo z administrátorů má daný nástup na starosti.</p>
      ${draft.admins.map((w,i) => `
        <div class="contact-edit-row" style="grid-template-columns:1fr auto;">
          <input data-admin-input="${i}" value="${esc(w)}" placeholder="Jméno administrátora">
          <button class="btn btn-ghost btn-sm" type="button" data-admin-remove="${i}">Odebrat</button>
        </div>
      `).join('')}
      <button class="btn btn-ghost btn-sm" type="button" id="btn-admin-add">+ Přidat administrátora</button>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('supervisors', 'Nadřízení', {field:'supervisors', label:'Nadřízení'})}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Seznam pro výběr přímého nadřízeného v sekci Pracovní poměr.</p>
      ${draft.supervisors.map((w,i) => `
        <div class="contact-edit-row" style="grid-template-columns:1fr auto;">
          <input data-supervisor-input="${i}" value="${esc(w)}" placeholder="Jméno nadřízeného">
          <button class="btn btn-ghost btn-sm" type="button" data-supervisor-remove="${i}">Odebrat</button>
        </div>
      `).join('')}
      <button class="btn btn-ghost btn-sm" type="button" id="btn-supervisor-add">+ Přidat nadřízeného</button>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('departments', 'Odbory / oddělení', {field:'departments', label:'Odbory / oddělení'})}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Seznam pro výběr odboru/oddělení v sekci Pracovní poměr.</p>
      ${draft.departments.map((w,i) => `
        <div class="contact-edit-row" style="grid-template-columns:1fr auto;">
          <input data-department-input="${i}" value="${esc(w)}" placeholder="Název odboru / oddělení">
          <button class="btn btn-ghost btn-sm" type="button" data-department-remove="${i}">Odebrat</button>
        </div>
      `).join('')}
      <button class="btn btn-ghost btn-sm" type="button" id="btn-department-add">+ Přidat odbor / oddělení</button>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('facility', 'Pracovníci provozu', {field:'facilityStaff', label:'Pracovníci provozu'})}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Slouží k přiřazování spisů v záložce Provoz — kdo má daný nástup po stránce vybavení a kanceláře na starosti.</p>
      ${draft.facilityStaff.map((w,i) => `
        <div class="contact-edit-row" style="grid-template-columns:1fr auto;">
          <input data-facility-input="${i}" value="${esc(w)}" placeholder="Jméno pracovníka provozu">
          <button class="btn btn-ghost btn-sm" type="button" data-facility-remove="${i}">Odebrat</button>
        </div>
      `).join('')}
      <button class="btn btn-ghost btn-sm" type="button" id="btn-facility-add">+ Přidat pracovníka provozu</button>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('vemacodes', 'Kód pracoviště pro Vemu')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Kód dle číselníku tklc a umístění pracoviště — vyplní se automaticky při generování Zaváděcího formuláře místo textového názvu pracoviště.</p>
      ${workplaceList().map(w => `
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">${esc(w)}</label>
          <div class="contact-edit-row" style="grid-template-columns:120px 1fr 1fr 1fr;">
            <input data-vemacode-input="${esc(w)}" value="${esc(draft.workplaceVemaCodes[w]||'')}" placeholder="Kód (tklc)">
            <input data-workplace-loc-input="${esc(w)}:okres" value="${esc((draft.workplaceLocations[w]||{}).okres||'')}" placeholder="Okres">
            <input data-workplace-loc-input="${esc(w)}:obec" value="${esc((draft.workplaceLocations[w]||{}).obec||'')}" placeholder="Obec">
            <input data-workplace-loc-input="${esc(w)}:sidlo" value="${esc((draft.workplaceLocations[w]||{}).sidlo||'')}" placeholder="Sídlo (ulice, č.p.)">
          </div>
        </div>
      `).join('')}
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('vemaconst', 'Pevné hodnoty pro export do Vemy')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Hodnoty stejné pro všechny zaměstnance úřadu — vyplňte jednou, appka je pak sama doplní do každého generovaného Zaváděcího formuláře.</p>
      <div class="contact-edit-row" style="grid-template-columns:280px 1fr;">
        <label style="font-size:13px;align-self:center;">Zaměstnanec ve státní správě</label>
        <select data-vemaconst-input="stspr">
          <option value="">— nevyplněno —</option>
          <option value="1" ${draft.vemaConstants.stspr==='1'?'selected':''}>PPV spadá do výkonu funkcí ve státní správě</option>
          <option value="2" ${draft.vemaConstants.stspr==='2'?'selected':''}>PPV nespadá do výkonu funkcí ve státní správě</option>
        </select>
      </div>
      <div class="contact-edit-row" style="grid-template-columns:280px 1fr;">
        <label style="font-size:13px;align-self:center;">Délka řádné dovolené</label>
        <select data-vemaconst-input="pocrd">
          <option value="">— nevyplněno —</option>
          <option value="1" ${draft.vemaConstants.pocrd==='1'?'selected':''}>Standardní nárok</option>
          <option value="6" ${draft.vemaConstants.pocrd==='6'?'selected':''}>6 týdnů (dle druhu zaměstnání)</option>
          <option value="8" ${draft.vemaConstants.pocrd==='8'?'selected':''}>8 týdnů (dle druhu zaměstnání)</option>
        </select>
      </div>
      <div class="contact-edit-row" style="grid-template-columns:280px 1fr;">
        <label style="font-size:13px;align-self:center;">Délka průměrného týdne (dny)</label>
        <input data-vemaconst-input="prumt" value="${esc(draft.vemaConstants.prumt||'5')}" placeholder="např. 5">
      </div>
      <div class="contact-edit-row" style="grid-template-columns:280px 1fr;">
        <label style="font-size:13px;align-self:center;">Délka průměrného týdne (hodiny)</label>
        <input data-vemaconst-input="pruths" value="${esc(draft.vemaConstants.pruths||'40')}" placeholder="např. 40">
      </div>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('offices', 'Kanceláře podle budovy')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Seznam kanceláří pro každé pracoviště — v záložce Provoz se zaměstnanci nabídnou jen kanceláře jeho pracoviště.</p>
      ${workplaceList().map(w => `
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">${esc(w)}</label>
          ${(draft.offices[w]||[]).map((o,i) => `
            <div class="contact-edit-row" style="grid-template-columns:1fr auto;">
              <input data-office-input="${esc(w)}:${i}" value="${esc(o)}" placeholder="Označení kanceláře">
              <button class="btn btn-ghost btn-sm" type="button" data-office-remove="${esc(w)}:${i}">Odebrat</button>
            </div>
          `).join('')}
          <button class="btn btn-ghost btn-sm" type="button" data-office-add="${esc(w)}">+ Přidat kancelář</button>
        </div>
      `).join('')}
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('sysurls', 'Adresy systémů')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">U webových aplikací vyplňte adresu (URL) — zobrazí se zaměstnanci jako odkaz. U systémů, které se spouští ikonou z počítače (ne z prohlížeče), přepněte na „Plocha" — adresa se pak nenabízí a zaměstnanci se místo ní zobrazí informace, že se aplikace spouští z plochy.</p>
      ${SYSTEM_URL_KEYS.map(id => {
        const sec = CHECKLIST_SECTIONS.find(s => s.id === id);
        const type = draft.systemTypes[id] || 'web';
        return `<div class="contact-edit-row" style="grid-template-columns:130px 100px 1fr;">
          <label style="font-size:13px;align-self:center;">${esc(sec ? sec.label : id)}</label>
          <select data-systype-input="${id}">
            <option value="web" ${type==='web'?'selected':''}>Web</option>
            <option value="desktop" ${type==='desktop'?'selected':''}>Plocha</option>
          </select>
          <input data-sysurl-input="${id}" value="${esc(draft.systemUrls[id]||'')}" placeholder="https://…" ${type==='desktop'?'disabled':''}>
        </div>`;
      }).join('')}
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('categories', 'Kategorie a přiřazené systémy')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 14px;">Majetek, IT nastavení, Entra ID, Whatspot, Outlook a Školení/BOZP platí pro všechny kategorie automaticky a zde se nedají vypnout.</p>
      ${draft.categories.map((cat, ci) => `
        <div style="border:1px solid var(--line);border-radius:var(--radius);padding:14px;margin-bottom:12px;">
          <div class="field-label-row" style="margin-bottom:10px;">
            <input data-cat-name="${ci}" value="${esc(cat.name)}" placeholder="Název kategorie" style="max-width:220px;font-weight:600;padding:6px 8px;border:1px solid var(--line-strong);border-radius:var(--radius);">
            <button class="btn btn-ghost btn-sm" type="button" data-cat-remove="${ci}">Odebrat kategorii</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;">
            ${conditionalSections.map(sec => `
              <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
                <input type="checkbox" data-cat-system="${ci}:${sec.id}" ${cat.systems.includes(sec.id)?'checked':''}>
                ${esc(sec.label)}
              </label>
            `).join('')}
          </div>
        </div>
      `).join('')}
      <button class="btn btn-ghost btn-sm" type="button" id="btn-cat-add">+ Přidat kategorii</button>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('hrrequired', 'Povinné položky personálního oddělení')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Výchozí stav je „povinné" u všech — odškrtnutím položku z kontroly vyřadíte.</p>
      ${(() => {
        const groups = [
          { key:'krok1', title:'Krok 1 — podmínka pro vygenerování odkazu zaměstnanci', note:'Stejný seznam jako v modálu „Nový nástup" / „Rychlé doplnění" (bez jména a příjmení, ta se hlídají už při založení spisu).' },
          { key:'zbytek', title:'Zbývající údaje — podmínka pro schválení a export do Vemy', note:'Můžou se doplnit později, klidně až po odeslání odkazu zaměstnanci.' },
        ];
        return groups.map(g => {
          const fields = HR_REQUIRABLE_FIELDS.filter(f => f.stage === g.key);
          return `
            <div style="margin-bottom:18px;">
              <label style="font-size:13.5px;font-weight:600;display:block;margin-bottom:2px;">${esc(g.title)}</label>
              <p style="font-size:11.5px;color:var(--ink-faint);margin:0 0 8px;">${esc(g.note)}</p>
              ${fields.map(f => `
                <label style="display:flex;align-items:center;gap:8px;font-size:13px;padding:3px 0;cursor:pointer;">
                  <input type="checkbox" data-hrreq-toggle="${esc(f.fieldId)}" ${draft.hrRequiredOverrides[f.fieldId]===false?'':'checked'}>
                  ${esc(f.label)}
                </label>
              `).join('')}
            </div>
          `;
        }).join('');
      })()}
      ${settingsPanelEnd()}
    </div>

    <button class="btn btn-primary" id="btn-save-settings">Uložit nastavení</button>

    <div class="panel" style="margin-top:28px;border-color:var(--red);">
      <h4 style="font-family:var(--font-display);font-size:1.125rem;margin:0 0 8px;color:var(--red);">Nebezpečná zóna</h4>
      <p style="font-size:13px;color:var(--ink-soft);margin:0 0 12px;">Smaže úplně všechny onboardingové spisy v rejstříku (${state.index.length}) — např. při přegenerování ukázkových dat. Tuto akci nelze vrátit zpět.</p>
      <button class="btn btn-danger" id="btn-delete-all" ${state.index.length===0?'disabled':''}>Smazat všechny spisy</button>

      <hr style="margin:20px 0;border:none;border-top:1px solid var(--line);">

      <p style="font-size:13px;color:var(--ink-soft);margin:0 0 10px;">Resetovat vybranou část nastavení zpět na výchozí hodnoty (nepřepisuje se hned — po výběru zkontrolujte výsledek výše a potvrďte tlačítkem „Uložit nastavení").</p>
      <div class="contact-edit-row" style="grid-template-columns:1fr auto;">
        <select id="settings-reset-select">
          ${SETTINGS_RESET_OPTIONS.map(o => `<option value="${o.key}">${esc(o.label)}</option>`).join('')}
        </select>
        <button class="btn btn-danger" id="btn-settings-reset">Resetovat vybranou sekci</button>
      </div>
    </div>
  `;
}

function sectionFieldsHtml(sec, r, editable){
  const flags = r.fieldFlags || {};
  const hrFlagMode = state.role === 'hr' && sec.owner === 'employee' && !state.previewingEmployee;
  const showFlagInfo = state.role === 'employee';
  const isHrView = state.role === 'hr' && !state.previewingEmployee;
  const activeMissing = isHrView ? currentApproveMissing() : currentSubmitMissing();
  const missingSet = new Set(activeMissing.filter(m => m.sectionId === sec.id).map(m => sec.type === 'repeat' ? `${m.rowIdx}:${m.fieldId}` : m.fieldId));
  if(sec.type === 'repeat'){
    const rows = r.personal[sec.id] || [];
    const flagKey = sec.id;
    const flagged = flagKey in flags;
    let html = '';
    if(hrFlagMode){
      html += `<div class="field-label-row" style="margin-bottom:10px;">
        <button type="button" class="flag-toggle ${flagged?'active':''}" data-flag-toggle="${flagKey}" title="Označit sekci jako problém">⚑ ${flagged ? 'Označeno' : 'Označit sekci'}</button>
      </div>`;
      if(flagged) html += `<input class="flag-note-input" data-flag-note="${flagKey}" placeholder="Co u této sekce chybí nebo je nejasně vyplněné" value="${esc(flags[flagKey]||'')}" style="margin-bottom:10px;">`;
    } else if(showFlagInfo && flagged){
      html += `<div class="field-flag-note" style="margin-bottom:10px;">⚑ Personální: ${esc(flags[flagKey] || 'zkontrolujte prosím tuto sekci')}</div>`;
    }
    if(rows.length === 0) html += `<p class="repeat-empty">Zatím nevyplněno.</p>`;
    rows.forEach((row, i) => {
      html += `<div class="repeat-row ${(showFlagInfo || hrFlagMode) && flagged ? 'flagged':''}"><div class="form-grid">`;
      html += sec.fields.map(f => {
        const pKey = sec.id+':'+i+':'+f.id;
        const pending = state.pendingEdit && state.pendingEdit.key === pKey ? state.pendingEdit : null;
        const rowWithPending = pending ? {...row, [f.id]: pending.newValue} : row;
        const displayVal = pending ? pending.newValue : row[f.id];
        const isMissing = missingSet.has(i+':'+f.id);
        return `<div class="field ${isMissing?'missing':''}"><label>${esc(f.label)}</label>${fieldMarkup(f, displayVal, !editable, 'data-repeat-field', pKey)}
        ${isMissing ? `<div class="field-missing-note">Povinný údaj — nevyplněno</div>` : ''}
        ${validationNoteHtml(f, displayVal, rowWithPending)}
        ${editable ? autofillButtonHtml(f, rowWithPending, 'repeat', pKey) : ''}
        ${pending ? `<div class="pending-save-bar">Uložit „${esc(f.label)}“: <strong>${esc(pending.oldValue||'—')} → ${esc(pending.newValue||'—')}</strong><button type="button" class="btn btn-primary btn-sm" data-pending-confirm>Uložit</button><button type="button" class="btn btn-ghost btn-sm" data-pending-cancel>Zrušit</button></div>` : ''}
        </div>`;
      }).join('');
      html += `</div>`;
      if(editable) html += `<button class="btn btn-ghost btn-sm" type="button" data-repeat-remove="${sec.id}:${i}">Odebrat</button>`;
      html += `</div>`;
    });
    if(editable) html += `<button class="btn btn-ghost btn-sm" type="button" data-repeat-add="${sec.id}">${esc(sec.addLabel || '+ Přidat')}</button>`;
    return html;
  }
  return `<div class="form-grid">${sec.fields.filter(f => !f.showIf || f.showIf(r.personal)).map(fRaw => {
    const f = resolveField(fRaw);
    const flagged = f.id in flags;
    const pending = state.pendingEdit && state.pendingEdit.key === f.id ? state.pendingEdit : null;
    const displayVal = pending ? pending.newValue : r.personal[f.id];
    const ctxWithPending = pending ? {...r.personal, [f.id]: pending.newValue} : r.personal;
    const isMissing = missingSet.has(f.id);
    return `<div class="field ${f.full?'full':''} ${f.essential?'essential':''} ${(showFlagInfo || hrFlagMode) && flagged ? 'flagged':''} ${isMissing?'missing':''}">
      <div class="field-label-row">
        <label>${f.essential?'<span class="essential-dot" title="Podstatný údaj">●</span> ':''}${esc(f.label)}${f.required?' *':''}</label>
        ${hrFlagMode ? `<button type="button" class="flag-toggle ${flagged?'active':''}" data-flag-toggle="${f.id}" title="Označit pole jako problém">⚑ ${flagged ? 'Označeno' : 'Označit'}</button>` : ''}
      </div>
      ${fieldMarkup(f, displayVal, !editable)}
      ${isMissing ? `<div class="field-missing-note">Povinný údaj — nevyplněno</div>` : ''}
      ${validationNoteHtml(f, displayVal, ctxWithPending)}
      ${editable ? autofillButtonHtml(f, ctxWithPending, 'field', f.id) : ''}
      ${pending ? `<div class="pending-save-bar">Uložit změnu: <strong>${esc(pending.oldValue||'—')} → ${esc(pending.newValue||'—')}</strong><button type="button" class="btn btn-primary btn-sm" data-pending-confirm>Uložit</button><button type="button" class="btn btn-ghost btn-sm" data-pending-cancel>Zrušit</button></div>` : ''}
      ${hrFlagMode && flagged ? `<input class="flag-note-input" data-flag-note="${f.id}" placeholder="Co u tohoto pole chybí nebo je nejasně vyplněné" value="${esc(flags[f.id]||'')}">` : ''}
      ${showFlagInfo && flagged ? `<div class="field-flag-note">⚑ Personální: ${esc(flags[f.id] || 'zkontrolujte prosím toto pole')}</div>` : ''}
    </div>`;
  }).join('')}</div>`;
}

const SECTION_RULES = {
  issr(checklist){
    const v = checklist.issr_vedouci && checklist.issr_vedouci.checked;
    const ref = checklist.issr_referent && checklist.issr_referent.checked;
    const p = checklist.issr_prebirani && checklist.issr_prebirani.checked;
    if(v && (ref || p)) return 'Podle pravidel má mít uživatel buď roli Vedoucí, nebo kombinaci Referent + Přebírání dokumentů — ne obojí zároveň.';
    if(!v && ref !== p) return 'Role Referent a Přebírání dokumentů se v ISSŘ přidělují společně.';
    return null;
  },
};

function sectionHasFlag(sec, r){
  const flags = r.fieldFlags || {};
  if(sec.type === 'repeat') return sec.id in flags;
  return sec.fields.some(f => f.id in flags);
}

function sectionHasHardError(sec, r){
  if(sec.type === 'repeat'){
    const rows = r.personal[sec.id] || [];
    return rows.some(row => sec.fields.some(f => {
      const err = runValidation(f, row[f.id], row);
      return err && err.severity === 'error';
    }));
  }
  return sec.fields.filter(f => !f.showIf || f.showIf(r.personal)).some(f => {
    const err = runValidation(f, r.personal[f.id], r.personal);
    return err && err.severity === 'error';
  });
}

function missingRequiredFields(record, includeHr){
  const overrides = (state.settings && state.settings.hrRequiredOverrides) || {};
  const missing = [];
  PERSONAL_SECTIONS.forEach(sec => {
    if(sec.owner === 'hr' && !includeHr) return;
    if(sec.owner !== 'employee' && sec.owner !== 'hr') return;
    if(sec.type === 'repeat'){
      const rows = record.personal[sec.id] || [];
      rows.forEach((row, idx) => {
        sec.fields.forEach(f => {
          if(!f.essential && !f.required) return;
          if(sec.owner === 'hr' && overrides[f.id] === false) return;
          if(f.showIf && !f.showIf(row)) return;
          const val = row[f.id];
          if(val == null || (typeof val === 'string' && val.trim() === '')){
            missing.push({ sectionId: sec.id, section: `${sec.label} (položka ${idx+1})`, fieldId: f.id, rowIdx: idx, label: f.label });
          }
        });
      });
      return;
    }
    sec.fields.forEach(f => {
      if(!f.essential && !f.required) return;
      if(sec.owner === 'hr' && overrides[f.id] === false) return;
      if(f.showIf && !f.showIf(record.personal)) return;
      const val = record.personal[f.id];
      if(val == null || (typeof val === 'string' && val.trim() === '')){
        missing.push({ sectionId: sec.id, section: sec.label, fieldId: f.id, rowIdx: null, label: f.label });
      }
    });
  });
  return missing;
}

function currentSubmitMissing(){
  if(!state.showMissingHighlights || !state.currentRecord) return [];
  return missingRequiredFields(state.currentRecord, false);
}
function currentApproveMissing(){
  if(!state.currentRecord) return [];
  const status = state.currentRecord.personalStatus || 'draft';
  if(status !== 'submitted' && status !== 'returned') return [];
  return missingRequiredFields(state.currentRecord, true);
}

// Krok 1 — základní údaje ze stejného seznamu jako modál "Nový nástup"/"Rychlé doplnění".
// Bez těchto (+ jména a příjmení, která se hlídají už při založení spisu) nejde vygenerovat odkaz pro zaměstnance.
function missingHrRequiredFields(record){
  const overrides = (state.settings && state.settings.hrRequiredOverrides) || {};
  const missing = [];
  PERSONAL_SECTIONS.forEach(sec => {
    if(sec.owner !== 'hr') return;
    if(sec.type === 'repeat') return;
    sec.fields.forEach(f => {
      if(!KROK1_HR_FIELD_IDS.includes(f.id)) return;
      if(!f.essential && !f.required) return;
      if(overrides[f.id] === false) return;
      if(f.showIf && !f.showIf(record.personal)) return;
      const val = record.personal[f.id];
      if(val == null || (typeof val === 'string' && val.trim() === '')){
        missing.push({ sectionId: sec.id, section: sec.label, fieldId: f.id, label: f.label });
      }
    });
  });
  return missing;
}

const STATUS_LABEL = { draft:'Zaměstnanec ještě nevyplnil / neodeslal', submitted:'Čeká na kontrolu personálním oddělením', returned:'Vráceno zaměstnanci k doplnění', reviewed:'Zkontrolováno a schváleno' };

function renderHrStatusPanel(r){
  const status = r.personalStatus || 'draft';
  const statusLabel = status === 'draft' ? draftStageInfo(missingHrRequiredFields(r).length, r.linkGeneratedAt).label : STATUS_LABEL[status];
  const flagCount = Object.keys(r.fieldFlags||{}).length;
  let html = `<div class="review-row ${status==='reviewed'?'done':''}">
    <span>Stav: <strong>${esc(statusLabel)}</strong></span>
  </div>`;
  html += `<div class="review-row" style="margin-top:-6px;">
    <span style="font-size:12.5px;color:var(--ink-faint);">Souhlas se zpracováním osobních údajů: ${r.consentGiven ? `<strong style="color:var(--ink-soft);">uděleno</strong> ${esc(new Date(r.consentAt).toLocaleString('cs-CZ',{dateStyle:'short',timeStyle:'short'}))}` : '<strong style="color:var(--red);">zatím neuděleno</strong>'}</span>
  </div>`;
  html += `<div class="hr-status-actions">`;
  if(status === 'submitted' || status === 'returned'){
    html += `<button class="btn btn-primary btn-sm" id="btn-approve">Schválit údaje</button>`;
  }
  if(status !== 'draft'){
    html += `<button class="btn btn-ghost btn-sm" id="btn-return">Vrátit zaměstnanci k doplnění${flagCount? ' ('+flagCount+')':''}</button>`;
    html += `<button class="btn btn-ghost btn-sm" id="btn-copy-return-message">${state.returnMsgCopied ? 'Zkopírováno ✓' : 'Zkopírovat zprávu pro zaměstnance'}</button>`;
  }
  html += `</div>`;
  if(status === 'returned' && r.returnNote){
    html += `<div class="readonly-note">Poslední vzkaz zaměstnanci: „${esc(r.returnNote)}"</div>`;
  }
  const approveMissing = currentApproveMissing();
  if(approveMissing.length > 0){
    const incompleteSectionNames = [...new Set(approveMissing.map(m => m.section.replace(/ \(položka \d+\)$/,'')))];
    html += `<div class="return-banner"><strong>Než půjde schválit, doplňte prosím povinné/podstatné údaje (${approveMissing.length}) v těchto sekcích:</strong> ${incompleteSectionNames.map(esc).join(', ')}. Chybějící pole jsou červeně označená přímo níže.</div>`;
  }
  html += `<p style="font-size:12.5px;color:var(--ink-faint);margin-top:-6px;margin-bottom:18px;">Chybějící nebo nejasně vyplněné položky označte vlajkou ⚑ u konkrétního pole (nebo sekce) níže — zaměstnanec je pak uvidí zvýrazněné i s vaší poznámkou.</p>`;
  return html;
}

function yesNoMark(val, yes, no){
  if(val === yes) return `<strong>${esc(yes)}</strong> / ${esc(no)}`;
  if(val === no) return `${esc(yes)} / <strong>${esc(no)}</strong>`;
  return `${esc(yes)} / ${esc(no)}`;
}

function buildDocAHtml(r){
  const p = r.personal;
  const detiRows = (p.deti || []).map(d => `
    <tr>
      <td>${esc(d.jmeno||'')} ${esc(d.prijmeni||'')}</td>
      <td>${esc(formatDate(d.datum_narozeni))||''}</td>
      <td>${esc(d.rodne_cislo||'')}</td>
      <td>${esc(d.bydliste||'')}</td>
    </tr>`).join('') || `<tr><td colspan="4" style="color:var(--ink-faint);">Neuvedeno</td></tr>`;
  return `
    <div class="print-doc">
      <h3 style="text-align:center;">Osobní dotazník</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:4px 0;width:50%;"><strong>Titul, jméno, příjmení, titul:</strong> ${esc(p.titul_pred)} ${esc(p.jmeno)} ${esc(p.prijmeni)} ${esc(p.titul_za)}</td>
        <td style="padding:4px 0;"><strong>Osobní číslo (vyplní personální odbor):</strong> ${esc(p.osobni_cislo || '…………')}</td></tr>
        <tr><td colspan="2" style="padding:4px 0;"><strong>Rodné příjmení:</strong> ${esc(p.rodne_prijmeni) || '—'}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Datum narození:</strong> ${esc(formatDate(p.datum_narozeni))}</td>
        <td style="padding:4px 0;"><strong>Místo narození:</strong> ${esc(p.misto_narozeni)}${p.okres_narozeni?`, okres ${esc(p.okres_narozeni)}`:''}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Státní občanství:</strong> ${esc(p.statni_prislusnost)}</td>
        <td style="padding:4px 0;"><strong>Rodinný stav:</strong> ${esc(p.rodinny_stav) || '—'}</td></tr>
        <tr><td colspan="2" style="padding:4px 0;"><strong>Rodné číslo:</strong> ${esc(p.rodne_cislo)}</td></tr>
        <tr><td colspan="2" style="padding:4px 0;"><strong>Trvalý pobyt:</strong> ${esc(p.trvale_ulice)} ${esc(p.trvale_cp)}${p.trvale_co?`/${esc(p.trvale_co)}`:''}, ${esc(p.trvale_psc)} ${esc(p.trvale_obec)}${p.kraj?`, kraj ${esc(p.kraj)}`:''}, ${esc(p.trvale_stat)}</td></tr>
        <tr><td colspan="2" style="padding:4px 0;"><strong>Kontaktní adresa (liší-li se):</strong> ${esc(p.dorucovaci_adresa) || '—'}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Telefon:</strong> ${esc(p.telefon_soukromy)}</td>
        <td style="padding:4px 0;"><strong>E-mail:</strong> ${esc(p.email_soukromy)}</td></tr>
        <tr><td colspan="2" style="padding:4px 0;"><strong>Kontaktní osoba pro mimořádnou událost:</strong> ${esc(p.nouzovy_kontakt_jmeno) || '—'}${p.nouzovy_kontakt_telefon?`, tel. ${esc(p.nouzovy_kontakt_telefon)}`:''}${p.nouzovy_kontakt_adresa?`, ${esc(p.nouzovy_kontakt_adresa)}`:''}</td></tr>
      </table>

      <p style="font-weight:600;margin-top:16px;">Rodinní příslušníci</p>
      <p><strong>Manžel(ka), druh, družka:</strong> ${esc(p.jmeno_manzela) || ''} ${esc(p.prijmeni_manzela) || ''}${!p.jmeno_manzela && !p.prijmeni_manzela ? '—' : ''}</p>
      <p><strong>Datum narození:</strong> ${esc(formatDate(p.datum_narozeni_manzela)) || '—'} &nbsp; <strong>Státní občanství:</strong> ${esc(p.statni_obcanstvi_manzela) || '—'} &nbsp; <strong>Bydliště:</strong> ${esc(p.bydliste_manzela) || '—'}</p>
      <p style="font-weight:600;margin-top:10px;">Děti</p>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
        <thead><tr>
          <th style="border:1px solid #999;padding:4px;">Jméno a příjmení</th>
          <th style="border:1px solid #999;padding:4px;">Datum narození</th>
          <th style="border:1px solid #999;padding:4px;">Rodné číslo</th>
          <th style="border:1px solid #999;padding:4px;">Bydliště (nezaopatřené)</th>
        </tr></thead>
        <tbody>${detiRows.replace(/<td>/g, '<td style="border:1px solid #999;padding:4px;">')}</tbody>
      </table>

      <p style="font-weight:600;margin-top:16px;">Vzdělání</p>
      <p><strong>Stav:</strong> ${esc(p.stav_vzdelani) || '—'} &nbsp; <strong>Stupeň:</strong> ${esc(p.stupen_vzdelani) || '—'}</p>
      <p><strong>Škola a obor:</strong> ${esc(p.skola) || ''}${p.obor?`, ${esc(p.obor)}`:''}${p.sidlo_skoly?` (${esc(p.sidlo_skoly)})`:''}</p>
      <p><strong>Rok ukončení:</strong> ${esc(p.rok_ukonceni) || '—'} &nbsp; <strong>Druh zkoušky:</strong> ${esc(p.druh_zkousky) || '—'}</p>

      <p style="font-weight:600;margin-top:16px;">Další údaje</p>
      <p><strong>Přiznaný důchod:</strong> ${yesNoMark(p.duchod, 'ANO', 'NE')}${p.duchod === 'Ano' && p.duchod_detail ? ` — ${esc(p.duchod_detail)}` : ''}</p>
      <p><strong>Zdravotní znevýhodnění:</strong> ${p.zdrav_postizeni_ozp && p.zdrav_postizeni_ozp !== 'Ne' ? esc(p.zdrav_postizeni_ozp) : 'Ne'}${p.prukaz_zdravotni && p.prukaz_zdravotni !== 'Nemám' ? `, ${esc(p.prukaz_zdravotni)}` : ''}</p>
      <p><strong>Je proti Vám vedeno soudní řízení:</strong> ${yesNoMark(p.soudni_rizeni, 'ANO', 'NE')}${p.soudni_srazky ? ` — srážky: ${esc(p.soudni_srazky)}` : ''}</p>
      <p><strong>Zdravotní pojišťovna:</strong> ${esc(p.zdravotni_pojistovna) || '—'} <span style="color:var(--ink-faint);">(doložit kopii ZP)</span></p>

      <p style="margin-top:20px;">Prohlašuji, že všechny mnou uvedené údaje jsou pravdivé a nic jsem nezamlčel(a). Dále se zavazuji všechny změny těchto údajů bezodkladně oznamovat personálnímu oddělení.</p>
      <p style="margin-top:30px;">V ……………………………… dne ………………………………</p>
      <p style="margin-top:30px;">Podpis: ………………………………</p>
    </div>
  `;
}

function buildDocCHtml(r){
  const p = r.personal;
  return `
    <div class="print-doc">
      <h3 style="text-align:center;">Souhlas</h3>
      <p style="text-align:center;font-weight:600;">s bezhotovostním zasíláním platu, cestovních náhrad a peněžitého příspěvku na stravování za kalendářní měsíc na osobní účet</p>
      <p><strong>Jméno a příjmení zaměstnance:</strong> ${esc(p.jmeno)} ${esc(p.prijmeni)}</p>
      <p><strong>Osobní číslo zaměstnance:</strong> ${esc(p.osobni_cislo || '…………')}</p>
      <p>Tímto vyjadřuji a svým podpisem níže stvrzuji svůj souhlas s:</p>
      <ol>
        <li>bezhotovostním zasíláním svého platu na (níže uvedený) osobní účet, ${yesNoMark(p.souhlas_plat_ucet, 'ANO', 'NE')}</li>
        <li>bezhotovostním zasíláním cestovních náhrad na (níže uvedený) osobní účet, a to jedenkrát měsíčně ve výplatním termínu společně s výplatou platu, souhrnnou částkou zahrnující všechny cestovní náhrady zúčtované v předcházejícím kalendářním měsíci. Dále prohlašuji, že jsem se se zaměstnavatelem dohodl/a a souhlasím s tím, že předložím zaměstnavateli písemné doklady potřebné k vyúčtování cestovních náhrad a vrátím případnou nevyúčtovanou zálohu po skončení pracovní/služební cesty, a to i tehdy, je-li tento termín kratší, než stanoví § 183 odst. 3 zákona č. 262/2006 Sb., Zákoník práce, ${yesNoMark(p.souhlas_cestovni_nahrady, 'ANO', 'NE')}</li>
        <li>bezhotovostním zasíláním peněžitého příspěvku na stravování na (níže uvedený) osobní účet, a to jedenkrát měsíčně ve výplatním termínu společně s výplatou platu, ${yesNoMark(p.souhlas_stravovani, 'ANO', 'NE')}</li>
      </ol>
      <p>Plat, cestovní náhrady a peněžitý příspěvek na stravování poukazujte na tento účet:</p>
      <p style="font-family:var(--font-mono);font-size:15px;">${esc(p.cislo_uctu || '……………………')}/${esc(p.kod_banky || '….')}</p>
      <p style="margin-top:40px;">V ……………………………… dne ………………………………</p>
      <p style="margin-top:30px;">podpis zaměstnance: ………………………………</p>
    </div>
  `;
}

function buildDocBHtml(r){
  const p = r.personal;
  const praxeRows = (p.praxe || []).map(x => `
    <tr>
      <td>${esc(x.organizace||'')}${x.sidlo?`, ${esc(x.sidlo)}`:''}</td>
      <td>${esc(x.pracovni_zarazeni||'')}</td>
      <td>${esc(formatDate(x.od))||''}</td>
      <td>${esc(formatDate(x.do))||''}</td>
    </tr>`).join('') || `<tr><td colspan="4" style="color:var(--ink-faint);">Neuvedeno</td></tr>`;
  const jazykyRows = (p.jazyky || []).map(x => `
    <tr>
      <td>${esc(x.jazyk||'')}</td>
      <td>${esc(x.stupen_znalosti||'')}</td>
      <td>${esc(x.stupen_osvedceni||'')}</td>
      <td>${esc(x.pouzivani||'')}</td>
    </tr>`).join('') || `<tr><td colspan="4" style="color:var(--ink-faint);">Neuvedeno</td></tr>`;
  return `
    <div class="print-doc">
      <p>Já, <strong>${esc(p.jmeno)} ${esc(p.prijmeni)}</strong>, níže podepsaný/á, prohlašuji a potvrzuji svým vlastnoručním podpisem, že veškeré uvedené údaje jsou pravdivé a úplné. Jsem si vědom/a možných dopadů a důsledků (zejména přeřazení do nižšího platového stupně a pracovně právních postihů podle příslušných ustanovení zákoníku práce a zákona o státní službě) v případě, že mnou uváděné údaje budou shledány nepravdivými.</p>
      <p style="font-weight:600;margin-top:16px;">Přehled průběhu předchozích zaměstnání, vojenské služby, mateřské dovolené, úřadu práce apod.</p>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
        <thead><tr>
          <th style="border:1px solid #999;padding:4px;">Organizace</th>
          <th style="border:1px solid #999;padding:4px;">Pracovní zařazení / vykonávaná činnost</th>
          <th style="border:1px solid #999;padding:4px;">Od</th>
          <th style="border:1px solid #999;padding:4px;">Do</th>
        </tr></thead>
        <tbody>${praxeRows.replace(/<td>/g, '<td style="border:1px solid #999;padding:4px;">')}</tbody>
      </table>
      <p style="margin-top:16px;">V minulosti jsem již byl/a ve služebním poměru: ${yesNoMark(p.sluzebni_pomer_drive, 'ANO', 'NE')}</p>
      <p>Členství v řídících a kontrolních orgánech právnických osob provozujících podnikatelskou činnost: ${yesNoMark(p.clenstvi_organy, 'ANO', 'NE')}</p>
      <p>Podnikatelská nebo výdělečná činnost vyžadující předchozí souhlas zaměstnavatele: ${yesNoMark(p.vydelecna_cinnost_souhlas, 'ANO', 'NE')}</p>
      <p><strong>Kurzy, specifické odborné znalosti a dovednosti:</strong> ${esc(p.kurzy_dovednosti) || '…………………………………'}</p>
      <p style="font-weight:600;margin-top:16px;">Jazykové znalosti</p>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
        <thead><tr>
          <th style="border:1px solid #999;padding:4px;">Jazyk</th>
          <th style="border:1px solid #999;padding:4px;">Stupeň znalosti</th>
          <th style="border:1px solid #999;padding:4px;">Stupeň osvědčení</th>
          <th style="border:1px solid #999;padding:4px;">Používání</th>
        </tr></thead>
        <tbody>${jazykyRows.replace(/<td>/g, '<td style="border:1px solid #999;padding:4px;">')}</tbody>
      </table>
      <p style="margin-top:40px;">V ……………………………… dne ………………………………</p>
      <p style="margin-top:30px;">podpis: ………………………………</p>
    </div>
  `;
}

function renderImportMappingPage(){
  const cur = state.importCurrent;
  if(!cur) return `<p>Není co mapovat.</p>`;
  const previewRows = cur.rows.slice(0, 3);
  return `
    <div class="no-print" style="margin-bottom:16px;">
      <button class="btn btn-ghost btn-sm" id="btn-import-cancel">← Zrušit vytěžování</button>
    </div>
    <h2 style="font-family:var(--font-display);font-size:1.4rem;margin:0 0 6px;">Vytěžení podkladů — ${esc(cur.fileName)}</h2>
    <p style="font-size:13px;color:var(--ink-soft);margin:0 0 16px;">Nalezeno ${cur.rows.length} řádků. Zkontrolujte prosím u každého sloupce, na jaký údaj se má namapovat — appka to zkusila odhadnout sama, ale stojí za to to zkontrolovat, hlavně u sloupců, které nešly jednoznačně rozpoznat.</p>

    ${cur.groupColIdx == null ? `
    <div class="panel" style="margin-bottom:16px;">
      <h4 style="font-family:var(--font-display);font-size:1.125rem;margin:0 0 4px;">Společné hodnoty pro celý soubor</h4>
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Nepovinné. Tabulky bývají za jednotlivá pracoviště, takže třeba pracoviště nebo datum nástupu bude stejné pro všechny řádky — vyplňte to tady místo v tabulce sloupec po sloupci. Pokud níže zároveň namapujete i sloupec z tabulky pro stejný údaj, hodnota ze sloupce má přednost.</p>
      <div class="form-grid">
        ${IMPORT_COMMON_FIELDS.map(f => `
          <div class="field">
            <label>${esc(f.label)}</label>
            ${f.type === 'select'
              ? `<select data-import-common="${f.key}">${f.options().map(o => `<option value="${esc(o)}" ${(cur.common[f.key]||'')===o?'selected':''}>${esc(o || '— nevyplněno —')}</option>`).join('')}</select>`
              : `<input type="date" data-import-common="${f.key}" value="${esc(cur.common[f.key]||'')}">`
            }
          </div>
        `).join('')}
      </div>
    </div>
    ` : (() => {
      const groupCounts = {};
      cur.rows.forEach(row => { const g = row[cur.groupColIdx] || '(bez původu)'; groupCounts[g] = (groupCounts[g]||0)+1; });
      const groups = Object.keys(groupCounts).sort();
      return `
      <div class="panel" style="margin-bottom:16px;">
        ${settingsPanelStart('import-group-common', 'Společné hodnoty podle původu')}
        <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 14px;">Nepovinné. Soubor obsahuje lidi z více původních útvarů/úřadů — u každého jde nastavit vlastní společné hodnoty (např. typ nástupu se může lišit podle toho, odkud kdo přechází). Pokud níže zároveň namapujete i sloupec z tabulky pro stejný údaj, hodnota ze sloupce má přednost.</p>
        ${groups.map(g => `
          <div style="margin-bottom:18px;border-top:1px solid var(--line);padding-top:12px;">
            <label style="font-size:13.5px;font-weight:600;display:block;margin-bottom:8px;">${esc(g)} <span style="font-weight:400;color:var(--ink-faint);">(${groupCounts[g]} ${groupCounts[g]===1?'osoba':groupCounts[g]<5?'osoby':'osob'})</span></label>
            <div class="form-grid">
              ${IMPORT_COMMON_FIELDS.map(f => {
                const val = (cur.groupCommon[g] && cur.groupCommon[g][f.key]) || '';
                return `
                <div class="field">
                  <label>${esc(f.label)}</label>
                  ${f.type === 'select'
                    ? `<select data-import-group-common="${esc(g)}:${f.key}">${f.options().map(o => `<option value="${esc(o)}" ${val===o?'selected':''}>${esc(o || '— nevyplněno —')}</option>`).join('')}</select>`
                    : `<input type="date" data-import-group-common="${esc(g)}:${f.key}" value="${esc(val)}">`
                  }
                </div>
              `;}).join('')}
            </div>
          </div>
        `).join('')}
        ${settingsPanelEnd()}
      </div>
      `;
    })()}

    <div class="panel" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid var(--line-strong);">Sloupec v souboru</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid var(--line-strong);">Ukázka hodnoty</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid var(--line-strong);">Namapovat na</th>
        </tr></thead>
        <tbody>
          ${cur.headers.map((h,i) => `
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid var(--line);font-weight:600;">${esc(h || '(bez názvu)')}</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--line);color:var(--ink-faint);">${previewRows.map(r => esc(r[i]==null?'—':String(r[i]))).join(' · ')}</td>
              <td style="padding:6px 8px;border-bottom:1px solid var(--line);">
                <select data-import-map="${i}">
                  ${IMPORT_FIELD_TARGETS.map(t => `<option value="${t.key}" ${cur.mapping[i]===t.key?'selected':''}>${esc(t.label)}</option>`).join('')}
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:16px;">
      <button class="btn btn-primary" id="btn-import-confirm">Vytěžit a založit ${cur.rows.length} nástupů</button>
    </div>
    ${state.importQueue.length > 0 ? `<p style="font-size:12.5px;color:var(--ink-faint);margin-top:10px;">Po dokončení bude následovat další soubor: ${esc(state.importQueue[0].fileName)} (${state.importQueue.length > 1 ? `a další ${state.importQueue.length-1}` : ''})</p>` : ''}
  `;
}


function renderPrintDocsPage(){
  const r = state.currentRecord;
  const assignedEmail = r.checklist.email && r.checklist.email.value;
  return `
    <div class="no-print" style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <button class="btn btn-ghost btn-sm" id="btn-back-print-docs">← Zpět na spis</button>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost btn-sm" id="btn-email-docs" ${assignedEmail ? '' : 'disabled title="Zaměstnanec zatím nemá přidělený e-mail (viz IT a přístupy → Entra ID)"'}>Odeslat e-mailem${assignedEmail ? ` (${esc(assignedEmail)})` : ''}</button>
        <button class="btn btn-primary btn-sm" id="btn-print-docs">Tisk / Uložit jako PDF</button>
      </div>
    </div>
    <p class="no-print" style="font-size:12.5px;color:var(--ink-soft);margin-bottom:16px;">Podklady jsou předvyplněné z údajů zadaných ve formuláři — před podpisem je prosím zkontrolujte. Nahrazují ruční přepisování do samostatných dokumentů A, B a C, podpis (vlastnoruční nebo elektronický) je pořád potřeba zajistit mimo tuto aplikaci. „Odeslat e-mailem" otevře váš e-mailový klient s předvyplněným příjemcem — přílohu (uložené PDF) je potřeba připojit ručně, prohlížeče to automaticky neumí.</p>
    <div class="panel print-page">
      <h4>A — Osobní dotazník</h4>
      ${buildDocAHtml(r)}
    </div>
    <div class="panel print-page" style="margin-top:20px;">
      <h4>B — Prohlášení o průběhu předchozích zaměstnání a činností</h4>
      ${buildDocBHtml(r)}
    </div>
    <div class="panel print-page" style="margin-top:20px;">
      <h4>C — Souhlas se zasíláním platu na osobní účet</h4>
      ${buildDocCHtml(r)}
    </div>
  `;
}

function renderPersonalForm(r){
  const role = state.role;
  let out = '';
  if(role === 'hr'){
    out += renderHrStatusPanel(r);
    const isReviewed = (r.personalStatus || 'draft') === 'reviewed';
    out += `<div style="margin-bottom:16px;">
      <button class="btn btn-ghost btn-sm" id="btn-generate-print-docs" ${isReviewed ? '' : 'disabled title="Nejdřív schvalte údaje (tlačítko Schválit údaje výše)"'}>Vygenerovat podklady k podpisu (A, B, C) →</button>
      ${!isReviewed ? '<p style="font-size:12px;color:var(--ink-faint);margin:4px 0 0;">Dostupné až po schválení údajů.</p>' : ''}
    </div>`;
    out += `<div class="owner-legend">
      <span class="owner-legend-item"><span class="owner-swatch owner-swatch-employee"></span>Vyplňuje zaměstnanec</span>
      <span class="owner-legend-item"><span class="owner-swatch owner-swatch-hr"></span>Vyplňuje personální oddělení</span>
    </div>`;
  }
  const approveMissingSections = new Set(currentApproveMissing().map(m => m.sectionId));
  PERSONAL_SECTIONS.forEach(sec => {
    out += `
    <div class="form-section form-section-${sec.owner}">
      <h4 class="${approveMissingSections.has(sec.id)?'section-incomplete':''}">${esc(sec.label)}${sec.optional?' <span class="section-optional-tag">doplňkové</span>':''}<span class="owner-tag">${sec.owner==='hr' ? 'vyplňuje personální' : 'vyplňuje zaměstnanec'}</span></h4>
      ${sectionFieldsHtml(sec, r, true)}
    </div>`;
  });
  return out;
}

function wizardFinishButton(r){
  const status = r.personalStatus || 'draft';
  if(status === 'submitted') return `<button class="btn btn-ghost" disabled>Odesláno, čeká na kontrolu</button> <button class="btn btn-ghost btn-sm" data-wizard="withdraw">Stáhnout zpět a opravit</button>`;
  if(status === 'reviewed') return `<button class="btn btn-ghost" disabled>Zkontrolováno ✓</button>`;
  const label = status === 'returned' ? 'Odeslat opravená data znovu' : 'Odeslat personálnímu oddělení';
  return `<button class="btn btn-primary" data-wizard="finish">${label}</button>`;
}

function renderPersonalWizard(r){
  const steps = PERSONAL_SECTIONS.filter(s => s.owner === 'employee');
  const total = steps.length + 1;
  const idx = Math.max(0, Math.min(state.wizardStep, total-1));
  const status = r.personalStatus || 'draft';
  const canEdit = status === 'draft' || status === 'returned';
  const submitMissing = currentSubmitMissing();
  const missingBySection = new Set(submitMissing.map(m => m.sectionId));
  const breadcrumb = steps.map((sec,i) => `<span class="crumb ${i===idx?'active':''} ${sectionHasFlag(sec,r)?'flagged':''} ${missingBySection.has(sec.id)?'incomplete':''}" data-wizard-goto="${i}">${i+1}. ${esc(sec.navLabel||sec.label)}</span>`)
    .concat([`<span class="crumb ${idx===steps.length?'active':''} ${missingBySection.size>0?'incomplete':''}" data-wizard-goto="${steps.length}">${steps.length+1}. Souhrn</span>`])
    .join('<span class="crumb-sep">›</span>');
  let body, title, sectionOptional = false;
  if(idx < steps.length){
    const sec = steps[idx];
    title = sec.label;
    sectionOptional = !!sec.optional;
    body = sectionFieldsHtml(sec, r, canEdit);
  } else {
    title = 'Souhrn';
    const hrSec = PERSONAL_SECTIONS.find(s => s.owner === 'hr');
    body = `<div class="info-box">${hrSec.fields.map(f => `<div class="context-item"><span>${esc(f.label)}</span>${f.type==='date' ? (esc(formatDate(r.personal[f.id])) || '—') : esc(r.personal[f.id] || '—')}</div>`).join('')}</div>`;
    if(status === 'reviewed'){
      body += `<div class="wizard-review-msg">Vaše údaje personální oddělení již zkontrolovalo a schválilo.</div>`;
    } else if(status === 'submitted'){
      body += `<div class="wizard-pending-msg">Děkujeme, vaše údaje jsme odeslali personálnímu oddělení ke kontrole.</div>`;
    } else if(status === 'returned'){
      body += `<div class="return-banner"><strong>Personální oddělení vás žádá o doplnění.</strong>${r.returnNote ? esc(r.returnNote) : 'Zkontrolujte prosím zvýrazněná pole v jednotlivých krocích.'}</div>`;
    } else {
      body += `<div class="wizard-pending-msg">Až budete mít vše vyplněné, potvrďte tlačítkem níže — údaje odešlete personálnímu oddělení ke kontrole.</div>`;
    }
    if(submitMissing.length > 0){
      const incompleteStepNames = [...new Set(submitMissing.map(m => {
        const s = steps.find(s => s.id === m.sectionId);
        return s ? (s.navLabel || s.label) : m.section;
      }))];
      body += `<div class="return-banner"><strong>Než budete moct odeslat, doplňte prosím podstatné údaje (${submitMissing.length}) v těchto krocích:</strong> ${incompleteStepNames.map(esc).join(', ')}. Chybějící pole jsou červeně označená přímo v daném kroku i v navigaci nahoře.</div>`;
    }
  }
  const returnBanner = (status === 'returned' && idx < steps.length)
    ? `<div class="return-banner"><strong>Personální oddělení vás žádá o doplnění.</strong>${r.returnNote ? esc(r.returnNote) : 'Zkontrolujte prosím zvýrazněná pole níže.'}</div>`
    : '';
  const stepErrorBanner = (state.wizardStepError && idx < steps.length)
    ? `<div class="return-banner"><strong>Než budete pokračovat, opravte prosím zvýrazněné údaje.</strong></div>`
    : '';
  const saveStatusHtml = (canEdit && state.saveStatus === 'saved' && state.saveStatusAt)
    ? `<div class="save-status">✓ Uloženo ${new Date(state.saveStatusAt).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})} — klidně formulář zavřete, rozdělané se nic neztratí</div>`
    : '';
  return `
    ${returnBanner}
    ${stepErrorBanner}
    <div class="wizard-breadcrumb">${breadcrumb}</div>
    <div class="wizard-step-title" style="margin:0 0 4px;">Krok ${idx+1}/${total} · ${esc(title)}${sectionOptional?' <span class="section-optional-tag">doplňkové</span>':''}</div>
    ${idx===0 && canEdit ? `<p style="font-size:12px;color:var(--ink-faint);margin:0 0 14px;"><span class="essential-dot" style="font-size:11px;">●</span> = podstatný údaj — bez něj se dotazník neobejde, zbytek je doplňkový.</p>` : ''}
    ${saveStatusHtml}
    ${body}
    <div class="wizard-nav">
      ${idx>0 ? `<button class="btn btn-ghost" data-wizard="prev">Zpět</button>` : '<span></span>'}
      ${idx<total-1 ? `<button class="btn btn-primary" data-wizard="next">Pokračovat</button>` : wizardFinishButton(r)}
    </div>
  `;
}

function renderChecklist(r, pct, complete, tab){
  const role = state.role;
  const category = r.personal.kategorie;
  const sections = checklistSectionsForCategory(category, tab);
  const categoryNote = tab === 'it'
    ? (category
      ? `<p style="font-size:12.5px;color:var(--ink-faint);margin:-14px 0 18px;">Zobrazeny jsou systémy pro kategorii <strong>${esc(category)}</strong>.</p>`
      : `<p style="font-size:12.5px;color:var(--bronze-dark);background:var(--bronze-tint);border-radius:var(--radius);padding:8px 12px;margin:-6px 0 18px;">Personální oddělení zatím nevyplnilo kategorii zaměstnance (sekce Pracovní poměr) — zobrazeny jsou proto všechny systémy.</p>`)
    : '';
  let assignRow = '';
  if(tab === 'it'){
    const admins = adminList();
    assignRow = admins.length ? `
      <div class="field-label-row" style="background:var(--paper-alt);border-radius:var(--radius);padding:10px 14px;margin-bottom:16px;">
        <label style="font-size:13px;font-weight:500;">Přiřazeno administrátorovi</label>
        <select id="assign-admin-select">
          <option value="">— nepřiřazeno —</option>
          ${admins.map(a => `<option value="${esc(a)}" ${r.assignedAdmin===a?'selected':''}>${esc(a)}</option>`).join('')}
        </select>
      </div>
    ` : '';
  } else if(tab === 'provoz'){
    const offices = officesForWorkplace(r.personal.pracoviste);
    const staff = facilityStaffList();
    assignRow = `
      <div style="background:var(--paper-alt);border-radius:var(--radius);padding:10px 14px;margin-bottom:16px;display:flex;flex-direction:column;gap:10px;">
        <div class="field-label-row">
          <label style="font-size:13px;font-weight:500;">Kancelář${r.personal.pracoviste ? ` (${esc(r.personal.pracoviste)})` : ''}</label>
          <select id="assign-office-select" ${offices.length===0?'disabled':''}>
            <option value="">${offices.length===0 ? '— nejdřív vyplňte pracoviště / definujte kanceláře —' : '— nepřiřazeno —'}</option>
            ${offices.map(o => `<option value="${esc(o)}" ${r.assignedOffice===o?'selected':''}>${esc(o)}</option>`).join('')}
          </select>
        </div>
        <div class="field-label-row">
          <label style="font-size:13px;font-weight:500;">Přiřazeno pracovníkovi provozu</label>
          <select id="assign-facility-select" ${staff.length===0?'disabled':''}>
            <option value="">${staff.length===0 ? '— nejdřív přidejte pracovníky v Nastavení —' : '— nepřiřazeno —'}</option>
            ${staff.map(a => `<option value="${esc(a)}" ${r.assignedFacilityStaff===a?'selected':''}>${esc(a)}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
  }
  return `
    ${assignRow}
    <div class="progress-row">
      <div class="progress-track"><div class="progress-fill ${complete?'complete':''}" style="width:${pct}%"></div></div>
      <div class="progress-label">${pct}% dokončeno</div>
    </div>
    ${categoryNote}
    ${sections.map(sec => {
      const items = sec.items;
      const editable = sec.owner === role || role === 'hr' && sec.owner==='hr';
      const locked = role !== 'hr' && sec.owner !== role;
      const doneCount = items.filter(it => r.checklist[it.id] && r.checklist[it.id].checked).length;
      const collapsedCls = state.collapsed[sec.id] ? 'collapsed' : '';
      const ruleFn = SECTION_RULES[sec.id];
      const ruleMsg = ruleFn ? ruleFn(r.checklist) : null;
      return `
      <div class="checklist-section ${locked?'locked':''}">
        <div class="checklist-section-head" data-toggle-section="${sec.id}">
          <h4>${esc(sec.label)}${role==='hr' ? `<span class="owner-tag">${OWNER_LABEL[sec.owner]}</span>` : ''}</h4>
          <span class="checklist-section-count">${doneCount}/${items.length}</span>
        </div>
        <div class="checklist-body ${collapsedCls}">
          ${ruleMsg ? `<div class="check-item-hint" style="background:var(--bronze-tint);color:var(--bronze-dark);padding:8px 10px;border-radius:var(--radius);margin:8px 0;font-style:normal;">⚠ ${esc(ruleMsg)}</div>` : ''}
          ${items.map(it => {
            const st = r.checklist[it.id] || {checked:false, note:'', value:''};
            const dis = !editable;
            const noteOpen = (state.openItemNotes && state.openItemNotes[it.id]) || !!st.note;
            return `
            <div class="check-item ${st.checked?'checked':''}">
              <input type="checkbox" data-check="${it.id}" ${st.checked?'checked':''} ${dis?'disabled':''}>
              <div style="flex:1;">
                <div class="check-item-label">${esc(it.label)}</div>
                ${it.hint ? `<div class="check-item-hint">${esc(it.hint)}</div>` : ''}
                ${it.type==='check_value' ? `<input class="check-item-value" data-value="${it.id}" placeholder="${esc(it.valueLabel)}" value="${esc(st.value)}" ${dis?'disabled':''}>` : ''}
                ${editable ? `<button type="button" class="flag-toggle ${st.note?'active':''}" data-item-note-toggle="${it.id}" style="margin-top:6px;">📝 ${st.note ? 'Poznámka' : '+ Poznámka'}</button>` : (st.note ? `<div class="check-item-hint">📝 ${esc(st.note)}</div>` : '')}
                ${editable && noteOpen ? `<textarea class="flag-note-input" data-item-note-input="${it.id}" placeholder="Interní poznámka pro administrátory (např. co je rozdělané)" style="margin-top:6px;min-height:44px;">${esc(st.note||'')}</textarea>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}
  `;
}

function attachHandlers(){
  const app = document.getElementById('app');

  app.querySelectorAll('[data-role]').forEach(el => {
    el.addEventListener('click', () => { state.role = el.getAttribute('data-role'); state.view='list'; state.colFilters = {pozice:'', pracoviste:'', personal:'', it:'', assigned:''}; render(); });
  });

  const newBtn = document.getElementById('btn-new');
  if(newBtn) newBtn.addEventListener('click', openNewModal);

  const openSettingsBtn = document.getElementById('btn-open-settings');
  if(openSettingsBtn) openSettingsBtn.addEventListener('click', () => { state.view = 'settings'; state.settingsDraft = null; render(); });
  const backSettingsBtn = document.getElementById('btn-back-settings');
  if(backSettingsBtn) backSettingsBtn.addEventListener('click', () => { state.view = 'list'; state.settingsDraft = null; render(); });
  const gotoInfoAdminBtn = document.getElementById('btn-goto-info-admin');
  if(gotoInfoAdminBtn) gotoInfoAdminBtn.addEventListener('click', () => { state.view = 'info-admin'; state.editingInfo = true; render(); });
  const backInfoAdminBtn = document.getElementById('btn-back-info-admin');
  if(backInfoAdminBtn) backInfoAdminBtn.addEventListener('click', () => { state.view = 'settings'; state.editingInfo = false; render(); });

  app.querySelectorAll('[data-wp-input]').forEach(el => {
    el.addEventListener('change', () => { state.settingsDraft.workplaces[el.getAttribute('data-wp-input')] = el.value; });
  });
  app.querySelectorAll('[data-wp-remove]').forEach(el => {
    el.addEventListener('click', () => { state.settingsDraft.workplaces.splice(el.getAttribute('data-wp-remove'), 1); render(); });
  });
  const wpAddBtn = document.getElementById('btn-wp-add');
  if(wpAddBtn) wpAddBtn.addEventListener('click', () => { state.settingsDraft.workplaces.push(''); render(); });

  app.querySelectorAll('[data-pos-input]').forEach(el => {
    el.addEventListener('change', () => { state.settingsDraft.positions[el.getAttribute('data-pos-input')] = el.value; });
  });
  app.querySelectorAll('[data-pos-remove]').forEach(el => {
    el.addEventListener('click', () => { state.settingsDraft.positions.splice(el.getAttribute('data-pos-remove'), 1); render(); });
  });
  const posAddBtn = document.getElementById('btn-pos-add');
  if(posAddBtn) posAddBtn.addEventListener('click', () => { state.settingsDraft.positions.push(''); render(); });

  app.querySelectorAll('[data-admin-input]').forEach(el => {
    el.addEventListener('change', () => { state.settingsDraft.admins[el.getAttribute('data-admin-input')] = el.value; });
  });
  app.querySelectorAll('[data-admin-remove]').forEach(el => {
    el.addEventListener('click', () => { state.settingsDraft.admins.splice(el.getAttribute('data-admin-remove'), 1); render(); });
  });
  const adminAddBtn = document.getElementById('btn-admin-add');
  if(adminAddBtn) adminAddBtn.addEventListener('click', () => { state.settingsDraft.admins.push(''); render(); });

  app.querySelectorAll('[data-supervisor-input]').forEach(el => {
    el.addEventListener('change', () => { state.settingsDraft.supervisors[el.getAttribute('data-supervisor-input')] = el.value; });
  });
  app.querySelectorAll('[data-supervisor-remove]').forEach(el => {
    el.addEventListener('click', () => { state.settingsDraft.supervisors.splice(el.getAttribute('data-supervisor-remove'), 1); render(); });
  });
  const supervisorAddBtn = document.getElementById('btn-supervisor-add');
  if(supervisorAddBtn) supervisorAddBtn.addEventListener('click', () => { state.settingsDraft.supervisors.push(''); render(); });

  app.querySelectorAll('[data-department-input]').forEach(el => {
    el.addEventListener('change', () => { state.settingsDraft.departments[el.getAttribute('data-department-input')] = el.value; });
  });
  app.querySelectorAll('[data-department-remove]').forEach(el => {
    el.addEventListener('click', () => { state.settingsDraft.departments.splice(el.getAttribute('data-department-remove'), 1); render(); });
  });
  const departmentAddBtn = document.getElementById('btn-department-add');
  if(departmentAddBtn) departmentAddBtn.addEventListener('click', () => { state.settingsDraft.departments.push(''); render(); });

  app.querySelectorAll('[data-facility-input]').forEach(el => {
    el.addEventListener('change', () => { state.settingsDraft.facilityStaff[el.getAttribute('data-facility-input')] = el.value; });
  });
  app.querySelectorAll('[data-facility-remove]').forEach(el => {
    el.addEventListener('click', () => { state.settingsDraft.facilityStaff.splice(el.getAttribute('data-facility-remove'), 1); render(); });
  });
  const facilityAddBtn = document.getElementById('btn-facility-add');
  if(facilityAddBtn) facilityAddBtn.addEventListener('click', () => { state.settingsDraft.facilityStaff.push(''); render(); });

  app.querySelectorAll('[data-vemacode-input]').forEach(el => {
    el.addEventListener('change', () => { state.settingsDraft.workplaceVemaCodes[el.getAttribute('data-vemacode-input')] = el.value; });
  });
  app.querySelectorAll('[data-workplace-loc-input]').forEach(el => {
    el.addEventListener('change', () => {
      const [w, key] = el.getAttribute('data-workplace-loc-input').split(':');
      if(!state.settingsDraft.workplaceLocations[w]) state.settingsDraft.workplaceLocations[w] = {okres:'', obec:'', sidlo:''};
      state.settingsDraft.workplaceLocations[w][key] = el.value;
    });
  });
  app.querySelectorAll('[data-vemaconst-input]').forEach(el => {
    el.addEventListener('change', () => { state.settingsDraft.vemaConstants[el.getAttribute('data-vemaconst-input')] = el.value; });
  });

  app.querySelectorAll('[data-office-input]').forEach(el => {
    el.addEventListener('change', () => {
      const [w, i] = el.getAttribute('data-office-input').split(':');
      state.settingsDraft.offices[w][i] = el.value;
    });
  });
  app.querySelectorAll('[data-office-remove]').forEach(el => {
    el.addEventListener('click', () => {
      const [w, i] = el.getAttribute('data-office-remove').split(':');
      state.settingsDraft.offices[w].splice(i, 1);
      render();
    });
  });
  app.querySelectorAll('[data-office-add]').forEach(el => {
    el.addEventListener('click', () => {
      const w = el.getAttribute('data-office-add');
      if(!Array.isArray(state.settingsDraft.offices[w])) state.settingsDraft.offices[w] = [];
      state.settingsDraft.offices[w].push('');
      render();
    });
  });

  app.querySelectorAll('[data-sysurl-input]').forEach(el => {
    el.addEventListener('change', () => { state.settingsDraft.systemUrls[el.getAttribute('data-sysurl-input')] = el.value; });
  });
  app.querySelectorAll('[data-systype-input]').forEach(el => {
    el.addEventListener('change', () => {
      state.settingsDraft.systemTypes[el.getAttribute('data-systype-input')] = el.value;
      render();
    });
  });

  app.querySelectorAll('[data-cat-name]').forEach(el => {
    el.addEventListener('change', () => { state.settingsDraft.categories[el.getAttribute('data-cat-name')].name = el.value; });
  });
  app.querySelectorAll('[data-cat-remove]').forEach(el => {
    el.addEventListener('click', () => { state.settingsDraft.categories.splice(el.getAttribute('data-cat-remove'), 1); render(); });
  });
  app.querySelectorAll('[data-cat-system]').forEach(el => {
    el.addEventListener('change', () => {
      const [ci, sysId] = el.getAttribute('data-cat-system').split(':');
      const cat = state.settingsDraft.categories[ci];
      const idx = cat.systems.indexOf(sysId);
      if(el.checked && idx === -1) cat.systems.push(sysId);
      if(!el.checked && idx !== -1) cat.systems.splice(idx, 1);
    });
  });
  const catAddBtn = document.getElementById('btn-cat-add');
  if(catAddBtn) catAddBtn.addEventListener('click', () => { state.settingsDraft.categories.push({name:'', systems:[]}); render(); });

  const saveSettingsBtn = document.getElementById('btn-save-settings');
  if(saveSettingsBtn) saveSettingsBtn.addEventListener('click', async () => {
    const listFields = [
      ['workplaces','Pracoviště'], ['positions','Pracovní pozice'], ['admins','Administrátoři systémů'],
      ['supervisors','Nadřízení'], ['departments','Odbory / oddělení'], ['facilityStaff','Pracovníci provozu'],
    ];
    const shrinking = listFields.filter(([k]) => (state.settings[k]||[]).length >= 3 && (state.settingsDraft[k]||[]).length === 0);
    if(shrinking.length > 0){
      const names = shrinking.map(([,label]) => label).join(', ');
      if(!confirm(`Pozor: chystáte se uložit prázdný seznam u „${names}" — dřív tam přitom položky byly. Opravdu chcete pokračovat a smazat je?`)) return;
    }
    state.settings = JSON.parse(JSON.stringify(state.settingsDraft));
    await saveSettings();
    state.settingsDraft = null;
    state.view = 'list';
    render();
  });

  const deleteAllBtn = document.getElementById('btn-delete-all');
  if(deleteAllBtn) deleteAllBtn.addEventListener('click', openDeleteAllModal);

  app.querySelectorAll('[data-hrreq-toggle]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.getAttribute('data-hrreq-toggle');
      if(cb.checked) delete state.settingsDraft.hrRequiredOverrides[id];
      else state.settingsDraft.hrRequiredOverrides[id] = false;
    });
  });

  const settingsResetBtn = document.getElementById('btn-settings-reset');
  if(settingsResetBtn) settingsResetBtn.addEventListener('click', () => {
    const select = document.getElementById('settings-reset-select');
    const opt = SETTINGS_RESET_OPTIONS.find(o => o.key === select.value);
    if(!opt) return;
    if(!confirm(`Opravdu resetovat sekci „${opt.label}" na výchozí hodnoty? Projeví se to až po uložení tlačítkem „Uložit nastavení".`)) return;
    state.settingsDraft[opt.key] = opt.getDefault();
    render();
  });

  app.querySelectorAll('[data-settings-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.getAttribute('data-settings-toggle');
      state.settingsCollapsed[key] = isSettingsSectionCollapsed(key) ? false : true;
      render();
    });
  });
  app.querySelectorAll('[data-settings-csv]').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const field = el.getAttribute('data-settings-csv');
      const label = el.getAttribute('data-settings-csv-label') || field;
      const items = state.settingsDraft[field] || [];
      downloadCsv(`${field}.csv`, [label], items.map(v => [v]));
    });
  });

  app.querySelectorAll('[data-export-select]').forEach(el => {
    el.addEventListener('click', (ev) => ev.stopPropagation());
    el.addEventListener('change', () => {
      const id = el.getAttribute('data-export-select');
      if(el.checked) state.selectedExport[id] = true;
      else delete state.selectedExport[id];
      render();
    });
  });
  const selectAllExportBtn = document.getElementById('export-select-all');
  if(selectAllExportBtn){
    selectAllExportBtn.addEventListener('click', (ev) => ev.stopPropagation());
    selectAllExportBtn.addEventListener('change', () => {
      const reviewedRows = getFilteredSortedRows().filter(r => (r.personalStatus||'draft') === 'reviewed');
      if(selectAllExportBtn.checked) reviewedRows.forEach(r => state.selectedExport[r.id] = true);
      else reviewedRows.forEach(r => delete state.selectedExport[r.id]);
      render();
    });
  }
  const generateVemaBtn = document.getElementById('btn-generate-vema');
  if(generateVemaBtn) generateVemaBtn.addEventListener('click', async () => {
    const ids = Object.keys(state.selectedExport).filter(id => state.selectedExport[id]);
    if(ids.length === 0) return;
    state.exporting = true;
    render();
    try{
      await generateVemaExport(ids);
    }catch(e){
      console.error('generateVemaExport failed:', e);
      state.error = 'Generování tabulek se nezdařilo. Zkuste to prosím znovu.';
    }
    state.exporting = false;
    state.selectedExport = {};
    render();
  });

  const importUploadBtn = document.getElementById('btn-import-upload');
  if(importUploadBtn) importUploadBtn.addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });
  const importFileInput = document.getElementById('import-file-input');
  if(importFileInput) importFileInput.addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if(files.length === 0) return;
    const queue = [];
    for(const file of files){
      try{
        const isJson = /\.json$/i.test(file.name);
        const { headers, rows, mapping: presetMapping, groupColIdx } = isJson ? await readJsonOrgFile(file) : await readXlsxFile(file);
        if(headers.length === 0 || rows.length === 0){
          state.error = `Soubor „${file.name}" neobsahuje žádná data k vytěžení${isJson ? ' (po vyřazení současných zaměstnanců DESÚ nezbyl nikdo k založení)' : ' (očekává se hlavička v prvním řádku)'}.`;
          continue;
        }
        const mapping = presetMapping || {};
        if(!presetMapping) headers.forEach((h,i) => { mapping[i] = guessFieldTarget(h); });
        queue.push({ fileName: file.name, headers, rows, mapping, common:{}, groupColIdx: groupColIdx==null?null:groupColIdx, groupCommon:{} });
      }catch(err){
        console.error('file read failed:', err);
        state.error = `Nepodařilo se přečíst soubor „${file.name}": ${err.message}`;
      }
    }
    if(queue.length > 0){
      state.importCurrent = queue.shift();
      state.importQueue = queue;
      state.view = 'import-mapping';
    }
    render();
  });

  app.querySelectorAll('[data-import-common]').forEach(el => {
    el.addEventListener('change', () => {
      state.importCurrent.common[el.getAttribute('data-import-common')] = el.value;
    });
  });
  app.querySelectorAll('[data-import-group-common]').forEach(el => {
    el.addEventListener('change', () => {
      const raw = el.getAttribute('data-import-group-common');
      const sep = raw.indexOf(':');
      const group = raw.slice(0, sep);
      const field = raw.slice(sep+1);
      if(!state.importCurrent.groupCommon[group]) state.importCurrent.groupCommon[group] = {};
      state.importCurrent.groupCommon[group][field] = el.value;
    });
  });
  app.querySelectorAll('[data-import-map]').forEach(sel => {
    sel.addEventListener('change', () => {
      state.importCurrent.mapping[sel.getAttribute('data-import-map')] = sel.value;
    });
  });
  const importCancelBtn = document.getElementById('btn-import-cancel');
  if(importCancelBtn) importCancelBtn.addEventListener('click', () => {
    state.importCurrent = null;
    state.importQueue = [];
    state.view = 'list';
    render();
  });
  const importConfirmBtn = document.getElementById('btn-import-confirm');
  if(importConfirmBtn) importConfirmBtn.addEventListener('click', async () => {
    importConfirmBtn.disabled = true;
    importConfirmBtn.textContent = 'Zakládám…';
    try{
      const result = await runImportBatch();
      if(state.importQueue.length > 0){
        state.importCurrent = state.importQueue.shift();
        state.view = 'import-mapping';
      } else {
        state.importCurrent = null;
        state.view = 'list';
      }
      if(result.saved < result.total){
        state.error = `Založeno ${result.saved} z ${result.total} nástupů — u zbytku se uložení nezdařilo, zkuste to prosím znovu.`;
      }
    }catch(e){
      console.error('runImportBatch failed:', e);
      state.error = 'Vytěžení se nezdařilo. Zkuste to prosím znovu.';
    }
    render();
  });

  const logoutBtn = document.getElementById('btn-logout');
  if(logoutBtn) logoutBtn.addEventListener('click', (ev) => { ev.preventDefault(); if(window.appLogout) window.appLogout(); });

  app.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', (ev) => {
      const tag = ev.target && ev.target.tagName;
      if(tag === 'SELECT' || tag === 'OPTION' || tag === 'INPUT' || tag === 'TEXTAREA') return;
      openDetail(el.getAttribute('data-open'));
    });
  });
  app.querySelectorAll('[data-quickedit]').forEach(el => {
    el.addEventListener('click', (ev) => { ev.stopPropagation(); openQuickEditModal(el.getAttribute('data-quickedit')); });
  });
  app.querySelectorAll('[data-delete]').forEach(el => {
    el.addEventListener('click', (ev) => { ev.stopPropagation(); openDeleteModal(el.getAttribute('data-delete')); });
  });

  const searchInput = document.getElementById('list-search');
  if(searchInput) searchInput.addEventListener('input', () => { state.filterText = searchInput.value; render(); });
  const searchClearBtn = document.getElementById('list-search-clear');
  if(searchClearBtn) searchClearBtn.addEventListener('click', () => {
    state.filterText = '';
    render();
    const input = document.getElementById('list-search');
    if(input) input.focus();
  });
  app.querySelectorAll('[data-colfilter]').forEach(el => {
    el.addEventListener('change', () => {
      state.colFilters[el.getAttribute('data-colfilter')] = el.value;
      render();
    });
  });
  app.querySelectorAll('[data-sort]').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.getAttribute('data-sort');
      if(state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortKey = key; state.sortDir = 'asc'; }
      render();
    });
  });

  const backBtn = document.getElementById('btn-back');
  if(backBtn) backBtn.addEventListener('click', () => { state.view='list'; state.error=null; render(); });

  const genPrintDocsBtn = document.getElementById('btn-generate-print-docs');
  if(genPrintDocsBtn) genPrintDocsBtn.addEventListener('click', () => { state.view='print-docs'; render(); });
  const backPrintDocsBtn = document.getElementById('btn-back-print-docs');
  if(backPrintDocsBtn) backPrintDocsBtn.addEventListener('click', () => { state.view='detail'; render(); });
  const printDocsBtn = document.getElementById('btn-print-docs');
  if(printDocsBtn) printDocsBtn.addEventListener('click', () => { window.print(); });
  const emailDocsBtn = document.getElementById('btn-email-docs');
  if(emailDocsBtn) emailDocsBtn.addEventListener('click', () => {
    const r = state.currentRecord;
    const assignedEmail = r.checklist.email && r.checklist.email.value;
    if(!assignedEmail) return;
    const subject = `Podklady k podpisu — ${r.personal.jmeno} ${r.personal.prijmeni}`;
    const body = `Dobrý den,\n\nv příloze zasíláme podklady k podpisu: Osobní dotazník (A), Prohlášení o průběhu předchozích zaměstnání a činností (B) a Souhlas se zasíláním platu na osobní účet (C).\n\nProsím o kontrolu údajů, podpis a zaslání zpět personálnímu oddělení.\n\n(Nezapomeňte prosím přiložit uložené PDF — příloha se z prohlížeče nepřipojuje automaticky.)\n\nS pozdravem`;
    window.location.href = `mailto:${encodeURIComponent(assignedEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  const consentChk = document.getElementById('chk-consent');
  const consentBtn = document.getElementById('btn-consent-confirm');
  if(consentChk && consentBtn){
    consentChk.addEventListener('change', () => { consentBtn.disabled = !consentChk.checked; });
  }
  if(consentBtn) consentBtn.addEventListener('click', () => {
    if(!state.currentRecord) return;
    state.currentRecord.consentGiven = true;
    state.currentRecord.consentAt = new Date().toISOString();
    persistRecordOnly();
    render();
  });

  const copyBtn = document.getElementById('btn-copy-link');
  if(copyBtn) copyBtn.addEventListener('click', async () => {
    const url = location.href.split('#')[0] + '#z/' + state.currentId;
    try{ await navigator.clipboard.writeText(url); }catch(e){}
    state.linkCopied = true;
    if(!state.currentRecord.linkGeneratedAt){
      state.currentRecord.linkGeneratedAt = new Date().toISOString();
      persistCurrentRecord();
    }
    render();
    setTimeout(() => { state.linkCopied = false; }, 3000);
  });

  app.querySelectorAll('[data-tab]').forEach(el => {
    el.addEventListener('click', () => { state.tab = el.getAttribute('data-tab'); state.wizardStep = 0; state.wizardStepError = false; render(); });
  });

  app.querySelectorAll('[data-toggle-section]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-toggle-section');
      state.collapsed[id] = !state.collapsed[id];
      render();
    });
  });

  const approveBtn = document.getElementById('btn-approve');
  if(approveBtn) approveBtn.addEventListener('click', () => {
    const missing = missingRequiredFields(state.currentRecord, true);
    if(missing.length > 0){
      render();
      return;
    }
    state.currentRecord.personalStatus = 'reviewed';
    persistCurrentRecord();
    render();
  });
  const returnBtn = document.getElementById('btn-return');
  if(returnBtn) returnBtn.addEventListener('click', openReturnModal);
  const copyMsgBtn = document.getElementById('btn-copy-return-message');
  if(copyMsgBtn) copyMsgBtn.addEventListener('click', async () => {
    const r = state.currentRecord;
    const flagged = Object.entries(r.fieldFlags || {}).filter(([,v]) => v !== undefined);
    let msg = `Dobrý den,\n\nprosíme o doplnění/opravu údajů v onboardingové aplikaci.\n`;
    if(r.returnNote) msg += `\n${r.returnNote}\n`;
    if(flagged.length){
      msg += `\nKonkrétně prosím zkontrolujte:\n`;
      flagged.forEach(([key, note]) => { msg += `- ${flagLabelFor(key)}${note ? ': '+note : ''}\n`; });
    }
    msg += `\nDěkujeme,\npersonální oddělení`;
    try{ await navigator.clipboard.writeText(msg); }catch(e){}
    state.returnMsgCopied = true;
    render();
    setTimeout(() => { state.returnMsgCopied = false; }, 3000);
  });

  app.querySelectorAll('[data-flag-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.getAttribute('data-flag-toggle');
      const flags = state.currentRecord.fieldFlags = state.currentRecord.fieldFlags || {};
      if(key in flags) delete flags[key];
      else flags[key] = '';
      persistRecordOnly();
      render();
    });
  });
  app.querySelectorAll('[data-flag-note]').forEach(el => {
    el.addEventListener('change', () => {
      const key = el.getAttribute('data-flag-note');
      state.currentRecord.fieldFlags = state.currentRecord.fieldFlags || {};
      state.currentRecord.fieldFlags[key] = el.value;
      persistRecordOnly();
    });
  });

  app.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('change', () => {
      if(el.disabled) return;
      const fieldId = el.getAttribute('data-field');
      let newValue = el.value;
      const fdef = fieldDefFor(fieldId);
      if(fdef && fdef.validate){
        const check = VALIDATORS[fdef.validate](newValue, state.currentRecord.personal);
        if(check && check.ok && check.formatted) newValue = check.formatted;
      }
      const owner = fieldOwner(fieldId);
      const oldValue = state.currentRecord.personal[fieldId] || '';
      if(state.role === 'hr' && owner === 'employee'){
        if(newValue === oldValue){
          if(state.pendingEdit && state.pendingEdit.key === fieldId){ state.pendingEdit = null; render(); }
          return;
        }
        state.pendingEdit = { key: fieldId, kind:'field', fieldId, oldValue, newValue };
        render();
        return;
      }
      state.currentRecord.personal[fieldId] = newValue;
      if(fieldId === 'pozice' || fieldId === 'datum_nastupu' || fieldId === 'pracoviste' || fieldId === 'kategorie') persistCurrentRecord();
      else persistRecordOnly();
      render();
    });
  });

  app.querySelectorAll('[data-repeat-field]').forEach(el => {
    el.addEventListener('change', () => {
      if(el.disabled) return;
      const [secId, idx, fieldId] = el.getAttribute('data-repeat-field').split(':');
      const sec = PERSONAL_SECTIONS.find(s => s.id === secId);
      if(!Array.isArray(state.currentRecord.personal[secId])) state.currentRecord.personal[secId] = [];
      if(!state.currentRecord.personal[secId][idx]) state.currentRecord.personal[secId][idx] = {};
      let newValue = el.value;
      const fdef = sec.fields.find(f => f.id === fieldId);
      if(fdef && fdef.validate){
        const check = VALIDATORS[fdef.validate](newValue, state.currentRecord.personal[secId][idx]);
        if(check && check.ok && check.formatted) newValue = check.formatted;
      }
      const key = secId+':'+idx+':'+fieldId;
      const oldValue = state.currentRecord.personal[secId][idx][fieldId] || '';
      if(state.role === 'hr' && sec.owner === 'employee'){
        if(newValue === oldValue){
          if(state.pendingEdit && state.pendingEdit.key === key){ state.pendingEdit = null; render(); }
          return;
        }
        state.pendingEdit = { key, kind:'repeat', secId, idx, fieldId, oldValue, newValue };
        render();
        return;
      }
      state.currentRecord.personal[secId][idx][fieldId] = newValue;
      persistRecordOnly();
      render();
    });
  });

  app.querySelectorAll('[data-autocomplete]').forEach(input => {
    const kind = input.getAttribute('data-autocomplete');
    input.addEventListener('input', () => openAutocomplete(input, kind));
    input.addEventListener('focus', () => openAutocomplete(input, kind));
  });

  app.querySelectorAll('[data-date-group]').forEach(group => {
    const hidden = group.querySelector('input[type="hidden"]');
    const dayEl = group.querySelector('[data-date-seg="day"]');
    const monthEl = group.querySelector('[data-date-seg="month"]');
    const yearEl = group.querySelector('[data-date-seg="year"]');
    const calBtn = group.querySelector('[data-date-cal-toggle]');

    function commit(){
      if(hidden.disabled) return;
      const d = dayEl.value, mo = monthEl.value, y = yearEl.value;
      if(d && mo && y.length === 4){
        const iso = `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
        if(hidden.value !== iso){ hidden.value = iso; hidden.dispatchEvent(new Event('change', {bubbles:true})); }
      } else if(!d && !mo && !y){
        if(hidden.value !== ''){ hidden.value = ''; hidden.dispatchEvent(new Event('change', {bubbles:true})); }
      }
    }
    function clampNum(v, max){
      v = v.replace(/\D/g,'');
      if(v && parseInt(v,10) > max) v = String(max);
      return v;
    }
    dayEl.addEventListener('input', () => {
      dayEl.value = clampNum(dayEl.value, 31).slice(0,2);
      if(dayEl.value.length === 2) monthEl.focus();
    });
    monthEl.addEventListener('input', () => {
      monthEl.value = clampNum(monthEl.value, 12).slice(0,2);
      if(monthEl.value.length === 2) yearEl.focus();
    });
    yearEl.addEventListener('input', () => {
      yearEl.value = yearEl.value.replace(/\D/g,'').slice(0,4);
      if(yearEl.value.length === 4) commit();
    });
    monthEl.addEventListener('keydown', e => { if(e.key === 'Backspace' && monthEl.value === '') dayEl.focus(); });
    yearEl.addEventListener('keydown', e => { if(e.key === 'Backspace' && yearEl.value === '') monthEl.focus(); });
    group.addEventListener('focusout', () => {
      setTimeout(() => { if(!group.contains(document.activeElement)) commit(); }, 0);
    });
    if(calBtn) calBtn.addEventListener('click', () => openDatePicker(group, hidden, dayEl, monthEl, yearEl, commit));
  });

  app.querySelectorAll('[data-autofill-birthdate]').forEach(el => {
    el.addEventListener('click', () => {
      const [kind, ...rest] = el.getAttribute('data-autofill-birthdate').split(':');
      const source = el.getAttribute('data-autofill-source');
      const derived = birthDateFromRC(source);
      if(!derived) return;
      if(kind === 'field'){
        const fieldId = rest.join(':');
        state.currentRecord.personal[fieldId] = derived;
      } else {
        const [secId, idx, fieldId] = rest;
        if(!state.currentRecord.personal[secId][idx]) state.currentRecord.personal[secId][idx] = {};
        state.currentRecord.personal[secId][idx][fieldId] = derived;
      }
      persistRecordOnly();
      render();
    });
  });

  const pendingConfirmBtn = document.querySelector('[data-pending-confirm]');
  if(pendingConfirmBtn) pendingConfirmBtn.addEventListener('click', () => {
    const p = state.pendingEdit;
    if(!p) return;
    if(p.kind === 'field'){
      state.currentRecord.personal[p.fieldId] = p.newValue;
      state.pendingEdit = null;
      if(p.fieldId === 'pozice' || p.fieldId === 'datum_nastupu') persistCurrentRecord();
      else persistRecordOnly();
    } else {
      if(!state.currentRecord.personal[p.secId][p.idx]) state.currentRecord.personal[p.secId][p.idx] = {};
      state.currentRecord.personal[p.secId][p.idx][p.fieldId] = p.newValue;
      state.pendingEdit = null;
      persistRecordOnly();
    }
    render();
  });
  const pendingCancelBtn = document.querySelector('[data-pending-cancel]');
  if(pendingCancelBtn) pendingCancelBtn.addEventListener('click', () => {
    state.pendingEdit = null;
    render();
  });
  app.querySelectorAll('[data-repeat-add]').forEach(el => {
    el.addEventListener('click', () => {
      const secId = el.getAttribute('data-repeat-add');
      const sec = PERSONAL_SECTIONS.find(s => s.id === secId);
      const row = {};
      sec.fields.forEach(f => row[f.id] = '');
      if(!Array.isArray(state.currentRecord.personal[secId])) state.currentRecord.personal[secId] = [];
      state.currentRecord.personal[secId].push(row);
      persistRecordOnly();
      render();
    });
  });
  app.querySelectorAll('[data-repeat-remove]').forEach(el => {
    el.addEventListener('click', () => {
      const [secId, idx] = el.getAttribute('data-repeat-remove').split(':');
      if(!Array.isArray(state.currentRecord.personal[secId])) state.currentRecord.personal[secId] = [];
      state.currentRecord.personal[secId].splice(idx, 1);
      persistRecordOnly();
      render();
    });
  });

  app.querySelectorAll('[data-wizard]').forEach(el => {
    el.addEventListener('click', () => {
      const action = el.getAttribute('data-wizard');
      const steps = PERSONAL_SECTIONS.filter(s => s.owner === 'employee');
      const totalSteps = steps.length + 1;
      if(action === 'next'){
        const currentSec = steps[state.wizardStep];
        if(currentSec && sectionHasHardError(currentSec, state.currentRecord)){
          state.wizardStepError = true;
          render();
          return;
        }
        state.wizardStepError = false;
        state.wizardStep = Math.min(state.wizardStep+1, totalSteps-1);
      }
      if(action === 'prev'){ state.wizardStepError = false; state.wizardStep = Math.max(state.wizardStep-1, 0); }
      if(action === 'finish'){
        const missing = missingRequiredFields(state.currentRecord, false);
        if(missing.length > 0){
          state.showMissingHighlights = true;
          render();
          return;
        }
        state.showMissingHighlights = false;
        openSubmitConfirmModal();
        return;
      }
      if(action === 'withdraw'){
        openWithdrawModal();
        return;
      }
      window.scrollTo({top:0, behavior:'smooth'});
      render();
    });
  });
  app.querySelectorAll('[data-wizard-goto]').forEach(el => {
    el.addEventListener('click', () => {
      state.wizardStepError = false;
      state.wizardStep = parseInt(el.getAttribute('data-wizard-goto'), 10);
      window.scrollTo({top:0, behavior:'smooth'});
      render();
    });
  });

  app.querySelectorAll('[data-check]').forEach(el => {
    el.addEventListener('change', () => {
      if(el.disabled) return;
      const id = el.getAttribute('data-check');
      state.currentRecord.checklist[id].checked = el.checked;
      persistChecklistChange();
      render();
    });
  });

  app.querySelectorAll('[data-value]').forEach(el => {
    el.addEventListener('change', () => {
      if(el.disabled) return;
      const id = el.getAttribute('data-value');
      state.currentRecord.checklist[id].value = el.value;
      persistRecordOnly();
    });
  });

  const assignSelect = document.getElementById('assign-admin-select');
  if(assignSelect) assignSelect.addEventListener('change', () => {
    state.currentRecord.assignedAdmin = assignSelect.value;
    persistCurrentRecord();
  });
  const assignOfficeSelect = document.getElementById('assign-office-select');
  if(assignOfficeSelect) assignOfficeSelect.addEventListener('change', () => {
    state.currentRecord.assignedOffice = assignOfficeSelect.value;
    persistCurrentRecord();
  });
  const assignFacilitySelect = document.getElementById('assign-facility-select');
  if(assignFacilitySelect) assignFacilitySelect.addEventListener('change', () => {
    state.currentRecord.assignedFacilityStaff = assignFacilitySelect.value;
    persistCurrentRecord();
  });

  app.querySelectorAll('[data-list-assign]').forEach(el => {
    el.addEventListener('change', async () => {
      const id = el.getAttribute('data-list-assign');
      await assignAdminFromList(id, el.value);
      render();
    });
  });

  app.querySelectorAll('[data-assign-select]').forEach(el => {
    el.addEventListener('change', () => {
      const id = el.getAttribute('data-assign-select');
      if(el.checked) state.selectedAssign[id] = true;
      else delete state.selectedAssign[id];
      render();
    });
  });
  const assignSelectAllBtn = document.getElementById('assign-select-all');
  if(assignSelectAllBtn) assignSelectAllBtn.addEventListener('change', () => {
    const visibleRows = getFilteredSortedRows();
    if(assignSelectAllBtn.checked) visibleRows.forEach(r => state.selectedAssign[r.id] = true);
    else visibleRows.forEach(r => delete state.selectedAssign[r.id]);
    render();
  });
  const bulkAssignSelect = document.getElementById('bulk-assign-select');
  if(bulkAssignSelect) bulkAssignSelect.addEventListener('change', () => {
    state.bulkAssignTarget = bulkAssignSelect.value;
    render();
  });
  const bulkAssignBtn = document.getElementById('btn-bulk-assign');
  if(bulkAssignBtn) bulkAssignBtn.addEventListener('click', async () => {
    const ids = Object.keys(state.selectedAssign).filter(id => state.selectedAssign[id]);
    if(ids.length === 0 || !state.bulkAssignTarget) return;
    state.bulkAssigning = true;
    render();
    try{
      const result = await bulkAssignAdmin(ids, state.bulkAssignTarget, (done, total) => {
        const btn = document.getElementById('btn-bulk-assign');
        if(btn) btn.textContent = `Přiřazuji… (${done}/${total})`;
      });
      if(result.interrupted){
        state.error = `Přiřazení bylo přerušeno kvůli limitu požadavků na úložiště — hotovo ${result.saved} z ${result.total}. Znovu načtěte artefakt (obnovte stránku) a zaškrtněte prosím jen zbylé spisy.`;
      } else {
        state.selectedAssign = {};
        state.bulkAssignTarget = '';
      }
    }catch(e){
      console.error('bulkAssignAdmin failed:', e);
      state.error = 'Hromadné přiřazení se nezdařilo. Zkuste to prosím znovu.';
    }
    state.bulkAssigning = false;
    render();
  });

  app.querySelectorAll('[data-item-note-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-item-note-toggle');
      state.openItemNotes[id] = !state.openItemNotes[id];
      render();
    });
  });
  app.querySelectorAll('[data-item-note-input]').forEach(el => {
    el.addEventListener('change', () => {
      const id = el.getAttribute('data-item-note-input');
      state.currentRecord.checklist[id].note = el.value;
      persistRecordOnly();
    });
  });

  const toggleEditInfo = document.getElementById('btn-toggle-edit-info');
  if(toggleEditInfo) toggleEditInfo.addEventListener('click', () => { state.editingInfo = !state.editingInfo; render(); });

  const workplaceSelect = document.getElementById('workplace-editor-select');
  if(workplaceSelect) workplaceSelect.addEventListener('change', () => { state.editingWorkplace = workplaceSelect.value; render(); });
  app.querySelectorAll('[data-workplace-body]').forEach(el => {
    el.addEventListener('change', () => { state.infoContent.workplaces[el.getAttribute('data-workplace-body')] = el.value; });
  });

  const consentTextBody = document.getElementById('consent-text-body');
  if(consentTextBody) consentTextBody.addEventListener('change', () => { state.infoContent.consentText = consentTextBody.value; });

  const firstDaySelect = document.getElementById('firstday-type-select');
  if(firstDaySelect) firstDaySelect.addEventListener('change', () => { state.editingFirstDayType = firstDaySelect.value; render(); });
  app.querySelectorAll('[data-firstday-body]').forEach(el => {
    el.addEventListener('change', () => { state.infoContent.firstDayPlans[el.getAttribute('data-firstday-body')] = el.value; });
  });

  const firstDayDismissBtn = document.getElementById('btn-firstday-dismiss');
  if(firstDayDismissBtn) firstDayDismissBtn.addEventListener('click', () => { state.firstDayDismissPrompt = true; render(); });
  const firstDayHideCancelBtn = document.getElementById('btn-firstday-hide-cancel');
  if(firstDayHideCancelBtn) firstDayHideCancelBtn.addEventListener('click', () => { state.firstDayDismissPrompt = false; render(); });
  const firstDayHideSessionBtn = document.getElementById('btn-firstday-hide-session');
  if(firstDayHideSessionBtn) firstDayHideSessionBtn.addEventListener('click', () => {
    state.firstDayHiddenSession = true;
    state.firstDayDismissPrompt = false;
    render();
  });
  const firstDayHideForeverBtn = document.getElementById('btn-firstday-hide-forever');
  if(firstDayHideForeverBtn) firstDayHideForeverBtn.addEventListener('click', () => {
    if(state.currentRecord){
      state.currentRecord.firstDayDismissed = true;
      persistRecordOnly();
    }
    state.firstDayDismissPrompt = false;
    render();
  });
  const firstDayRestoreBtn = document.getElementById('btn-firstday-restore');
  if(firstDayRestoreBtn) firstDayRestoreBtn.addEventListener('click', () => {
    state.firstDayHiddenSession = false;
    if(state.currentRecord && state.currentRecord.firstDayDismissed){
      state.currentRecord.firstDayDismissed = false;
      persistRecordOnly();
    }
    render();
  });

  app.querySelectorAll('[data-glossary-term]').forEach(el => {
    el.addEventListener('change', () => { state.infoContent.glossary[el.getAttribute('data-glossary-term')].term = el.value; });
  });
  app.querySelectorAll('[data-glossary-desc]').forEach(el => {
    el.addEventListener('change', () => { state.infoContent.glossary[el.getAttribute('data-glossary-desc')].desc = el.value; });
  });
  app.querySelectorAll('[data-glossary-remove]').forEach(el => {
    el.addEventListener('click', () => { state.infoContent.glossary.splice(el.getAttribute('data-glossary-remove'), 1); render(); });
  });
  const glossaryAddBtn = document.getElementById('btn-glossary-add');
  if(glossaryAddBtn) glossaryAddBtn.addEventListener('click', () => { state.infoContent.glossary.push({term:'', desc:''}); render(); });

  app.querySelectorAll('[data-link-label]').forEach(el => {
    el.addEventListener('change', () => { state.infoContent.links[el.getAttribute('data-link-label')].label = el.value; });
  });
  app.querySelectorAll('[data-link-url]').forEach(el => {
    el.addEventListener('change', () => { state.infoContent.links[el.getAttribute('data-link-url')].url = el.value; });
  });
  app.querySelectorAll('[data-link-remove]').forEach(el => {
    el.addEventListener('click', () => { state.infoContent.links.splice(el.getAttribute('data-link-remove'), 1); render(); });
  });
  const linkAddBtn = document.getElementById('btn-link-add');
  if(linkAddBtn) linkAddBtn.addEventListener('click', () => { state.infoContent.links.push({label:'', url:''}); render(); });

  app.querySelectorAll('[data-card-title]').forEach(el => {
    el.addEventListener('change', () => { state.infoContent.cards[el.getAttribute('data-card-title')].title = el.value; });
  });
  app.querySelectorAll('[data-card-body]').forEach(el => {
    el.addEventListener('change', () => { state.infoContent.cards[el.getAttribute('data-card-body')].body = el.value; });
  });
  app.querySelectorAll('[data-contact-group-title]').forEach(el => {
    el.addEventListener('change', () => { state.infoContent.contacts.groups[el.getAttribute('data-contact-group-title')].title = el.value; });
  });
  app.querySelectorAll('[data-contact-person-name]').forEach(el => {
    el.addEventListener('change', () => {
      const [gi,pi] = el.getAttribute('data-contact-person-name').split(':');
      state.infoContent.contacts.groups[gi].people[pi].name = el.value;
    });
  });
  app.querySelectorAll('[data-contact-person-phone]').forEach(el => {
    el.addEventListener('change', () => {
      const [gi,pi] = el.getAttribute('data-contact-person-phone').split(':');
      state.infoContent.contacts.groups[gi].people[pi].phone = el.value;
    });
  });
  app.querySelectorAll('[data-contact-add]').forEach(el => {
    el.addEventListener('click', () => {
      state.infoContent.contacts.groups[el.getAttribute('data-contact-add')].people.push({name:'', phone:''});
      render();
    });
  });
  app.querySelectorAll('[data-contact-remove]').forEach(el => {
    el.addEventListener('click', () => {
      const [gi,pi] = el.getAttribute('data-contact-remove').split(':');
      state.infoContent.contacts.groups[gi].people.splice(pi,1);
      render();
    });
  });
  const saveInfoBtn = document.getElementById('btn-save-info');
  if(saveInfoBtn) saveInfoBtn.addEventListener('click', async () => {
    await saveInfoContent();
    state.editingInfo = false;
    render();
  });
}

async function persistRecordOnly(){
  const ok = await saveRecord(state.currentId, state.currentRecord);
  const entry = state.index.find(e => e.id === state.currentId);
  if(entry){
    entry.hrMissingCount = missingHrRequiredFields(state.currentRecord).length;
    entry.linkGeneratedAt = state.currentRecord.linkGeneratedAt || null;
    await saveIndex();
  }
  if(ok){
    state.saveStatus = 'saved';
    state.saveStatusAt = Date.now();
  }
}

async function assignAdminFromList(id, adminName){
  const record = await loadRecord(id);
  record.assignedAdmin = adminName;
  await saveRecord(id, record);
  const entry = state.index.find(e => e.id === id);
  if(entry) entry.assignedAdmin = adminName;
  await saveIndex();
  if(state.currentId === id && state.currentRecord) state.currentRecord.assignedAdmin = adminName;
}

async function bulkAssignAdmin(ids, adminName, onProgress){
  state.hardRateLimited = false;
  let saved = 0;
  for(let i=0; i<ids.length; i++){
    const id = ids[i];
    const record = await loadRecord(id);
    record.assignedAdmin = adminName;
    const ok = await saveRecord(id, record);
    if(ok){
      saved++;
      const entry = state.index.find(e => e.id === id);
      if(entry) entry.assignedAdmin = adminName;
      if(state.currentId === id && state.currentRecord) state.currentRecord.assignedAdmin = adminName;
    }
    if(onProgress) onProgress(i+1, ids.length);
    if(state.hardRateLimited) break;
    await new Promise(res => setTimeout(res, 800));
  }
  await saveIndex();
  return { saved, total: ids.length, interrupted: state.hardRateLimited };
}

let indexSyncTimer = null;
function syncIndexEntryFromCurrentRecord(){
  const entry = state.index.find(e => e.id === state.currentId);
  if(!entry || !state.currentRecord) return null;
  entry.pozice = state.currentRecord.personal.pozice || entry.pozice;
  entry.pracoviste = state.currentRecord.personal.pracoviste || entry.pracoviste;
  entry.datumNastupu = state.currentRecord.personal.datum_nastupu || entry.datumNastupu;
  entry.personalStatus = state.currentRecord.personalStatus;
  entry.assignedAdmin = state.currentRecord.assignedAdmin;
  const {total, done} = checklistTotals(state.currentRecord.checklist, state.currentRecord.personal.kategorie, 'it');
  entry.itTotal = total;
  entry.itDone = done;
  return entry;
}
async function persistChecklistChange(){
  syncIndexEntryFromCurrentRecord();
  await saveRecord(state.currentId, state.currentRecord);
  if(indexSyncTimer) clearTimeout(indexSyncTimer);
  indexSyncTimer = setTimeout(async () => {
    indexSyncTimer = null;
    await saveIndex();
    render();
  }, 800);
}

async function persistCurrentRecord(){
  const okRecord = await saveRecord(state.currentId, state.currentRecord);
  const entry = state.index.find(e => e.id === state.currentId);
  let okIndex = true;
  if(entry){
    entry.pozice = state.currentRecord.personal.pozice || entry.pozice;
    entry.pracoviste = state.currentRecord.personal.pracoviste || entry.pracoviste;
    entry.datumNastupu = state.currentRecord.personal.datum_nastupu || entry.datumNastupu;
    entry.personalStatus = state.currentRecord.personalStatus;
    entry.assignedAdmin = state.currentRecord.assignedAdmin;
    entry.hrMissingCount = missingHrRequiredFields(state.currentRecord).length;
    entry.linkGeneratedAt = state.currentRecord.linkGeneratedAt || null;
    const {total, done} = checklistTotals(state.currentRecord.checklist, state.currentRecord.personal.kategorie, 'it');
    entry.itTotal = total;
    entry.itDone = done;
    okIndex = await saveIndex();
  }
  if(okRecord && okIndex){
    state.saveStatus = 'saved';
    state.saveStatusAt = Date.now();
  }
}

function fieldOwner(fieldId){
  for(const s of PERSONAL_SECTIONS){
    if(s.type === 'repeat') continue;
    if(s.fields.some(f => f.id === fieldId)) return s.owner;
  }
  return null;
}
function fieldDefFor(fieldId){
  for(const s of PERSONAL_SECTIONS){
    if(s.type === 'repeat') continue;
    const f = s.fields.find(f => f.id === fieldId);
    if(f) return f;
  }
  return null;
}

function flagLabelFor(key){
  const sec = PERSONAL_SECTIONS.find(s => s.id === key && s.type === 'repeat');
  if(sec) return sec.label;
  for(const s of PERSONAL_SECTIONS){
    const f = s.fields.find(f => f.id === key);
    if(f) return f.label;
  }
  return key;
}

function openReturnModal(){
  const r = state.currentRecord;
  const flagCount = Object.keys(r.fieldFlags || {}).length;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Vrátit zaměstnanci k doplnění</h3>
      <p style="font-size:12.5px;color:var(--ink-soft);margin-top:-8px;">${flagCount ? `Aktuálně je označeno ${flagCount} položek vlajkou ⚑ — zaměstnanec je uvidí zvýrazněné.` : 'Zatím nemáte označenou žádnou konkrétní položku — přidejte prosím alespoň obecný vzkaz níže.'}</p>
      <div class="field"><label>Vzkaz pro zaměstnance (nepovinné, zobrazí se mu v aplikaci)</label>
        <textarea id="rm-note" rows="4">${esc(r.returnNote || '')}</textarea>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="rm-cancel">Zrušit</button>
        <button class="btn btn-primary" id="rm-confirm">Vrátit zaměstnanci</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById('rm-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  document.getElementById('rm-confirm').addEventListener('click', () => {
    state.currentRecord.returnNote = document.getElementById('rm-note').value.trim();
    state.currentRecord.personalStatus = 'returned';
    persistCurrentRecord();
    backdrop.remove();
    render();
  });
}

const IMPORT_COMMON_FIELDS = [
  { key:'pracoviste', label:'Pracoviště', type:'select', options: () => ['', ...workplaceList()] },
  { key:'datum_nastupu', label:'Datum nástupu', type:'date' },
  { key:'typ_nastupu', label:'Typ nástupu', type:'select', options: () => ['', ...ONBOARDING_TYPES] },
  { key:'kategorie', label:'Kategorie', type:'select', options: () => ['', ...categoryNames()] },
  { key:'odbor_oddeleni', label:'Odbor / oddělení', type:'select', options: () => ['', ...departmentList()] },
  { key:'rezim_zamestnani', label:'Typ úvazku', type:'select', options: () => ['','Pracovní poměr','Služební poměr'] },
  { key:'doba_trvani_pomeru', label:'Doba trvání poměru', type:'select', options: () => ['','Na dobu neurčitou','Na dobu určitou'] },
];

const IMPORT_FIELD_TARGETS = [
  { key:'ignore', label:'— ignorovat —' },
  { key:'jmeno', label:'Jméno', apply:(r,v) => { r.personal.jmeno = String(v||'').trim(); } },
  { key:'prijmeni', label:'Příjmení', apply:(r,v) => { r.personal.prijmeni = String(v||'').trim(); } },
  { key:'plne_jmeno', label:'Příjmení Jméno, Titul (rozdělit automaticky)', apply:(r,v) => {
      const raw = String(v||'').trim();
      const parts = raw.split(',');
      const namePart = (parts[0]||'').trim();
      const titlePart = parts.slice(1).join(',').trim();
      if(titlePart) r.personal.titul_pred = titlePart;
      const tokens = namePart.split(/\s+/).filter(Boolean);
      if(tokens.length >= 2){
        r.personal.jmeno = tokens[tokens.length-1];
        r.personal.prijmeni = tokens.slice(0,-1).join(' ');
      } else if(tokens.length === 1){
        r.personal.prijmeni = tokens[0];
      }
    }
  },
  { key:'titul_pred', label:'Titul (před jménem)', apply:(r,v) => { r.personal.titul_pred = String(v||'').trim(); } },
  { key:'titul_za', label:'Titul (za jménem)', apply:(r,v) => { r.personal.titul_za = String(v||'').trim(); } },
  { key:'email_soukromy', label:'E-mail (soukromý)', apply:(r,v) => { r.personal.email_soukromy = String(v||'').trim(); } },
  { key:'email_prideleny', label:'Přidělený pracovní e-mail', apply:(r,v) => { r.checklist.email.value = String(v||'').trim(); if(r.checklist.email.value) r.checklist.email.checked = true; } },
  { key:'telefon_soukromy', label:'Telefon (soukromý)', apply:(r,v) => { r.personal.telefon_soukromy = String(v||'').trim(); } },
  { key:'osobni_cislo', label:'Osobní číslo', apply:(r,v) => { r.personal.osobni_cislo = String(v||'').trim(); } },
  { key:'odbor_oddeleni', label:'Odbor / oddělení', apply:(r,v) => { r.personal.odbor_oddeleni = String(v||'').trim(); } },
  { key:'pracoviste', label:'Pracoviště', apply:(r,v) => { r.personal.pracoviste = String(v||'').trim(); } },
  { key:'pozice', label:'Pracovní pozice', apply:(r,v) => { r.personal.pozice = String(v||'').trim(); } },
  { key:'rezim_zamestnani', label:'Typ úvazku (PP/SP → Pracovní/Služební poměr)', apply:(r,v) => {
      const t = String(v||'').trim().toUpperCase();
      if(t === 'SP' || t.includes('SLUŽEBN')) r.personal.rezim_zamestnani = 'Služební poměr';
      else if(t === 'PP' || t.includes('PRACOVN')) r.personal.rezim_zamestnani = 'Pracovní poměr';
    }
  },
  { key:'rozsah_uvazku', label:'Výše úvazku (číslo, např. 1 nebo 0,5)', apply:(r,v) => {
      const num = parseFloat(String(v==null?'':v).replace(',','.'));
      if(!isNaN(num)){
        r.personal.uvazek = String(num);
        r.personal.rozsah_uvazku = num >= 1 ? 'Plný úvazek' : 'Zkrácený úvazek';
      }
    }
  },
  { key:'doba_trvani', label:'Doba trvání poměru („neurčito“ / datum)', apply:(r,v) => {
      const s = String(v==null?'':v).trim().toLowerCase();
      if(!s) return;
      if(s.includes('neurč')) r.personal.doba_trvani_pomeru = 'Na dobu neurčitou';
      else r.personal.doba_trvani_pomeru = 'Na dobu určitou';
    }
  },
  { key:'datum_nastupu', label:'Datum nástupu', apply:(r,v) => {
      if(v instanceof Date) r.personal.datum_nastupu = v.toISOString().slice(0,10);
      else if(v) r.personal.datum_nastupu = String(v).trim();
    }
  },
  { key:'poznamka', label:'Poznámka (→ Kurzy a dovednosti)', apply:(r,v) => { r.personal.kurzy_dovednosti = String(v||'').trim(); } },
];

function guessFieldTarget(header){
  const norm = String(header||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const has = (...subs) => subs.some(s => norm.includes(s));
  if(has('prijmeni') && has('jmeno')) return 'plne_jmeno';
  if(has('prijmeni')) return 'prijmeni';
  if(has('jmeno')) return 'jmeno';
  if(has('titul') && has('za')) return 'titul_za';
  if(has('titul')) return 'titul_pred';
  if(has('mail')) return 'email_soukromy';
  if(has('telefon','mobil')) return 'telefon_soukromy';
  if(has('osobni cislo')) return 'osobni_cislo';
  if(has('oddeleni','utvar','organizacni')) return 'odbor_oddeleni';
  if(has('pozice')) return 'pozice';
  if(has('pomer','sluzebni')) return 'rezim_zamestnani';
  if(has('uvazek')) return 'rozsah_uvazku';
  if(has('smlouva')) return 'doba_trvani';
  if(has('nastup')) return 'datum_nastupu';
  if(has('poznamka')) return 'poznamka';
  return 'ignore';
}

const LOC_CODE_MAP = { MD:'MD', LET:'Letenská', OL:'Olomouc', PL:'Plzeň', BR:'Brno', CB:'České Budějovice', LTS:'Letiště' };

function capitalizeFirst(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// Vytěžení podkladu ve tvaru organigramu (units + people), jak ho produkuje appka na obsazování organigramu.
// Osoby se src:'DESÚ' (současní zaměstnanci, neprocházejí onboardingem) se vynechávají.
// Odbor/oddělení a pracoviště se berou z CÍLOVÉHO umístění (přes units[].positions[].person), ne z pole "unit" u osoby,
// které popisuje jejich SOUČASNÉ zařazení na původním úřadě.
async function readJsonOrgFile(file){
  const text = await file.text();
  const data = JSON.parse(text);
  const units = Array.isArray(data.units) ? data.units : [];
  const people = data.people && typeof data.people === 'object' ? data.people : {};
  const unitsById = {};
  units.forEach(u => { if(u && u.id) unitsById[u.id] = u; });
  function resolveLoc(unitId){
    let u = unitsById[unitId];
    let guard = 0;
    while(u && guard++ < 50){
      if(u.loc) return LOC_CODE_MAP[u.loc] || u.loc;
      u = u.parent ? unitsById[u.parent] : null;
    }
    return '';
  }
  const personToUnit = {};
  units.forEach(u => {
    (u.positions||[]).forEach(pos => {
      if(pos && pos.person) personToUnit[pos.person] = { unit: u, pos };
    });
  });

  const headers = ['Příjmení','Jméno','Titul','Původ','Odbor / oddělení','Pracoviště','Pozice','Úvazek'];
  const rows = [];
  Object.values(people).forEach(p => {
    if(!p || p.src === 'DESÚ') return;
    const raw = String(p.name||'').trim();
    const parts = raw.split(',');
    const namePart = (parts[0]||'').trim();
    const titlePart = parts.slice(1).join(',').trim();
    const tokens = namePart.split(/\s+/).filter(Boolean);
    let jmeno = '', prijmeni = '';
    if(tokens.length >= 2){ jmeno = tokens[tokens.length-1]; prijmeni = tokens.slice(0,-1).join(' '); }
    else if(tokens.length === 1){ prijmeni = tokens[0]; }
    const info = personToUnit[p.id];
    const odbor = info ? info.unit.name : '';
    const pracoviste = info ? resolveLoc(info.unit.id) : '';
    const pozice = info ? capitalizeFirst(info.pos.label) : '';
    rows.push([prijmeni, jmeno, titlePart, p.src||'', odbor, pracoviste, pozice, p.fte||'']);
  });
  const mapping = { 0:'prijmeni', 1:'jmeno', 2:'titul_pred', 3:'ignore', 4:'odbor_oddeleni', 5:'pracoviste', 6:'pozice', 7:'rozsah_uvazku' };
  return { headers, rows, mapping, groupColIdx: 3 };
}

async function readXlsxFile(file){
  const buffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if(!ws) return { headers:[], rows:[] };
  const rawHeader = ws.getRow(1).values;
  const headers = (rawHeader.slice(1)).map(v => {
    if(v && typeof v === 'object' && v.richText) return v.richText.map(t=>t.text).join('');
    return v == null ? '' : String(v).trim();
  });
  const lastCol = headers.length;
  const rows = [];
  for(let r=2; r<=ws.rowCount; r++){
    const raw = ws.getRow(r).values.slice(1, lastCol+1);
    const isEmpty = raw.every(v => v==null || String(v).trim()==='');
    if(isEmpty) continue;
    const rowVals = [];
    for(let i=0;i<lastCol;i++){
      let v = raw[i];
      if(v && typeof v === 'object' && v.richText) v = v.richText.map(t=>t.text).join('');
      else if(v && typeof v === 'object' && v.text) v = v.text;
      rowVals.push(v);
    }
    rows.push(rowVals);
  }
  return { headers, rows };
}

async function runImportBatch(){
  const cur = state.importCurrent;
  const year = new Date().getFullYear();
  let seqBase = state.index.filter(e => e.ref && e.ref.startsWith('OB-'+year)).length;
  const batch = [];
  cur.rows.forEach((row, i) => {
    const id = 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2,8) + i;
    seqBase += 1;
    const ref = `OB-${year}-${String(seqBase).padStart(4,'0')}`;
    const record = { personal: emptyPersonal(), checklist: emptyChecklist(), personalStatus:'draft', fieldFlags:{}, returnNote:'', assignedAdmin:'', assignedOffice:'', assignedFacilityStaff:'', firstDayDismissed:false, consentGiven:false, consentAt:null, linkGeneratedAt:null };
    Object.entries(cur.common || {}).forEach(([key, val]) => {
      if(val) record.personal[key] = val;
    });
    if(cur.groupColIdx != null){
      const groupVal = row[cur.groupColIdx] || '(bez původu)';
      const groupVals = (cur.groupCommon && cur.groupCommon[groupVal]) || {};
      Object.entries(groupVals).forEach(([key, val]) => {
        if(val) record.personal[key] = val;
      });
    }
    cur.headers.forEach((h, colIdx) => {
      const targetKey = cur.mapping[colIdx];
      if(!targetKey || targetKey === 'ignore') return;
      const target = IMPORT_FIELD_TARGETS.find(t => t.key === targetKey);
      if(target && target.apply){
        try{ target.apply(record, row[colIdx]); }catch(e){ console.error('import apply failed for column', h, e); }
      }
    });
    const {total, done} = checklistTotals(record.checklist, record.personal.kategorie, 'it');
    batch.push({
      id, record,
      entry: { id, ref, jmeno: record.personal.jmeno||'', prijmeni: record.personal.prijmeni||'', pozice: record.personal.pozice||'', pracoviste: record.personal.pracoviste||'', datumNastupu: record.personal.datum_nastupu||'', created: Date.now()+i, personalStatus:'draft', itTotal: total, itDone: done, hrMissingCount: missingHrRequiredFields(record).length, linkGeneratedAt: null }
    });
  });
  let saved = 0;
  for(const item of batch){
    state.index.push(item.entry);
    const ok = await saveRecord(item.id, item.record);
    if(ok){ saved++; } else { const idx = state.index.findIndex(e=>e.id===item.id); if(idx!==-1) state.index.splice(idx,1); }
  }
  await saveIndex();
  return { saved, total: batch.length };
}

// ==== Skutečná struktura Zaváděcího formuláře (ZHLAV) + satelitní tabulky ====
function ynCode(val){ return val === 'Ano' ? '1' : (val === 'Ne' ? '0' : ''); }
function countryCode(text){
  const t = (text||'').trim();
  if(!t) return '';
  if(t === 'Česká republika') return '203';
  return t; // cizí státy: personální doplní kód ručně dle číselníku tstat
}
function insuranceCodeOnly(val){
  if(!val) return '';
  const m = /^(\d+)/.exec(val);
  return m ? m[1] : val;
}
function ppvdrCode(p){
  if(p.rezim_zamestnani === 'Služební poměr') return '200';
  if(p.typ_pomeru === 'DPČ') return '618';
  if(p.typ_pomeru === 'DPP') return '708';
  return '101';
}
function sdouvzCode(p){
  if(p.doba_trvani_pomeru === 'Na dobu neurčitou') return '1';
  if(p.doba_trvani_pomeru === 'Na dobu určitou') return '2';
  return '';
}
const INVALIDITA_CODES = {'Žádná':'0','Invalidita 1. nebo 2. stupně':'1','Invalidita 3. stupně':'2','Držitel průkazu ZTP/P':'3','Invalidita 1./2. stupně a zároveň ZTP/P':'4'};
const ZPSCH_CODES = {'Invalidní v 1. nebo 2. stupni':'1','S těžším zdravotním postižením':'2','Zdravotně znevýhodněná osoba':'3'};
const ZPSCHZK_CODES = {'Průkaz I. stupně (TP)':'1','Průkaz II. stupně (ZTP)':'2','Průkaz III. stupně (ZTP/P)':'3'};
const TDVV_CODES = {'Absolvent školy':'911','Nástup z evidence úřadu práce':'920','Ostatní osoby nastupující poprvé':'921','Osoba měnící zaměstnání':'931','Nástup z výběrového řízení':'991'};
const ZPODM_CODES = {'Hodinová mzda':'1','Měsíční plat/mzda':'2'};
const TYPPV_CODES = {'Odměňování podle § 5 NV':'1','Pásmové odměňování (§ 6 NV) s platovými postupy':'2','Pásmové odměňování (§ 6 NV) bez platových postupů':'3'};

const ZHLAV_POVINNE_KODY = new Set(['oscis','upljmeno','rocis','statp','zivmi','rozuc','predvls','predvlp','predvle','predvlm','potpri','zpo','zpzpoj','danrez','stazas','ppvza','sdouvz','ppvlim','vyods','pracvz','ppvdr','stspr','pocrd','vedouci','minmzda','tarif','zpodm','zmr','rozst','rozin','rozpr','mzdza','plasku','plastu','rodpr','mistn','dovpj','dovpmt','dovup','prvpl','inval','stud','zvzda','ztppm']);

function zhlavColumns(){
  const vc = (state.settings && state.settings.vemaConstants) || {};
  return [
    {code:'oscis', get:p=>p.osobni_cislo},
    {code:'upljmeno', get:p=>[p.titul_pred,p.jmeno,p.prijmeni,p.titul_za].filter(Boolean).join(' ')},
    {code:'rocis', get:p=>p.rodne_cislo},
    {code:'statp', get:p=>countryCode(p.statni_prislusnost)},
    {code:'zaloha', get:p=>''},
    {code:'adrz', get:p=>''},
    {code:'adrv', get:p=>''},
    {code:'vypod', get:p=>'0'},
    {code:'banz', get:p=>''},
    {code:'banv', get:p=>p.cislo_uctu ? '1' : ''},
    {code:'bancis', get:p=>''},
    {code:'zivmi', get:p=>''},
    {code:'rozuc', get:p=>''},
    {code:'predvls', get:p=>'1'},
    {code:'predvlp', get:p=>'1'},
    {code:'predvle', get:p=>'0'},
    {code:'predvlm', get:p=>'0'},
    {code:'potpri', get:p=>'1'},
    {code:'ospublu', get:p=>'0'},
    {code:'redgdpr', get:p=>'0'},
    {code:'txtgdpr', get:p=>''},
    {code:'zpo', get:p=>insuranceCodeOnly(p.zdravotni_pojistovna)},
    {code:'zpzpoj', get:p=>'0'},
    {code:'uchazam', get:p=>''},
    {code:'zpsch', get:p=>ZPSCH_CODES[p.zdrav_postizeni_ozp] || ''},
    {code:'zpschko', get:p=>p.zdrav_rozhodnuti_platnost_do},
    {code:'vyjozp', get:p=>''},
    {code:'zpschzk', get:p=>ZPSCHZK_CODES[p.prukaz_zdravotni] || ''},
    {code:'zpschzko', get:p=>p.zdrav_rozhodnuti_platnost_do},
    {code:'jpnporg', get:p=>''},
    {code:'jsnporg', get:p=>''},
    {code:'speccp', get:p=>''},
    {code:'spoci', get:p=>''},
    {code:'cicipo', get:p=>''},
    {code:'danrez', get:p=>'0'},
    {code:'stazas', get:p=>'0'},
    {code:'ppvza', get:p=>p.datum_nastupu},
    {code:'ppvko', get:p=>''},
    {code:'ppvzd', get:p=>TDVV_CODES[p.duvod_vzniku_pomeru] || ''},
    {code:'ppvkd', get:p=>''},
    {code:'sdouvz', get:p=>sdouvzCode(p)},
    {code:'ppvlim', get:p=>sdouvzCode(p)==='2' ? '1' : '0'},
    {code:'bezpr', get:p=>'0'},
    {code:'konpv', get:p=>''},
    {code:'vyods', get:p=>'0'},
    {code:'pmods', get:p=>''},
    {code:'dsmlouva', get:p=>''},
    {code:'csmlouva', get:p=>''},
    {code:'zkusd', get:p=>p.zkusebni_doba},
    {code:'pracvz', get:p=>workplaceVemaCode(p.pracoviste)},
    {code:'utvar', get:p=>p.odbor_oddeleni},
    {code:'ppvdr', get:p=>ppvdrCode(p)},
    {code:'osvpoj', get:p=>'0'},
    {code:'eviod', get:p=>'0'},
    {code:'zames', get:p=>''},
    {code:'povolani', get:p=>''},
    {code:'skjkz', get:p=>''},
    {code:'czicse', get:p=>({'Zaměstnanec':'1','Zaměstnavatel':'2','OSVČ (samostatně výdělečně činná osoba)':'3','Pomáhající rodinný příslušník':'4','Člen produkčního družstva':'5'}[p.klasifikace_postaveni] || '')},
    {code:'stspr', get:p=>vc.stspr||''},
    {code:'pocrd', get:p=>vc.pocrd||''},
    {code:'vedouci', get:p=>ynCode(p.vedouci)},
    {code:'stupr', get:p=>p.stupen_rizeni ? p.stupen_rizeni.replace('. stupeň','') : ''},
    {code:'skuprac', get:p=>''},
    {code:'pltr', get:p=>p.platova_trida},
    {code:'dopldo', get:p=>''},
    {code:'dopldod', get:p=>''},
    {code:'minmzda', get:p=>''},
    {code:'vypuv', get:p=>''},
    {code:'limpr', get:p=>''},
    {code:'limnepp', get:p=>''},
    {code:'tarif', get:p=>p.tarifni_plat},
    {code:'typpv', get:p=>TYPPV_CODES[p.typ_platoveho_vymeru] || ''},
    {code:'dzpvk', get:p=>''},
    {code:'zpodm', get:p=>ZPODM_CODES[p.zpusob_odmenovani] || ''},
    {code:'zmr', get:p=>'0'},
    {code:'rozst', get:p=>''},
    {code:'rozin', get:p=>p.individualni_rozvrh},
    {code:'rozprh', get:p=>p.rozsah_uvazku==='Zkrácený úvazek' ? p.zkraceny_uvazek_hodiny : ''},
    {code:'rozpr', get:p=>p.rozsah_uvazku==='Zkrácený úvazek' ? p.zkraceny_uvazek_procenta : ''},
    {code:'odprdo', get:p=>''},
    {code:'plpost', get:p=>ynCode(p.nastaveni_platoveho_postupu)},
    {code:'zupltar', get:p=>p.zpusob_urceni_tarifu},
    {code:'mzdza', get:p=>p.platova_trida},
    {code:'skupzm', get:p=>p.skupina_praci_zaruc_mzda},
    {code:'plasku', get:p=>p.platova_skupina},
    {code:'plastu', get:p=>p.platovy_stupen},
    {code:'zvodm', get:p=>''},
    {code:'nahsv', get:p=>''},
    {code:'nahdov', get:p=>''},
    {code:'prumt', get:p=>vc.prumt||'5'},
    {code:'prude', get:p=>''},
    {code:'pruths', get:p=>vc.pruths||'40'},
    {code:'rodpr', get:p=>p.rodne_prijmeni},
    {code:'prijm1', get:p=>p.prijmeni_byvale_1},
    {code:'prijm2', get:p=>p.prijmeni_byvale_2},
    {code:'statn', get:p=>countryCode(p.stat_narozeni)},
    {code:'okresn', get:p=>p.okres_narozeni},
    {code:'obecn', get:p=>p.misto_narozeni},
    {code:'mistn', get:p=>p.misto_narozeni},
    {code:'okresp', get:p=>workplaceLocation(p.pracoviste).okres},
    {code:'obecp', get:p=>workplaceLocation(p.pracoviste).obec},
    {code:'sidpra', get:p=>workplaceLocation(p.pracoviste).sidlo},
    {code:'email', get:p=>p.email_soukromy},
    {code:'dobvz', get:p=>p.obor},
    {code:'dstvz', get:p=>p.stupen_vzdelani},
    {code:'rokuk', get:p=>p.datum_ukonceni_vzdelani},
    {code:'pobvz', get:p=>''},
    {code:'pstvz', get:p=>''},
    {code:'prepra', get:p=>''},
    {code:'splvz', get:p=>''},
    {code:'vyjvzko', get:p=>''},
    {code:'drokdenz', get:p=>p.datum_nastupu},
    {code:'doprarz', get:p=>''},
    {code:'dopradz', get:p=>''},
    {code:'odprrerz', get:p=>''},
    {code:'odprredz', get:p=>''},
    {code:'odprobrz', get:p=>''},
    {code:'odprobdz', get:p=>''},
    {code:'odproz', get:p=>'0'},
    {code:'odpdoz', get:p=>'0'},
    {code:'cisop', get:p=>p.cislo_op},
    {code:'cispa', get:p=>p.cislo_pasu},
    {code:'vojak', get:p=>ynCode(p.vojak)},
    {code:'duchk', get:p=>''},
    {code:'duchp', get:p=>p.pocet_vychovanych_deti},
    {code:'denporod', get:p=>''},
    {code:'dovpj', get:p=>''},
    {code:'dovpmt', get:p=>''},
    {code:'dnyvyp', get:p=>''},
    {code:'dovup', get:p=>''},
    {code:'dovdoz', get:p=>''},
    {code:'dovplo', get:p=>''},
    {code:'dovdocek', get:p=>''},
    {code:'dovsou', get:p=>''},
    {code:'dovplcek', get:p=>''},
    {code:'dovdlo', get:p=>''},
    {code:'prvpl', get:p=>ynCode(p.prohlaseni_poplatnika)},
    {code:'inval', get:p=>INVALIDITA_CODES[p.invalidita] || ''},
    {code:'stud', get:p=>ynCode(p.student_pripravujici_se)},
    {code:'studko', get:p=>p.student_potvrzeni_do},
    {code:'zvzda', get:p=>''},
    {code:'prijmm', get:p=>p.prijmeni_manzela},
    {code:'jmenom', get:p=>p.jmeno_manzela},
    {code:'rocism', get:p=>p.rodne_cislo_manzela},
    {code:'ztppm', get:p=>ynCode(p.manzel_ztpp)},
    {code:'pracv', get:p=>workplaceVemaCode(p.pracoviste)},
  ];
}

const SATELLITE_TABLES = [
  {
    name: 'Adresy',
    header: ['oscis','adrcis','ucel','prij','ulice','cp','co','obec','psc','posta','stat','telefon','indadr'],
    rows(oscis, p){
      return [[oscis, '1', 'Trvalá', '', p.trvale_ulice, p.trvale_cp, p.trvale_co, p.trvale_obec, p.trvale_psc, '', countryCode(p.trvale_stat), p.telefon_soukromy, '']];
    }
  },
  {
    name: 'Bankovni_ucty',
    header: ['oscis-A','cban-A','ucet-A','smer-A','kodsp-A','vsymb-A','ksymb-A','ssymb-A','funkce-A'],
    rows(oscis, p){
      if(!p.cislo_uctu) return [];
      return [[oscis, '1', p.cislo_uctu, p.kod_banky, '', '', '', '', '1']];
    }
  },
  {
    name: 'Deti',
    header: ['oscis-A','zapl-A','detid-A','prijmdd-A','jmenodd-A','rocisd-A','rprna-A','pohld-A','mistnd-A','adrbd-A','vyzos-A','vyzosko-A','ztpp-A','ztppko-A'],
    rows(oscis, p){
      return (p.deti||[]).map((d,i) => [oscis, p.datum_nastupu, String(i+1), d.prijmeni, d.jmeno, d.rodne_cislo, d.datum_narozeni, '', d.bydliste, '', ynCode(d.danove_zvyhodneni), '', ynCode(d.ztpp), '']);
    }
  },
  {
    name: 'Vzdelani',
    header: ['oscis-A','rokz-A','roku-A','stupen-A','obor-A','skola-A','sidlo-A','druhzk-A'],
    rows(oscis, p){
      if(!p.skola && !p.stupen_vzdelani) return [];
      return [[oscis, p.rok_zahajeni, p.datum_ukonceni_vzdelani || p.rok_ukonceni, p.stupen_vzdelani, p.obor, p.skola, p.sidlo_skoly, p.druh_zkousky]];
    }
  },
  {
    name: 'Predchozi_zamestnani',
    header: ['oscis-A','zamod-A','zamdo-A','zamorg-A','sidorg-A','zamvykz-A'],
    rows(oscis, p){
      return (p.praxe||[]).map(x => [oscis, x.od, x.do, x.organizace, x.sidlo, x.pracovni_zarazeni]);
    }
  },
  {
    name: 'Znalosti_jazyky',
    header: ['oscis-A','znnaz-A','znstup-A','znzkou-A','popis-A'],
    rows(oscis, p){
      return (p.jazyky||[]).map(j => [oscis, j.jazyk, j.stupen_znalosti, j.stupen_osvedceni, j.pouzivani]);
    }
  },
];

async function generateVemaExport(ids){
  const records = [];
  for(const id of ids){
    const record = await loadRecord(id);
    const entry = state.index.find(e => e.id === id);
    records.push({ id, entry, record });
  }
  const workbook = new ExcelJS.Workbook();

  const cols = zhlavColumns();
  const sheetZhlav = workbook.addWorksheet('ZHLAV');
  sheetZhlav.addRow(cols.map(c => c.code + '-A'));
  records.forEach(({record}) => {
    sheetZhlav.addRow(cols.map(c => { try{ return c.get(record.personal) ?? ''; }catch(e){ return ''; } }));
  });
  sheetZhlav.getRow(1).eachCell((cell, colIdx) => {
    const povinne = ZHLAV_POVINNE_KODY.has(cols[colIdx-1].code);
    cell.fill = { type:'pattern', pattern:'solid', fgColor: { argb: povinne ? 'FFFF0000' : 'FF70AD47' } };
    cell.font = { bold:true, color: { argb: povinne ? 'FFFFFFFF' : 'FF000000' } };
  });
  for(let i=0; i<cols.length; i++) sheetZhlav.getColumn(i+1).width = 14;

  SATELLITE_TABLES.forEach(sheetDef => {
    const ws = workbook.addWorksheet(sheetDef.name);
    ws.addRow(sheetDef.header);
    records.forEach(({record}) => {
      const oscis = record.personal.osobni_cislo || '';
      sheetDef.rows(oscis, record.personal).forEach(row => ws.addRow(row));
    });
    for(let i=0; i<sheetDef.header.length; i++) ws.getColumn(i+1).width = 14;
  });

  const now = new Date();
  const stamp = now.toISOString().slice(0,16).replace(/[-:T]/g,'').replace(/(\d{8})(\d{4})/, '$1-$2');
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VEMA_export_${stamp}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const nowIso = now.toISOString();
  for(const {id, record} of records){
    record.vemaExportedAt = nowIso;
    await saveRecord(id, record);
    const idxEntry = state.index.find(e => e.id === id);
    if(idxEntry) idxEntry.vemaExportedAt = nowIso;
  }
  await saveIndex();
}

function openNewModal(){
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const workplaceOpts = ['', ...workplaceList()].map(w => `<option value="${esc(w)}">${esc(w || '— vyberte —')}</option>`).join('');
  const categoryOpts = ['', ...categoryNames()].map(c => `<option value="${esc(c)}">${esc(c || '— vyberte —')}</option>`).join('');
  const positionOpts = ['', ...positionList()].map(p => `<option value="${esc(p)}">${esc(p || '— vyberte —')}</option>`).join('');
  const onboardingTypeOpts = ['', ...ONBOARDING_TYPES].map(t => `<option value="${esc(t)}">${esc(t || '— vyberte —')}</option>`).join('');
  const supervisorOpts = ['', ...supervisorList()].map(s => `<option value="${esc(s)}">${esc(s || '— vyberte —')}</option>`).join('');
  const employmentRegimeOpts = ['', 'Pracovní poměr', 'Služební poměr'].map(v => `<option value="${esc(v)}">${esc(v || '— vyberte —')}</option>`).join('');
  const employmentScopeOpts = ['', 'Plný úvazek', 'Zkrácený úvazek'].map(v => `<option value="${esc(v)}">${esc(v || '— vyberte —')}</option>`).join('');
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Nový onboardingový spis</h3>
      <div class="field"><label>Jméno *</label><input id="nm-jmeno" type="text"></div>
      <div class="field"><label>Příjmení *</label><input id="nm-prijmeni" type="text"></div>
      <div class="field"><label>Pracovní pozice</label><select id="nm-pozice">${positionOpts}</select></div>
      <div class="field"><label>Pracoviště *</label><select id="nm-pracoviste">${workplaceOpts}</select></div>
      <div class="field"><label>Typ nástupu *</label><select id="nm-typ-nastupu">${onboardingTypeOpts}</select></div>
      <div class="field"><label>Kategorie *</label><select id="nm-kategorie">${categoryOpts}</select></div>
      <div class="field"><label>Přímý nadřízený</label><select id="nm-nadrizeny">${supervisorOpts}</select></div>
      <div class="field"><label>Typ úvazku</label><select id="nm-rezim">${employmentRegimeOpts}</select></div>
      <div class="field"><label>Rozsah úvazku</label><select id="nm-rozsah">${employmentScopeOpts}</select></div>
      <div class="field"><label>Datum nástupu</label><input id="nm-datum" type="date" value="2027-01-01"></div>
      <div id="nm-error" style="display:none;color:var(--red);font-size:12.5px;margin:-8px 0 12px;"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="nm-cancel">Zrušit</button>
        <button class="btn btn-primary" id="nm-create">Založit spis</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById('nm-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  const createBtn = document.getElementById('nm-create');
  let creating = false;
  let duplicateWarned = false;
  createBtn.addEventListener('click', async () => {
    if(creating) return;
    const jmeno = document.getElementById('nm-jmeno').value.trim();
    const prijmeni = document.getElementById('nm-prijmeni').value.trim();
    const pozice = document.getElementById('nm-pozice').value.trim();
    const pracoviste = document.getElementById('nm-pracoviste').value;
    const typNastupu = document.getElementById('nm-typ-nastupu').value;
    const kategorie = document.getElementById('nm-kategorie').value;
    const nadrizeny = document.getElementById('nm-nadrizeny').value;
    const rezimZamestnani = document.getElementById('nm-rezim').value;
    const rozsahUvazku = document.getElementById('nm-rozsah').value;
    const datum = document.getElementById('nm-datum').value;
    const errBox = document.getElementById('nm-error');
    if(!jmeno || !prijmeni){
      errBox.textContent = 'Vyplňte prosím jméno a příjmení.';
      errBox.style.display = 'block';
      duplicateWarned = false;
      createBtn.textContent = 'Založit spis';
      return;
    }
    if(!duplicateWarned){
      const dup = state.index.find(e => e.jmeno.trim().toLowerCase() === jmeno.toLowerCase() && e.prijmeni.trim().toLowerCase() === prijmeni.toLowerCase());
      if(dup){
        errBox.innerHTML = `⚠ V rejstříku už existuje spis pro <strong>${esc(dup.jmeno)} ${esc(dup.prijmeni)}</strong> (${esc(dup.ref)}). Pokud jde o stejnou osobu, spis prosím nezakládejte znovu. Kliknutím na tlačítko založíte spis i tak.`;
        errBox.style.display = 'block';
        duplicateWarned = true;
        createBtn.textContent = 'Přesto založit spis';
        return;
      }
    }
    creating = true;
    createBtn.disabled = true;
    createBtn.textContent = 'Zakládám…';
    errBox.style.display = 'none';
    const id = 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    const year = new Date().getFullYear();
    const seq = (state.index.filter(e => e.ref && e.ref.startsWith('OB-'+year)).length + 1).toString().padStart(4,'0');
    const ref = `OB-${year}-${seq}`;
    const record = { personal: emptyPersonal(), checklist: emptyChecklist(), personalStatus:'draft', fieldFlags:{}, returnNote:'', assignedAdmin:'', assignedOffice:'', assignedFacilityStaff:'', firstDayDismissed:false, consentGiven:false, consentAt:null, linkGeneratedAt:null };
    record.personal.jmeno = jmeno;
    record.personal.prijmeni = prijmeni;
    record.personal.pozice = pozice;
    record.personal.pracoviste = pracoviste;
    record.personal.typ_nastupu = typNastupu;
    record.personal.kategorie = kategorie;
    record.personal.nadrizeny = nadrizeny;
    record.personal.rezim_zamestnani = rezimZamestnani;
    record.personal.rozsah_uvazku = rozsahUvazku;
    record.personal.datum_nastupu = datum;
    ensureSuggestedEmail(record);
    const {total, done} = checklistTotals(record.checklist, kategorie, 'it');
    state.index.push({ id, ref, jmeno, prijmeni, pozice, pracoviste, datumNastupu: datum, created: Date.now(), personalStatus:'draft', itTotal: total, itDone: done, hrMissingCount: missingHrRequiredFields(record).length, linkGeneratedAt: null });
    await saveIndex();
    await saveRecord(id, record);
    backdrop.remove();
    state.view = 'list';
    render();
  });
}

async function openQuickEditModal(id){
  const record = await loadRecord(id);
  const idxEntry = state.index.find(e => e.id === id);
  if(!record || !idxEntry) return;
  const p = record.personal;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const opt = (val, label) => `<option value="${esc(val)}">${esc(label || val || '— vyberte —')}</option>`;
  const workplaceOpts = ['', ...workplaceList()].map(w => `<option value="${esc(w)}" ${p.pracoviste===w?'selected':''}>${esc(w || '— vyberte —')}</option>`).join('');
  const categoryOpts = ['', ...categoryNames()].map(c => `<option value="${esc(c)}" ${p.kategorie===c?'selected':''}>${esc(c || '— vyberte —')}</option>`).join('');
  const positionOpts = ['', ...positionList()].map(x => `<option value="${esc(x)}" ${p.pozice===x?'selected':''}>${esc(x || '— vyberte —')}</option>`).join('');
  const onboardingTypeOpts = ['', ...ONBOARDING_TYPES].map(t => `<option value="${esc(t)}" ${p.typ_nastupu===t?'selected':''}>${esc(t || '— vyberte —')}</option>`).join('');
  const supervisorOpts = ['', ...supervisorList()].map(s => `<option value="${esc(s)}" ${p.nadrizeny===s?'selected':''}>${esc(s || '— vyberte —')}</option>`).join('');
  const employmentRegimeOpts = ['', 'Pracovní poměr', 'Služební poměr'].map(v => `<option value="${esc(v)}" ${p.rezim_zamestnani===v?'selected':''}>${esc(v || '— vyberte —')}</option>`).join('');
  const employmentScopeOpts = ['', 'Plný úvazek', 'Zkrácený úvazek'].map(v => `<option value="${esc(v)}" ${p.rozsah_uvazku===v?'selected':''}>${esc(v || '— vyberte —')}</option>`).join('');
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Rychlé doplnění základních údajů</h3>
      <p style="font-size:12.5px;color:var(--ink-faint);margin:-10px 0 14px;">${esc(idxEntry.ref)} — stejná pole jako při založení nového spisu. Zbytek (osobní/mzdové údaje) doplníte v otevřeném spisu.</p>
      <div class="field"><label>Jméno *</label><input id="qe-jmeno" type="text" value="${esc(p.jmeno||'')}"></div>
      <div class="field"><label>Příjmení *</label><input id="qe-prijmeni" type="text" value="${esc(p.prijmeni||'')}"></div>
      <div class="field"><label>Pracovní pozice</label><select id="qe-pozice">${positionOpts}</select></div>
      <div class="field"><label>Pracoviště *</label><select id="qe-pracoviste">${workplaceOpts}</select></div>
      <div class="field"><label>Typ nástupu *</label><select id="qe-typ-nastupu">${onboardingTypeOpts}</select></div>
      <div class="field"><label>Kategorie *</label><select id="qe-kategorie">${categoryOpts}</select></div>
      <div class="field"><label>Přímý nadřízený</label><select id="qe-nadrizeny">${supervisorOpts}</select></div>
      <div class="field"><label>Typ úvazku</label><select id="qe-rezim">${employmentRegimeOpts}</select></div>
      <div class="field"><label>Rozsah úvazku</label><select id="qe-rozsah">${employmentScopeOpts}</select></div>
      <div class="field"><label>Datum nástupu</label><input id="qe-datum" type="date" value="${esc(p.datum_nastupu||'')}"></div>
      <div id="qe-error" style="display:none;color:var(--red);font-size:12.5px;margin:-8px 0 12px;"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="qe-cancel">Zrušit</button>
        <button class="btn btn-primary" id="qe-save">Uložit</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById('qe-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  const saveBtn = document.getElementById('qe-save');
  let saving = false;
  saveBtn.addEventListener('click', async () => {
    if(saving) return;
    const jmeno = document.getElementById('qe-jmeno').value.trim();
    const prijmeni = document.getElementById('qe-prijmeni').value.trim();
    const errBox = document.getElementById('qe-error');
    if(!jmeno || !prijmeni){
      errBox.textContent = 'Vyplňte prosím jméno a příjmení.';
      errBox.style.display = 'block';
      return;
    }
    saving = true;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Ukládám…';
    p.jmeno = jmeno;
    p.prijmeni = prijmeni;
    p.pozice = document.getElementById('qe-pozice').value.trim();
    p.pracoviste = document.getElementById('qe-pracoviste').value;
    p.typ_nastupu = document.getElementById('qe-typ-nastupu').value;
    p.kategorie = document.getElementById('qe-kategorie').value;
    p.nadrizeny = document.getElementById('qe-nadrizeny').value;
    p.rezim_zamestnani = document.getElementById('qe-rezim').value;
    p.rozsah_uvazku = document.getElementById('qe-rozsah').value;
    p.datum_nastupu = document.getElementById('qe-datum').value;
    ensureSuggestedEmail(record);
    idxEntry.jmeno = jmeno;
    idxEntry.prijmeni = prijmeni;
    idxEntry.pozice = p.pozice;
    idxEntry.pracoviste = p.pracoviste;
    idxEntry.datumNastupu = p.datum_nastupu;
    idxEntry.hrMissingCount = missingHrRequiredFields(record).length;
    await saveRecord(id, record);
    await saveIndex();
    backdrop.remove();
    render();
  });
}

function openDeleteAllModal(){
  const count = state.index.length;
  if(count === 0) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Smazat všechny spisy?</h3>
      <p style="font-size:13.5px;color:var(--ink-soft);">Chystáte se trvale smazat <strong>všech ${count} spisů</strong> v rejstříku, včetně vyplněných údajů a stavu checklistu u každého z nich. Tuto akci nelze vrátit zpět.</p>
      <div class="field"><label>Pro potvrzení napište SMAZAT</label><input id="dam-confirm-text" type="text"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="dam-cancel">Zrušit</button>
        <button class="btn btn-danger" id="dam-confirm" disabled>Trvale smazat vše</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById('dam-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  const confirmBtn = document.getElementById('dam-confirm');
  const confirmInput = document.getElementById('dam-confirm-text');
  confirmInput.addEventListener('input', () => {
    confirmBtn.disabled = confirmInput.value.trim().toUpperCase() !== 'SMAZAT';
  });
  confirmBtn.addEventListener('click', async () => {
    backdrop.remove();
    await deleteAllEmployees();
  });
}

async function deleteAllEmployees(){
  const ids = state.index.map(e => e.id);
  state.index = [];
  await saveIndex();
  for(const id of ids){
    try{ await window.storage.delete(recordKey(id), true); }catch(e){}
  }
  render();
}

function openSubmitConfirmModal(){
  const r = state.currentRecord;
  const isResend = (r.personalStatus === 'returned');
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>${isResend ? 'Odeslat opravené údaje?' : 'Odeslat údaje personálnímu oddělení?'}</h3>
      <p style="font-size:13.5px;color:var(--ink-soft);">Po odeslání formulář nepůjde dál upravovat, dokud ho personální oddělení případně nevrátí k doplnění. Klidně to ale později zvládnete i sami tlačítkem „Stáhnout zpět a opravit".</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="sc-cancel">Zpět k úpravám</button>
        <button class="btn btn-primary" id="sc-confirm">Ano, odeslat</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById('sc-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  document.getElementById('sc-confirm').addEventListener('click', () => {
    backdrop.remove();
    state.currentRecord.personalStatus = 'submitted';
    persistCurrentRecord();
    window.scrollTo({top:0, behavior:'smooth'});
    render();
  });
}

function openWithdrawModal(){
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Stáhnout odeslané údaje zpět?</h3>
      <p style="font-size:13.5px;color:var(--ink-soft);">Formulář se znovu odemkne k úpravám. Personální oddělení uvidí, že zatím čeká na vaše doplnění, ne na kontrolu.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="wm-cancel">Zrušit</button>
        <button class="btn btn-primary" id="wm-confirm">Ano, stáhnout zpět</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById('wm-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  document.getElementById('wm-confirm').addEventListener('click', () => {
    backdrop.remove();
    state.currentRecord.personalStatus = 'draft';
    persistCurrentRecord();
    render();
  });
}

function openLeaveConfirmModal(){
  if(document.getElementById('leave-confirm-modal')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'leave-confirm-modal';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Opustit aplikaci?</h3>
      <p style="font-size:13.5px;color:var(--ink-soft);">Chystáte se opustit aplikaci tlačítkem zpět v prohlížeči.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="leave-stay">Zůstat v aplikaci</button>
        <button class="btn btn-danger" id="leave-confirm">Opustit aplikaci</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById('leave-stay').addEventListener('click', () => {
    backdrop.remove();
    history.pushState(null, '', location.href);
  });
  document.getElementById('leave-confirm').addEventListener('click', () => {
    backdrop.remove();
    history.back();
  });
}

function openDeleteModal(id){
  const entry = state.index.find(e => e.id === id);
  if(!entry) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Smazat spis zaměstnance?</h3>
      <p style="font-size:13.5px;color:var(--ink-soft);">Chystáte se trvale smazat spis <strong>${esc(entry.jmeno)} ${esc(entry.prijmeni)}</strong> (${esc(entry.ref)}) včetně všech vyplněných údajů a stavu checklistu. Tuto akci nelze vrátit zpět.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="dm-cancel">Zrušit</button>
        <button class="btn btn-danger" id="dm-confirm">Trvale smazat</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById('dm-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  document.getElementById('dm-confirm').addEventListener('click', async () => {
    backdrop.remove();
    await deleteEmployee(id);
  });
}

async function deleteEmployee(id){
  state.index = state.index.filter(e => e.id !== id);
  await saveIndex();
  try{ await window.storage.delete(recordKey(id), true); }catch(e){}
  render();
}

async function openDetail(id){
  state.currentId = id;
  state.currentRecord = await loadRecord(id);
  if(ensureSuggestedEmail(state.currentRecord)) persistRecordOnly();
  state.view = 'detail';
  state.tab = availableTabs()[0];
  state.collapsed = {};
  state.wizardStep = 0; state.wizardStepError = false; state.showMissingHighlights = false;
  state.firstDayHiddenSession = false; state.firstDayDismissPrompt = false;
  render();
}

(async function init(){
  if(typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function'){
    document.getElementById('app').innerHTML = `<div style="max-width:480px;margin:80px auto;text-align:center;font-family:sans-serif;">
      <h2>Nepodařilo se načíst knihovnu Supabase</h2>
      <p style="color:#888;font-size:13px;">Zkontrolujte připojení k internetu a zkuste stránku obnovit (F5). Pokud problém přetrvá, může externí skript blokovat firewall/proxy sítě.</p>
    </div>`;
    return;
  }
  // ==== Supabase — konfigurace a napojení ====
  // Sem doplňte 2 hodnoty z vašeho Supabase projektu (Project Settings → API):
  const SUPABASE_URL = window.SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  if(!SUPABASE_URL || SUPABASE_URL.includes('VASE-PROJEKT') || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('VLOZTE-SEM')){
    document.getElementById('app').innerHTML = `<div style="max-width:480px;margin:80px auto;text-align:center;font-family:var(--font-body);">
      <h2 style="font-family:var(--font-display);">Appka ještě není nastavená</h2>
      <p style="color:var(--ink-faint);font-size:13px;">V souboru <code>config.js</code> chybí vyplněné SUPABASE_URL a SUPABASE_ANON_KEY (najdete je v Supabase → Project Settings → API).</p>
    </div>`;
    return;
  }
  window.storage = {
    async get(key, shared){
      const { data, error } = await sb.from('kv_store').select('value').eq('key', key).maybeSingle();
      if(error) throw error;
      if(!data) throw new Error('not found: ' + key);
      return { key, value: data.value, shared: true };
    },
    async set(key, value, shared){
      const { error } = await sb.from('kv_store').upsert({ key, value, updated_at: new Date().toISOString() });
      if(error) throw error;
      return { key, value, shared: true };
    },
    async delete(key, shared){
      const { error } = await sb.from('kv_store').delete().eq('key', key);
      if(error) throw error;
      return { key, deleted: true, shared: true };
    },
  };

  const hash = location.hash;
  const isEmployeeLink = hash.startsWith('#z/');

  window.appLogout = async function(){
    await sb.auth.signOut();
    location.href = location.pathname;
  };

  // ==== Přihlašovací obrazovka pro personální/IT (zaměstnanecký odkaz login nepotřebuje) ====
  if(!isEmployeeLink){
    const { data: { session } } = await sb.auth.getSession();
    if(!session){
      renderLoginScreen();
      sb.auth.onAuthStateChange((event, newSession) => {
        if(newSession){ state.userEmail = newSession.user.email; startApp(); }
      });
      return;
    }
    state.userEmail = session.user.email;
  }
  startApp();

  function renderLoginScreen(){
    const app = document.getElementById('app');
    app.innerHTML = `
      <div style="max-width:360px;margin:80px auto;text-align:center;font-family:var(--font-body);">
        <h2 style="font-family:var(--font-display);margin-bottom:6px;">Onboarding — přihlášení</h2>
        <p style="color:var(--ink-faint);font-size:13px;margin-bottom:20px;">Pro personální oddělení a IT/provoz.</p>

        <input id="login-email" type="email" placeholder="jmeno@urad.cz" style="width:100%;padding:10px;border:1px solid var(--line-strong);border-radius:var(--radius);margin-bottom:10px;">
        <input id="login-password" type="password" placeholder="Heslo" style="width:100%;padding:10px;border:1px solid var(--line-strong);border-radius:var(--radius);margin-bottom:10px;">
        <button id="login-password-send" class="btn btn-primary" style="width:100%;">Přihlásit se heslem</button>
        <p id="login-password-msg" style="font-size:12.5px;color:var(--ink-faint);margin-top:8px;"></p>

        <div style="display:flex;align-items:center;gap:8px;margin:18px 0;color:var(--ink-faint);font-size:11.5px;">
          <div style="flex:1;height:1px;background:var(--line);"></div>nebo<div style="flex:1;height:1px;background:var(--line);"></div>
        </div>

        <button id="login-send" class="btn btn-ghost" style="width:100%;">Poslat přihlašovací odkaz e-mailem</button>
        <p id="login-msg" style="font-size:12.5px;color:var(--ink-faint);margin-top:8px;"></p>
      </div>
    `;
    document.getElementById('login-password-send').addEventListener('click', async () => {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const msg = document.getElementById('login-password-msg');
      if(!email || !password){ msg.textContent = 'Zadejte e-mail i heslo.'; return; }
      msg.textContent = 'Přihlašuji...';
      const { error } = await sb.auth.signInWithPassword({ email, password });
      msg.textContent = error ? ('Chyba: ' + error.message) : '';
    });
    document.getElementById('login-send').addEventListener('click', async () => {
      const email = document.getElementById('login-email').value.trim();
      const msg = document.getElementById('login-msg');
      if(!email){ msg.textContent = 'Zadejte e-mail výše.'; return; }
      msg.textContent = 'Odesílám...';
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.href.split('#')[0] } });
      msg.textContent = error ? ('Chyba: ' + error.message) : 'Odkaz odeslán — zkontrolujte e-mail.';
    });
  }

  async function startApp(){
  window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
  });
  // Safari nespouští beforeunload spolehlivě při navigaci tlačítkem zpět/vpřed v rámci appky
  // (bfcache) — proto appka navíc nastraží krok v historii a zachytává to přes popstate.
  history.pushState(null, '', location.href);
  window.addEventListener('popstate', () => {
    openLeaveConfirmModal();
  });
  state.standaloneMode = false;
  await loadSettings();
  await loadIndex();
  await loadInfoContent();
  state.loading = false;
  if(isEmployeeLink){
    const id = hash.slice(3);
    state.employeeMode = true;
    state.role = 'employee';
    try{
      await window.storage.get(recordKey(id), true);
      await openDetail(id);
    }catch(e){
      console.error('employee link failed to load record:', e);
      state.loading = false;
      document.getElementById('app').innerHTML = `<div style="max-width:480px;margin:80px auto;text-align:center;font-family:var(--font-body);">
        <h2 style="font-family:var(--font-display);">Odkaz nebyl nalezen</h2>
        <p style="color:var(--ink-faint);font-size:13px;">Zkontrolujte prosím, že jste odkaz zkopíroval/a celý. Pokud problém trvá, kontaktujte personální oddělení.</p>
      </div>`;
    }
    return;
  }
  render();
  }
})();

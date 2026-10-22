const APP_VERSION = '2026-10-22.6';
const STORAGE_INDEX_KEY = 'onboarding:index';
const STORAGE_INFO_KEY = 'onboarding:info-content';
const STORAGE_SETTINGS_KEY = 'onboarding:settings';
const recordKey = id => 'onboarding:record:' + id;

const OWNER_LABEL = { hr:'Personální oddělení', employee:'Zaměstnanec', admin:'IT a provoz' };

const DEFAULT_WORKPLACES = ['MD', 'Letenská', 'Olomouc', 'Plzeň', 'Brno', 'České Budějovice', 'Letiště'];
// Číselník útvarů (kód = Ext. ID OJ, název) podle systemizační tabulky ÚRÚ ČR od 1. 1. 2027, v pořadí organizační struktury.
// Kód se v Nastavení u každého odboru/oddělení dá upravit.
const DEPT_VERSION = '2027-systemizace';
const VEMA_UTVARY = [
  ["2","Oddělení kancelář předsedy"],
  ["129967460","Sekce - 1. místopředseda"],
  ["129967461","Odbor transformace státní stavební správy"],
  ["129967462","Oddělení implementace"],
  ["129967463","Oddělení realizace"],
  ["15","Oddělení transformace území 1"],
  ["16","Oddělení transformace území 2"],
  ["17","Oddělení transformace území 3"],
  ["18","Oddělení transformace území 4"],
  ["76505712","Odbor odvolací a přezkumné agendy"],
  ["129097316","Oddělení odvolací a přezkumné agendy I"],
  ["76505637","Oddělení odvolací a přezkumné agendy II"],
  ["76505775","Oddělení odvolací a přezkumné agendy III"],
  ["3","Odbor staveb pro bydlení"],
  ["4","Oddělení staveb pro bydlení Praha"],
  ["5","Oddělení staveb pro bydlení Plzeň/ČB"],
  ["6","Oddělení staveb pro bydlení Olomouc"],
  ["7","Odbor zpracování územně plánovací dokumentace"],
  ["8","Oddělení informací o územním rozvoji"],
  ["9","Oddělení územního rozvoje"],
  ["10","Odbor personální, ekonomický a provozní"],
  ["11","Oddělení personální"],
  ["12","Oddělení ekonomické"],
  ["13","Oddělení provozu digitálních služeb"],
  ["14","Oddělení provozní a IT"],
  ["19","Samostatné oddělení právní"],
  ["23","Sekce metodická, legislativní a ochrany veřejných zájmů"],
  ["76505694","Odbor územního plánování"],
  ["129922901","Oddělení provozních činností a digitalizace"],
  ["129965771","Oddělení koncepční a metodické"],
  ["129965772","Oddělení plánování"],
  ["76505706","Odbor metodiky stavebního řádu"],
  ["129509560","Oddělení metodické"],
  ["98335883","Oddělení právní"],
  ["98335904","Oddělení technické"],
  ["24","Odbor ochrany životního prostředí"],
  ["25","Oddělení ochrany životního prostředí 1"],
  ["26","Oddělení ochrany životního prostředí 2"],
  ["27","Oddělení ochrany životního prostředí 3"],
  ["28","Odbor ochrany ostatních chráněných veřejných zájmů"],
  ["29","Oddělení ochrany ostatních chráněných veřejných zájmů 1"],
  ["30","Oddělení ochrany ostatních chráněných veřejných zájmů 2"],
  ["00041","Oddělení ochrany veřejného zdraví"],
  ["31","Odbor legislativní"],
  ["32","Oddělení národní legislativy"],
  ["33","Oddělení evropské legislativy"],
  ["00100","Sekce vyhrazených staveb"],
  ["00031","Samostatné oddělení vyvlastnění a právních činností Čechy I"],
  ["00032","Samostatné oddělení vyvlastnění a právních činností Morava"],
  ["00111","Samostatné oddělení staveb pozemních komunikací I"],
  ["00112","Samostatné oddělení staveb pozemních komunikací II"],
  ["00120","Odbor staveb drah"],
  ["00121","Oddělení staveb drah Praha"],
  ["00122","Oddělení staveb drah Olomouc"],
  ["00123","Oddělení staveb drah Plzeň"],
  ["00124","Oddělení pražských městských drah"],
  ["00130","Samostatné oddělení civilních leteckých staveb"],
  ["00210","Odbor energetických a průmyslových staveb"],
  ["00211","Oddělení energetických liniových staveb"],
  ["00212","Oddělení staveb výroben energie"],
  ["00221","Oddělení staveb obnovitelných zdrojů energie"],
  ["00222","Oddělení průmyslových a těžebních staveb"],
  ["20","Samostatné oddělení staveb vodních děl a staveb pro vodní dopravu"],
  ["21","Samostatné oddělení odvolacích řízení - dopravní stavby"],
  ["22","Samostatné oddělení odvolacích řízení - energetické stavby"]
];
// Dřívější názvy útvarů (z organigramu / z DESÚ) → název v systemizaci
const VEMA_UTVARY_ALIASY = {
  'Kancelář předsedy': 'Oddělení kancelář předsedy',
  'Odbor metodiky územního plánování a rozvoje': 'Odbor územního plánování',
  'Odbor pořizování územně plánovací dokumentace': 'Odbor zpracování územně plánovací dokumentace',
  'Odbor energetických staveb': 'Odbor energetických a průmyslových staveb',
  'Odbor odvolací a přezkumné agendy I': 'Odbor odvolací a přezkumné agendy',
  'Oddělení staveb pro bydlení Plzeň/České Budějovice': 'Oddělení staveb pro bydlení Plzeň/ČB',
  'Samostatné oddělení vyvlastnění a právních činností Čechy': 'Samostatné oddělení vyvlastnění a právních činností Čechy I',
  'Samostatné oddělení staveb pozemních komunikací II.': 'Samostatné oddělení staveb pozemních komunikací II',
  'Oddělení provozu digitálních služeb': 'Oddělení provozu digitálních služeb',
};
function normDeptName(x){ return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
// Název útvaru v systemizaci (zohlední starší názvy a rozdíly ve velikosti písmen/mezerách)
function canonicalDepartment(name){
  const t = String(name||'').replace(/\s+/g,' ').trim();
  if(!t) return '';
  if(VEMA_UTVARY_ALIASY[t]) return VEMA_UTVARY_ALIASY[t];
  const n = normDeptName(t);
  const hit = VEMA_UTVARY.find(([,nm]) => normDeptName(nm) === n);
  return hit ? hit[1] : t;
}
function departmentCodeFrom(settings, name){
  if(!name) return '';
  const own = settings && settings.departmentCodes && settings.departmentCodes[name];
  if(own) return String(own).trim();
  const canon = canonicalDepartment(name);
  const own2 = settings && settings.departmentCodes && settings.departmentCodes[canon];
  if(own2) return String(own2).trim();
  const hit = VEMA_UTVARY.find(([,nm]) => nm === canon);
  return hit ? hit[0] : '';
}
function departmentCode(name){ return departmentCodeFrom(state.settings, name); }

const DEFAULT_POSITIONS = ['Referent','Analytik','Metodik','Právník','Ekonom','Architekt','Specialista IT','Personalista','Asistent/ka','Vedoucí oddělení'];
const DEFAULT_ADMINS = [];
const DEFAULT_SUPERVISORS = [];
const DEFAULT_DEPARTMENTS = VEMA_UTVARY.map(([,n]) => n);
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
const ZDROJOVE_URADY = ['DESÚ','MMR','ÚÚR','MD','MPO','Nové','Jiný'];
const DEFAULT_EMAIL_RULES = { 'DESÚ':'{jmeno}.{prijmeni}@desu.gov.cz' };
const DEFAULT_LINK_EMAIL_TEMPLATE = {
  subject: 'Vyplnění údajů pro nástup — {jmeno} {prijmeni}',
  body: 'Dobrý den,\n\npro vyplnění údajů k Vašemu nástupu prosím použijte následující odkaz:\n{odkaz}\n\nS pozdravem',
};
const DEFAULT_RETURN_EMAIL_TEMPLATE = {
  subject: 'Doplnění údajů pro nástup — {jmeno} {prijmeni}',
  body: 'Dobrý den,\n\nprosíme o doplnění/opravu údajů v onboardingové aplikaci.\n{vzkaz}{pole}\nDotazník otevřete a opravené údaje odešlete znovu zde:\n{odkaz}\n\nDěkujeme,\npersonální oddělení',
};
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
function workplaceVemaCode(workplace){
  const list = workplaceList();
  const idx = list.indexOf(workplace);
  return idx >= 0 ? String(idx + 1) : '';
}
function workplaceLocations(){ return (state.settings && state.settings.workplaceLocations) || DEFAULT_WORKPLACE_LOCATIONS; }
function workplaceLocation(workplace){ return workplaceLocations()[workplace] || {okres:'', obec:'', sidlo:''}; }
function categoryList(){ return (state.settings && state.settings.categories) || DEFAULT_CATEGORIES; }
function categoryNames(){ return categoryList().map(c => c.name); }
function systemsForCategory(name){ const c = categoryList().find(c => c.name === name); return c ? c.systems : []; }
// Zkušební doba (do Vemy jde jako počet měsíců 0–8):
//  - služební poměr: natvrdo — vedoucí 8 měsíců, ostatní 6 měsíců (pole je zamčené),
//  - pracovní poměr: výběr 0–8 měsíců po jednom.
const ZKUSEBNI_SLUZEBNI = ['6 měsíců','8 měsíců'];
const ZKUSEBNI_ALL = ['','Bez zkušební doby','1 měsíc','2 měsíce','3 měsíce','4 měsíce','5 měsíců','6 měsíců','7 měsíců','8 měsíců'];
function zkusebniDobaOptions(p){
  if(p && p.rezim_zamestnani === 'Služební poměr') return ['', ...ZKUSEBNI_SLUZEBNI];
  return ZKUSEBNI_ALL;
}
// Po změně typu úvazku / vedoucí pozice srovná zkušební dobu: u služebního poměru doplní 8 (vedoucí) / 6 měsíců,
// u pracovního poměru zruší hodnotu, která už mezi možnostmi není (starý zápis „8 měsíců (vedoucí zaměstnanec)“ převede).
function syncZkusebniDoba(p){
  if(!p) return;
  if(p.zkusebni_doba === '8 měsíců (vedoucí zaměstnanec)') p.zkusebni_doba = '8 měsíců';
  if(p.rezim_zamestnani === 'Služební poměr'){
    p.zkusebni_doba = p.vedouci === 'Ano' ? ZKUSEBNI_SLUZEBNI[1] : ZKUSEBNI_SLUZEBNI[0];
  } else if(p.zkusebni_doba && !zkusebniDobaOptions(p).includes(p.zkusebni_doba)){
    p.zkusebni_doba = '';
  }
}
// Počet měsíců zkušební doby pro Vemu (sloupec zkusd) — služební poměr se počítá vždy z vedoucí pozice.
function zkusdMonths(p){
  if(p.rezim_zamestnani === 'Služební poměr') return p.vedouci === 'Ano' ? '8' : '6';
  const v = p.zkusebni_doba || '';
  if(!v) return '';
  if(/^Bez/.test(v)) return '0';
  const m = /^(\d+)/.exec(v);
  return m ? m[1] : '';
}

// Stupnice platových tarifů (Kč měsíčně): řádek = platový stupeň 1–12, sloupec = platová třída.
// Pracovní poměr (§ 5 NV): třídy 1–16. Služební poměr (§ 2 NV): třídy 6–16.
const TARIF_PRACOVNI = [
  [14760,15740,16780,17900,19110,20440,21890,23470,25190,27030,29090,31230,33590,36160,38960,42000],
  [15170,16200,17280,18470,19760,21120,22590,24260,25990,27930,30050,32270,34730,37380,40300,43450],
  [15610,16700,17800,19030,20360,21780,23330,25050,26870,28870,31100,33380,35920,38690,41700,44960],
  [16070,17180,18370,19610,21020,22490,24090,25870,27760,29850,32130,34480,37130,40010,43160,46530],
  [16580,17720,18940,20240,21670,23210,24880,26730,28680,30840,33210,35680,38420,41390,44650,48140],
  [17100,18260,19510,20870,22370,23940,25700,27640,29630,31850,34340,36900,39740,42810,46200,49820],
  [17600,18850,20140,21540,23080,24740,26520,28540,30660,32940,35520,38180,41100,44310,47810,51570],
  [18140,19430,20780,22220,23830,25540,27390,29490,31680,34060,36720,39510,42530,45850,49520,53390],
  [18700,20030,21430,22940,24620,26380,28310,30470,32740,35220,37960,40850,44010,47490,51260,55280],
  [19320,20680,22120,23680,25430,27250,29220,31510,33860,36410,39270,42280,45560,49130,53080,57210],
  [19900,21300,22840,24450,26280,28170,30240,32610,35020,37690,40640,43740,47140,50880,54940,59280],
  [20540,22000,23580,25240,27160,29100,31240,33710,36210,38990,42050,45260,48800,52660,56870,61390]
];
const TARIF_SLUZEBNI = [
  [20440,21890,23470,25190,27030,29090,31670,35080,39510,44930,51580],
  [21120,22590,24260,25990,27930,30050,32730,36240,40840,46460,53360],
  [21780,23330,25050,26870,28870,31100,33870,37520,42330,48150,55330],
  [22490,24090,25870,27760,29850,32130,35000,38810,43780,49840,57270],
  [23210,24880,26730,28680,30840,33210,36210,40140,45280,51580,59290],
  [23940,25700,27640,29630,31850,34340,37450,41530,46870,53390,61420],
  [24740,26520,28540,30660,32940,35520,38740,42990,48530,55310,63620],
  [25540,27390,29490,31680,34060,36720,40060,44480,50240,57260,65880],
  [26380,28310,30470,32740,35220,37960,41420,45990,51950,59270,68220],
  [27250,29220,31510,33860,36410,39270,42860,47610,53810,61390,70650],
  [28170,30240,32610,35020,37690,40640,44360,49280,55700,63570,73190],
  [29100,31240,33710,36210,38990,42050,45940,51040,57700,65860,75870]
];
function tarifniPlat(p, stupen){
  const tr = parseInt(p.platova_trida, 10), st = stupen || 1;
  if(!tr || tr < 1 || tr > 16) return '';
  if(p.rezim_zamestnani === 'Služební poměr') return tr >= 6 ? String(TARIF_SLUZEBNI[st-1][tr-6]) : '';
  if(p.rezim_zamestnani === 'Pracovní poměr') return String(TARIF_PRACOVNI[st-1][tr-1]);
  return '';
}

// Hodnoty, které se do tabulky pro Vemu doplňují natvrdo / odvozují (nejsou ve formuláři).
function vemaAuto(p){
  const sluz = p.rezim_zamestnani === 'Služební poměr', prac = p.rezim_zamestnani === 'Pracovní poměr';
  const tr = parseInt(p.platova_trida, 10);
  let klas = '';
  if(sluz) klas = '1320';
  else if(p.typ_pomeru === 'DPČ') klas = '1211';
  else if(p.typ_pomeru === 'DPP') klas = '1212';
  else if(prac){ klas = p.doba_trvani_pomeru === 'Na dobu neurčitou' ? '1111' : (p.doba_trvani_pomeru === 'Na dobu určitou' ? '1112' : ''); }
  return {
    czicse: klas,
    plasku: sluz ? '14' : '2',   // vždy číslo: služební poměr 14, jinak 2
    plastu: String(parseInt(p.platovy_stupen,10) || 1),
    tarif: tarifniPlat(p, parseInt(p.platovy_stupen,10) || 1),
    skupzm: (tr >= 6 && tr <= 9) ? '3' : ((tr >= 10 && tr <= 16) ? '4' : ''),
    plpost: '0',
    zupltar: '1',
    zpodm: '2',
    typpv: '1',
  };
}
const VEMA_AUTO_TEXT = {
  czicse: {'1111':'zaměstnanci v pracovním poměru na dobu neurčitou','1112':'zaměstnanci v pracovním poměru na dobu určitou','1211':'zaměstnanci na základě dohod o pracovní činnosti','1212':'zaměstnanci na základě dohod o provedení práce','1320':'ostatní zaměstnanci ve služebním poměru'},
  plasku: {'14':'Státní zaměstnanci ZSS §2 odst.1 NV 304/2014 Sb.','2':'Státní správa - ZP §5 odst.2 NV 341/2017 Sb.'},
  tarif: {},
  skupzm: {'3':'3. skupina prací','4':'4. skupina prací'},
  plpost: {'0':'postup s tarifem'},
  zupltar: {'1':'platový tarif podle stupnice platových tarifů'},
  zpodm: {'2':'pevný měsíční plat'},
  typpv: {'1':'odměňování podle § 5 NV'},
};
const VEMA_AUTO_ROWS = [
  ['czicse','Klasifikace postavení v zaměstnání','zaměstnanec; kód podle poměru: služební 1320, pracovní na dobu neurčitou 1111 / určitou 1112, DPČ 1211, DPP 1212'],
  ['plasku','Platová skupina','služební poměr 14, pracovní poměr 2'],
  ['tarif','Tarifní plat (Kč/měsíc)','z tabulky tarifů podle poměru, platové třídy a platového stupně'],
  ['skupzm','Skupina prací pro zaručenou mzdu','podle platové třídy: 6.–9. třída = 3, 10.–16. třída = 4'],
  ['plpost','Nastavení platového postupu','vždy 0'],
  ['zupltar','Způsob určení platového tarifu','vždy 1'],
  ['zpodm','Způsob odměňování','vždy 2 (měsíční plat)'],
  ['typpv','Typ platového výměru','vždy 1 (§ 5 NV)'],
];
function renderVemaAutoPanel(r){
  const auto = vemaAuto(r.personal);
  const rows = VEMA_AUTO_ROWS.map(([k, label, rule]) => {
    const v = auto[k];
    const txt = v ? `<strong>${esc(v)}</strong> — ${esc((VEMA_AUTO_TEXT[k]||{})[v] || '')}` : '<span style="color:var(--ink-faint);">nelze určit (doplňte údaje výše)</span>';
    return `<tr><td style="padding:5px 12px 5px 0;">${esc(label)}</td><td style="padding:5px 12px 5px 0;">${txt}</td><td style="padding:5px 0;color:var(--ink-faint);font-size:12px;">${esc(rule)}</td></tr>`;
  }).join('');
  return `
    <details id="auto-panel" class="form-section" ${state.autoPanelOpen ? 'open' : ''} style="margin-top:20px;">
      <summary style="cursor:pointer;font-weight:600;">Automaticky doplňované hodnoty pro Vemu <span class="section-optional-tag">jen ke kontrole</span></summary>
      <p style="font-size:12.5px;color:var(--ink-faint);margin:10px 0;">Tyto položky se do tabulky pro Vemu doplňují samy, nejdou upravit. Slouží ke kontrole; později je ze zobrazení odstraníme.</p>
      <table style="font-size:13px;border-collapse:collapse;width:100%;"><tbody>${rows}</tbody></table>
    </details>`;
}

function resolveField(f, p){
  if(f.id === 'zkusebni_doba' && p) return {...f, options: zkusebniDobaOptions(p)};
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
    {id:'rodne_cislo', label:'Rodné číslo (bez lomítka)', placeholder:'9001011234', validate:'rodneCislo', essential:true},
    {id:'datum_narozeni', label:'Datum narození', type:'date', validate:'birthDateVsRC', autofillFrom:'rodne_cislo', essential:true, autocomplete:'bday'},
    {id:'misto_narozeni', label:'Místo narození', essential:true},
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
  { id:'doklady', label:'Zdravotní pojišťovna a bankovní účet', navLabel:'Pojišťovna a účet', owner:'employee',
    attachments:{kind:'zp_karta', title:'Kartička zdravotní pojišťovny', required:true, max:2, camera:true,
      hint:'Nahrajte fotografii nebo sken kartičky (stačí strana s údaji). Můžete ji i vyfotit kamerou počítače.'}, fields:[
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
    {id:'rodne_cislo_manzela', label:'Rodné číslo manžela/manželky (bez lomítka)', placeholder:'9001011234', validate:'rodneCislo', showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
    {id:'datum_narozeni_manzela', label:'Datum narození manžela/manželky', type:'date', showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
    {id:'statni_obcanstvi_manzela', label:'Státní občanství manžela/manželky', default:'Česká republika', datalist:'zeme', showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
    {id:'bydliste_manzela', label:'Bydliště manžela/manželky', full:true, showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
    {id:'manzel_ztpp', label:'Manžel/ka je držitel/ka průkazu ZTP/P', essential:true, type:'select', options:['','Ne','Ano'], showIf:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav)},
  ]},
  { id:'deti', label:'Děti', navLabel:'Děti', owner:'employee', itemLabel:'Dítě', type:'repeat', optional:true, addLabel:'+ Přidat dítě', fields:[
    {id:'jmeno', label:'Jméno'},
    {id:'prijmeni', label:'Příjmení'},
    {id:'rodne_cislo', label:'Rodné číslo (bez lomítka)', placeholder:'1201011234', validate:'rodneCislo'},
    {id:'datum_narozeni', label:'Datum narození', type:'date', validate:'birthDateVsRC', autofillFrom:'rodne_cislo'},
    {id:'studuje', label:'Soustavně studuje', type:'select', options:['','Ano','Ne']},
    {id:'danove_zvyhodneni', label:'Uplatňuji na toto dítě daňové zvýhodnění', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'ztpp', label:'Dítě je držitel průkazu ZTP/P', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'bydliste', label:'Bydliště (jen pokud nezaopatřené dítě žije jinde)', full:true},
  ]},
  { id:'vzdelani', label:'Vzdělání', navLabel:'Vzdělání', owner:'employee', fields:[
    {id:'stav_vzdelani', label:'Stav studia', essential:true, type:'select', options:['','Dokončené','Probíhající','Nedokončené']},
    {id:'rok_zahajeni', label:'Rok zahájení studia', validate:'yearZahajeni'},
    {id:'rok_ukonceni', label:'Rok ukončení studia', validate:'yearUkonceni'},
    {id:'stupen_vzdelani', label:'Nejvyšší dosažené vzdělání', type:'select', options:['','Základní','Střední bez maturity','Střední s maturitou','Vyšší odborné','Vysokoškolské — bakalářské','Vysokoškolské — magisterské','Vysokoškolské — doktorské'], essential:true},
    {id:'datum_zahajeni_vzdelani', label:'Datum zahájení nejvyššího dokončeného vzdělání', type:'date', essential:true, showIf:p=>p.stav_vzdelani==='Dokončené'},
    {id:'datum_ukonceni_vzdelani', label:'Datum ukončení nejvyššího dokončeného vzdělání', type:'date', essential:true, showIf:p=>p.stav_vzdelani==='Dokončené'},
    {id:'obor', label:'Obor', essential:true},
    {id:'ziskany_titul', label:'Získaný titul', showIf:p=>p.stav_vzdelani==='Dokončené'},
    {id:'skola', label:'Název školy'},
    {id:'sidlo_skoly', label:'Sídlo školy'},
    {id:'druh_zkousky', label:'Druh zkoušky (maturita, státní zkouška, certifikát…)', showIf:p=>p.stav_vzdelani==='Dokončené'},
  ]},
  { id:'praxe', label:'Praxe, započitatelné doby a ZOZ', navLabel:'Praxe a ZOZ', owner:'employee', itemLabel:'Období', type:'repeat', optional:true, addLabel:'+ Přidat období',
    emptyHint:'Pokud žádnou praxi ani započitatelnou dobu nemáte (např. absolvent), tento krok prostě přeskočte.',
    intro:['PŘEHLED PRŮBĚHU PŘEDCHOZÍCH ZAMĚSTNÁNÍ, VOJENSKÉ SLUŽBY, MATEŘSKÉ/RODIČOVSKÉ DOVOLENÉ, ÚŘADU PRÁCE apod.',
      'Této části dotazníku prosím věnujte zvýšenou pozornost. Jednotlivé položky uvádějte s přesnými daty (tj. den.měsíc.rok). Nesprávně uvedené údaje mohou vést např. k zařazení do nižšího platového stupně, případně mohou vést k pracovně právním postihům podle příslušných ustanovení zákoníku práce a zákona o státních zaměstnancích v případě nepravdivých údajů.',
      'Mimo předchozí zaměstnání nezapomeňte uvést všechny započitatelné doby, včetně mateřské a rodičovské dovolené či vojenské služby. V případě, že jste byl/a evidován/a na úřadu práce, uveďte taktéž toto období. Praxi nemusíte vyplňovat, pokud ji nemáte (např. absolvent).'],
    attachments:{kind:'zoz', title:'Osvědčení o vykonání zkoušky odborné způsobilosti (ZOZ)', required:false, max:6, camera:false, addLabel:'+ Přidat ZOZ',
      hint:'Máte-li osvědčení o ZOZ, nahrajte jeho sken (PDF nebo obrázek). Může se uznat jako část praxe a ovlivnit platový stupeň. Doplňkové – můžete přidat i více osvědčení.'}, fields:[
    {id:'druh', label:'Druh období', type:'select', default:'Zaměstnání', options:['Zaměstnání','Vojenská služba','Mateřská dovolená','Rodičovská dovolená','Evidence na úřadu práce','Podnikání (OSVČ)','Jiná započitatelná doba'], full:true},
    {id:'od', label:'Od', type:'date'},
    {id:'do', label:'Do', type:'date', validate:'praxeDo'},
    {id:'organizace', label:'Organizace / instituce', placeholder:'zaměstnavatel, vojenský útvar, úřad práce…'},
    {id:'sidlo', label:'Sídlo organizace'},
    {id:'pracovni_zarazeni', label:'Pracovní zařazení / vykonávaná činnost', full:true, placeholder:'u mateřské a rodičovské dovolené nevyplňujte'},
  ]},
  { id:'jazyky', label:'Jazykové znalosti', navLabel:'Jazyky', owner:'employee', itemLabel:'Jazyk', type:'repeat', optional:true, addLabel:'+ Přidat jazyk', fields:[
    {id:'jazyk', label:'Jazyk', datalist:'jazyky'},
    {id:'stupen_znalosti', label:'Stupeň znalosti', essential:true, type:'select', options:['','Základní (začátečník)','Střední (pokročilý)','Odborný']},
    {id:'stupen_osvedceni', label:'Stupeň osvědčení', placeholder:'maturita, státní zkouška, certifikát…'},
    {id:'pouzivani', label:'Používání', essential:true, type:'select', options:['','Aktivní','Pasivní']},
  ]},
  { id:'dalsi_udaje', label:'Další povinné údaje', navLabel:'Další údaje', owner:'employee', optional:true, fields:[
    {id:'prohlaseni_poplatnika', label:'Podepsal/a jsem Prohlášení poplatníka daně z příjmů', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'zpusob_rocniho_zuctovani', label:'Způsob ročního zúčtování daně', essential:true, type:'select', options:['','Neprovádět — podávám si vlastní daňové přiznání','Provádět — budu u zaměstnavatele zaměstnán/a na konci roku','Provádět — na konci roku už u zaměstnavatele zaměstnán/a nebudu, ale jinde nepracuji']},
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
    {id:'osobni_cislo', label:'Osobní číslo (přidělí se automaticky)', essential:true, readonly:true},
    {id:'zdrojovy_urad', label:'Zdrojový úřad', essential:true, type:'select', options:['', ...ZDROJOVE_URADY]},
    {id:'email_stavajici', label:'Stávající pracovní e-mail (u zdrojového úřadu)', type:'email', validate:'email'},
    {id:'duvod_vzniku_pomeru', label:'Důvod vzniku pracovního poměru', essential:true, type:'select', options:['','Absolvent školy','Nástup z evidence úřadu práce','Ostatní osoby nastupující poprvé','Osoba měnící zaměstnání','Nástup z výběrového řízení','Opětovné přijetí do pracovního poměru']},
    {id:'datum_nastupu', label:'Datum nástupu', type:'date', required:true},
    {id:'pozice', label:'Pracovní pozice', type:'select', options: [''], required:true},
    {id:'pracoviste', label:'Pracoviště', type:'select', options: [''], required:true},
    {id:'typ_nastupu', label:'Typ nástupu', type:'select', options: ['', ...ONBOARDING_TYPES], required:true},
    {id:'kategorie', label:'Kategorie (dle vykonávané práce)', type:'select', options: [''], required:true},
    {id:'odbor_oddeleni', label:'Odbor / oddělení', essential:true, datalist:'utvar', placeholder:'vyberte, nebo zadejte název či kód útvaru', autocomplete:'off'},
    {id:'nadrizeny', label:'Přímý nadřízený', essential:true, type:'select', options:['']},
    {id:'rezim_zamestnani', label:'Typ úvazku', essential:true, type:'select', options:['','Pracovní poměr','Služební poměr']},
    {id:'typ_pomeru', label:'Typ pracovního poměru', essential:true, type:'select', options:['','HPP','DPP','DPČ'], default:'HPP'},
    {id:'rozsah_uvazku', label:'Rozsah úvazku', essential:true, type:'select', options:['','Plný úvazek','Zkrácený úvazek']},
    {id:'doba_trvani_pomeru', label:'Doba trvání pracovního poměru', essential:true, type:'select', options:['','Na dobu neurčitou','Na dobu určitou']},
    {id:'uvazek', label:'Výše úvazku', placeholder:'např. 1,0'},
    {id:'zkusebni_doba', label:'Zkušební doba', essential:true, type:'select', options:ZKUSEBNI_ALL, showWhenLocked:true, disabledIf:p=>p.rezim_zamestnani==='Služební poměr'},
  ]},
  { id:'mzdove_udaje', label:'Mzdové a organizační údaje', owner:'hr', fields:[
    {id:'vedouci', label:'Vedoucí pozice', essential:true, type:'select', options:['','Ne','Ano']},
    {id:'stupen_rizeni', label:'Stupeň řízení vedoucích zaměstnanců', type:'select', options:['','1. stupeň','2. stupeň','3. stupeň','4. stupeň'], essential:true, showIf:p=>p.vedouci==='Ano'},
    {id:'platova_trida', label:'Platová třída', essential:true, type:'select', options:['','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16']},
    {id:'platovy_stupen', label:'Platový stupeň', essential:true, type:'select', default:'1', options:['1','2','3','4','5','6','7','8','9','10','11','12']},
    {id:'zkraceny_uvazek_hodiny', label:'Zkrácený úvazek — hodin týdně', showIf:p=>p.rozsah_uvazku==='Zkrácený úvazek'},
    {id:'zkraceny_uvazek_procenta', label:'Zkrácený úvazek — v %', default:'100', essential:true, disabledIf:p=>p.rozsah_uvazku!=='Zkrácený úvazek'},
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

let state = { view:'list', index:[], currentId:null, currentRecord:null, tab:'personal', loading:true, error:null, collapsed:{}, role:'hr', employeeMode:false, linkCopied:false, wizardStep:0, infoContent:null, editingInfo:false, previewingEmployee:false, returnMsgCopied:false, pendingEdit:null, filterText:'', colFilters:{pozice:'', pracoviste:'', zdrojovyUrad:'', personal:'', it:'', assigned:''}, sortKey:'created', sortDir:'desc', wizardStepError:false, editingWorkplace:null, editingFirstDayType:null, firstDayDismissPrompt:false, firstDayHiddenSession:false, settings:null, settingsDraft:null, settingsSaved:false, openItemNotes:{}, selectedExport:{}, exporting:false, hardRateLimited:false, selectedAssign:{}, bulkAssignTarget:'', bulkAssigning:false, saveStatus:null, saveStatusAt:null, standaloneMode:false, showMissingHighlights:false, userEmail:null, settingsCollapsed:{}, importQueue:[], importCurrent:null };

function emptyPersonal(){
  const p = { prilohy: [] };
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

// Personální oddělení a zaměstnanec zapisují do stejných záznamů souběžně (zaměstnanec odešle dotazník, zatímco
// má personální rejstřík nebo spis otevřený). Proto si pamatujeme, co jsme naposledy načetli/uložili (base),
// a při uložení sloučíme: změněné jen u nás bereme od nás, ostatní z aktuálního stavu v databázi.
let indexBase = null;
const recordBase = {};
const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function merge3(base, mine, latest){
  base = base || {}; mine = mine || {}; latest = latest || {};
  const out = {};
  new Set([...Object.keys(latest), ...Object.keys(mine)]).forEach(k => {
    const v = sameJson(mine[k], base[k]) ? latest[k] : mine[k];
    if(v !== undefined) out[k] = v;
  });
  return out;
}
function mergeRecord(base, mine, latest){
  const out = merge3(base, mine, latest);
  ['personal', 'checklist', 'fieldFlags'].forEach(k => { out[k] = merge3(base[k], mine[k], latest[k]); });
  return out;
}
function mergeIndex(base, mine, latest){
  const bm = new Map(base.map(e => [e.id, e])), lm = new Map(latest.map(e => [e.id, e])), mm = new Set(mine.map(e => e.id));
  const out = [];
  mine.forEach(e => {
    if(lm.has(e.id)) out.push(merge3(bm.get(e.id), e, lm.get(e.id)));
    else if(!bm.has(e.id)) out.push(e);                  // nově přidáno u nás
  });
  latest.forEach(e => { if(!mm.has(e.id) && !bm.has(e.id)) out.push(e); });   // přidáno jinde
  return out;
}
async function loadIndex(){
  try{
    const res = await window.storage.get(STORAGE_INDEX_KEY, true);
    state.index = res ? JSON.parse(res.value) : [];
    indexBase = JSON.stringify(state.index);
  }catch(e){
    state.index = [];
    indexBase = null;
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
    if(!state.employeeMode && indexBase !== null){
      try{
        const res = await window.storage.get(STORAGE_INDEX_KEY, true);
        if(res && res.value !== indexBase) state.index = mergeIndex(JSON.parse(indexBase), state.index, JSON.parse(res.value));
      }catch(e){ /* uložíme beze sloučení */ }
    }
    await withRetry(() => window.storage.set(STORAGE_INDEX_KEY, JSON.stringify(state.index), true));
    indexBase = JSON.stringify(state.index);
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
    const norm = normalizeRecord(record);
    if(res && !state.employeeMode) recordBase[id] = JSON.stringify(norm);
    return norm;
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
  if(!Array.isArray(record.personal.prilohy)) record.personal.prilohy = [];
  (record.personal.praxe || []).forEach(x => { if(x && !x.druh) x.druh = 'Zaměstnání'; });
  // Starší spisy: typ poměru výchozí HPP, zkušební doba srovnaná podle poměru a vedoucí pozice.
  if(!record.personal.typ_pomeru) record.personal.typ_pomeru = 'HPP';
  if(!record.personal.platovy_stupen) record.personal.platovy_stupen = '1';
  syncZkusebniDoba(record.personal);
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
    if(!state.employeeMode && recordBase[id]){
      try{
        const res = await window.storage.get(recordKey(id), true);
        if(res){
          const latest = normalizeRecord(JSON.parse(res.value));
          if(JSON.stringify(latest) !== recordBase[id]){
            const merged = mergeRecord(JSON.parse(recordBase[id]), record, latest);
            Object.keys(record).forEach(k => delete record[k]);
            Object.assign(record, merged);
          }
        }
      }catch(e){ /* uložíme beze sloučení */ }
    }
    await withRetry(() => window.storage.set(recordKey(id), JSON.stringify(record), true));
    if(!state.employeeMode) recordBase[id] = JSON.stringify(record);
    state.error = null;
    return true;
  }catch(e){
    console.error('saveRecord failed:', e);
    if(state.employeeMode) showToast('Údaje se nepodařilo uložit: ' + (e && e.message ? e.message : e) + ' Zkuste to prosím znovu.', true);
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
  const blank = () => ({ workplaces: [...DEFAULT_WORKPLACES], positions: [...DEFAULT_POSITIONS], admins: [...DEFAULT_ADMINS], supervisors: [...DEFAULT_SUPERVISORS], departments: [...DEFAULT_DEPARTMENTS], facilityStaff: [...DEFAULT_FACILITY_STAFF], offices: {...DEFAULT_OFFICES}, workplaceVemaCodes: {...DEFAULT_WORKPLACE_VEMA_CODES}, workplaceLocations: {...DEFAULT_WORKPLACE_LOCATIONS}, vemaConstants: {}, categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)), systemUrls: {...DEFAULT_SYSTEM_URLS}, systemTypes: {...DEFAULT_SYSTEM_TYPES}, hrRequiredOverrides: {}, emailRules: {...DEFAULT_EMAIL_RULES} });
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
  if(state.settings.departmentsVersion !== DEPT_VERSION){   // jednorázová aktualizace seznamu útvarů a jejich kódů podle systemizace
    state.settings.departments = [...DEFAULT_DEPARTMENTS];
    state.settings.departmentCodes = {};
    state.settings.departmentsVersion = DEPT_VERSION;
    if(!state.employeeMode && state.role === 'hr') setTimeout(() => { saveSettings(); }, 0);
  }
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
  if(!state.settings.emailRules || typeof state.settings.emailRules !== 'object') state.settings.emailRules = {...DEFAULT_EMAIL_RULES};
  ZDROJOVE_URADY.forEach(z => { if(!(z in state.settings.emailRules)) state.settings.emailRules[z] = ''; });
  if(!state.settings.linkEmailTemplate || typeof state.settings.linkEmailTemplate !== 'object') state.settings.linkEmailTemplate = {...DEFAULT_LINK_EMAIL_TEMPLATE};
  if(!state.settings.linkEmailTemplate.subject) state.settings.linkEmailTemplate.subject = DEFAULT_LINK_EMAIL_TEMPLATE.subject;
  if(!state.settings.linkEmailTemplate.body) state.settings.linkEmailTemplate.body = DEFAULT_LINK_EMAIL_TEMPLATE.body;
  if(!state.settings.returnEmailTemplate || typeof state.settings.returnEmailTemplate !== 'object') state.settings.returnEmailTemplate = {...DEFAULT_RETURN_EMAIL_TEMPLATE};
  if(!state.settings.returnEmailTemplate.subject) state.settings.returnEmailTemplate.subject = DEFAULT_RETURN_EMAIL_TEMPLATE.subject;
  if(!state.settings.returnEmailTemplate.body) state.settings.returnEmailTemplate.body = DEFAULT_RETURN_EMAIL_TEMPLATE.body;
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
  if(kind === 'utvar') return departmentList().filter(Boolean).map(n => ({value: n, display: departmentCode(n) || '—', sub: n}));
  return (DATALIST_OPTIONS[kind] || []).map(v => ({value: v, display: v, sub: null}));
}
// Do pole Odbor / oddělení lze zapsat přímo kód útvaru (nebo název bez ohledu na velikost písmen) – převede se na název z číselníku.
function normalizeDepartmentInput(v){
  const t = String(v||'').trim();
  if(!t) return '';
  const list = departmentList().filter(Boolean);
  const byCode = list.filter(n => departmentCode(n) === t);
  if(byCode.length === 1) return byCode[0];
  const m = /^(\d{1,3})\s*[–—-]\s*(.+)$/.exec(t);     // „821 – Oddělení právní“
  if(m){ const hit = list.find(n => departmentCode(n) === m[1] || n === m[2].trim()); if(hit) return hit; }
  const ci = list.find(n => normDeptName(n) === normDeptName(t));
  if(ci) return ci;
  const canon = canonicalDepartment(t);
  return list.includes(canon) ? canon : t;
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
  const filtered = (q ? items.filter(it => it.display.toLowerCase().includes(q) || (it.sub && it.sub.toLowerCase().includes(q))) : items).slice(0,100);
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

  // Po kliknutí na šipku se obsah okna překreslí a původní tlačítko už v něm není – proto se ptáme na cestu události, ne na e.target.
  function onOutsideClick(e){ const path = e.composedPath ? e.composedPath() : []; if(!path.includes(popup) && !popup.contains(e.target) && e.target !== btn && !path.includes(btn)) closeDatePicker(); }
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

// Stávající (předpracovní) e-mail u zdrojového úřadu — na rozdíl od suggestedEmail() výše (návrh
// NOVÉ pracovní adresy @uru.gov.cz) se počítá podle pravidla uloženého v Nastavení pro konkrétní
// zdrojový úřad (state.settings.emailRules), protože každý úřad má jinou doménu/formát.
function existingEmailFromRule(zdrojovyUrad, jmeno, prijmeni){
  const rule = state.settings && state.settings.emailRules && state.settings.emailRules[zdrojovyUrad];
  if(!rule) return '';
  const strip = s => (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim().replace(/[^a-z]/g,'');
  const j = strip(jmeno), p = strip(prijmeni);
  if(!j || !p) return '';
  return rule.replace(/\{jmeno\}/g, j).replace(/\{prijmeni\}/g, p);
}
function ensureExistingEmail(record){
  if(record.personal.email_stavajici) return false;
  const email = existingEmailFromRule(record.personal.zdrojovy_urad, record.personal.jmeno, record.personal.prijmeni);
  if(!email) return false;
  record.personal.email_stavajici = email;
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
    return {ok:true, formatted: rr+mmRaw+dd+suffix};
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
      <div class="masthead-right">${esc(currentOrgAbbrev())} · interní evidence${state.employeeMode ? '' : ' · <a href="#" id="btn-help" class="help-link" title="Nápověda (klávesa ?)">? Nápověda</a>'}
        ${state.userEmail ? `<div style="margin-top:4px;text-transform:none;letter-spacing:normal;">${esc(state.userEmail)} · <a href="#" id="btn-logout" style="color:var(--blue);">Odhlásit se</a></div>` : ''}
      </div>
    </div>
    <div class="no-print">
    ${state.employeeMode ? `<div class="employee-banner">${state.infoOnly ? 'Toto je váš osobní onboardingový prostor. Dotazník je již uzavřen (údaje byly zpracovány nebo vypršela platnost jeho vyplnění). Informace pro váš nástup zůstávají dostupné níže. Potřebujete-li údaje doplnit nebo opravit, kontaktujte personální oddělení.' : 'Toto je váš osobní onboardingový prostor. Vyplněné údaje uvidí personální oddělení, které je zkontroluje a případně doplní.'}</div>` : renderRoleSwitch()}
    ${state.error ? `<div style="background:var(--red-tint);color:var(--red);padding:10px 14px;border-radius:3px;margin-bottom:16px;font-size:13px;">${esc(state.error)}</div>` : ''}
    </div>
    ${state.employeeMode ? `<button type="button" id="btn-help-fab" class="help-fab no-print" title="Nápověda (klávesa ?)">❓ Nápověda</button>` : ''}
    ${state.view === 'list' ? renderList() : state.view === 'info-admin' ? renderInfoAdminPage() : state.view === 'settings' ? renderSettingsPage() : state.view === 'import-mapping' ? renderImportMappingPage() : renderDetail()}
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
    rows = rows.filter(r => `${r.jmeno||''} ${r.prijmeni||''} ${r.pozice||''} ${r.pracoviste||''} ${r.zdrojovyUrad||''} ${r.assignedAdmin||''} ${r.ref||''} ${r.osobniCislo||''}`.toLowerCase().includes(text));
  }
  const cf = state.colFilters;
  if(cf.pozice) rows = rows.filter(r => (r.pozice||'') === cf.pozice);
  if(cf.pracoviste) rows = rows.filter(r => (r.pracoviste||'') === cf.pracoviste);
  if(cf.zdrojovyUrad) rows = rows.filter(r => (r.zdrojovyUrad||'') === cf.zdrojovyUrad);
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
      case 'zdrojovyUrad': av = (a.zdrojovyUrad||'').toLowerCase(); bv = (b.zdrojovyUrad||'').toLowerCase(); break;
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
  const purgeableCount = reviewedRows.filter(r => state.selectedExport[r.id] && r.vemaUploadedAt && !r.personalPurgedAt).length;
  const uploadableCount = reviewedRows.filter(r => state.selectedExport[r.id] && r.vemaExportedAt && !r.vemaUploadedAt && !r.personalPurgedAt).length;
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
        ${canCreate && organigramConfigured() ? `<button class="btn btn-ghost" id="btn-import-organigram">Stáhnout nové z organigramu</button>` : ''}
        <button class="btn btn-ghost refresh-btn" data-refresh title="Aktualizovat – načte aktuální stav z databáze (např. po odeslání dotazníku zaměstnancem)" aria-label="Aktualizovat">↻</button>
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
        <div class="export-btns">
          <button class="btn btn-primary btn-sm" id="btn-generate-vema" ${selectedCount===0 || state.exporting ? 'disabled':''}>${state.exporting ? 'Generuji…' : `Generovat tabulky pro VEMU${selectedCount?' ('+selectedCount+')':''}`}</button>
          <button class="btn btn-ghost btn-sm" id="btn-confirm-upload" ${uploadableCount===0 ? 'disabled':''} title="Potvrdí, že tabulky byly nahrány do Vemy a ve Vemě zkontrolovány. Spis pak získá stav Nahráno. Dostupné u spisů se stavem Vygenerováno.">Potvrdit nahrání do Vemy${uploadableCount?' ('+uploadableCount+')':''}</button>
          <button class="btn btn-ghost btn-sm" id="btn-purge-selected" ${purgeableCount===0 ? 'disabled':''} title="Smaže osobní údaje zaměstnanců u vybraných spisů se stavem Nahráno. Smažte až po vygenerování dokumentů – z nich pak už nejdou znovu vytvořit.">Smazat osobní údaje${purgeableCount?' ('+purgeableCount+')':''}</button>
        </div>
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
          <th data-sort="zdrojovyUrad">Zdrojový úřad${sortArrow('zdrojovyUrad')}</th>
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
          <th>${selectHtml('zdrojovyUrad', [['','Vše'], ...ZDROJOVE_URADY.map(z=>[z,z])], cf.zdrojovyUrad)}</th>
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
              <td><div class="index-name">${esc(r.jmeno)} ${esc(r.prijmeni)}</div><div class="index-ref" title="${r.osobniCislo ? esc('Osobní číslo (kód spisu ' + r.ref + ')') : 'Kód spisu'}">${esc(r.osobniCislo || r.ref)}</div></td>
              <td>${esc(r.pozice || '—')}</td>
              <td>${esc(r.pracoviste || '—')}</td>
              <td>${esc(r.zdrojovyUrad || '—')}</td>
              <td>${esc(formatDate(r.datumNastupu)) || '—'}</td>
              ${state.role==='hr'?`<td>${personalChip(r)}</td>`:''}
              <td>${chip(r.itDone === r.itTotal && r.itTotal>0, `${r.itDone||0}/${r.itTotal||0}`)}</td>
              ${state.role==='admin'?`<td>${urgencyChip(r)}</td><td>${adminList().length ? `<select data-list-assign="${r.id}"><option value="">— nepřiřazeno —</option>${adminList().map(a => `<option value="${esc(a)}" ${r.assignedAdmin===a?'selected':''}>${esc(a)}</option>`).join('')}</select>` : (r.assignedAdmin ? esc(r.assignedAdmin) : '<span style="color:var(--ink-faint);">—</span>')}</td>`:''}
              ${canCreate?`<td>${vemaCellHtml(r)}</td>
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
  if(status === 'submitted') return `<span class="chip chip-submitted">● Odesláno zaměstnancem</span>`;
  const info = draftStageInfo(r.hrMissingCount || 0, r.linkGeneratedAt);
  return `<span class="chip ${info.chipClass}">${esc(info.label)}</span>`;
}

function availableTabs(){
  if(state.role === 'employee') return state.infoOnly ? ['info'] : ['personal','info'];
  if(state.role === 'admin') return ['it','provoz'];
  return ['personal','it'];
}

function renderDetail(){
  const r = state.currentRecord;
  if(!r) return `<p>Záznam nenalezen.</p>`;
  const idxEntry = state.index.find(e => e.id === state.currentId);
  const displayName = `${r.personal.jmeno||''} ${r.personal.prijmeni||''}`.trim();
  const displayRef = idxEntry ? (idxEntry.osobniCislo || idxEntry.ref) : '';
  const displayDatumNastupu = idxEntry ? idxEntry.datumNastupu : r.personal.datum_nastupu;
  const itTotals = checklistTotals(r.checklist, r.personal.kategorie, 'it');
  const provozTotals = checklistTotals(r.checklist, r.personal.kategorie, 'provoz');
  const itPct = itTotals.total ? Math.round(itTotals.done/itTotals.total*100) : 0;
  const provozPct = provozTotals.total ? Math.round(provozTotals.done/provozTotals.total*100) : 0;
  const complete = itTotals.total > 0 && itTotals.done === itTotals.total;
  const tabs = availableTabs();
  if(!tabs.includes(state.tab)) state.tab = tabs[0];

  if(state.role === 'employee' && !state.infoOnly && !r.consentGiven){
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
        <p style="font-size:14px;color:var(--ink-soft);line-height:1.6;">Součástí dotazníku je i nahrání kopie kartičky zdravotní pojišťovny a případných osvědčení o odborné způsobilosti (ZOZ). Tyto dokumenty se uchovávají jen po dobu zavedení zaměstnance do personálního a mzdového systému a poté se vymažou spolu s ostatními osobními údaji z této aplikace.</p>
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
        ${state.employeeMode || state.previewingEmployee ? '' : `<button class="btn btn-ghost btn-sm refresh-btn" data-refresh title="Aktualizovat – načte aktuální stav spisu z databáze" aria-label="Aktualizovat">↻</button>`}
        ${complete ? `<div class="stamp">Přístupy vyřízeny</div>` : ''}
        ${state.role==='hr' && !state.previewingEmployee ? (() => {
          const hrMissing = missingHrRequiredFields(r);
          const linkReady = hrMissing.length === 0;
          const hasExistingEmail = !!r.personal.email_stavajici;
          return `<button class="btn btn-ghost btn-sm" id="btn-copy-link" ${linkReady?'':'disabled title="Nejdřív doplňte povinné údaje personálního oddělení (viz Osobní údaje)"'}>${state.linkCopied ? 'Odkaz zkopírován ✓' : 'Zkopírovat odkaz pro zaměstnance'}</button>
          <button class="btn btn-ghost btn-sm" id="btn-email-link" ${linkReady && hasExistingEmail?'':'disabled'} title="${hasExistingEmail?'':'Nejdřív doplňte stávající e-mail v sekci Pracovní poměr'}">Poslat odkaz e-mailem</button>`;
        })() : ''}
      </div>
    </div>
    <div class="tabs">
      ${tabs.includes('personal') ? `<div class="tab ${state.tab==='personal'?'active':''}" data-tab="personal">${state.role==='employee'?'Vaše údaje':'Osobní údaje'}${personalBadge}</div>` : ''}
      ${tabs.includes('info') ? `<div class="tab ${state.tab==='info'?'active':''}" data-tab="info">Co potřebujete vědět</div>` : ''}
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
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
// ---- Z\u00E1loha / obnova cel\u00E9 datab\u00E1ze (kv_store) \u2014 st\u00E1hne/nahrad\u00ED v\u0161e pod kl\u00ED\u010Dem "onboarding:" najednou:
// rejst\u0159\u00EDk, v\u0161echny spisy, nastaven\u00ED i obsah pro zam\u011Bstnance. Nez\u00E1visl\u00E9 na konkr\u00E9tn\u00ED verzi appky.
async function downloadBackup(){
  const rows = await window.storage.listAll('onboarding:');
  const payload = { exportedAt: new Date().toISOString(), app: 'onboarding', rowCount: rows.length, rows };
  const blob = new Blob([JSON.stringify(payload, null, 1)], {type:'application/json'});
  downloadBlob(blob, `Onboarding_zaloha_${new Date().toISOString().slice(0,10)}.json`);
}
async function restoreBackup(file){
  const text = await file.text();
  const payload = JSON.parse(text);
  if(!payload || !Array.isArray(payload.rows) || !payload.rows.every(r => r && typeof r.key === 'string')){
    throw new Error('neplatn\u00FD form\u00E1t souboru z\u00E1lohy');
  }
  await window.storage.replaceAll('onboarding:', payload.rows);
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
      ${settingsPanelStart('emailrules', 'Pravidla pro stávající e-mail')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Podle zdrojového úřadu se dopočítá stávající pracovní e-mail zaměstnance (pro zaslání odkazu na formulář). Použijte <code>{jmeno}</code> a <code>{prijmeni}</code> — bez diakritiky a malými písmeny se doplní automaticky. Nevyplněné úřady se nedopočítají, e-mail pak zadáte u osoby ručně.</p>
      ${ZDROJOVE_URADY.map(z => `
        <div class="contact-edit-row" style="grid-template-columns:120px 1fr;">
          <label style="font-size:13px;align-self:center;">${esc(z)}</label>
          <input data-emailrule-input="${esc(z)}" value="${esc((draft.emailRules||{})[z]||'')}" placeholder="{jmeno}.{prijmeni}@domena.cz">
        </div>
      `).join('')}
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('linkemail', 'Text e-mailu s odkazem pro zaměstnance')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Tento text se použije při odeslání odkazu zaměstnanci tlačítkem „Poslat odkaz e-mailem". Použijte <code>{jmeno}</code>, <code>{prijmeni}</code> a <code>{odkaz}</code> — doplní se automaticky za konkrétní osobu.</p>
      <div style="margin-bottom:10px;">
        <label style="font-size:12.5px;color:var(--ink-soft);display:block;margin-bottom:4px;">Předmět</label>
        <input data-linkemail-input="subject" value="${esc((draft.linkEmailTemplate||{}).subject||'')}" placeholder="${esc(DEFAULT_LINK_EMAIL_TEMPLATE.subject)}" style="width:100%;">
      </div>
      <div>
        <label style="font-size:12.5px;color:var(--ink-soft);display:block;margin-bottom:4px;">Text zprávy</label>
        <textarea data-linkemail-input="body" rows="6" style="width:100%;font:inherit;" placeholder="${esc(DEFAULT_LINK_EMAIL_TEMPLATE.body)}">${esc((draft.linkEmailTemplate||{}).body||'')}</textarea>
      </div>
      <button class="btn btn-ghost btn-sm" type="button" id="btn-linkemail-reset" style="margin-top:10px;">Obnovit výchozí text</button>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('returnemail', 'Text e-mailu při vrácení k doplnění')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Použije se při tlačítkách „Vrátit a poslat e-mailem" a „Poslat zaměstnanci e-mailem" i při kopírování zprávy. Zástupné značky: <code>{jmeno}</code>, <code>{prijmeni}</code>, <code>{odkaz}</code> (odkaz na dotazník), <code>{vzkaz}</code> (váš vzkaz při vrácení) a <code>{pole}</code> (seznam polí označených vlajkou ⚑). Značky <code>{vzkaz}</code> a <code>{pole}</code> se vynechají, pokud není co doplnit.</p>
      <div style="margin-bottom:10px;">
        <label style="font-size:12.5px;color:var(--ink-soft);display:block;margin-bottom:4px;">Předmět</label>
        <input data-returnemail-input="subject" value="${esc((draft.returnEmailTemplate||{}).subject||'')}" placeholder="${esc(DEFAULT_RETURN_EMAIL_TEMPLATE.subject)}" style="width:100%;">
      </div>
      <div>
        <label style="font-size:12.5px;color:var(--ink-soft);display:block;margin-bottom:4px;">Text zprávy</label>
        <textarea data-returnemail-input="body" rows="9" style="width:100%;font:inherit;" placeholder="${esc(DEFAULT_RETURN_EMAIL_TEMPLATE.body)}">${esc((draft.returnEmailTemplate||{}).body||'')}</textarea>
      </div>
      <button class="btn btn-ghost btn-sm" type="button" id="btn-returnemail-reset" style="margin-top:10px;">Obnovit výchozí text</button>
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('departments', 'Odbory / oddělení', {field:'departments', label:'Odbory / oddělení'})}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Seznam pro výběr odboru/oddělení v sekci Pracovní poměr. Číslo vlevo je kód útvaru (Ext. ID OJ ze systemizace) – použije se při exportu do Vemy (sloupec utvar). Kód se předvyplní podle názvu, lze ho přepsat.</p>
      ${draft.departments.map((w,i) => `
        <div class="contact-edit-row" style="grid-template-columns:90px 1fr auto;">
          <input data-department-code="${i}" value="${esc(departmentCodeFrom(draft, w))}" placeholder="kód" title="Kód útvaru ve Vemě (číselník útvarů)" inputmode="numeric" ${w ? '' : 'disabled'}>
          <input data-department-input="${i}" value="${esc(w)}" placeholder="Název odboru / oddělení">
          <button class="btn btn-ghost btn-sm" type="button" data-department-remove="${i}">Odebrat</button>
        </div>
      `).join('')}
      <button class="btn btn-ghost btn-sm" type="button" id="btn-department-add">+ Přidat odbor / oddělení</button>
      <button class="btn btn-ghost btn-sm" type="button" id="btn-department-fill" title="Přidá do seznamu útvary ze systemizace, které v něm zatím nejsou (včetně kódů).">Doplnit podle systemizace</button>
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
      ${settingsPanelStart('persnum', 'Osobní čísla')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Osobní číslo se novému spisu přidělí automaticky – vždy nejnižší volné číslo od zadaného začátku. Nastavte začátek tak, aby se vynechal interval čísel zaměstnanců DESÚ, kteří je už mají. Číslo smazaného spisu lze znovu použít, pokud se k němu ještě negenerovaly tabulky pro Vemu. Stávajícím spisům se číslo samo nepřidělí, změna začátku už přidělená čísla nemění. Když je pole prázdné, čísla se nepřidělují.</p>
      <div class="contact-edit-row" style="grid-template-columns:280px 1fr;">
        <label style="font-size:13px;align-self:center;">Přidělovat od čísla</label>
        <input data-persnum-start inputmode="numeric" value="${esc(draft.personalNumberStart||'')}" placeholder="např. 5000">
      </div>
      <div style="margin-top:12px;font-size:13px;">
        ${personalNumberStart() ? `Uloženo: přidělování od <strong>${personalNumberStart()}</strong>, další volné číslo <strong>${esc(nextPersonalNumber())}</strong>.` : '<span style="color:var(--red);">Začátek zatím není uložený – čísla se nepřidělují. Vyplňte ho a stiskněte Uložit nastavení.</span>'}
      </div>
      ${(state.settings.burnedNumbers||[]).length ? `<p style="font-size:12.5px;color:var(--ink-faint);margin:10px 0 0;">Už použitá a nepřidělitelná čísla smazaných spisů: ${esc([...(state.settings.burnedNumbers)].sort((a,b)=>a-b).join(', '))}</p>` : ''}
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('vemacodes', 'Kód pracoviště pro Vemu')}
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Číselný kód pracoviště (pracvz/pracv) se generuje automaticky — vzestupně podle pořadí pracovišť níže — a nejde ručně upravit. Export do Vemy z něj zároveň vytvoří záložku s číselníkem pracovišť.</p>
      ${workplaceList().map((w,wi) => `
        <div style="margin-bottom:14px;">
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">${esc(w)} <span style="font-weight:400;color:var(--ink-faint);">— kód ${wi+1}</span></label>
          <div class="contact-edit-row" style="grid-template-columns:1fr 1fr 1fr;">
            <input data-workplace-loc-input="${esc(w)}:okres" value="${esc((draft.workplaceLocations[w]||{}).okres||'')}" placeholder="Okres">
            <input data-workplace-loc-input="${esc(w)}:obec" value="${esc((draft.workplaceLocations[w]||{}).obec||'')}" placeholder="Obec">
            <input data-workplace-loc-input="${esc(w)}:sidlo" value="${esc((draft.workplaceLocations[w]||{}).sidlo||'')}" placeholder="Sídlo (ulice, č.p.)">
          </div>
        </div>
      `).join('')}
      ${settingsPanelEnd()}
    </div>

    <div class="panel" style="margin-bottom:20px;">
      ${settingsPanelStart('templates', 'Vzory dokumentů')}
      ${templatesPanelHtml()}
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

    <div class="panel" style="margin-top:28px;">
      <h4 style="font-family:var(--font-display);font-size:1.125rem;margin:0 0 8px;">Záloha dat</h4>
      <p style="font-size:13px;color:var(--ink-soft);margin:0 0 12px;"><strong>Pozor: záloha obsahuje osobní údaje (rodná čísla, čísla účtů). Uložte ji jen na zabezpečené místo a po použití ji smažte.</strong> Stáhne kompletní zálohu — rejstřík, všechny spisy, nastavení i obsah pro zaměstnance — jako jeden soubor. Obnova ze zálohy přepíše úplně vše aktuální tím, co je v souboru. Doporučujeme stáhnout zálohu před hromadným importem nebo jinou rizikovou akcí.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <button class="btn btn-ghost" id="btn-backup-download">Stáhnout zálohu (json)</button>
        <button class="btn btn-ghost" id="btn-backup-restore">Obnovit ze zálohy (json)</button>
        <input type="file" id="backup-file-input" accept=".json" hidden>
      </div>
    </div>

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


// ---------------- Přílohy (kartička ZP, osvědčení ZOZ) ----------------
// Metadata příloh jsou ve spisu (personal.prilohy), samotné soubory v tabulce onboarding_files (viz security.sql).
let fileApi = null;   // nastavuje se při startu: zaměstnanec { put, del }, personální oddělení { get, del, delRecord }
const ATTACH_MAX_PDF = 2621440;       // bajtů
const ATTACH_MAX_TOTAL = 12;
function fmtSize(n){ n = Number(n)||0; return n >= 1048576 ? (n/1048576).toFixed(1).replace('.',',')+' MB' : Math.max(1,Math.round(n/1024))+' kB'; }
function attachFilesOf(record, kind){ return ((record && record.personal && record.personal.prilohy) || []).filter(x => x && x.kind === kind); }
function slugName(t){ return String(t||'').trim().replace(/[\\/:*?"<>|]+/g,'').replace(/\s+/g,'_'); }
// Automatický název dokladu: Příjmení_Jméno_druh[_n].přípona (pořadí v rámci druhu přílohy)
function attachDisplayName(rec, item){
  const p = (rec && rec.personal) || {};
  const who = [slugName(p.prijmeni), slugName(p.jmeno)].filter(Boolean).join('_') || 'zamestnanec';
  const label = item.kind === 'zp_karta' ? 'kartička_ZP' : item.kind === 'zoz' ? 'osvědčení_ZOZ' : 'doklad';
  const same = attachFilesOf(rec, item.kind);
  const idx = same.findIndex(x => x.id === item.id);
  const n = same.length > 1 && idx >= 0 ? '_' + (idx + 1) : '';
  const ext = item.mime === 'application/pdf' ? 'pdf' : item.mime === 'image/png' ? 'png' : 'jpg';
  return `${who}_${label}${n}.${ext}`;
}
function safeThumb(t){ return typeof t === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]{20,40000}$/.test(t) ? t : ''; }
function attachmentsHtml(sec, r, editable){
  const a = sec.attachments;
  if(!a) return '';
  const list = attachFilesOf(r, a.kind);
  const canUpload = !!(editable && state.role === 'employee' && fileApi && fileApi.put);
  const canView = !!(state.role === 'hr' && fileApi && fileApi.get);
  const activeMissing = state.role === 'hr' ? currentApproveMissing() : currentSubmitMissing();
  const isMissing = a.required && list.length === 0 && activeMissing.some(m => m.fieldId === '_attach_' + a.kind);
  const msg = state.attachMsg && state.attachMsg.kind === a.kind ? state.attachMsg : null;
  const busy = state.attachBusy === a.kind;
  const items = list.map(x => {
    const th = safeThumb(x.thumb);
    return `<div class="attach-item">${th ? `<img src="${th}" alt="">` : `<span class="attach-pdf">PDF</span>`}
      <div class="attach-meta"><div class="attach-name">${esc(state.role === 'hr' ? attachDisplayName(r, x) : x.name)}</div><div class="attach-size">${esc(fmtSize(x.size))}</div></div>
      ${canView ? `<button class="btn btn-ghost btn-sm" type="button" data-attach-view="${esc(x.id)}">Zobrazit</button><button class="btn btn-ghost btn-sm" type="button" data-attach-download="${esc(x.id)}">⬇ Stáhnout</button>` : ''}
      ${canUpload ? `<button class="btn btn-ghost btn-sm" type="button" data-attach-del="${esc(x.id)}">Smazat</button>` : ''}
    </div>`;
  }).join('');
  const hasCam = !!(a.camera && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const full = list.length >= (a.max || 6);
  const pickLabel = a.addLabel || '📎 Nahrát soubor';
  return `<div class="attach-block ${isMissing ? 'missing' : ''}" data-attach-drop="${a.kind}">
    <h4 class="attach-title">${esc(a.title)}${a.required ? ' <span class="essential-dot" title="Povinný údaj">*</span>' : ' <span class="section-optional-tag">doplňkové</span>'}</h4>
    <p class="attach-hint">${esc(a.hint || '')}</p>
    ${items || `<p class="repeat-empty" ${isMissing ? 'style="color:var(--red);"' : ''}>${isMissing ? 'Povinný údaj — zatím nenahráno.' : 'Zatím nic nenahráno.'}</p>`}
    ${canUpload && !full ? `<div class="attach-actions">
      ${hasCam ? `<button class="btn btn-primary btn-sm" type="button" data-attach-cam="${a.kind}" ${busy?'disabled':''}>📷 Vyfotit kamerou</button>` : ''}
      <button class="btn ${hasCam ? 'btn-ghost' : 'btn-primary'} btn-sm" type="button" data-attach-pick="${a.kind}" ${busy?'disabled':''}>${esc(pickLabel)}</button>
      <input type="file" hidden data-attach-input="${a.kind}" accept="image/*,application/pdf" multiple>
      <span class="attach-note">JPG, PNG nebo PDF (PDF do ${fmtSize(ATTACH_MAX_PDF)}). Soubor můžete i přetáhnout sem.</span>
    </div>` : ''}
    ${canUpload && full ? `<p class="attach-note">Dosažen nejvyšší počet souborů (${a.max || 6}).</p>` : ''}
    ${busy ? `<p class="attach-note">Nahrávám…</p>` : ''}
    ${msg ? `<p class="attach-msg ${msg.err ? 'err' : ''}">${esc(msg.text)}</p>` : ''}
  </div>`;
}
function readAsDataUrl(blob){
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(fr.error); fr.readAsDataURL(blob); });
}
async function loadBitmap(blob){
  if(typeof createImageBitmap === 'function'){
    try{ return await createImageBitmap(blob, { imageOrientation: 'from-image' }); }catch(e){ /* zkusí níže */ }
    try{ return await createImageBitmap(blob); }catch(e){ /* zkusí níže */ }
  }
  const url = URL.createObjectURL(blob);
  try{
    return await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('img')); im.src = url; });
  } finally { URL.revokeObjectURL(url); }
}
function drawScaled(bmp, maxSide, quality){
  const w0 = bmp.width || bmp.naturalWidth, h0 = bmp.height || bmp.naturalHeight;
  const k = Math.min(1, maxSide / Math.max(w0, h0));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', quality);
}
// Vrátí {mime, b64, size, thumb, name}. Obrázky se zmenší (max. 1800 px, JPEG), PDF se předává beze změny.
async function prepareAttachment(blob, name){
  const type = (blob.type || '').toLowerCase();
  if(type === 'application/pdf' || /\.pdf$/i.test(name || '')){
    if(blob.size > ATTACH_MAX_PDF) throw new Error(`PDF je příliš velké (${fmtSize(blob.size)}). Nejvíce ${fmtSize(ATTACH_MAX_PDF)} – zkuste jej zmenšit nebo nahrát fotografii.`);
    const du = await readAsDataUrl(new Blob([blob], { type: 'application/pdf' }));
    return { mime: 'application/pdf', b64: du.split(',')[1], size: blob.size, thumb: '', name: name || 'dokument.pdf' };
  }
  if(!type.startsWith('image/')) throw new Error('Nepodporovaný typ souboru. Nahrajte prosím fotografii (JPG, PNG) nebo PDF.');
  let bmp;
  try{ bmp = await loadBitmap(blob); }catch(e){ throw new Error('Obrázek se nepodařilo načíst (formát HEIC z telefonu zkuste uložit jako JPG).'); }
  const main = drawScaled(bmp, 1600, 0.8);
  const thumb = drawScaled(bmp, 120, 0.7);
  const b64 = main.split(',')[1];
  return { mime: 'image/jpeg', b64, size: Math.round(b64.length * 0.75), thumb, name: (name || 'foto.jpg').replace(/\.(png|jpe?g|webp|heic|heif|gif|bmp)$/i, '') + '.jpg' };
}
function newFileId(){
  const b = new Uint8Array(12); crypto.getRandomValues(b);
  return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
}
async function uploadAttachments(kind, files){
  const sec = PERSONAL_SECTIONS.find(x => x.attachments && x.attachments.kind === kind);
  const max = (sec && sec.attachments.max) || 6;
  if(!fileApi || !fileApi.put || !state.currentRecord) return;
  state.attachMsg = null;
  state.attachBusy = kind; render();
  let ok = 0, errText = '';
  try{
    for(const f of files){
      const have = attachFilesOf(state.currentRecord, kind).length;
      if(have >= max){ errText = `Nejvíce ${max} souborů.`; break; }
      if((state.currentRecord.personal.prilohy || []).length >= ATTACH_MAX_TOTAL){ errText = 'Dosažen celkový počet příloh.'; break; }
      try{
        const p = await prepareAttachment(f, f.name || '');
        const id = newFileId();
        await fileApi.put(state.currentId, id, kind, p.name, p.mime, p.b64);
        state.currentRecord.personal.prilohy = [...(state.currentRecord.personal.prilohy || []), { id, kind, name: p.name, mime: p.mime, size: p.size, thumb: p.thumb, at: new Date().toISOString() }];
        ok++;
      }catch(e){ console.error('upload failed', e); errText = e && e.message && !/^(rpc|Failed|NetworkError)/i.test(e.message) ? e.message : 'Nahrání se nezdařilo, zkuste to prosím znovu.'; }
    }
    if(ok) await persistRecordOnly();
  } finally {
    state.attachBusy = null;
    state.attachMsg = errText ? { kind, text: errText, err: true } : (ok ? { kind, text: ok === 1 ? 'Soubor nahrán.' : `Nahráno souborů: ${ok}.` } : null);
    render();
  }
}
async function deleteAttachment(id){
  if(!fileApi || !fileApi.del || !state.currentRecord) return;
  const item = (state.currentRecord.personal.prilohy || []).find(x => x.id === id);
  if(!item) return;
  try{
    await fileApi.del(state.currentId, id);
    state.currentRecord.personal.prilohy = state.currentRecord.personal.prilohy.filter(x => x.id !== id);
    await persistRecordOnly();
    state.attachMsg = { kind: item.kind, text: 'Soubor smazán.' };
  }catch(e){ console.error('delete attachment failed', e); state.attachMsg = { kind: item.kind, text: 'Smazání se nezdařilo, zkuste to prosím znovu.', err: true }; }
  render();
}
async function fetchAttachmentBlob(id){
  const f = await fileApi.get(id);
  if(!f || !f.data) throw new Error('empty');
  const bin = atob(f.data); const arr = new Uint8Array(bin.length);
  for(let k = 0; k < bin.length; k++) arr[k] = bin.charCodeAt(k);
  return new Blob([arr], { type: f.mime });
}
async function viewAttachment(id){
  if(!fileApi || !fileApi.get) return;
  try{
    const url = URL.createObjectURL(await fetchAttachmentBlob(id));
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 120000);
  }catch(e){ console.error('view attachment failed', e); state.error = 'Soubor se nepodařilo načíst.'; render(); }
}
async function downloadAttachment(id){
  if(!fileApi || !fileApi.get) return;
  const item = ((state.currentRecord && state.currentRecord.personal && state.currentRecord.personal.prilohy) || []).find(x => x.id === id);
  try{
    const url = URL.createObjectURL(await fetchAttachmentBlob(id));
    const a = document.createElement('a');
    a.href = url; a.download = asciiName(item ? attachDisplayName(state.currentRecord, item) : 'doklad');
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }catch(e){ console.error('download attachment failed', e); state.error = 'Soubor se nepodařilo stáhnout.'; render(); }
}
async function openCameraModal(kind){
  let stream;
  try{ stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false }); }
  catch(e){
    state.attachMsg = { kind, text: 'Kameru se nepodařilo spustit (zkontrolujte, že jste v prohlížeči povolil/a přístup ke kameře). Soubor můžete nahrát tlačítkem „Nahrát soubor“.', err: true };
    render(); return;
  }
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `<div class="modal" style="max-width:520px;">
    <h3>Vyfotit kartičku pojišťovny</h3>
    <p style="font-size:13px;color:var(--ink-soft);margin:0 0 10px;">Přiložte kartičku <b>stranou s údaji</b> do rámečku a držte ji klidně. Jakmile ji aplikace rozpozná a bude čitelná, sama ji vyfotí a ořízne.</p>
    <canvas id="cam-view" style="width:100%;max-height:40vh;object-fit:contain;border-radius:8px;background:#000;display:block;"></canvas>
    <img id="cam-still" alt="" style="display:none;width:100%;max-height:36vh;object-fit:contain;border-radius:8px;background:#000;">
    <p id="cam-status" style="font-size:13px;margin:8px 0 0;color:var(--ink-soft);min-height:1.4em;">Spouštím kameru…</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="cam-cancel">Zrušit</button>
      <button class="btn btn-ghost" id="cam-shot">Vyfotit hned</button>
      <button class="btn btn-ghost" id="cam-retake" style="display:none;">Znovu</button>
      <button class="btn btn-primary" id="cam-use" style="display:none;">Použít fotografii</button>
    </div></div>`;
  document.body.appendChild(backdrop);
  const $ = sel => backdrop.querySelector(sel);
  const view = $('#cam-view'), still = $('#cam-still'), statusEl = $('#cam-status');
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.srcObject = stream;
  try{ await video.play(); }catch(e){ /* přehraje se po načtení metadat */ }
  const work = document.createElement('canvas');
  const wctx = work.getContext('2d', { willReadFrequently: true });
  const RATIO = 85.6 / 54;            // poměr stran platební/pojišťovací karty
  let raf = 0, timer = 0, last = null, stableCnt = 0, found = null, blob = null, closed = false, G = null, SC = 1;

  function geom(){
    const vw = video.videoWidth, vh = video.videoHeight;
    let gw = vw * 0.66, gh = gw / RATIO;
    if(gh > vh * 0.78){ gh = vh * 0.78; gw = gh * RATIO; }
    const gx = (vw - gw) / 2, gy = (vh - gh) / 2;
    const mx = gw * 0.24, my = gh * 0.28;
    const rx = Math.max(0, gx - mx), ry = Math.max(0, gy - my);
    return { vw, vh, gx, gy, gw, gh, rx, ry, rw: Math.min(vw - rx, gw + 2 * mx), rh: Math.min(vh - ry, gh + 2 * my) };
  }
  // Detekce hran kartičky: u každé strany rámečku hledá ostrou svislou/vodorovnou hranu (přechod kartička–pozadí).
  function detect(d, aw, ah, gg){
    // rozdíl barev dvou pixelů (součet rozdílů kanálů RGB / 3) – hrany tak najde i při podobné jasnosti kartičky a pozadí
    const df = (a, b) => (Math.abs(d[a*4] - d[b*4]) + Math.abs(d[a*4+1] - d[b*4+1]) + Math.abs(d[a*4+2] - d[b*4+2])) / 3;
    const band = Math.max(3, Math.round(gg.w * 0.16));
    const clampI = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    // Z celého pásma kolem strany rámečku vybere nejvzdálenější výraznou hranu (aby se nezaměnila s vnitřním
    // barevným pruhem kartičky): směr dir = -1 (levá/horní strana, nejnižší pozice) nebo +1 (pravá/dolní).
    const pick = (vals, lo, dir) => {
      let best = -1, sum = 0;
      vals.forEach(t => { sum += t; if(t > best) best = t; });
      let idx = -1;
      for(let n = 0; n < vals.length; n++){
        const i = dir < 0 ? n : vals.length - 1 - n;
        if(vals[i] >= Math.max(10, best * 0.45)){ idx = i; break; }
      }
      return { pos: lo + idx, score: best, ratio: best / Math.max(1, sum / vals.length) };
    };
    const scanV = (xc, y0, y1, dir) => {  // svislá hrana: vodorovný gradient
      const lo = clampI(Math.round(xc - band), 1, aw - 2), hi = clampI(Math.round(xc + band), 1, aw - 2), vals = [];
      for(let x = lo; x <= hi; x++){
        let t = 0; for(let y = y0; y < y1; y++) t += df(y*aw + x + 1, y*aw + x - 1);
        vals.push(t / Math.max(1, y1 - y0));
      }
      return pick(vals, lo, dir);
    };
    const scanH = (yc, x0, x1, dir) => {
      const lo = clampI(Math.round(yc - band), 1, ah - 2), hi = clampI(Math.round(yc + band), 1, ah - 2), vals = [];
      for(let y = lo; y <= hi; y++){
        let t = 0; for(let x = x0; x < x1; x++) t += df((y+1)*aw + x, (y-1)*aw + x);
        vals.push(t / Math.max(1, x1 - x0));
      }
      return pick(vals, lo, dir);
    };
    const y0 = clampI(Math.round(gg.y + gg.h * 0.15), 1, ah - 2), y1 = clampI(Math.round(gg.y + gg.h * 0.85), 2, ah - 1);
    const x0 = clampI(Math.round(gg.x + gg.w * 0.15), 1, aw - 2), x1 = clampI(Math.round(gg.x + gg.w * 0.85), 2, aw - 1);
    const L = scanV(gg.x, y0, y1, -1), R = scanV(gg.x + gg.w, y0, y1, 1), T = scanH(gg.y, x0, x1, -1), B = scanH(gg.y + gg.h, x0, x1, 1);
    const strong = [L, R, T, B].every(e => e.score >= 12 && e.ratio >= 1.7);
    if(!strong) return null;
    const w = R.pos - L.pos, h = B.pos - T.pos;
    if(w < gg.w * 0.7 || h < gg.h * 0.7) return null;
    const ratio = w / h;
    if(ratio < 1.35 || ratio > 1.85) return null;
    return { xl: L.pos, xr: R.pos, yt: T.pos, yb: B.pos };
  }
  function analyse(){
    if(closed || blob || !video.videoWidth) return;
    G = geom();
    const aw = 320, ah = Math.max(2, Math.round(aw * G.rh / G.rw));
    work.width = aw; work.height = ah;
    SC = aw / G.rw;
    wctx.drawImage(video, G.rx, G.ry, G.rw, G.rh, 0, 0, aw, ah);
    const d = wctx.getImageData(0, 0, aw, ah).data;
    const gg = { x: (G.gx - G.rx) * SC, y: (G.gy - G.ry) * SC, w: G.gw * SC, h: G.gh * SC };
    const r = detect(d, aw, ah, gg);
    found = r;
    if(!r){ stableCnt = 0; last = null; statusEl.textContent = 'Přiložte kartičku stranou s údaji do rámečku…'; return; }
    const tol = gg.w * 0.02;
    if(last && Math.abs(r.xl - last.xl) <= tol && Math.abs(r.xr - last.xr) <= tol && Math.abs(r.yt - last.yt) <= tol && Math.abs(r.yb - last.yb) <= tol) stableCnt++;
    else stableCnt = 1;
    last = r;
    statusEl.textContent = stableCnt >= 2 ? 'Kartička rozpoznána – držte ji klidně…' : 'Kartička nalezena…';
    if(stableCnt >= 6) capture(true);
  }
  function draw(){
    if(closed) return;
    raf = requestAnimationFrame(draw);
    if(blob || !video.videoWidth || !G) return;
    const k = 720 / G.rw;
    if(view.width !== 720 || view.height !== Math.round(G.rh * k)){ view.width = 720; view.height = Math.round(G.rh * k); }
    const c = view.getContext('2d');
    c.drawImage(video, G.rx, G.ry, G.rw, G.rh, 0, 0, view.width, view.height);
    const gx = (G.gx - G.rx) * k, gy = (G.gy - G.ry) * k, gw = G.gw * k, gh = G.gh * k;
    c.save(); c.fillStyle = 'rgba(0,0,0,0.45)';
    c.beginPath(); c.rect(0, 0, view.width, view.height); c.rect(gx, gy, gw, gh); c.fill('evenodd'); c.restore();
    c.lineWidth = 3; c.strokeStyle = found ? '#2ecc71' : '#ffffff'; c.setLineDash(found ? [] : [10, 8]);
    c.strokeRect(gx, gy, gw, gh);
  }
  function capture(auto){
    if(blob || !G || !video.videoWidth) return;
    let sx, sy, sw, sh;
    if(auto && found){      // oříznutí přesně na rozpoznanou kartičku (+ malý okraj)
      const pad = 0.004 * G.gw;
      sx = G.rx + found.xl / SC - pad; sy = G.ry + found.yt / SC - pad;
      sw = (found.xr - found.xl) / SC + 2 * pad; sh = (found.yb - found.yt) / SC + 2 * pad;
    } else { sx = G.gx; sy = G.gy; sw = G.gw; sh = G.gh; }
    sx = Math.max(0, sx); sy = Math.max(0, sy); sw = Math.min(G.vw - sx, sw); sh = Math.min(G.vh - sy, sh);
    const c = document.createElement('canvas'); c.width = Math.round(sw); c.height = Math.round(sh);
    c.getContext('2d').drawImage(video, sx, sy, sw, sh, 0, 0, c.width, c.height);
    c.toBlob(b => {
      if(!b || closed) return;
      blob = b; still.src = c.toDataURL('image/jpeg', 0.85);
      view.style.display = 'none'; still.style.display = '';
      $('#cam-shot').style.display = 'none'; $('#cam-retake').style.display = ''; $('#cam-use').style.display = '';
      statusEl.textContent = auto ? 'Kartička vyfocena a oříznuta. Zkontrolujte, že je text čitelný.' : 'Zkontrolujte, že je text čitelný.';
    }, 'image/jpeg', 0.92);
  }
  function close(){
    closed = true; cancelAnimationFrame(raf); clearInterval(timer);
    try{ stream.getTracks().forEach(t => t.stop()); }catch(e){}
    backdrop.remove();
  }
  $('#cam-cancel').addEventListener('click', close);
  $('#cam-shot').addEventListener('click', () => capture(false));
  $('#cam-retake').addEventListener('click', () => {
    blob = null; last = null; stableCnt = 0; found = null;
    still.style.display = 'none'; view.style.display = '';
    $('#cam-shot').style.display = ''; $('#cam-retake').style.display = 'none'; $('#cam-use').style.display = 'none';
    statusEl.textContent = 'Přiložte kartičku stranou s údaji do rámečku…';
  });
  $('#cam-use').addEventListener('click', () => {
    if(!blob) return;
    const f = new File([blob], 'kartička-zp.jpg', { type: 'image/jpeg' });
    close();
    uploadAttachments(kind, [f]);
  });
  statusEl.textContent = 'Přiložte kartičku stranou s údaji do rámečku…';
  draw();
  timer = setInterval(analyse, 130);
}
function attachFileHandlers(){
  const app = document.getElementById('app');
  app.querySelectorAll('[data-attach-pick]').forEach(b => b.addEventListener('click', () => {
    const inp = app.querySelector(`[data-attach-input="${b.getAttribute('data-attach-pick')}"]`); if(inp) inp.click();
  }));
  app.querySelectorAll('[data-attach-input]').forEach(inp => inp.addEventListener('change', () => {
    const files = Array.from(inp.files || []); inp.value = '';
    if(files.length) uploadAttachments(inp.getAttribute('data-attach-input'), files);
  }));
  app.querySelectorAll('[data-attach-cam]').forEach(b => b.addEventListener('click', () => openCameraModal(b.getAttribute('data-attach-cam'))));
  app.querySelectorAll('[data-attach-del]').forEach(b => b.addEventListener('click', () => deleteAttachment(b.getAttribute('data-attach-del'))));
  app.querySelectorAll('[data-attach-download]').forEach(b => b.addEventListener('click', () => downloadAttachment(b.getAttribute('data-attach-download'))));
  app.querySelectorAll('[data-attach-view]').forEach(b => b.addEventListener('click', () => viewAttachment(b.getAttribute('data-attach-view'))));
  app.querySelectorAll('[data-attach-drop]').forEach(z => {
    if(!z.querySelector('[data-attach-input]')) return;
    z.addEventListener('dragover', ev => { ev.preventDefault(); z.classList.add('dragover'); });
    z.addEventListener('dragleave', () => z.classList.remove('dragover'));
    z.addEventListener('drop', ev => {
      ev.preventDefault(); z.classList.remove('dragover');
      const files = Array.from((ev.dataTransfer && ev.dataTransfer.files) || []);
      if(files.length) uploadAttachments(z.getAttribute('data-attach-drop'), files);
    });
  });
}

function sectionFieldsHtml(sec, r, editable){
  const intro = Array.isArray(sec.intro) && sec.intro.length
    ? `<div style="display:block;margin:0 0 14px;padding:12px 14px;background:var(--paper-alt);border-radius:var(--radius);font-size:13.5px;line-height:1.55;"><p style="margin:0 0 6px;font-weight:700;">${esc(sec.intro[0])}</p>${sec.intro.slice(1).map(t => `<p style="margin:0 0 6px;">${esc(t)}</p>`).join('')}</div>` : '';
  return intro + sectionFieldsHtmlCore(sec, r, editable) + attachmentsHtml(sec, r, editable);
}
function sectionFieldsHtmlCore(sec, r, editable){
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
      html += `<div class="field-flag-note" style="margin-bottom:10px;">⚑ Personální: ${esc(flags[flagKey] || 'zkontrolujte prosím tuto sekci')} ${editable ? `<button class="btn btn-ghost btn-sm" type="button" data-flag-resolve="${flagKey}">✓ Vyřešeno</button>` : ''}</div>`;
    }
    if(rows.length === 0) html += `<p class="repeat-empty" ${missingSet.has('null:_atLeastOne')?'style="color:var(--red);"':''}>Zatím nevyplněno.${sec.requireAtLeastOne?' Je potřeba doplnit alespoň jednu položku.':''}${sec.emptyHint ? ' ' + esc(sec.emptyHint) : ''}</p>`;
    rows.forEach((row, i) => {
      html += `<div class="repeat-row ${(showFlagInfo || hrFlagMode) && flagged ? 'flagged':''}">
        <div class="repeat-head"><strong>${esc(sec.itemLabel || 'Položka')} ${i+1}</strong>${editable ? `<button class="btn btn-ghost btn-sm" type="button" data-repeat-remove="${sec.id}:${i}" title="Zrušit tuto položku">✕ Zrušit / odebrat</button>` : ''}</div>
        <div class="form-grid">`;
      html += sec.fields.map(f => {
        const pKey = sec.id+':'+i+':'+f.id;
        const pending = state.pendingEdit && state.pendingEdit.key === pKey ? state.pendingEdit : null;
        const rowWithPending = pending ? {...row, [f.id]: pending.newValue} : row;
        const displayVal = pending ? pending.newValue : row[f.id];
        const isMissing = missingSet.has(i+':'+f.id);
        return `<div class="field ${f.full?'full':''} ${isMissing?'missing':''}"><label>${esc(f.label)}${(f.essential||f.required)?' <span class="essential-dot" title="Povinný údaj">*</span>':''}</label>${fieldMarkup(f, displayVal, !editable, 'data-repeat-field', pKey)}
        ${isMissing ? `<div class="field-missing-note">Povinný údaj — nevyplněno</div>` : ''}
        ${validationNoteHtml(f, displayVal, rowWithPending)}
        ${editable ? autofillButtonHtml(f, rowWithPending, 'repeat', pKey) : ''}
        ${pending ? `<div class="pending-save-bar">Uložit „${esc(f.label)}“: <strong>${esc(pending.oldValue||'—')} → ${esc(pending.newValue||'—')}</strong><button type="button" class="btn btn-primary btn-sm" data-pending-confirm>Uložit</button><button type="button" class="btn btn-ghost btn-sm" data-pending-cancel>Zrušit</button></div>` : ''}
        </div>`;
      }).join('');
      html += `</div></div>`;
    });
    if(editable) html += `<button class="btn btn-ghost btn-sm" type="button" data-repeat-add="${sec.id}">${esc(sec.addLabel || '+ Přidat')}</button>`;
    return html;
  }
  syncZkusebniDoba(r.personal); // zkušební doba se vždy odvozuje z poměru a vedoucí pozice
  return `<div class="form-grid">${sec.fields.filter(f => !f.showIf || f.showIf(r.personal)).map(fRaw => {
    const f = resolveField(fRaw, r.personal);
    const flagged = f.id in flags;
    const pending = state.pendingEdit && state.pendingEdit.key === f.id ? state.pendingEdit : null;
    const lockedByDep = f.disabledIf && f.disabledIf(r.personal);
    const displayVal = lockedByDep && !f.showWhenLocked ? (f.default || '') : (pending ? pending.newValue : r.personal[f.id]);
    const ctxWithPending = pending ? {...r.personal, [f.id]: pending.newValue} : r.personal;
    const isMissing = missingSet.has(f.id);
    return `<div class="field ${f.full?'full':''} ${f.essential?'essential':''} ${(showFlagInfo || hrFlagMode) && flagged ? 'flagged':''} ${isMissing?'missing':''}">
      <div class="field-label-row">
        <label>${esc(f.label)}${(f.essential||f.required)?' <span class="essential-dot" title="Povinný údaj">*</span>':''}</label>
        ${hrFlagMode ? `<button type="button" class="flag-toggle ${flagged?'active':''}" data-flag-toggle="${f.id}" title="Označit pole jako problém">⚑ ${flagged ? 'Označeno' : 'Označit'}</button>` : ''}
      </div>
      ${fieldMarkup(f, displayVal, !editable || lockedByDep || f.readonly)}
      ${isMissing ? `<div class="field-missing-note">Povinný údaj — nevyplněno</div>` : ''}
      ${validationNoteHtml(f, displayVal, ctxWithPending)}
      ${editable ? autofillButtonHtml(f, ctxWithPending, 'field', f.id) : ''}
      ${pending ? `<div class="pending-save-bar">Uložit změnu: <strong>${esc(pending.oldValue||'—')} → ${esc(pending.newValue||'—')}</strong><button type="button" class="btn btn-primary btn-sm" data-pending-confirm>Uložit</button><button type="button" class="btn btn-ghost btn-sm" data-pending-cancel>Zrušit</button></div>` : ''}
      ${hrFlagMode && flagged ? `<input class="flag-note-input" data-flag-note="${f.id}" placeholder="Co u tohoto pole chybí nebo je nejasně vyplněné" value="${esc(flags[f.id]||'')}">` : ''}
      ${showFlagInfo && flagged ? `<div class="field-flag-note">⚑ Personální: ${esc(flags[f.id] || 'zkontrolujte prosím toto pole')} ${editable ? `<button class="btn btn-ghost btn-sm" type="button" data-flag-resolve="${f.id}">✓ Vyřešeno</button>` : ''}</div>` : ''}
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

function hasReturnFeedback(r){ return !!(r && (r.returnNote || Object.keys(r.fieldFlags || {}).length)); }
function returnBannerHtml(r, fallback){
  if(!hasReturnFeedback(r)) return '';
  return `<div class="return-banner"><strong>Personální oddělení vás žádá o doplnění.</strong>${r.returnNote ? esc(r.returnNote) : fallback}
    <div style="margin-top:8px;"><button class="btn btn-ghost btn-sm" type="button" data-resolve-all>✓ Mám doplněno – skrýt vzkaz a označení</button></div></div>`;
}
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

// Úplně prázdné (omylem přidané) položky v nepovinných opakovaných sekcích se nepočítají a při pohybu v dotazníku se odstraní.
function isRowEmpty(sec, row){
  return sec.fields.every(f => { const v = row && row[f.id] != null ? String(row[f.id]).trim() : ''; return v === '' || v === (f.default || '') || (f.id === 'od' && row.auto_od && v === row.auto_od); });
}
function pruneEmptyRows(record){
  let changed = false;
  PERSONAL_SECTIONS.forEach(sec => {
    if(sec.type !== 'repeat' || !sec.optional || !Array.isArray(record.personal[sec.id])) return;
    const kept = record.personal[sec.id].filter(row => !isRowEmpty(sec, row));
    if(kept.length !== record.personal[sec.id].length){ record.personal[sec.id] = kept; changed = true; }
  });
  return changed;
}
function missingRequiredFields(record, includeHr){
  const overrides = (state.settings && state.settings.hrRequiredOverrides) || {};
  const missing = [];
  PERSONAL_SECTIONS.forEach(sec => {
    if(sec.owner === 'hr' && !includeHr) return;
    if(sec.owner !== 'employee' && sec.owner !== 'hr') return;
    if(sec.attachments && sec.attachments.required && attachFilesOf(record, sec.attachments.kind).length === 0){
      missing.push({ sectionId: sec.id, section: sec.label, fieldId: '_attach_' + sec.attachments.kind, rowIdx: null, label: sec.attachments.title });
    }
    if(sec.type === 'repeat'){
      const rows = record.personal[sec.id] || [];
      if(sec.requireAtLeastOne && rows.length === 0){
        missing.push({ sectionId: sec.id, section: sec.label, fieldId: '_atLeastOne', rowIdx: null, label: 'Alespoň jedna položka' });
      }
      rows.forEach((row, idx) => {
        if(sec.optional && isRowEmpty(sec, row)) return;
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
      if(f.disabledIf && f.disabledIf(record.personal)) return;
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
  let html = r.personalPurgedAt ? `<div class="readonly-note">Osobní údaje zaměstnance byly z bezpečnostních důvodů smazány (${esc(formatDate(String(r.personalPurgedAt).slice(0,10)))}) — po uplynutí lhůty od vygenerování tabulek pro VEMU. Zůstalo jméno, pozice a stavy.</div>` : '';
  html += `<div class="review-row ${status==='reviewed'?'done':''}">
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
    if(status === 'returned') html += `<button class="btn btn-ghost btn-sm" id="btn-email-return" ${returnEmailAddress(r)?'':'disabled'}>Poslat zaměstnanci e-mailem</button>`;
    html += `<button class="btn btn-ghost btn-sm" id="btn-copy-return-message">${state.returnMsgCopied ? 'Zkopírováno ✓' : 'Zkopírovat zprávu pro zaměstnance'}</button>`;
  }
  html += `</div>`;
  if(status === 'returned' && r.returnNote){
    html += `<div class="readonly-note">Poslední vzkaz zaměstnanci: „${esc(r.returnNote)}"</div>`;
  }
  const approveMissing = currentApproveMissing();
  if(approveMissing.length > 0){
    const incompleteSectionNames = [...new Set(approveMissing.map(m => m.section.replace(/ \(položka \d+\)$/,'')))];
    html += `<div class="return-banner"><strong>Než půjde schválit, doplňte prosím povinné údaje (${approveMissing.length}) v těchto sekcích:</strong> ${incompleteSectionNames.map(esc).join(', ')}. Chybějící pole jsou červeně označená přímo níže.</div>`;
  }
  html += `<p style="font-size:12.5px;color:var(--ink-faint);margin-top:-6px;margin-bottom:18px;">Chybějící nebo nejasně vyplněné položky označte vlajkou ⚑ u konkrétního pole (nebo sekce) níže — zaměstnanec je pak uvidí zvýrazněné i s vaší poznámkou.</p>`;
  return html;
}

function renderImportMappingPage(){
  const cur = state.importCurrent;
  if(!cur) return `<p>Není co mapovat.</p>`;
  const previewRows = cur.rows.slice(0, 3);
  // Údaj, který se už u řádku přenáší namapovaným sloupcem (typicky z organigramu), nenabízíme
  // zároveň jako hromadnou/společnou hodnotu — ta by jen matla, protože hodnota ze sloupce má
  // vždy přednost (viz runImportBatch) a reálně by se nikdy neuplatnila.
  const mappedTargets = new Set(Object.values(cur.mapping || {}).filter(t => t && t !== 'ignore'));
  const commonFields = IMPORT_COMMON_FIELDS.filter(f => !mappedTargets.has(f.key));
  return `
    <div class="no-print" style="margin-bottom:16px;">
      <button class="btn btn-ghost btn-sm" id="btn-import-cancel">← Zrušit vytěžování</button>
    </div>
    <h2 style="font-family:var(--font-display);font-size:1.4rem;margin:0 0 6px;">Vytěžení podkladů — ${esc(cur.fileName)}</h2>
    <p style="font-size:13px;color:var(--ink-soft);margin:0 0 16px;">Nalezeno ${cur.rows.length} řádků. Zkontrolujte prosím u každého sloupce, na jaký údaj se má namapovat — appka to zkusila odhadnout sama, ale stojí za to to zkontrolovat, hlavně u sloupců, které nešly jednoznačně rozpoznat.</p>

    ${commonFields.length === 0 ? '' : cur.groupColIdx == null ? `
    <div class="panel" style="margin-bottom:16px;">
      <h4 style="font-family:var(--font-display);font-size:1.125rem;margin:0 0 4px;">Společné hodnoty pro celý soubor</h4>
      <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Nepovinné. Tabulky bývají za jednotlivá pracoviště, takže třeba pracoviště nebo datum nástupu bude stejné pro všechny řádky — vyplňte to tady místo v tabulce sloupec po sloupci. Pokud níže zároveň namapujete i sloupec z tabulky pro stejný údaj, hodnota ze sloupce má přednost (údaje už namapované sloupcem se tu proto nenabízí).</p>
      <div class="form-grid">
        ${commonFields.map(f => `
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
        <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 14px;">Nepovinné. Soubor obsahuje lidi z více původních útvarů/úřadů — u každého jde nastavit vlastní společné hodnoty (např. typ nástupu se může lišit podle toho, odkud kdo přechází). Pokud níže zároveň namapujete i sloupec z tabulky pro stejný údaj, hodnota ze sloupce má přednost (údaje už namapované sloupcem se tu proto nenabízí).</p>
        ${groups.map(g => `
          <div style="margin-bottom:18px;border-top:1px solid var(--line);padding-top:12px;">
            <label style="font-size:13.5px;font-weight:600;display:block;margin-bottom:8px;">${esc(g)} <span style="font-weight:400;color:var(--ink-faint);">(${groupCounts[g]} ${groupCounts[g]===1?'osoba':groupCounts[g]<5?'osoby':'osob'})</span></label>
            <div class="form-grid">
              ${commonFields.map(f => {
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


function renderPersonalForm(r){
  const role = state.role;
  let out = '';
  if(role === 'hr'){
    out += renderHrStatusPanel(r);
    out += `<div style="margin-bottom:16px;">
      <button class="btn btn-ghost btn-sm" id="btn-open-docs-detail" ${(r.personalStatus || 'draft') === 'reviewed' && !r.personalPurgedAt ? '' : 'disabled title="Dostupné po schválení údajů (Schválit údaje)."'}>📄 Dokumenty podle vzorů (Word, PDF) →</button>
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
  if(role === 'hr') out += renderVemaAutoPanel(r);
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
  // Krok se červeně označí, až když byl už otevřen (a opuštěn) a stále v něm chybí povinné údaje; pohyb mezi kroky nic neblokuje.
  state.visitedSteps = state.visitedSteps || {};
  const allMissing = canEdit ? missingRequiredFields(r, false) : [];
  const missingBySection = new Set(allMissing.map(m => m.sectionId));
  const crumbIncomplete = (key, on) => (on && state.visitedSteps[key] && key !== (idx < steps.length ? steps[idx].id : '__summary')) ? 'incomplete' : '';
  const breadcrumb = steps.map((sec,i) => `<span class="crumb ${i===idx?'active':''} ${sectionHasFlag(sec,r)?'flagged':''} ${crumbIncomplete(sec.id, missingBySection.has(sec.id))}" data-wizard-goto="${i}">${i+1}. ${esc(sec.navLabel||sec.label)}</span>`)
    .concat([`<span class="crumb ${idx===steps.length?'active':''} ${crumbIncomplete('__summary', missingBySection.size>0)}" data-wizard-goto="${steps.length}">${steps.length+1}. Souhrn</span>`])
    .join('<span class="crumb-sep">›</span>');
  state.visitedSteps[idx < steps.length ? steps[idx].id : '__summary'] = true;
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
    body += `<div class="info-box" style="margin-top:12px;">${PERSONAL_SECTIONS.filter(x => x.attachments).map(x => { const n = attachFilesOf(r, x.attachments.kind).length; return `<div class="context-item"><span>${esc(x.attachments.title)}</span>${n ? 'nahráno: ' + n : (x.attachments.required ? '<b style="color:#C62828">chybí</b>' : '—')}</div>`; }).join('')}</div>`;
    if(status === 'reviewed'){
      body += `<div class="wizard-review-msg">Vaše údaje personální oddělení již zkontrolovalo a schválilo.</div>`;
    } else if(status === 'submitted'){
      body += `<div class="wizard-pending-msg">Děkujeme, vaše údaje jsme odeslali personálnímu oddělení ke kontrole.</div>`;
    } else if(status === 'returned'){
      body += returnBannerHtml(r, 'Zkontrolujte prosím zvýrazněná pole v jednotlivých krocích.');
    } else {
      body += `<div class="wizard-pending-msg">Až budete mít vše vyplněné, potvrďte tlačítkem níže — údaje odešlete personálnímu oddělení ke kontrole.</div>`;
    }
    if(submitMissing.length > 0){
      const incompleteStepNames = [...new Set(submitMissing.map(m => {
        const s = steps.find(s => s.id === m.sectionId);
        return s ? (s.navLabel || s.label) : m.section;
      }))];
      body += `<div class="return-banner"><strong>Než budete moct odeslat, doplňte prosím povinné údaje (${submitMissing.length}) v těchto krocích:</strong> ${incompleteStepNames.map(esc).join(', ')}. Chybí: ${submitMissing.slice(0,8).map(m => esc(m.section + ' – ' + m.label)).join('; ')}${submitMissing.length > 8 ? '…' : ''}. Chybějící pole jsou červeně označená přímo v daném kroku i v navigaci nahoře.</div>`;
    }
  }
  const returnBanner = (status === 'returned' && idx < steps.length)
    ? returnBannerHtml(r, 'Zkontrolujte prosím zvýrazněná pole níže.')
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
    ${idx===0 ? `<div style="display:block;margin:0 0 14px;padding:12px 14px;background:var(--paper-alt);border-radius:var(--radius);font-size:13.5px;line-height:1.55;">Údaje z tohoto dotazníku slouží k zavedení do personálního a mzdového systému. Po jejich zavedení budou vaše citlivé osobní údaje z této aplikace <b>vymazány</b>.</div>` : ''}
    ${idx===0 && canEdit ? `<p style="font-size:12px;color:var(--ink-faint);margin:0 0 14px;"><span class="essential-dot">*</span> = povinný údaj — bez něj se dotazník neobejde, zbytek je doplňkový.</p>` : ''}
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
  attachFileHandlers();

  app.querySelectorAll('[data-role]').forEach(el => {
    el.addEventListener('click', () => guardSettingsLeave(() => { state.role = el.getAttribute('data-role'); state.view='list'; state.colFilters = {pozice:'', pracoviste:'', personal:'', it:'', assigned:''}; render(); }));
  });

  const newBtn = document.getElementById('btn-new');
  if(newBtn) newBtn.addEventListener('click', openNewModal);

  const openSettingsBtn = document.getElementById('btn-open-settings');
  if(openSettingsBtn) openSettingsBtn.addEventListener('click', () => { if(state.view === 'settings') return; state.view = 'settings'; state.settingsDraft = null; render(); });
  const backSettingsBtn = document.getElementById('btn-back-settings');
  if(backSettingsBtn) backSettingsBtn.addEventListener('click', () => guardSettingsLeave(() => { state.view = 'list'; state.settingsDraft = null; render(); }));
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

  app.querySelectorAll('[data-emailrule-input]').forEach(el => {
    el.addEventListener('change', () => {
      if(!state.settingsDraft.emailRules) state.settingsDraft.emailRules = {};
      state.settingsDraft.emailRules[el.getAttribute('data-emailrule-input')] = el.value.trim();
    });
  });

  app.querySelectorAll('[data-linkemail-input]').forEach(el => {
    el.addEventListener('change', () => {
      if(!state.settingsDraft.linkEmailTemplate) state.settingsDraft.linkEmailTemplate = {};
      state.settingsDraft.linkEmailTemplate[el.getAttribute('data-linkemail-input')] = el.value;
    });
  });
  app.querySelectorAll('[data-returnemail-input]').forEach(el => {
    el.addEventListener('change', () => {
      if(!state.settingsDraft.returnEmailTemplate) state.settingsDraft.returnEmailTemplate = {};
      state.settingsDraft.returnEmailTemplate[el.getAttribute('data-returnemail-input')] = el.value;
    });
  });
  const returnEmailResetBtn = document.getElementById('btn-returnemail-reset');
  if(returnEmailResetBtn) returnEmailResetBtn.addEventListener('click', () => {
    if(!confirm('Obnovit výchozí text e-mailu při vrácení k doplnění? Projeví se to až po uložení tlačítkem „Uložit nastavení".')) return;
    state.settingsDraft.returnEmailTemplate = {...DEFAULT_RETURN_EMAIL_TEMPLATE};
    render();
  });
  const linkEmailResetBtn = document.getElementById('btn-linkemail-reset');
  if(linkEmailResetBtn) linkEmailResetBtn.addEventListener('click', () => {
    if(!confirm('Obnovit výchozí text e-mailu s odkazem? Projeví se to až po uložení tlačítkem „Uložit nastavení".')) return;
    state.settingsDraft.linkEmailTemplate = {...DEFAULT_LINK_EMAIL_TEMPLATE};
    render();
  });

  app.querySelectorAll('[data-department-input]').forEach(el => {
    el.addEventListener('change', () => {
      const d = state.settingsDraft, i = el.getAttribute('data-department-input');
      const old = d.departments[i], code = departmentCodeFrom(d, old);
      d.departments[i] = el.value;
      if(!d.departmentCodes) d.departmentCodes = {};
      if(code && el.value && !d.departmentCodes[el.value]) d.departmentCodes[el.value] = code;   // přejmenování zachová kód
    });
  });
  app.querySelectorAll('[data-department-remove]').forEach(el => {
    el.addEventListener('click', () => { state.settingsDraft.departments.splice(el.getAttribute('data-department-remove'), 1); render(); });
  });
  app.querySelectorAll('[data-department-code]').forEach(el => {
    el.addEventListener('change', () => {
      const d = state.settingsDraft, name = d.departments[el.getAttribute('data-department-code')];
      if(!name) return;
      if(!d.departmentCodes) d.departmentCodes = {};
      d.departmentCodes[name] = el.value.trim();
    });
  });
  const departmentFillBtn = document.getElementById('btn-department-fill');
  if(departmentFillBtn) departmentFillBtn.addEventListener('click', () => {
    const d = state.settingsDraft;
    syncSettingsDraftFromDom();
    if(!d.departmentCodes) d.departmentCodes = {};
    const have = new Set(d.departments.filter(Boolean).map(x => normDeptName(x)));
    VEMA_UTVARY.forEach(([code, name]) => { if(!have.has(normDeptName(name))){ d.departments.push(name); d.departmentCodes[name] = code; } });
    render();
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

  app.querySelectorAll('[data-workplace-loc-input]').forEach(el => {
    el.addEventListener('change', () => {
      const [w, key] = el.getAttribute('data-workplace-loc-input').split(':');
      if(!state.settingsDraft.workplaceLocations[w]) state.settingsDraft.workplaceLocations[w] = {okres:'', obec:'', sidlo:''};
      state.settingsDraft.workplaceLocations[w][key] = el.value;
    });
  });
  app.querySelectorAll('[data-tpl-download]').forEach(el => el.addEventListener('click', () => downloadTemplateFile(el.getAttribute('data-tpl-download')).catch(e => alert('Vzor se nepodařilo stáhnout: ' + e.message))));
  app.querySelectorAll('[data-tpl-upload]').forEach(el => el.addEventListener('click', () => { const f = app.querySelector(`[data-tpl-file="${el.getAttribute('data-tpl-upload')}"]`); if(f) f.click(); }));
  app.querySelectorAll('[data-tpl-file]').forEach(el => el.addEventListener('change', () => { const f = el.files && el.files[0]; const id = el.getAttribute('data-tpl-file'); el.value = ''; if(f) uploadTemplateFile(id, f); }));
  app.querySelectorAll('[data-tpl-restore]').forEach(el => el.addEventListener('click', () => restoreTemplateFile(el.getAttribute('data-tpl-restore'))));
  app.querySelectorAll('[data-persnum-start]').forEach(el => {
    el.addEventListener('change', () => { const n = parseInt(String(el.value).replace(/\D/g,''),10); state.settingsDraft.personalNumberStart = n > 0 ? String(n) : ''; el.value = state.settingsDraft.personalNumberStart; });
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
  if(saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => saveSettingsDraft());

  const deleteAllBtn = document.getElementById('btn-delete-all');
  if(deleteAllBtn) deleteAllBtn.addEventListener('click', openDeleteAllModal);

  const backupDownloadBtn = document.getElementById('btn-backup-download');
  if(backupDownloadBtn) backupDownloadBtn.addEventListener('click', async () => {
    const prevText = backupDownloadBtn.textContent;
    backupDownloadBtn.disabled = true; backupDownloadBtn.textContent = 'Stahuji…';
    try{ await downloadBackup(); }
    catch(e){ console.error('backup download failed:', e); alert('Zálohu se nepodařilo stáhnout: ' + e.message); }
    backupDownloadBtn.disabled = false; backupDownloadBtn.textContent = prevText;
  });
  const backupRestoreBtn = document.getElementById('btn-backup-restore');
  if(backupRestoreBtn) backupRestoreBtn.addEventListener('click', () => {
    document.getElementById('backup-file-input').click();
  });
  const backupFileInput = document.getElementById('backup-file-input');
  if(backupFileInput) backupFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if(!file) return;
    if(!confirm(`Opravdu obnovit data ze zálohy „${file.name}"? Přepíše to VŠECHNY aktuální spisy, nastavení i obsah pro zaměstnance tím, co je v souboru — nynější data se tím ztratí. Tuto akci nelze vrátit zpět.`)) return;
    try{
      await restoreBackup(file);
      alert('Záloha byla obnovena. Stránka se nyní znovu načte.');
      location.reload();
    }catch(err){
      console.error('backup restore failed:', err);
      alert('Obnovu ze zálohy se nepodařilo dokončit: ' + err.message);
    }
  });

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
  const autoPanel = document.getElementById('auto-panel');
  if(autoPanel) autoPanel.addEventListener('toggle', () => { state.autoPanelOpen = autoPanel.open; });
  const generateVemaBtn = document.getElementById('btn-generate-vema');
  if(generateVemaBtn) generateVemaBtn.addEventListener('click', async () => {
    const ids = Object.keys(state.selectedExport).filter(id => state.selectedExport[id]);
    if(ids.length === 0) return;
    state.exporting = true;
    render();
    try{
      const warns = await generateVemaExport(ids);
      if(warns && warns.length) setTimeout(() => alert('Tabulky byly vygenerovány, ale pozor:\n\n' + warns.join('\n')), 300);
    }catch(e){
      console.error('generateVemaExport failed:', e);
      state.error = 'Generování tabulek se nezdařilo. Zkuste to prosím znovu.';
    }
    state.exporting = false;
    state.selectedExport = {};
    render();
  });

  const confirmUploadBtn = document.getElementById('btn-confirm-upload');
  if(confirmUploadBtn) confirmUploadBtn.addEventListener('click', () => {
    const ids = state.index.filter(r => state.selectedExport[r.id] && r.vemaExportedAt && !r.vemaUploadedAt && !r.personalPurgedAt).map(r => r.id);
    if(ids.length) openConfirmUploadModal(ids);
  });
    const purgeSelBtn = document.getElementById('btn-purge-selected');
  if(purgeSelBtn) purgeSelBtn.addEventListener('click', () => {
    const ids = state.index.filter(r => state.selectedExport[r.id] && r.vemaUploadedAt && !r.personalPurgedAt).map(r => r.id);
    if(ids.length) openPurgeModal(ids);
  });

  const importUploadBtn = document.getElementById('btn-import-upload');
  if(importUploadBtn) importUploadBtn.addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });
  const importOrgBtn = document.getElementById('btn-import-organigram');
  if(importOrgBtn) importOrgBtn.addEventListener('click', async () => {
    importOrgBtn.disabled = true;
    importOrgBtn.textContent = 'Stahuji…';
    try{
      const { all, fresh } = await fetchFreshOrganigramPeople();
      if(fresh.length === 0){
        state.error = all.length ? `V organigramu je ${all.length} obsazených osob, ale žádná není nová (zaměstnanci DESÚ se nepřebírají a ostatní už jsou v rejstříku).` : 'V organigramu nejsou žádné obsazené osoby.';
        render();
      } else {
        openOrganigramSourceModal(fresh, all.length);
      }
    }catch(err){
      console.error('organigram roster fetch failed:', err);
      state.error = `Stažení z organigramu se nezdařilo: ${err.message}`;
      render();
    }
    importOrgBtn.disabled = false;
    importOrgBtn.textContent = 'Stáhnout nové z organigramu';
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
  if(logoutBtn) logoutBtn.addEventListener('click', (ev) => { ev.preventDefault(); guardSettingsLeave(() => { if(window.appLogout) window.appLogout(); }); });

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

  const openDocsDetailBtn = document.getElementById('btn-open-docs-detail');
  if(openDocsDetailBtn) openDocsDetailBtn.addEventListener('click', () => openDocsModal(state.currentId));

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
    const tokenChanged = ensureAccessToken(state.currentRecord);
    const url = employeeLinkUrl(state.currentRecord, state.currentId);
    try{ await navigator.clipboard.writeText(url); }catch(e){}
    state.linkCopied = true;
    if(!state.currentRecord.linkGeneratedAt || tokenChanged){
      if(!state.currentRecord.linkGeneratedAt) state.currentRecord.linkGeneratedAt = new Date().toISOString();
      persistCurrentRecord();
    }
    render();
    setTimeout(() => { state.linkCopied = false; }, 3000);
  });

  const emailLinkBtn = document.getElementById('btn-email-link');
  if(emailLinkBtn) emailLinkBtn.addEventListener('click', () => {
    const r = state.currentRecord;
    const existingEmail = r.personal.email_stavajici;
    if(!existingEmail) return;
    const tokenChanged = ensureAccessToken(r);
    const url = employeeLinkUrl(r, state.currentId);
    const tpl = state.settings.linkEmailTemplate || DEFAULT_LINK_EMAIL_TEMPLATE;
    const fill = (s) => (s||'').replaceAll('{jmeno}', r.personal.jmeno||'').replaceAll('{prijmeni}', r.personal.prijmeni||'').replaceAll('{odkaz}', url);
    const subject = fill(tpl.subject || DEFAULT_LINK_EMAIL_TEMPLATE.subject);
    const body = fill(tpl.body || DEFAULT_LINK_EMAIL_TEMPLATE.body);
    window.location.href = `mailto:${encodeURIComponent(existingEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if(!state.currentRecord.linkGeneratedAt || tokenChanged){
      if(!state.currentRecord.linkGeneratedAt) state.currentRecord.linkGeneratedAt = new Date().toISOString();
      persistCurrentRecord();
      render();
    }
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
  const emailReturnBtn = document.getElementById('btn-email-return');
  if(emailReturnBtn) emailReturnBtn.addEventListener('click', () => {
    if(ensureAccessToken(state.currentRecord)) persistCurrentRecord();
    sendReturnEmail(state.currentRecord, state.currentId);
  });
  const copyMsgBtn = document.getElementById('btn-copy-return-message');
  if(copyMsgBtn) copyMsgBtn.addEventListener('click', async () => {
    const r = state.currentRecord;
    if(ensureAccessToken(r)) persistCurrentRecord();
    const msg = returnMessageText(r, state.currentId).body;
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
  app.querySelectorAll('[data-flag-resolve]').forEach(el => {
    el.addEventListener('click', () => {
      const flags = state.currentRecord.fieldFlags || {};
      delete flags[el.getAttribute('data-flag-resolve')];
      persistRecordOnly(); render();
    });
  });
  app.querySelectorAll('[data-resolve-all]').forEach(el => {
    el.addEventListener('click', () => {
      state.currentRecord.fieldFlags = {};
      state.currentRecord.returnNote = '';
      persistRecordOnly(); render();
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
          if(state.pendingEdit && state.pendingEdit.key === fieldId){ state.pendingEdit = null; requestAnimationFrame(render); }
          return;
        }
        state.pendingEdit = { key: fieldId, kind:'field', fieldId, oldValue, newValue };
        requestAnimationFrame(render);
        return;
      }
      state.currentRecord.personal[fieldId] = newValue;
      if(state.role === 'employee' && state.currentRecord.fieldFlags) delete state.currentRecord.fieldFlags[fieldId];
      if(fieldId === 'rozsah_uvazku' && newValue !== 'Zkrácený úvazek') state.currentRecord.personal.zkraceny_uvazek_procenta = '100';
      if(fieldId === 'rezim_zamestnani' || fieldId === 'vedouci') syncZkusebniDoba(state.currentRecord.personal);
      if(fieldId === 'jmeno' || fieldId === 'prijmeni' || fieldId === 'zdrojovy_urad') ensureExistingEmail(state.currentRecord);
      if(fieldId === 'pozice' || fieldId === 'datum_nastupu' || fieldId === 'pracoviste' || fieldId === 'kategorie' || fieldId === 'zdrojovy_urad') persistCurrentRecord();
      else persistRecordOnly();
      requestAnimationFrame(render);
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
          if(state.pendingEdit && state.pendingEdit.key === key){ state.pendingEdit = null; requestAnimationFrame(render); }
          return;
        }
        state.pendingEdit = { key, kind:'repeat', secId, idx, fieldId, oldValue, newValue };
        requestAnimationFrame(render);
        return;
      }
      state.currentRecord.personal[secId][idx][fieldId] = newValue;
      persistRecordOnly();
      requestAnimationFrame(render);
    });
  });

  app.querySelectorAll('[data-autocomplete]').forEach(input => {
    const kind = input.getAttribute('data-autocomplete');
    if(kind === 'utvar') input.addEventListener('change', () => { const n = normalizeDepartmentInput(input.value); if(n !== input.value) input.value = n; }, true);
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
      sec.fields.forEach(f => row[f.id] = f.default || '');
      if(!Array.isArray(state.currentRecord.personal[secId])) state.currentRecord.personal[secId] = [];
      if(secId === 'praxe'){     // nové období navazuje na konec předchozího (den po jeho „Do“); uživatel může přepsat
        const prev = state.currentRecord.personal[secId].slice(-1)[0];
        const m = prev && /^(\d{4})-(\d{2})-(\d{2})$/.exec(prev.do || '');
        if(m){
          const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + 1));
          row.od = d.toISOString().slice(0, 10);
          row.auto_od = row.od;
        }
      }
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
      if(state.role === 'employee' && state.currentRecord && pruneEmptyRows(state.currentRecord)) persistRecordOnly();
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
      if(state.role === 'employee' && state.currentRecord && pruneEmptyRows(state.currentRecord)) persistRecordOnly();
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
    entry.zdrojovyUrad = state.currentRecord.personal.zdrojovy_urad || entry.zdrojovyUrad;
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


// ---- Zabezpečení odkazu pro zaměstnance (viz security.sql) ----
const LINK_VALID_DAYS = 30;
function randomToken(){
  const b = new Uint8Array(24); crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
// Zajistí tajný token a platnost odkazu; vrací true, pokud se spis změnil (a je třeba ho uložit).
function ensureAccessToken(r, refreshExpiry){
  let changed = false;
  if(!r.accessToken){ r.accessToken = randomToken(); changed = true; }
  const exp = r.linkExpiresAt ? new Date(r.linkExpiresAt) : null;
  if(!exp || exp < new Date() || refreshExpiry){
    r.linkExpiresAt = new Date(Date.now() + LINK_VALID_DAYS*86400000).toISOString(); changed = true;
  }
  return changed;
}
function employeeLinkUrl(r, id){ return location.href.split('#')[0] + '#z/' + id + '/' + (r.accessToken || ''); }

// Text zprávy zaměstnanci při vrácení k doplnění (kopírování i e-mail)
function returnMessageText(r, id, tplOverride){
  const flagged = Object.entries(r.fieldFlags || {}).filter(([,v]) => v !== undefined);
  const url = employeeLinkUrl(r, id);
  const tpl = tplOverride || (state.settings && state.settings.returnEmailTemplate) || DEFAULT_RETURN_EMAIL_TEMPLATE;
  const vzkaz = r.returnNote ? `\n${r.returnNote}\n` : '';
  let pole = '';
  if(flagged.length){
    pole = `\nKonkrétně prosím zkontrolujte:\n` + flagged.map(([key, note]) => `- ${flagLabelFor(key)}${note ? ': '+note : ''}\n`).join('');
  }
  const fill = (s) => (s||'').replaceAll('{jmeno}', r.personal.jmeno||'').replaceAll('{prijmeni}', r.personal.prijmeni||'').replaceAll('{odkaz}', url).replaceAll('{vzkaz}', vzkaz).replaceAll('{pole}', pole);
  return { subject: fill(tpl.subject || DEFAULT_RETURN_EMAIL_TEMPLATE.subject).trim(), body: fill(tpl.body || DEFAULT_RETURN_EMAIL_TEMPLATE.body) };
}
function returnEmailAddress(r){ return (r.personal && (r.personal.email_stavajici || r.personal.email_soukromy)) || ''; }
function sendReturnEmail(r, id){
  const to = returnEmailAddress(r);
  if(!to) return false;
  const m = returnMessageText(r, id);
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
  return true;
}

// Smazání osobních údajů zaměstnance ze spisu (ručně po nahrání do Vemy; automaticky viz purge_onboarding v security.sql).
// Zůstane jméno, příjmení a údaje personálního oddělení (pozice, pracoviště, datum nástupu…).
function purgeRecordPersonalData(record){
  const keep = new Set(['jmeno','prijmeni']);
  PERSONAL_SECTIONS.filter(s => s.owner === 'employee').forEach(sec => {
    if(sec.type === 'repeat'){ record.personal[sec.id] = []; return; }
    sec.fields.forEach(f => { if(!keep.has(f.id)) record.personal[f.id] = ''; });
  });
  record.personal.prilohy = [];
  // odkaz zůstává platný, ale otevře už jen záložku „Co potřebujete vědět“ (server pak osobní údaje nepošle)
  record.consentGiven = false;
  record.fieldFlags = {};
  record.personalPurgedAt = new Date().toISOString();
  return record;
}
function openPurgeModal(ids){
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Smazat osobní údaje (${ids.length})?</h3>
      <p style="font-size:13.5px;color:var(--ink-soft);">U vybraných spisů se nevratně smažou osobní údaje zaměstnance (rodné číslo, adresa, účet, rodina, děti, vzdělání, praxe…) a odkaz pro zaměstnance dál otevře jen informační záložku „Co potřebujete vědět“. Zůstane jméno, pozice, pracoviště, datum nástupu a stavy.</p>
      <p style="font-size:13.5px;color:var(--ink-soft);"><strong>Smažte až poté, co jste ověřili, že se vše ve Vemě nahrálo.</strong> Případně si předtím uložte tištěné podklady.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="pg-cancel">Zrušit</button>
        <button class="btn btn-primary" id="pg-confirm">Ano, nevratně smazat</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  document.getElementById('pg-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  document.getElementById('pg-confirm').addEventListener('click', async () => {
    const btn = document.getElementById('pg-confirm');
    btn.disabled = true; btn.textContent = 'Mažu…';
    let failed = 0;
    for(const id of ids){
      try{
        const res = await window.storage.get(recordKey(id), true);   // přímo, aby výpadek nenahradil spis prázdným
        const rec = normalizeRecord(JSON.parse(res.value));
        purgeRecordPersonalData(rec);
        if(fileApi && fileApi.delRecord) await fileApi.delRecord(id);
        if(!(await saveRecord(id, rec))) throw new Error('save');
        const entry = state.index.find(e => e.id === id);
        if(entry){ entry.personalPurgedAt = rec.personalPurgedAt; }
      }catch(e){ console.error('purge failed', id, e); failed++; }
    }
    await saveIndex();
    state.selectedExport = {};
    if(failed) state.error = `U ${failed} spisů se smazání nezdařilo, zkuste to prosím znovu.`;
    backdrop.remove();
    render();
  });
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
        <button class="btn btn-ghost" id="rm-confirm">Jen vrátit</button>
        <button class="btn btn-primary" id="rm-confirm-mail" ${returnEmailAddress(r)?'':'disabled title="Zaměstnanec nemá vyplněný e-mail (stávající ani soukromý)"'}>Vrátit a poslat e-mailem</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById('rm-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  const doReturn = (mail) => {
    state.currentRecord.returnNote = document.getElementById('rm-note').value.trim();
    state.currentRecord.personalStatus = 'returned';
    ensureAccessToken(state.currentRecord, true);
    persistCurrentRecord();
    backdrop.remove();
    render();
    if(mail) sendReturnEmail(state.currentRecord, state.currentId);
  };
  document.getElementById('rm-confirm').addEventListener('click', () => doReturn(false));
  document.getElementById('rm-confirm-mail').addEventListener('click', () => doReturn(true));
}

const IMPORT_COMMON_FIELDS = [
  { key:'pracoviste', label:'Pracoviště', type:'select', options: () => ['', ...workplaceList()] },
  { key:'datum_nastupu', label:'Datum nástupu', type:'date' },
  { key:'typ_nastupu', label:'Typ nástupu', type:'select', options: () => ['', ...ONBOARDING_TYPES] },
  { key:'kategorie', label:'Kategorie', type:'select', options: () => ['', ...categoryNames()] },
  { key:'odbor_oddeleni', label:'Odbor / oddělení', type:'select', options: () => ['', ...departmentList()] },
  { key:'rezim_zamestnani', label:'Typ úvazku', type:'select', options: () => ['','Pracovní poměr','Služební poměr'] },
  { key:'doba_trvani_pomeru', label:'Doba trvání poměru', type:'select', options: () => ['','Na dobu neurčitou','Na dobu určitou'] },
  { key:'duvod_vzniku_pomeru', label:'Důvod vzniku pracovního poměru', type:'select', options: () => fieldDefFor('duvod_vzniku_pomeru').options },
  { key:'typ_pomeru', label:'Typ pracovního poměru (výchozí HPP)', type:'select', options: () => fieldDefFor('typ_pomeru').options },
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
  { key:'odbor_oddeleni', label:'Odbor / oddělení', apply:(r,v) => { r.personal.odbor_oddeleni = canonicalDepartment(String(v||'')); } },
  { key:'pracoviste', label:'Pracoviště', apply:(r,v) => { r.personal.pracoviste = String(v||'').trim(); } },
  { key:'pozice', label:'Pracovní pozice', apply:(r,v) => { r.personal.pozice = String(v||'').trim(); } },
  { key:'vedouci', label:'Vedoucí pozice (Ano/Ne)', apply:(r,v) => { const s=String(v||'').trim().toLowerCase(); if(s==='ano'||s==='a'||s==='1') r.personal.vedouci='Ano'; else if(s==='ne'||s==='n'||s==='0') r.personal.vedouci='Ne'; } },
  { key:'stupen_rizeni', label:'Stupeň řízení vedoucích zaměstnanců (1–4)', apply:(r,v) => { const m=String(v||'').match(/[1-4]/); if(m) r.personal.stupen_rizeni = m[0]+'. stupeň'; } },
  { key:'platova_trida', label:'Platová třída (1–16)', apply:(r,v) => { const n=parseInt(String(v||'').replace(/\D/g,''),10); if(n>=1&&n<=16) r.personal.platova_trida = String(n); } },
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
  { key:'orgPersonId', label:'ID z organigramu (interní, needitovatelné)', apply:(r,v) => { r.orgPersonId = String(v||'').trim(); } },
  { key:'zdrojovy_urad', label:'Zdrojový úřad', apply:(r,v) => { r.personal.zdrojovy_urad = String(v||'').trim(); } },
  { key:'nadrizeny', label:'Přímý nadřízený', apply:(r,v) => {
      const name = String(v||'').trim();
      if(!name) return;
      r.personal.nadrizeny = name;
      if(state.settings && Array.isArray(state.settings.supervisors) && !state.settings.supervisors.includes(name)) state.settings.supervisors.push(name);
    }
  },
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
  const mapping = { 0:'prijmeni', 1:'jmeno', 2:'titul_pred', 3:'zdrojovy_urad', 4:'odbor_oddeleni', 5:'pracoviste', 6:'pozice', 7:'rozsah_uvazku' };
  return { headers, rows, mapping, groupColIdx: 3 };
}

// ---- Napojení na organigram přes Supabase (tabulka organigram_roster, publikovaná organigramem při
// každém uložení) — alternativa k ručnímu importu JSON souboru. Druhý, samostatný anon klíč čte jen
// tuto jednu odvozenou tabulku, nikoliv celou strukturu organigramu. ----
let orgSb = null;
function getOrgSb(){
  if(orgSb) return orgSb;
  if(typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') return null;
  const url = window.ORGANIGRAM_SUPABASE_URL, key = window.ORGANIGRAM_SUPABASE_ANON_KEY;
  if(!url || !key || url.includes('VASE-PROJEKT') || key.includes('VLOZTE-SEM')) return null;
  orgSb = window.supabase.createClient(url, key);
  return orgSb;
}
function organigramConfigured(){ return !!getOrgSb(); }
function alreadyImportedOrgIds(){
  const ids = new Set();
  state.index.forEach(e => { if(e.orgPersonId) ids.add(e.orgPersonId); });
  return ids;
}
// Stáhne aktuální seznam osob z organigramu a vrátí ty, co ještě nejsou v rejstříku (dle stabilního
// person_id) a nejsou současnými zaměstnanci DESÚ (ti onboardingem neprocházejí) — bez ohledu na úřad.
// Výběr konkrétního úřadu řeší volající (openOrganigramSourceModal) filtrováním před sestavením importu.
async function fetchFreshOrganigramPeople(){
  const sbOrg = getOrgSb();
  if(!sbOrg) throw new Error('Napojení na organigram není v config.js nastaveno (ORGANIGRAM_SUPABASE_URL / ORGANIGRAM_SUPABASE_ANON_KEY).');
  const { data, error } = await sbOrg.from('organigram_roster').select('*');
  if(error) throw error;
  const all = data || [];
  const known = alreadyImportedOrgIds();
  const fresh = all.filter(p => p && p.person_id && p.src !== 'DESÚ' && !known.has(p.person_id));
  return { all, fresh };
}
// Sestaví {headers, rows, mapping, groupColIdx} pro import-mapping stránku z už vyfiltrovaného
// seznamu osob (viz fetchFreshOrganigramPeople — tady se jen staví řádky tabulky).
function organigramPeopleToImportRows(fresh){
  const headers = ['ID (organigram)', 'Příjmení', 'Jméno', 'Titul', 'Původ', 'Odbor / oddělení', 'Pracoviště', 'Pozice', 'Úvazek', 'Nadřízený', 'Režim zaměstnání', 'Vedoucí pozice', 'Stupeň řízení', 'Platová třída'];
  const rows = fresh.map(p => {
    const raw = String(p.name||'').trim();
    const parts = raw.split(',');
    const namePart = (parts[0]||'').trim();
    const titlePart = parts.slice(1).join(',').trim();
    const tokens = namePart.split(/\s+/).filter(Boolean);
    let jmeno = '', prijmeni = '';
    if(tokens.length >= 2){ jmeno = tokens[tokens.length-1]; prijmeni = tokens.slice(0,-1).join(' '); }
    else if(tokens.length === 1){ prijmeni = tokens[0]; }
    return [p.person_id, prijmeni, jmeno, titlePart, p.src||'', p.unit_path||'', p.location_name||'', capitalizeFirst(p.position_label||''), p.fte != null ? p.fte : '', p.supervisor_name||'', p.employment_type||'', p.position_kind==='head' ? 'Ano' : 'Ne', p.position_kind==='head' && p.management_level ? p.management_level : '', p.pay_grade != null ? p.pay_grade : ''];
  });
  // Pozn.: sloupec "Původ" (index 4) slouží současně jako groupColIdx (seskupení pro hromadné
  // hodnoty podle zdrojového úřadu na mapovací stránce) i jako zdroj pro pole zdrojovy_urad u osoby.
  const mapping = { 0:'orgPersonId', 1:'prijmeni', 2:'jmeno', 3:'titul_pred', 4:'zdrojovy_urad', 5:'odbor_oddeleni', 6:'pracoviste', 7:'pozice', 8:'rozsah_uvazku', 9:'nadrizeny', 10:'rezim_zamestnani', 11:'vedouci', 12:'stupen_rizeni', 13:'platova_trida' };
  return { headers, rows, mapping, groupColIdx: 4, newCount: rows.length };
}
// Nechá vybrat jeden konkrétní zdrojový úřad (typicky se doladí ÚÚR, pak teprve další úřady),
// nebo stáhnout rovnou všechny nové osoby najednou.
function openOrganigramSourceModal(fresh, totalCount){
  const counts = {};
  fresh.forEach(p => { const s = p.src || '(bez úřadu)'; counts[s] = (counts[s]||0) + 1; });
  const sources = Object.keys(counts).sort((a,b) => {
    const ia = ZDROJOVE_URADY.indexOf(a), ib = ZDROJOVE_URADY.indexOf(b);
    if(ia === -1 && ib === -1) return a.localeCompare(b);
    if(ia === -1) return 1;
    if(ib === -1) return -1;
    return ia - ib;
  });
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Které osoby stáhnout?</h3>
      <p style="font-size:13.5px;color:var(--ink-soft);">V organigramu je ${totalCount} obsazených osob k založení, z toho ${fresh.length} nových (po vyřazení DESÚ a již založených). Vyberte, jestli chcete stáhnout jen jeden zdrojový úřad, nebo rovnou všechny.</p>
      <div class="field">
        <label>Zdrojový úřad</label>
        <select id="org-src-select">
          <option value="">Všechny úřady (${fresh.length})</option>
          ${sources.map(s => `<option value="${esc(s)}">${esc(s)} (${counts[s]})</option>`).join('')}
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="org-src-cancel">Zrušit</button>
        <button class="btn btn-primary" id="org-src-confirm">Stáhnout</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById('org-src-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  document.getElementById('org-src-confirm').addEventListener('click', () => {
    const chosen = document.getElementById('org-src-select').value;
    backdrop.remove();
    const subset = chosen ? fresh.filter(p => (p.src||'(bez úřadu)') === chosen) : fresh;
    const { headers, rows, mapping, groupColIdx } = organigramPeopleToImportRows(subset);
    const label = chosen ? `${chosen} — ${subset.length} nových` : `${subset.length} nových (všechny úřady)`;
    state.importCurrent = { fileName: `Organigram (Supabase) — ${label}`, headers, rows, mapping, common:{}, groupColIdx, groupCommon:{} };
    state.importQueue = [];
    state.view = 'import-mapping';
    render();
  });
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
  const takenNums = new Set();
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
    syncZkusebniDoba(record.personal);
    ensureExistingEmail(record);
    const {total, done} = checklistTotals(record.checklist, record.personal.kategorie, 'it');
    const entry = { id, ref, jmeno: record.personal.jmeno||'', prijmeni: record.personal.prijmeni||'', pozice: record.personal.pozice||'', pracoviste: record.personal.pracoviste||'', datumNastupu: record.personal.datum_nastupu||'', zdrojovyUrad: record.personal.zdrojovy_urad||'', created: Date.now()+i, personalStatus:'draft', itTotal: total, itDone: done, hrMissingCount: missingHrRequiredFields(record).length, linkGeneratedAt: null, orgPersonId: record.orgPersonId || null };
    assignPersonalNumber(record, entry, takenNums);
    batch.push({ id, record, entry });
  });
  let saved = 0;
  for(const item of batch){
    state.index.push(item.entry);
    const ok = await saveRecord(item.id, item.record);
    if(ok){ saved++; } else { const idx = state.index.findIndex(e=>e.id===item.id); if(idx!==-1) state.index.splice(idx,1); }
  }
  await saveSettings(); // uloží případné nové nadřízené přibyté do seznamu během importu
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
const ROZUC_CODES = {'Neprovádět — podávám si vlastní daňové přiznání':'0','Provádět — budu u zaměstnavatele zaměstnán/a na konci roku':'1','Provádět — na konci roku už u zaměstnavatele zaměstnán/a nebudu, ale jinde nepracuji':'2'};
const TYPPV_CODES = {'Odměňování podle § 5 NV':'1','Pásmové odměňování (§ 6 NV) s platovými postupy':'2','Pásmové odměňování (§ 6 NV) bez platových postupů':'3'};

const ZHLAV_POVINNE_KODY = new Set(['oscis','upljmeno','rocis','statp','zivmi','rozuc','predvls','predvlp','predvle','predvlm','potpri','zpo','zpzpoj','danrez','stazas','ppvza','sdouvz','ppvlim','vyods','pracvz','ppvdr','stspr','pocrd','vedouci','minmzda','tarif','zpodm','zmr','rozst','rozin','rozpr','mzdza','plasku','plastu','rodpr','mistn','dovpj','dovpmt','dovup','prvpl','inval','stud','zvzda','ztppm']);
// (ztppm je od 14. 10. v seznamu: Vema ho vyžaduje vždy; u neženatých/nevdaných se plní '0')

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
    {code:'zivmi', get:p=>String((p.deti||[]).filter(d=>d.danove_zvyhodneni==='Ano').length)},
    {code:'rozuc', get:p=>ROZUC_CODES[p.zpusob_rocniho_zuctovani] || ''},
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
    {code:'zkusd', get:p=>zkusdMonths(p)},
    {code:'pracvz', get:p=>workplaceVemaCode(p.pracoviste)},
    {code:'utvar', get:p=>departmentCode(p.odbor_oddeleni)},   // číselný kód útvaru podle číselníku Vemy
    {code:'ppvdr', get:p=>ppvdrCode(p)},
    {code:'osvpoj', get:p=>'0'},
    {code:'eviod', get:p=>'0'},
    {code:'zames', get:p=>''},
    {code:'povolani', get:p=>''},
    {code:'skjkz', get:p=>''},
    {code:'czicse', get:p=>vemaAuto(p).czicse},
    {code:'stspr', get:p=>vc.stspr||''},
    {code:'pocrd', get:p=>vc.pocrd||''},
    {code:'vedouci', get:p=>ynCode(p.vedouci)},
    {code:'stupr', get:p=>p.stupen_rizeni ? p.stupen_rizeni.replace('. stupeň','') : ''},
    {code:'skuprac', get:p=>''},
    {code:'pltr', get:p=>p.platova_trida},
    {code:'dopldo', get:p=>''},
    {code:'dopldod', get:p=>''},
    {code:'minmzda', get:p=>'0'},
    {code:'vypuv', get:p=>''},
    {code:'limpr', get:p=>''},
    {code:'limnepp', get:p=>''},
    {code:'tarif', get:p=>vemaAuto(p).tarif},
    {code:'typpv', get:p=>vemaAuto(p).typpv},
    {code:'dzpvk', get:p=>''},
    {code:'zpodm', get:p=>vemaAuto(p).zpodm},
    {code:'zmr', get:p=>'0'},
    {code:'rozst', get:p=>'1'},
    {code:'rozin', get:p=>'1'},
    {code:'rozprh', get:p=>p.rozsah_uvazku==='Zkrácený úvazek' ? p.zkraceny_uvazek_hodiny : ''},
    {code:'rozpr', get:p=>p.rozsah_uvazku==='Zkrácený úvazek' ? (p.zkraceny_uvazek_procenta || '') : '100'},
    {code:'odprdo', get:p=>''},
    {code:'plpost', get:p=>vemaAuto(p).plpost},
    {code:'zupltar', get:p=>vemaAuto(p).zupltar},
    {code:'mzdza', get:p=>p.platova_trida},
    {code:'skupzm', get:p=>vemaAuto(p).skupzm},
    {code:'plasku', get:p=>vemaAuto(p).plasku},
    {code:'plastu', get:p=>vemaAuto(p).plastu},
    {code:'zvodm', get:p=>''},
    {code:'nahsv', get:p=>''},
    {code:'nahdov', get:p=>''},
    {code:'prumt', get:p=>vc.prumt||'5'},
    {code:'prude', get:p=>''},
    {code:'pruths', get:p=>vc.pruths||'40'},
    {code:'rodpr', get:p=>p.rodne_prijmeni || p.prijmeni},   // povinné ve Vemě; když není vyplněno, platí současné příjmení
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
    {code:'dovpj', get:p=>'0'},
    {code:'dovpmt', get:p=>'0'},
    {code:'dnyvyp', get:p=>''},
    {code:'dovup', get:p=>'0'},
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
    {code:'zvzda', get:p=>'0'},
    {code:'prijmm', get:p=>p.prijmeni_manzela},
    {code:'jmenom', get:p=>p.jmeno_manzela},
    {code:'rocism', get:p=>p.rodne_cislo_manzela},
    {code:'ztppm', get:p=>['Ženatý/vdaná','Registrované partnerství'].includes(p.rodinny_stav) ? ynCode(p.manzel_ztpp) : '0'},   // povinné ve Vemě; u neženatých/nevdaných 0
    {code:'pracv', get:p=>workplaceVemaCode(p.pracoviste)},
  ];
}

const SATELLITE_TABLES = [
  {
    name: 'Adresy',
    header: ['oscis-A','adrcis-A','ucel-A','prij-A','ulice-A','cp-A','co-A','obec-A','psc-A','posta-A','stat-A','telefon-A','indadr-A'],
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
      return [[oscis, p.datum_zahajeni_vzdelani || p.rok_zahajeni, p.datum_ukonceni_vzdelani || p.rok_ukonceni, p.stupen_vzdelani, p.obor, p.skola, p.sidlo_skoly, p.druh_zkousky]];
    }
  },
  {
    name: 'Predchozi_zamestnani',
    header: ['oscis-A','zamod-A','zamdo-A','zamorg-A','sidorg-A','zamvykz-A'],
    rows(oscis, p){
      return (p.praxe||[]).map(x => [oscis, x.od, x.do, x.organizace || (x.druh && x.druh !== 'Zaměstnání' ? x.druh : ''), x.sidlo, x.pracovni_zarazeni || (x.druh && x.druh !== 'Zaměstnání' && x.organizace ? x.druh : '')]);
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

// Datum pro Vemu ve tvaru DDMMRR (text, aby se neztratila úvodní nula). Hodnoty, které nejsou datum, se nemění.
function vemaDate(v){
  if(typeof v !== 'string') return v;
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if(m) return m[3] + m[2] + m[1].slice(2);
  m = /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/.exec(v.trim());
  if(m) return m[1].padStart(2,'0') + m[2].padStart(2,'0') + m[3].slice(2);
  return v;
}
// Sloupce, které Vema bere jako číslo (ne text)
const ZHLAV_NUMERIC = new Set(['zkusd','plasku']);
function vemaNumber(v){
  if(v === '' || v == null) return '';
  const n = Number(String(v).replace(',','.'));
  return Number.isFinite(n) ? n : v;
}

async function generateVemaExport(ids){
  const records = [];
  for(const id of ids){
    const record = await loadRecord(id);
    const entry = state.index.find(e => e.id === id);
    records.push({ id, entry, record });
  }
  const warnings = [];
  const cols = zhlavColumns();
  const tables = [];

  // ZHLAV
  const zhlavRows = records.map(({record}) => cols.map(c => {
    let v; try{ v = c.get(record.personal) ?? ''; }catch(e){ v = ''; }
    if(ZHLAV_NUMERIC.has(c.code)) return vemaNumber(v);
    return vemaDate(v);
  }));
  const utvarIdx = cols.findIndex(c => c.code === 'utvar');
  records.forEach(({record}, i) => {
    const nm = record.personal.odbor_oddeleni;
    if(nm && !zhlavRows[i][utvarIdx]) warnings.push(`${record.personal.prijmeni || ''} ${record.personal.jmeno || ''}: útvar „${nm}“ nemá kód (doplňte ho v Nastavení → Odbory / oddělení).`);
  });
  tables.push({
    name: 'ZHLAV', header: cols.map(c => c.code + '-A'), rows: zhlavRows,
    styleHeader: (cell, colIdx) => {
      const povinne = ZHLAV_POVINNE_KODY.has(cols[colIdx-1].code);
      cell.fill = { type:'pattern', pattern:'solid', fgColor: { argb: povinne ? 'FFFF0000' : 'FF70AD47' } };
      cell.font = { bold:true, color: { argb: povinne ? 'FFFFFFFF' : 'FF000000' } };
    }
  });

  // satelitní tabulky
  SATELLITE_TABLES.forEach(def => {
    const rows = [];
    records.forEach(({record}) => {
      const oscis = record.personal.osobni_cislo || '';
      def.rows(oscis, record.personal).forEach(r => rows.push(r.map(vemaDate)));
    });
    tables.push({ name: def.name, header: def.header, rows });
  });

  // číselníky (pro kontrolu ve Vemě)
  tables.push({ name: 'Ciselnik_pracovist', header: ['kod','nazev'], rows: workplaceList().map((w, i) => [i + 1, w]), widths: [10, 45] });
  const depRows = departmentList().filter(Boolean).map(n => [departmentCode(n), n]).filter(r => r[0]);
  tables.push({ name: 'Ciselnik_utvaru', header: ['kod','nazev'], rows: depRows, widths: [10, 60] });

  // každá tabulka = samostatný soubor .xlsx, všechny dohromady v ZIPu s datem generování
  const files = [];
  for(const t of tables){
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(t.name);
    ws.addRow(t.header);
    t.rows.forEach(r => ws.addRow(r));
    if(t.styleHeader) ws.getRow(1).eachCell((cell, colIdx) => t.styleHeader(cell, colIdx));
    t.header.forEach((h, i) => { ws.getColumn(i+1).width = (t.widths && t.widths[i]) || 14; });
    // datumy (DDMMRR) a kódy musí zůstat text – nastavit textový formát buněk s úvodní nulou
    ws.eachRow((row, rn) => { if(rn > 1) row.eachCell(cell => { if(typeof cell.value === 'string' && /^0\d*$/.test(cell.value)) cell.numFmt = '@'; }); });
    const buf = await wb.xlsx.writeBuffer();
    files.push({ name: t.name + '.xlsx', blob: new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) });
  }
  if(typeof DocGen === 'undefined') throw new Error('Modul pro ZIP se nenačetl');
  DocGen.init({ version: APP_VERSION });
  const zip = await DocGen.zipFiles(files);

  const now = new Date();
  const p2 = n => String(n).padStart(2,'0');
  const stamp = `${now.getFullYear()}${p2(now.getMonth()+1)}${p2(now.getDate())}-${p2(now.getHours())}${p2(now.getMinutes())}`;
  downloadBlob(zip, `VEMA_export_${stamp}.zip`);

  const nowIso = now.toISOString();
  for(const {id, record} of records){
    record.vemaExportedAt = nowIso;
    record.vemaUploadedAt = null;   // nové tabulky je třeba znovu nahrát a potvrdit
    await saveRecord(id, record);
    const idxEntry = state.index.find(e => e.id === id);
    if(idxEntry){ idxEntry.vemaExportedAt = nowIso; idxEntry.vemaUploadedAt = null; }
  }
  await saveIndex();
  return warnings;
}

// ---------------- Dokumenty podle vzorů (Word + PDF) ----------------
// Vzory jsou ve složce templates/ jako .docx se zástupnými poli {{pole}} (viz tools/build_templates.py).
// when: both = všichni, pracovni / sluzebni = podle typu poměru, optional = dle potřeby (nezaškrtnuté předem).
const DOC_TEMPLATES = [
  { id:'smlouva',  base:'02_Pracovní_smlouva',                    title:'Pracovní smlouva',                                          file:'templates/02_pracovni_smlouva.docx',                   when:'both' },
  { id:'vymer',    base:'01_Platový_výměr',                       title:'Platový výměr',                                             file:'templates/01_platovy_vymer.docx',                      when:'both' },
  { id:'dohoda',   base:'Dohoda_o_výkonu_služby_z_jiného_místa',  title:'Dohoda o výkonu služby z jiného místa',                     file:'templates/dohoda_o_vykonu_sluzby_z_jineho_mista.docx', when:'optional' },
  { id:'hodnoceni',base:'03_Kritéria_hodnocení',                  title:'Prohlášení o seznámení s kritérii hodnocení',               file:'templates/03_hodnotici_kriteria.docx',                 when:'both' },
  { id:'foto',     base:'04_Portrétní_fotografie',                title:'Informace – pořízení portrétní fotografie',                 file:'templates/04_portretni_fotografie.docx',               when:'both' },
  { id:'bozp',     base:'05_Poučení_BOZP_PO',                     title:'Vstupní školení BOZP a požární ochrany',                    file:'templates/05_pouceni_BOZP_PO.docx',                    when:'both' },
  { id:'info',     base:'07_Informace_o_pracovním_poměru',        title:'Informace o pracovním poměru státního zaměstnance',         file:'templates/07_informace_o_pracovnim_pomeru.docx',       when:'sluzebni' },
  { id:'predpisy', base:'08_Prohlášení_interní_předpisy',         title:'Prohlášení o seznámení s interními předpisy (BOZP, etický kodex)', file:'templates/08_prohlaseni_interni_predpisy.docx',  when:'both' },
  { id:'osv_oc',   base:'Osvědčení_obecná_část',                  title:'Osvědčení o rovnocennosti obecné části úřednické zkoušky',  file:'templates/osvedceni_obecna_cast.docx',                 when:'optional' },
  { id:'osv_zc',   base:'Osvědčení_zvláštní_část',                title:'Osvědčení o rovnocennosti zvláštní části úřednické zkoušky',file:'templates/osvedceni_zvlastni_cast.docx',               when:'optional' },
  { id:'dotaznik', base:'09_Osobní_dotazník',                     title:'Osobní dotazník (A)',                                       file:'templates/09_osobni_dotaznik.docx',                    when:'both' },
  { id:'praxe',    base:'10_Prohlášení_o_praxi',                  title:'Prohlášení o průběhu předchozích zaměstnání a činností (B)',file:'templates/10_prohlaseni_o_praxi.docx',                 when:'both' },
  { id:'ucet',     base:'11_Souhlas_s_bezhotovostním_zasíláním',  title:'Souhlas se zasíláním platu na osobní účet (C)',             file:'templates/11_souhlas_s_bezhotovostnim_zasilanim.docx', when:'both' },
  { id:'priloha',  base:'Příloha_1_Prohlášení_BOZP',              title:'Příloha č. 1 – Prohlášení k dodržování BOZP (služba z jiného místa)', file:'templates/priloha_1_prohlaseni_BOZP.docx',   when:'optional' },
];
// Pracovní smlouva (č.j.) + Platový výměr (č.j./A) + Dohoda o výkonu služby z jiného místa (č.j./B) se vybírají a číslují společně
const DOC_CJ_GROUP = ['smlouva', 'vymer', 'dohoda'];
const DOC_WHEN_LABEL = { both:'všichni', pracovni:'pracovní poměr', sluzebni:'služební poměr', optional:'dle potřeby' };

function csDate(iso){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${parseInt(m[3], 10)}. ${parseInt(m[2], 10)}. ${m[1]}` : (iso || '');
}
// pohlaví podle rodného čísla (měsíc +50 u žen), jinak podle koncovky příjmení; neznámé → null
function personSex(p){
  const rc = String(p.rodne_cislo || '').replace(/\D/g, '');
  if(rc.length >= 6){ const mm = parseInt(rc.slice(2, 4), 10); if((mm >= 51 && mm <= 62) || (mm >= 71 && mm <= 82)) return 'z'; if((mm >= 1 && mm <= 12) || (mm >= 21 && mm <= 32)) return 'm'; }
  const pr = String(p.prijmeni || '').trim().toLowerCase();
  if(/(ová|á)$/.test(pr)) return 'z';
  if(/(ý|ík|ek|el|ec|[bcdfghjklmnprstvz])$/.test(pr) && !/á$/.test(pr)) return pr.length ? 'm' : null;
  return null;
}
function docAddress(p){
  const street = (p.trvale_ulice || p.trvale_obec || '').trim();
  const l1 = [street, `${p.trvale_cp || ''}${p.trvale_co ? '/' + p.trvale_co : ''}`.trim()].filter(Boolean).join(' ');
  const l2 = [p.trvale_psc, p.trvale_obec].filter(Boolean).join(' ');
  return [l1, l2].filter(Boolean).join(', ');
}
function fmtMoney(n){ return n ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''; }
// hodnoty do zástupných polí šablon
function docValues(r){
  const p = r.personal || {};
  const sex = personSex(p);
  const titulyPred = (p.titul_pred || '').trim(), titulZa = (p.titul_za || '').trim();
  const jmenoCele = [titulyPred, (p.jmeno || '').trim(), (p.prijmeni || '').trim()].filter(Boolean).join(' ') + (titulZa ? ', ' + titulZa : '');
  const adr = docAddress(p);
  const stupen = parseInt(p.platovy_stupen, 10) || 1;
  const tarif = fmtMoney(tarifniPlat(p, stupen));
  let hodiny = '40';
  if(p.rozsah_uvazku === 'Zkrácený úvazek'){
    const h = parseFloat(String(p.zkraceny_uvazek_hodiny || '').replace(',', '.')), pct = parseFloat(String(p.zkraceny_uvazek_procenta || '').replace(',', '.'));
    const v = h > 0 ? h : (pct > 0 ? Math.round(40 * pct / 100 * 2) / 2 : 40);
    hodiny = String(v).replace('.', ',');
  }
  const misto = [p.misto_narozeni, p.okres_narozeni ? 'okres ' + p.okres_narozeni : ''].filter(Boolean).join(', ');
  const dots = '……………………';
  const yn = (v, yes, no) => { const x = String(v || '').trim().toLowerCase(); return x === yes.toLowerCase() ? yes : x === no.toLowerCase() ? no : yes + ' / ' + no; };
  const dash = v => (String(v == null ? '' : v).trim()) || '—';
  const cj = String(r.cisloJednaci || '').trim();
  return {
    cj: cj || dots,
    cj_a: (cj || dots) + '/A',
    cj_b: (cj || dots) + '/B',
    __rows: {
      deti: (p.deti || []).map(d => ({ jmeno: [d.jmeno, d.prijmeni].filter(Boolean).join(' '), datum: csDate(d.datum_narozeni), rodne_cislo: d.rodne_cislo || '', bydliste: d.bydliste || '' })),
      praxe: (p.praxe || []).map(x => ({ organizace: (x.druh && x.druh !== 'Zaměstnání' ? x.druh + (x.organizace ? ' – ' : '') : '') + (x.organizace || '') + (x.sidlo ? ', ' + x.sidlo : ''), zarazeni: x.pracovni_zarazeni || '', od: csDate(x.od), do: csDate(x.do) })),
      jazyky: (p.jazyky || []).map(x => ({ jazyk: x.jazyk || '', znalost: x.stupen_znalosti || '', osvedceni: x.stupen_osvedceni || '', pouzivani: x.pouzivani || '' })),
    },
    rodne_prijmeni: dash(p.rodne_prijmeni),
    misto_narozeni: misto,
    statni_prislusnost: p.statni_prislusnost || '',
    rodinny_stav: dash(p.rodinny_stav),
    rodne_cislo: p.rodne_cislo || '',
    adresa_trvala_plna: [adr, p.kraj ? 'kraj ' + p.kraj : '', p.trvale_stat].filter(Boolean).join(', '),
    dorucovaci_adresa: dash(p.dorucovaci_adresa),
    telefon: p.telefon_soukromy || '',
    email_soukromy: p.email_soukromy || '',
    nouzovy_kontakt: dash([p.nouzovy_kontakt_jmeno, p.nouzovy_kontakt_telefon ? 'tel. ' + p.nouzovy_kontakt_telefon : '', p.nouzovy_kontakt_adresa].filter(Boolean).join(', ')),
    manzel_jmeno: dash([p.jmeno_manzela, p.prijmeni_manzela].filter(Boolean).join(' ')),
    manzel_datum_narozeni: dash(csDate(p.datum_narozeni_manzela)),
    manzel_obcanstvi: dash(p.statni_obcanstvi_manzela),
    manzel_bydliste: dash(p.bydliste_manzela),
    stav_vzdelani: dash(p.stav_vzdelani),
    stupen_vzdelani: dash(p.stupen_vzdelani),
    skola_obor: [p.skola, p.obor, p.sidlo_skoly ? '(' + p.sidlo_skoly + ')' : ''].filter(Boolean).join(', ') || '—',
    rok_ukonceni: dash(p.rok_ukonceni),
    druh_zkousky: dash(p.druh_zkousky),
    duchod: yn(p.duchod, 'ANO', 'NE') + (String(p.duchod || '').toLowerCase() === 'ano' && p.duchod_detail ? ' — ' + p.duchod_detail : ''),
    zdravotni_znevyhodneni: (p.zdrav_postizeni_ozp && p.zdrav_postizeni_ozp !== 'Ne' ? p.zdrav_postizeni_ozp : 'Ne') + (p.prukaz_zdravotni && p.prukaz_zdravotni !== 'Nemám' ? ', ' + p.prukaz_zdravotni : ''),
    soudni_rizeni: yn(p.soudni_rizeni, 'ANO', 'NE') + (p.soudni_srazky ? ' — srážky: ' + p.soudni_srazky : ''),
    zdravotni_pojistovna: dash(p.zdravotni_pojistovna),
    sluzebni_pomer_drive: yn(p.sluzebni_pomer_drive, 'ANO', 'NE'),
    clenstvi_organy: yn(p.clenstvi_organy, 'ANO', 'NE'),
    vydelecna_cinnost: yn(p.vydelecna_cinnost_souhlas, 'ANO', 'NE'),
    kurzy_dovednosti: dash(p.kurzy_dovednosti),
    souhlas_plat: yn(p.souhlas_plat_ucet, 'ANO', 'NE'),
    souhlas_cestovni: yn(p.souhlas_cestovni_nahrady, 'ANO', 'NE'),
    souhlas_stravovani: yn(p.souhlas_stravovani, 'ANO', 'NE'),
    cislo_uctu_banka: (p.cislo_uctu || '……………………') + '/' + (p.kod_banky || '….'),
    jmeno_cele: jmenoCele,
    prijmeni_jmeno_titul: [[(p.prijmeni || '').trim(), (p.jmeno || '').trim()].filter(Boolean).join(' '), titulyPred, titulZa].filter(Boolean).join(', '),
    osobni_cislo: p.osobni_cislo || dots,
    pan_pani: sex === 'z' ? 'paní' : sex === 'm' ? 'pan' : 'pan/paní',
    narozen_a: sex === 'z' ? 'Narozena' : sex === 'm' ? 'Narozen' : 'Narozen/a',
    pozice: p.pozice || '',
    utvar: p.odbor_oddeleni || '',
    pracoviste: p.pracoviste || '',
    datum_nastupu: csDate(p.datum_nastupu),
    datum_narozeni: csDate(p.datum_narozeni),
    datum_misto_narozeni: [csDate(p.datum_narozeni), misto].filter(Boolean).join(', '),
    adresa_trvala: adr,
    adresa_jine_misto: (p.dorucovaci_adresa || '').trim() || adr,
    platova_trida: p.platova_trida || '',
    platovy_stupen: String(stupen),
    tarif: tarif || dots,
    celkem: tarif || dots,
    doba_trvani: p.doba_trvani_pomeru === 'Na dobu určitou' ? 'Určitou' : 'Neurčitou',
    zkusebni_doba: p.zkusebni_doba || '',
    tydenni_hodiny: hodiny,
    uvazek_hodiny: (() => { const v = parseFloat(String(hodiny).replace(',', '.')) || 40; const n = v / 40; return (Math.round(n * 10) / 10 === n ? n.toFixed(1) : n.toFixed(2)).replace('.', ',') + ' / ' + hodiny; })(),
    doba_trvani_mala: p.doba_trvani_pomeru === 'Na dobu určitou' ? 'určitou' : 'neurčitou',
    zkusebni_doba_text: (() => { const m = zkusdMonths(p); if(m === '') return '……'; const n = parseInt(m, 10); return n + (n === 1 ? ' měsíc' : (n >= 2 && n <= 4 ? ' měsíce' : ' měsíců')); })(),
    misto_vykonu: workplaceLocation(p.pracoviste).obec || p.pracoviste || '',
    pracoviste_adresa: [workplaceLocation(p.pracoviste).sidlo, workplaceLocation(p.pracoviste).obec].filter(Boolean).join(', ') || p.pracoviste || '',
  };
}
function docFileName(r, tpl, ext){
  const p = r.personal || {};
  const who = [slugName(p.prijmeni), slugName(p.jmeno)].filter(Boolean).join('_') || 'zaměstnanec';
  return asciiName(`${who}_${tpl.base}.${ext}`);
}
// názvy souborů ke stažení bez diakritiky (prohlížeče a ZIP nástroje si s háčky a čárkami ve jménech souborů nerozumí vždy)
function asciiName(n){ return String(n || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_'); }
function downloadBlob(blob, name){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = asciiName(name);
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function vemaCellHtml(r){
  if(r.personalPurgedAt) return `<span class="chip chip-done" title="Osobní údaje byly smazány">Údaje smazány</span>`;
  if(r.vemaUploadedAt) return `<span class="chip chip-done" title="Nahráno do Vemy: ${esc(new Date(r.vemaUploadedAt).toLocaleString('cs-CZ'))}"><i>✓</i> Nahráno</span>`;
  if(r.vemaExportedAt) return `<span class="chip chip-blue" title="Tabulky vygenerovány: ${esc(new Date(r.vemaExportedAt).toLocaleString('cs-CZ'))}. Po nahrání do Vemy a kontrole potvrďte tlačítkem Potvrdit nahrání do Vemy.">Vygenerováno</span>`;
  return `<span class="chip chip-progress-bg">Negenerováno</span>`;
}

function openConfirmUploadModal(ids){
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Potvrdit nahrání do Vemy (${ids.length})?</h3>
      <p style="font-size:13.5px;color:var(--ink-soft);">Potvrzujete, že tabulky pro vybrané spisy byly <strong>nahrány do Vemy a ve Vemě zkontrolovány</strong>. Spisy získají stav <strong>Nahráno</strong>.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="cu-cancel">Zrušit</button>
        <button class="btn btn-primary" id="cu-confirm">Ano, je nahráno</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  document.getElementById('cu-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) backdrop.remove(); });
  document.getElementById('cu-confirm').addEventListener('click', async () => {
    const btn = document.getElementById('cu-confirm');
    btn.disabled = true; btn.textContent = 'Ukládám…';
    let failed = 0;
    const nowIso = new Date().toISOString();
    for(const id of ids){
      try{
        const rec = await loadRecord(id);
        rec.vemaUploadedAt = nowIso;
        if(!(await saveRecord(id, rec))) throw new Error('save');
        const entry = state.index.find(e => e.id === id);
        if(entry) entry.vemaUploadedAt = nowIso;
      }catch(e){ console.error('confirm upload failed', id, e); failed++; }
    }
    try{ await saveIndex(); }catch(e){ failed++; }
    state.selectedExport = {};
    backdrop.remove();
    if(failed) state.error = `Potvrzení se nepodařilo uložit u ${failed} spisů. Zkuste to prosím znovu.`;
    else showToast(`Označeno jako nahráno do Vemy (${ids.length}).`);
    render();
  });
}

// ---------------- Správa vzorů dokumentů (Nastavení → Vzory dokumentů) ----------------
// Vlastní (nahrané) vzory se ukládají do databáze pod klíčem onboarding:template:<id> a mají přednost před vzorem dodaným s aplikací (složka templates/).
const TEMPLATE_KEY_PREFIX = 'onboarding:template:';
const TEMPLATE_TOKENS = [
  ['jmeno_cele','Titul před, jméno, příjmení, titul za (např. Ing. Jana Nováková, MBA)'],
  ['prijmeni_jmeno_titul','Příjmení, jméno, tituly (např. Nováková Jana, Ing.)'],
  ['osobni_cislo','Osobní číslo (není-li přiděleno, tečky)'],
  ['pan_pani','„pan“ / „paní“ podle pohlaví'],
  ['narozen_a','„Narozen“ / „Narozena“ podle pohlaví'],
  ['pozice','Pracovní pozice'],
  ['utvar','Odbor / oddělení (název)'],
  ['pracoviste','Pracoviště (název, např. MD)'],
  ['misto_vykonu','Město pracoviště (obec z Nastavení, jinak název pracoviště)'],
  ['pracoviste_adresa','Adresa pracoviště (sídlo a obec z Nastavení, jinak název pracoviště)'],
  ['datum_nastupu','Datum nástupu (DD.MM.RRRR)'],
  ['datum_narozeni','Datum narození'],
  ['datum_misto_narozeni','Datum a místo narození'],
  ['adresa_trvala','Adresa trvalého pobytu'],
  ['adresa_jine_misto','Doručovací adresa (jinak trvalá) – místo výkonu služby z jiného místa'],
  ['platova_trida','Platová třída'],
  ['platovy_stupen','Platový stupeň'],
  ['tarif','Tarifní plat v Kč podle třídy a stupně'],
  ['celkem','Celkový plat v Kč (zatím = tarifní plat)'],
  ['uvazek_hodiny','Úvazek a hodiny týdně (např. 1,0 / 40)'],
  ['tydenni_hodiny','Týdenní pracovní doba v hodinách'],
  ['doba_trvani','„Určitou“ / „Neurčitou“ (velké počáteční písmeno)'],
  ['doba_trvani_mala','„určitou“ / „neurčitou“ (malé písmeno)'],
  ['zkusebni_doba','Zkušební doba (text z formuláře)'],
  ['zkusebni_doba_text','Zkušební doba ve měsících se správným tvarem (např. 6 měsíců)'],
  ['cj','Číslo jednací pracovní smlouvy (zadává se v okně Dokumenty)'],['cj_a','Číslo jednací platového výměru (č.j./A)'],['cj_b','Číslo jednací dohody o výkonu služby z jiného místa (č.j./B)'],
  ['rodne_prijmeni','Rodné příjmení'],['misto_narozeni','Místo narození (včetně okresu)'],['statni_prislusnost','Státní občanství'],['rodinny_stav','Rodinný stav'],['rodne_cislo','Rodné číslo'],
  ['adresa_trvala_plna','Trvalý pobyt včetně kraje a státu'],['dorucovaci_adresa','Kontaktní adresa (jinak „—“)'],['telefon','Soukromý telefon'],['email_soukromy','Soukromý e-mail'],['nouzovy_kontakt','Kontaktní osoba pro mimořádnou událost'],
  ['manzel_jmeno','Manžel(ka), druh, družka – jméno'],['manzel_datum_narozeni','Manžel(ka) – datum narození'],['manzel_obcanstvi','Manžel(ka) – státní občanství'],['manzel_bydliste','Manžel(ka) – bydliště'],
  ['deti_jmeno','Děti – jméno a příjmení (opakuje se řádek tabulky pro každé dítě)'],['deti_datum','Děti – datum narození (řádek tabulky)'],['deti_rodne_cislo','Děti – rodné číslo (řádek tabulky)'],['deti_bydliste','Děti – bydliště (řádek tabulky)'],
  ['stav_vzdelani','Vzdělání – stav'],['stupen_vzdelani','Vzdělání – stupeň'],['skola_obor','Škola, obor, sídlo školy'],['rok_ukonceni','Rok ukončení'],['druh_zkousky','Druh zkoušky'],
  ['duchod','Přiznaný důchod (ANO / NE)'],['zdravotni_znevyhodneni','Zdravotní znevýhodnění'],['soudni_rizeni','Soudní řízení (ANO / NE, srážky)'],['zdravotni_pojistovna','Zdravotní pojišťovna'],
  ['praxe_organizace','Praxe – organizace (opakuje se řádek tabulky)'],['praxe_zarazeni','Praxe – pracovní zařazení (řádek tabulky)'],['praxe_od','Praxe – od (řádek tabulky)'],['praxe_do','Praxe – do (řádek tabulky)'],
  ['sluzebni_pomer_drive','Dříve ve služebním poměru (ANO / NE)'],['clenstvi_organy','Členství v řídících a kontrolních orgánech (ANO / NE)'],['vydelecna_cinnost','Výdělečná činnost vyžadující souhlas (ANO / NE)'],['kurzy_dovednosti','Kurzy, odborné znalosti a dovednosti'],
  ['jazyky_jazyk','Jazyky – jazyk (opakuje se řádek tabulky)'],['jazyky_znalost','Jazyky – stupeň znalosti (řádek tabulky)'],['jazyky_osvedceni','Jazyky – stupeň osvědčení (řádek tabulky)'],['jazyky_pouzivani','Jazyky – používání (řádek tabulky)'],
  ['souhlas_plat','Souhlas se zasíláním platu na účet (ANO / NE)'],['souhlas_cestovni','Souhlas – cestovní náhrady (ANO / NE)'],['souhlas_stravovani','Souhlas – stravování (ANO / NE)'],['cislo_uctu_banka','Číslo účtu / kód banky'],
];
let tplOverrides = null;   // id -> {fileName, uploadedAt, uploadedBy, data(base64)}
async function loadTemplateOverrides(force){
  if(tplOverrides && !force) return tplOverrides;
  const map = {};
  try{
    const rows = await window.storage.listAll(TEMPLATE_KEY_PREFIX);
    (rows || []).forEach(r => {
      try{ const v = typeof r.value === 'string' ? JSON.parse(r.value) : r.value; if(v && v.data) map[String(r.key).slice(TEMPLATE_KEY_PREFIX.length)] = v; }catch(e){}
    });
  }catch(e){ console.error('loadTemplateOverrides failed:', e); }
  tplOverrides = map;
  return map;
}
function bufToBase64(buf){
  const u = new Uint8Array(buf); let bin = '';
  for(let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(bin);
}
function base64ToBuf(b64){
  const bin = atob(b64), u = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u.buffer;
}
// Zdroj vzoru pro generování: vlastní (nahraný) obsah, jinak adresa vzoru dodaného s aplikací
async function templateSource(t){
  const ov = await loadTemplateOverrides();
  return ov[t.id] ? base64ToBuf(ov[t.id].data) : t.file;
}
async function templateBuffer(t){
  const src = await templateSource(t);
  if(typeof src !== 'string') return src;
  const r = await fetch(src + '?v=' + APP_VERSION, { cache: 'no-cache' });
  if(!r.ok) throw new Error('Vzor se nepodařilo načíst (' + r.status + ').');
  return r.arrayBuffer();
}
function templatesPanelHtml(){
  if(tplOverrides === null) return '<p style="font-size:13px;color:var(--ink-faint);">Načítám vzory…</p>';
  const fmt = (iso) => iso ? new Date(iso).toLocaleString('cs-CZ', {dateStyle:'short', timeStyle:'short'}) : '';
  return `
    <p style="font-size:12.5px;color:var(--ink-faint);margin:0 0 12px;">Dokumenty se generují z těchto vzorů (Word .docx). Vzor můžete stáhnout, upravit ve Wordu a nahrát zpět, nebo nahradit novou verzí. Nahraný vzor platí hned pro všechna další generování a <strong>ukládá se okamžitě</strong> (netřeba mačkat Uložit nastavení). Místa, která se mají vyplnit z údajů spisu, se ve vzoru zapisují jako <code>{{pole}}</code> – přehled polí je níže.</p>
    <div class="tpl-list">
      ${DOC_TEMPLATES.map(t => { const ov = tplOverrides[t.id]; return `
        <div class="tpl-row">
          <div class="tpl-main">
            <div class="tpl-title">${esc(t.title)}</div>
            <div class="tpl-meta">${esc(DOC_WHEN_LABEL[t.when])} · ${ov ? `<strong>vlastní vzor</strong>: ${esc(ov.fileName || 'vzor.docx')}, nahráno ${esc(fmt(ov.uploadedAt))}${ov.uploadedBy ? ' (' + esc(ov.uploadedBy) + ')' : ''}` : 'výchozí vzor dodaný s aplikací'}</div>
          </div>
          <div class="tpl-actions">
            <button class="btn btn-ghost btn-sm" type="button" data-tpl-download="${t.id}">⬇ Stáhnout</button>
            <button class="btn btn-ghost btn-sm" type="button" data-tpl-upload="${t.id}">Nahradit…</button>
            ${ov ? `<button class="btn btn-ghost btn-sm" type="button" data-tpl-restore="${t.id}" title="Smaže nahraný vzor a vrátí vzor dodaný s aplikací">Vrátit výchozí</button>` : ''}
            <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" data-tpl-file="${t.id}" style="display:none;">
          </div>
        </div>`; }).join('')}
    </div>
    <details class="tpl-tokens"><summary>Zástupná pole pro vzory</summary>
      <p style="font-size:12.5px;color:var(--ink-faint);margin:8px 0;">Do textu vzoru napište pole včetně dvojitých složených závorek, např. <code>{{jmeno_cele}}</code>. Formátování (písmo, tučné…) se převezme z místa, kde pole stojí. Pole, která nejsou v seznamu, se při generování vynechají (zůstanou prázdná). Údaje, které aplikace nezná (č. j., datum podpisu…), nechte ve vzoru jako tečky.</p>
      <table class="tpl-token-table"><tbody>${TEMPLATE_TOKENS.map(([k, d]) => `<tr><td><code>{{${k}}}</code></td><td>${esc(d)}</td></tr>`).join('')}</tbody></table>
    </details>`;
}
async function downloadTemplateFile(id){
  const t = DOC_TEMPLATES.find(x => x.id === id); if(!t) return;
  const buf = await templateBuffer(t);
  downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), `vzor_${t.base}.docx`);
}
async function uploadTemplateFile(id, file){
  const t = DOC_TEMPLATES.find(x => x.id === id); if(!t || !file) return;
  if(typeof DocGen === 'undefined'){ alert('Modul pro dokumenty se nenačetl. Obnovte prosím stránku.'); return; }
  DocGen.init({ version: APP_VERSION });
  if(file.size > 8 * 1024 * 1024){ alert('Soubor je příliš velký (nejvýše 8 MB).'); return; }
  const buf = await file.arrayBuffer();
  const info = await DocGen.inspectTemplate(buf);
  if(!info.ok){ alert(info.error); return; }
  const known = new Set(TEMPLATE_TOKENS.map(x => x[0]));
  const unknown = info.tokens.filter(k => !known.has(k));
  let msg = `Nahradit vzor „${t.title}“ souborem „${file.name}“?\n\n`;
  msg += info.tokens.length ? `Nalezená zástupná pole (${info.tokens.length}): ${info.tokens.map(k => '{{' + k + '}}').join(', ')}\n` : 'POZOR: ve vzoru nejsou žádná zástupná pole {{pole}} – dokument se vygeneruje beze změny.\n';
  if(unknown.length) msg += `\nPOZOR: neznámá pole (zůstanou prázdná): ${unknown.map(k => '{{' + k + '}}').join(', ')}\n`;
  if(info.broken) msg += '\nPOZOR: ve vzoru je neúplně zapsané pole (chybí závorky {{ nebo }}).\n';
  msg += '\nNový vzor začne platit hned pro všechna další generování.';
  if(!confirm(msg)) return;
  const rec = { fileName: file.name, uploadedAt: new Date().toISOString(), uploadedBy: state.userEmail || '', size: file.size, data: bufToBase64(buf) };
  try{
    await window.storage.set(TEMPLATE_KEY_PREFIX + id, JSON.stringify(rec), true);
    await loadTemplateOverrides();
    tplOverrides[id] = rec;
  }catch(e){ console.error('template upload failed:', e); alert('Vzor se nepodařilo uložit: ' + (e.message || e)); return; }
  render();
}
async function restoreTemplateFile(id){
  const t = DOC_TEMPLATES.find(x => x.id === id); if(!t) return;
  if(!confirm(`Smazat nahraný vzor „${t.title}“ a vrátit výchozí vzor dodaný s aplikací?`)) return;
  try{
    await window.storage.delete(TEMPLATE_KEY_PREFIX + id, true);
    await loadTemplateOverrides(); delete tplOverrides[id];
  }catch(e){ console.error('template restore failed:', e); alert('Vzor se nepodařilo vrátit: ' + (e.message || e)); return; }
  render();
}

async function openDocsModal(id){
  let rec;
  try{ rec = (state.currentRecord && state.currentId === id) ? state.currentRecord : await loadRecord(id); }
  catch(e){ state.error = 'Spis se nepodařilo načíst.'; render(); return; }
  if(rec.personalPurgedAt){ showToast('Osobní údaje byly smazány – dokumenty už nejde vygenerovat.', true); return; }
  const p = rec.personal || {};
  const regime = p.rezim_zamestnani;
  const preset = t => true;   // předvybráno je všechno, zbytečné se odškrtá
  const name = [p.jmeno, p.prijmeni].filter(Boolean).join(' ') || 'zaměstnanec';
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const results = {};          // id -> { docx, pdf, err }
  const urls = [];
  const rowHtml = (t, title, hint, extra) => `<label class="docs-row"><input type="checkbox" data-doc="${t.id}" ${preset(t) ? 'checked' : ''}><span class="docs-row-main"><span class="docs-row-title">${title}</span><span class="docs-row-hint">${hint}</span></span></label>${extra || ''}`;
  const rowsHtml = DOC_TEMPLATES.filter(t => !DOC_CJ_GROUP.includes(t.id) || t.id === DOC_CJ_GROUP[0]).map(t => t.id === DOC_CJ_GROUP[0]
    ? rowHtml(t, 'Pracovní smlouva + Platový výměr (č.j./A) + Dohoda o výkonu služby z jiného místa (č.j./B)', 'společné číslo jednací', `<div class="docs-cj"><label for="docs-cj">Číslo jednací (ze spisové služby)</label><input type="text" id="docs-cj" value="${esc(rec.cisloJednaci || '')}"><span class="docs-row-hint">Výměr dostane č.j./A, dohoda č.j./B. Nevyplněné zůstane k ručnímu doplnění.</span></div>`)
    : rowHtml(t, esc(t.title), esc(DOC_WHEN_LABEL[t.when]))).join('');
  backdrop.innerHTML = `
    <div class="modal docs-modal">
      <h3>Dokumenty – ${esc(name)}</h3>
      <div id="docs-pick">
        <p class="docs-intro">Dokumenty se vyplní z údajů ve spisu podle aktuálních vzorů. Předem je zaškrtnuté všechno, nepotřebné odškrtněte.</p>
        <label class="docs-row docs-all"><input type="checkbox" id="docs-all"><span class="docs-row-main"><span class="docs-row-title">Označit vše</span></span></label>
        <div class="docs-list">${rowsHtml}</div>
      </div>
      <div id="docs-out" style="display:none;"></div>
      <p id="docs-status" class="docs-status"></p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="docs-close">Zavřít</button>
        <button class="btn btn-ghost" id="docs-back" style="display:none;">← Změnit výběr</button>
        <button class="btn btn-primary" id="docs-run">Vygenerovat</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  const $ = sel => backdrop.querySelector(sel);
  const boxes = () => [...backdrop.querySelectorAll('[data-doc]')];
  const isChosen = t => boxes().some(b => b.checked && (b.getAttribute('data-doc') === t.id || (b.getAttribute('data-doc') === DOC_CJ_GROUP[0] && DOC_CJ_GROUP.includes(t.id))));
  const close = () => { urls.forEach(u => URL.revokeObjectURL(u)); backdrop.remove(); };
  const refreshPick = () => {
    const sel = DOC_TEMPLATES.filter(isChosen).length;
    $('#docs-all').checked = sel === DOC_TEMPLATES.length;
    $('#docs-run').disabled = sel === 0;
    $('#docs-run').textContent = sel ? `Vygenerovat (${sel})` : 'Vygenerovat';
  };
  $('#docs-close').addEventListener('click', close);
  backdrop.addEventListener('click', (ev) => { if(ev.target === backdrop) close(); });
  $('#docs-all').addEventListener('change', () => { boxes().forEach(b => { b.checked = $('#docs-all').checked; }); refreshPick(); });
  boxes().forEach(b => b.addEventListener('change', refreshPick));
  refreshPick();

  const showPick = () => { $('#docs-pick').style.display = ''; $('#docs-out').style.display = 'none'; $('#docs-back').style.display = 'none'; $('#docs-run').style.display = ''; $('#docs-status').textContent = ''; };
  $('#docs-back').addEventListener('click', showPick);

  function renderOut(){
    const rows = DOC_TEMPLATES.filter(t => results[t.id]).map(t => {
      const x = results[t.id];
      if(x.err) return `<div class="docs-out-row"><span class="docs-row-title">${esc(t.title)}</span><span class="docs-err">Nepodařilo se vytvořit: ${esc(x.err)}</span></div>`;
      return `<div class="docs-out-row"><span class="docs-row-title">${esc(t.title)}</span>
        <span class="docs-out-btns">
          <button class="btn btn-ghost btn-sm" type="button" data-dact="view" data-did="${t.id}">Zobrazit PDF</button>
          <button class="btn btn-ghost btn-sm" type="button" data-dact="pdf" data-did="${t.id}">⬇ PDF</button>
          <button class="btn btn-ghost btn-sm" type="button" data-dact="docx" data-did="${t.id}">⬇ Word</button>
        </span></div>`;
    }).join('');
    const okCount = Object.values(results).filter(x => !x.err).length;
    $('#docs-out').innerHTML = `
      <p class="docs-intro">Hotovo: ${okCount} ${okCount === 1 ? 'dokument' : okCount >= 2 && okCount <= 4 ? 'dokumenty' : 'dokumentů'}. Před podpisem je prosím zkontrolujte.</p>
      <div class="docs-zip-bar">
        <button class="btn btn-primary btn-sm" type="button" data-dzip="all" ${okCount ? '' : 'disabled'}>⬇ ZIP – Word i PDF</button>
        <button class="btn btn-ghost btn-sm" type="button" data-dzip="pdf" ${okCount ? '' : 'disabled'}>⬇ ZIP – jen PDF</button>
        <button class="btn btn-ghost btn-sm" type="button" data-dzip="docx" ${okCount ? '' : 'disabled'}>⬇ ZIP – jen Word</button>
      </div>
      <div class="docs-out-list">${rows}</div>`;
    $('#docs-out').querySelectorAll('[data-dact]').forEach(b => b.addEventListener('click', () => {
      const t = DOC_TEMPLATES.find(x => x.id === b.getAttribute('data-did')); const x = results[t.id];
      const act = b.getAttribute('data-dact');
      if(act === 'view'){ const u = URL.createObjectURL(x.pdf); urls.push(u); window.open(u, '_blank'); }
      else if(act === 'pdf') downloadBlob(x.pdf, docFileName(rec, t, 'pdf'));
      else downloadBlob(x.docx, docFileName(rec, t, 'docx'));
    }));
    $('#docs-out').querySelectorAll('[data-dzip]').forEach(b => b.addEventListener('click', async () => {
      const kind = b.getAttribute('data-dzip'); const files = [];
      DOC_TEMPLATES.forEach(t => { const x = results[t.id]; if(!x || x.err) return;
        if(kind !== 'docx') files.push({ name: docFileName(rec, t, 'pdf'), blob: x.pdf });
        if(kind !== 'pdf') files.push({ name: docFileName(rec, t, 'docx'), blob: x.docx }); });
      try{
        $('#docs-status').textContent = 'Balím ZIP…';
        const zip = await DocGen.zipFiles(files);
        const who = [slugName(p.prijmeni), slugName(p.jmeno)].filter(Boolean).join('_') || 'zaměstnanec';
        downloadBlob(zip, `${who}_dokumenty${kind === 'all' ? '' : kind === 'pdf' ? '_PDF' : '_Word'}.zip`);
        $('#docs-status').textContent = '';
      }catch(e){ console.error(e); $('#docs-status').textContent = 'ZIP se nepodařilo vytvořit.'; }
    }));
  }

  $('#docs-run').addEventListener('click', async () => {
    const chosen = DOC_TEMPLATES.filter(isChosen);
    if(!chosen.length) return;
    if(typeof DocGen === 'undefined'){ $('#docs-status').textContent = 'Modul pro dokumenty se nenačetl. Obnovte prosím stránku.'; return; }
    DocGen.init({ version: APP_VERSION });
    $('#docs-run').disabled = true; $('#docs-close').disabled = true;
    Object.keys(results).forEach(k => delete results[k]);
    const cjVal = ($('#docs-cj') ? $('#docs-cj').value : '').trim();
    if(cjVal !== String(rec.cisloJednaci || '')){
      rec.cisloJednaci = cjVal;
      try{ await saveRecord(id, rec); }catch(e){ console.error('cj save failed', e); }
    }
    const values = docValues(rec);
    let n = 0;
    for(const t of chosen){
      n++;
      $('#docs-status').textContent = `Generuji ${n} / ${chosen.length}: ${t.title}…`;
      try{
        const docx = await DocGen.fillTemplate(await templateSource(t), values);
        const pdf = await DocGen.docxToPdf(docx, t.title);
        results[t.id] = { docx, pdf };
      }catch(e){
        console.error('doc generation failed', t.id, e);
        results[t.id] = { err: (e && e.message) || 'neznámá chyba' };
      }
    }
    $('#docs-status').textContent = '';
    $('#docs-close').disabled = false; $('#docs-run').disabled = false;
    $('#docs-pick').style.display = 'none'; $('#docs-out').style.display = ''; $('#docs-back').style.display = ''; $('#docs-run').style.display = 'none';
    renderOut();
  });
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
    const newEntry = { id, ref, jmeno, prijmeni, pozice, pracoviste, datumNastupu: datum, created: Date.now(), personalStatus:'draft', itTotal: total, itDone: done, hrMissingCount: missingHrRequiredFields(record).length, linkGeneratedAt: null };
    assignPersonalNumber(record, newEntry);
    state.index.push(newEntry);
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
    if(p.rozsah_uvazku !== 'Zkrácený úvazek') p.zkraceny_uvazek_procenta = '100';
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
  burnPersonalNumbers(state.index);
  const ids = state.index.map(e => e.id);
  state.index = [];
  await saveIndex();
  for(const id of ids){
    try{ if(fileApi && fileApi.delRecord) await fileApi.delRecord(id); }catch(e){}
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
  document.getElementById('sc-confirm').addEventListener('click', async () => {
    const btn = document.getElementById('sc-confirm');
    btn.disabled = true; btn.textContent = 'Odesílám…';
    const prevStatus = state.currentRecord.personalStatus;
    state.currentRecord.personalStatus = 'submitted';
    let ok = false, reason = '';
    try{ ok = await saveRecord(state.currentId, state.currentRecord); }catch(e){ reason = e && e.message ? e.message : String(e); }
    if(!ok){
      state.currentRecord.personalStatus = prevStatus;
      btn.disabled = false; btn.textContent = 'Ano, odeslat';
      let err = backdrop.querySelector('#sc-error');
      if(!err){ err = document.createElement('p'); err.id = 'sc-error'; err.style.cssText = 'color:var(--red);font-size:13px;margin:10px 0 0;'; backdrop.querySelector('.modal-actions').before(err); }
      err.textContent = 'Odeslání se nezdařilo – údaje NEBYLY odeslány. ' + (reason || state.error || 'Zkuste to prosím znovu, případně kontaktujte personální oddělení.');
      return;
    }
    backdrop.remove();
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

// Doplní do už založeného spisu údaje z organigramu, které v něm chybí (vedoucí pozice, platová třída,
// stupeň řízení, režim zaměstnání). Nepřepisuje nic, co už je vyplněné. Seznam osob se stahuje jen jednou za relaci.
let orgRosterCache = null;
async function refreshFromOrganigram(rec){
  try{
    if(state.employeeMode || state.role !== 'hr' || !rec || !rec.orgPersonId || !organigramConfigured()) return false;
    if(!orgRosterCache){
      const { data, error } = await getOrgSb().from('organigram_roster').select('*');
      if(error) throw error;
      orgRosterCache = new Map((data || []).map(p => [String(p.person_id), p]));
    }
    const o = orgRosterCache.get(String(rec.orgPersonId));
    if(!o) return false;
    const p = rec.personal; let changed = false;
    const fill = (k, v) => { if(!p[k] && v){ p[k] = String(v); changed = true; } };
    fill('platova_trida', o.pay_grade != null ? o.pay_grade : '');
    fill('vedouci', o.position_kind ? (o.position_kind === 'head' ? 'Ano' : 'Ne') : '');
    if(o.position_kind === 'head') fill('stupen_rizeni', o.management_level != null ? o.management_level + '. stupeň' : '');
    fill('rezim_zamestnani', o.employment_type || '');
    if(changed) syncZkusebniDoba(p);
    return changed;
  }catch(e){ console.warn('doplnění z organigramu selhalo', e); return false; }
}

// Ruční / automatické načtení aktuálního stavu z databáze (např. po odeslání dotazníku zaměstnancem).
let refreshing = false;
function showToast(text, isErr){
  const t = document.createElement('div');
  t.className = 'toast-msg' + (isErr ? ' err' : '');
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), isErr ? 5000 : 1800);
}
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('Časový limit odpovědi databáze vypršel.')), ms))]);
async function refreshFromServer(manual){
  if(state.employeeMode || state.loading || !window.storage) return;
  if(refreshing){ if(manual) showToast('Aktualizace už probíhá…'); return; }
  if(!manual && (document.hidden || document.querySelector('.modal-backdrop'))) return;
  const ae = document.activeElement;
  if(!manual && ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;   // nepřerušovat psaní
  refreshing = true;
  if(manual) document.querySelectorAll('[data-refresh]').forEach(b => b.classList.add('spin'));
  try{
    let changed = false;
    const res = await withTimeout(window.storage.get(STORAGE_INDEX_KEY, true), 15000);
    if(res && res.value !== indexBase){ state.index = JSON.parse(res.value); indexBase = res.value; changed = true; }
    if(state.view === 'detail' && state.currentId && state.currentRecord){
      const rr = await withTimeout(window.storage.get(recordKey(state.currentId), true), 15000);
      const base = recordBase[state.currentId];
      if(rr && base){
        const latest = normalizeRecord(JSON.parse(rr.value));
        const latestStr = JSON.stringify(latest);
        if(latestStr !== base && JSON.stringify(state.currentRecord) === base){
          state.currentRecord = latest; recordBase[state.currentId] = latestStr; changed = true;
        }
      }
    }
    if(changed || manual){ state.error = null; render(); }
    if(manual) showToast(changed ? 'Aktualizováno – načteny novější údaje.' : 'Aktualizováno – žádné změny.');
  }catch(e){
    console.warn('refresh failed', e);
    if(manual) showToast('Aktualizace se nezdařila: ' + (e && e.message ? e.message : e), true);
  }finally{
    refreshing = false;
    document.querySelectorAll('[data-refresh]').forEach(b => b.classList.remove('spin'));
  }
}
document.addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('[data-refresh]'); if(b) refreshFromServer(true); });
document.addEventListener('visibilitychange', () => { if(!document.hidden) refreshFromServer(false); });
window.addEventListener('focus', () => refreshFromServer(false));
setInterval(() => refreshFromServer(false), 45000);

// ---------------- Nastavení: uložení a hlídání neuložených změn ----------------
function syncSettingsDraftFromDom(){
  if(document.activeElement && document.activeElement.blur) document.activeElement.blur(); // vyvolá „change“ u rozepsaného pole
  const inp = document.querySelector('[data-persnum-start]');
  if(inp && state.settingsDraft){ const n = parseInt(String(inp.value).replace(/\D/g,''),10); state.settingsDraft.personalNumberStart = n > 0 ? String(n) : ''; }
}
function settingsDirty(){
  if(state.view !== 'settings' || !state.settingsDraft || !state.settings) return false;
  syncSettingsDraftFromDom();
  const strip = (o) => { const c = JSON.parse(JSON.stringify(o)); delete c.burnedNumbers; if(!c.personalNumberStart) delete c.personalNumberStart; return JSON.stringify(c); };
  return strip(state.settingsDraft) !== strip(state.settings);
}
async function saveSettingsDraft(){
  syncSettingsDraftFromDom();
  const listFields = [
    ['workplaces','Pracoviště'], ['positions','Pracovní pozice'], ['admins','Administrátoři systémů'],
    ['supervisors','Nadřízení'], ['departments','Odbory / oddělení'], ['facilityStaff','Pracovníci provozu'],
  ];
  const shrinking = listFields.filter(([k]) => (state.settings[k]||[]).length >= 3 && (state.settingsDraft[k]||[]).length === 0);
  if(shrinking.length > 0){
    const names = shrinking.map(([,label]) => label).join(', ');
    if(!confirm(`Pozor: chystáte se uložit prázdný seznam u „${names}" — dřív tam přitom položky byly. Opravdu chcete pokračovat a smazat je?`)) return false;
  }
  state.settingsDraft.burnedNumbers = state.settings.burnedNumbers || [];
  state.settings = JSON.parse(JSON.stringify(state.settingsDraft));
  await saveSettings();
  state.settingsDraft = null;
  state.view = 'list';
  render();
  return true;
}
// Pokud jsou v Nastavení neuložené změny, zeptá se: uložit / zahodit / zůstat. Pak provede „proceed“.
function guardSettingsLeave(proceed){
  if(!settingsDirty()){ proceed(); return; }
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Neuložené změny v Nastavení</h3>
      <p style="font-size:13.5px;color:var(--ink-soft);">V Nastavení jsou změny, které ještě nejsou uložené. Chcete je před odchodem uložit?</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="sl-stay">Zůstat v Nastavení</button>
        <button class="btn btn-danger" id="sl-discard">Zahodit změny</button>
        <button class="btn btn-primary" id="sl-save">Uložit a pokračovat</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  document.getElementById('sl-stay').addEventListener('click', () => backdrop.remove());
  document.getElementById('sl-discard').addEventListener('click', () => { backdrop.remove(); state.settingsDraft = null; proceed(); });
  document.getElementById('sl-save').addEventListener('click', async () => {
    backdrop.remove();
    const wasView = state.view;
    const ok = await saveSettingsDraft();
    if(ok){ state.view = wasView === 'settings' ? 'list' : state.view; proceed(); }
  });
}

// ---------------- Osobní čísla (automatické přidělování) ----------------
function personalNumberStart(){
  const n = parseInt(state.settings && state.settings.personalNumberStart, 10);
  return n > 0 ? n : 0;
}
// nejnižší volné číslo od zadaného začátku; obsazená jsou čísla ve spisech, „spálená“ (už byla ve Vemě) a čísla přidělená v rámci rozpracované dávky
function nextPersonalNumber(taken){
  const start = personalNumberStart();
  if(!start) return '';
  const used = new Set((state.settings.burnedNumbers || []).map(String));
  state.index.forEach(e => { if(e.osobniCislo) used.add(String(e.osobniCislo)); });
  if(taken) taken.forEach(n => used.add(String(n)));
  let n = start;
  while(used.has(String(n))) n++;
  return String(n);
}
function assignPersonalNumber(record, entry, taken){
  const n = nextPersonalNumber(taken);
  if(!n) return '';
  record.personal.osobni_cislo = n;
  entry.osobniCislo = n;
  if(taken) taken.add(n);
  return n;
}
// při smazání spisu: číslo, které už šlo do Vemy, se znovu nepoužije
function burnPersonalNumbers(entries){
  const add = entries.filter(e => e.osobniCislo && e.vemaExportedAt).map(e => String(e.osobniCislo));
  if(!add.length) return;
  const set = new Set((state.settings.burnedNumbers || []).map(String));
  add.forEach(n => set.add(n));
  state.settings.burnedNumbers = [...set];
  saveSettings();
}

async function deleteEmployee(id){
  burnPersonalNumbers(state.index.filter(e => e.id === id));
  state.index = state.index.filter(e => e.id !== id);
  await saveIndex();
  try{ if(fileApi && fileApi.delRecord) await fileApi.delRecord(id); }catch(e){}
  try{ await window.storage.delete(recordKey(id), true); }catch(e){}
  render();
}

async function openDetail(id){
  state.currentId = id;
  state.currentRecord = await loadRecord(id);
  { const en = state.index.find(e => e.id === id);   // rejstřík se mohl rozejít se spisem (souběžný zápis) – srovnat
    if(en && !state.employeeMode && en.personalStatus !== state.currentRecord.personalStatus){ en.personalStatus = state.currentRecord.personalStatus; saveIndex(); } }
  let _chg = await refreshFromOrganigram(state.currentRecord);
  if(ensureSuggestedEmail(state.currentRecord) || _chg) persistRecordOnly();
  state.view = 'detail';
  state.tab = availableTabs()[0];
  state.collapsed = {};
  state.wizardStep = 0; state.wizardStepError = false; state.showMissingHighlights = false; state.visitedSteps = {};
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
  fileApi = {   // personální oddělení (přihlášení): čtení a mazání příloh
    async get(id){ const { data, error } = await sb.from('onboarding_files').select('data,mime,name').eq('id', id).maybeSingle(); if(error) throw error; return data; },
    async del(recId, id){ const { error } = await sb.from('onboarding_files').delete().eq('id', id).eq('rec_id', recId); if(error) throw error; },
    async delRecord(recId){ const { error } = await sb.from('onboarding_files').delete().eq('rec_id', recId); if(error) throw error; },
  };
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
    async listAll(prefix){
      const { data, error } = await sb.from('kv_store').select('key,value').like('key', prefix + '%');
      if(error) throw error;
      return data || [];
    },
    async replaceAll(prefix, rows){
      const { error: delErr } = await sb.from('kv_store').delete().like('key', prefix + '%');
      if(delErr) throw delErr;
      if(rows.length){
        const payload = rows.map(r => ({ key: r.key, value: r.value, updated_at: new Date().toISOString() }));
        const { error: insErr } = await sb.from('kv_store').insert(payload);
        if(insErr) throw insErr;
      }
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
  if(isEmployeeLink){
    // Zaměstnanec nemá přihlášení: přes funkci emp_open dostane jen SVŮJ spis (+ nastavení a informační obsah).
    // Zbytek aplikace pak běží beze změny nad touto „fasádou“ úložiště.
    const [empId, empToken] = hash.slice(3).split('/');
    let opened = null;
    try{
      const { data, error } = await sb.rpc('emp_open', { p_id: empId || '', p_token: empToken || '' });
      if(error) throw error;
      opened = data;
    }catch(e){ console.error('emp_open failed:', e); }
    const failScreen = (title, text) => {
      state.loading = false;
      document.getElementById('app').innerHTML = `<div style="max-width:480px;margin:80px auto;text-align:center;font-family:var(--font-body);">
        <h2 style="font-family:var(--font-display);">${title}</h2>
        <p style="color:var(--ink-faint);font-size:13px;">${text}</p>
      </div>`;
    };
    if(!opened) return failScreen('Odkaz nebyl nalezen', 'Zkontrolujte prosím, že jste odkaz zkopíroval/a celý. Pokud problém trvá, kontaktujte personální oddělení.');
    state.infoOnly = !!opened.infoOnly;   // dotazník uzavřen (vypršela platnost / údaje smazány): jen „Co potřebujete vědět“
    fileApi = {   // zaměstnanec: nahrávání a mazání vlastních příloh přes funkce chráněné tokenem
      async put(recId, fid, kind, name, mime, b64){
        const { data, error } = await sb.rpc('emp_file_put', { p_id: empId, p_token: empToken, p_fid: fid, p_kind: kind, p_name: name, p_mime: mime, p_data: b64 });
        if(error) throw error;
        if(!data) throw new Error('Nahrání bylo zamítnuto (odkaz vypršel, spis je uzamčen nebo je příloh příliš mnoho).');
      },
      async del(recId, fid){
        const { data, error } = await sb.rpc('emp_file_del', { p_id: empId, p_token: empToken, p_fid: fid });
        if(error) throw error;
        if(!data) throw new Error('denied');
      },
    };
    const cache = {};
    cache[recordKey(empId)] = JSON.stringify(opened.record);
    if(opened.settings) cache[STORAGE_SETTINGS_KEY] = opened.settings;
    if(opened.info) cache[STORAGE_INFO_KEY] = opened.info;
    window.storage = {
      async get(key){
        if(key in cache) return { key, value: cache[key], shared: true };
        throw new Error('not found: ' + key);
      },
      async set(key, value){
        if(key !== recordKey(empId) || state.infoOnly) return { key, value, shared: true };   // zaměstnanec smí uložit jen svůj spis a jen u otevřeného dotazníku
        const rec = JSON.parse(value);
        const patch = { personal: rec.personal, personalStatus: rec.personalStatus, consentGiven: !!rec.consentGiven, consentAt: rec.consentAt || null, firstDayDismissed: !!rec.firstDayDismissed, fieldFlags: rec.fieldFlags || {}, returnNote: rec.returnNote || '' };
        const { data, error } = await sb.rpc('emp_save', { p_id: empId, p_token: empToken, p_patch: patch });
        if(error) throw error;
        if(!data) throw new Error('Uložení bylo zamítnuto (odkaz vypršel nebo je spis již uzamčen).');
        cache[key] = value;
        return { key, value, shared: true };
      },
      async delete(){ throw new Error('not allowed'); },
      async listAll(){ throw new Error('not allowed'); },
      async replaceAll(){ throw new Error('not allowed'); },
    };
  }
  await loadSettings();
  await loadIndex();
  await loadInfoContent();
  if(!isEmployeeLink) loadTemplateOverrides().then(() => { if(state.view === 'settings' && !state.settingsDraft) render(); });
  state.loading = false;
  if(isEmployeeLink){
    const id = hash.slice(3).split('/')[0];
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


/* Nápověda pro zaměstnance (dotazník). Jednoduchým jazykem, pro člověka, který to dělá poprvé a naposledy.
   KAŽDOU ZMĚNU DOTAZNÍKU (kroky, pole, tlačítka, stavy) PROMÍTNOUT I SEM. */
const HELP_EMP = [
 {g:'Na úvod',items:[
  ['👋','K čemu dotazník slouží','Údaje, které zde vyplníte, potřebuje personální oddělení k vaší smlouvě, mzdám a přihlášení k pojištění. Slouží k zavedení do personálního a mzdového systému; po jejich zavedení budou vaše citlivé osobní údaje z aplikace <b>vymazány</b>. Nic jiného se s nimi nedělá.'],
  ['💾','Nemusíte to stihnout najednou','Vyplněné se ukládá samo. Dotazník můžete kdykoli zavřít a později se k němu vrátit <b>stejným odkazem</b> – nic se neztratí. Odkaz nikomu nepřeposílejte, je osobní. Dotazník se přes něj dá vyplňovat zhruba měsíc; potom (nebo po zpracování údajů) se uzavře a odkaz vám dál ukáže jen záložku <b>Co potřebujete vědět</b>. Potřebujete-li údaje ještě opravit, požádejte personální oddělení o nový odkaz.'],
  ['⭐','Co je povinné','Povinné údaje jsou označeny <b style="color:#C62828">červenou hvězdičkou *</b>. Bez nich dotazník nepůjde odeslat. Ostatní údaje jsou doplňkové – vyplňte je, pokud se vás týkají.'],
  ['➡️','Jak se pohybovat','Dotazník je rozdělen do kroků. Tlačítky <b>Pokračovat</b> a <b>Zpět</b> se posouváte mezi kroky, nahoře můžete kliknutím přeskočit na libovolný krok – <b>chybějící povinné údaje vás nezastaví</b>, můžete vyplňovat i napřeskáčku. Krok, který jste už otevřeli a v němž ještě něco povinného chybí, se nahoře zobrazí <b style="color:#C62828">červeně s tečkou ●</b>; po doplnění zčerná.']]},
 {g:'Jednotlivé kroky',items:[
  ['🪪','Základní údaje','Jméno, příjmení, tituly, rodné číslo <b>bez lomítka</b> (např. 9001011234), místo narození a státní příslušnost. Datum narození se z rodného čísla doplní samo a aplikace ho zkontroluje.'],
  ['🏠','Bydliště a kontakt','Trvalé bydliště, soukromý telefon a e-mail. Doručovací adresu vyplňte jen tehdy, pokud je jiná než trvalá. Kontakt pro mimořádnou událost je doplňkový (koho zavolat, kdyby se vám něco stalo).'],
  ['🏦','Pojišťovna a účet','Zdravotní pojišťovnu vyberte ze seznamu. <b>Nahrajte kartičku pojišťovny</b> (povinné): tlačítkem <b>📷 Vyfotit kamerou</b> ji vyfotíte kamerou počítače (prohlížeč se zeptá na povolení kamery): přiložte kartičku stranou s údaji do rámečku a držte ji klidně – aplikace ji sama rozpozná, vyfotí a ořízne (kdyby to nešlo, použijte <b>Vyfotit hned</b>). Nebo <b>📎 Nahrát soubor</b> / přetažením vložíte hotovou fotografii či sken (JPG, PNG, PDF). Fotografie se před odesláním zmenší. Nahraný soubor můžete tlačítkem <b>Smazat</b> nahradit jiným. Číslo účtu zadejte bez lomítka a kódu banky, kód banky vyplňte zvlášť (např. 0100). Po zadání čísla účtu se zobrazí tři souhlasy se zasíláním platu, cestovních náhrad a příspěvku na stravování na tento účet.'],
  ['👪','Rodina a děti','Rodinný stav je povinný. Krok <b>Děti</b> je doplňkový – pokud děti nemáte, jen pokračujte dál. Další dítě přidáte tlačítkem <b>+ Přidat dítě</b>. Omylem přidané dítě zrušíte tlačítkem <b>✕ Zrušit / odebrat</b>.'],
  ['🎓','Vzdělání','Údaje o vašem dosaženém vzdělání – vyplňte podle pokynů u polí.'],
  ['💼','Praxe a ZOZ','Krok je <b>nepovinný</b> – pokud praxi nemáte (např. absolvent), přeskočte ho. Uvádějte <b>přesná data</b> (den.měsíc.rok): předchozí zaměstnání, ale i <b>vojenskou službu, mateřskou a rodičovskou dovolenou, evidenci na úřadu práce</b> a další započitatelné doby – u každého období vyberte jeho <b>druh</b>. Nesprávné údaje mohou vést k zařazení do nižšího platového stupně. Další období přidáte tlačítkem <b>+ Přidat období</b> (datum „Od“ se předvyplní dnem po konci předchozího období, můžete ho přepsat – období by na sebe měla navazovat); omylem přidanou položku zrušíte tlačítkem <b>✕ Zrušit / odebrat</b> (úplně prázdné položky se při pohybu v dotazníku odstraní samy). Dole můžete nahrát sken <b>osvědčení o zkoušce odborné způsobilosti (ZOZ)</b> (tlačítko <b>+ Přidat ZOZ</b>, lze více osvědčení) – může se uznat jako část praxe.'],
  ['🌍','Jazyky','Jazykové znalosti jsou doplňkové; další jazyk přidáte tlačítkem <b>+ Přidat jazyk</b>.'],
  ['🗂️','Další údaje','V kroku <b>Další údaje</b> jsou dodatečné údaje, které úřad ze zákona potřebuje; vyplňte je podle pokynů u polí.']]},
 {g:'Odeslání a kontrola',items:[
  ['✅','Souhrn a odeslání','Poslední krok je <b>Souhrn</b>. Pokud chybí povinné údaje, aplikace vypíše, ve kterých krocích. Až je vše hotové, klikněte na <b>Odeslat personálnímu oddělení</b> a potvrďte.'],
  ['🔒','Po odeslání','Formulář se zamkne a personální oddělení údaje zkontroluje. Zjistíte-li chybu, můžete ho sami odemknout tlačítkem <b>Stáhnout zpět a opravit</b> (pokud ho už neschválilo).'],
  ['↩️','Když vás požádají o doplnění','Personální oddělení vám dotazník může vrátit. Nahoře uvidíte jeho vzkaz a v krocích budou <b>zvýrazněná pole</b> s poznámkou, co opravit. Opravené údaje odešlete znovu. Když pole opravíte, označení zmizí samo; jinak ho tlačítkem <b>✓ Vyřešeno</b> u pole nebo <b>✓ Mám doplněno</b> v souhrnu skryjete.']]},
 {g:'Další záložka a pomoc',items:[
  ['ℹ️','Co potřebujete vědět','Druhá záložka obsahuje praktické informace k nástupu: kontakty, pracoviště a další informace pro nové zaměstnance.'],
  ['📞','Něco se nedaří?','Pokud si nevíte rady, obraťte se na personální oddělení – kontakty najdete v záložce <b>Co potřebujete vědět</b>.']]}
];

/* ====== NÁPOVĚDA (pohled personálního oddělení) ======
   Vysouvá se zleva (odkaz „? Nápověda“ v záhlaví nebo klávesa ?). Obsah je ručně udržovaný v poli HELP.
   KAŽDOU NOVOU FUNKCI NEBO ZMĚNU CHOVÁNÍ DOPLNIT SEM (a zvýšit APP_VERSION + ?v= v index.html). */
const HELP = [
 {g:'Jak to celé funguje',items:[
  ['🧭','Postup od nástupu po VEMU','1) Založíte spis (ručně, z organigramu nebo z Excelu). 2) Doplníte údaje personálního oddělení. 3) Vygenerujete odkaz a pošlete ho zaměstnanci. 4) Zaměstnanec vyplní a odešle. 5) Údaje zkontrolujete a <b>schválíte</b> (nebo vrátíte k doplnění). 6) Vygenerujete tabulky pro VEMU, nahrajete je do Vemy a po kontrole <b>potvrdíte nahrání</b> (stav Nahráno). 7) Dokumenty podle vzorů (včetně podkladů k podpisu A, B, C) vygenerujete ve spisu po schválení údajů (Word, PDF). IT a provoz si mezitím plní své záložky.'],
  ['🔐','Přihlášení a pohled','Přihlášení je e-mailem. Přepínač <b>Zobrazit jako</b> přepíná mezi pohledem <b>Personální oddělení</b> a <b>IT a provoz</b>. Nastavení (⚙) je jen v pohledu personálního oddělení.'],
  ['❓','Nápověda','Otevře se odkazem <b>? Nápověda</b> v záhlaví nebo klávesou <kbd>?</kbd>, zavře <kbd>Esc</kbd>. Políčko nahoře filtruje témata.']]},
 {g:'Rejstřík (seznam spisů)',items:[
  ['➕','Nový nástup','Ručně založí spis. Pozice a pracoviště se nabízejí z Nastavení; u ručně zadané pozice zůstává vedoucí pozice a platová třída nevyplněná.'],
  ['🏛️','Stáhnout nové z organigramu','Načte obsazené osoby publikované z aplikace Organigram. Už dříve převzaté osoby se nenabízejí znovu. Přenáší se jméno, pozice, odbor, vedoucí pozice, platová třída a stupeň řízení. Pokud hlásí, že nejsou žádné osoby, zkuste v Organigramu <b>Publikovat seznam osob</b>.'],
  ['📄','Vytěžit podklady','Hromadný import z Excelu/JSON. Sloupce se namapují na údaje (zkontrolujte odhad) a lze nastavit <b>společné hodnoty</b> pro celou dávku – pracoviště, důvod vzniku pracovního poměru, typ poměru apod. Hodnota ze sloupce má vždy přednost.'],
  ['🔎','Hledání, filtry a řazení','Vyhledávání funguje na jméno, pozici, pracoviště, zdrojový úřad, administrátora i referenci. Filtry jsou pod záhlavím sloupců, řadit lze kliknutím na název sloupce.'],
  ['↻','Aktualizovat','Rejstřík i spis se po návratu do okna a každých ~45 s sami načtou znovu; tlačítko <b>↻</b> (Aktualizovat) načte aktuální stav hned (např. po odeslání dotazníku zaměstnancem). Ukládání personálního oddělení se slučuje se změnami zaměstnance, takže otevřený spis už jeho údaje nepřepíše.'],
  ['🏷️','Stavy spisu','<b>K doplnění personálním oddělením</b> (chybí povinné údaje) → <b>Připraveno – vygenerujte odkaz</b> → <b>Čeká na zaměstnance</b> → <b>Odesláno zaměstnancem</b> → <b>Zkontrolováno</b>; případně <b>Vráceno k doplnění</b>.'],
  ['✎','Rychlé doplnění','Tužka v řádku otevře okno pro rychlé doplnění základních údajů bez otevírání celého spisu.'],
  ['🗑️','Smazání spisu','Tlačítko Smazat v řádku (po potvrzení) odstraní jeden spis. Hromadné smazání všech spisů je v Nastavení.']]},
 {g:'Spis – údaje personálního oddělení',items:[
  ['📝','Osobní údaje','Formulář je rozdělen do sekcí. Povinné údaje jsou označeny <b style="color:#C62828">*</b>; chybějící jsou po pokusu o schválení zvýrazněny červeně a nad formulářem je výpis sekcí, kde ještě něco chybí.'],
  ['👔','Pracovní poměr','Typ poměru je předvyplněn jako <b>HPP</b> (lze změnit). <b>Zkušební doba:</b> u služebního poměru 6 nebo 8 měsíců – správná hodnota se předvyplní podle toho, zda je pozice vedoucí; u pracovního poměru se počet měsíců vybírá po jednom. Vedoucí pozice a platová třída se berou z Organigramu. <b>Tarifní plat</b> se dopočítá sám z tabulky tarifů (pracovní / služební poměr) podle platové třídy a platového stupně 1. <b>Platový stupeň</b> je předvyplněn na 1 (lze změnit, tarif se přepočte). Při otevření spisu se z Organigramu doplní chybějící vedoucí pozice a platová třída. Další položky pro Vemu (klasifikace, platová skupina, skupina prací, způsob odměňování aj.) se doplňují automaticky a najdete je v sbalené sekci <b>Automaticky doplňované hodnoty pro Vemu</b> na konci formuláře (jen ke kontrole).'],
  ['📎','Přílohy od zaměstnance','Zaměstnanec v dotazníku nahrává <b>kartičku zdravotní pojišťovny</b> (povinné, krok Pojišťovna a účet) a případná <b>osvědčení o ZOZ</b> (nepovinné, krok Praxe a ZOZ). Ve spisu je vidíte v těchto krocích; tlačítkem <b>Zobrazit</b> je otevřete a tlačítkem <b>⬇ Stáhnout</b> uložíte. Název souboru se vytvoří automaticky ve tvaru <b>Příjmení_Jméno_kartička_ZP.jpg</b> (u ZOZ <b>…_osvědčení_ZOZ.pdf</b>, při více souborech s pořadovým číslem). Fotky se ukládají zmenšené (cca 200–400 kB). Soubory jsou uložené odděleně v databázi, přístupné jen přihlášeným zaměstnancům a <b>mažou se spolu s osobními údaji</b> (ručně tlačítkem Smazat osobní údaje i automaticky po 60 dnech). Do tabulek pro Vemu nejdou a do zálohy (json) se neukládají.'],
  ['🪪','Rodné číslo','Aplikace kontroluje rodné číslo a z něj dopočítá datum narození; nesrovnalosti zobrazí jako upozornění u pole.'],
  ['✉️','Stávající e-mail','Navrhuje se podle pravidel z Nastavení (zdrojový úřad, jméno, příjmení). Je potřeba pro odeslání odkazu e-mailem.']]},
 {g:'Odkaz pro zaměstnance',items:[
  ['🔗','Vygenerovat a zkopírovat odkaz','Tlačítko je aktivní, až když jsou doplněny povinné údaje personálního oddělení. Odkaz je <b>osobní a tajný</b> (obsahuje dlouhý náhodný kód) a dotazník lze přes něj vyplňovat <b>30 dní</b> (vrácením k doplnění nebo novým zkopírováním odkazu se platnost obnoví). Po vypršení nebo po smazání osobních údajů odkaz dál otevře jen záložku <b>Co potřebujete vědět</b> — osobní údaje se ze serveru vůbec nepošlou. Odkazy rozeslané před zavedením tajného kódu už nefungují. Odkaz otevírá osobní prostor zaměstnance (první záložka <b>Vaše údaje</b>, druhá <b>Co potřebujete vědět</b>).'],
  ['📧','Poslat odkaz e-mailem','Otevře e-mail s odkazem. Text si upravíte v Nastavení → <b>Text e-mailu s odkazem pro zaměstnance</b>. Vyžaduje stávající e-mail zaměstnance.'],
  ['ℹ️','Co potřebujete vědět','Informační záložka pro zaměstnance (kontakty, informace k pracovištím, obecné karty). Obsah se upravuje v Nastavení → Obsah pro zaměstnance.']]},
 {g:'Kontrola a schválení',items:[
  ['⚑','Vlajky u polí','Nejasné nebo chybějící položky označte vlajkou ⚑ u pole či sekce. Zaměstnanec je uvidí zvýrazněné i s vaší poznámkou. Zaměstnanec může označení po opravě sám odebrat (nebo zmizí, když pole upraví); nové označení může přidat jen personální oddělení.'],
  ['↩️','Vrátit k doplnění','Vrátí spis zaměstnanci s volitelným vzkazem. <b>Aplikace sama žádné upozornění neposílá</b>, proto zaměstnance informujte: tlačítkem <b>Vrátit a poslat e-mailem</b> (otevře e-mail s vaším vzkazem, seznamem označených polí a odkazem na dotazník; adresa je stávající e-mail, jinak soukromý), později <b>Poslat zaměstnanci e-mailem</b> ve spisu (text e-mailu upravíte v Nastavení → <b>Text e-mailu při vrácení k doplnění</b>), nebo <b>Zkopírovat zprávu pro zaměstnance</b> a poslat ji vlastním kanálem.'],
  ['✅','Schválit údaje','Dostupné ve stavu Odesláno / Vráceno, pokud jsou vyplněna všechna povinná pole. Po schválení má spis stav Zkontrolováno.'],
  ['🙋','Co dělá zaměstnanec','Vyplní průvodce, potvrdí souhlas se zpracováním osobních údajů a odešle. Po odeslání je formulář zamčen; zaměstnanec ho může sám stáhnout zpět a opravit, pokud ho ještě nezkontrolujete.']]},
 {g:'Výstupy',items:[
  ['📊','Generovat tabulky pro VEMU','V rejstříku zaškrtněte zkontrolované spisy (výběr lze udělat hromadně v záhlaví) a použijte <b>Generovat tabulky pro VEMU</b>. Stav „Vygenerováno“ se u spisu zapamatuje; po nahrání do Vemy a kontrole tlačítkem <b>Potvrdit nahrání do Vemy</b> (vedle Generovat) přejde na „Nahráno“. Když tabulky vygenerujete znovu, stav se vrátí na „Vygenerováno“. Výsledkem je <b>ZIP s datem a časem generování v názvu</b> (např. VEMA_export_20261020-1015.zip); každá tabulka je v něm samostatný soubor .xlsx (ZHLAV, Adresy, Bankovni_ucty, Deti, Vzdelani, Predchozi_zamestnani, Znalosti_jazyky a číselníky Ciselnik_pracovist a Ciselnik_utvaru). Datumy jsou ve tvaru DDMMRR, zkušební doba (zkusd) a platová skupina (plasku) jsou číslo (bez zkušební doby = 0) a útvar (utvar) je číselný kód z číselníku útvarů Vemy. Ve spisu (pole Odbor / oddělení) se v nabídce zobrazuje i kód útvaru a do pole lze přímo napsat kód (např. 821) nebo část názvu. Kódy útvarů se předvyplňují podle názvu a jdou upravit v Nastavení → Odbory / oddělení (tlačítko <b>Doplnit podle systemizace</b> přidá chybějící útvary). Pevné hodnoty a kódy pracovišť se nastavují v Nastavení.'],
  ['🔢','Osobní čísla','Osobní číslo se novému spisu <b>přidělí automaticky</b> při založení i při importu – vždy nejnižší volné číslo od začátku zadaného v <b>Nastavení → Osobní čísla</b> (tak se vynechá interval čísel zaměstnanců DESÚ, kteří je už mají). V rejstříku je pod jménem místo kódu spisu a ve spisu je pole <b>Osobní číslo</b> jen ke čtení. Smažete-li spis dřív, než se pro něj vygenerují tabulky pro Vemu, číslo se uvolní a přidělí se dalšímu; po vygenerování tabulek se znovu nepoužije. Při odchodu z Nastavení s neuloženými změnami (Zpět, přepnutí pohledu, Odhlásit) se aplikace zeptá, zda změny uložit, zahodit, nebo zůstat. Spisům založeným dřív se číslo samo nepřidělí (smažte je a založte znovu); pokud není začátek v Nastavení vyplněný, čísla se nepřidělují.'],
  ['🗂️','Vzory dokumentů (Nastavení)','V <b>Nastavení → Vzory dokumentů</b> je seznam všech vzorů, ze kterých se dokumenty generují. U každého jde <b>Stáhnout</b> aktuální vzor, <b>Nahradit…</b> ho novou verzí (soubor Word .docx) a <b>Vrátit výchozí</b> (smaže nahraný vzor a vrátí vzor dodaný s aplikací). Nahraný vzor platí hned pro další generování; ukládá se okamžitě, není potřeba Uložit nastavení. Před nahráním aplikace zkontroluje soubor a vypíše nalezená zástupná pole <code>{{pole}}</code> a upozorní na neznámá. Přehled polí je v rozbalovací části „Zástupná pole pro vzory“. Už vygenerované dokumenty se nemění.'],
  ['📄','Dokumenty podle vzorů','Po <b>schválení údajů</b> je ve spisu tlačítko <b>Dokumenty podle vzorů</b> (samostatné „podklady k podpisu“ už neexistují – jsou součástí téhož výběru). Nahoře je společná trojice <b>Pracovní smlouva + Platový výměr + Dohoda o výkonu služby z jiného místa</b> s jedním zaškrtávátkem a polem <b>Číslo jednací</b> (vygenerované ve spisové službě): smlouva dostane toto č.j., platový výměr č.j./A a dohoda č.j./B. Č.j. se u spisu zapamatuje; nevyplněné zůstane k ručnímu doplnění. Otevře se seznam všech vzorů se zaškrtávátky; <b>předem je zaškrtnuté všechno</b> (nepotřebné odškrtněte). U vzorů je poznámka, pro jaký poměr jsou (všichni / služební poměr / dle potřeby – platový výměr a pracovní smlouva platí pro oba poměry), včetně podkladů k podpisu A, B, C. Tlačítkem <b>Vygenerovat</b> se každý dokument vyplní z údajů ve spisu a vytvoří se Word i PDF. U každého je <b>Zobrazit PDF</b>, <b>⬇ PDF</b> a <b>⬇ Word</b>; všechno najednou stáhnete jako <b>ZIP</b>. Názvy souborů jsou ve tvaru <b>Příjmení_Jméno_název.docx / .pdf</b>. Údaje, které ve spisu nejsou (č. j., datum podpisu, osobní číslo, které se nevyplnilo), zůstanou k ručnímu doplnění. PDF se vytváří přímo v prohlížeči, takže se může od Wordu lehce lišit zalomením stránek – Word je přesný. Vzory jsou ve složce <code>templates</code> a po změně vzoru se nahradí příslušný soubor. Dokumenty se generují z osobních údajů, proto je vytvořte před smazáním údajů.'],
  ['🧹','Smazání osobních údajů','Po nahrání do Vemy a ověření, že je vše správně, vyberte v rejstříku spisy a klikněte na <b>Smazat osobní údaje</b>. Tlačítko je aktivní jen u spisů ve stavu <b>Nahráno</b>. Smažte až po vygenerování dokumentů (z údajů se pak už znovu vytvořit nedají). Nevratně se smažou osobní údaje zaměstnance (zůstane jméno, pozice, pracoviště, datum nástupu a stavy) a jeho odkaz dál otevře jen záložku „Co potřebujete vědět“. Pokud smazání zapomenete, proběhne automaticky 60 dní po vygenerování tabulek.']]},
 {g:'IT a provoz (stručně)',items:[
  ['💻','Přiřazení administrátora','V pohledu IT a provoz lze spisy hromadně přiřadit administrátorovi systémů. Záložky <b>IT a přístupy</b> a <b>Provoz</b> obsahují checklisty podle kategorie zaměstnance.']]},
 {g:'Nastavení (⚙)',items:[
  ['⚙️','Přehled sekcí','Pracoviště, pozice, administrátoři systémů, nadřízení, pravidla pro stávající e-mail, <b>text e-mailu s odkazem</b>, <b>text e-mailu při vrácení k doplnění</b>, odbory/oddělení, pracovníci provozu, kód pracoviště pro Vemu, pevné hodnoty pro Vemu, kanceláře podle budovy, adresy systémů, kategorie a přiřazené systémy, <b>povinné položky personálního oddělení</b>. Sekce lze sbalit; změny se uloží tlačítkem Uložit.'],
  ['💾','Záloha a obnova','Stažení zálohy všech dat do souboru a její obnovení najdete v Nastavení. Zálohu doporučuji stáhnout před hromadným mazáním.'],
  ['🛡️','Ochrana osobních údajů','Data vidí jen přihlášení zaměstnanci ze seznamu oprávněných (databázová tabulka <code>staff</code>). Zaměstnanec se přes svůj odkaz dostane jen ke svému spisu. Po uplynutí lhůty od <b>Generovat tabulky pro VEMU</b> (60 dní; ručně to lze udělat dřív tlačítkem <b>Smazat osobní údaje</b> v rejstříku) se osobní údaje ze spisu automaticky smažou — proto si tabulky a podklady uložte včas na řádné místo.'],
  ['🧹','Smazat všechny spisy','Nevratná operace v Nastavení; před ní stáhněte zálohu.']]}
];
(function(){
  const q = s => document.querySelector(s);
  const hd = document.createElement('div'); hd.id = 'help'; document.body.appendChild(hd);
  function openHelp(){ hd.classList.toggle('open'); document.body.classList.toggle('help-open', hd.classList.contains('open')); if(hd.classList.contains('open')){ renderHelp(''); setTimeout(()=>{ const i=q('#hq'); if(i) i.focus(); },0); } }
  function renderHelp(qs){
    qs = (qs||'').trim().toLowerCase();
    const strip = t => t.replace(/<[^>]+>/g,' ').toLowerCase();
    let h = `<div class="hh"><b>${state.employeeMode ? 'Nápověda k dotazníku' : 'Nápověda – personální oddělení'}</b><span class="hint">verze ${APP_VERSION}</span><span class="sp"></span><button data-hx title="Zavřít">✕</button></div><div class="hs"><input id="hq" placeholder="Hledat… (název funkce, slovo)" value="${esc(qs)}" autocomplete="off"></div><div class="hb">`;
    const SET = state.employeeMode ? HELP_EMP : HELP;
    for(const g of SET){
      const items = g.items.filter(([i,t,d]) => !qs || (t+' '+strip(d)).toLowerCase().includes(qs));
      if(!items.length) continue;
      h += `<details ${qs?'open':''}><summary>${esc(g.g)} <span class="hint">${items.length}</span></summary>${items.map(([i,t,d])=>`<div class="hi"><span class="ic">${i}</span><div><b>${esc(t)}</b><p>${d}</p></div></div>`).join('')}</details>`;
    }
    h += `</div>`;
    hd.innerHTML = h;
    const inp = q('#hq');
    inp.addEventListener('input', () => { const v=inp.value, pos=inp.selectionStart; renderHelp(v); const i2=q('#hq'); i2.focus(); i2.setSelectionRange(pos,pos); });
  }
  hd.addEventListener('click', e => { if(e.target.closest('[data-hx]')){ hd.classList.remove('open'); document.body.classList.remove('help-open'); } });
  document.addEventListener('click', e => { if(e.target.closest('#btn-help, #btn-help-fab')){ e.preventDefault(); openHelp(); } });
  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if(e.key === '?' && !typing && !q('.modal-backdrop')){ e.preventDefault(); openHelp(); }
    if(e.key === 'Escape' && hd.classList.contains('open') && !q('.modal-backdrop')){ hd.classList.remove('open'); document.body.classList.remove('help-open'); }
  });
})();

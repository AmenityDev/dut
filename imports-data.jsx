// SOBER, Imported Vehicle Tax module
// Officer-side: declare imported vehicle, calculate tax, bill the importer.
// Importer can be a company (RCCM) or an individual (CNI).

// ─────────────────────────────────────────────────────────────
// Vehicle catalog: for VIN lookup. Faux database of common imports.
// ─────────────────────────────────────────────────────────────
const VEHICLE_CATALOG = [
  { vin: 'JTEBR3FJ80K123456', make: 'Toyota',    model: 'Hilux',         category: 'pickup',     year: 2023, displacement: 2755, powerKw: 150, fuel: 'diesel',   weight: 2050, fuelEcon: 8.6 },
  { vin: 'WDB9634031L456789', make: 'Mercedes',  model: 'Actros 1842',   category: 'truck',      year: 2021, displacement: 12800, powerKw: 310, fuel: 'diesel',  weight: 7600, fuelEcon: 32 },
  { vin: 'KMHCT41DAEU654321', make: 'Hyundai',   model: 'i10',           category: 'sedan',      year: 2022, displacement: 1248, powerKw: 64,  fuel: 'petrol',   weight: 940,  fuelEcon: 5.4 },
  { vin: 'WBA8E9C50JK111222', make: 'BMW',       model: '320i',          category: 'sedan',      year: 2020, displacement: 1998, powerKw: 135, fuel: 'petrol',   weight: 1505, fuelEcon: 6.2 },
  { vin: '1FTFW1ET5DKF98765', make: 'Ford',      model: 'F-150 Raptor',  category: 'pickup',     year: 2018, displacement: 3496, powerKw: 335, fuel: 'petrol',   weight: 2540, fuelEcon: 13.5 },
  { vin: 'ZFA31200000333444', make: 'Fiat',      model: 'Doblo Cargo',   category: 'van',        year: 2017, displacement: 1598, powerKw: 70,  fuel: 'diesel',   weight: 1395, fuelEcon: 5.8 },
  { vin: 'JN1AZ4EH4DM555666', make: 'Nissan',    model: 'Patrol',        category: 'suv',        year: 2024, displacement: 5552, powerKw: 298, fuel: 'petrol',   weight: 2715, fuelEcon: 14.2 },
  { vin: '5YJ3E1EA7KF777888', make: 'Tesla',     model: 'Model 3',       category: 'sedan',      year: 2022, displacement: 0,    powerKw: 211, fuel: 'electric', weight: 1611, fuelEcon: 0 },
  { vin: 'MAJ3J1KFAFK999000', make: 'Renault',   model: 'Duster',        category: 'suv',        year: 2019, displacement: 1598, powerKw: 84,  fuel: 'petrol',   weight: 1410, fuelEcon: 7.3 },
  { vin: 'LAEAJM3K7HB000111', make: 'Bajaj',     model: 'Boxer 100',     category: 'motorcycle', year: 2024, displacement: 100,  powerKw: 6,   fuel: 'petrol',   weight: 110,  fuelEcon: 2.1 },
];

// Categories: French label + base duty rate (% of CIF)
const VEHICLE_CATEGORIES = [
  { id: 'sedan',      fr: 'Berline / break',          en: 'Sedan / wagon',     duty: 0.25, code: '8703' },
  { id: 'suv',        fr: 'SUV / 4×4',                en: 'SUV / 4×4',         duty: 0.30, code: '8703' },
  { id: 'pickup',     fr: 'Pickup',                   en: 'Pickup',            duty: 0.20, code: '8704' },
  { id: 'van',        fr: 'Camionnette / fourgon',    en: 'Van',               duty: 0.18, code: '8704' },
  { id: 'truck',      fr: 'Camion / poids lourd',     en: 'Truck',             duty: 0.15, code: '8704' },
  { id: 'bus',        fr: 'Autobus / autocar',        en: 'Bus / coach',       duty: 0.15, code: '8702' },
  { id: 'motorcycle', fr: 'Moto / cyclomoteur',       en: 'Motorcycle',        duty: 0.10, code: '8711' },
];

const FUEL_TYPES = [
  { id: 'petrol',   fr: 'Essence',  en: 'Petrol' },
  { id: 'diesel',   fr: 'Diesel',   en: 'Diesel' },
  { id: 'hybrid',   fr: 'Hybride',  en: 'Hybrid' },
  { id: 'electric', fr: 'Électrique', en: 'Electric' },
  { id: 'lpg',      fr: 'GPL',      en: 'LPG' },
];

const USE_TYPES = [
  { id: 'private',    fr: 'Usage privé',           en: 'Private use' },
  { id: 'commercial', fr: 'Usage commercial',      en: 'Commercial' },
  { id: 'taxi',       fr: 'Taxi / VTC',            en: 'Taxi / ride-hail' },
  { id: 'transport',  fr: 'Transport public',      en: 'Public transport' },
];

// Country of origin: top sources for vehicle imports into Guinea
const ORIGINS = [
  'Allemagne', 'Belgique', 'Chine', 'Corée du Sud', 'Émirats arabes unis',
  'États-Unis', 'France', 'Inde', 'Italie', 'Japon', 'Maroc', 'Pays-Bas',
  'Royaume-Uni', 'Sénégal', 'Turquie',
];

// ─────────────────────────────────────────────────────────────
// Tax formula
// Decree 2024-217 (fictional, plausible). Returns full breakdown.
// ─────────────────────────────────────────────────────────────
const computeImportTax = ({ category, cif, year, powerKw, fuel, use }) => {
  const cat = VEHICLE_CATEGORIES.find(c => c.id === category) || VEHICLE_CATEGORIES[0];
  const cifVal = Math.max(0, Number(cif) || 0);
  const kw = Math.max(0, Number(powerKw) || 0);
  const ageY = 2026 - (Number(year) || 2026);

  // Age coefficient: multiplies the base duty
  let ageMult = 1.0;
  if (ageY >= 4 && ageY <= 6)      ageMult = 1.12;
  else if (ageY >= 7 && ageY <= 10) ageMult = 1.25;
  else if (ageY > 10)               ageMult = 1.40;

  // Electric / hybrid get a partial relief (climate incentive)
  let fuelMult = 1.0;
  if (fuel === 'electric') fuelMult = 0.50;
  else if (fuel === 'hybrid') fuelMult = 0.85;

  // Commercial / public-transport vehicles get a discount (productive investment)
  let useMult = 1.0;
  if (use === 'commercial' || use === 'transport') useMult = 0.80;
  else if (use === 'taxi') useMult = 0.90;

  const customsDuty = Math.round(cifVal * cat.duty * ageMult * fuelMult * useMult);

  // Power surcharge: 8 000 GNF / kW above 100 kW (over 100 kW = "luxury")
  const powerSurcharge = kw > 100 ? Math.round((kw - 100) * 8000) : 0;

  // Statistical fee: 0.5% of CIF
  const statFee = Math.round(cifVal * 0.005);

  // Subtotal before VAT
  const subtotal = customsDuty + powerSurcharge + statFee;

  // VAT (TVA): 18% on (CIF + customs duty + power surcharge), per Guinean law
  const vatBase = cifVal + customsDuty + powerSurcharge;
  const vat = Math.round(vatBase * 0.18);

  // Customs stamp: flat
  const stamp = 35000;

  const total = subtotal + vat + stamp;

  return {
    cif: cifVal, ageY, ageMult, fuelMult, useMult,
    dutyRate: cat.duty,
    customsDuty, powerSurcharge, statFee, vat, vatBase, stamp,
    subtotal, total,
    nomenclature: cat.code,
  };
};

// ─────────────────────────────────────────────────────────────
// Existing import bills (officer queue + importer Pay screens)
// ─────────────────────────────────────────────────────────────
const IMPORT_BILLS = [
  {
    id: 'IMV-2026-04-00921', date: '02/05/2026', officer: 'F. Camara',
    importerKind: 'company',   importerId: 'TRP-04812', importerName: 'Diallo & Frères',
    vehicle: { make: 'Mercedes', model: 'Actros 1842', vin: 'WDB9634031L456789', category: 'truck', year: 2021, fuel: 'diesel', powerKw: 310, displacement: 12800, weight: 7600, origin: 'Allemagne', use: 'commercial' },
    cif: 685000000, total: 165247400, status: 'pending', due: '12/05/2026',
  },
  {
    id: 'IMV-2026-04-00918', date: '01/05/2026', officer: 'F. Camara',
    importerKind: 'individual', importerId: 'CNI-7053219K', importerName: 'Sékou Soumah',
    vehicle: { make: 'Toyota',  model: 'Hilux', vin: 'JTEBR3FJ80K123456', category: 'pickup', year: 2023, fuel: 'diesel', powerKw: 150, displacement: 2755, weight: 2050, origin: 'Japon', use: 'private' },
    cif: 215000000, total: 73614200, status: 'pending', due: '11/05/2026',
  },
  {
    id: 'IMV-2026-04-00903', date: '24/04/2026', officer: 'I. Sylla',
    importerKind: 'company',   importerId: 'TRP-08231', importerName: 'SAGECO Logistique',
    vehicle: { make: 'Renault', model: 'Duster', vin: 'MAJ3J1KFAFK999000', category: 'suv', year: 2019, fuel: 'petrol', powerKw: 84, displacement: 1598, weight: 1410, origin: 'France', use: 'commercial' },
    cif: 78000000,  total: 25324000, status: 'paid',    due: '04/05/2026',
  },
  {
    id: 'IMV-2026-04-00891', date: '20/04/2026', officer: 'F. Camara',
    importerKind: 'individual', importerId: 'CNI-1284477', importerName: 'Aïssatou Diallo',
    vehicle: { make: 'Hyundai', model: 'i10',    vin: 'KMHCT41DAEU654321', category: 'sedan', year: 2022, fuel: 'petrol', powerKw: 64, displacement: 1248, weight: 940, origin: 'Corée du Sud', use: 'private' },
    cif: 92000000,  total: 28447600, status: 'paid',    due: '30/04/2026',
  },
  {
    id: 'IMV-2026-04-00874', date: '14/04/2026', officer: 'F. Camara',
    importerKind: 'company',   importerId: 'TRP-04812', importerName: 'Diallo & Frères',
    vehicle: { make: 'Tesla',   model: 'Model 3', vin: '5YJ3E1EA7KF777888', category: 'sedan', year: 2022, fuel: 'electric', powerKw: 211, displacement: 0, weight: 1611, origin: 'États-Unis', use: 'private' },
    cif: 425000000, total: 102876000, status: 'paid',   due: '24/04/2026',
  },
];

// Importers registry (officer-side autocomplete): extends TRANSPORTERS w/ a few extra individuals
const IMPORTERS = [
  { kind: 'company',    id: 'TRP-04812', name: 'Diallo & Frères',         doc: 'RCCM/CKY/B/2009/00482' },
  { kind: 'company',    id: 'TRP-08231', name: 'SAGECO Logistique',       doc: 'RCCM/CKY/B/2014/01173' },
  { kind: 'company',    id: 'TRP-09987', name: 'Mining Express SA',       doc: 'RCCM/BKE/B/2017/00302' },
  { kind: 'individual', id: 'CNI-7053219K', name: 'Sékou Soumah',         doc: 'CNI 7053219K, Coyah' },
  { kind: 'individual', id: 'CNI-1284477',  name: 'Aïssatou Diallo',      doc: 'CNI 1284477, Conakry' },
  { kind: 'individual', id: 'CNI-9928101',  name: 'Mamadou Camara',       doc: 'CNI 9928101, Kindia' },
];

Object.assign(window, {
  VEHICLE_CATALOG, VEHICLE_CATEGORIES, FUEL_TYPES, USE_TYPES, ORIGINS,
  computeImportTax, IMPORT_BILLS, IMPORTERS,
});

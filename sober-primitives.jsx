// Shared sober-variant primitives: form atoms, cards, buttons, KPI tiles, status pills,
// PDF blocks, signatures, fake QR. Used by both the Officer (DNTT) app and the
// Transporter (customer) app.

// ─────────────────────────────────────────────────────────────
// Forms
// ─────────────────────────────────────────────────────────────
const Field = ({ label, hint, children }) => (
  <label style={{ display: 'block', marginBottom: 14 }}>
    <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6B6557', marginBottom: 5 }}>{label}</div>
    {children}
    {hint && <div style={{ fontSize: 10.5, color: '#9A9281', marginTop: 4 }}>{hint}</div>}
  </label>
);

const FieldRow = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${React.Children.count(children)}, 1fr)`, gap: 14 }}>{children}</div>
);

const Input = (p) => (
  <input {...p} onChange={(e) => p.onChange?.(e.target.value)} style={{
    width: '100%', padding: '9px 11px', border: '1px solid #DCD3BD', background: '#fff',
    borderRadius: 2, fontFamily: 'inherit', fontSize: 13, color: '#161413', outline: 'none',
    boxSizing: 'border-box', ...p.style,
  }} />
);

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} style={{
    width: '100%', padding: '9px 11px', border: '1px solid #DCD3BD', background: '#fff',
    borderRadius: 2, fontFamily: 'inherit', fontSize: 13, color: '#161413', outline: 'none',
  }}>
    {options.map((o) => {
      const v = typeof o === 'string' ? o : o.value;
      const l = typeof o === 'string' ? o : o.label;
      return <option key={v} value={v}>{l}</option>;
    })}
  </select>
);

// ─────────────────────────────────────────────────────────────
// Tiles, pills, summaries
// ─────────────────────────────────────────────────────────────
const SummaryRow = ({ label, value, mono, strong }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12.5 }}>
    <span style={{ color: '#6B6557' }}>{label}</span>
    <span style={{ fontFamily: mono ? '"JetBrains Mono", monospace' : 'inherit', fontWeight: strong ? 600 : 400, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
  </div>
);

const KpiTile = ({ label, big, suffix, hint, delta, tone }) => (
  <div style={{ background: '#FBF8F2', border: '1px solid #E5DDC9', padding: 16 }}>
    <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9A9281' }}>{label}</div>
    <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 30, fontWeight: 600, marginTop: 6, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
      {big} {suffix && <span style={{ fontSize: 14, color: '#6B6557', fontWeight: 500 }}>{suffix}</span>}
    </div>
    <div style={{ marginTop: 8, fontSize: 11.5, color: tone === 'warn' ? '#8A1B1B' : tone === 'good' ? '#1F4F2C' : '#6B6557', display: 'flex', gap: 6, alignItems: 'center' }}>
      {delta && <span style={{ background: tone === 'warn' ? '#CE1126' : '#009460', color: '#fff', padding: '0 5px', fontSize: 10.5, fontWeight: 600 }}>{delta}</span>}
      {hint}
    </div>
  </div>
);

const StatusPill = ({ status, lang = 'fr' }) => {
  const labels = {
    paid:     t('statusPaid', lang),
    pending:  t('statusPending', lang) || 'En attente',
    overdue:  lang === 'en' ? 'Overdue' : 'En retard',
    expired:  t('statusExpired', lang),
    issued:   lang === 'en' ? 'Issued' : 'Émis',
    draft:    lang === 'en' ? 'Draft' : 'Brouillon',
  };
  const m = {
    paid:    { bg: '#E8F2EA', fg: '#1F4F2C', dot: '#009460' },
    pending: { bg: '#FFF6D6', fg: '#73591F', dot: '#C8A24A' },
    overdue: { bg: '#FCEAEA', fg: '#8A1B1B', dot: '#CE1126' },
    expired: { bg: '#F0E9D6', fg: '#6B6557', dot: '#9A9281' },
    issued:  { bg: '#EDE6F4', fg: '#3A2E5C', dot: '#5C4E8A' },
    draft:   { bg: '#F0EFEC', fg: '#6B6557', dot: '#9A9281' },
  }[status] || { bg: '#F0EFEC', fg: '#6B6557', dot: '#9A9281' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: m.bg, color: m.fg, padding: '3px 9px', fontSize: 10.5, fontWeight: 600, letterSpacing: '.04em' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot }} />
      {labels[status] || status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// Review blocks (used in form summary + bill preview)
// ─────────────────────────────────────────────────────────────
const ReviewBlock = ({ title, children }) => (
  <div style={{ marginBottom: 14, padding: 14, background: '#FBF8F2', border: '1px solid #E5DDC9' }}>
    <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 18px' }}>{children}</div>
  </div>
);

const ReviewLine = ({ k, v, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #DCD3BD', padding: '4px 0', fontSize: 12.5 }}>
    <span style={{ color: '#6B6557' }}>{k}</span>
    <span style={{ fontFamily: mono ? '"JetBrains Mono", monospace' : 'inherit', fontWeight: 500 }}>{v}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// PDF/document blocks
// ─────────────────────────────────────────────────────────────
const PdfSection = ({ title, children }) => (
  <div style={{ marginTop: 14 }}>
    <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', borderBottom: '1px solid #161413', paddingBottom: 4, marginBottom: 8, fontWeight: 700 }}>{title}</div>
    {children}
  </div>
);

const PdfRow = ({ k, v }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12.5 }}>
    <span style={{ color: '#6B6557' }}>{k}</span>
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</span>
  </div>
);

const SignatureBlock = ({ title, name, sig = 'M.S. Diallo' }) => (
  <div>
    <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6B6557' }}>{title}</div>
    <div style={{ height: 50, borderBottom: '1px solid #6B6557', marginTop: 6, position: 'relative' }}>
      <span style={{ position: 'absolute', left: 0, top: 14, fontFamily: '"Caveat", "Brush Script MT", cursive', fontSize: 22, color: '#1A2B6A' }}>
        {sig}
      </span>
    </div>
    <div style={{ fontSize: 10.5, color: '#6B6557', marginTop: 4 }}>{name}</div>
  </div>
);

const FauxQr = ({ size = 80, seed = 19 }) => {
  const cells = React.useMemo(() => {
    const rng = (i) => ((i * 9301 + 49297 + seed) % 233280) / 233280;
    return Array.from({ length: 144 }, (_, i) => rng(i) > 0.5);
  }, [seed]);
  return (
    <div style={{ width: size, height: size, padding: 4, border: '1px solid #161413', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 0, background: '#fff' }}>
      {cells.map((on, i) => {
        const r = Math.floor(i / 12), c = i % 12;
        const isFinder = (r < 3 && c < 3) || (r < 3 && c > 8) || (r > 8 && c < 3);
        return <div key={i} style={{ width: '100%', aspectRatio: '1/1', background: isFinder ? '#161413' : on ? '#161413' : 'transparent' }} />;
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Card/button styles (functions returning style objects)
// ─────────────────────────────────────────────────────────────
const paperCard = (pad) => ({
  background: '#fff', border: '1px solid #E5DDC9', padding: pad ? 22 : 18, borderRadius: 0,
});
const cardHeader = () => ({
  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #E5DDC9',
});
const cardTitle = () => ({
  fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 17, fontWeight: 500, margin: 0, letterSpacing: '-0.005em',
});
const td = () => ({ padding: '10px 8px', borderBottom: '1px solid #F0E9D6' });
const primaryBtn = () => ({
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#161413', color: '#FCD116',
  border: '1px solid #161413', borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
  letterSpacing: '.02em',
});
const ghostBtn = () => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'transparent', color: '#161413',
  border: '1px solid #DCD3BD', borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
});
const dangerBtn = () => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#CE1126', color: '#fff',
  border: '1px solid #CE1126', borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
});

// ─────────────────────────────────────────────────────────────
// Officer-app data: transporters in the system, draft queue, recent
// issuances. Lives here so both apps can reference the same records.
// ─────────────────────────────────────────────────────────────
const TRANSPORTERS = [
  { id: 'T-04812', name: 'TRANSPORTS DIALLO & FRÈRES', short: 'Diallo & Frères', rccm: 'RCCM/CKY/2019/B/04812', nif: '7053219K', city: 'Conakry', fleet: 14, contact: 'Mamadou Saliou Diallo', phone: '+224 622 14 88 03', email: 'contact@diallo-transports.gn' },
  { id: 'T-03914', name: 'SOTRAGUI SARL', short: 'Sotragui', rccm: 'RCCM/CKY/2017/B/03914', nif: '6841220K', city: 'Kamsar', fleet: 32, contact: 'Aïssatou Bah', phone: '+224 628 41 02 17', email: 'admin@sotragui.gn' },
  { id: 'T-05021', name: 'BOLLORÉ TRANSPORT GUINÉE', short: 'Bolloré GN', rccm: 'RCCM/CKY/2020/B/05021', nif: '7212884K', city: 'Conakry', fleet: 87, contact: 'Yaya Konaté', phone: '+224 664 11 88 02', email: 'logistics@bollore.gn' },
  { id: 'T-02744', name: 'COOPERATIVE DES CONDUCTEURS DU FOUTA', short: 'Coop. Fouta', rccm: 'RCCM/LBE/2014/B/02744', nif: '5104871K', city: 'Labé', fleet: 9, contact: 'Thierno Bailo Diallo', phone: '+224 660 22 14 71', email: 'coop.fouta@guinet.gn' },
  { id: 'T-04199', name: 'SAREMTA EXPRESS', short: 'Saremta', rccm: 'RCCM/KAN/2018/B/04199', nif: '6533710K', city: 'Kankan', fleet: 18, contact: 'Sékou Kourouma', phone: '+224 622 90 14 03', email: 'saremta@guinet.gn' },
];

// Bills issued (shown in officer's "All bills" list and transporter's bills list).
// status: paid | pending (issued, not yet paid) | overdue (past due date) | draft (officer hasn't sent)
const BILLS = [
  { id: 'DUT-2026-04-08821', date: '28/04/2026', due: '03/05/2026', transporterId: 'T-04812', from: 'Kamsar',  to: 'Conakry',   goodsCode: 'BAUX', goodsLabel: 'Bauxite',     qty: 32,    unit: 'tonnes',     vehicle: 'RC-4821-AC', driver: 'Ousmane Bah',     amount: 425000, status: 'paid',    paidOn: '28/04/2026', payMethod: 'orange', ref: 'KKP-2026-A4F71B' },
  { id: 'DUT-2026-04-08823', date: '29/04/2026', due: '04/05/2026', transporterId: 'T-04812', from: 'Conakry', to: 'Kankan',    goodsCode: 'CIM',  goodsLabel: 'Ciment',      qty: 1240,  unit: 'sacs 50kg',  vehicle: 'RC-3107-AB', driver: 'Sékou Camara',    amount: 612000, status: 'pending'  },
  { id: 'DUT-2026-04-08832', date: '30/04/2026', due: '05/05/2026', transporterId: 'T-04812', from: 'Conakry', to: 'Labé',      goodsCode: 'RIZ',  goodsLabel: 'Riz importé', qty: 980,   unit: 'sacs 50kg',  vehicle: 'RC-7715-AD', driver: 'Amadou Barry',    amount: 388000, status: 'pending'  },
  { id: 'DUT-2026-04-08698', date: '21/04/2026', due: '26/04/2026', transporterId: 'T-04812', from: 'Boké',    to: 'Conakry',   goodsCode: 'BAUX', goodsLabel: 'Bauxite',     qty: 28,    unit: 'tonnes',     vehicle: 'RC-9032-AB', driver: 'Ibrahima Sow',    amount: 372000, status: 'overdue'  },
  { id: 'DUT-2026-04-08651', date: '18/04/2026', due: '23/04/2026', transporterId: 'T-04812', from: 'Conakry', to: 'Nzérékoré', goodsCode: 'CAR',  goodsLabel: 'Carburant',   qty: 22000, unit: 'litres',     vehicle: 'RC-1244-AE', driver: 'Fatoumata Touré', amount: 845000, status: 'paid',    paidOn: '19/04/2026', payMethod: 'mtn',    ref: 'KKP-2026-39A2C1' },
  { id: 'DUT-2026-04-08754', date: '24/04/2026', due: '29/04/2026', transporterId: 'T-04812', from: 'Conakry', to: 'Kankan',    goodsCode: 'CIM',  goodsLabel: 'Ciment',      qty: 540,   unit: 'sacs 50kg',  vehicle: 'RC-3107-AB', driver: 'Sékou Camara',    amount: 198000, status: 'paid',    paidOn: '24/04/2026', payMethod: 'card',   ref: 'KKP-2026-7E81D0' },
  // Other transporters (officer view only)
  { id: 'DUT-2026-04-08840', date: '30/04/2026', due: '05/05/2026', transporterId: 'T-03914', from: 'Kamsar',  to: 'Conakry',   goodsCode: 'BAUX', goodsLabel: 'Bauxite',     qty: 38,    unit: 'tonnes',     vehicle: 'RC-9911-AF', driver: 'Mamadi Camara',   amount: 482000, status: 'paid',    paidOn: '30/04/2026', payMethod: 'orange', ref: 'KKP-2026-B5C214' },
  { id: 'DUT-2026-04-08841', date: '30/04/2026', due: '05/05/2026', transporterId: 'T-05021', from: 'Conakry', to: 'Faranah',   goodsCode: 'HUI',  goodsLabel: 'Huile palme', qty: 84,    unit: 'fûts',       vehicle: 'RC-7702-AC', driver: 'Lamine Diané',    amount: 295000, status: 'pending'  },
  { id: 'DUT-2026-04-08842', date: '30/04/2026', due: '05/05/2026', transporterId: 'T-02744', from: 'Labé',    to: 'Conakry',   goodsCode: 'POI',  goodsLabel: 'Poisson séché', qty: 120,  unit: 'caisses',  vehicle: 'RC-3344-AB', driver: 'Boubacar Barry',  amount: 144000, status: 'pending'  },
];

const OFFICER = {
  name: 'Fatoumata Camara',
  short: 'F. Camara',
  role: 'Inspectrice DNTT, Direction des Transports Terrestres',
  badge: 'DNTT-2018-04-771',
  office: 'Bureau régional, Conakry-Kaloum',
  email: 'f.camara@dntt.gov.gn',
  signatureName: 'F. Camara',
};

Object.assign(window, {
  // primitives
  Field, FieldRow, Input, Select, SummaryRow, KpiTile, StatusPill,
  ReviewBlock, ReviewLine, PdfSection, PdfRow, SignatureBlock, FauxQr,
  // styles
  paperCard, cardHeader, cardTitle, td, primaryBtn, ghostBtn, dangerBtn,
  // data
  TRANSPORTERS, BILLS, OFFICER,
});

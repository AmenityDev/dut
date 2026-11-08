// SOBER, Individual transporter: owner-driver, single vehicle.
// Same sober design language as the company app, drastically simplified:
// no fleet manager, no drivers list, no company KPIs. Mobile-first patterns
// even on desktop (single column, stacked cards, big CTA).

const INDIVIDUAL = {
  name: 'Sékou Soumah',
  cni: 'CNI 094-2018-0044218',
  city: 'Coyah',
  phone: '+224 622 04 18 77',
  vehicle: { plate: 'RG-7142-CO', brand: 'Toyota Hilux 2018', capacity: '1,5 t', type: 'Pick-up bâché' },
  since: '2019',
  trips: 88, // lifetime DUTs
};

const INDIVIDUAL_BILLS = [
  // pending
  { id: 'DUT-2026-04-08819', from: 'Coyah',   to: 'Conakry', goods: 'Produits maraîchers', amount: 64200, status: 'pending', issued: '02/05/2026', due: '04/05/2026', officer: 'F. Camara' },
  // paid history
  { id: 'DUT-2026-04-08711', from: 'Forécariah', to: 'Coyah', goods: 'Manioc',           amount: 38400, status: 'paid', issued: '24/04/2026', officer: 'F. Camara', method: 'Orange Money' },
  { id: 'DUT-2026-04-08599', from: 'Coyah',   to: 'Kindia',  goods: 'Banane plantain',     amount: 41700, status: 'paid', issued: '17/04/2026', officer: 'M. Sylla',   method: 'Orange Money' },
  { id: 'DUT-2026-04-08502', from: 'Coyah',   to: 'Conakry', goods: 'Légumes divers',      amount: 36800, status: 'paid', issued: '12/04/2026', officer: 'F. Camara', method: 'MTN MoMo' },
  { id: 'DUT-2026-03-08311', from: 'Forécariah', to: 'Conakry', goods: 'Mangues',         amount: 52100, status: 'paid', issued: '28/03/2026', officer: 'F. Camara', method: 'Orange Money' },
];

// ─────────────────────────────────────────────────────────────
// Root app
// ─────────────────────────────────────────────────────────────
const SoberIndividualApp = ({ lang = 'fr', density = 'comfortable' }) => {
  const [screen, setScreen] = React.useState('home'); // home | pay | payflow | receipt | account | dutView | importView
  const [activeBill, setActiveBill] = React.useState(null);
  const [viewedBill, setViewedBill] = React.useState(null); // DUT being viewed
  const [viewedImport, setViewedImport] = React.useState(null); // import bill being viewed
  const [importModal, setImportModal] = React.useState(null);
  const [paymentMethod, setPaymentMethod] = React.useState('orange');
  const [paymentState, setPaymentState] = React.useState('idle'); // idle | sent | success
  const [paid, setPaid] = React.useState(false);

  const isFr = lang !== 'en';
  const pending = INDIVIDUAL_BILLS.filter(b => b.status === 'pending');
  const paidBills = INDIVIDUAL_BILLS.filter(b => b.status === 'paid');
  const totalDue = pending.reduce((s, b) => s + b.amount, 0);

  // Import bills addressed to this individual (Sékou Soumah: CNI-7053219K)
  const myImportBills = IMPORT_BILLS.filter(b => b.importerKind === 'individual' && b.importerId === 'CNI-7053219K');
  const pendingImports = myImportBills.filter(b => b.status === 'pending');

  const startPay = (b) => { setActiveBill(b); setPaid(false); setPaymentState('idle'); setScreen('payflow'); };
  const startPayImport = (imp) => {
    // Map an import bill into the DUT-shape the existing pay flow understands.
    const asPayable = {
      id: imp.id, amount: imp.total, kind: 'import',
      from: imp.vehicle.origin, to: 'Conakry',
      goods: `${imp.vehicle.make} ${imp.vehicle.model}, ${imp.vehicle.year}`,
      issued: imp.date, due: imp.due, officer: imp.officer,
      _import: imp,
    };
    setImportModal(null);
    startPay(asPayable);
  };

  const pad = density === 'compact' ? 14 : 22;

  return (
    <div className="sober-root" style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F7F3EB', color: '#161413', fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 13.5, lineHeight: 1.5, overflow: 'hidden', position: 'relative',
    }}>
      <FlagBar height={3}/>
      <IndividualTopBar lang={lang} pending={pending}/>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <IndividualSidebar lang={lang} screen={screen} setScreen={setScreen} pending={pending}/>

        <main style={{ flex: 1, overflow: 'auto', padding: '28px 40px', position: 'relative' }}>
          <div style={{ maxWidth: (screen === 'dutView' || screen === 'importView') ? 1200 : 880, margin: '0 auto' }}>
            {screen === 'home' && (
              <IndividualHome lang={lang} pending={pending} totalDue={totalDue} paidBills={paidBills}
                              onPay={() => setScreen('pay')} onOpenBill={startPay}
                              onOpenReceipt={(b) => { setActiveBill(b); setPaid(true); setScreen('receipt'); }}/>
            )}
            {screen === 'pay' && (
              <IndividualPayList lang={lang} pending={pending} totalDue={totalDue}
                                 importBills={pendingImports}
                                 onOpenBill={startPay}
                                 onViewDut={(b) => { setViewedBill(b); setScreen('dutView'); }}
                                 onViewImport={(b) => { setViewedImport(b); setScreen('importView'); }}
                                 onPayImport={startPayImport}
                                 onBack={() => setScreen('home')}/>
            )}
            {screen === 'dutView' && viewedBill && (
              <IndividualDutView lang={lang} bill={viewedBill}
                                  onBack={() => { setScreen('pay'); setViewedBill(null); }}
                                  onPay={() => { const b = viewedBill; setViewedBill(null); startPay(b); }}/>
            )}
            {screen === 'importView' && viewedImport && (
              <IndividualImportView lang={lang} bill={viewedImport}
                                     onBack={() => { setScreen('pay'); setViewedImport(null); }}
                                     onPay={() => { const b = viewedImport; setViewedImport(null); startPayImport(b); }}/>
            )}
            {screen === 'payflow' && activeBill && (
              <IndividualPayFlow lang={lang} bill={activeBill}
                                 method={paymentMethod} setMethod={setPaymentMethod}
                                 paymentState={paymentState} setPaymentState={setPaymentState}
                                 paid={paid}
                                 onDone={() => { setPaid(true); setScreen('receipt'); }}
                                 onBack={() => setScreen('pay')}/>
            )}
            {screen === 'receipt' && activeBill && (
              <IndividualReceipt lang={lang} bill={activeBill} onBack={() => setScreen('home')}/>
            )}
            {screen === 'account' && (
              <IndividualAccount lang={lang} onBack={() => setScreen('home')}/>
            )}
          </div>
        </main>
        <SoberBottomNav screen={screen === 'payflow' || screen === 'receipt' ? 'pay' : screen} setScreen={setScreen} items={[
          { id: 'home', icon: 'home', label: isFr ? 'Accueil' : 'Home' },
          { id: 'pay', icon: 'coin', label: isFr ? 'Régler' : 'Pay', badge: pending.length || null },
          { id: 'account', icon: 'user', label: isFr ? 'Profil' : 'Profile' },
        ]}/>
      </div>

      <ChatbotBadge role="individual" lang={lang}/>
      {importModal && <ImportBillModal bill={importModal} lang={lang} onClose={() => setImportModal(null)} onPay={startPayImport}/>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Top bar: same shape as Officer/Company
// ─────────────────────────────────────────────────────────────
const IndividualTopBar = ({ lang, pending }) => {
  const isFr = lang !== 'en';
  return (
    <header className="sober-topbar" style={{
      display: 'flex', alignItems: 'center', gap: 18, padding: '14px 24px',
      background: '#FBF8F2', borderBottom: '1px solid #E5DDC9',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Crimson Pro", serif', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>D</div>
        <div className="sober-topbar-emblem-text" style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>République de Guinée, DNTT</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 17, fontWeight: 600 }}>Document Unique de Transport</div>
        </div>
      </div>
      <div style={{ flex: 1 }}/>
      <div className="sober-topbar-search" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', border: '1px solid #DCD3BD', borderRadius: 4, background: '#fff', width: 280 }}>
        <Icon name="search" size={14} style={{ color: '#9A9281' }}/>
        <span style={{ color: '#9A9281', fontSize: 12.5 }}>{isFr ? 'Rechercher un DUT' : 'Search'}…</span>
      </div>
      <button style={{ width: 36, height: 36, border: '1px solid #E5DDC9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
        <Icon name="bell" size={16}/>
        {pending.length > 0 && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#CE1126' }}/>}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14, borderLeft: '1px solid #E5DDC9' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Crimson Pro", serif', fontSize: 13, fontWeight: 700 }}>
          {INDIVIDUAL.name.split(' ').map(s => s[0]).join('')}
        </div>
        <div className="sober-topbar-user-text" style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{INDIVIDUAL.name}</div>
          <div style={{ fontSize: 10.5, color: '#9A9281' }}>{isFr ? 'Personne physique' : 'Individual'}, {INDIVIDUAL.city}</div>
        </div>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────
// Sidebar: matches company app shape (230px, icon nav, footer)
// ─────────────────────────────────────────────────────────────
const IndividualSidebar = ({ lang, screen, setScreen, pending }) => {
  const isFr = lang !== 'en';
  const Item = ({ id, icon, label, badge }) => {
    const active = screen === id || (id === 'pay' && (screen === 'payflow' || screen === 'receipt'));
    return (
      <button onClick={() => setScreen(id)} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px',
        background: active ? '#FBF8F2' : 'transparent', color: active ? '#161413' : '#6B6557',
        border: 'none', borderLeft: active ? '2px solid #CE1126' : '2px solid transparent',
        width: '100%', cursor: 'pointer', fontSize: 13, textAlign: 'left',
        fontWeight: active ? 600 : 500, fontFamily: 'inherit',
      }}>
        <Icon name={icon} size={17}/>
        <span className="sober-navlabel">{label}</span>
        {badge && <span className="sober-navbadge" style={{ marginLeft: 'auto', fontSize: 10, background: '#CE1126', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>{badge}</span>}
      </button>
    );
  };
  return (
    <aside className="sober-nav" style={{ width: 230, background: '#FBF8F2', borderRight: '1px solid #E5DDC9', padding: '14px 0', display: 'flex', flexDirection: 'column' }}>
      <div className="sober-navhead" style={{ padding: '0 14px 10px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>
        {isFr ? 'Espace personnel' : 'Personal space'}
      </div>
      <Item id="home"    icon="home" label={isFr ? 'Accueil' : 'Home'}/>
      <Item id="pay"     icon="coin" label={isFr ? 'Régler mes DUT' : 'Pay bills'} badge={pending.length || null}/>

      <div className="sober-navhead" style={{ padding: '18px 14px 6px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>
        {isFr ? 'Compte' : 'Account'}
      </div>
      <Item id="account" icon="user" label={isFr ? 'Mon profil' : 'My profile'}/>

      {/* Vehicle card pinned in sidebar: single vehicle is the defining trait of an individual */}
      <div className="sober-navfooter" style={{ margin: '20px 14px 0', padding: 12, background: '#fff', border: '1px solid #E5DDC9' }}>
        <div style={{ fontSize: 9.5, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 8 }}>
          {isFr ? 'Mon véhicule' : 'My vehicle'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 28, border: '1.5px solid #161413', background: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>RG</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 11.5 }}>{INDIVIDUAL.vehicle.plate}</div>
            <div style={{ fontSize: 10.5, color: '#6B6557' }}>{INDIVIDUAL.vehicle.brand}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 10.5, color: '#1F4F2C', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="check" size={11}/> {isFr ? 'Carte à jour' : 'Card valid'}
        </div>
      </div>

      <div style={{ flex: 1 }}/>
      <div className="sober-navfooter" style={{ padding: '10px 14px', fontSize: 10, color: '#9A9281', borderTop: '1px solid #E5DDC9' }}>
        {isFr ? 'DNTT, Min. des Transports' : 'DNTT, Transport Min.'}<br/>v 2.4.1, 04 / 2026
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────────────────────
// Home: greeting hero + amount due + last few receipts
// ─────────────────────────────────────────────────────────────
const IndividualHome = ({ lang, pending, totalDue, paidBills, onPay, onOpenBill, onOpenReceipt }) => {
  const isFr = lang !== 'en';
  const hasPending = pending.length > 0;
  return (
    <>
      {/* Greeting */}
      <div style={{ padding: '8px 0 18px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>
          {isFr ? 'Bonjour' : 'Hello'}, {INDIVIDUAL.city}
        </div>
        <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, fontWeight: 500, margin: '4px 0 0', letterSpacing: '-0.01em' }}>
          {INDIVIDUAL.name.split(' ')[0]}, <i style={{ color: '#6B6557', fontWeight: 400 }}>
            {hasPending
              ? (isFr ? 'vous avez un règlement en attente.' : 'you have a payment pending.')
              : (isFr ? 'tout est à jour.' : "you're all caught up.")}
          </i>
        </h1>
      </div>

      {/* Amount due hero */}
      {hasPending ? (
        <section style={{ marginBottom: 20, background: '#161413', color: '#F7F3EB', padding: 22, borderRadius: 2 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#FCD116', textTransform: 'uppercase' }}>
            {isFr ? 'À régler' : 'Amount due'}
          </div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 44, fontWeight: 600, marginTop: 6, lineHeight: 1 }}>{fmtGNF(totalDue)}</div>
          <div style={{ fontSize: 12, color: '#B5AC97', marginTop: 6 }}>
            {pending.length} DUT, {isFr ? 'avant le' : 'before'} {pending[0].due}
          </div>
          <button onClick={onPay} style={{
            marginTop: 16, width: '100%', background: '#FCD116', color: '#161413',
            border: 'none', padding: '14px 18px', fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="coin" size={16}/> {isFr ? 'Régler maintenant' : 'Pay now'}
          </button>
        </section>
      ) : (
        <section style={{ marginBottom: 20, background: '#E8F2EA', border: '1px solid #BFD9C4', padding: 22, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1F4F2C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={22}/>
          </div>
          <div>
            <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 20, fontWeight: 600 }}>{isFr ? 'Vous êtes à jour' : "You're up to date"}</div>
            <div style={{ fontSize: 12, color: '#3B5C42' }}>{isFr ? 'Aucun DUT en attente. Bon trajet.' : 'No bills pending. Safe travels.'}</div>
          </div>
        </section>
      )}

      {/* Vehicle card */}
      <section style={{ ...paperCard(), padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 36, border: '1.5px solid #161413', background: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700 }}>
          RG
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 14 }}>{INDIVIDUAL.vehicle.plate}</div>
          <div style={{ fontSize: 12, color: '#6B6557' }}>{INDIVIDUAL.vehicle.brand}, {INDIVIDUAL.vehicle.capacity}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10.5, color: '#9A9281', letterSpacing: '.12em', textTransform: 'uppercase' }}>{isFr ? 'Carte transp.' : 'Carrier card'}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1F4F2C' }}>✓ {isFr ? 'À jour' : 'Valid'}</div>
        </div>
      </section>

      {/* Recent receipts (mini) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18, fontWeight: 600, margin: 0 }}>{isFr ? 'Derniers reçus' : 'Recent receipts'}</h2>
          <span style={{ fontSize: 11, color: '#9A9281' }}>{INDIVIDUAL.trips} {isFr ? 'DUT depuis' : 'DUTs since'} {INDIVIDUAL.since}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {paidBills.slice(0, 4).map((b, i) => (
            <button key={b.id} onClick={() => onOpenReceipt(b)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              background: i % 2 ? '#FBF8F2' : '#fff',
              border: 'none', borderTop: '1px solid #E5DDC9',
              borderBottom: i === Math.min(paidBills.length, 4) - 1 ? '1px solid #E5DDC9' : 'none',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              width: '100%',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1F4F2C', flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.from} → {b.to}</div>
                <div style={{ fontSize: 11.5, color: '#6B6557' }}>{b.goods}, {b.issued}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtGNF(b.amount)}</div>
                <div style={{ fontSize: 10, color: '#9A9281', fontFamily: '"JetBrains Mono", monospace' }}>{b.id.slice(-5)}</div>
              </div>
              <Icon name="chev" size={14} style={{ color: '#9A9281', flexShrink: 0 }}/>
            </button>
          ))}
        </div>
      </section>
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Pay list: pending bills with full detail
// ─────────────────────────────────────────────────────────────
const IndividualPayList = ({ lang, pending, totalDue, importBills = [], onOpenBill, onViewDut, onViewImport, onPayImport, onBack }) => {
  const isFr = lang !== 'en';
  const totalImportDue = importBills.reduce((s,b)=>s+b.total,0);
  if (pending.length === 0 && importBills.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#E8F2EA', color: '#1F4F2C', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon name="check" size={28}/>
        </div>
        <h2 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 22, fontWeight: 600, margin: 0 }}>{isFr ? 'Aucun DUT à régler' : 'Nothing to pay'}</h2>
        <p style={{ fontSize: 13, color: '#6B6557', marginTop: 8 }}>{isFr ? 'Vous êtes à jour avec la DNTT.' : "You're all up to date."}</p>
      </div>
    );
  }
  return (
    <>
      <div style={{ padding: '8px 0 18px', borderBottom: '1px solid #E5DDC9', marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>
          {isFr ? `À régler, ${pending.length + importBills.length} document${pending.length + importBills.length > 1 ? 's' : ''}` : `${pending.length + importBills.length} bills due`}
        </div>
        <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 26, fontWeight: 500, margin: '4px 0 0' }}>
          {fmtGNF(totalDue + totalImportDue)}
        </h1>
      </div>

      {importBills.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="ship" size={13}/> {isFr ? 'Importations de véhicules' : 'Vehicle imports'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {importBills.map(b => (
              <ImportBillCard key={b.id} bill={b} lang={lang} onView={onViewImport} onPay={onPayImport}/>
            ))}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 10 }}>
            {isFr ? 'Documents Uniques de Transport' : 'Transport documents'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {pending.map(b => (
          <article key={b.id} style={{ ...paperCard(), padding: 18, borderLeft: '3px solid #FCD116' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 700 }}>{b.id}</div>
                <div style={{ fontSize: 11, color: '#9A9281', marginTop: 2 }}>{isFr ? 'Émis le' : 'Issued'} {b.issued}, {b.officer}</div>
              </div>
              <span style={{ background: '#FCD116', color: '#161413', padding: '3px 8px', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                {isFr ? 'À régler' : 'Due'}
              </span>
            </div>
            <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              {b.from} → {b.to}
            </div>
            <div style={{ fontSize: 12.5, color: '#6B6557', marginBottom: 14 }}>{b.goods}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, borderTop: '1px solid #E5DDC9' }}>
              <div>
                <div style={{ fontSize: 10.5, color: '#9A9281', letterSpacing: '.12em', textTransform: 'uppercase' }}>{isFr ? 'À régler avant' : 'Due'}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{b.due}</div>
              </div>
              <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 22, fontWeight: 600 }}>{fmtGNF(b.amount)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => onViewDut?.(b)} style={{
                ...ghostBtn(), flex: 1, justifyContent: 'center', padding: '11px',
              }}>
                <Icon name="doc" size={13}/> {isFr ? 'Voir le DUT' : 'View bill'}
              </button>
              <button onClick={() => onOpenBill(b)} style={{
                flex: 1, background: '#161413', color: '#FCD116',
                border: 'none', padding: '11px', fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Icon name="coin" size={13}/> {isFr ? 'Régler le DUT' : 'Pay bill'}
              </button>
            </div>
          </article>
        ))}
          </div>
        </>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Pay flow: mobile-money first, simple step
// ─────────────────────────────────────────────────────────────
const IndividualPayFlow = ({ lang, bill, method, setMethod, paymentState, setPaymentState, onDone, onBack }) => {
  const isFr = lang !== 'en';
  const fee = Math.round(bill.amount * 0.91);
  const stamp = 25000, stat = 8000;

  const send = () => {
    setPaymentState('sent');
    setTimeout(() => { setPaymentState('success'); setTimeout(onDone, 800); }, 1400);
  };

  return (
    <div>
      {/* Bill recap */}
      <section style={{ ...paperCard(), padding: 18, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase' }}>DUT</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700 }}>{bill.id}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, color: '#9A9281', letterSpacing: '.12em', textTransform: 'uppercase' }}>{isFr ? 'Total' : 'Total'}</div>
            <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 26, fontWeight: 600 }}>{fmtGNF(bill.amount)}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, marginTop: 6 }}>{bill.from} → {bill.to}</div>
        <div style={{ fontSize: 12, color: '#6B6557' }}>{bill.goods}</div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E5DDC9', fontSize: 11.5, color: '#6B6557' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{isFr ? 'Redevance kilométrique' : 'Distance fee'}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtGNF(fee)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{isFr ? 'Timbre fiscal' : 'Stamp duty'}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtGNF(stamp)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{isFr ? 'Quote-part DNTT' : 'DNTT share'}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtGNF(stat)}</span></div>
        </div>
      </section>

      {/* Method picker */}
      <div style={{ fontSize: 11, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 8 }}>
        {isFr ? 'Méthode de paiement' : 'Payment method'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {[
          { id: 'orange', label: 'Orange Money', sub: '+224 622 04 18 77', accent: '#FF6600' },
          { id: 'mtn',    label: 'MTN MoMo',     sub: '+224 660 12 88 21', accent: '#FFCC00' },
          { id: 'cash',   label: isFr ? 'Espèces (au bureau DNTT)' : 'Cash (at DNTT office)', sub: isFr ? 'Bureau Coyah, 8h-17h' : 'Coyah office, 8a-5p', accent: '#9A9281' },
        ].map(m => {
          const active = method === m.id;
          return (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              background: active ? '#FBF8F2' : '#fff',
              border: active ? '2px solid #161413' : '1px solid #E5DDC9',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', borderRadius: 2,
            }}>
              <div style={{ width: 36, height: 36, background: m.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: '"Crimson Pro", serif' }}>
                {m.label.split(' ').map(s => s[0]).slice(0, 2).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.label}</div>
                <div style={{ fontSize: 11.5, color: '#6B6557' }}>{m.sub}</div>
              </div>
              <div style={{ width: 18, height: 18, border: '1.5px solid', borderColor: active ? '#161413' : '#DCD3BD', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {active && <div style={{ width: 8, height: 8, background: '#161413', borderRadius: '50%' }}/>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit */}
      {paymentState === 'idle' && (
        <button onClick={send} style={{
          width: '100%', background: '#161413', color: '#FCD116',
          border: 'none', padding: '16px', fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5,
          cursor: 'pointer', borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {method === 'cash'
            ? (isFr ? 'Réserver le paiement en espèces' : 'Reserve cash payment')
            : <><Icon name="phone" size={16}/> {isFr ? `Envoyer la demande (${fmtGNF(bill.amount)})` : `Send request (${fmtGNF(bill.amount)})`}</>}
        </button>
      )}
      {paymentState === 'sent' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #E5DDC9', borderTopColor: '#161413', margin: '0 auto', animation: 'spin 0.9s linear infinite' }}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ marginTop: 12, fontSize: 13.5, fontWeight: 600 }}>
            {isFr ? 'Confirmez sur votre téléphone…' : 'Confirm on your phone…'}
          </div>
          <div style={{ fontSize: 11.5, color: '#6B6557', marginTop: 4 }}>
            {isFr ? 'Composez #144# si rien ne s\'affiche' : 'Dial #144# if nothing appears'}
          </div>
        </div>
      )}
      {paymentState === 'success' && (
        <div style={{ textAlign: 'center', padding: '12px 0', background: '#E8F2EA', border: '1px solid #BFD9C4', borderRadius: 2 }}>
          <Icon name="check" size={24} style={{ color: '#1F4F2C' }}/>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F4F2C', marginTop: 4 }}>
            {isFr ? 'Paiement reçu' : 'Payment received'}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Receipt: paid DUT, mobile-friendly compact card
// ─────────────────────────────────────────────────────────────
const IndividualReceipt = ({ lang, bill, onBack }) => {
  const isFr = lang !== 'en';
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#E8F2EA', color: '#1F4F2C', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700 }}>
          <Icon name="check" size={14}/> {isFr ? 'DUT acquitté' : 'STD paid'}
        </div>
      </div>

      <article style={{ background: '#fff', border: '1px solid #DCD3BD', padding: 22, position: 'relative' }}>
        {/* Paid stamp */}
        <div style={{
          position: 'absolute', top: 18, right: 18,
          border: '2px solid #1F4F2C', color: '#1F4F2C',
          padding: '6px 10px', transform: 'rotate(-8deg)',
          fontFamily: '"Crimson Pro", serif', fontWeight: 700, fontSize: 13,
          letterSpacing: '.12em',
        }}>{isFr ? 'PAYÉ' : 'PAID'}</div>

        <div style={{ borderBottom: '2px solid #161413', paddingBottom: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>République de Guinée, DNTT</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18, fontWeight: 600, marginTop: 2 }}>
            Document Unique de Transport
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, marginTop: 4 }}>{bill.id}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
          <PdfRow k={isFr ? 'Trajet' : 'Route'} v={`${bill.from} → ${bill.to}`}/>
          <PdfRow k={isFr ? 'Marchandise' : 'Cargo'} v={bill.goods}/>
          <PdfRow k={isFr ? 'Émis le' : 'Issued'} v={bill.issued}/>
          <PdfRow k={isFr ? 'Agent DNTT' : 'DNTT officer'} v={bill.officer}/>
          <PdfRow k={isFr ? 'Transporteur' : 'Carrier'} v={INDIVIDUAL.name}/>
          <PdfRow k="CNI" v={INDIVIDUAL.cni}/>
          <PdfRow k={isFr ? 'Véhicule' : 'Vehicle'} v={INDIVIDUAL.vehicle.plate}/>
          <PdfRow k={isFr ? 'Méthode' : 'Method'} v={bill.method || 'Orange Money'}/>
        </div>

        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #E5DDC9', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6557' }}>{isFr ? 'Montant payé' : 'Amount paid'}</span>
          <span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 26, fontWeight: 600 }}>{fmtGNF(bill.amount)}</span>
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #DCD3BD', display: 'flex', alignItems: 'center', gap: 12 }}>
          <FauxQr/>
          <div style={{ fontSize: 10.5, color: '#6B6557', lineHeight: 1.5 }}>
            {isFr ? 'Scannez ce QR pour vérifier l\'authenticité du DUT auprès des services DNTT.' : 'Scan to verify authenticity with DNTT services.'}
          </div>
        </div>
      </article>

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button style={{ ...ghostBtn(), flex: 1, justifyContent: 'center', padding: '12px' }}>
          <Icon name="download" size={14}/> {isFr ? 'Télécharger PDF' : 'Download PDF'}
        </button>
        <button style={{ ...ghostBtn(), flex: 1, justifyContent: 'center', padding: '12px' }}>
          <Icon name="upload" size={14}/> {isFr ? 'Partager' : 'Share'}
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        <PairingCard lang={lang} actor="individual" paid
                     dut={{ id: bill.id, vehicle: INDIVIDUAL.vehicle.plate, driver: INDIVIDUAL.name, from: bill.from, to: bill.to, driverPhone: INDIVIDUAL.phone }}/>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DUT view (pre-payment): same chrome as company DUT page
// ─────────────────────────────────────────────────────────────
const IndividualDutView = ({ lang, bill, onBack, onPay }) => {
  const isFr = lang !== 'en';
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{isFr ? 'Document prêt' : 'Document ready'}, {bill.id}</div>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 26, margin: '6px 0 0', fontWeight: 500 }}>{isFr ? 'Document Unique de Transport' : 'Unique Transport Document'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onPay} style={{
            background: '#161413', color: '#FCD116', border: 'none', padding: '8px 16px',
            fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', borderRadius: 2,
            display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '.04em',
          }}>
            <Icon name="coin" size={13}/> {isFr ? 'Régler le DUT' : 'Pay bill'}
          </button>
          <button style={ghostBtn()}>{isFr ? 'Imprimer' : 'Print'}</button>
          <button style={primaryBtn()}><Icon name="download" size={14}/> {isFr ? 'Télécharger' : 'Download'}</button>
          <button onClick={onBack} style={ghostBtn()}>{isFr ? 'Annuler' : 'Cancel'}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 22, alignItems: 'flex-start' }}>
        <article style={{ background: '#fff', border: '1px solid #DCD3BD', padding: 26, position: 'relative' }}>
        <div style={{ borderBottom: '2px solid #161413', paddingBottom: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>République de Guinée, DNTT</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 20, fontWeight: 600, marginTop: 2 }}>
            Document Unique de Transport
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, marginTop: 4 }}>{bill.id}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12.5 }}>
          <PdfRow k={isFr ? 'Trajet' : 'Route'} v={`${bill.from} → ${bill.to}`}/>
          <PdfRow k={isFr ? 'Marchandise' : 'Cargo'} v={bill.goods}/>
          <PdfRow k={isFr ? 'Émis le' : 'Issued'} v={bill.issued}/>
          <PdfRow k={isFr ? 'Échéance' : 'Due'} v={bill.due}/>
          <PdfRow k={isFr ? 'Agent DNTT' : 'DNTT officer'} v={bill.officer}/>
          <PdfRow k={isFr ? 'Statut' : 'Status'} v={isFr ? 'À régler' : 'Due'}/>
          <PdfRow k={isFr ? 'Transporteur' : 'Carrier'} v={INDIVIDUAL.name}/>
          <PdfRow k="CNI" v={INDIVIDUAL.cni}/>
          <PdfRow k={isFr ? 'Véhicule' : 'Vehicle'} v={INDIVIDUAL.vehicle.plate}/>
          <PdfRow k={isFr ? 'Type' : 'Type'} v={INDIVIDUAL.vehicle.brand}/>
        </div>

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #E5DDC9', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6557' }}>{isFr ? 'Montant à régler' : 'Amount due'}</span>
          <span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, fontWeight: 600 }}>{fmtGNF(bill.amount)}</span>
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #DCD3BD', display: 'flex', alignItems: 'center', gap: 12 }}>
          <FauxQr/>
          <div style={{ fontSize: 10.5, color: '#6B6557', lineHeight: 1.5 }}>
            {isFr ? 'Scannez ce QR pour vérifier l\'authenticité du DUT auprès des services DNTT.' : 'Scan to verify authenticity with DNTT services.'}
          </div>
        </div>
      </article>

        <aside>
          <div style={paperCard()}>
            <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 8 }}>{isFr ? 'État' : 'Status'}</div>
            <StatusPill status={bill.status === 'paid' ? 'paid' : 'pending'} lang={lang}/>
            <div style={{ marginTop: 16, fontSize: 11.5, color: '#6B6557', lineHeight: 1.6 }}>
              {isFr ? 'Émis par' : 'Issued by'} <strong style={{ color: '#161413' }}>{bill.officer}</strong><br/>
              {isFr ? 'Le' : 'On'} {bill.issued}, {isFr ? 'échéance' : 'due'} {bill.due}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Import bill view: full-page invoice (same chrome as DUT page)
// ─────────────────────────────────────────────────────────────
const IndividualImportView = ({ lang, bill, onBack, onPay }) => {
  const isFr = lang !== 'en';
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{isFr ? 'Document prêt' : 'Document ready'}, {bill.id}</div>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 26, margin: '6px 0 0', fontWeight: 500 }}>{isFr ? 'Avis de Taxation, Importation Véhicule' : 'Vehicle Import Tax Notice'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {bill.status === 'pending' && (
            <button onClick={onPay} style={{
              background: '#161413', color: '#FCD116', border: 'none', padding: '8px 16px',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', borderRadius: 2,
              display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '.04em',
            }}>
              <Icon name="coin" size={13}/> {isFr ? 'Régler la taxe' : 'Pay tax'}
            </button>
          )}
          <button style={ghostBtn()}>{isFr ? 'Imprimer' : 'Print'}</button>
          <button style={primaryBtn()}><Icon name="download" size={14}/> {isFr ? 'Télécharger' : 'Download'}</button>
          <button onClick={onBack} style={ghostBtn()}>{isFr ? 'Annuler' : 'Cancel'}</button>
        </div>
      </div>

      <OfficerImportDetail lang={lang} bill={bill} hideBack={true} onBack={onBack}/>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Account
// ─────────────────────────────────────────────────────────────
const IndividualAccount = ({ lang, onBack }) => {
  const isFr = lang !== 'en';
  return (
    <div>
      <div style={{ padding: '20px 0 22px', textAlign: 'center', borderBottom: '1px solid #E5DDC9', marginBottom: 18 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#161413', color: '#FCD116', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Crimson Pro", serif', fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          {INDIVIDUAL.name.split(' ').map(s => s[0]).join('')}
        </div>
        <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 22, fontWeight: 600 }}>{INDIVIDUAL.name}</div>
        <div style={{ fontSize: 12, color: '#6B6557', marginTop: 2 }}>{isFr ? 'Transporteur indépendant' : 'Independent carrier'}, {INDIVIDUAL.city}</div>
        <div style={{ marginTop: 8, display: 'inline-block', padding: '3px 10px', background: '#FFF6E0', color: '#7A5A00', border: '1px solid #E8D38A', fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          {isFr ? 'Personne physique' : 'Individual'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {[
          { label: 'CNI', value: INDIVIDUAL.cni, mono: true },
          { label: isFr ? 'Téléphone' : 'Phone', value: INDIVIDUAL.phone },
          { label: isFr ? 'Localité' : 'City', value: INDIVIDUAL.city },
          { label: isFr ? 'Inscrit depuis' : 'Member since', value: INDIVIDUAL.since },
          { label: isFr ? 'DUT à vie' : 'Lifetime DUTs', value: INDIVIDUAL.trips.toString() },
        ].map((row, i) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 4px', borderTop: i ? '1px solid #E5DDC9' : 'none', fontSize: 13 }}>
            <span style={{ color: '#6B6557' }}>{row.label}</span>
            <span style={{ fontFamily: row.mono ? '"JetBrains Mono", monospace' : 'inherit', fontWeight: 600 }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22, padding: 16, background: '#FBF8F2', border: '1px solid #E5DDC9', borderRadius: 2 }}>
        <div style={{ fontSize: 11, color: '#9A9281', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>{isFr ? 'Mon véhicule' : 'My vehicle'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 56, height: 36, border: '1.5px solid #161413', background: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700 }}>RG</div>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 14 }}>{INDIVIDUAL.vehicle.plate}</div>
            <div style={{ fontSize: 12, color: '#6B6557' }}>{INDIVIDUAL.vehicle.brand}</div>
            <div style={{ fontSize: 11.5, color: '#6B6557' }}>{INDIVIDUAL.vehicle.type}, {INDIVIDUAL.vehicle.capacity}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <button style={{ ...ghostBtn(), width: '100%', justifyContent: 'center', padding: '12px', color: '#CE1126', borderColor: '#E8B6B6' }}>
          {isFr ? 'Se déconnecter' : 'Sign out'}
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { SoberIndividualApp, INDIVIDUAL, INDIVIDUAL_BILLS });

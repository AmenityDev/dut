// SOBER · Officer (DNTT) platform — issues DUTs, manages queue.
// Reuses primitives from sober.jsx (paperCard, KpiTile, ghostBtn, etc.)
// and sub-screens from sober-subscreens.jsx.

const SoberOfficerApp = ({ lang = 'fr', density = 'comfortable', initialScreen = 'dashboard' }) => {
  const [screen, setScreen] = React.useState(initialScreen); // dashboard | issue | queue | transporters | vehicles | tariffs | profile | settings | bill
  const [step, setStep] = React.useState(0);
  const [activeBill, setActiveBill] = React.useState(null);
  const [issueForm, setIssueForm] = React.useState({
    payerKind: 'company', // 'company' | 'individual'
    transporterId: 'TRP-04812',
    payerCustom: false, // toggle to enter free-form payer not in registry
    payerName: '',
    payerId: '', // RCCM or CNI/NIF
    payerAddress: '',
    payerPhone: '',
    fromCity: 'Kamsar', toCity: 'Conakry',
    goods: 'BAUX', quantity: 32, unit: 'tonnes',
    vehicle: 'RC-4821-AC', driver: 'Ousmane Bah',
    departure: '2026-05-02', arrival: '2026-05-02',
    value: 18500000,
  });

  const goods = GOODS.find(g => g.code === issueForm.goods) || GOODS[0];
  const distance = (ROUTES.find(r => r.from === issueForm.fromCity && r.to === issueForm.toCity) || { km: 254 }).km;
  const baseFee = Math.round(distance * 1200 + issueForm.quantity * 800);
  const stamp = 25000, stat = 8000;
  const total = baseFee + stamp + stat;

  const pad = density === 'compact' ? 14 : 22;

  const openBill = (bill) => { setActiveBill(bill); setScreen('bill'); };
  const startIssue = () => { setStep(0); setScreen('issue'); };

  return (
    <div className="sober-root" style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F7F3EB', color: '#161413', fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 13.5, lineHeight: 1.5, overflow: 'hidden', position: 'relative',
    }}>
      <FlagBar height={3}/>
      <OfficerTopBar lang={lang}/>
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        <OfficerSidebar lang={lang} screen={screen} setScreen={setScreen} setStep={setStep}/>
        <main style={{ flex: 1, overflow: 'auto', padding: `${pad + 6}px ${pad + 14}px`, position: 'relative' }}>
          {screen === 'dashboard' && <OfficerDashboard lang={lang} onIssue={startIssue} onOpenBill={openBill} onOpenQueue={() => setScreen('queue')}/>}
          {screen === 'issue' && (
            <SoberForm lang={lang} form={issueForm} setForm={setIssueForm} step={step} setStep={setStep}
                       goods={goods} distance={distance} total={total} baseFee={baseFee} stamp={stamp} stat={stat}
                       onSubmit={() => { const tr = TRANSPORTERS.find(tr=>tr.id===issueForm.transporterId); const b = { id: 'DUT-2026-05-' + (8822 + Math.floor(Math.random()*99)), transporterId: issueForm.transporterId, transporter: issueForm.payerCustom ? issueForm.payerName : (tr?.short || ''), payerKind: issueForm.payerKind, payerId: issueForm.payerCustom ? issueForm.payerId : (tr?.rccm || ''), from: issueForm.fromCity, to: issueForm.toCity, goods: goods.label, amount: total, status: 'pending', issued: '02/05/2026', officer: OFFICER.name.split(' ').map(s=>s[0]).join('. ') }; setActiveBill(b); setScreen('bill'); }}
                       onCancel={() => setScreen('dashboard')}/>
          )}
          {screen === 'queue' && <OfficerQueue lang={lang} onOpenBill={openBill}/>}
          {screen === 'transporters' && <OfficerTransporters lang={lang}/>}
          {screen === 'vehicles' && <OfficerVehicles lang={lang}/>}
          {screen === 'tariffs' && <OfficerTariffs lang={lang}/>}
          {screen === 'imports' && <OfficerImports lang={lang} onOpen={(b) => { setActiveBill(b); setScreen('importDetail'); }} onNew={() => setScreen('importNew')}/>}
          {screen === 'importNew' && <OfficerImportNew lang={lang} onCancel={() => setScreen('imports')} onIssue={(data) => {
            const id = 'IMV-2026-05-' + String(922 + Math.floor(Math.random()*78)).padStart(5,'0');
            const newBill = { id, date: '02/05/2026', officer: 'F. Camara', importerKind: data.importerKind, importerId: data.importerId || data.importerDoc, importerName: data.importerName, vehicle: data.vehicle, cif: data.cif, total: data.tax.total, status: 'pending', due: '12/05/2026' };
            IMPORT_BILLS.unshift(newBill);
            setActiveBill(newBill); setScreen('importDetail');
          }}/>}
          {screen === 'importDetail' && activeBill && activeBill.id && activeBill.id.startsWith('IMV') && <OfficerImportDetail lang={lang} bill={activeBill} onBack={() => setScreen('imports')}/>}
          {screen === 'profile' && <OfficerProfile lang={lang}/>}
          {screen === 'settings' && <OfficerSettings lang={lang}/>}
          {screen === 'bill' && activeBill && <OfficerBillDetail lang={lang} bill={activeBill} onClose={() => setScreen('queue')}/>}
        </main>
        <SoberBottomNav screen={screen} setScreen={setScreen} items={[
          { id: 'dashboard', icon: 'home', label: t('dashboard', lang) },
          { id: 'issue', icon: 'plus', label: t('newDut', lang) },
          { id: 'queue', icon: 'doc', label: 'File', badge: BILLS.filter(b=>b.status==='pending').length },
          { id: 'transporters', icon: 'users', label: 'Transp.' },
          { id: 'profile', icon: 'user', label: 'Compte' },
        ]}/>
      </div>

      <ChatbotBadge role="officer" lang={lang}/>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Officer top bar — official portal vibe with badge instead of company
// ─────────────────────────────────────────────────────────────
const OfficerTopBar = ({ lang }) => (
  <header className="sober-topbar" style={{
    display: 'flex', alignItems: 'center', gap: 18, padding: '14px 24px',
    background: '#161413', borderBottom: '1px solid #000', color: '#FBF8F2',
  }}>
    <div style={{ color: '#FCD116' }}><SealEmblem size={44}/></div>
    <div className="sober-topbar-emblem-text" style={{ borderLeft: '1px solid #3A332A', paddingLeft: 16 }}>
      <div style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 17, lineHeight: 1.1, letterSpacing: '.01em', color: '#FBF8F2' }}>
        Plateforme DNTT — Émission DUT
      </div>
      <div style={{ fontSize: 11, color: '#9A9281', letterSpacing: '.16em', textTransform: 'uppercase', marginTop: 2 }}>
        {t('dntt', lang) || 'Direction Nationale du Transports Terrestre'}
      </div>
    </div>
    <div style={{ flex: 1 }}/>
    <div className="sober-topbar-search" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', border: '1px solid #3A332A', borderRadius: 4, background: '#0E0D0C', width: 320 }}>
      <Icon name="search" size={14} style={{ color: '#9A9281' }}/>
      <span style={{ color: '#9A9281', fontSize: 12.5 }}>Rechercher DUT, transporteur, plaque…</span>
      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#6B6557', border: '1px solid #3A332A', borderRadius: 2, padding: '1px 5px' }}>⌘K</span>
    </div>
    <div style={{ position: 'relative', color: '#FBF8F2' }}>
      <Icon name="bell" size={18}/>
      <span style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: '50%', background: '#CE1126', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>5</span>
    </div>
    <div className="sober-topbar-user-text" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14, borderLeft: '1px solid #3A332A' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FCD116', color: '#161413', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>FC</div>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{OFFICER.name}</div>
        <div style={{ fontSize: 11, color: '#9A9281', fontFamily: '"JetBrains Mono", monospace' }}>{OFFICER.badge}</div>
      </div>
    </div>
  </header>
);

// ─────────────────────────────────────────────────────────────
// Officer sidebar
// ─────────────────────────────────────────────────────────────
const OfficerSidebar = ({ lang, screen, setScreen, setStep }) => {
  const Item = ({ id, icon, label, badge }) => {
    const active = screen === id || (id === 'queue' && screen === 'bill') || (id === 'issue' && screen === 'issue');
    return (
      <button onClick={() => { if (id === 'issue') setStep(0); setScreen(id); }} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px',
        background: active ? '#FBF8F2' : 'transparent', color: active ? '#161413' : '#6B6557',
        border: 'none', borderLeft: active ? '2px solid #FCD116' : '2px solid transparent',
        width: '100%', cursor: 'pointer', fontSize: 13, textAlign: 'left',
        fontWeight: active ? 600 : 500, fontFamily: 'inherit',
      }}>
        <Icon name={icon} size={17}/>
        <span className="sober-navlabel">{label}</span>
        {badge !== undefined && badge !== null && <span className="sober-navbadge" style={{ marginLeft: 'auto', fontSize: 10, background: '#CE1126', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>{badge}</span>}
      </button>
    );
  };
  const pending = BILLS.filter(b => b.status === 'pending').length;
  return (
    <aside className="sober-nav" style={{ width: 230, background: '#FBF8F2', borderRight: '1px solid #E5DDC9', padding: '14px 0', display: 'flex', flexDirection: 'column' }}>
      <div className="sober-navhead" style={{ padding: '0 14px 10px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Émission</div>
      <Item id="dashboard" icon="home" label={t('dashboard', lang)}/>
      <Item id="issue" icon="plus" label="Émettre un DUT"/>
      <Item id="queue" icon="doc" label="File de DUT" badge={pending}/>
      <div className="sober-navhead" style={{ padding: '18px 14px 6px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Importations</div>
      <Item id="imports" icon="ship" label="Véhicules importés" badge={IMPORT_BILLS.filter(b=>b.status==='pending').length}/>
      <div className="sober-navhead" style={{ padding: '18px 14px 6px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Référentiel</div>
      <Item id="transporters" icon="users" label="Transporteurs"/>
      <Item id="vehicles" icon="truck" label="Véhicules"/>
      <Item id="tariffs" icon="coin" label="Grille tarifaire"/>
      <div className="sober-navhead" style={{ padding: '18px 14px 6px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Compte</div>
      <Item id="profile" icon="user" label="Profil"/>
      <Item id="settings" icon="gear" label={t('settings', lang)}/>
      <div style={{ flex: 1 }}/>
      <div style={{ margin: '10px 14px', padding: 12, background: '#161413', color: '#F7F3EB', borderRadius: 4 }} className="sober-navfooter">
        <div style={{ fontSize: 10, letterSpacing: '.18em', color: '#FCD116' }}>FIN DE SESSION</div>
        <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 13, marginTop: 4, lineHeight: 1.3 }}>Clôture journalière à 18:00 GMT — verser au Trésor</div>
      </div>
      <div className="sober-navfooter" style={{ padding: '10px 14px', fontSize: 10, color: '#9A9281', borderTop: '1px solid #E5DDC9' }}>
        Plateforme DNTT v 4.2.1<br/>Habilitation niveau A
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────────────────────
// Officer dashboard
// ─────────────────────────────────────────────────────────────
const OfficerDashboard = ({ lang, onIssue, onOpenBill, onOpenQueue }) => {
  const today = BILLS.filter(b => b.officer.includes('Camara'));
  const pending = BILLS.filter(b => b.status === 'pending');
  const todayTotal = today.reduce((s, b) => s + b.amount, 0);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 18, marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Bureau Conakry · Poste {OFFICER.badge}</div>
          <h1 className="sober-pagehead" style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 32, fontWeight: 500, margin: '6px 0 0', letterSpacing: '-0.01em' }}>
            Bonjour, <i>{OFFICER.name.split(' ')[0]}</i>.
          </h1>
          <div style={{ fontSize: 13, color: '#6B6557', marginTop: 4 }}>Vue d'ensemble — <b>jeudi 30 avril 2026</b> · 09:38 GMT</div>
        </div>
        <button onClick={onIssue} style={primaryBtn()}><Icon name="plus" size={15}/> Émettre un DUT</button>
      </div>

      <div className="sober-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <KpiTile label="Émis aujourd'hui" big={String(today.length)} delta={`+${today.length}`} hint="vs J−1 : 4"/>
        <KpiTile label="En attente paiement" big={String(pending.length)} hint={fmtGNF(pending.reduce((s,b)=>s+b.amount,0))} tone="warn"/>
        <KpiTile label="Recettes du jour" big={(todayTotal/1e6).toFixed(2)} suffix="M GNF" hint="Reversé Trésor : 17h"/>
        <KpiTile label="Habilitation" big="A" hint="Émission · contrôle · verbalisation" tone="good"/>
      </div>

      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
        <section style={paperCard()}>
          <header style={cardHeader()}>
            <h2 style={cardTitle()}>File de DUT à valider</h2>
            <button style={ghostBtn()} onClick={onOpenQueue}>Ouvrir la file →</button>
          </header>
          <table className="sober-stack" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead><tr style={{ color: '#9A9281', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase' }}>
              {['N° DUT','Transporteur','Itinéraire','Marchandise','Montant','Statut'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {BILLS.slice(0, 6).map((b, i) => (
                <tr key={b.id} onClick={() => onOpenBill(b)} style={{ cursor: 'pointer', background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                  <td data-label="N° DUT" style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5 }}>{b.id}</td>
                  <td data-label="Transporteur" style={td()}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {b.transporter}
                      {b.payerKind === 'individual' && (
                        <span style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', padding: '1px 5px', background: '#FFF6E0', color: '#7A5A00', border: '1px solid #E8D38A', fontWeight: 600 }} title="Personne physique">P.P.</span>
                      )}
                    </span>
                  </td>
                  <td data-label="Itinéraire" style={td()}>{b.from} → {b.to}</td>
                  <td data-label="Marchandise" style={td()}>{b.goods}</td>
                  <td data-label="Montant" style={{ ...td(), textAlign: 'right' }}>{fmtGNF(b.amount)}</td>
                  <td data-label="Statut" style={td()}><StatusPill status={b.status} lang={lang}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section style={paperCard()}>
            <header style={cardHeader()}><h2 style={cardTitle()}>Activité de l'équipe</h2></header>
            {[
              { who: 'F. Camara', n: 12, m: 'Vous · 3 280 K GNF' },
              { who: 'M. Sylla', n: 9, m: '2 145 K GNF' },
              { who: 'A. Diaby', n: 7, m: '1 870 K GNF' },
              { who: 'K. Soumah', n: 5, m: '892 K GNF' },
            ].map((p, i) => (
              <div key={p.who} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? '1px solid #E5DDC9' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11 }}>{p.who.split(' ').map(s=>s[0]).join('')}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.who}</div>
                  <div style={{ fontSize: 11, color: '#6B6557' }}>{p.m}</div>
                </div>
                <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 22, fontWeight: 600 }}>{p.n}</div>
              </div>
            ))}
          </section>
          <section style={paperCard()}>
            <header style={cardHeader()}><h2 style={cardTitle()}>Alertes contrôle</h2></header>
            <div style={{ fontSize: 12, color: '#6B6557', lineHeight: 1.7 }}>
              <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: '1px solid #E5DDC9' }}>
                <div style={{ width: 6, alignSelf: 'stretch', background: '#CE1126' }}/>
                <div><b>3 DUT expirés</b> en circulation présumée — RN1 km 218</div>
              </div>
              <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: '1px solid #E5DDC9' }}>
                <div style={{ width: 6, alignSelf: 'stretch', background: '#FCD116' }}/>
                <div><b>Tonnage suspect</b> — DUT-2026-04-08812 (Hydrocarbures)</div>
              </div>
              <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: '1px solid #E5DDC9' }}>
                <div style={{ width: 6, alignSelf: 'stretch', background: '#009460' }}/>
                <div><b>SAFI</b> · réconciliation Trésor terminée pour la veille</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Officer queue
// ─────────────────────────────────────────────────────────────
const OfficerQueue = ({ lang, onOpenBill }) => {
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? BILLS : BILLS.filter(b => b.status === filter);
  return (
    <div>
      <PageHead kicker={`${BILLS.length} DUT cette semaine · poste ${OFFICER.badge}`} title="File de DUT">
        <button style={ghostBtn()}><Icon name="download" size={13}/> Export CSV</button>
        <button style={primaryBtn()}><Icon name="plus" size={14}/> Émettre un DUT</button>
      </PageHead>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['all',`Tous (${BILLS.length})`],['paid',`${t('statusPaid', lang)} (${BILLS.filter(b=>b.status==='paid').length})`],['pending',`${t('statusPending', lang)} (${BILLS.filter(b=>b.status==='pending').length})`],['expired',`${t('statusExpired', lang)} (${BILLS.filter(b=>b.status==='expired').length})`]].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: '6px 12px', border: '1px solid', borderColor: filter===k?'#161413':'#DCD3BD',
            background: filter===k?'#161413':'#fff', color: filter===k?'#FCD116':'#161413',
            fontSize: 12, fontWeight: filter===k?600:500, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2,
          }}>{l}</button>
        ))}
      </div>
      <section style={paperCard()}>
        <table className="sober-stack" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead><tr style={{ color: '#9A9281', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase' }}>
            {['N° DUT','Date','Transporteur','Itinéraire','Marchandise','Agent','Montant','Statut'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((b, i) => (
              <tr key={b.id} onClick={() => onOpenBill(b)} style={{ cursor: 'pointer', background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                <td data-label="N° DUT" style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, fontWeight: 600 }}>{b.id}</td>
                <td data-label="Date" style={td()}>{b.issued}</td>
                <td data-label="Transporteur" style={td()}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {b.transporter}
                    {b.payerKind === 'individual' && (
                      <span style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', padding: '1px 5px', background: '#FFF6E0', color: '#7A5A00', border: '1px solid #E8D38A', fontWeight: 600 }} title="Personne physique">P.P.</span>
                    )}
                  </span>
                </td>
                <td data-label="Itinéraire" style={td()}>{b.from} → {b.to}</td>
                <td data-label="Marchandise" style={td()}>{b.goods}</td>
                <td data-label="Agent" style={td()}>{b.officer}</td>
                <td data-label="Montant" style={{ ...td(), textAlign: 'right' }}>{fmtGNF(b.amount)}</td>
                <td data-label="Statut" style={td()}><StatusPill status={b.status} lang={lang}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Officer bill detail
// ─────────────────────────────────────────────────────────────
const OfficerBillDetail = ({ lang, bill, onClose }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Détail facture · {bill.officer}</div>
        <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>{bill.id}</h1>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={ghostBtn()} onClick={onClose}>← Retour à la file</button>
        <button style={ghostBtn()}><Icon name="download" size={13}/> {t('print', lang)}</button>
        {bill.status !== 'paid' && <button style={{ ...primaryBtn(), background: '#CE1126', color: '#fff', borderColor: '#CE1126' }}>Annuler ce DUT</button>}
      </div>
    </div>
    <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
      <section style={paperCard(true)}>
        <header style={cardHeader()}><h2 style={cardTitle()}>Informations DUT</h2><StatusPill status={bill.status} lang={lang}/></header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <SummaryRow label={bill.payerKind === 'individual' ? (lang==='en'?'Individual':'Personne physique') : (lang==='en'?'Legal entity':'Personne morale')} value={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {bill.transporter}
              <span style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', padding: '2px 6px', background: bill.payerKind === 'individual' ? '#FFF6E0' : '#161413', color: bill.payerKind === 'individual' ? '#7A5A00' : '#FCD116', border: bill.payerKind === 'individual' ? '1px solid #E8D38A' : '1px solid #161413', fontWeight: 600 }}>
                {bill.payerKind === 'individual' ? (lang==='en'?'Indiv.':'P.P.') : (lang==='en'?'Legal':'P.M.')}
              </span>
            </span>
          }/>
          <SummaryRow label={bill.payerKind === 'individual' ? 'CNI / NIF' : 'RCCM / NIF'} value={bill.payerId || bill.transporterId} mono/>
          <SummaryRow label="Itinéraire" value={`${bill.from} → ${bill.to}`}/>
          <SummaryRow label="Marchandise" value={bill.goods}/>
          <SummaryRow label="Date d'émission" value={bill.issued}/>
          <SummaryRow label="Agent émetteur" value={bill.officer}/>
        </div>
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #E5DDC9' }}>
          <h3 style={{ ...cardTitle(), fontSize: 14, marginBottom: 8 }}>Décomposition</h3>
          <SummaryRow label={t('fee', lang)} value={fmtGNF(Math.round(bill.amount * 0.91))}/>
          <SummaryRow label={t('stamp', lang)} value={fmtGNF(25000)}/>
          <SummaryRow label={t('dnttShare', lang)} value={fmtGNF(8000)}/>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '2px solid #161413', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6557' }}>{t('total', lang)}</span>
            <span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 24, fontWeight: 600 }}>{fmtGNF(bill.amount)}</span>
          </div>
        </div>
      </section>
      <section style={paperCard(true)}>
        <header style={cardHeader()}><h2 style={cardTitle()}>Journal d'audit</h2></header>
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 1, background: '#E5DDC9' }}/>
          {[
            { time: bill.issued + ' 14:32', who: bill.officer, what: 'DUT émis', tone: 'good' },
            { time: bill.issued + ' 14:32', who: 'Système', what: 'Notifications SMS + email envoyées au transporteur' },
            ...(bill.status === 'paid' ? [
              { time: bill.issued + ' 16:08', who: 'KKiaPay', what: `Paiement reçu — ${fmtGNF(bill.amount)}`, tone: 'good' },
              { time: bill.issued + ' 16:09', who: 'Système', what: 'Reçu PDF généré et tampon "PAYÉ" apposé', tone: 'good' },
            ] : bill.status === 'pending' ? [
              { time: '29/04/2026 08:00', who: 'Système', what: 'Rappel automatique J−1' },
              { time: 'Maintenant', who: 'Système', what: 'En attente de règlement', tone: 'warn' },
            ] : [
              { time: '28/04/2026 18:00', who: 'Système', what: 'Échéance dépassée — DUT expiré', tone: 'bad' },
            ]),
          ].map((e, i) => (
            <div key={i} style={{ position: 'relative', padding: '10px 0', borderTop: i ? '1px solid #F0E9D6' : 'none' }}>
              <div style={{ position: 'absolute', left: -19, top: 14, width: 11, height: 11, borderRadius: '50%', background: e.tone==='good'?'#009460':e.tone==='warn'?'#FCD116':e.tone==='bad'?'#CE1126':'#9A9281', border: '2px solid #fff', boxShadow: '0 0 0 1px #DCD3BD' }}/>
              <div style={{ fontSize: 10.5, color: '#9A9281', fontFamily: '"JetBrains Mono", monospace' }}>{e.time}</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{e.what}</div>
              <div style={{ fontSize: 11, color: '#6B6557' }}>par {e.who}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

Object.assign(window, { SoberOfficerApp });

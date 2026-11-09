// SOBER, Transporter platform (company). Pays the DUTs issued by the DNTT,
// follows its fleet, generates pairing codes for the drivers' phones.
// Everything is read from and written to the shared store (store.jsx).

const COMPANY_ID = 'TRP-04812';

const SoberTransporterApp = ({ lang: lang0 = 'fr', density = 'comfortable', transporterId = COMPANY_ID, initialScreen = 'dashboard' }) => {
  const [lang, setLang] = React.useState(lang0);
  React.useEffect(() => setLang(lang0), [lang0]);
  const [nav, setNav] = React.useState({ screen: initialScreen, id: null, ids: null });
  const go = (screen, id = null, ids = null) => setNav({ screen, id, ids });
  const s = useDut();
  const pad = density === 'compact' ? 14 : 22;
  const due = sel.billsOf(s, transporterId).filter(b => b.status === 'pending');
  const screen = nav.screen;
  return (
    <ToastHost>
      <div className="sober-root" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#F7F3EB', color: '#161413', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13.5, lineHeight: 1.5, overflow: 'hidden', position: 'relative' }}>
        <FlagBar height={3}/>
        <SoberTopBar lang={lang} setLang={setLang} transporterId={transporterId} go={go}/>
        <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
          <SoberTransporterSidebar lang={lang} screen={screen} go={go} due={due.length} transporterId={transporterId}/>
          <main style={{ flex: 1, overflow: 'auto', padding: `${pad + 6}px ${pad + 14}px`, position: 'relative' }}>
            {screen === 'dashboard' && <SoberDashboard lang={lang} go={go} transporterId={transporterId}/>}
            {screen === 'payments' && <TransporterPayments lang={lang} go={go} transporterId={transporterId}/>}
            {screen === 'pay' && <TransporterPay lang={lang} go={go} transporterId={transporterId} ids={nav.ids}/>}
            {screen === 'dut' && <TransporterDut lang={lang} go={go} transporterId={transporterId} billId={nav.id}/>}
            {screen === 'history' && <TransporterHistory lang={lang} go={go} transporterId={transporterId}/>}
            {screen === 'fleet' && <TransporterFleet transporterId={transporterId} go={go}/>}
            {screen === 'tracking' && <TransporterTracking key={nav.id || 'x'} transporterId={transporterId} initialId={nav.id} lang={lang}/>}
            {screen === 'profile' && <TransporterProfile transporterId={transporterId}/>}
            {screen === 'support' && <TransporterSupport/>}
            {screen === 'settings' && <TransporterSettings transporterId={transporterId}/>}
          </main>
          <SoberBottomNav screen={screen === 'pay' || screen === 'dut' ? 'payments' : screen} setScreen={(id) => go(id)} items={[
            { id: 'dashboard', icon: 'home', label: lang === 'en' ? 'Home' : 'Accueil' },
            { id: 'payments', icon: 'coin', label: lang === 'en' ? 'Pay' : 'Régler', badge: due.length || null },
            { id: 'fleet', icon: 'truck', label: t('fleet', lang) },
            { id: 'tracking', icon: 'pin', label: 'Suivi' },
            { id: 'profile', icon: 'user', label: 'Compte' },
          ]}/>
        </div>
        <ChatbotBadge role="company" lang={lang}/>
      </div>
    </ToastHost>
  );
};

// Top bar: République de Guinée brand + search + language + notifications + account.
const SoberTopBar = ({ lang, setLang, transporterId, go }) => {
  const s = useDut();
  const tr = sel.transporter(s, transporterId);
  return (
    <header className="sober-topbar" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', background: '#FBF8F2', borderBottom: '1px solid #E5DDC9' }}>
      <GovBrand title={t('appName', lang)} subtitle="Plateforme officielle, espace transporteur"/>
      <div style={{ flex: 1 }}/>
      <DutSearch scope={transporterId} width={250} placeholder="Rechercher un DUT, une plaque…" onPick={(r) => go('dut', r.id)}/>
      <div className="sober-topbar-user-text"><LangSwitch lang={lang} setLang={setLang}/></div>
      <NotificationBell to={transporterId} onOpen={(n) => n.billId ? (n.kind === 'track' ? go('tracking', n.billId) : go('dut', n.billId)) : go('profile')}/>
      <button onClick={() => go('profile')} className="sober-topbar-user-text" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14, borderLeft: '1px solid #DCD3BD', background: 'none', borderTop: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: 'inherit' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>{tr.contact.split(' ').map(x => x[0]).slice(0, 2).join('')}</div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontWeight: 600, fontSize: 12.5 }}>{tr.contact}</div>
          <div style={{ fontSize: 11, color: '#6B6557' }}>{tr.short}</div>
        </div>
      </button>
    </header>
  );
};

const SoberTransporterSidebar = ({ lang, screen, go, due, transporterId }) => {
  const s = useDut();
  const toast = useToast();
  const is = (id) => screen === id || (id === 'payments' && (screen === 'pay' || screen === 'dut'));
  return (
    <aside className="sober-nav" style={{ width: 230, background: '#FBF8F2', borderRight: '1px solid #E5DDC9', padding: '4px 0 14px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <NavHead>{t('carrierSpace', lang)}</NavHead>
      <NavItem accent="#CE1126" icon="home" label={t('dashboard', lang)} active={is('dashboard')} onClick={() => go('dashboard')}/>
      <NavItem accent="#CE1126" icon="coin" label={lang === 'en' ? 'Pay bills' : 'Régler mes DUT'} badge={due} active={is('payments')} onClick={() => go('payments')}/>
      <NavItem accent="#CE1126" icon="doc" label="Historique des DUT" active={is('history')} onClick={() => go('history')}/>
      <NavItem accent="#CE1126" icon="truck" label={t('fleet', lang)} active={is('fleet')} onClick={() => go('fleet')}/>
      <NavItem accent="#CE1126" icon="pin" label="Suivi des véhicules" active={is('tracking')} onClick={() => go('tracking')}/>
      <NavHead>Compte</NavHead>
      <NavItem accent="#CE1126" icon="user" label="Profil et paiement" active={is('profile')} onClick={() => go('profile')}/>
      <NavItem accent="#CE1126" icon="gear" label={t('settings', lang)} active={is('settings')} onClick={() => go('settings')}/>
      <NavItem accent="#CE1126" icon="help" label={t('support', lang)} active={is('support')} onClick={() => go('support')}/>
      <div style={{ flex: 1 }}/>
      <div className="sober-navfooter" style={{ margin: '10px 14px', padding: 12, background: '#161413', color: '#F7F3EB' }}>
        <div style={{ fontSize: 10, letterSpacing: '.18em', color: '#FCD116' }}>RAPPEL</div>
        <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 14, marginTop: 4, lineHeight: 1.3 }}>Carte transporteur : expire le 07/06/2026</div>
        <button onClick={() => toast('Demande de renouvellement envoyée à la DNTT')} style={{ marginTop: 8, fontSize: 11, background: 'transparent', border: '1px solid #6B6557', color: '#F7F3EB', padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Demander le renouvellement →</button>
      </div>
      <div className="sober-navfooter" style={{ padding: '10px 14px', fontSize: 10, color: '#9A9281', borderTop: '1px solid #E5DDC9' }}>{DNTT_HQ.name}<br/>{DNTT_HQ.address}</div>
    </aside>
  );
};

// ─── Dashboard ─────────────────────────────────────────────────────
const SoberDashboard = ({ lang, go, transporterId }) => {
  const s = useDut();
  const tr = sel.transporter(s, transporterId);
  const bills = [...sel.billsOf(s, transporterId)].sort((a, b) => b.issuedAt - a.issuedAt);
  const due = bills.filter(b => b.status === 'pending');
  const overdue = due.filter(sel.isOverdue);
  const month = bills.filter(b => new Date(b.issuedAt).getMonth() === new Date(demoNow()).getMonth());
  const paidMonth = month.filter(b => b.status === 'paid');
  const onRoad = bills.filter(b => sel.tripState(s, b.id) === 'in_progress');
  const vehicles = sel.vehiclesOf(s, transporterId);
  const notifs = sel.notifs(s, transporterId).slice(0, 4);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 18, marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={eyebrow}>{t('carrierSpace', lang)}, {tr.id}</div>
          <h1 style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 32, fontWeight: 500, margin: '6px 0 0' }}>{t('welcome', lang)}, <i>{tr.contact.split(' ').slice(-2).join(' ')}</i>.</h1>
          <div style={{ fontSize: 13, color: '#6B6557', marginTop: 4 }}>{due.length ? `${due.length} DUT à régler, ${fmtGNF(due.reduce((x, b) => x + b.amount, 0))}` : 'Tous vos DUT sont réglés.'}</div>
        </div>
        <button onClick={() => go('payments')} style={primaryBtn()}><Icon name="coin" size={15}/> Régler mes DUT</button>
      </div>
      {overdue.map(b => (
        <div key={b.id} style={{ marginBottom: 14, padding: 14, background: '#FCEAEA', border: '1px solid #E8B6B6', borderLeft: '3px solid #CE1126', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Icon name="bell" size={18} style={{ color: '#CE1126' }}/>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 600, color: '#8A1B1B' }}>Paiement en retard : {b.id}</div>
            <div style={{ fontSize: 12, color: '#6B4444' }}>{fmtGNF(b.amount)}, échéance dépassée le {fmtD(b.due)}. Régularisez pour éviter l’immobilisation du véhicule {b.vehicle}.</div>
          </div>
          <button onClick={() => go('pay', null, [b.id])} style={{ fontSize: 12, background: '#CE1126', color: '#fff', border: 'none', padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Payer maintenant</button>
        </div>
      ))}
      <div className="sober-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 22 }}>
        <KpiTile label="DUT ce mois" big={String(month.length)} hint={`Prix fixe ${fmtEur(TARIFF.priceEur)} par DUT`}/>
        <KpiTile label="À régler" big={String(due.length)} hint={fmtGNF(due.reduce((x, b) => x + b.amount, 0))} tone="warn"/>
        <KpiTile label="Payé ce mois" big={fmtGNF(paidMonth.reduce((x, b) => x + b.amount, 0)).replace(' GNF', '')} suffix="GNF" hint={`${paidMonth.length} paiement(s)`}/>
        <KpiTile label="Véhicules en route" big={String(onRoad.length)} hint={`${vehicles.length} véhicules dans la flotte`}/>
      </div>
      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 22 }}>
        <section style={paperCard()}>
          <header style={cardHeader()}><h2 style={cardTitle()}>{t('recentDocs', lang)}</h2><button style={ghostBtn()} onClick={() => go('history')}>{t('seeAll', lang)} →</button></header>
          <BillsTable bills={bills.slice(0, 6)} onOpen={(b) => go('dut', b.id)} lang={lang}/>
        </section>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section style={paperCard()}>
            <header style={cardHeader()}><h2 style={cardTitle()}>En route</h2><button style={ghostBtn()} onClick={() => go('tracking')}>Suivi →</button></header>
            {onRoad.length === 0 && <div style={{ fontSize: 12.5, color: '#6B6557' }}>Aucun véhicule suivi. Générez un code de jumelage après paiement.</div>}
            {onRoad.map(b => (
              <button key={b.id} onClick={() => go('tracking', b.id)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><b style={monoStyle}>{b.vehicle}</b><TripStatus billId={b.id}/></div>
                <div style={{ fontSize: 11.5, color: '#6B6557' }}>{b.from} → {b.to}, {b.driver}</div>
                <TripTimeline billId={b.id} compact/>
              </button>
            ))}
          </section>
          <section style={paperCard()}>
            <header style={cardHeader()}><h2 style={cardTitle()}>{t('notifications', lang)}</h2></header>
            {notifs.map((n, i) => (
              <button key={n.id} onClick={() => n.billId && go(n.kind === 'track' ? 'tracking' : 'dut', n.billId)} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: i ? '1px solid #E5DDC9' : 'none', width: '100%', textAlign: 'left', background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: n.billId ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                <span style={{ width: 6, alignSelf: 'stretch', background: n.kind === 'warn' ? '#CE1126' : n.kind === 'paid' ? '#009460' : n.kind === 'track' ? '#FCD116' : '#161413' }}/>
                <span><span style={{ display: 'block', fontSize: 12.5, fontWeight: n.read ? 400 : 600 }}>{n.text}</span><span style={{ display: 'block', fontSize: 11, color: '#9A9281' }}>{fmtAgo(n.at)}</span></span>
              </button>
            ))}
          </section>
        </div>
      </div>
      <footer style={{ marginTop: 28, paddingTop: 14, borderTop: '1px solid #E5DDC9', fontSize: 11, color: '#9A9281', display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div>République de Guinée, « <i>Travail, Justice, Solidarité</i> »</div>
        <div>{DNTT_HQ.name}, {DNTT_HQ.address}</div>
      </footer>
    </div>
  );
};

// ─── Bills to pay ──────────────────────────────────────────────────
const TransporterPayments = ({ lang, go, transporterId }) => {
  const s = useDut();
  const tr = sel.transporter(s, transporterId);
  const due = sel.billsOf(s, transporterId).filter(b => b.status === 'pending').sort((a, b) => a.due - b.due);
  const [picked, setPicked] = React.useState(due.map(b => b.id));
  const total = due.filter(b => picked.includes(b.id)).reduce((x, b) => x + b.amount, 0);
  return (
    <div>
      <PageHead kicker="Émis par la DNTT, à régler en ligne" title="Mes DUT à régler">
        {due.length > 0 && <button style={{ ...primaryBtn(), opacity: picked.length ? 1 : .5 }} disabled={!picked.length} onClick={() => go('pay', null, picked)}><Icon name="coin" size={14}/> Régler la sélection ({fmtGNF(total)})</button>}
      </PageHead>
      {tr.payAccount && tr.payAccount.mandate && <div style={{ padding: 12, background: '#E8F2EA', border: '1px solid #B9D6BF', fontSize: 12.5, marginBottom: 16 }}>Prélèvement autorisé sur votre compte {PROVIDERS[tr.payAccount.provider].label} {maskPhone(tr.payAccount.number)} : l’agent DNTT peut aussi régler ces DUT pour vous. <button onClick={() => go('profile')} style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>Gérer</button></div>}
      {due.length === 0 && <section style={{ ...paperCard(true), textAlign: 'center' }}><Icon name="check" size={28} style={{ color: '#009460' }}/><div style={{ fontWeight: 600, marginTop: 6 }}>Aucun DUT à régler.</div><div style={{ fontSize: 12.5, color: '#6B6557' }}>Les nouveaux DUT émis par la DNTT apparaîtront ici.</div></section>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {due.map(b => {
          const on = picked.includes(b.id);
          return (
            <div key={b.id} style={{ ...paperCard(), display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', borderLeft: sel.isOverdue(b) ? '3px solid #CE1126' : '1px solid #E5DDC9' }}>
              <input type="checkbox" checked={on} aria-label={`Sélectionner ${b.id}`} onChange={() => setPicked(p => on ? p.filter(x => x !== b.id) : [...p, b.id])} style={{ accentColor: '#CE1126', width: 18, height: 18 }}/>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><b style={monoStyle}>{b.id}</b><DutStatus bill={b} lang={lang}/></div>
                <div style={{ fontSize: 12.5, marginTop: 2 }}>{b.from} → {b.to}, {b.goods}, {b.vehicle}</div>
                <div style={{ fontSize: 11.5, color: '#6B6557' }}>Émis le {fmtD(b.issuedAt)} par {b.officer}, échéance {fmtDT(b.due)}</div>
              </div>
              <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 20, fontWeight: 600 }}>{fmtGNF(b.amount)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={ghostBtn()} onClick={() => go('dut', b.id)}>Voir</button>
                <button style={primaryBtn()} onClick={() => go('pay', null, [b.id])}>Payer</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TransporterPay = ({ lang, go, transporterId, ids }) => {
  const s = useDut();
  const bills = (ids || []).map(id => sel.bill(s, id)).filter(Boolean);
  const [snapshot] = React.useState(bills);
  if (!snapshot.length) return <div><button style={ghostBtn()} onClick={() => go('payments')}>← Retour</button></div>;
  return (
    <div>
      <PageHead kicker="Paiement sécurisé" title={snapshot.length > 1 ? `Régler ${snapshot.length} DUT` : `Régler ${snapshot[0].id}`}><button style={ghostBtn()} onClick={() => go('payments')}>← Retour</button></PageHead>
      <SelfPayPanel bills={snapshot} transporterId={transporterId} lang={lang} onCancel={() => go('payments')} onDone={(bs) => go('dut', bs[0].id)}/>
    </div>
  );
};

// ─── DUT view: document + actions + tracking ───────────────────────
const TransporterDut = ({ lang, go, transporterId, billId }) => {
  const s = useDut();
  const [print, setPrint] = React.useState(false);
  const b = sel.bill(s, billId);
  if (!b) return null;
  return (
    <div>
      <PageHead kicker={`${b.status === 'paid' ? 'Document payé' : 'Document'}, émis le ${fmtD(b.issuedAt)}`} title={b.id}>
        <button style={ghostBtn()} onClick={() => go('history')}>← Historique</button>
        <button style={ghostBtn()} onClick={() => setPrint(true)}><Icon name="download" size={13}/> Imprimer ou PDF</button>
        {b.status === 'pending' && <button style={primaryBtn()} onClick={() => go('pay', null, [b.id])}><Icon name="coin" size={13}/> Régler {fmtGNF(b.amount)}</button>}
      </PageHead>
      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 360px)', gap: 22, alignItems: 'start' }}>
        <DutDocument bill={b} lang={lang}/>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <section style={paperCard()}>
            <div style={{ ...eyebrow, marginBottom: 8 }}>État</div>
            <DutStatus bill={b} lang={lang}/>
            <div style={{ marginTop: 10 }}><AuditTrail billId={b.id}/></div>
          </section>
          {(b.status === 'paid' || b.status === 'pending') && <PairingCard billId={b.id} actor="company" lang={lang} compact/>}
        </aside>
      </div>
      {print && <PrintDutModal bill={b} onClose={() => setPrint(false)} lang={lang}/>}
    </div>
  );
};

// ─── History ───────────────────────────────────────────────────────
const TransporterHistory = ({ lang, go, transporterId }) => {
  const s = useDut();
  const toast = useToast();
  const [filter, setFilter] = React.useState('all');
  const all = [...sel.billsOf(s, transporterId)].sort((a, b) => b.issuedAt - a.issuedAt);
  const list = filter === 'all' ? all : all.filter(b => b.status === filter);
  return (
    <div>
      <PageHead kicker={`${all.length} DUT`} title="Historique des DUT">
        <button style={ghostBtn()} onClick={() => { downloadCsv('mes-dut.csv', [['N° DUT', 'Émis le', 'Départ', 'Arrivée', 'Véhicule', 'Montant GNF', 'Statut'], ...list.map(b => [b.id, fmtD(b.issuedAt), b.from, b.to, b.vehicle, b.amount, b.status])]); toast('Relevé CSV téléchargé'); }}><Icon name="download" size={13}/> Télécharger le relevé</button>
      </PageHead>
      <FilterChips value={filter} onChange={setFilter} options={[['all', 'Tous'], ['pending', 'À régler'], ['paid', 'Payés'], ['expired', 'Expirés'], ['cancelled', 'Annulés']]}/>
      <section style={paperCard()}><BillsTable bills={list} onOpen={(b) => go('dut', b.id)} lang={lang}/></section>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Small reusable bits
// ─────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: 14 }}>
    <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6B6557', marginBottom: 5 }}>{label}</div>
    {children}
  </label>
);
const FieldRow = ({ children }) => (
  <div className="sober-fieldrow" style={{ display: 'grid', gridTemplateColumns: `repeat(${React.Children.count(children)}, minmax(0, 1fr))`, gap: 14 }}>{children}</div>
);
const Input = (p) => (
  <input {...p} onChange={(e) => p.onChange?.(e.target.value)} style={{
    width: '100%', padding: '9px 11px', border: '1px solid #DCD3BD', background: '#fff',
    borderRadius: 2, fontFamily: 'inherit', fontSize: 13, color: '#161413', outline: 'none',
    boxSizing: 'border-box',
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
const Radio = ({ name, options, default: def }) => {
  const [v, setV] = React.useState(def);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map((o) => {
        const sel = v === o;
        return (
          <button key={o} onClick={() => setV(o)} style={{
            padding: '8px 14px', border: '1px solid', borderColor: sel ? '#161413' : '#DCD3BD',
            background: sel ? '#161413' : '#fff', color: sel ? '#FCD116' : '#161413',
            borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: sel ? 600 : 500,
          }}>{o}</button>
        );
      })}
    </div>
  );
};
const SummaryRow = ({ label, value, mono }) => (
  <div className="sober-summaryrow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '5px 0', fontSize: 12.5 }}>
    <span className="sober-summaryrow-k" style={{ color: '#6B6557', flexShrink: 0 }}>{label}</span>
    <span className="sober-summaryrow-v" style={{ fontFamily: mono ? '"JetBrains Mono", monospace' : 'inherit', fontVariantNumeric: 'tabular-nums', textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{value}</span>
  </div>
);
const KpiTile = ({ label, big, suffix, hint, delta, tone }) => (
  <div style={{ background: '#FBF8F2', border: '1px solid #E5DDC9', padding: 16 }}>
    <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9A9281' }}>{label}</div>
    <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 30, fontWeight: 600, marginTop: 6, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
      {big} {suffix && <span style={{ fontSize: 14, color: '#6B6557', fontWeight: 500 }}>{suffix}</span>}
    </div>
    <div style={{ marginTop: 8, fontSize: 11.5, color: tone === 'warn' ? '#8A1B1B' : '#6B6557', display: 'flex', gap: 6 }}>
      {delta && <span style={{ background: '#009460', color: '#fff', padding: '0 5px', fontSize: 10.5, fontWeight: 600 }}>{delta}</span>}
      {hint}
    </div>
  </div>
);
const StatusPill = ({ status, lang = 'fr' }) => {
  const labels = {
    paid:    t('statusPaid', lang),
    pending: t('statusPending', lang),
    expired: t('statusExpired', lang),
  };
  const m = {
    paid:    { bg: '#E8F2EA', fg: '#1F4F2C' },
    pending: { bg: '#FFF6D6', fg: '#73591F' },
    expired: { bg: '#FCEAEA', fg: '#8A1B1B' },
  }[status];
  return <span style={{ background: m.bg, color: m.fg, padding: '3px 8px', fontSize: 10.5, fontWeight: 600, letterSpacing: '.04em' }}>{labels[status]}</span>;
};

const ReviewBlock = ({ title, children }) => (
  <div style={{ marginBottom: 14, padding: 14, background: '#FBF8F2', border: '1px solid #E5DDC9' }}>
    <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px 18px' }}>{children}</div>
  </div>
);
const ReviewLine = ({ k, v, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #DCD3BD', padding: '4px 0', fontSize: 12.5 }}>
    <span style={{ color: '#6B6557' }}>{k}</span>
    <span style={{ fontFamily: mono ? '"JetBrains Mono", monospace' : 'inherit', fontWeight: 500 }}>{v}</span>
  </div>
);

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
const SignatureBlock = ({ title, name }) => (
  <div>
    <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6B6557' }}>{title}</div>
    <div style={{ height: 50, borderBottom: '1px solid #6B6557', marginTop: 6, position: 'relative' }}>
      <span style={{ position: 'absolute', left: 0, top: 14, fontFamily: '"Caveat", "Brush Script MT", cursive', fontSize: 22, color: '#1A2B6A' }}>{name}</span>
    </div>
    <div style={{ fontSize: 10.5, color: '#6B6557', marginTop: 4 }}>{name}</div>
  </div>
);

const FauxQr = () => {
  // tiny pseudo-random QR pattern
  const cells = React.useMemo(() => {
    const seed = 19;
    const rng = (i) => ((i * 9301 + 49297 + seed) % 233280) / 233280;
    return Array.from({ length: 144 }, (_, i) => rng(i) > 0.5);
  }, []);
  return (
    <div style={{ width: 80, height: 80, padding: 4, border: '1px solid #161413', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 0, background: '#fff' }}>
      {cells.map((on, i) => {
        const r = Math.floor(i / 12), c = i % 12;
        // finder patterns corners
        const isFinder = (r < 3 && c < 3) || (r < 3 && c > 8) || (r > 8 && c < 3);
        return <div key={i} style={{ width: '100%', aspectRatio: '1/1', background: isFinder ? '#161413' : on ? '#161413' : 'transparent' }} />;
      })}
    </div>
  );
};

// styles
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

// Transporter sidebar: no "drivers" item, fleet/profile/support/settings hooks

// Bottom nav for mobile (used by both Officer + Transporter)
const SoberBottomNav = ({ items, screen, setScreen }) => (
  <div className="sober-bottomnav">
    {items.map(it => (
      <button key={it.id} className={screen === it.id ? 'active' : ''} onClick={() => setScreen(it.id)}>
        <Icon name={it.icon} size={20}/>
        <span>{it.label}</span>
        {it.badge && <span className="sober-bottomnav-badge">{it.badge}</span>}
      </button>
    ))}
  </div>
);


Object.assign(window, { SoberApp: SoberTransporterApp, SoberTransporterApp, SoberTransporterSidebar, SoberBottomNav, SoberTopBar, COMPANY_ID,
  Field, FieldRow, Input, Select, SummaryRow, KpiTile, StatusPill, ReviewBlock, ReviewLine, PdfSection, PdfRow, SignatureBlock, FauxQr, paperCard, cardHeader, cardTitle, td, primaryBtn, ghostBtn });

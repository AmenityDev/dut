// SOBER, Officer (DNTT) platform: issues DUTs, collects payments on behalf
// of transporters, generates pairing codes, follows vehicles on the road.
// All data comes from the shared store (store.jsx).

const SoberOfficerApp = ({ lang: lang0 = 'fr', density = 'comfortable', initialScreen = 'dashboard' }) => {
  const [lang, setLang] = React.useState(lang0);
  React.useEffect(() => setLang(lang0), [lang0]);
  const [nav, setNav] = React.useState({ screen: initialScreen, id: null, prefill: null });
  const go = (screen, id = null, prefill = null) => setNav({ screen, id, prefill });
  const s = useDut();
  const pending = s.bills.filter(b => b.status === 'pending').length;
  const pad = density === 'compact' ? 14 : 22;
  const screen = nav.screen;

  return (
    <ToastHost>
      <div className="sober-root" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#F7F3EB', color: '#161413', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13.5, lineHeight: 1.5, overflow: 'hidden', position: 'relative' }}>
        <FlagBar height={3}/>
        <OfficerTopBar lang={lang} setLang={setLang} go={go}/>
        <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
          <OfficerSidebar lang={lang} screen={screen} go={go} pending={pending}/>
          <main style={{ flex: 1, overflow: 'auto', padding: `${pad + 6}px ${pad + 14}px`, position: 'relative' }}>
            {screen === 'dashboard' && <OfficerDashboard lang={lang} go={go}/>}
            {screen === 'issue' && <OfficerIssue key={JSON.stringify(nav.prefill)} lang={lang} go={go} prefill={nav.prefill}/>}
            {screen === 'queue' && <OfficerQueue lang={lang} go={go}/>}
            {screen === 'bill' && <OfficerBillDetail lang={lang} billId={nav.id} go={go}/>}
            {screen === 'transporters' && <OfficerTransporters lang={lang} go={go}/>}
            {screen === 'transporter' && <OfficerTransporterDetail lang={lang} id={nav.id} go={go}/>}
            {screen === 'vehicles' && <OfficerVehicles lang={lang} go={go}/>}
            {screen === 'controls' && <OfficerControls lang={lang} go={go}/>}
            {screen === 'tariffs' && <OfficerTariffs lang={lang}/>}
            {screen === 'profile' && <OfficerProfile lang={lang}/>}
            {screen === 'settings' && <OfficerSettings lang={lang}/>}
          </main>
          <SoberBottomNav screen={screen === 'bill' ? 'queue' : screen === 'transporter' ? 'transporters' : screen} setScreen={(id) => go(id)} items={[
            { id: 'dashboard', icon: 'home', label: lang === 'en' ? 'Home' : 'Accueil' },
            { id: 'issue', icon: 'plus', label: lang === 'en' ? 'Issue' : 'Émettre' },
            { id: 'queue', icon: 'doc', label: 'DUT', badge: pending || null },
            { id: 'transporters', icon: 'users', label: 'Transp.' },
            { id: 'profile', icon: 'user', label: 'Compte' },
          ]}/>
        </div>
        <ChatbotBadge role="officer" lang={lang}/>
      </div>
    </ToastHost>
  );
};

const OfficerTopBar = ({ lang, setLang, go }) => {
  const s = useDut();
  return (
    <header className="sober-topbar" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', background: '#161413', borderBottom: '1px solid #000', color: '#FBF8F2' }}>
      <GovBrand dark title="Plateforme DNTT : émission des DUT" subtitle="Direction Nationale des Transports Terrestres"/>
      <div style={{ flex: 1 }}/>
      <DutSearch dark width={300} placeholder="Rechercher DUT, transporteur, plaque…" onPick={(r) => go(r.kind === 'bill' ? 'bill' : 'transporter', r.id)}/>
      <div className="sober-topbar-user-text"><LangSwitch lang={lang} setLang={setLang} dark/></div>
      <NotificationBell to="officer" dark onOpen={(n) => n.billId ? go('bill', n.billId) : go('controls')}/>
      <button onClick={() => go('profile')} className="sober-topbar-user-text" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14, borderLeft: '1px solid #3A332A', background: 'transparent', borderTop: 'none', borderRight: 'none', borderBottom: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FCD116', color: '#161413', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>{s.officer.initials}</div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontWeight: 600, fontSize: 12.5 }}>{s.officer.name}</div>
          <div style={{ fontSize: 11, color: '#9A9281', fontFamily: '"JetBrains Mono", monospace' }}>{s.officer.badge}</div>
        </div>
      </button>
    </header>
  );
};

const NavItem = ({ id, icon, label, badge, active, onClick, accent = '#FCD116' }) => (
  <button className="sober-nav-btn" onClick={onClick} aria-current={active ? 'page' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', background: active ? '#fff' : 'transparent', color: active ? '#161413' : '#6B6557', border: 'none', borderLeft: active ? `2px solid ${accent}` : '2px solid transparent', width: '100%', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontWeight: active ? 600 : 500, fontFamily: 'inherit' }}>
    <Icon name={icon} size={17}/>
    <span className="sober-navlabel">{label}</span>
    {badge ? <span className="sober-navbadge" style={{ marginLeft: 'auto', fontSize: 10, background: '#CE1126', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>{badge}</span> : null}
  </button>
);
const NavHead = ({ children }) => <div className="sober-navhead" style={{ padding: '16px 14px 6px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{children}</div>;

const OfficerSidebar = ({ lang, screen, go, pending }) => {
  const s = useDut();
  const onRoad = Object.values(s.trips).filter(t => t.status === 'in_progress').length;
  const is = (id) => screen === id || (id === 'queue' && screen === 'bill') || (id === 'transporters' && screen === 'transporter');
  return (
    <aside className="sober-nav" style={{ width: 230, background: '#FBF8F2', borderRight: '1px solid #E5DDC9', padding: '4px 0 14px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <NavHead>Émission</NavHead>
      <NavItem icon="home" label={t('dashboard', lang)} active={is('dashboard')} onClick={() => go('dashboard')}/>
      <NavItem icon="plus" label="Émettre un DUT" active={is('issue')} onClick={() => go('issue')}/>
      <NavItem icon="doc" label="File de DUT" badge={pending} active={is('queue')} onClick={() => go('queue')}/>
      <NavItem icon="pin" label="Contrôles et suivi" badge={onRoad ? null : null} active={is('controls')} onClick={() => go('controls')}/>
      <NavHead>Référentiel</NavHead>
      <NavItem icon="users" label="Transporteurs" active={is('transporters')} onClick={() => go('transporters')}/>
      <NavItem icon="truck" label="Véhicules" active={is('vehicles')} onClick={() => go('vehicles')}/>
      <NavItem icon="coin" label="Tarif du DUT" active={is('tariffs')} onClick={() => go('tariffs')}/>
      <NavHead>Compte</NavHead>
      <NavItem icon="user" label="Profil" active={is('profile')} onClick={() => go('profile')}/>
      <NavItem icon="gear" label={t('settings', lang)} active={is('settings')} onClick={() => go('settings')}/>
      <div style={{ flex: 1 }}/>
      <div className="sober-navfooter" style={{ margin: '10px 14px', padding: 12, background: '#161413', color: '#F7F3EB' }}>
        <div style={{ fontSize: 10, letterSpacing: '.18em', color: '#FCD116' }}>CAISSE DU JOUR</div>
        <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18, marginTop: 2 }}>{fmtGNF(s.bills.filter(b => b.payment && fmtD(b.payment.at) === fmtD(demoNow())).reduce((x, b) => x + b.amount, 0))}</div>
        <div style={{ fontSize: 11, color: '#C8BFAA', marginTop: 2 }}>Clôture à 18:00 GMT, versement au Trésor</div>
      </div>
      <div className="sober-navfooter" style={{ padding: '10px 14px', fontSize: 10, color: '#9A9281', borderTop: '1px solid #E5DDC9' }}>{DNTT_HQ.address}</div>
    </aside>
  );
};

// ─── Dashboard ─────────────────────────────────────────────────────
const OfficerDashboard = ({ lang, go }) => {
  const s = useDut();
  useTick(5000);
  const today = fmtD(demoNow());
  const issuedToday = s.bills.filter(b => fmtD(b.issuedAt) === today);
  const pending = s.bills.filter(b => b.status === 'pending');
  const paidToday = s.bills.filter(b => b.payment && fmtD(b.payment.at) === today);
  const onRoad = Object.entries(s.trips).filter(([, t]) => t.status === 'in_progress');
  const alerts = sel.notifs(s, 'officer').filter(n => n.kind === 'warn').slice(0, 3);
  const overdue = pending.filter(sel.isOverdue);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 18, marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={eyebrow}>{s.officer.office}, poste {s.officer.badge}</div>
          <h1 className="sober-pagehead" style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 32, fontWeight: 500, margin: '6px 0 0' }}>Bonjour, <i>{s.officer.name.split(' ')[0]}</i>.</h1>
          <div style={{ fontSize: 13, color: '#6B6557', marginTop: 4 }}>Vue d’ensemble du <b>{today}</b>, {fmtT(demoNow())} GMT</div>
        </div>
        <button onClick={() => go('issue')} style={primaryBtn()}><Icon name="plus" size={15}/> Émettre un DUT</button>
      </div>

      <div className="sober-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 22 }}>
        <KpiTile label="Émis aujourd’hui" big={String(issuedToday.length)} hint={`Prix fixe ${fmtEur(TARIFF.priceEur)} par DUT`}/>
        <KpiTile label="En attente de paiement" big={String(pending.length)} hint={`${fmtGNF(pending.reduce((x, b) => x + b.amount, 0))}${overdue.length ? `, dont ${overdue.length} en retard` : ''}`} tone="warn"/>
        <KpiTile label="Encaissé aujourd’hui" big={fmtGNF(paidToday.reduce((x, b) => x + b.amount, 0)).replace(' GNF', '')} suffix="GNF" hint={`${paidToday.length} paiement${paidToday.length > 1 ? 's' : ''}`}/>
        <KpiTile label="Véhicules en route" big={String(onRoad.length)} hint="Suivis par téléphone" tone="good"/>
      </div>

      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 22 }}>
        <section style={paperCard()}>
          <header style={cardHeader()}><h2 style={cardTitle()}>Derniers DUT</h2><button style={ghostBtn()} onClick={() => go('queue')}>Ouvrir la file →</button></header>
          <BillsTable bills={[...s.bills].sort((a, b) => b.issuedAt - a.issuedAt).slice(0, 7)} showTransporter onOpen={(b) => go('bill', b.id)} lang={lang}/>
        </section>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section style={paperCard()}>
            <header style={cardHeader()}><h2 style={cardTitle()}>Véhicules en route</h2><button style={ghostBtn()} onClick={() => go('controls')}>Suivi →</button></header>
            {onRoad.length === 0 && <div style={{ fontSize: 12.5, color: '#6B6557' }}>Aucun véhicule suivi en ce moment.</div>}
            {onRoad.map(([id, t], i) => {
              const b = sel.bill(s, id);
              return (
                <button key={id} onClick={() => go('bill', id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 0', borderTop: i ? '1px solid #E5DDC9' : 'none', background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><b style={{ ...monoStyle, fontSize: 12 }}>{b.vehicle}</b><TripStatus billId={id}/></div>
                  <div style={{ fontSize: 11.5, color: '#6B6557', margin: '2px 0 6px' }}>{b.from} → {b.to}, {b.driver}</div>
                  <div style={{ height: 4, background: '#F0E9D6' }}><div style={{ height: 4, width: `${t.progress * 100}%`, background: t.offline ? '#FCD116' : '#009460', transition: 'width .8s linear' }}/></div>
                </button>
              );
            })}
          </section>
          <section style={paperCard()}>
            <header style={cardHeader()}><h2 style={cardTitle()}>Alertes</h2></header>
            {overdue.map(b => (
              <button key={b.id} onClick={() => go('bill', b.id)} style={{ display: 'flex', gap: 10, padding: '9px 0', borderTop: '1px solid #E5DDC9', width: '100%', textAlign: 'left', background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                <span style={{ width: 6, alignSelf: 'stretch', background: '#CE1126' }}/><span><b>Paiement en retard</b> : {b.id}, {(sel.transporter(s, b.transporterId) || {}).short}</span>
              </button>
            ))}
            {alerts.map(n => (
              <button key={n.id} onClick={() => n.billId ? go('bill', n.billId) : go('controls')} style={{ display: 'flex', gap: 10, padding: '9px 0', borderTop: '1px solid #E5DDC9', width: '100%', textAlign: 'left', background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                <span style={{ width: 6, alignSelf: 'stretch', background: '#FCD116' }}/><span>{n.text}</span>
              </button>
            ))}
            {overdue.length + alerts.length === 0 && <div style={{ fontSize: 12.5, color: '#6B6557' }}>Aucune alerte.</div>}
          </section>
        </div>
      </div>
    </div>
  );
};

// ─── Issue wizard ──────────────────────────────────────────────────
const OfficerIssue = ({ lang, go, prefill }) => {
  const s = useDut();
  const toast = useToast();
  const [step, setStep] = React.useState(0);
  const [newTr, setNewTr] = React.useState(false);
  const firstTr = (prefill && prefill.transporterId) || 'TRP-04812';
  const firstVeh = sel.vehiclesOf(s, firstTr)[0];
  const [f, setF] = React.useState({ kind: (sel.transporter(s, firstTr) || {}).kind || 'company', transporterId: firstTr, from: 'Kamsar', to: 'Conakry', goodsCode: 'BAUX', qty: 30, unit: 'tonnes', value: 18000000, vehicle: firstVeh ? firstVeh.plate : '', driver: firstVeh ? firstVeh.driver : '', departure: new Date(demoNow()).toISOString().slice(0, 10), note: '' });
  const [nt, setNt] = React.useState({ kind: 'company', short: '', contact: '', doc: '', phone: '+224 6', city: 'Conakry', address: '' });
  const [nv, setNv] = React.useState({ plate: '', brand: '', type: 'Semi-remorque', driver: '', driverPhone: '+224 6' });
  const [addVeh, setAddVeh] = React.useState(false);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const tr = sel.transporter(s, f.transporterId);
  const vehicles = sel.vehiclesOf(s, f.transporterId);
  const goods = DUT_GOODS.find(g => g.code === f.goodsCode);
  const km = roadKm(f.from, f.to);
  const STEPS = ['Transporteur', 'Trajet et marchandise', 'Véhicule et conducteur', 'Récapitulatif'];

  const pickTransporter = (id) => {
    const v = sel.vehiclesOf(s, id)[0];
    setF(x => ({ ...x, transporterId: id, vehicle: v ? v.plate : '', driver: v ? v.driver : '' }));
  };
  const createTransporter = () => {
    const id = (nt.kind === 'company' ? 'TRP-' : 'IND-') + String(Math.floor(10000 + Math.random() * 89999));
    dutActions.addTransporter({ id, kind: nt.kind, name: nt.kind === 'company' ? nt.short.toUpperCase() : nt.short, short: nt.short, contact: nt.contact || nt.short, doc: nt.doc, nif: '', city: nt.city, address: nt.address || nt.city, phone: nt.phone, email: '', since: 2026, payAccount: null });
    setNewTr(false); pickTransporter(id); toast(`Transporteur ${nt.short} enregistré (${id})`);
  };
  const createVehicle = () => {
    const plate = nv.plate.toUpperCase().trim();
    dutActions.addVehicle({ ...nv, plate, transporterId: f.transporterId, year: 2020, capacity: 20, status: 'active' });
    setF(x => ({ ...x, vehicle: plate, driver: nv.driver })); setAddVeh(false); toast(`Véhicule ${plate} ajouté au registre`);
  };
  const canNext = [!!tr && !newTr, f.from !== f.to && f.qty > 0, !!f.vehicle && !!f.driver, true][step];
  const submit = (collectNow) => {
    const b = dutActions.issueBill({ ...f, departure: new Date(f.departure).getTime() || demoNow() });
    const auto = tr.payAccount && tr.payAccount.mandate && tr.payAccount.autoPay;
    toast(auto ? `${b.id} émis. Paiement automatique en cours sur le compte du transporteur…` : `${b.id} émis, notification envoyée au transporteur`);
    go('bill', b.id);
  };
  const card = (on) => ({ textAlign: 'left', padding: '12px 14px', cursor: 'pointer', background: on ? '#161413' : '#fff', color: on ? '#FCD116' : '#161413', border: on ? '1px solid #161413' : '1px solid #E5DDC9', fontFamily: 'inherit', display: 'flex', gap: 10, alignItems: 'center' });

  return (
    <div>
      <PageHead kicker={`Nouveau DUT, étape ${step + 1} sur ${STEPS.length}`} title={STEPS[step]}><button onClick={() => go('dashboard')} style={ghostBtn()}>Annuler</button></PageHead>
      <ol className="dut-stepper" style={{ display: 'flex', listStyle: 'none', padding: 0, margin: '0 0 22px', gap: 6, flexWrap: 'wrap' }}>
        {STEPS.map((x, i) => (
          <li key={x} style={{ flex: '1 1 120px' }}>
            <button onClick={() => i < step && setStep(i)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: i < step ? 'pointer' : 'default', fontFamily: 'inherit', color: i === step ? '#161413' : i < step ? '#6B6557' : '#B5AC97' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: i === step ? '#161413' : i < step ? '#009460' : 'transparent', border: '1px solid', borderColor: i === step ? '#161413' : i < step ? '#009460' : '#B5AC97', color: i <= step ? '#fff' : '#B5AC97', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{i < step ? <Icon name="check" size={12} stroke={2.4}/> : i + 1}</span>
              <span style={{ fontSize: 12, fontWeight: i === step ? 600 : 500, textAlign: 'left' }}>{x}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
        <section style={paperCard(true)}>
          {step === 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[['company', 'Personne morale', 'Société, RCCM', 'truck'], ['individual', 'Personne physique', 'Particulier, CNI', 'user']].map(([k, ti, su, ic]) => (
                  <button key={k} onClick={() => { set('kind', k); const first = s.transporters.find(x => x.kind === k); if (first) pickTransporter(first.id); setNt(x => ({ ...x, kind: k })); }} style={card(f.kind === k)}>
                    <Icon name={ic} size={16}/><span><span style={{ display: 'block', fontWeight: 600 }}>{ti}</span><span style={{ display: 'block', fontSize: 11.5, opacity: .8 }}>{su}</span></span>
                  </button>
                ))}
              </div>
              {!newTr && (
                <>
                  <Field label="Transporteur enregistré"><Select value={f.transporterId} onChange={pickTransporter} options={s.transporters.filter(x => x.kind === f.kind).map(x => ({ value: x.id, label: `${x.short} (${x.id}, ${x.city})` }))}/></Field>
                  {tr && (
                    <div style={{ padding: 12, background: '#FBF8F2', border: '1px solid #E5DDC9', fontSize: 12.5, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                      <div><div style={{ ...eyebrow, fontSize: 9.5 }}>{tr.kind === 'company' ? 'RCCM' : 'Pièce'}</div><div style={monoStyle}>{tr.doc}</div></div>
                      <div><div style={{ ...eyebrow, fontSize: 9.5 }}>Contact</div><div>{tr.contact}, {tr.phone}</div></div>
                      <div><div style={{ ...eyebrow, fontSize: 9.5 }}>Paiement</div><div>{tr.payAccount ? `${PROVIDERS[tr.payAccount.provider].label}${tr.payAccount.mandate ? ', prélèvement autorisé' : ''}${tr.payAccount.autoPay ? ', paiement automatique' : ''}` : 'Aucun compte enregistré'}</div></div>
                    </div>
                  )}
                  <button onClick={() => setNewTr(true)} style={{ ...ghostBtn(), marginTop: 12 }}><Icon name="plus" size={13}/> Transporteur hors registre</button>
                </>
              )}
              {newTr && (
                <div style={{ padding: 14, border: '1px dashed #DCD3BD', background: '#FBF8F2' }}>
                  <FieldRow><Field label={nt.kind === 'company' ? 'Raison sociale' : 'Nom et prénoms'}><Input value={nt.short} onChange={v => setNt(x => ({ ...x, short: v }))}/></Field><Field label={nt.kind === 'company' ? 'RCCM' : 'N° CNI'}><Input value={nt.doc} onChange={v => setNt(x => ({ ...x, doc: v }))}/></Field></FieldRow>
                  <FieldRow><Field label="Téléphone"><Input value={nt.phone} onChange={v => setNt(x => ({ ...x, phone: v }))}/></Field><Field label="Ville"><Select value={nt.city} onChange={v => setNt(x => ({ ...x, city: v }))} options={DUT_CITIES}/></Field></FieldRow>
                  <div style={{ display: 'flex', gap: 8 }}><button style={primaryBtn()} disabled={!nt.short || !nt.doc} onClick={createTransporter}>Enregistrer le transporteur</button><button style={ghostBtn()} onClick={() => setNewTr(false)}>Annuler</button></div>
                </div>
              )}
            </>
          )}
          {step === 1 && (
            <>
              <FieldRow><Field label="Ville de départ"><Select value={f.from} onChange={v => set('from', v)} options={DUT_CITIES}/></Field><Field label="Ville d’arrivée"><Select value={f.to} onChange={v => set('to', v)} options={DUT_CITIES}/></Field></FieldRow>
              {f.from === f.to && <div style={{ color: '#8A1B1B', fontSize: 12, marginTop: -6, marginBottom: 10 }}>Le départ et l’arrivée doivent être différents.</div>}
              <Field label="Date de départ"><Input type="date" value={f.departure} onChange={v => set('departure', v)}/></Field>
              <div style={{ fontSize: 12, color: '#6B6557', marginBottom: 14 }}>Itinéraire : {routeWaypoints(f.from, f.to).map(w => w.city).join(', ')} (environ {km} km). Le prix du DUT ne dépend pas du trajet.</div>
              <Field label="Nature de la marchandise">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                  {DUT_GOODS.map(g => (
                    <button key={g.code} onClick={() => setF(x => ({ ...x, goodsCode: g.code, unit: g.unit }))} style={{ padding: '10px', textAlign: 'left', background: f.goodsCode === g.code ? '#161413' : '#FBF8F2', color: f.goodsCode === g.code ? '#FCD116' : '#161413', border: '1px solid', borderColor: f.goodsCode === g.code ? '#161413' : '#DCD3BD', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <div style={{ fontSize: 9.5, letterSpacing: '.14em', textTransform: 'uppercase', opacity: .7 }}>{g.cat}</div>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{g.label}</div>
                    </button>
                  ))}
                </div>
              </Field>
              <FieldRow><Field label={`Quantité (${goods.unit})`}><Input type="number" value={f.qty} onChange={v => set('qty', +v)}/></Field><Field label="Valeur déclarée (GNF)"><Input type="number" value={f.value} onChange={v => set('value', +v)}/></Field></FieldRow>
            </>
          )}
          {step === 2 && (
            <>
              <Field label={`Véhicules de ${tr.short}`}>
                <div style={{ border: '1px solid #DCD3BD' }}>
                  {vehicles.length === 0 && <div style={{ padding: 12, fontSize: 12.5, color: '#6B6557' }}>Aucun véhicule enregistré pour ce transporteur.</div>}
                  {vehicles.map((v, i) => (
                    <label key={v.plate} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderTop: i ? '1px solid #E5DDC9' : 'none', background: f.vehicle === v.plate ? '#FBF8F2' : '#fff', cursor: 'pointer' }}>
                      <input type="radio" name="veh" checked={f.vehicle === v.plate} onChange={() => setF(x => ({ ...x, vehicle: v.plate, driver: v.driver }))} style={{ accentColor: '#CE1126' }}/>
                      <span style={{ flex: 1 }}><b style={monoStyle}>{v.plate}</b><span style={{ display: 'block', fontSize: 11.5, color: '#6B6557' }}>{v.type}, {v.brand}, {v.capacity} t, {v.driver}</span></span>
                      {v.status !== 'active' && <span style={{ fontSize: 10.5, color: '#8A1B1B' }}>En maintenance</span>}
                    </label>
                  ))}
                </div>
              </Field>
              {!addVeh ? <button style={ghostBtn()} onClick={() => setAddVeh(true)}><Icon name="plus" size={13}/> Ajouter un véhicule</button> : (
                <div style={{ padding: 14, border: '1px dashed #DCD3BD', background: '#FBF8F2', marginBottom: 12 }}>
                  <FieldRow><Field label="Immatriculation"><Input value={nv.plate} onChange={v => setNv(x => ({ ...x, plate: v }))} placeholder="RC-0000-AA"/></Field><Field label="Marque et modèle"><Input value={nv.brand} onChange={v => setNv(x => ({ ...x, brand: v }))}/></Field></FieldRow>
                  <FieldRow><Field label="Conducteur"><Input value={nv.driver} onChange={v => setNv(x => ({ ...x, driver: v }))}/></Field><Field label="Téléphone du conducteur"><Input value={nv.driverPhone} onChange={v => setNv(x => ({ ...x, driverPhone: v }))}/></Field></FieldRow>
                  <div style={{ display: 'flex', gap: 8 }}><button style={primaryBtn()} disabled={nv.plate.length < 6 || !nv.driver} onClick={createVehicle}>Ajouter</button><button style={ghostBtn()} onClick={() => setAddVeh(false)}>Annuler</button></div>
                </div>
              )}
              <div style={{ marginTop: 12 }}><Field label="Conducteur pour ce trajet"><Input value={f.driver} onChange={v => set('driver', v)}/></Field></div>
              <Field label="Observation (facultatif)"><Input value={f.note} onChange={v => set('note', v)} placeholder="ex. convoi escorté"/></Field>
            </>
          )}
          {step === 3 && (
            <>
              <ReviewBlock title="Transporteur"><ReviewLine k="Nom" v={tr.short}/><ReviewLine k={tr.kind === 'company' ? 'RCCM' : 'CNI'} v={tr.doc} mono/></ReviewBlock>
              <ReviewBlock title="Trajet"><ReviewLine k="Départ" v={f.from}/><ReviewLine k="Arrivée" v={f.to}/><ReviewLine k="Distance" v={`${km} km`}/><ReviewLine k="Date" v={f.departure.split('-').reverse().join('/')}/></ReviewBlock>
              <ReviewBlock title="Marchandise et véhicule"><ReviewLine k="Nature" v={goods.label}/><ReviewLine k="Quantité" v={`${f.qty} ${goods.unit}`}/><ReviewLine k="Véhicule" v={f.vehicle} mono/><ReviewLine k="Conducteur" v={f.driver}/></ReviewBlock>
              {tr.payAccount && tr.payAccount.mandate && tr.payAccount.autoPay && <div style={{ padding: 12, background: '#E8F2EA', border: '1px solid #B9D6BF', fontSize: 12.5, marginBottom: 12 }}><b>Paiement automatique activé</b> par le transporteur : le DUT sera réglé dès l’émission sur son compte {PROVIDERS[tr.payAccount.provider].label}.</div>}
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid #E5DDC9', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => step === 0 ? go('dashboard') : setStep(step - 1)} style={ghostBtn()}>← {step === 0 ? 'Annuler' : 'Retour'}</button>
            {step < 3 ? <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext} style={{ ...primaryBtn(), opacity: canNext ? 1 : .5 }}>Suivant →</button>
              : <button onClick={() => submit()} style={primaryBtn()}><Icon name="check" size={14}/> Émettre le DUT</button>}
          </div>
        </section>
        <aside style={paperCard(true)}>
          <div style={eyebrow}>Montant du DUT</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 34, fontWeight: 600, margin: '4px 0' }}>{fmtEur(TARIFF.priceEur)}</div>
          <div style={{ fontSize: 13 }}>soit <b>{fmtGNF(TARIFF.priceGnf)}</b></div>
          <div style={{ fontSize: 11.5, color: '#6B6557', marginTop: 8, lineHeight: 1.5 }}>Prix fixe, identique pour tous les trajets et toutes les marchandises.</div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed #DCD3BD' }}>
            <SummaryRow label="Transporteur" value={tr ? tr.short : '-'}/>
            <SummaryRow label="Trajet" value={`${f.from} → ${f.to}`}/>
            <SummaryRow label="Véhicule" value={f.vehicle || '-'} mono/>
          </div>
          <div style={{ marginTop: 12, fontSize: 11.5, color: '#6B6557' }}>Après l’émission, vous pouvez encaisser directement pour le transporteur (espèces, mobile money ou prélèvement sur son compte enregistré).</div>
        </aside>
      </div>
    </div>
  );
};

// ─── Queue ─────────────────────────────────────────────────────────
const OfficerQueue = ({ lang, go }) => {
  const s = useDut();
  const toast = useToast();
  const [filter, setFilter] = React.useState('all');
  const all = [...s.bills].sort((a, b) => b.issuedAt - a.issuedAt);
  const list = filter === 'all' ? all : filter === 'overdue' ? all.filter(sel.isOverdue) : all.filter(b => b.status === filter);
  const count = (k) => k === 'overdue' ? all.filter(sel.isOverdue).length : all.filter(b => b.status === k).length;
  return (
    <div>
      <PageHead kicker={`${all.length} DUT, poste ${s.officer.badge}`} title="File de DUT">
        <button style={ghostBtn()} onClick={() => { downloadCsv('dut-file.csv', [['N° DUT', 'Émis le', 'Transporteur', 'Départ', 'Arrivée', 'Véhicule', 'Montant GNF', 'Statut'], ...list.map(b => [b.id, fmtD(b.issuedAt), (sel.transporter(s, b.transporterId) || {}).short, b.from, b.to, b.vehicle, b.amount, b.status])]); toast('Export CSV téléchargé'); }}><Icon name="download" size={13}/> Export CSV</button>
        <button style={primaryBtn()} onClick={() => go('issue')}><Icon name="plus" size={14}/> Émettre un DUT</button>
      </PageHead>
      <FilterChips value={filter} onChange={setFilter} options={[['all', `Tous (${all.length})`], ['pending', `En attente (${count('pending')})`], ['overdue', `En retard (${count('overdue')})`], ['paid', `Payés (${count('paid')})`], ['expired', `Expirés (${count('expired')})`], ['cancelled', `Annulés (${count('cancelled')})`]]}/>
      <section style={paperCard()}><BillsTable bills={list} showTransporter onOpen={(b) => go('bill', b.id)} lang={lang}/></section>
    </div>
  );
};

// ─── Bill detail ───────────────────────────────────────────────────
const OfficerBillDetail = ({ lang, billId, go }) => {
  const s = useDut();
  const toast = useToast();
  const [print, setPrint] = React.useState(false);
  const [cancel, setCancel] = React.useState(false);
  const [reason, setReason] = React.useState('Erreur de saisie');
  const b = sel.bill(s, billId);
  if (!b) return <div>DUT introuvable. <button style={ghostBtn()} onClick={() => go('queue')}>Retour</button></div>;
  const tr = sel.transporter(s, b.transporterId) || {};
  return (
    <div>
      <PageHead kicker={`Émis le ${fmtDT(b.issuedAt)} par ${b.officer}`} title={b.id}>
        <button style={ghostBtn()} onClick={() => go('queue')}>← File</button>
        <button style={ghostBtn()} onClick={() => setPrint(true)}><Icon name="doc" size={13}/> Voir et imprimer</button>
        {b.status === 'pending' && <button style={{ ...ghostBtn(), color: '#8A1B1B', borderColor: '#E8B6B6' }} onClick={() => setCancel(true)}>Annuler ce DUT</button>}
      </PageHead>
      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section style={paperCard(true)}>
            <header style={cardHeader()}><h2 style={cardTitle()}>Informations DUT</h2><DutStatus bill={b} lang={lang}/></header>
            <SummaryRow label="Transporteur" value={<button onClick={() => go('transporter', tr.id)} style={{ background: 'none', border: 'none', padding: 0, color: '#161413', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>{tr.short}</button>}/>
            <SummaryRow label={tr.kind === 'company' ? 'RCCM' : 'CNI'} value={tr.doc} mono/>
            <SummaryRow label="Itinéraire" value={`${b.from} → ${b.to} (${b.km} km)`}/>
            <SummaryRow label="Marchandise" value={`${b.goods}, ${String(b.qty).replace('.', ',')} ${b.unit}`}/>
            <SummaryRow label="Véhicule" value={`${b.vehicle}, ${b.driver}`}/>
            <SummaryRow label="Échéance" value={fmtDT(b.due)}/>
            {b.payment && <SummaryRow label="Paiement" value={`${(PROVIDERS[b.payment.provider || b.payment.method] || PROVIDERS.orange).label}${b.payment.by === 'officer' ? ', encaissé par l’agent' : b.payment.by === 'auto' ? ', prélèvement automatique' : ', par le transporteur'}, ${fmtDT(b.payment.at)}`}/>}
            {b.payment && <SummaryRow label="Référence" value={b.payment.ref} mono/>}
            {b.cancelReason && <SummaryRow label="Motif d’annulation" value={b.cancelReason}/>}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '2px solid #161413', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={eyebrow}>Prix fixe</span><span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 24, fontWeight: 600 }}>{fmtGNF(b.amount)} <span style={{ fontSize: 14, color: '#6B6557' }}>({fmtEur(TARIFF.priceEur)})</span></span>
            </div>
          </section>
          <section style={paperCard(true)}><header style={cardHeader()}><h2 style={cardTitle()}>Historique</h2></header><AuditTrail billId={b.id}/></section>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {b.status === 'pending' && <OfficerCollectPanel billId={b.id}/>}
          {(b.status === 'paid' || b.status === 'pending') && <PairingCard billId={b.id} actor="officer" lang={lang}/>}
        </div>
      </div>
      {print && <PrintDutModal bill={b} onClose={() => setPrint(false)} lang={lang}/>}
      {cancel && (
        <DutModal title={`Annuler ${b.id}`} onClose={() => setCancel(false)} footer={<><button style={ghostBtn()} onClick={() => setCancel(false)}>Retour</button><button style={{ ...primaryBtn(), background: '#CE1126', borderColor: '#CE1126', color: '#fff' }} onClick={() => { dutActions.cancelBill(b.id, reason); setCancel(false); toast(`${b.id} annulé`, 'info'); }}>Confirmer l’annulation</button></>}>
          <p style={{ fontSize: 13, marginTop: 0 }}>L’annulation est possible tant que le DUT n’est pas payé. Le transporteur est prévenu et l’opération reste dans l’historique.</p>
          <Field label="Motif"><Select value={reason} onChange={setReason} options={['Erreur de saisie', 'Trajet annulé par le transporteur', 'Doublon', 'Véhicule non conforme']}/></Field>
        </DutModal>
      )}
    </div>
  );
};

Object.assign(window, { SoberOfficerApp, NavItem, NavHead });

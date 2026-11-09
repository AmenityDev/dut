// SOBER, Individual transporter (personne physique, owner-driver).
// Same shared store as the other spaces: the DUT issued by the DNTT agent
// for Sékou Soumah lands here, payments and tracking update everywhere.

const INDIVIDUAL_ID = 'IND-44218';

const SoberIndividualApp = ({ lang: lang0 = 'fr', density = 'comfortable', transporterId = INDIVIDUAL_ID }) => {
  const [lang, setLang] = React.useState(lang0);
  React.useEffect(() => setLang(lang0), [lang0]);
  const [nav, setNav] = React.useState({ screen: 'home', id: null, ids: null });
  const go = (screen, id = null, ids = null) => setNav({ screen, id, ids });
  const s = useDut();
  const due = sel.billsOf(s, transporterId).filter(b => b.status === 'pending');
  const screen = nav.screen;
  const tab = screen === 'pay' || screen === 'dut' ? 'payments' : screen;
  return (
    <ToastHost>
      <div className="sober-root" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#F7F3EB', color: '#161413', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13.5, lineHeight: 1.5, overflow: 'hidden', position: 'relative' }}>
        <FlagBar height={3}/>
        <IndividualTopBar lang={lang} setLang={setLang} transporterId={transporterId} go={go}/>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          <IndividualSidebar lang={lang} tab={tab} go={go} due={due.length} transporterId={transporterId}/>
          <main style={{ flex: 1, overflow: 'auto', padding: '28px 40px', position: 'relative' }}>
            <div style={{ maxWidth: screen === 'dut' ? 1200 : 960, margin: '0 auto' }}>
              {screen === 'home' && <IndividualHome lang={lang} go={go} transporterId={transporterId}/>}
              {screen === 'payments' && <TransporterPayments lang={lang} go={go} transporterId={transporterId}/>}
              {screen === 'pay' && <TransporterPay lang={lang} go={go} transporterId={transporterId} ids={nav.ids}/>}
              {screen === 'dut' && <TransporterDut lang={lang} go={go} transporterId={transporterId} billId={nav.id}/>}
              {screen === 'history' && <TransporterHistory lang={lang} go={go} transporterId={transporterId}/>}
              {screen === 'tracking' && <TransporterTracking key={nav.id || 'x'} transporterId={transporterId} initialId={nav.id} lang={lang}/>}
              {screen === 'profile' && <TransporterProfile transporterId={transporterId}/>}
              {screen === 'support' && <TransporterSupport/>}
            </div>
          </main>
          <SoberBottomNav screen={tab} setScreen={(id) => go(id)} items={[
            { id: 'home', icon: 'home', label: lang === 'en' ? 'Home' : 'Accueil' },
            { id: 'payments', icon: 'coin', label: lang === 'en' ? 'Pay' : 'Régler', badge: due.length || null },
            { id: 'tracking', icon: 'pin', label: 'Suivi' },
            { id: 'profile', icon: 'user', label: 'Profil' },
          ]}/>
        </div>
        <ChatbotBadge role="individual" lang={lang}/>
      </div>
    </ToastHost>
  );
};

const IndividualTopBar = ({ lang, setLang, transporterId, go }) => {
  const s = useDut();
  const me = sel.transporter(s, transporterId);
  return (
    <header className="sober-topbar" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', background: '#FBF8F2', borderBottom: '1px solid #E5DDC9' }}>
      <GovBrand title="Document Unique de Transport" subtitle="Espace personnel"/>
      <div style={{ flex: 1 }}/>
      <DutSearch scope={transporterId} width={240} placeholder="Rechercher un DUT…" onPick={(r) => go('dut', r.id)}/>
      <div className="sober-topbar-user-text"><LangSwitch lang={lang} setLang={setLang}/></div>
      <NotificationBell to={transporterId} onOpen={(n) => n.billId && go(n.kind === 'track' ? 'tracking' : 'dut', n.billId)}/>
      <button onClick={() => go('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14, borderLeft: '1px solid #E5DDC9', background: 'none', borderTop: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: 'inherit' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Crimson Pro", serif', fontSize: 13, fontWeight: 700 }}>{me.short.split(' ').map(x => x[0]).join('')}</div>
        <div className="sober-topbar-user-text" style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{me.short}</div>
          <div style={{ fontSize: 10.5, color: '#9A9281' }}>Personne physique, {me.city}</div>
        </div>
      </button>
    </header>
  );
};

const IndividualSidebar = ({ lang, tab, go, due, transporterId }) => {
  const s = useDut();
  const v = sel.vehiclesOf(s, transporterId)[0];
  return (
    <aside className="sober-nav" style={{ width: 230, background: '#FBF8F2', borderRight: '1px solid #E5DDC9', padding: '4px 0 14px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <NavHead>Espace personnel</NavHead>
      <NavItem accent="#CE1126" icon="home" label="Accueil" active={tab === 'home'} onClick={() => go('home')}/>
      <NavItem accent="#CE1126" icon="coin" label="Régler mes DUT" badge={due} active={tab === 'payments'} onClick={() => go('payments')}/>
      <NavItem accent="#CE1126" icon="doc" label="Mes reçus" active={tab === 'history'} onClick={() => go('history')}/>
      <NavItem accent="#CE1126" icon="pin" label="Suivi de mon trajet" active={tab === 'tracking'} onClick={() => go('tracking')}/>
      <NavHead>Compte</NavHead>
      <NavItem accent="#CE1126" icon="user" label="Profil et paiement" active={tab === 'profile'} onClick={() => go('profile')}/>
      <NavItem accent="#CE1126" icon="help" label="Assistance" active={tab === 'support'} onClick={() => go('support')}/>
      {v && (
        <div className="sober-navfooter" style={{ margin: '20px 14px 0', padding: 12, background: '#fff', border: '1px solid #E5DDC9' }}>
          <div style={{ fontSize: 9.5, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 8 }}>Mon véhicule</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 28, border: '1.5px solid #161413', background: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', ...monoStyle, fontSize: 9, fontWeight: 700, flexShrink: 0 }}>RG</div>
            <div style={{ minWidth: 0 }}><div style={{ ...monoStyle, fontWeight: 700, fontSize: 11.5 }}>{v.plate}</div><div style={{ fontSize: 10.5, color: '#6B6557' }}>{v.brand} {v.year}</div></div>
          </div>
        </div>
      )}
      <div style={{ flex: 1 }}/>
      <div className="sober-navfooter" style={{ padding: '10px 14px', fontSize: 10, color: '#9A9281', borderTop: '1px solid #E5DDC9' }}>{DNTT_HQ.name}<br/>{DNTT_HQ.address}</div>
    </aside>
  );
};

const IndividualHome = ({ lang, go, transporterId }) => {
  const s = useDut();
  const me = sel.transporter(s, transporterId);
  const bills = [...sel.billsOf(s, transporterId)].sort((a, b) => b.issuedAt - a.issuedAt);
  const due = bills.filter(b => b.status === 'pending');
  const paid = bills.filter(b => b.status === 'paid');
  const totalDue = due.reduce((x, b) => x + b.amount, 0);
  const v = sel.vehiclesOf(s, transporterId)[0];
  const live = bills.find(b => ['ready', 'in_progress'].includes(sel.tripState(s, b.id)));
  return (
    <>
      <div style={{ padding: '8px 0 18px' }}>
        <div style={eyebrow}>Bonjour, {me.city}</div>
        <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, fontWeight: 500, margin: '4px 0 0' }}>
          {me.short.split(' ')[0]}, <i style={{ color: '#6B6557', fontWeight: 400 }}>{due.length ? (due.length > 1 ? `vous avez ${due.length} règlements en attente.` : 'vous avez un règlement en attente.') : 'tout est à jour.'}</i>
        </h1>
      </div>
      {due.length ? (
        <section style={{ marginBottom: 20, background: '#161413', color: '#F7F3EB', padding: 22 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#FCD116', textTransform: 'uppercase' }}>À régler</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 44, fontWeight: 600, marginTop: 6, lineHeight: 1 }}>{fmtGNF(totalDue)}</div>
          <div style={{ fontSize: 12, color: '#B5AC97', marginTop: 6 }}>{due.length} DUT, {due[0].from} → {due[0].to}, avant le {fmtD(due[0].due)}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button onClick={() => go('pay', null, due.map(b => b.id))} style={{ flex: '1 1 200px', background: '#FCD116', color: '#161413', border: 'none', padding: '14px 18px', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icon name="coin" size={16}/> Régler maintenant</button>
            <button onClick={() => go('dut', due[0].id)} style={{ background: 'transparent', color: '#F7F3EB', border: '1px solid #6B6557', padding: '14px 18px', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>Voir le DUT</button>
          </div>
        </section>
      ) : (
        <section style={{ marginBottom: 20, background: '#E8F2EA', border: '1px solid #BFD9C4', padding: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1F4F2C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={22}/></div>
          <div><div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 20, fontWeight: 600 }}>Vous êtes à jour</div><div style={{ fontSize: 12, color: '#3B5C42' }}>Aucun DUT en attente. Bon trajet.</div></div>
        </section>
      )}
      {live && (
        <section style={{ ...paperCard(), marginBottom: 20 }}>
          <header style={cardHeader()}><h2 style={cardTitle()}>Trajet suivi</h2><button style={ghostBtn()} onClick={() => go('tracking', live.id)}>Détail →</button></header>
          <div style={{ fontSize: 12.5, marginBottom: 6 }}>{live.from} → {live.to}, {live.id}</div>
          {s.trips[live.id] ? <TripTimeline billId={live.id} compact/> : <div style={{ fontSize: 12.5, color: '#6B6557' }}>Téléphone lié, en attente du départ.</div>}
        </section>
      )}
      {v && (
        <section style={{ ...paperCard(), padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ width: 56, height: 36, border: '1.5px solid #161413', background: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', ...monoStyle, fontSize: 11, fontWeight: 700 }}>RG</div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ ...monoStyle, fontWeight: 700, fontSize: 14 }}>{v.plate}</div><div style={{ fontSize: 12, color: '#6B6557' }}>{v.brand} {v.year}, {String(v.capacity).replace('.', ',')} t</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ ...eyebrow, fontSize: 10 }}>Paiement</div><div style={{ fontSize: 12, fontWeight: 600, color: me.payAccount && me.payAccount.mandate ? '#1F4F2C' : '#6B6557' }}>{me.payAccount ? `${PROVIDERS[me.payAccount.provider].label}${me.payAccount.mandate ? ', prélèvement autorisé' : ''}` : 'Non renseigné'}</div></div>
        </section>
      )}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18, fontWeight: 600, margin: 0 }}>Derniers reçus</h2>
          <button onClick={() => go('history')} style={{ background: 'none', border: 'none', fontSize: 12, color: '#6B6557', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit' }}>Tout voir</button>
        </div>
        {paid.slice(0, 4).map((b, i) => (
          <button key={b.id} onClick={() => go('dut', b.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: i % 2 ? '#FBF8F2' : '#fff', border: 'none', borderTop: '1px solid #E5DDC9', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1F4F2C', flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{b.from} → {b.to}</div><div style={{ fontSize: 11.5, color: '#6B6557' }}>{b.goods}, {fmtD(b.issuedAt)}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 600 }}>{fmtGNF(b.amount)}</div><div style={{ fontSize: 10, color: '#9A9281', ...monoStyle }}>{b.id.slice(-5)}</div></div>
            <Icon name="chev" size={14} style={{ color: '#9A9281', flexShrink: 0 }}/>
          </button>
        ))}
      </section>
    </>
  );
};

Object.assign(window, { SoberIndividualApp, INDIVIDUAL_ID });

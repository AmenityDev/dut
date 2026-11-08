// ─────────────────────────────────────────────────────────────
// SOBER, Institutional Direction
// "Direction Générale des Transports Terrestres" feel.
// Cream/paper background, deep ink, narrow flag-bar accents,
// serif (Crimson Pro) for headlines, sans (Inter) for UI body.
// ─────────────────────────────────────────────────────────────

const SoberTransporterApp = ({ lang = 'fr', density = 'comfortable', userState = 'active', initialScreen = 'dashboard', initialStep = 0, initialPaid = false, initialPaymentState = 'idle' }) => {
  const _ = (k, v) => v ? tFmt(t(k, lang), v) : t(k, lang);
  const [screen, setScreen] = React.useState(initialScreen); // dashboard | form | payment | pdf
  const [step, setStep] = React.useState(initialStep); // for form
  const [paid, setPaid] = React.useState(initialPaid);
  const [paymentMethod, setPaymentMethod] = React.useState('orange');
  const [paymentState, setPaymentState] = React.useState(initialPaymentState); // idle | sent | success
  const [selectedImport, setSelectedImport] = React.useState(null); // import bill being paid (null = DUT)
  const [viewedImport, setViewedImport] = React.useState(null); // import bill being viewed (full-screen invoice)
  const [form, setForm] = React.useState({
    fromCity: 'Kamsar', toCity: 'Conakry',
    goods: 'BAUX', quantity: 32, unit: 'tonnes',
    vehicle: 'RC-4821-AC', driver: 'Ousmane Bah',
    departure: '2026-05-02', arrival: '2026-05-02',
    value: 18500000,
  });

  const goods = GOODS.find((g) => g.code === form.goods) || GOODS[0];
  const route = { from: form.fromCity, to: form.toCity };
  const distance = (ROUTES.find((r) => r.from === route.from && r.to === route.to) || { km: 254 }).km;
  const baseFee = Math.round(distance * 1200 + form.quantity * 800);
  const stamp = 25000;
  const stat = 8000;
  const total = baseFee + stamp + stat;

  const pad = density === 'compact' ? 14 : 22;

  return (
    <div className="sober-root" style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F7F3EB', color: '#161413', fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 13.5, lineHeight: 1.5, overflow: 'hidden', position: 'relative',
    }}>
      <FlagBar height={3} />
      <SoberTopBar lang={lang} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        <SoberTransporterSidebar lang={lang} screen={screen} setScreen={setScreen} setStep={setStep} setPaid={setPaid} setPaymentState={setPaymentState} />
        <main style={{ flex: 1, overflow: 'auto', padding: `${pad + 6}px ${pad + 14}px`, position: 'relative' }}>
          {screen === 'dashboard' && (
            <SoberDashboard lang={lang} onPay={() => setScreen('payments')}
                            onOpenDut={() => setScreen('pdf')} userState={userState} />
          )}
          {screen === 'form' && (
            // Transporters cannot issue DUTs: only officers can. Redirect.
            <div style={{ padding: 40, textAlign: 'center', color: '#6B6557' }}>
              <p>{lang === 'en' ? 'STDs are issued by DNTT officers only. Please proceed to payment of your due bills.' : 'Les DUT sont émis par les agents DNTT uniquement. Veuillez procéder au règlement de vos DUT en attente.'}</p>
              <button style={primaryBtn()} onClick={() => setScreen('payments')}>{lang === 'en' ? 'Go to bills' : 'Voir mes DUT à régler'}</button>
            </div>
          )}
          {screen === 'payment' && (
            <SoberPayment lang={lang}
                          total={selectedImport ? selectedImport.total : total}
                          bill={selectedImport}
                          method={paymentMethod} setMethod={setPaymentMethod}
                          paymentState={paymentState} setPaymentState={setPaymentState}
                          onDone={() => { setPaid(true); if (selectedImport) { setScreen('payments'); setSelectedImport(null); setPaymentState('idle'); } else { setScreen('pdf'); } }}
                          onBack={() => { setScreen('payments'); setSelectedImport(null); }} />
          )}
          {screen === 'pdf' && (
            <SoberPdfPreview lang={lang} form={form} goods={goods} distance={distance} total={total}
                             baseFee={baseFee} stamp={stamp} stat={stat} paid={paid}
                             onPay={!paid ? () => { setSelectedImport(null); setPaymentState('idle'); setScreen('payment'); } : undefined}
                             onClose={() => setScreen('dashboard')} />
          )}
          {screen === 'history' && <TransporterHistory lang={lang} onOpen={() => setScreen('pdf')}/>}
          {screen === 'fleet' && <TransporterFleet lang={lang}/>}
          {screen === 'tracking' && <TransporterTracking lang={lang} onOpenDut={() => setScreen('pdf')}/>}
          {screen === 'payments' && <TransporterPayments lang={lang} onPay={() => { setSelectedImport(null); setScreen('payment'); }} onPayImport={(b) => { setSelectedImport(b); setPaymentState('idle'); setScreen('payment'); }} onViewDut={() => setScreen('pdf')} onViewImport={(b) => { setViewedImport(b); setScreen('importView'); }}/>}
          {screen === 'importView' && viewedImport && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{t('documentReady', lang)}, {viewedImport.id}</div>
                  <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>{lang === 'en' ? 'Vehicle Import Tax Notice' : 'Avis de Taxation, Importation Véhicule'}</h1>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {viewedImport.status === 'pending' && (
                    <button onClick={() => { setSelectedImport(viewedImport); setViewedImport(null); setPaymentState('idle'); setScreen('payment'); }} style={{
                      background: '#161413', color: '#FCD116', border: 'none', padding: '8px 16px',
                      fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', borderRadius: 2,
                      display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '.04em',
                    }}>
                      <Icon name="coin" size={13}/> {lang === 'en' ? 'Pay this tax' : 'Régler la taxe'}
                    </button>
                  )}
                  <button style={ghostBtn()}>{t('print', lang)}</button>
                  <button style={primaryBtn()}><Icon name="download" size={14}/> {t('download', lang)}</button>
                  <button onClick={() => { setScreen('payments'); setViewedImport(null); }} style={ghostBtn()}>{t('cancel', lang)}</button>
                </div>
              </div>
              <OfficerImportDetail lang={lang} bill={viewedImport} hideBack={true} onBack={() => { setScreen('payments'); setViewedImport(null); }}/>
            </div>
          )}
          {screen === 'profile' && <TransporterProfile lang={lang}/>}
          {screen === 'support' && <TransporterSupport lang={lang}/>}
          {screen === 'settings' && <TransporterSettings lang={lang}/>}
        </main>
        <SoberBottomNav screen={screen} setScreen={setScreen} items={[
          { id: 'dashboard', icon: 'home', label: t('dashboard', lang) },
          { id: 'payments', icon: 'coin', label: lang === 'en' ? 'Pay' : 'Régler', badge: '2' },
          { id: 'fleet', icon: 'truck', label: t('fleet', lang) },
          { id: 'tracking', icon: 'pin', label: lang === 'en' ? 'Tracking' : 'Suivi' },
          { id: 'profile', icon: 'user', label: lang === 'en' ? 'Account' : 'Compte' },
        ]}/>
      </div>

      <ChatbotBadge role="company" lang={lang}/>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Top bar: emblem + portal title + identification + language
// ─────────────────────────────────────────────────────────────
const SoberTopBar = ({ lang }) => (
  <header className="sober-topbar" style={{
    display: 'flex', alignItems: 'center', gap: 18, padding: '14px 24px',
    background: '#FBF8F2', borderBottom: '1px solid #E5DDC9',
  }}>
    <div style={{ color: '#161413' }}><SealEmblem size={44} /></div>
    <div className="sober-topbar-emblem-text" style={{ borderLeft: '1px solid #DCD3BD', paddingLeft: 16 }}>
      <div style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 17, lineHeight: 1.1, letterSpacing: '.01em' }}>
        {t('appName', lang)}
      </div>
      <div style={{ fontSize: 11, color: '#6B6557', letterSpacing: '.16em', textTransform: 'uppercase', marginTop: 2 }}>
        {t('portal', lang)}
      </div>
    </div>

    <div style={{ flex: 1 }} />

    <div className="sober-topbar-search" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                  border: '1px solid #DCD3BD', borderRadius: 4, background: '#fff', width: 280 }}>
      <Icon name="search" size={14} style={{ color: '#9A9281' }} />
      <span style={{ color: '#9A9281', fontSize: 12.5 }}>{t('search', lang)}…</span>
      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#B5AC97', border: '1px solid #DCD3BD', borderRadius: 2, padding: '1px 5px' }}>⌘K</span>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#6B6557' }}>
      <span style={{ padding: '4px 8px', borderRadius: 2, background: lang === 'fr' ? '#161413' : 'transparent',
                     color: lang === 'fr' ? '#fff' : '#6B6557' }}>FR</span>
      <span style={{ padding: '4px 8px', color: lang === 'sus' ? '#161413' : '#9A9281' }}>SOU</span>
      <span style={{ padding: '4px 8px', color: lang === 'ful' ? '#161413' : '#9A9281' }}>PEU</span>
      <span style={{ padding: '4px 8px', color: lang === 'man' ? '#161413' : '#9A9281' }}>MAN</span>
    </div>

    <div style={{ position: 'relative', color: '#161413' }}>
      <Icon name="bell" size={18} />
      <span style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: '50%',
                     background: '#CE1126', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</span>
    </div>

    <div className="sober-topbar-user-text" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14, borderLeft: '1px solid #DCD3BD' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#161413', color: '#FCD116',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>MD</div>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{CARRIER.director}</div>
        <div style={{ fontSize: 11, color: '#6B6557' }}>{CARRIER.short}, NIF {CARRIER.nif}</div>
      </div>
    </div>
  </header>
);

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
const SoberSidebar = ({ lang = 'fr', screen, setScreen, setStep, setPaid, setPaymentState }) => {
  const Item = ({ id, icon, label, badge }) => {
    const active = screen === id || (id === 'form' && screen === 'payment') || (id === 'history' && screen === 'pdf');
    return (
      <button onClick={() => {
        if (id === 'form') { setStep(0); setPaid(false); setPaymentState('idle'); }
        setScreen(id);
      }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px',
          background: active ? '#FBF8F2' : 'transparent',
          color: active ? '#161413' : '#6B6557',
          border: 'none', borderLeft: active ? '2px solid #CE1126' : '2px solid transparent',
          width: '100%', cursor: 'pointer', fontSize: 13, textAlign: 'left',
          fontWeight: active ? 600 : 500, fontFamily: 'inherit',
        }}>
        <Icon name={icon} size={17} />
        <span>{label}</span>
        {badge && <span style={{ marginLeft: 'auto', fontSize: 10, background: '#161413', color: '#FCD116', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>{badge}</span>}
      </button>
    );
  };
  return (
    <aside style={{ width: 230, background: '#FBF8F2', borderRight: '1px solid #E5DDC9', padding: '14px 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 14px 10px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{t('carrierSpace', lang)}</div>
      <Item id="dashboard" icon="home" label={t('dashboard', lang)} />
      <Item id="form" icon="plus" label={t('newDut', lang)} />
      <Item id="history" icon="doc" label={t('history', lang)} badge="142" />
      <Item id="fleet" icon="truck" label={t('fleet', lang)} badge="14" />
      <Item id="drivers" icon="user" label={t('drivers', lang)} />
      <Item id="payments" icon="coin" label={t('payments', lang)} />

      <div style={{ padding: '18px 14px 6px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{lang === 'en' ? 'Account' : lang === 'fr' ? 'Compte' : t('profile', lang)}</div>
      <Item id="settings" icon="gear" label={t('settings', lang)} />
      <Item id="support" icon="help" label={t('support', lang)} />

      <div style={{ flex: 1 }} />

      <div style={{ margin: '10px 14px', padding: 12, background: '#161413', color: '#F7F3EB', borderRadius: 4 }}>
        <div style={{ fontSize: 10, letterSpacing: '.18em', color: '#FCD116' }}>{(lang === 'en' ? 'REMINDER' : lang === 'fr' ? 'RAPPEL' : t('notifications', lang).toUpperCase())}</div>
        <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 14, marginTop: 4, lineHeight: 1.3 }}>
          {t('transportCard', lang)} : 38 j
        </div>
        <button style={{ marginTop: 8, fontSize: 11, background: 'transparent', border: '1px solid #6B6557',
                         color: '#F7F3EB', padding: '5px 10px', borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit' }}>
          {t('confirm', lang)} →
        </button>
      </div>

      <div style={{ padding: '10px 14px', fontSize: 10, color: '#9A9281', borderTop: '1px solid #E5DDC9' }}>
        {t('ministry', lang)}<br/>v 2.4.1, 04 / 2026
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────
const SoberDashboard = ({ lang = 'fr', onPay, onOpenDut, userState }) => {
  const overdue = userState === 'overdue';
  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 18, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{t('carrierSpace', lang)}, N° 04/MTI/2019</div>
          <h1 style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 32, fontWeight: 500, margin: '6px 0 0', letterSpacing: '-0.01em' }}>
            {t('welcome', lang)}, <i>{CARRIER.director.split(' ').slice(-2).join(' ')}</i>.
          </h1>
          <div style={{ fontSize: 13, color: '#6B6557', marginTop: 4 }}>
            {t('overview', lang)}, <b>04 / 2026</b>
          </div>
        </div>
        <button onClick={onPay} style={primaryBtn()}>
          <Icon name="coin" size={15} />
          {lang === 'en' ? 'Pay bills due' : 'Régler mes DUT'}
        </button>
      </div>

      {overdue && (
        <div style={{ marginBottom: 18, padding: 14, background: '#FCEAEA', border: '1px solid #E8B6B6', borderLeft: '3px solid #CE1126', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="bell" size={18} style={{ color: '#CE1126', marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#8A1B1B' }}>{t('overdue', lang)} : DUT-2026-04-08698</div>
            <div style={{ fontSize: 12, color: '#6B4444' }}>372 000 GNF, {t('overdueDetail', lang)}</div>
          </div>
          <button style={{ marginLeft: 'auto', fontSize: 12, background: '#CE1126', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>{t('pay', lang)}</button>
        </div>
      )}

      {/* KPI strip */}
      <div className="sober-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <KpiTile label={t('issued', lang)} big="38" delta="+6" hint={t('versusLastMonth', lang)} />
        <KpiTile label={t('pending', lang)} big="2" hint="372 000 GNF" tone="warn" />
        <KpiTile label={t('amountDue', lang)} big="8,42M" suffix="GNF" hint={`14 ${t('transactions', lang)}`} />
        <KpiTile label={t('distance', lang)} big="11 624" suffix="km" hint={`38 ${t('trips', lang)}`} />
      </div>

      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
        {/* Recent DUTs table */}
        <section style={paperCard()}>
          <header style={cardHeader()}>
            <h2 style={cardTitle()}>{t('recentDocs', lang)}</h2>
            <button style={ghostBtn()}>{t('seeAll', lang)} →</button>
          </header>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ color: '#9A9281', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                {[t('docNumber', lang), t('issuedOn', lang), t('route', lang), t('cargo', lang), t('vehicle', lang), t('total', lang), 'Statut'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_DUTS.map((d, i) => (
                <tr key={d.id} onClick={onOpenDut} style={{ cursor: 'pointer', background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                  <td style={td()}><span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5 }}>{d.id}</span></td>
                  <td style={td()}>{d.date}</td>
                  <td style={td()}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {d.from} <Icon name="arrow" size={11} style={{ color: '#9A9281' }}/> {d.to}
                    </span>
                  </td>
                  <td style={td()}>{d.goods}</td>
                  <td style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5 }}>{d.vehicle}</td>
                  <td style={{ ...td(), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtGNF(d.amount)}</td>
                  <td style={td()}><StatusPill status={d.status} lang={lang} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section style={paperCard()}>
            <header style={cardHeader()}>
              <h2 style={cardTitle()}>{t('notifications', lang)}</h2>
              <button style={ghostBtn()}>{t('all', lang)}</button>
            </header>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderTop: i ? '1px solid #E5DDC9' : 'none' }}>
                  <div style={{ width: 6, alignSelf: 'stretch',
                                background: a.kind === 'warn' ? '#FCD116' : a.kind === 'ok' ? '#009460' : '#161413' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.label}</div>
                    <div style={{ fontSize: 11.5, color: '#6B6557', marginTop: 2 }}>{a.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={paperCard()}>
            <header style={cardHeader()}>
              <h2 style={cardTitle()}>{t('myFleet', lang)}</h2>
              <span style={{ fontSize: 11, color: '#9A9281' }}>5 / {CARRIER.fleet}</span>
            </header>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {VEHICLES.slice(0, 4).map((v, i) => (
                <div key={v.plate} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? '1px solid #E5DDC9' : 'none' }}>
                  <div style={{ width: 38, height: 26, border: '1px solid #161413', borderRadius: 2,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700,
                                background: '#FCD116' }}>RG</div>
                  <div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 600 }}>{v.plate}</div>
                    <div style={{ fontSize: 11, color: '#6B6557' }}>{v.brand}, {v.capacity}, {v.driver}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <footer style={{ marginTop: 28, paddingTop: 14, borderTop: '1px solid #E5DDC9',
                       fontSize: 11, color: '#9A9281', display: 'flex', justifyContent: 'space-between' }}>
        <div>« <i>Travail, Justice, Solidarité</i> », devise nationale.</div>
        <div>Hébergement souverain, Conakry & Dakar, ISO 27001</div>
      </footer>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Multi-step DUT form
// ─────────────────────────────────────────────────────────────
const SoberForm = ({ lang = 'fr', form, setForm, step, setStep, goods, distance, total, baseFee, stamp, stat, onSubmit, onCancel }) => {
  const STEPS = [
    lang === 'en' ? 'Payer' : 'Redevable',
    t('route', lang),
    t('cargo', lang),
    `${t('vehicle', lang)} & ${t('driver', lang).toLowerCase()}`,
    t('summary', lang),
  ];
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{t('newDut', lang)}, {tFmt(t('stepOf', lang), { n: step + 1, total: STEPS.length })}</div>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>{STEPS[step]}</h1>
        </div>
        <button onClick={onCancel} style={ghostBtn()}>{t('cancel', lang)}</button>
      </div>

      {/* Stepper */}
      <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: '0 0 26px', gap: 0 }}>
        {STEPS.map((s, i) => {
          const done = i < step, active = i === step;
          return (
            <li key={s} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, color: active ? '#161413' : done ? '#6B6557' : '#B5AC97' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%',
                            background: active ? '#161413' : done ? '#009460' : 'transparent',
                            border: '1px solid', borderColor: active ? '#161413' : done ? '#009460' : '#B5AC97',
                            color: active || done ? '#fff' : '#B5AC97',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                {done ? <Icon name="check" size={12} stroke={2.4}/> : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 600 : 500 }}>{s}</span>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: done ? '#009460' : '#E5DDC9', margin: '0 12px' }} />}
            </li>
          );
        })}
      </ol>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22 }}>
        <section style={paperCard(true)}>
          {step === 0 && <StepPayer lang={lang} form={form} set={set} />}
          {step === 1 && <StepRoute lang={lang} form={form} set={set} distance={distance} />}
          {step === 2 && <StepGoods lang={lang} form={form} set={set} />}
          {step === 3 && <StepVehicle lang={lang} form={form} set={set} />}
          {step === 4 && <StepReview lang={lang} form={form} goods={goods} distance={distance} />}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 18, borderTop: '1px solid #E5DDC9' }}>
            <button onClick={() => step === 0 ? onCancel() : setStep(step - 1)} style={ghostBtn()}>← {step === 0 ? t('cancel', lang) : t('back', lang)}</button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} style={primaryBtn()}>{t('next', lang)} →</button>
            ) : (
              <button onClick={onSubmit} style={primaryBtn()}>{t('submit', lang)} →</button>
            )}
          </div>
        </section>

        <aside style={{ ...paperCard(true), position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
          <div style={{ fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{t('estimate', lang)}</div>
          <h3 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 22, margin: '4px 0 14px', fontWeight: 500 }}>{form.fromCity} → {form.toCity}</h3>

          <SummaryRow label={t('estimatedDistance', lang)} value={`${distance} km`} />
          <SummaryRow label={t('cargo', lang)} value={`${goods.label}, ${form.quantity} ${form.unit || goods.unit}`} />
          <SummaryRow label={t('vehicle', lang)} value={form.vehicle} mono />
          <SummaryRow label={t('declaredValue', lang)} value={fmtGNF(form.value)} />

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #DCD3BD' }}>
            <SummaryRow label={t('fee', lang)} value={fmtGNF(baseFee)} />
            <SummaryRow label={t('stamp', lang)} value={fmtGNF(stamp)} />
            <SummaryRow label={t('dnttShare', lang)} value={fmtGNF(stat)} />
          </div>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '2px solid #161413',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6557' }}>{t('totalDue', lang)}</span>
            <span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 26, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtGNF(total)}</span>
          </div>

          <div style={{ marginTop: 14, padding: 10, background: '#F7F3EB', border: '1px solid #E5DDC9', fontSize: 11.5, color: '#6B6557', lineHeight: 1.55 }}>
            <Icon name="shield" size={13} style={{ verticalAlign: '-2px', color: '#009460' }}/> {t('decree', lang)}
          </div>
        </aside>
      </div>
    </div>
  );
};

const StepPayer = ({ lang = 'fr', form, set }) => {
  const isFr = lang !== 'en';
  const filtered = TRANSPORTERS.filter(tr => tr.kind === form.payerKind);
  const selected = TRANSPORTERS.find(tr => tr.id === form.transporterId);

  // Lookup-derived auto-filled fields (only when not custom)
  const displayName    = form.payerCustom ? form.payerName    : (selected?.short || '');
  const displayId      = form.payerCustom ? form.payerId      : (selected?.rccm  || '');
  const displayContact = form.payerCustom ? form.payerName    : (selected?.contact || '');

  const switchKind = (k) => {
    const first = TRANSPORTERS.find(tr => tr.kind === k);
    set('payerKind', k);
    if (first) set('transporterId', first.id);
  };

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 8 }}>
          {isFr ? 'Type de redevable' : 'Payer type'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { k: 'company',    title: isFr ? 'Personne morale' : 'Legal entity', sub: isFr ? 'Société, RCCM' : 'Company, RCCM', icon: 'truck' },
            { k: 'individual', title: isFr ? 'Personne physique' : 'Individual', sub: isFr ? 'Particulier, CNI' : 'Private, ID card', icon: 'user' },
          ].map(o => {
            const active = form.payerKind === o.k;
            return (
              <button key={o.k} onClick={() => switchKind(o.k)} style={{
                textAlign: 'left', padding: '14px 16px', cursor: 'pointer',
                background: active ? '#161413' : '#FFF',
                color: active ? '#FCD116' : '#161413',
                border: active ? '1px solid #161413' : '1px solid #E5DDC9',
                display: 'flex', gap: 12, alignItems: 'center',
                fontFamily: 'inherit',
              }}>
                <div style={{ width: 36, height: 36, background: active ? '#FCD116' : '#F1ECDF', color: active ? '#161413' : '#6B6557', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <Icon name={o.icon} size={16}/>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{o.title}</div>
                  <div style={{ fontSize: 11.5, opacity: .8, marginTop: 2 }}>{o.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 11, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase' }}>
          {isFr ? 'Identification' : 'Identification'}
        </div>
        <label style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B6557', cursor: 'pointer' }}>
          <input type="checkbox" checked={!!form.payerCustom} onChange={(e) => set('payerCustom', e.target.checked)} />
          {isFr ? 'Saisie libre (hors registre)' : 'Free entry (not in registry)'}
        </label>
      </div>

      {!form.payerCustom ? (
        <Field label={isFr ? 'Sélectionner dans le registre' : 'Select from registry'}>
          <select
            value={form.transporterId}
            onChange={(e) => set('transporterId', e.target.value)}
            style={{ width: '100%', padding: '9px 11px', border: '1px solid #DCD3BD', background: '#fff', borderRadius: 2, fontFamily: 'inherit', fontSize: 13, color: '#161413', outline: 'none' }}
          >
            {filtered.map(tr => (
              <option key={tr.id} value={tr.id}>
                {tr.id}, {tr.short}{form.payerKind==='individual' ? ` (${tr.city})` : ''}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <FieldRow>
          <Field label={form.payerKind === 'company' ? (isFr ? 'Raison sociale' : 'Legal name') : (isFr ? 'Nom & prénoms' : 'Full name')}>
            <Input value={form.payerName} onChange={(v) => set('payerName', v)} placeholder={form.payerKind === 'company' ? 'ex. SOCOTRANS SA' : 'ex. Mariama Bah'} />
          </Field>
          <Field label={form.payerKind === 'company' ? 'RCCM / NIF' : (isFr ? 'CNI / NIF' : 'ID / Tax no.')}>
            <Input value={form.payerId} onChange={(v) => set('payerId', v)} placeholder={form.payerKind === 'company' ? 'RCCM/CKY/B/…' : 'CNI 094-…'} />
          </Field>
        </FieldRow>
      )}

      <FieldRow>
        <Field label={isFr ? 'Adresse / domicile' : 'Address'}>
          <Input value={form.payerAddress} onChange={(v) => set('payerAddress', v)} placeholder={isFr ? 'Quartier, commune, ville' : 'Neighborhood, city'} />
        </Field>
        <Field label={isFr ? 'Téléphone' : 'Phone'}>
          <Input value={form.payerPhone} onChange={(v) => set('payerPhone', v)} placeholder="+224 6•• •• •• ••" />
        </Field>
      </FieldRow>

      <div style={{ marginTop: 14, padding: 14, background: '#FBF8F2', border: '1px solid #E5DDC9' }}>
        <div style={{ fontSize: 11, color: '#9A9281', letterSpacing: '.14em', textTransform: 'uppercase' }}>
          {isFr ? 'Récapitulatif redevable' : 'Payer summary'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#6B6557' }}>{isFr ? 'Désignation' : 'Name'}</div>
            <div style={{ fontWeight: 600 }}>{displayName || '-'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6B6557' }}>{form.payerKind === 'company' ? 'RCCM/NIF' : 'CNI/NIF'}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12 }}>{displayId || '-'}</div>
          </div>
          {!form.payerCustom && (
            <div>
              <div style={{ fontSize: 11, color: '#6B6557' }}>{isFr ? 'Représentant / contact' : 'Contact'}</div>
              <div>{displayContact || '-'}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: '#6B6557' }}>{isFr ? 'Type' : 'Type'}</div>
            <div>{form.payerKind === 'company' ? (isFr ? 'Personne morale' : 'Legal entity') : (isFr ? 'Personne physique' : 'Individual')}</div>
          </div>
        </div>
      </div>
    </>
  );
};

const StepRoute = ({ lang = 'fr', form, set, distance }) => (
  <>
    <FieldRow>
      <Field label={t('fromCity', lang)}>
        <Select value={form.fromCity} onChange={(v) => set('fromCity', v)} options={GUINEA_CITIES} />
      </Field>
      <Field label={t('toCity', lang)}>
        <Select value={form.toCity} onChange={(v) => set('toCity', v)} options={GUINEA_CITIES} />
      </Field>
    </FieldRow>

    <FieldRow>
      <Field label={t('departure', lang)}><Input type="date" value={form.departure} onChange={(v) => set('departure', v)} /></Field>
      <Field label={t('arrival', lang)}><Input type="date" value={form.arrival} onChange={(v) => set('arrival', v)} /></Field>
    </FieldRow>

    <Field label="Itinéraire détaillé (étapes)">
      <textarea defaultValue="Kamsar (port minéralier) → RN3 → Boffa → Kindia → Coyah → Conakry (Port autonome de Conakry, terminal vraquier)"
        style={{ width: '100%', minHeight: 70, padding: 10, border: '1px solid #DCD3BD', background: '#FBF8F2', borderRadius: 2,
                 fontFamily: 'inherit', fontSize: 13, color: '#161413', resize: 'vertical' }}/>
    </Field>

    {/* Faux map */}
    <div style={{ marginTop: 14, padding: 16, background: '#FBF8F2', border: '1px solid #E5DDC9', position: 'relative', height: 160, overflow: 'hidden' }}>
      <svg viewBox="0 0 600 200" width="100%" height="100%" style={{ display: 'block' }}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5DDC9" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="600" height="200" fill="url(#grid)"/>
        <path d="M80 140 Q 200 60 320 110 T 540 70" stroke="#CE1126" strokeWidth="2" fill="none" strokeDasharray="6 3"/>
        <circle cx="80" cy="140" r="6" fill="#161413"/>
        <circle cx="540" cy="70" r="6" fill="#009460"/>
        <text x="80" y="160" fontSize="11" fontFamily="Inter" fill="#161413" fontWeight="600">{form.fromCity}</text>
        <text x="540" y="60" fontSize="11" fontFamily="Inter" fill="#161413" fontWeight="600" textAnchor="end">{form.toCity}</text>
        <text x="300" y="40" fontSize="11" fontFamily="Inter" fill="#6B6557" textAnchor="middle">≈ {distance} km, ~ {Math.round(distance/55)} h de route</text>
      </svg>
    </div>
  </>
);

const StepGoods = ({ lang = 'fr', form, set }) => (
  <>
    <Field label={t('cargoCategory', lang)}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {GOODS.map((g) => {
          const sel = form.goods === g.code;
          return (
            <button key={g.code} onClick={() => set('goods', g.code)}
              style={{
                padding: '12px 10px', textAlign: 'left',
                background: sel ? '#161413' : '#FBF8F2', color: sel ? '#FCD116' : '#161413',
                border: '1px solid', borderColor: sel ? '#161413' : '#DCD3BD',
                borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', opacity: .7 }}>{g.cat}</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{g.label}</div>
              <div style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>en {g.unit}</div>
            </button>
          );
        })}
      </div>
    </Field>

    <FieldRow>
      <Field label={t('quantity', lang)}><Input type="number" value={form.quantity} onChange={(v) => set('quantity', +v || 0)} /></Field>
      <Field label={t('unit', lang)}><Input value={form.unit} onChange={(v) => set('unit', v)} /></Field>
      <Field label={t('declaredValue', lang)}><Input type="number" value={form.value} onChange={(v) => set('value', +v || 0)} /></Field>
    </FieldRow>

    <Field label="Justificatif d'origine (facture, BL, certificat phytosanitaire…)">
      <div style={{ padding: 22, border: '1.5px dashed #DCD3BD', background: '#FBF8F2', textAlign: 'center', borderRadius: 2 }}>
        <Icon name="upload" size={26} style={{ color: '#9A9281' }}/>
        <div style={{ marginTop: 8, fontWeight: 600 }}>Glisser-déposer un fichier</div>
        <div style={{ fontSize: 11.5, color: '#6B6557', marginTop: 4 }}>ou <u>parcourir</u> (PDF, JPG, PNG, max 8 Mo)</div>
      </div>
    </Field>

    <FieldRow>
      <Field label="Conditionnement">
        <Radio name="cond" options={['Vrac', 'Conteneur 20\'', 'Conteneur 40\'', 'Palettes']} default="Vrac" />
      </Field>
    </FieldRow>
  </>
);

const StepVehicle = ({ lang = 'fr', form, set }) => (
  <>
    <Field label={t('chooseVehicle', lang)}>
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #DCD3BD' }}>
        {VEHICLES.map((v, i) => {
          const sel = form.vehicle === v.plate;
          return (
            <label key={v.plate} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                                          borderTop: i ? '1px solid #E5DDC9' : 'none',
                                          background: sel ? '#FBF8F2' : '#fff', cursor: 'pointer' }}>
              <input type="radio" checked={sel} onChange={() => { set('vehicle', v.plate); set('driver', v.driver); }} style={{ accentColor: '#CE1126' }}/>
              <div style={{ width: 56, height: 30, border: '1px solid #161413', borderRadius: 2,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700,
                            background: '#FCD116' }}>{v.plate.slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{v.plate}</div>
                <div style={{ fontSize: 11.5, color: '#6B6557' }}>{v.brand}, {v.year}, capacité {v.capacity}</div>
              </div>
              <div style={{ fontSize: 11.5, color: '#6B6557' }}>{v.type}</div>
            </label>
          );
        })}
      </div>
    </Field>

    <FieldRow>
      <Field label={t('primaryDriver', lang)}><Input value={form.driver} onChange={(v) => set('driver', v)} /></Field>
      <Field label={t('licenseNumber', lang)}><Input value="C-2018-04-771203" /></Field>
    </FieldRow>

    <FieldRow>
      <Field label="N° carte transporteur"><Input value="DNTT/T/2024/00482" /></Field>
      <Field label="Police d'assurance"><Input value="SUNU-2026-0218, valide jusqu'au 31/12/2026" /></Field>
    </FieldRow>

    <div style={{ marginTop: 6, padding: 12, background: '#F1F8F2', border: '1px solid #BFD9C4', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <Icon name="check" size={16} style={{ color: '#009460', marginTop: 2 }}/>
      <div style={{ fontSize: 12, color: '#1F4F2C' }}>
        <b>Vérifications automatiques :</b> visite technique à jour, police d'assurance valide, permis non suspendu, carte transporteur active jusqu'au 07/06/2026.
      </div>
    </div>
  </>
);

const StepReview = ({ lang = 'fr', form, goods, distance }) => (
  <>
    <ReviewBlock title={t('route', lang)}>
      <ReviewLine k={t('fromCity', lang)} v={form.fromCity} />
      <ReviewLine k={t('toCity', lang)} v={form.toCity} />
      <ReviewLine k={t('estimatedDistance', lang)} v={`${distance} km`} />
      <ReviewLine k={t('departure', lang)} v={`${form.departure} → ${form.arrival}`} />
    </ReviewBlock>
    <ReviewBlock title={t('cargo', lang)}>
      <ReviewLine k={t('cargoNature', lang)} v={`${goods.label} (${goods.cat})`} />
      <ReviewLine k={t('quantity', lang)} v={`${form.quantity} ${form.unit || goods.unit}`} />
      <ReviewLine k={t('declaredValue', lang)} v={fmtGNF(form.value)} />
    </ReviewBlock>
    <ReviewBlock title={`${t('vehicle', lang)} & ${t('driver', lang).toLowerCase()}`}>
      <ReviewLine k={t('vehicle', lang)} v={form.vehicle} mono />
      <ReviewLine k={t('driver', lang)} v={form.driver} />
      <ReviewLine k={t('insurance', lang)} v="SUNU-2026-0218" mono />
    </ReviewBlock>
  </>
);

// ─────────────────────────────────────────────────────────────
// Payment
// ─────────────────────────────────────────────────────────────
const SoberPayment = ({ lang = 'fr', total, bill, method, setMethod, paymentState, setPaymentState, onDone, onBack }) => {
  React.useEffect(() => {
    if (paymentState === 'sent') {
      const t1 = setTimeout(() => setPaymentState('success'), 1800);
      const t2 = setTimeout(() => onDone(), 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [paymentState]);

  const methods = [
    { id: 'orange',   label: t('orangeMoney', lang),  tag: 'OM',   desc: '+224 6XX XX XX XX', color: '#FF6E0E' },
    { id: 'mtn',      label: t('mtnMoMo', lang),      tag: 'MTN',  desc: '+224 6XX XX XX XX', color: '#FFCC00' },
    { id: 'card',     label: t('bankCard', lang),     tag: 'VISA', desc: 'Visa, Mastercard, GIM-UEMOA', color: '#1A1F71' },
    { id: 'bank',     label: t('bankTransfer', lang), tag: 'BCI',  desc: 'BICIGUI, Ecobank, UBA, Vista', color: '#161413' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>
            {bill ? (lang === 'en' ? 'Vehicle import: tax payment' : 'Importation véhicule : paiement de la taxe') : `${tFmt(t('stepOf', lang), { n: 4, total: 4 })}, ${t('paymentMethod', lang)}`}
          </div>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>{t('chooseMethod', lang)}</h1>
        </div>
        <button onClick={onBack} style={ghostBtn()}>← {t('back', lang)}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
        <section style={paperCard(true)}>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 12 }}>{t('chooseMethod', lang)}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {methods.map((m) => {
              const sel = method === m.id;
              return (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                                            border: '1px solid', borderColor: sel ? '#161413' : '#DCD3BD',
                                            background: sel ? '#FBF8F2' : '#fff', cursor: 'pointer', borderRadius: 2 }}>
                  <input type="radio" checked={sel} onChange={() => setMethod(m.id)} style={{ accentColor: '#CE1126' }}/>
                  <div style={{ width: 48, height: 32, background: m.color, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: 11, letterSpacing: '.04em' }}>{m.tag}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: 11.5, color: '#6B6557' }}>{m.desc}</div>
                  </div>
                  {sel && <Icon name="check" size={16} style={{ color: '#009460' }}/>}
                </label>
              );
            })}
          </div>

          {(method === 'orange' || method === 'mtn') && (
            <div style={{ marginTop: 18, padding: 16, background: '#FBF8F2', border: '1px solid #E5DDC9' }}>
              <Field label={`N° ${method === 'orange' ? 'Orange Money' : 'MTN MoMo'}`}>
                <Input defaultValue="+224 622 14 88 03" />
              </Field>
              <div style={{ fontSize: 11.5, color: '#6B6557', marginTop: 6 }}>
                <Icon name="phone" size={12} style={{ verticalAlign: '-1px' }}/> {t('paymentSent', lang)}
              </div>
            </div>
          )}

          {method === 'card' && (
            <div style={{ marginTop: 18, padding: 16, background: '#FBF8F2', border: '1px solid #E5DDC9' }}>
              <Field label={t('bankCard', lang)}><Input defaultValue="4532  •••• ••••  7821" /></Field>
              <FieldRow>
                <Field label={t('validUntil', lang)}><Input defaultValue="08 / 28" /></Field>
                <Field label="CVV"><Input defaultValue="•••" /></Field>
              </FieldRow>
            </div>
          )}

          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11.5, color: '#6B6557', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="shield" size={14} style={{ color: '#009460' }}/> {t('securedBy', lang)}
            </div>
            <button onClick={() => setPaymentState('sent')} disabled={paymentState !== 'idle'} style={{ ...primaryBtn(), opacity: paymentState !== 'idle' ? .6 : 1 }}>
              {paymentState === 'idle'    && <>{t('confirm', lang)} ({fmtGNF(total)}) →</>}
              {paymentState === 'sent'    && <>{t('paymentSent', lang)}</>}
              {paymentState === 'success' && <><Icon name="check" size={14}/> {t('paymentReceived', lang)}</>}
            </button>
          </div>
        </section>

        <aside style={paperCard(true)}>
          <div style={{ fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{t('totalDue', lang)}</div>
          <h3 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 22, margin: '4px 0 14px', fontWeight: 500 }}>
            {bill
              ? `${lang === 'en' ? 'Vehicle import' : 'Importation véhicule'}, ${bill.vehicle.make} ${bill.vehicle.model}`
              : 'DUT, Bauxite Kamsar → Conakry'}
          </h3>
          {bill ? (
            (() => {
              const bd = (typeof computeImportTax === 'function')
                ? computeImportTax({ category: bill.vehicle.category, cif: bill.cif, year: bill.vehicle.year, powerKw: bill.vehicle.powerKw, fuel: bill.vehicle.fuel, use: bill.vehicle.use })
                : null;
              return (
                <>
                  <div style={{ fontSize: 11, color: '#6B6557', marginBottom: 12, fontFamily: '"JetBrains Mono", monospace' }}>{bill.id}</div>
                  <SummaryRow label={lang === 'en' ? 'CIF value' : 'Valeur CIF'} value={fmtGNF(bill.cif)} />
                  {bd && (
                    <>
                      <SummaryRow label={lang === 'en' ? 'Customs duty' : 'Droit de douane'} value={fmtGNF(bd.customsDuty)} />
                      {bd.powerSurcharge > 0 && <SummaryRow label={lang === 'en' ? 'Power surcharge' : 'Surtaxe puissance'} value={fmtGNF(bd.powerSurcharge)} />}
                      <SummaryRow label="VAT 18%" value={fmtGNF(bd.vat)} />
                      <SummaryRow label={lang === 'en' ? 'Statistical fee' : 'Redevance statistique'} value={fmtGNF(bd.statFee)} />
                      <SummaryRow label={lang === 'en' ? 'Customs stamp' : 'Timbre douanier'} value={fmtGNF(bd.stamp)} />
                    </>
                  )}
                </>
              );
            })()
          ) : (
            <>
              <SummaryRow label={t('fee', lang)} value={fmtGNF(305000)} />
              <SummaryRow label={t('stamp', lang)} value={fmtGNF(25000)} />
              <SummaryRow label={t('dnttShare', lang)} value={fmtGNF(8000)} />
            </>
          )}

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '2px solid #161413',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6557' }}>{t('total', lang)}</span>
            <span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 26, fontWeight: 600 }}>{fmtGNF(total)}</span>
          </div>

          {paymentState !== 'idle' && (
            <div style={{ marginTop: 16, padding: 14, background: paymentState === 'success' ? '#F1F8F2' : '#FFF8E1', border: '1px solid', borderColor: paymentState === 'success' ? '#BFD9C4' : '#E8D896' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: paymentState === 'success' ? '#1F4F2C' : '#73591F' }}>
                {paymentState === 'sent' && <>{t('paymentSent', lang)}</>}
                {paymentState === 'success' && <>✓ {t('paymentSuccess', lang)}, KKP-2026-A4F71B</>}
              </div>
            </div>
          )}

          <div style={{ marginTop: 14, fontSize: 11.5, color: '#6B6557' }}>
            {CARRIER.email}
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PDF preview
// ─────────────────────────────────────────────────────────────
const SoberPdfPreview = ({ lang = 'fr', form, goods, distance, total, baseFee, stamp, stat, paid, onClose, onPay }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{t('documentReady', lang)}, DUT-2026-04-08821</div>
        <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>{t('appName', lang)}</h1>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {onPay && !paid && (
          <button onClick={onPay} style={{
            background: '#161413', color: '#FCD116', border: 'none', padding: '8px 16px',
            fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', borderRadius: 2,
            display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '.04em',
          }}>
            <Icon name="coin" size={13}/> {lang === 'en' ? 'Pay this bill' : 'Régler le DUT'}
          </button>
        )}
        <button style={ghostBtn()}>{t('print', lang)}</button>
        <button style={primaryBtn()}><Icon name="download" size={14}/> {t('download', lang)}</button>
        <button onClick={onClose} style={ghostBtn()}>{t('cancel', lang)}</button>
      </div>
    </div>

    {/* Faux PDF page + side rail */}
    <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 22, alignItems: 'flex-start', padding: '0 0 40px' }}>
      <div style={{ background: '#fff', boxShadow: '0 1px 0 rgba(0,0,0,.06), 0 24px 60px rgba(20,15,10,.12)',
                    border: '1px solid #E5DDC9', position: 'relative', padding: 48, fontFamily: 'Georgia, "Crimson Pro", serif', color: '#161413' }}>
        {/* watermark */}
        {!paid && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 80, color: 'rgba(206,17,38,.08)', transform: 'rotate(-22deg)', fontWeight: 700, letterSpacing: '.1em' }}>{(t('totalDue', lang)).toUpperCase()}</div>
        </div>}
        {paid && <div style={{ position: 'absolute', top: 28, right: 48, border: '2px solid #009460', color: '#009460',
                               padding: '6px 14px', transform: 'rotate(-6deg)', fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '.16em', fontSize: 14 }}>{t('paidStamp', lang)}, 28 / 04 / 2026</div>}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, paddingBottom: 16, borderBottom: '2px solid #161413' }}>
          <SealEmblem size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6557' }}>{t('republic', lang)}. Travail, Justice, Solidarité</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{t('ministry', lang)}</div>
            <div style={{ fontSize: 11.5, color: '#6B6557' }}>{t('dntt', lang)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#6B6557' }}>{t('docNumber', lang)}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700 }}>DUT-2026-04-08821</div>
            <div style={{ fontSize: 10.5, color: '#6B6557', marginTop: 2 }}>{t('issuedOn', lang)} 28 / 04 / 2026, 14:32 GMT</div>
          </div>
        </div>

        <h2 style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 22, letterSpacing: '.04em', margin: '18px 0 6px' }}>
          {t('appName', lang).toUpperCase()}
        </h2>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#6B6557', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 22 }}>
          {t('decree', lang)}
        </div>

        <PdfSection title={`I. ${t('transporter', lang)}`}>
          <PdfRow k={lang === 'en' ? 'Company' : 'Raison sociale'} v={CARRIER.name} />
          <PdfRow k="RCCM" v={CARRIER.rccm} />
          <PdfRow k="NIF" v={CARRIER.nif} />
          <PdfRow k={lang === 'en' ? 'Office' : 'Siège'} v={CARRIER.address} />
        </PdfSection>

        <PdfSection title={`II. ${t('route', lang)}`}>
          <PdfRow k={t('fromCity', lang)} v={form.fromCity} />
          <PdfRow k={t('toCity', lang)} v={form.toCity} />
          <PdfRow k={t('estimatedDistance', lang)} v={`${distance} km`} />
          <PdfRow k={t('departure', lang)} v={form.departure} />
          <PdfRow k={t('arrival', lang)} v={form.arrival} />
        </PdfSection>

        <PdfSection title={`III. ${t('cargo', lang)}`}>
          <PdfRow k={t('cargoNature', lang)} v={`${goods.label} (${goods.cat})`} />
          <PdfRow k={t('quantity', lang)} v={`${form.quantity} ${form.unit || goods.unit}`} />
          <PdfRow k={t('declaredValue', lang)} v={fmtGNF(form.value)} />
        </PdfSection>

        <PdfSection title={`IV. ${t('vehicle', lang)} & ${t('driver', lang).toLowerCase()}`}>
          <PdfRow k={t('vehicle', lang)} v={form.vehicle} />
          <PdfRow k={t('driver', lang)} v={form.driver} />
          <PdfRow k={t('licenseNumber', lang)} v="C-2018-04-771203" />
        </PdfSection>

        <PdfSection title={`V. ${t('total', lang)}`}>
          <PdfRow k={t('fee', lang)} v={fmtGNF(baseFee)} />
          <PdfRow k={t('stamp', lang)} v={fmtGNF(stamp)} />
          <PdfRow k={t('dnttShare', lang)} v={fmtGNF(stat)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #161413', paddingTop: 8, marginTop: 8 }}>
            <b>{t('totalPaid', lang)}</b><b>{fmtGNF(total)}</b>
          </div>
        </PdfSection>

        {/* Signatures + QR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px', gap: 18, marginTop: 28, paddingTop: 18, borderTop: '1px solid #DCD3BD' }}>
          <SignatureBlock title={t('transporter', lang)} name={CARRIER.director}/>
          <SignatureBlock title="DNTT" name={lang === 'en' ? 'Sworn Officer' : "L'Agent assermenté"} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <FauxQr />
            <div style={{ fontSize: 9.5, color: '#6B6557', textAlign: 'center', letterSpacing: '.08em' }}>{t('scanToVerify', lang)}<br/>dut.gov.gn/v</div>
            <div style={{ fontSize: 9, color: '#6B6557', textAlign: 'center', lineHeight: 1.4 }}>{lang === 'en' ? 'Scan with the DUT Driver app to link this STD to the phone' : 'Scannez avec l\u2019app DUT Conducteur pour lier ce DUT au téléphone'}</div>
          </div>
        </div>

        <div style={{ marginTop: 22, fontSize: 10, color: '#9A9281', textAlign: 'center', letterSpacing: '.06em' }}>
          Document généré électroniquement et opposable. Toute fraude est passible des sanctions prévues aux articles 312-1 à 312-7 du Code Pénal.
        </div>
      </div>

      {/* Side rail: État */}
      <aside>
        <div style={paperCard()}>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 8 }}>{lang === 'en' ? 'Status' : 'État'}</div>
          <StatusPill status={paid ? 'paid' : 'pending'} lang={lang}/>
          <div style={{ marginTop: 16, fontSize: 11.5, color: '#6B6557', lineHeight: 1.6 }}>
            {lang === 'en' ? 'Issued by' : 'Émis par'} <strong style={{ color: '#161413' }}>F. Camara</strong><br/>
            {lang === 'en' ? 'On' : 'Le'} 28 / 04 / 2026, 14:32 GMT
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <PairingCard lang={lang} actor="company" paid={paid} compact
                       dut={{ id: 'DUT-2026-04-08821', vehicle: form.vehicle, driver: form.driver, from: form.fromCity, to: form.toCity }}/>
        </div>
      </aside>
    </div>
  </div>
);

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
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${React.Children.count(children)}, 1fr)`, gap: 14 }}>{children}</div>
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 18px' }}>{children}</div>
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
      <span style={{ position: 'absolute', left: 0, top: 16, fontFamily: '"Caveat", "Brush Script MT", cursive', fontSize: 22, color: '#1A2B6A' }}>
        {title.includes('DNTT') ? 'F. Camara' : 'M.S. Diallo'}
      </span>
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
const SoberTransporterSidebar = ({ lang, screen, setScreen, setStep, setPaid, setPaymentState }) => {
  const Item = ({ id, icon, label, badge }) => {
    const active = screen === id || (id === 'payments' && (screen === 'payment' || screen === 'pdf')) || (id === 'history' && screen === 'pdf');
    return (
      <button className="sober-nav-btn" onClick={() => {
        if (id === 'form') { setStep(0); setPaid(false); setPaymentState('idle'); }
        setScreen(id);
      }} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px',
        background: active ? '#FBF8F2' : 'transparent', color: active ? '#161413' : '#6B6557',
        border: 'none', borderLeft: active ? '2px solid #CE1126' : '2px solid transparent',
        width: '100%', cursor: 'pointer', fontSize: 13, textAlign: 'left',
        fontWeight: active ? 600 : 500, fontFamily: 'inherit',
      }}>
        <Icon name={icon} size={17}/>
        <span className="sober-navlabel">{label}</span>
        {badge && <span className="sober-navbadge" style={{ marginLeft: 'auto', fontSize: 10, background: '#161413', color: '#FCD116', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>{badge}</span>}
      </button>
    );
  };
  return (
    <aside className="sober-nav" style={{ width: 230, background: '#FBF8F2', borderRight: '1px solid #E5DDC9', padding: '14px 0', display: 'flex', flexDirection: 'column' }}>
      <div className="sober-navhead" style={{ padding: '0 14px 10px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{t('carrierSpace', lang)}</div>
      <Item id="dashboard" icon="home" label={t('dashboard', lang)}/>
      <Item id="payments" icon="coin" label={lang === 'en' ? 'Pay bills' : 'Régler mes DUT'} badge="2"/>
      <Item id="fleet" icon="truck" label={t('fleet', lang)} badge="14"/>
      <Item id="tracking" icon="pin" label={lang === 'en' ? 'Vehicle tracking' : 'Suivi des véhicules'}/>
      <div className="sober-navhead" style={{ padding: '18px 14px 6px', fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{lang === 'en' ? 'Account' : 'Compte'}</div>
      <Item id="profile" icon="user" label={t('profile', lang) || 'Profil'}/>
      <Item id="settings" icon="gear" label={t('settings', lang)}/>
      <Item id="support" icon="help" label={t('support', lang)}/>
      <div style={{ flex: 1 }}/>
      <div className="sober-navfooter" style={{ padding: '10px 14px', fontSize: 10, color: '#9A9281', borderTop: '1px solid #E5DDC9' }}>
        {t('ministry', lang)}<br/>v 2.4.1, 04 / 2026
      </div>
    </aside>
  );
};

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

Object.assign(window, { SoberApp: SoberTransporterApp, SoberTransporterApp, SoberTransporterSidebar, SoberBottomNav });

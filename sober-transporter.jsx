// Sober Transporter (customer) platform.
// Receives bills, pays them, downloads paid DUTs. Cannot generate DUTs.

const SoberTransporterApp = ({ lang = 'fr', userState = 'overdue', initialScreen = 'dashboard' }) => {
  const [screen, setScreen] = React.useState(initialScreen); // dashboard | bills | bill | pay | history
  const [selectedId, setSelectedId] = React.useState('DUT-2026-04-08823');
  const [paymentMethod, setPaymentMethod] = React.useState('orange');
  const [paymentState, setPaymentState] = React.useState('idle'); // idle | sent | success

  const myBills = BILLS.filter((b) => b.transporterId === 'T-04812');
  const selected = myBills.find((b) => b.id === selectedId) || myBills[0];

  const openBill = (id) => { setSelectedId(id); setScreen('bill'); setPaymentState('idle'); };
  const startPay = () => setScreen('pay');
  const confirmPay = () => { setPaymentState('success'); };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F7F3EB', color: '#161413', fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 13.5, lineHeight: 1.5, overflow: 'hidden',
    }} className="sober-root">
      <FlagBar height={3}/>
      <TransporterTopBar lang={lang}/>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <TransporterSidebar lang={lang} screen={screen} setScreen={setScreen} myBills={myBills}/>
        <main style={{ flex: 1, overflow: 'auto', padding: '26px 32px', position: 'relative' }}>
          {screen === 'dashboard' && <TransporterDashboard lang={lang} myBills={myBills} userState={userState} onOpen={openBill} onAllBills={() => setScreen('bills')}/>}
          {screen === 'bills'     && <TransporterBills     lang={lang} myBills={myBills} onOpen={openBill}/>}
          {screen === 'bill'      && <TransporterBillDetail lang={lang} bill={selected} onPay={startPay} onBack={() => setScreen('bills')}/>}
          {screen === 'pay'       && <TransporterPayment   lang={lang} bill={selected} method={paymentMethod} setMethod={setPaymentMethod} state={paymentState} setState={setPaymentState} onConfirm={confirmPay} onBack={() => setScreen('bill')}/>}
          {screen === 'history'   && <TransporterHistory   lang={lang} myBills={myBills} onOpen={openBill}/>}
        </main>
      </div>
    </div>
  );
};

const TransporterTopBar = ({ lang }) => (
  <header style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 28px', background: '#fff', borderBottom: '1px solid #E5DDC9' }}>
    <div style={{ color: '#161413' }}><SealEmblem size={40}/></div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, letterSpacing: '.22em', color: '#9A9281', textTransform: 'uppercase' }}>République de Guinée, MTI, DNTT</div>
      <div style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 17, fontWeight: 500, marginTop: 2 }}>
        Document Unique de Transport <span style={{ fontSize: 11.5, color: '#9A9281', fontStyle: 'italic', marginLeft: 6 }}>(espace transporteur)</span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
      <span style={{ padding: '4px 9px', background: '#E8F2EA', color: '#1F4F2C', fontSize: 11, fontWeight: 600 }}><Icon name="check" size={11} style={{ verticalAlign: '-1px' }}/> Compte vérifié</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1px solid #E5DDC9' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>MD</div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{CARRIER.short}</div>
          <div style={{ fontSize: 10, color: '#9A9281' }}>{CARRIER.rccm}</div>
        </div>
      </div>
    </div>
  </header>
);

const TransporterSidebar = ({ lang, screen, setScreen, myBills }) => {
  const unpaid = myBills.filter(b => b.status === 'pending' || b.status === 'overdue').length;
  const Item = ({ id, icon, label, badge, badgeTone }) => {
    const active = screen === id || (id === 'bills' && (screen === 'bill' || screen === 'pay'));
    return (
      <button onClick={() => setScreen(id)} style={{
        display: 'flex', alignItems: 'center', gap: 11, padding: '11px 16px', background: active ? '#fff' : 'transparent',
        color: active ? '#161413' : '#161413', border: 'none', borderLeft: active ? '3px solid #161413' : '3px solid transparent',
        width: '100%', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 500, textAlign: 'left',
      }}>
        <Icon name={icon} size={16}/>
        <span style={{ flex: 1 }}>{label}</span>
        {badge != null && <span style={{ background: badgeTone === 'warn' ? '#CE1126' : '#161413', color: '#fff', fontSize: 10, padding: '1px 6px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>{badge}</span>}
      </button>
    );
  };
  return (
    <nav style={{ width: 232, background: '#FBF8F2', borderRight: '1px solid #E5DDC9', display: 'flex', flexDirection: 'column', padding: '18px 0' }}>
      <div style={{ fontSize: 9.5, letterSpacing: '.2em', color: '#9A9281', textTransform: 'uppercase', padding: '0 16px 8px' }}>Mon espace</div>
      <Item id="dashboard" icon="home" label="Tableau de bord"/>
      <Item id="bills"     icon="doc"  label="Mes factures DUT" badge={unpaid > 0 ? unpaid : null} badgeTone={myBills.some(b=>b.status==='overdue') ? 'warn' : 'normal'}/>
      <Item id="history"   icon="coin" label="Historique paiements"/>

      <div style={{ fontSize: 9.5, letterSpacing: '.2em', color: '#9A9281', textTransform: 'uppercase', padding: '20px 16px 8px' }}>Société</div>
      <Item id="fleet"   icon="truck" label="Ma flotte" badge={CARRIER.fleet}/>
      <Item id="drivers" icon="user" label="Conducteurs" badge={CARRIER.drivers}/>

      <div style={{ fontSize: 9.5, letterSpacing: '.2em', color: '#9A9281', textTransform: 'uppercase', padding: '20px 16px 8px' }}>Compte</div>
      <Item id="profile"  icon="user" label="Profil"/>
      <Item id="support"  icon="chat" label="Support, *144#"/>
      <Item id="settings" icon="gear" label="Paramètres"/>

      <div style={{ marginTop: 'auto', padding: '14px 16px', fontSize: 10.5, color: '#9A9281', borderTop: '1px solid #E5DDC9' }}>
        <div style={{ fontWeight: 600, color: '#6B6557' }}>{CARRIER.name}</div>
        <div style={{ marginTop: 2 }}>NIF {CARRIER.nif}, {CARRIER.fleet} véhicules</div>
      </div>
    </nav>
  );
};

const TransporterDashboard = ({ lang, myBills, userState, onOpen, onAllBills }) => {
  const unpaid = myBills.filter(b => b.status === 'pending' || b.status === 'overdue');
  const overdue = myBills.filter(b => b.status === 'overdue');
  const paid = myBills.filter(b => b.status === 'paid');
  const balance = unpaid.reduce((s, b) => s + b.amount, 0);
  const paidThisMonth = paid.reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 18, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Espace transporteur, {CARRIER.short}</div>
          <h1 style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 30, fontWeight: 500, margin: '6px 0 0' }}>
            Bonjour, <i>{CARRIER.director.split(' ').slice(-2).join(' ')}</i>.
          </h1>
          <div style={{ fontSize: 13, color: '#6B6557', marginTop: 4 }}>Vous avez <b>{unpaid.length} facture{unpaid.length > 1 ? 's' : ''} DUT</b> en attente de règlement{overdue.length > 0 && <span style={{ color: '#8A1B1B' }}>, dont <b>{overdue.length} en retard</b></span>}.</div>
        </div>
      </div>

      {/* Outstanding balance hero */}
      <section style={{
        background: overdue.length ? 'linear-gradient(135deg, #fff 0%, #FCEAEA 100%)' : '#fff',
        border: '1px solid', borderColor: overdue.length ? '#E8B6B6' : '#E5DDC9',
        borderLeft: '4px solid', borderLeftColor: overdue.length ? '#CE1126' : '#161413',
        padding: '24px 26px', marginBottom: 22, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Solde à régler</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 48, fontWeight: 600, lineHeight: 1.05, marginTop: 4, fontVariantNumeric: 'tabular-nums', color: overdue.length ? '#8A1B1B' : '#161413' }}>
            {fmtGNF(balance)}
          </div>
          <div style={{ fontSize: 12, color: '#6B6557', marginTop: 8 }}>
            Réparti sur <b>{unpaid.length}</b> facture{unpaid.length > 1 ? 's' : ''}, prochaine échéance <b>{unpaid[0]?.due || '-'}</b>
          </div>
        </div>
        <div>
          {unpaid.slice(0, 3).map((b, i) => (
            <div key={b.id} onClick={() => onOpen(b.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? '1px solid #E5DDC9' : 'none', cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: '#9A9281' }}>{b.id}</div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{b.from} → {b.to} <span style={{ color: '#9A9281' }}>({b.goodsLabel})</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtGNF(b.amount)}</div>
                <div style={{ fontSize: 10.5, color: b.status === 'overdue' ? '#8A1B1B' : '#73591F', fontWeight: 600 }}>Échéance {b.due}</div>
              </div>
              <Icon name="chev" size={14} style={{ color: '#9A9281' }}/>
            </div>
          ))}
          <button onClick={() => onOpen(unpaid[0]?.id)} style={{ ...primaryBtn(), marginTop: 14, width: '100%', justifyContent: 'center', padding: '12px 16px' }}>
            <Icon name="coin" size={15}/> Régler maintenant, {fmtGNF(unpaid[0]?.amount || 0)}
          </button>
        </div>
      </section>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <KpiTile label="Factures reçues / avril" big={String(myBills.length)} hint="émises par DNTT"/>
        <KpiTile label="Réglées ce mois"          big={String(paid.length)} hint={fmtGNF(paidThisMonth)} tone="good"/>
        <KpiTile label="En attente"               big={String(unpaid.length - overdue.length)} hint="dans les délais" tone="warn"/>
        <KpiTile label="En retard"                big={String(overdue.length)} hint="à régler sous 48 h" tone={overdue.length ? 'warn' : 'good'}/>
      </div>

      {/* Recent + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
        <section style={paperCard()}>
          <header style={cardHeader()}>
            <h2 style={cardTitle()}>Factures récentes</h2>
            <button onClick={onAllBills} style={ghostBtn()}>Voir toutes →</button>
          </header>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ color: '#9A9281', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' }}>
              {['N° DUT', 'Émis', 'Itinéraire', 'Marchandise', 'Montant', 'Statut'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 6px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {myBills.slice(0, 6).map((b, i) => (
                <tr key={b.id} onClick={() => onOpen(b.id)} style={{ cursor: 'pointer', background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                  <td style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>{b.id}</td>
                  <td style={td()}>{b.date}</td>
                  <td style={td()}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{b.from} <Icon name="arrow" size={10} style={{ color: '#9A9281' }}/> {b.to}</span></td>
                  <td style={td()}>{b.goodsLabel}</td>
                  <td style={{ ...td(), textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: '"JetBrains Mono", monospace' }}>{fmtGNF(b.amount)}</td>
                  <td style={td()}><StatusPill status={b.status} lang={lang}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={paperCard()}>
          <header style={cardHeader()}><h2 style={cardTitle()}>Comment ça marche</h2></header>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {[
              { n: 1, t: 'DNTT émet le DUT', d: 'L\'agent assermenté crée la facture après vérification.' },
              { n: 2, t: 'Vous recevez la facture', d: 'Notification par SMS et email avec le n° de référence.' },
              { n: 3, t: 'Vous réglez en ligne', d: 'Orange Money, MTN MoMo, carte ou virement bancaire.' },
              { n: 4, t: 'Téléchargez le DUT payé', d: 'PDF officiel avec QR vérifiable, opposable aux contrôles.' },
            ].map(s => (
              <li key={s.n} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: s.n > 1 ? '1px solid #E5DDC9' : 'none' }}>
                <div style={{ width: 26, height: 26, background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Crimson Pro", serif', fontWeight: 700, fontSize: 14 }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12.5 }}>{s.t}</div>
                  <div style={{ fontSize: 11.5, color: '#6B6557' }}>{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};

const TransporterBills = ({ lang, myBills, onOpen }) => {
  const [filter, setFilter] = React.useState('all');
  const [importModal, setImportModal] = React.useState(null);
  const filtered = filter === 'all' ? myBills : myBills.filter(b => b.status === filter);
  const myImports = (typeof IMPORT_BILLS !== 'undefined' ? IMPORT_BILLS : []).filter(b => b.importerKind === 'company' && b.importerId === 'TRP-04812');
  const pendingImports = myImports.filter(b => b.status === 'pending');
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Mes factures, {CARRIER.short}</div>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>Toutes mes factures</h1>
        </div>
        <button style={ghostBtn()}><Icon name="download" size={13}/> Exporter</button>
      </div>

      {pendingImports.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="ship" size={13}/> Importations de véhicules, {pendingImports.length} taxe{pendingImports.length > 1 ? 's' : ''} à régler
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: pendingImports.length > 1 ? '1fr 1fr' : '1fr', gap: 12 }}>
            {pendingImports.map(b => (
              <ImportBillCard key={b.id} bill={b} lang={lang} onView={(x) => setImportModal(x)} onPay={(x) => setImportModal(x)}/>
            ))}
          </div>
        </section>
      )}

      <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 10 }}>
        Documents Uniques de Transport (DUT)
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[
          { id: 'all',     label: `Toutes (${myBills.length})` },
          { id: 'overdue', label: `En retard (${myBills.filter(b=>b.status==='overdue').length})` },
          { id: 'pending', label: `En attente (${myBills.filter(b=>b.status==='pending').length})` },
          { id: 'paid',    label: `Payées (${myBills.filter(b=>b.status==='paid').length})` },
        ].map(c => {
          const sel = filter === c.id;
          return (
            <button key={c.id} onClick={() => setFilter(c.id)} style={{
              padding: '7px 14px', border: '1px solid', borderColor: sel ? '#161413' : '#DCD3BD',
              background: sel ? '#161413' : '#fff', color: sel ? '#FCD116' : '#161413',
              borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: sel ? 600 : 500,
            }}>{c.label}</button>
          );
        })}
      </div>

      <section style={paperCard()}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr style={{ color: '#9A9281', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' }}>
            {['N° DUT', 'Émis', 'Échéance', 'Itinéraire', 'Marchandise', 'Véhicule', 'Montant', 'Statut', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 6px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((b, i) => (
              <tr key={b.id} style={{ background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                <td style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>{b.id}</td>
                <td style={td()}>{b.date}</td>
                <td style={{ ...td(), color: b.status === 'overdue' ? '#8A1B1B' : '#161413', fontWeight: b.status === 'overdue' ? 600 : 400 }}>{b.due}</td>
                <td style={td()}>{b.from} → {b.to}</td>
                <td style={td()}>{b.goodsLabel} <span style={{ color: '#9A9281' }}>({b.qty.toLocaleString('fr-FR')} {b.unit})</span></td>
                <td style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>{b.vehicle}</td>
                <td style={{ ...td(), textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: '"JetBrains Mono", monospace' }}>{fmtGNF(b.amount)}</td>
                <td style={td()}><StatusPill status={b.status} lang={lang}/></td>
                <td style={td()}>
                  {b.status === 'paid'
                    ? <button onClick={() => onOpen(b.id)} style={{ ...ghostBtn(), padding: '5px 10px', fontSize: 11 }}>PDF →</button>
                    : <button onClick={() => onOpen(b.id)} style={{ ...primaryBtn(), padding: '5px 12px', fontSize: 11 }}>Payer →</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {importModal && <ImportBillModal bill={importModal} lang={lang} onClose={() => setImportModal(null)} onPay={() => setImportModal(null)}/>}
    </div>
  );
};

const TransporterBillDetail = ({ lang, bill, onPay, onBack }) => {
  const goods = GOODS.find((g) => g.code === bill.goodsCode) || GOODS[0];
  const distance = (ROUTES.find((r) => r.from === bill.from && r.to === bill.to) || { km: 254 }).km;
  const baseFee = bill.amount - 25000 - 8000;
  const isPaid = bill.status === 'paid';
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Facture {bill.id}</div>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>
            {isPaid ? 'DUT payé, prêt à télécharger' : `À régler avant le ${bill.due}`}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onBack} style={ghostBtn()}>← Mes factures</button>
          {isPaid
            ? <button style={primaryBtn()}><Icon name="download" size={14}/> Télécharger DUT</button>
            : <button onClick={onPay} style={primaryBtn()}><Icon name="coin" size={14}/> Payer {fmtGNF(bill.amount)}</button>}
        </div>
      </div>

      <div style={{ background: '#fff', boxShadow: '0 0 0 1px #E5DDC9, 0 4px 18px rgba(20,17,13,.06)', padding: '36px 44px', position: 'relative', maxWidth: 880 }}>
        {!isPaid && <div style={{ position: 'absolute', top: 28, right: 48, border: '2px solid #C8A24A', color: '#C8A24A', padding: '6px 14px', transform: 'rotate(-6deg)', fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '.16em', fontSize: 14 }}>EN ATTENTE DE PAIEMENT</div>}
        {isPaid  && <div style={{ position: 'absolute', top: 28, right: 48, border: '2px solid #009460', color: '#009460', padding: '6px 14px', transform: 'rotate(-6deg)', fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '.16em', fontSize: 14 }}>PAYÉ, {bill.paidOn}</div>}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, paddingBottom: 16, borderBottom: '2px solid #161413' }}>
          <SealEmblem size={64}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6557' }}>République de Guinée, Travail, Justice, Solidarité</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Ministère des Transports, DGTT</div>
            <div style={{ fontSize: 11.5, color: '#6B6557' }}>Direction Nationale du Transports Terrestre (DNTT)</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#6B6557' }}>RÉFÉRENCE</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700 }}>{bill.id}</div>
            <div style={{ fontSize: 10.5, color: '#6B6557', marginTop: 2 }}>Émis le {bill.date}</div>
          </div>
        </div>

        <h2 style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 22, letterSpacing: '.04em', margin: '18px 0 6px' }}>
          DOCUMENT UNIQUE DE TRANSPORT
        </h2>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#6B6557', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 22 }}>
          Arrêté n° 2025/MTI/DNTT, émis par {OFFICER.name}
        </div>

        <PdfSection title="I, Transporteur">
          <PdfRow k="Raison sociale" v={CARRIER.name}/>
          <PdfRow k="RCCM" v={CARRIER.rccm}/>
          <PdfRow k="NIF" v={CARRIER.nif}/>
        </PdfSection>
        <PdfSection title="II, Itinéraire & marchandise">
          <PdfRow k="Origine → destination" v={`${bill.from} → ${bill.to} (${distance} km)`}/>
          <PdfRow k="Marchandise" v={`${goods.label}, ${bill.qty.toLocaleString('fr-FR')} ${bill.unit}`}/>
          <PdfRow k="Véhicule / conducteur" v={`${bill.vehicle}, ${bill.driver}`}/>
        </PdfSection>
        <PdfSection title="III, Liquidation">
          <PdfRow k="Redevance kilométrique" v={fmtGNF(baseFee)}/>
          <PdfRow k="Timbre fiscal" v={fmtGNF(25000)}/>
          <PdfRow k="Quote-part DNTT" v={fmtGNF(8000)}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #161413', paddingTop: 8, marginTop: 8 }}>
            <b>{isPaid ? 'Total réglé' : `Total à régler avant ${bill.due}`}</b>
            <b style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18 }}>{fmtGNF(bill.amount)}</b>
          </div>
          {isPaid && <div style={{ marginTop: 10, fontSize: 11.5, color: '#1F4F2C' }}>✓ Réglé le {bill.paidOn} via {bill.payMethod === 'orange' ? 'Orange Money' : bill.payMethod === 'mtn' ? 'MTN MoMo' : 'Carte bancaire'}, réf. <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{bill.ref}</span></div>}
        </PdfSection>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px', gap: 18, marginTop: 28, paddingTop: 18, borderTop: '1px solid #DCD3BD' }}>
          <SignatureBlock title="Agent émetteur, DNTT" name={`${OFFICER.name}, ${OFFICER.badge}`} sig={OFFICER.signatureName}/>
          <SignatureBlock title="Le transporteur" name={CARRIER.director} sig="M.S. Diallo"/>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <FauxQr/>
            <div style={{ fontSize: 9.5, color: '#6B6557', textAlign: 'center', letterSpacing: '.08em' }}>VÉRIFIER<br/>dut.gov.gn/v</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransporterPayment = ({ lang, bill, method, setMethod, state, setState, onConfirm, onBack }) => {
  React.useEffect(() => {
    if (state === 'sent') {
      const t = setTimeout(() => setState('success'), 1800);
      return () => clearTimeout(t);
    }
  }, [state]);

  const methods = [
    { id: 'orange', label: 'Orange Money', tag: 'OM',  desc: '+224 622 14 88 03', color: '#FF6E0E' },
    { id: 'mtn',    label: 'MTN MoMo',     tag: 'MTN', desc: '+224 628 41 02 17', color: '#FFCC00' },
    { id: 'card',   label: 'Carte bancaire', tag: 'VISA', desc: 'Visa, Mastercard, GIM-UEMOA', color: '#1A1F71' },
    { id: 'bank',   label: 'Virement bancaire', tag: 'BCI', desc: 'BICIGUI, Ecobank, UBA, Vista', color: '#161413' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Règlement {bill.id}</div>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>Paiement sécurisé via KKiaPay</h1>
        </div>
        <button onClick={onBack} style={ghostBtn()}>← Retour à la facture</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22 }}>
        <section style={paperCard(true)}>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 12 }}>Choisissez un moyen de paiement</div>

          {methods.map((m) => {
            const sel = method === m.id;
            return (
              <button key={m.id} onClick={() => setMethod(m.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', marginBottom: 8,
                background: sel ? '#FBF8F2' : '#fff', border: '1px solid', borderColor: sel ? '#161413' : '#DCD3BD',
                borderLeft: sel ? `4px solid ${m.color}` : '1px solid #DCD3BD', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}>
                <span style={{ width: 44, height: 30, background: m.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, fontFamily: '"JetBrains Mono", monospace', flexShrink: 0 }}>{m.tag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
                  <div style={{ fontSize: 11.5, color: '#6B6557' }}>{m.desc}</div>
                </div>
                <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid', borderColor: sel ? '#161413' : '#DCD3BD', background: sel ? '#161413' : '#fff' }}/>
              </button>
            );
          })}

          {(method === 'orange' || method === 'mtn') && (
            <div style={{ marginTop: 18, padding: 16, background: '#FBF8F2', border: '1px solid #E5DDC9' }}>
              <Field label={`Numéro ${method === 'orange' ? 'Orange Money' : 'MTN MoMo'}`}>
                <Input defaultValue="+224 622 14 88 03"/>
              </Field>
              <div style={{ fontSize: 11.5, color: '#6B6557', marginTop: 6 }}>
                <Icon name="phone" size={12} style={{ verticalAlign: '-1px' }}/> Vous recevrez une demande de validation par USSD sur ce numéro.
              </div>
            </div>
          )}
          {method === 'card' && (
            <div style={{ marginTop: 18, padding: 16, background: '#FBF8F2', border: '1px solid #E5DDC9' }}>
              <Field label="Numéro de carte"><Input defaultValue="4532  •••• ••••  7821"/></Field>
              <FieldRow>
                <Field label="Expiration"><Input defaultValue="08 / 28"/></Field>
                <Field label="CVV"><Input defaultValue="•••"/></Field>
              </FieldRow>
            </div>
          )}

          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11.5, color: '#6B6557', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="shield" size={14} style={{ color: '#009460' }}/> Sécurisé par KKiaPay, TLS 1.3, PCI-DSS
            </div>
            <button onClick={() => setState('sent')} disabled={state !== 'idle'} style={{ ...primaryBtn(), opacity: state !== 'idle' ? .6 : 1 }}>
              {state === 'idle' && <>Confirmer, {fmtGNF(bill.amount)} →</>}
              {state === 'sent' && <>Validation en cours…</>}
              {state === 'success' && <><Icon name="check" size={14}/> Paiement reçu</>}
            </button>
          </div>
        </section>

        <aside style={paperCard(true)}>
          <div style={{ fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Détail à régler</div>
          <h3 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 22, margin: '4px 0 14px', fontWeight: 500 }}>{bill.id}</h3>
          <SummaryRow label="Itinéraire" value={`${bill.from} → ${bill.to}`}/>
          <SummaryRow label="Marchandise" value={`${bill.goodsLabel}, ${bill.qty.toLocaleString('fr-FR')} ${bill.unit}`}/>
          <SummaryRow label="Véhicule" value={bill.vehicle} mono/>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #E5DDC9' }}>
            <SummaryRow label="Redevance kilométrique" value={fmtGNF(bill.amount - 33000)}/>
            <SummaryRow label="Timbre fiscal" value={fmtGNF(25000)}/>
            <SummaryRow label="Quote-part DNTT" value={fmtGNF(8000)}/>
          </div>
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '2px solid #161413', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6557' }}>Total</span>
            <span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 26, fontWeight: 600 }}>{fmtGNF(bill.amount)}</span>
          </div>
          {state !== 'idle' && (
            <div style={{ marginTop: 16, padding: 14, background: state === 'success' ? '#E8F2EA' : '#FFF6D6', border: '1px solid', borderColor: state === 'success' ? '#BFD9C4' : '#E8D896' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: state === 'success' ? '#1F4F2C' : '#73591F' }}>
                {state === 'sent'    && <>Demande envoyée, composez <b>*144#</b> pour valider</>}
                {state === 'success' && <>✓ Paiement validé, réf. KKP-2026-{Math.floor(Math.random()*900000+100000).toString(36).toUpperCase()}</>}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const TransporterHistory = ({ lang, myBills, onOpen }) => {
  const paid = myBills.filter(b => b.status === 'paid');
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Historique des paiements</div>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>Tous mes paiements DUT</h1>
        </div>
        <button style={ghostBtn()}><Icon name="download" size={13}/> Exporter relevé</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        <KpiTile label="Total payé, 2026" big={(paid.reduce((s,b)=>s+b.amount,0)/1000000).toFixed(2)} suffix="M GNF" hint={`${paid.length} factures`} tone="good"/>
        <KpiTile label="Mois courant" big={paid.length} hint="DUT réglés en avril"/>
        <KpiTile label="Délai moyen" big="1.4" suffix="j" hint="entre émission et règlement" tone="good"/>
      </div>

      <section style={paperCard()}>
        <header style={cardHeader()}><h2 style={cardTitle()}>Reçus de paiement</h2></header>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr style={{ color: '#9A9281', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' }}>
            {['Date paiement','N° DUT','Itinéraire','Moyen','Référence KKiaPay','Montant','Reçu'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 6px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {paid.map((b, i) => (
              <tr key={b.id} style={{ background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                <td style={td()}>{b.paidOn}</td>
                <td style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>{b.id}</td>
                <td style={td()}>{b.from} → {b.to}</td>
                <td style={td()}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', background: b.payMethod === 'orange' ? '#FFE6D5' : b.payMethod === 'mtn' ? '#FFF6CC' : '#E0E4F0', color: '#161413', fontSize: 11, fontWeight: 600 }}>
                    {b.payMethod === 'orange' ? 'Orange Money' : b.payMethod === 'mtn' ? 'MTN MoMo' : 'Carte bancaire'}
                  </span>
                </td>
                <td style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#6B6557' }}>{b.ref}</td>
                <td style={{ ...td(), textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{fmtGNF(b.amount)}</td>
                <td style={td()}><button onClick={() => onOpen(b.id)} style={{ ...ghostBtn(), padding: '5px 10px', fontSize: 11 }}><Icon name="download" size={11}/> PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

Object.assign(window, { SoberTransporterApp });

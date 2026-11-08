// Sober Officer (DNTT) platform.
// The official issuing the bills: they create DUTs from scratch (transporters
// have no input). Multi-role admin look, slightly more authoritative than the
// transporter side: darker top header, gold ribbon, denser tables, official chrome.

const SoberOfficerApp = ({ lang = 'fr', initialScreen = 'dashboard', initialStep = 0, queueState = 'busy' }) => {
  const [screen, setScreen] = React.useState(initialScreen); // dashboard | issue | preview | bills
  const [step, setStep] = React.useState(initialStep);
  const [selectedBillId, setSelectedBillId] = React.useState(null);
  const [draft, setDraft] = React.useState({
    transporterId: 'T-04812',
    fromCity: 'Kamsar', toCity: 'Conakry',
    departure: '2026-05-02', arrival: '2026-05-02',
    goods: 'BAUX', quantity: 32, unit: 'tonnes', value: 18500000,
    vehicle: 'RC-4821-AC', driver: 'Ousmane Bah',
  });

  const transporter = TRANSPORTERS.find((t) => t.id === draft.transporterId) || TRANSPORTERS[0];
  const goods       = GOODS.find((g) => g.code === draft.goods) || GOODS[0];
  const distance    = (ROUTES.find((r) => r.from === draft.fromCity && r.to === draft.toCity) || { km: 254 }).km;
  const baseFee     = Math.round(distance * 1200 + draft.quantity * 800);
  const stamp       = 25000;
  const stat        = 8000;
  const total       = baseFee + stamp + stat;

  const goIssue = () => { setStep(0); setScreen('issue'); };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F7F3EB', color: '#161413', fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 13.5, lineHeight: 1.5, overflow: 'hidden',
    }} className="sober-root">
      <OfficerTopBar lang={lang} />
      <FlagBar height={3}/>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <OfficerSidebar lang={lang} screen={screen} setScreen={setScreen} setStep={setStep} />
        <main style={{ flex: 1, overflow: 'auto', padding: '26px 32px', position: 'relative' }}>
          {screen === 'dashboard' && (
            <OfficerDashboard lang={lang} queueState={queueState}
              onIssue={goIssue}
              onOpenBill={(id) => { setSelectedBillId(id); setScreen('preview'); }} />
          )}
          {screen === 'issue' && (
            <OfficerIssueForm lang={lang} draft={draft} setDraft={setDraft} step={step} setStep={setStep}
              transporter={transporter} goods={goods} distance={distance} total={total} baseFee={baseFee} stamp={stamp} stat={stat}
              onCancel={() => setScreen('dashboard')}
              onIssued={() => { setSelectedBillId('DUT-2026-04-08851'); setScreen('preview'); }} />
          )}
          {screen === 'preview' && (
            <OfficerBillPreview lang={lang} billId={selectedBillId} transporter={transporter}
              draft={draft} goods={goods} distance={distance} total={total} baseFee={baseFee} stamp={stamp} stat={stat}
              onClose={() => setScreen('bills')} onNew={goIssue} />
          )}
          {screen === 'bills' && (
            <OfficerBillsList lang={lang} onOpen={(id) => { setSelectedBillId(id); setScreen('preview'); }} />
          )}
        </main>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Top bar: darker / more authoritative for the officer side
// ─────────────────────────────────────────────────────────────
const OfficerTopBar = ({ lang }) => (
  <header style={{
    display: 'flex', alignItems: 'center', gap: 18, padding: '12px 28px',
    background: '#161413', color: '#F7F3EB', borderBottom: '1px solid #000',
  }}>
    <div style={{ color: '#FCD116' }}><SealEmblem size={42} /></div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, letterSpacing: '.22em', color: '#C8A24A', textTransform: 'uppercase' }}>{t('republic', lang)}, MTI, DNTT</div>
      <div style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 17, fontWeight: 500, letterSpacing: '-0.005em', marginTop: 2 }}>
        Plateforme officielle du Document Unique de Transport <span style={{ fontSize: 11.5, color: '#9A9281', fontStyle: 'italic', marginLeft: 6 }}>(espace agent)</span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', border: '1px solid #3a3530', background: '#221E19' }}>
        <Icon name="search" size={13} style={{ opacity: .6 }}/>
        <span style={{ color: '#9A9281' }}>Rechercher transporteur, DUT, plaque…</span>
        <span style={{ marginLeft: 14, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '1px 6px', background: '#3a3530', color: '#C8A24A' }}>⌘K</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderLeft: '1px solid #3a3530' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FCD116', color: '#161413', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>FC</div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{OFFICER.short}</div>
          <div style={{ fontSize: 10, color: '#9A9281' }}>Inspectrice, {OFFICER.badge}</div>
        </div>
      </div>
    </div>
  </header>
);

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
const OfficerSidebar = ({ lang, screen, setScreen, setStep }) => {
  const Item = ({ id, icon, label, badge }) => {
    const active = screen === id || (id === 'bills' && screen === 'preview') || (id === 'issue' && screen === 'preview' && screen === 'issue');
    return (
      <button onClick={() => { if (id === 'issue') setStep(0); setScreen(id); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 11, padding: '11px 16px', background: active ? '#161413' : 'transparent',
          color: active ? '#FCD116' : '#161413', border: 'none', borderLeft: active ? '3px solid #C8A24A' : '3px solid transparent',
          width: '100%', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 500, textAlign: 'left',
        }}>
        <Icon name={icon} size={16}/>
        <span style={{ flex: 1 }}>{label}</span>
        {badge != null && <span style={{ background: active ? '#FCD116' : '#161413', color: active ? '#161413' : '#FCD116', fontSize: 10, padding: '1px 6px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>{badge}</span>}
      </button>
    );
  };
  return (
    <nav style={{ width: 232, background: '#FBF8F2', borderRight: '1px solid #E5DDC9', display: 'flex', flexDirection: 'column', padding: '18px 0' }}>
      <div style={{ fontSize: 9.5, letterSpacing: '.2em', color: '#9A9281', textTransform: 'uppercase', padding: '0 16px 8px' }}>Émission</div>
      <Item id="dashboard" icon="home" label="Tableau de bord"/>
      <Item id="issue"     icon="plus" label="Émettre un DUT"/>
      <Item id="bills"     icon="doc"  label="Tous les DUT" badge={BILLS.length}/>

      <div style={{ fontSize: 9.5, letterSpacing: '.2em', color: '#9A9281', textTransform: 'uppercase', padding: '20px 16px 8px' }}>Référentiel</div>
      <Item id="transporters" icon="user" label="Transporteurs" badge={TRANSPORTERS.length}/>
      <Item id="vehicles"     icon="truck" label="Véhicules"/>
      <Item id="tariffs"      icon="coin" label="Grille tarifaire"/>

      <div style={{ fontSize: 9.5, letterSpacing: '.2em', color: '#9A9281', textTransform: 'uppercase', padding: '20px 16px 8px' }}>Compte</div>
      <Item id="profile"  icon="user" label={OFFICER.short}/>
      <Item id="settings" icon="gear" label="Paramètres"/>

      <div style={{ marginTop: 'auto', padding: '14px 16px', fontSize: 10.5, color: '#9A9281', borderTop: '1px solid #E5DDC9' }}>
        <div style={{ fontWeight: 600, color: '#6B6557' }}>{OFFICER.office}</div>
        <div style={{ marginTop: 2 }}>v 2.4.1, Hébergement souverain</div>
      </div>
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────
// Officer Dashboard
// ─────────────────────────────────────────────────────────────
const OfficerDashboard = ({ lang, queueState, onIssue, onOpenBill }) => {
  const today = BILLS.filter((b) => b.date.startsWith('30/04'));
  const month = BILLS;
  const totalRevenue = month.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const pending = month.filter((b) => b.status === 'pending' || b.status === 'overdue');

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 18, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Espace Agent, Bureau Conakry-Kaloum</div>
          <h1 style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 30, fontWeight: 500, margin: '6px 0 0' }}>
            Bonjour, <i>{OFFICER.short}</i>.
          </h1>
          <div style={{ fontSize: 13, color: '#6B6557', marginTop: 4 }}>Vendredi 30 avril 2026, 09:42 GMT, vous avez <b>{pending.length} DUT en attente</b> d'émission ce matin.</div>
        </div>
        <button onClick={onIssue} style={primaryBtn()}>
          <Icon name="plus" size={15}/> Émettre un nouveau DUT
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        <KpiTile label="DUT émis, aujourd'hui" big="6"  hint="3 par moi, 3 collègues" delta="+2" tone="good"/>
        <KpiTile label="DUT du mois (avril)"     big={String(month.length)} hint={`${month.filter(b=>b.status==='paid').length} payés, ${pending.length} en attente`}/>
        <KpiTile label="Recettes encaissées"     big={(totalRevenue/1000000).toFixed(2)} suffix="M GNF" hint="Reversées au Trésor public" tone="good"/>
        <KpiTile label="Paiements en retard"     big={String(month.filter(b=>b.status==='overdue').length)} hint="à relancer" tone="warn"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 22 }}>
        {/* Recent bills */}
        <section style={paperCard()}>
          <header style={cardHeader()}>
            <h2 style={cardTitle()}>Émissions récentes</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={ghostBtn()}>Aujourd'hui</button>
              <button style={{ ...ghostBtn(), background: '#161413', color: '#FCD116', border: '1px solid #161413' }}>30 jours</button>
              <button style={ghostBtn()}>Filtres</button>
            </div>
          </header>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ color: '#9A9281', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                {['N° DUT','Émis','Transporteur','Itinéraire','Marchandise','Montant','Statut'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 6px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BILLS.slice(0, 7).map((b, i) => {
                const trp = TRANSPORTERS.find(t => t.id === b.transporterId) || {};
                return (
                  <tr key={b.id} onClick={() => onOpenBill(b.id)} style={{ cursor: 'pointer', background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                    <td style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>{b.id}</td>
                    <td style={td()}>{b.date}</td>
                    <td style={td()}><div style={{ fontWeight: 500 }}>{trp.short}</div><div style={{ fontSize: 10.5, color: '#9A9281', fontFamily: '"JetBrains Mono", monospace' }}>{trp.id}</div></td>
                    <td style={td()}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{b.from} <Icon name="arrow" size={10} style={{ color: '#9A9281' }}/> {b.to}</span></td>
                    <td style={td()}>{b.goodsLabel} <span style={{ color: '#9A9281' }}>({b.qty.toLocaleString('fr-FR')} {b.unit})</span></td>
                    <td style={{ ...td(), textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtGNF(b.amount)}</td>
                    <td style={td()}><StatusPill status={b.status} lang={lang}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Activity */}
          <section style={paperCard()}>
            <header style={cardHeader()}><h2 style={cardTitle()}>Activité du jour</h2></header>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, alignItems: 'flex-end', height: 88, marginBottom: 12 }}>
              {[3, 5, 7, 4, 8, 6, 6].map((v, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ height: `${v * 9}px`, width: '100%', background: i === 6 ? '#161413' : '#DCD3BD' }}/>
                  <div style={{ fontSize: 9, color: '#9A9281', fontFamily: '"JetBrains Mono", monospace' }}>{['L','M','M','J','V','S','D'][i]}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#6B6557' }}>
              <span>39 émissions cette semaine</span>
              <span style={{ color: '#1F4F2C', fontWeight: 600 }}>+18% vs sem. dernière</span>
            </div>
          </section>

          {/* Tariff reference */}
          <section style={paperCard()}>
            <header style={cardHeader()}>
              <h2 style={cardTitle()}>Grille tarifaire en vigueur</h2>
              <span style={{ fontSize: 10.5, color: '#9A9281' }}>Arrêté 2025/MTI/DNTT</span>
            </header>
            <div style={{ fontSize: 11.5 }}>
              <SummaryRow label="Redevance kilométrique" value="1 200 GNF / km" mono/>
              <SummaryRow label="Forfait quantité" value="800 GNF / unité" mono/>
              <SummaryRow label="Timbre fiscal" value="25 000 GNF" mono/>
              <SummaryRow label="Quote-part DNTT" value="8 000 GNF" mono/>
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #E5DDC9', fontSize: 11, color: '#6B6557' }}>
                Majoration <b style={{ color: '#8A1B1B' }}>+15%</b> pour les marchandises classées dangereuses (hydrocarbures, GPL).
              </div>
            </div>
          </section>

          {/* Notice */}
          <section style={{ ...paperCard(), background: '#161413', color: '#F7F3EB', border: '1px solid #161413' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ color: '#FCD116' }}><Icon name="shield" size={22}/></div>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#C8A24A' }}>Note de service N° 2026/04/12</div>
                <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 16, marginTop: 4 }}>Vérification systématique du RCCM</div>
                <div style={{ fontSize: 11.5, color: '#9A9281', marginTop: 4 }}>Tout DUT émis sans RCCM valide engage la responsabilité personnelle de l'agent. Conformément à l'arrêté 2025/MTI/DNTT, art. 7.</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer style={{ marginTop: 28, paddingTop: 14, borderTop: '1px solid #E5DDC9', fontSize: 11, color: '#9A9281', display: 'flex', justifyContent: 'space-between' }}>
        <div>« <i>Travail, Justice, Solidarité</i> », devise nationale</div>
        <div>Connecté à : SAFI (Trésor), RCCM-CCI, KKiaPay</div>
      </footer>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Issue DUT: multi-step form (officer creates bill from scratch)
// ─────────────────────────────────────────────────────────────
const OfficerIssueForm = ({ lang, draft, setDraft, step, setStep, transporter, goods, distance, total, baseFee, stamp, stat, onCancel, onIssued }) => {
  const STEPS = ['Transporteur', 'Itinéraire', 'Marchandise & véhicule', 'Liquidation & émission'];
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Émission, Étape {step + 1} / {STEPS.length}</div>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>Émettre un Document Unique de Transport</h1>
        </div>
        <button onClick={onCancel} style={ghostBtn()}>← Annuler</button>
      </div>

      {/* Stepper */}
      <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: '0 0 22px', gap: 10, fontSize: 11.5 }}>
        {STEPS.map((label, i) => {
          const done = i < step, active = i === step;
          return (
            <li key={label} onClick={() => setStep(i)} style={{
              flex: 1, padding: '10px 12px', cursor: 'pointer',
              border: '1px solid', borderColor: active || done ? '#161413' : '#DCD3BD',
              background: active ? '#161413' : done ? '#FBF8F2' : '#fff',
              color: active ? '#FCD116' : '#161413', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: active ? '#FCD116' : done ? '#009460' : '#fff', color: active ? '#161413' : done ? '#fff' : '#6B6557',
                border: '1px solid', borderColor: active ? '#FCD116' : done ? '#009460' : '#DCD3BD',
                fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700,
              }}>{done ? '✓' : i + 1}</span>
              <span style={{ fontWeight: active ? 600 : 500 }}>{label}</span>
            </li>
          );
        })}
      </ol>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 22 }}>
        <section style={paperCard(true)}>
          {step === 0 && <StepTransporter draft={draft} set={set} transporter={transporter}/>}
          {step === 1 && <StepRouteOff   draft={draft} set={set} distance={distance}/>}
          {step === 2 && <StepCargoVeh   draft={draft} set={set}/>}
          {step === 3 && <StepLiquid     draft={draft} transporter={transporter} goods={goods} distance={distance} baseFee={baseFee} stamp={stamp} stat={stat} total={total}/>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22, paddingTop: 16, borderTop: '1px solid #E5DDC9' }}>
            <button onClick={step === 0 ? onCancel : prev} style={ghostBtn()}>{step === 0 ? 'Annuler' : '← Précédent'}</button>
            {step < STEPS.length - 1
              ? <button onClick={next} style={primaryBtn()}>Suivant →</button>
              : <button onClick={onIssued} style={primaryBtn()}><Icon name="check" size={14}/> Émettre & envoyer la facture</button>}
          </div>
        </section>

        {/* Live summary */}
        <aside style={paperCard(true)}>
          <div style={{ fontSize: 10, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Récapitulatif</div>
          <h3 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 20, margin: '4px 0 14px', fontWeight: 500 }}>DUT en cours d'émission</h3>
          <SummaryRow label="Transporteur" value={transporter.short}/>
          <SummaryRow label="RCCM" value={transporter.rccm} mono/>
          <SummaryRow label="Itinéraire" value={`${draft.fromCity} → ${draft.toCity}`}/>
          <SummaryRow label="Distance" value={`${distance} km`} mono/>
          <SummaryRow label="Marchandise" value={`${goods.label}, ${draft.quantity} ${draft.unit}`}/>
          <SummaryRow label="Véhicule" value={draft.vehicle} mono/>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #E5DDC9' }}>
            <SummaryRow label="Redevance" value={fmtGNF(baseFee)} mono/>
            <SummaryRow label="Timbre" value={fmtGNF(stamp)} mono/>
            <SummaryRow label="Quote-part DNTT" value={fmtGNF(stat)} mono/>
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '2px solid #161413', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6557' }}>Total à facturer</span>
            <span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 24, fontWeight: 600 }}>{fmtGNF(total)}</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: '#6B6557', lineHeight: 1.5 }}>
            Une fois émis, le DUT sera transmis à <b>{transporter.short}</b> pour règlement (Mobile Money, carte ou virement). Délai de paiement : <b>5 jours ouvrés</b>.
          </div>
        </aside>
      </div>
    </div>
  );
};

const StepTransporter = ({ draft, set, transporter }) => (
  <>
    <div style={{ fontSize: 11, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 14 }}>I, Transporteur destinataire</div>
    <Field label="Rechercher un transporteur (RCCM, NIF, raison sociale)">
      <Input defaultValue={transporter.name} />
    </Field>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
      {TRANSPORTERS.slice(0, 3).map((tr) => {
        const sel = draft.transporterId === tr.id;
        return (
          <button key={tr.id} onClick={() => set('transporterId', tr.id)} style={{
            textAlign: 'left', padding: 12, background: sel ? '#FBF8F2' : '#fff',
            border: '1px solid', borderColor: sel ? '#161413' : '#DCD3BD',
            borderLeft: sel ? '3px solid #FCD116' : '1px solid #DCD3BD',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{tr.short}</div>
            <div style={{ fontSize: 10.5, color: '#9A9281', fontFamily: '"JetBrains Mono", monospace' }}>{tr.id}, {tr.city}</div>
            <div style={{ fontSize: 11, color: '#6B6557', marginTop: 4 }}>{tr.fleet} véhicules, {tr.contact}</div>
          </button>
        );
      })}
    </div>

    <div style={{ background: '#FBF8F2', border: '1px solid #E5DDC9', padding: 14 }}>
      <div style={{ fontSize: 10.5, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 8 }}>Vérification automatique</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px', fontSize: 12 }}>
        <div><Icon name="check" size={11} style={{ color: '#009460', marginRight: 6 }}/> RCCM en règle</div>
        <div><Icon name="check" size={11} style={{ color: '#009460', marginRight: 6 }}/> NIF actif (Trésor)</div>
        <div><Icon name="check" size={11} style={{ color: '#009460', marginRight: 6 }}/> Carte transporteur valide jusqu'au 07/06/2026</div>
        <div><Icon name="check" size={11} style={{ color: '#009460', marginRight: 6 }}/> Aucun litige en cours</div>
      </div>
    </div>
  </>
);

const StepRouteOff = ({ draft, set, distance }) => (
  <>
    <div style={{ fontSize: 11, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 14 }}>II, Itinéraire & calendrier</div>
    <FieldRow>
      <Field label="Ville de départ"><Select value={draft.fromCity} onChange={(v) => set('fromCity', v)} options={GUINEA_CITIES}/></Field>
      <Field label="Ville d'arrivée"><Select value={draft.toCity}   onChange={(v) => set('toCity', v)}   options={GUINEA_CITIES}/></Field>
    </FieldRow>
    <FieldRow>
      <Field label="Date de départ"><Input type="date" value={draft.departure} onChange={(v) => set('departure', v)}/></Field>
      <Field label="Date d'arrivée prévue"><Input type="date" value={draft.arrival} onChange={(v) => set('arrival', v)}/></Field>
    </FieldRow>
    <div style={{ background: '#FBF8F2', border: '1px solid #E5DDC9', padding: 12, fontSize: 12 }}>
      <span style={{ color: '#6B6557' }}>Distance officielle (réf. DNTT) :</span>{' '}
      <b style={{ fontFamily: '"JetBrains Mono", monospace' }}>{distance} km</b>
      <span style={{ color: '#6B6557' }}>, Durée estimée :</span> <b>{Math.round(distance / 55)} h</b>
    </div>
  </>
);

const StepCargoVeh = ({ draft, set }) => (
  <>
    <div style={{ fontSize: 11, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 14 }}>III, Marchandise & véhicule</div>
    <Field label="Nature de la marchandise">
      <Select value={draft.goods} onChange={(v) => set('goods', v)} options={GOODS.map(g => ({ value: g.code, label: `${g.label}, ${g.cat}` }))}/>
    </Field>
    <FieldRow>
      <Field label="Quantité"><Input type="number" value={draft.quantity} onChange={(v) => set('quantity', +v || 0)}/></Field>
      <Field label="Unité"><Input value={draft.unit} onChange={(v) => set('unit', v)}/></Field>
      <Field label="Valeur déclarée (GNF)"><Input value={draft.value.toLocaleString('fr-FR')} /></Field>
    </FieldRow>
    <FieldRow>
      <Field label="Immatriculation véhicule"><Input value={draft.vehicle} onChange={(v) => set('vehicle', v)}/></Field>
      <Field label="Conducteur principal"><Input value={draft.driver} onChange={(v) => set('driver', v)}/></Field>
    </FieldRow>
  </>
);

const StepLiquid = ({ draft, transporter, goods, distance, baseFee, stamp, stat, total }) => (
  <>
    <div style={{ fontSize: 11, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 14 }}>IV, Liquidation & émission</div>
    <ReviewBlock title="Transporteur">
      <ReviewLine k="Raison sociale" v={transporter.name}/>
      <ReviewLine k="RCCM" v={transporter.rccm} mono/>
      <ReviewLine k="NIF" v={transporter.nif} mono/>
      <ReviewLine k="Contact" v={transporter.contact}/>
    </ReviewBlock>
    <ReviewBlock title="Itinéraire">
      <ReviewLine k="Origine" v={draft.fromCity}/>
      <ReviewLine k="Destination" v={draft.toCity}/>
      <ReviewLine k="Distance" v={`${distance} km`} mono/>
      <ReviewLine k="Période" v={`${draft.departure} → ${draft.arrival}`}/>
    </ReviewBlock>
    <ReviewBlock title="Marchandise & véhicule">
      <ReviewLine k="Marchandise" v={`${goods.label}, ${draft.quantity} ${draft.unit}`}/>
      <ReviewLine k="Véhicule" v={draft.vehicle} mono/>
      <ReviewLine k="Conducteur" v={draft.driver}/>
      <ReviewLine k="Valeur déclarée" v={fmtGNF(draft.value)}/>
    </ReviewBlock>

    <div style={{ background: '#161413', color: '#F7F3EB', padding: 16, marginTop: 8 }}>
      <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#C8A24A', textTransform: 'uppercase', marginBottom: 8 }}>Liquidation</div>
      <SummaryRow label={<span style={{ color: '#9A9281' }}>Redevance kilométrique ({distance} × 1 200)</span>} value={<span style={{ color: '#F7F3EB' }}>{fmtGNF(distance * 1200)}</span>} mono/>
      <SummaryRow label={<span style={{ color: '#9A9281' }}>Forfait quantité ({draft.quantity} × 800)</span>} value={<span style={{ color: '#F7F3EB' }}>{fmtGNF(draft.quantity * 800)}</span>} mono/>
      <SummaryRow label={<span style={{ color: '#9A9281' }}>Timbre fiscal</span>} value={<span style={{ color: '#F7F3EB' }}>{fmtGNF(stamp)}</span>} mono/>
      <SummaryRow label={<span style={{ color: '#9A9281' }}>Quote-part DNTT</span>} value={<span style={{ color: '#F7F3EB' }}>{fmtGNF(stat)}</span>} mono/>
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #3a3530', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 11, letterSpacing: '.18em', color: '#FCD116', textTransform: 'uppercase' }}>Total à facturer</span>
        <span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, fontWeight: 700, color: '#FCD116' }}>{fmtGNF(total)}</span>
      </div>
    </div>

    <label style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: '#6B6557' }}>
      <input type="checkbox" defaultChecked style={{ marginTop: 2 }}/>
      <span>Je certifie l'exactitude des informations ci-dessus et engage ma responsabilité d'agent assermenté (Arrêté 2025/MTI/DNTT, art. 7).</span>
    </label>
  </>
);

// ─────────────────────────────────────────────────────────────
// Bill preview (after emission): shown to officer with "send to transporter"
// ─────────────────────────────────────────────────────────────
const OfficerBillPreview = ({ lang, billId, transporter, draft, goods, distance, total, baseFee, stamp, stat, onClose, onNew }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>DUT émis, {billId || 'DUT-2026-04-08851'}</div>
        <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>Aperçu de la facture, à envoyer au transporteur</h1>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={ghostBtn()}>← Tous les DUT</button>
        <button style={ghostBtn()}>Imprimer</button>
        <button onClick={onNew} style={primaryBtn()}><Icon name="plus" size={14}/> Émettre un autre</button>
      </div>
    </div>

    {/* Banner: bill sent confirmation */}
    <div style={{ marginBottom: 18, background: '#E8F2EA', border: '1px solid #BFD9C4', borderLeft: '3px solid #009460', padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
      <Icon name="check" size={20} style={{ color: '#009460' }}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#1F4F2C' }}>DUT émis et transmis</div>
        <div style={{ fontSize: 12, color: '#1F4F2C' }}>Notification envoyée à <b>{transporter.short}</b> par SMS (+224 622 14 88 03) et email (contact@diallo-transports.gn) à 09:42 GMT.</div>
      </div>
      <span style={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: '#1F4F2C' }}>Délai paiement : 5 j</span>
    </div>

    {/* Document preview */}
    <div style={{ background: '#fff', boxShadow: '0 0 0 1px #E5DDC9, 0 4px 18px rgba(20, 17, 13, 0.06)', padding: '36px 44px', position: 'relative', maxWidth: 880 }}>
      <div style={{ position: 'absolute', top: 28, right: 48, border: '2px solid #C8A24A', color: '#C8A24A', padding: '6px 14px', transform: 'rotate(-6deg)', fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '.16em', fontSize: 14 }}>
        EN ATTENTE DE PAIEMENT
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, paddingBottom: 16, borderBottom: '2px solid #161413' }}>
        <SealEmblem size={64}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6B6557' }}>République de Guinée, Travail, Justice, Solidarité</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Ministère des Transports, Direction Générale des Transports Terrestres</div>
          <div style={{ fontSize: 11.5, color: '#6B6557' }}>Direction Nationale des Transports Terrestres (DNTT)</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#6B6557' }}>RÉFÉRENCE</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700 }}>{billId || 'DUT-2026-04-08851'}</div>
          <div style={{ fontSize: 10.5, color: '#6B6557', marginTop: 2 }}>Émis le 30 / 04 / 2026, 09:42 GMT</div>
        </div>
      </div>

      <h2 style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 22, letterSpacing: '.04em', margin: '18px 0 6px' }}>
        DOCUMENT UNIQUE DE TRANSPORT, FACTURE
      </h2>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#6B6557', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 22 }}>
        Arrêté n° 2025/MTI/DNTT du 14 janvier 2026
      </div>

      <PdfSection title="I, Transporteur destinataire">
        <PdfRow k="Raison sociale" v={transporter.name}/>
        <PdfRow k="RCCM" v={transporter.rccm}/>
        <PdfRow k="NIF" v={transporter.nif}/>
        <PdfRow k="Adresse" v={transporter.city}/>
      </PdfSection>

      <PdfSection title="II, Itinéraire">
        <PdfRow k="Origine" v={draft.fromCity}/>
        <PdfRow k="Destination" v={draft.toCity}/>
        <PdfRow k="Distance officielle" v={`${distance} km`}/>
        <PdfRow k="Période" v={`${draft.departure} → ${draft.arrival}`}/>
      </PdfSection>

      <PdfSection title="III, Marchandise & véhicule">
        <PdfRow k="Marchandise" v={`${goods.label} (${goods.cat})`}/>
        <PdfRow k="Quantité" v={`${draft.quantity} ${draft.unit}`}/>
        <PdfRow k="Véhicule" v={draft.vehicle}/>
        <PdfRow k="Conducteur" v={draft.driver}/>
      </PdfSection>

      <PdfSection title="IV, Montant à régler">
        <PdfRow k="Redevance kilométrique" v={fmtGNF(baseFee)}/>
        <PdfRow k="Timbre fiscal" v={fmtGNF(stamp)}/>
        <PdfRow k="Quote-part DNTT" v={fmtGNF(stat)}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #161413', paddingTop: 8, marginTop: 8 }}>
          <b>Total à régler avant le 05 / 05 / 2026</b>
          <b style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18 }}>{fmtGNF(total)}</b>
        </div>
      </PdfSection>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px', gap: 18, marginTop: 28, paddingTop: 18, borderTop: '1px solid #DCD3BD' }}>
        <SignatureBlock title="Agent émetteur, DNTT" name={`${OFFICER.name}, ${OFFICER.badge}`} sig={OFFICER.signatureName}/>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6B6557' }}>Modalités de paiement</div>
          <div style={{ fontSize: 11.5, color: '#6B6557', marginTop: 6, lineHeight: 1.55 }}>
            Règlement via le portail transporteur dut.gov.gn ou par SMS *144#. Moyens acceptés : Orange Money, MTN MoMo, carte bancaire, virement BICIGUI/Ecobank.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <FauxQr/>
          <div style={{ fontSize: 9.5, color: '#6B6557', textAlign: 'center', letterSpacing: '.08em' }}>VÉRIFIER<br/>dut.gov.gn/v</div>
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// All issued bills list (officer view)
// ─────────────────────────────────────────────────────────────
const OfficerBillsList = ({ lang, onOpen }) => {
  const [filter, setFilter] = React.useState('all'); // all | pending | paid | overdue
  const filtered = filter === 'all' ? BILLS : BILLS.filter(b => b.status === filter);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>Registre des émissions, 04 / 2026</div>
          <h1 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>Tous les DUT émis</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={ghostBtn()}><Icon name="download" size={13}/> Exporter CSV</button>
          <button style={primaryBtn()}><Icon name="plus" size={14}/> Nouveau DUT</button>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[
          { id: 'all',     label: `Tous (${BILLS.length})` },
          { id: 'pending', label: `En attente (${BILLS.filter(b=>b.status==='pending').length})` },
          { id: 'overdue', label: `En retard (${BILLS.filter(b=>b.status==='overdue').length})` },
          { id: 'paid',    label: `Payés (${BILLS.filter(b=>b.status==='paid').length})` },
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
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', border: '1px solid #DCD3BD', background: '#fff', fontSize: 12 }}>
          <Icon name="search" size={13} style={{ color: '#9A9281' }}/>
          <span style={{ color: '#9A9281' }}>Rechercher transporteur, plaque, n° DUT…</span>
        </div>
      </div>

      <section style={paperCard()}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ color: '#9A9281', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' }}>
              {['N° DUT','Émis','Échéance','Transporteur','Itinéraire','Marchandise','Montant','Statut',''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 6px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => {
              const trp = TRANSPORTERS.find(t => t.id === b.transporterId) || {};
              return (
                <tr key={b.id} style={{ background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                  <td style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>{b.id}</td>
                  <td style={td()}>{b.date}</td>
                  <td style={{ ...td(), color: b.status === 'overdue' ? '#8A1B1B' : '#161413', fontWeight: b.status === 'overdue' ? 600 : 400 }}>{b.due}</td>
                  <td style={td()}>
                    <div style={{ fontWeight: 500 }}>{trp.short}</div>
                    <div style={{ fontSize: 10.5, color: '#9A9281', fontFamily: '"JetBrains Mono", monospace' }}>{trp.id}</div>
                  </td>
                  <td style={td()}>{b.from} → {b.to}</td>
                  <td style={td()}>{b.goodsLabel} <span style={{ color: '#9A9281' }}>({b.qty.toLocaleString('fr-FR')} {b.unit})</span></td>
                  <td style={{ ...td(), textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: '"JetBrains Mono", monospace' }}>{fmtGNF(b.amount)}</td>
                  <td style={td()}><StatusPill status={b.status} lang={lang}/></td>
                  <td style={td()}>
                    <button onClick={() => onOpen(b.id)} style={{ ...ghostBtn(), padding: '5px 10px', fontSize: 11 }}>Ouvrir →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #E5DDC9', fontSize: 11, color: '#9A9281', display: 'flex', justifyContent: 'space-between' }}>
          <span>{filtered.length} document{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}</span>
          <span>Total facturé : <b style={{ color: '#161413', fontFamily: '"JetBrains Mono", monospace' }}>{fmtGNF(filtered.reduce((s, b) => s + b.amount, 0))}</b></span>
        </div>
      </section>
    </div>
  );
};

Object.assign(window, { SoberOfficerApp });

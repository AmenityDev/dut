// ─────────────────────────────────────────────────────────────
// MODERN · Civic Direction
// Larger type, softer shapes, an emerald primary against off-white,
// red used as a sharp accent for actions, yellow for status.
// ─────────────────────────────────────────────────────────────

const ModernApp = ({ lang = 'fr', density = 'comfortable', userState = 'active', initialScreen = 'dashboard', initialStep = 0, initialPaid = false, initialPaymentState = 'idle' }) => {
  const [screen, setScreen] = React.useState(initialScreen);
  const [step, setStep] = React.useState(initialStep);
  const [paid, setPaid] = React.useState(initialPaid);
  const [paymentMethod, setPaymentMethod] = React.useState('orange');
  const [paymentState, setPaymentState] = React.useState(initialPaymentState);
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
  const stamp = 25000, stat = 8000;
  const total = baseFee + stamp + stat;

  return (
    <div className="modern-root" style={{
      width: '100%', height: '100%', display: 'flex', background: '#F4F6F2', color: '#0F1A14',
      fontFamily: '"DM Sans", "Helvetica Neue", system-ui, sans-serif',
      fontSize: 14, lineHeight: 1.5, overflow: 'hidden',
    }}>
      <ModernSidebar screen={screen} setScreen={setScreen} setStep={setStep} setPaid={setPaid} setPaymentState={setPaymentState} lang={lang} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ModernTopBar lang={lang} />
        <main style={{ flex: 1, overflow: 'auto', padding: '28px 36px' }}>
          {screen === 'dashboard' && (
            <ModernDashboard onNew={() => { setScreen('form'); setStep(0); setPaid(false); setPaymentState('idle'); }}
                             onOpenDut={() => setScreen('pdf')} userState={userState} />
          )}
          {screen === 'form' && (
            <ModernForm form={form} setForm={setForm} step={step} setStep={setStep}
                        goods={goods} distance={distance} total={total} baseFee={baseFee} stamp={stamp} stat={stat}
                        onSubmit={() => setScreen('payment')} onCancel={() => setScreen('dashboard')} />
          )}
          {screen === 'payment' && (
            <ModernPayment total={total} method={paymentMethod} setMethod={setPaymentMethod}
                           paymentState={paymentState} setPaymentState={setPaymentState}
                           onDone={() => { setPaid(true); setScreen('pdf'); }}
                           onBack={() => setScreen('form')} />
          )}
          {screen === 'pdf' && (
            <ModernPdfPreview form={form} goods={goods} distance={distance} total={total}
                              baseFee={baseFee} stamp={stamp} stat={stat} paid={paid}
                              onClose={() => setScreen('dashboard')} />
          )}
        </main>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
const ModernSidebar = ({ screen, setScreen, setStep, setPaid, setPaymentState, lang }) => {
  const Item = ({ id, icon, label, badge }) => {
    const active = screen === id || (id === 'form' && screen === 'payment') || (id === 'history' && screen === 'pdf');
    return (
      <button onClick={() => {
        if (id === 'form') { setStep(0); setPaid(false); setPaymentState('idle'); }
        setScreen(id);
      }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
          background: active ? '#0F1A14' : 'transparent',
          color: active ? '#fff' : '#5A665E',
          border: 'none', borderRadius: 14,
          width: '100%', cursor: 'pointer', fontSize: 14, textAlign: 'left',
          fontWeight: active ? 600 : 500, fontFamily: 'inherit',
        }}>
        <Icon name={icon} size={18} />
        <span>{label}</span>
        {badge && <span style={{ marginLeft: 'auto', fontSize: 10.5, background: active ? '#FCD116' : '#E4ECE4',
                                  color: active ? '#0F1A14' : '#5A665E',
                                  padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{badge}</span>}
      </button>
    );
  };
  return (
    <aside style={{ width: 252, background: '#FFFFFF', borderRight: '1px solid #E4ECE4', padding: '22px 16px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 22px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#009460', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: 18, height: 12, background: '#FCD116', borderRadius: 1 }} />
          <div style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, background: '#CE1126', borderRadius: '50%' }} />
        </div>
        <div>
          <div style={{ fontFamily: '"Fraunces", "DM Serif Display", Georgia, serif', fontSize: 17, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.01em' }}>DUT.gn</div>
          <div style={{ fontSize: 10.5, color: '#5A665E', letterSpacing: '.04em' }}>République de Guinée</div>
        </div>
      </div>

      <Item id="dashboard" icon="home" label="Accueil" />
      <Item id="form" icon="plus" label="Nouveau DUT" />
      <Item id="history" icon="doc" label="Mes documents" badge="142" />
      <Item id="fleet" icon="truck" label="Ma flotte" />
      <Item id="drivers" icon="user" label="Conducteurs" />
      <Item id="payments" icon="coin" label="Paiements" />

      <div style={{ height: 14 }} />
      <div style={{ height: 1, background: '#E4ECE4', margin: '6px 6px 14px' }} />

      <Item id="support" icon="chat" label="Aide & support" />
      <Item id="settings" icon="gear" label="Paramètres" />

      <div style={{ flex: 1 }} />

      <div style={{ background: 'linear-gradient(160deg, #009460 0%, #00744B 100%)', padding: 16, borderRadius: 16, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(252,209,22,.18)' }}/>
        <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8 }}>Conformité</div>
        <div style={{ fontFamily: '"Fraunces", serif', fontSize: 22, lineHeight: 1.15, marginTop: 4 }}>Tout est<br/>en règle ✓</div>
        <div style={{ fontSize: 11.5, opacity: .85, marginTop: 8, lineHeight: 1.4 }}>Carte transporteur, assurance et visite technique à jour.</div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 12, background: '#F4F6F2' }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: '#0F1A14', color: '#FCD116',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>MD</div>
        <div style={{ lineHeight: 1.2, flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 12.5 }}>{CARRIER.short}</div>
          <div style={{ fontSize: 11, color: '#5A665E' }}>NIF {CARRIER.nif}</div>
        </div>
        <Icon name="chevDown" size={16} style={{ color: '#5A665E' }}/>
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────────────────────
// Top bar
// ─────────────────────────────────────────────────────────────
const ModernTopBar = ({ lang }) => (
  <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 36px', borderBottom: '1px solid #E4ECE4', background: '#fff' }}>
    <div style={{ flex: 1, position: 'relative' }}>
      <Icon name="search" size={16} style={{ position: 'absolute', left: 14, top: 11, color: '#9AA89E' }}/>
      <input placeholder="Rechercher un DUT, véhicule, conducteur, paiement…"
             style={{ width: '100%', maxWidth: 480, padding: '10px 14px 10px 38px', borderRadius: 12,
                      border: '1px solid #E4ECE4', background: '#F4F6F2', fontFamily: 'inherit', fontSize: 13.5, outline: 'none' }}/>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 4, background: '#F4F6F2', borderRadius: 99, fontSize: 12 }}>
      {['fr', 'sus', 'ful', 'man'].map((l) => (
        <span key={l} style={{ padding: '4px 10px', borderRadius: 99,
                                background: lang === l ? '#0F1A14' : 'transparent',
                                color: lang === l ? '#fff' : '#5A665E', fontWeight: lang === l ? 600 : 500 }}>
          {l === 'fr' ? 'Français' : l === 'sus' ? 'Sosokhui' : l === 'ful' ? 'Pular' : 'Maninkakan'}
        </span>
      ))}
    </div>
    <button style={{ padding: 9, borderRadius: 12, background: '#F4F6F2', border: 'none', cursor: 'pointer', position: 'relative' }}>
      <Icon name="bell" size={18} style={{ color: '#0F1A14' }}/>
      <span style={{ position: 'absolute', top: 6, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#CE1126' }}/>
    </button>
  </header>
);

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────
const ModernDashboard = ({ onNew, onOpenDut, userState }) => {
  const overdue = userState === 'overdue';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero */}
      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: '#0F1A14', color: '#fff', padding: '32px 36px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(800px 240px at 90% 20%, rgba(0,148,96,.45), transparent 60%), radial-gradient(500px 200px at 0% 100%, rgba(252,209,22,.18), transparent 60%)' }}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#FCD116', opacity: .9 }}>Avril 2026 · Espace transporteur</div>
            <h1 style={{ fontFamily: '"Fraunces", "DM Serif Display", serif', fontSize: 42, fontWeight: 500, lineHeight: 1.05, margin: '10px 0 0', letterSpacing: '-0.02em' }}>
              Bienvenue, <span style={{ fontStyle: 'italic', color: '#FCD116' }}>Mamadou</span>.<br/>
              <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 28 }}>38 DUT émis ce mois — vous êtes en règle.</span>
            </h1>
          </div>
          <button onClick={onNew} style={modernPrimaryBtn('big')}>
            <Icon name="plus" size={16}/>
            Nouveau DUT
          </button>
        </div>
      </div>

      {overdue && (
        <div style={{ padding: 16, background: '#FFF1F1', border: '1px solid #F4C8CC', borderRadius: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#CE1126', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bell" size={18}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Paiement en retard — DUT-2026-04-08698</div>
            <div style={{ fontSize: 12.5, color: '#7B3D43' }}>372 000 GNF · invalidé sous 48 h sans régularisation.</div>
          </div>
          <button style={{ ...modernPrimaryBtn(), background: '#CE1126', color: '#fff' }}>Régulariser</button>
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <ModernKpi label="Documents émis" big="38" delta="+18%" hint="vs mars 2026" tone="green" />
        <ModernKpi label="En attente" big="2" hint="372 000 GNF" tone="yellow" />
        <ModernKpi label="Encaissé · avril" big="8,42M" suffix="GNF" hint="14 transactions" tone="ink" />
        <ModernKpi label="Distance déclarée" big="11 624" suffix="km" hint="38 trajets" tone="ink" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22 }}>
        {/* Recent + activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section style={modernCard()}>
            <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 500, margin: 0 }}>Documents récents</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Tous', 'Payés', 'En attente'].map((c, i) => (
                  <span key={c} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12,
                                          background: i === 0 ? '#0F1A14' : '#F4F6F2',
                                          color: i === 0 ? '#fff' : '#5A665E', fontWeight: 500 }}>{c}</span>
                ))}
              </div>
            </header>
            <div>
              {RECENT_DUTS.map((d, i) => (
                <div key={d.id} onClick={onOpenDut} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 110px 110px 110px',
                  alignItems: 'center', gap: 14, padding: '14px 4px',
                  borderTop: i ? '1px solid #EEF2EE' : 'none', cursor: 'pointer',
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F4F6F2',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#009460' }}>
                    <Icon name="doc" size={18}/>
                  </div>
                  <div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5, fontWeight: 600 }}>{d.id}</div>
                    <div style={{ fontSize: 12, color: '#5A665E', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      {d.from} <Icon name="arrow" size={10}/> {d.to} · {d.goods}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#5A665E' }}>{d.date}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtGNF(d.amount)}</div>
                  <div><ModernPill status={d.status}/></div>
                </div>
              ))}
            </div>
          </section>

          {/* Mini chart */}
          <section style={modernCard()}>
            <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 500, margin: 0 }}>Activité — 14 derniers jours</h2>
              <span style={{ fontSize: 12, color: '#5A665E' }}>Volume DUT · GNF</span>
            </header>
            <MiniChart />
          </section>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section style={modernCard()}>
            <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 500, margin: '0 0 14px' }}>Notifications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, background: '#F8FAF7' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                background: a.kind === 'warn' ? '#FFF6D6' : a.kind === 'ok' ? '#E2F1E7' : '#F0EFEC',
                                color: a.kind === 'warn' ? '#73591F' : a.kind === 'ok' ? '#1F4F2C' : '#0F1A14',
                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={a.kind === 'warn' ? 'bell' : a.kind === 'ok' ? 'check' : 'spark'} size={16}/>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: '#5A665E', marginTop: 2 }}>{a.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...modernCard(), background: '#0F1A14', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,148,96,.4)', filter: 'blur(40px)' }}/>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#FCD116' }}>Astuce</div>
              <h3 style={{ fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 500, margin: '6px 0 8px', lineHeight: 1.2 }}>
                Pré-remplissez vos DUT avec un <i>itinéraire-modèle</i>
              </h3>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', margin: 0, lineHeight: 1.5 }}>
                Gagnez 4 minutes par document en sauvegardant Kamsar → Conakry comme trajet récurrent.
              </p>
              <button style={{ marginTop: 14, ...modernPrimaryBtn(), background: '#FCD116', color: '#0F1A14' }}>Configurer →</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Mini activity chart, hand-drawn
const MiniChart = () => {
  const data = [22, 28, 34, 26, 38, 42, 36, 31, 44, 51, 38, 46, 55, 49];
  const max = 60;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110 }}>
        {data.map((v, i) => {
          const isYesterday = i === data.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', height: `${(v / max) * 100}%`, background: isYesterday ? '#009460' : '#CDE3D5', borderRadius: 6 }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#9AA89E', marginTop: 8 }}>
        <span>15 avr.</span><span>22 avr.</span><span>28 avr.</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Form (modern variant)
// ─────────────────────────────────────────────────────────────
const ModernForm = ({ form, setForm, step, setStep, goods, distance, total, baseFee, stamp, stat, onSubmit, onCancel }) => {
  const STEPS = ['Itinéraire', 'Marchandise', 'Véhicule', 'Récapitulatif'];
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <button onClick={onCancel} style={{ ...modernGhostBtn(), padding: '4px 10px', fontSize: 12 }}>← Annuler</button>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: 36, fontWeight: 500, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>
            Nouveau Document Unique
          </h1>
          <div style={{ color: '#5A665E', fontSize: 13.5 }}>Étape {step + 1} sur {STEPS.length} · {STEPS[step]}</div>
        </div>
      </div>

      {/* Progress + stepper */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ height: 6, borderRadius: 99, background: '#E4ECE4', overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #009460, #FCD116, #CE1126)', borderRadius: 99, transition: 'width .3s' }}/>
        </div>
        <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, gap: 10 }}>
          {STEPS.map((s, i) => {
            const done = i < step, active = i === step;
            return (
              <li key={s} onClick={() => i < step && setStep(i)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 12,
                                                                            background: active ? '#0F1A14' : done ? '#E2F1E7' : '#fff',
                                                                            color: active ? '#fff' : done ? '#1F4F2C' : '#9AA89E',
                                                                            cursor: i < step ? 'pointer' : 'default',
                                                                            border: '1px solid', borderColor: active ? '#0F1A14' : done ? '#CDE3D5' : '#E4ECE4' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: active ? '#FCD116' : done ? '#009460' : '#F4F6F2', color: active ? '#0F1A14' : done ? '#fff' : '#9AA89E',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {done ? <Icon name="check" size={12} stroke={3}/> : i + 1}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 500 }}>{s}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
        <section style={{ ...modernCard(), padding: 28 }}>
          {step === 0 && <MStepRoute form={form} set={set} distance={distance}/>}
          {step === 1 && <MStepGoods form={form} set={set}/>}
          {step === 2 && <MStepVehicle form={form} set={set}/>}
          {step === 3 && <MStepReview form={form} goods={goods} distance={distance}/>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid #EEF2EE' }}>
            <button onClick={() => step === 0 ? onCancel() : setStep(step - 1)} style={modernGhostBtn()}>← {step === 0 ? 'Annuler' : 'Retour'}</button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} style={modernPrimaryBtn()}>Continuer →</button>
            ) : (
              <button onClick={onSubmit} style={modernPrimaryBtn()}>Soumettre & payer →</button>
            )}
          </div>
        </section>

        <aside style={{ ...modernCard(), padding: 24, position: 'sticky', top: 0, alignSelf: 'flex-start', background: 'linear-gradient(180deg, #fff, #F8FAF7)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5A665E' }}>Estimation</div>
          <h3 style={{ fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 500, margin: '6px 0 4px' }}>{form.fromCity} → {form.toCity}</h3>
          <div style={{ fontSize: 12.5, color: '#5A665E' }}>{distance} km · {goods.label} · {form.quantity} {form.unit || goods.unit}</div>

          <div style={{ marginTop: 18, padding: 14, background: '#fff', border: '1px solid #E4ECE4', borderRadius: 14 }}>
            <MSumRow label="Redevance kilométrique" v={fmtGNF(baseFee)}/>
            <MSumRow label="Timbre fiscal" v={fmtGNF(stamp)}/>
            <MSumRow label="Statistique DNTT" v={fmtGNF(stat)}/>
            <div style={{ borderTop: '1px dashed #CDE3D5', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 12.5, color: '#5A665E', fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: '"Fraunces", serif', fontSize: 28, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtGNF(total)}</span>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: 14, background: '#F1F8F2', borderRadius: 14, fontSize: 12, color: '#1F4F2C', display: 'flex', gap: 10 }}>
            <Icon name="shield" size={16}/>
            <span>Tarification officielle. Recettes reversées au Trésor public.</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

const MStepRoute = ({ form, set, distance }) => (
  <>
    <MFieldRow>
      <MField label="Ville de départ" icon="pin">
        <MSelect value={form.fromCity} onChange={(v) => set('fromCity', v)} options={GUINEA_CITIES}/>
      </MField>
      <MField label="Ville d'arrivée" icon="pin">
        <MSelect value={form.toCity} onChange={(v) => set('toCity', v)} options={GUINEA_CITIES}/>
      </MField>
    </MFieldRow>

    <MFieldRow>
      <MField label="Date de départ" icon="cal"><MInput type="date" value={form.departure} onChange={(v) => set('departure', v)}/></MField>
      <MField label="Date d'arrivée" icon="cal"><MInput type="date" value={form.arrival} onChange={(v) => set('arrival', v)}/></MField>
    </MFieldRow>

    {/* Map illustration */}
    <div style={{ marginTop: 8, padding: 18, background: '#F1F8F2', border: '1px solid #CDE3D5', borderRadius: 16, position: 'relative', height: 180, overflow: 'hidden' }}>
      <svg viewBox="0 0 600 200" width="100%" height="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="route" x1="0" x2="1">
            <stop offset="0" stopColor="#CE1126"/>
            <stop offset="0.5" stopColor="#FCD116"/>
            <stop offset="1" stopColor="#009460"/>
          </linearGradient>
        </defs>
        <path d="M80 140 Q 200 50 320 100 T 540 70" stroke="url(#route)" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="80" cy="140" r="8" fill="#0F1A14"/>
        <circle cx="80" cy="140" r="14" fill="none" stroke="#0F1A14" strokeOpacity=".2"/>
        <circle cx="540" cy="70" r="8" fill="#009460"/>
        <circle cx="540" cy="70" r="14" fill="none" stroke="#009460" strokeOpacity=".3"/>
        <text x="80" y="166" fontSize="13" fontFamily="DM Sans" fill="#0F1A14" fontWeight="600">{form.fromCity}</text>
        <text x="540" y="58" fontSize="13" fontFamily="DM Sans" fill="#0F1A14" fontWeight="600" textAnchor="end">{form.toCity}</text>
        <text x="300" y="40" fontSize="12" fontFamily="DM Sans" fill="#5A665E" textAnchor="middle">≈ {distance} km · ~ {Math.round(distance/55)} h</text>
      </svg>
    </div>
  </>
);

const MStepGoods = ({ form, set }) => (
  <>
    <MField label="Nature de la marchandise">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {GOODS.map((g) => {
          const sel = form.goods === g.code;
          return (
            <button key={g.code} onClick={() => set('goods', g.code)}
              style={{
                padding: 14, textAlign: 'left', borderRadius: 14,
                background: sel ? '#0F1A14' : '#fff', color: sel ? '#fff' : '#0F1A14',
                border: '1.5px solid', borderColor: sel ? '#0F1A14' : '#E4ECE4',
                cursor: 'pointer', fontFamily: 'inherit', position: 'relative',
              }}>
              {sel && <span style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#FCD116',
                                      color: '#0F1A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={11} stroke={3}/></span>}
              <div style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .7 }}>{g.cat}</div>
              <div style={{ fontFamily: '"Fraunces", serif', fontSize: 17, fontWeight: 500, marginTop: 4 }}>{g.label}</div>
              <div style={{ fontSize: 11, opacity: .7, marginTop: 4 }}>en {g.unit}</div>
            </button>
          );
        })}
      </div>
    </MField>

    <MFieldRow>
      <MField label="Quantité"><MInput type="number" value={form.quantity} onChange={(v) => set('quantity', +v || 0)}/></MField>
      <MField label="Unité"><MInput value={form.unit} onChange={(v) => set('unit', v)}/></MField>
      <MField label="Valeur déclarée (GNF)"><MInput type="number" value={form.value} onChange={(v) => set('value', +v || 0)}/></MField>
    </MFieldRow>

    <MField label="Justificatif (facture, BL, certificat)">
      <div style={{ padding: 24, border: '2px dashed #CDE3D5', background: '#F8FAF7', textAlign: 'center', borderRadius: 16 }}>
        <div style={{ display: 'inline-flex', width: 48, height: 48, borderRadius: 14, background: '#E2F1E7', color: '#009460', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="upload" size={22}/>
        </div>
        <div style={{ marginTop: 10, fontWeight: 600 }}>Glisser-déposer ou cliquer pour choisir</div>
        <div style={{ fontSize: 12, color: '#5A665E', marginTop: 4 }}>PDF · JPG · PNG — max 8 Mo</div>
      </div>
    </MField>
  </>
);

const MStepVehicle = ({ form, set }) => (
  <>
    <MField label="Choisir le véhicule">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {VEHICLES.slice(0, 4).map((v) => {
          const sel = form.vehicle === v.plate;
          return (
            <label key={v.plate} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                                          background: sel ? '#0F1A14' : '#fff', color: sel ? '#fff' : '#0F1A14',
                                          border: '1.5px solid', borderColor: sel ? '#0F1A14' : '#E4ECE4',
                                          borderRadius: 14, cursor: 'pointer' }}>
              <input type="radio" checked={sel} onChange={() => { set('vehicle', v.plate); set('driver', v.driver); }}
                     style={{ accentColor: '#FCD116' }}/>
              <div style={{ width: 56, height: 36, border: '1.5px solid', borderColor: sel ? '#FCD116' : '#0F1A14',
                            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 700,
                            background: '#FCD116', color: '#0F1A14' }}>RG</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: 13 }}>{v.plate}</div>
                <div style={{ fontSize: 11.5, opacity: .8 }}>{v.brand} · {v.capacity}</div>
              </div>
            </label>
          );
        })}
      </div>
    </MField>

    <MFieldRow>
      <MField label="Conducteur" icon="user"><MInput value={form.driver} onChange={(v) => set('driver', v)}/></MField>
      <MField label="N° permis"><MInput value="C-2018-04-771203"/></MField>
    </MFieldRow>

    <div style={{ marginTop: 6, padding: 16, background: '#F1F8F2', borderRadius: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {[
        { label: 'Visite technique', detail: 'Valide → 14 / 09 / 2026' },
        { label: 'Assurance SUNU', detail: 'Police 2026-0218' },
        { label: 'Carte transporteur', detail: 'Active → 07 / 06 / 2026' },
      ].map((c) => (
        <div key={c.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#009460', color: '#fff', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={14} stroke={3}/></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12.5 }}>{c.label}</div>
            <div style={{ fontSize: 11.5, color: '#1F4F2C' }}>{c.detail}</div>
          </div>
        </div>
      ))}
    </div>
  </>
);

const MStepReview = ({ form, goods, distance }) => (
  <>
    <div style={{ marginBottom: 16, padding: 14, background: '#FFF6D6', borderRadius: 14, color: '#73591F', fontSize: 12.5 }}>
      Vérifiez ci-dessous. Une fois soumis, le DUT n'est plus modifiable — seule une annulation motivée auprès du DNTT est possible.
    </div>

    <MReviewBlock title="Itinéraire" items={[
      ['Départ', form.fromCity], ['Arrivée', form.toCity],
      ['Distance', `${distance} km`], ['Période', `${form.departure} → ${form.arrival}`],
    ]}/>
    <MReviewBlock title="Marchandise" items={[
      ['Nature', `${goods.label} (${goods.cat})`],
      ['Quantité', `${form.quantity} ${form.unit || goods.unit}`],
      ['Valeur', fmtGNF(form.value)],
    ]}/>
    <MReviewBlock title="Véhicule & conducteur" items={[
      ['Plaque', form.vehicle], ['Conducteur', form.driver], ['Permis', 'C-2018-04-771203'],
    ]}/>

    <label style={{ marginTop: 14, display: 'flex', gap: 10, fontSize: 13, color: '#0F1A14', cursor: 'pointer' }}>
      <input type="checkbox" defaultChecked style={{ marginTop: 3, accentColor: '#009460' }}/>
      <span>Je certifie l'exactitude des informations et accepte les conditions de transport (Code des Transports, art. L.211-4).</span>
    </label>
  </>
);

// ─────────────────────────────────────────────────────────────
// Payment (modern)
// ─────────────────────────────────────────────────────────────
const ModernPayment = ({ total, method, setMethod, paymentState, setPaymentState, onDone, onBack }) => {
  React.useEffect(() => {
    if (paymentState === 'sent') {
      const t1 = setTimeout(() => setPaymentState('success'), 1800);
      const t2 = setTimeout(() => onDone(), 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [paymentState]);

  const methods = [
    { id: 'orange', label: 'Orange Money', sub: 'Mobile Money · GN', tag: 'OM',  bg: '#FF6E0E', emoji: '🟠' },
    { id: 'mtn',    label: 'MTN MoMo',     sub: 'Mobile Money · GN', tag: 'MTN', bg: '#FFCC00', emoji: '🟡' },
    { id: 'card',   label: 'Carte bancaire', sub: 'Visa · Mastercard · GIM-UEMOA', tag: 'CB',  bg: '#1A1F71', emoji: '💳' },
    { id: 'bank',   label: 'Virement',       sub: 'BICIGUI · Ecobank · UBA · Vista', tag: 'IBAN', bg: '#0F1A14', emoji: '🏦' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <button onClick={onBack} style={{ ...modernGhostBtn(), padding: '4px 10px', fontSize: 12 }}>← Modifier le DUT</button>
        <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: 36, fontWeight: 500, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>
          Paiement <i style={{ color: '#009460' }}>sécurisé</i>
        </h1>
        <div style={{ color: '#5A665E', fontSize: 13.5 }}>Traité par KKiaPay · TLS 1.3 · PCI-DSS</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22 }}>
        <section style={{ ...modernCard(), padding: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5A665E', marginBottom: 14 }}>Choisissez un moyen de paiement</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {methods.map((m) => {
              const sel = method === m.id;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  textAlign: 'left', padding: 18, borderRadius: 16, position: 'relative',
                  background: sel ? '#0F1A14' : '#fff', color: sel ? '#fff' : '#0F1A14',
                  border: '1.5px solid', borderColor: sel ? '#0F1A14' : '#E4ECE4',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: m.bg, color: '#fff',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 700, fontSize: 12, letterSpacing: '.04em' }}>{m.tag}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                      <div style={{ fontSize: 11.5, opacity: .8 }}>{m.sub}</div>
                    </div>
                  </div>
                  {sel && <div style={{ position: 'absolute', top: 14, right: 14, width: 22, height: 22, borderRadius: '50%', background: '#FCD116',
                                         color: '#0F1A14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={13} stroke={3}/></div>}
                </button>
              );
            })}
          </div>

          {(method === 'orange' || method === 'mtn') && (
            <div style={{ marginTop: 18, padding: 18, background: '#F4F6F2', borderRadius: 16 }}>
              <MField label="Numéro Mobile Money" icon="phone"><MInput defaultValue="+224 622 14 88 03"/></MField>
              <div style={{ fontSize: 12, color: '#5A665E', marginTop: 4 }}>
                Vous recevrez une demande de validation USSD — composez <b>*144#</b> pour confirmer.
              </div>
            </div>
          )}
          {method === 'card' && (
            <div style={{ marginTop: 18, padding: 18, background: '#F4F6F2', borderRadius: 16 }}>
              <MField label="Numéro de carte" icon="chip"><MInput defaultValue="4532  ••••  ••••  7821"/></MField>
              <MFieldRow>
                <MField label="Expiration"><MInput defaultValue="08 / 28"/></MField>
                <MField label="CVV"><MInput defaultValue="•••"/></MField>
              </MFieldRow>
            </div>
          )}

          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: '#5A665E', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="shield" size={14} style={{ color: '#009460' }}/> Aucune donnée bancaire stockée
            </div>
            <button onClick={() => setPaymentState('sent')} disabled={paymentState !== 'idle'}
                    style={{ ...modernPrimaryBtn('big'), opacity: paymentState !== 'idle' ? .7 : 1, minWidth: 240 }}>
              {paymentState === 'idle'    && <>Payer {fmtGNF(total)}</>}
              {paymentState === 'sent'    && <>Validation en cours…</>}
              {paymentState === 'success' && <><Icon name="check" size={16}/> Paiement reçu</>}
            </button>
          </div>
        </section>

        <aside style={{ ...modernCard(), padding: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5A665E' }}>Détail du règlement</div>
          <h3 style={{ fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 500, margin: '6px 0 14px' }}>Bauxite · Kamsar → Conakry</h3>

          <MSumRow label="Redevance kilométrique" v={fmtGNF(305000)}/>
          <MSumRow label="Timbre fiscal" v={fmtGNF(25000)}/>
          <MSumRow label="Statistique DNTT" v={fmtGNF(8000)}/>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed #CDE3D5',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12.5, color: '#5A665E' }}>Total à régler</span>
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: 32, fontWeight: 600, color: '#009460', fontVariantNumeric: 'tabular-nums' }}>{fmtGNF(total)}</span>
          </div>

          {paymentState !== 'idle' && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 14,
                          background: paymentState === 'success' ? '#E2F1E7' : '#FFF6D6',
                          color: paymentState === 'success' ? '#1F4F2C' : '#73591F', fontSize: 12.5, fontWeight: 600 }}>
              {paymentState === 'sent'    && <>📲 Demande envoyée — composez <b>*144#</b></>}
              {paymentState === 'success' && <>✓ Paiement validé · KKP-2026-A4F71B</>}
            </div>
          )}

          <div style={{ marginTop: 14, fontSize: 12, color: '#5A665E' }}>
            Reçu envoyé à <b>{CARRIER.email}</b> et disponible dans <i>Paiements</i>.
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PDF preview (modern shell)
// ─────────────────────────────────────────────────────────────
const ModernPdfPreview = ({ form, goods, distance, total, baseFee, stamp, stat, paid, onClose }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
      <div>
        <button onClick={onClose} style={{ ...modernGhostBtn(), padding: '4px 10px', fontSize: 12 }}>← Tableau de bord</button>
        <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: 32, fontWeight: 500, margin: '8px 0 0', letterSpacing: '-0.02em' }}>
          Votre DUT est prêt {paid && <span style={{ color: '#009460' }}>· payé ✓</span>}
        </h1>
        <div style={{ color: '#5A665E', fontSize: 13.5, marginTop: 4 }}>DUT-2026-04-08821 · émis 28 / 04 / 2026</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={modernGhostBtn()}>Partager</button>
        <button style={modernPrimaryBtn()}><Icon name="download" size={14}/> Télécharger PDF</button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 22, alignItems: 'flex-start' }}>
      <div style={modernCard()}>
        {/* Faux PDF inside soft modern frame */}
        <div style={{ background: '#fff', border: '1px solid #E4ECE4', borderRadius: 12, padding: 36, position: 'relative', fontFamily: 'Georgia, "Crimson Pro", serif', color: '#0F1A14' }}>
          {paid && <div style={{ position: 'absolute', top: 24, right: 36, border: '2px solid #009460', color: '#009460',
                                 padding: '4px 12px', transform: 'rotate(-6deg)', fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '.16em', fontSize: 12 }}>PAYÉ</div>}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: 14, borderBottom: '2px solid #0F1A14' }}>
            <SealEmblem size={52}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#5A665E' }}>République de Guinée — Travail · Justice · Solidarité</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Ministère des Transports · DGTT · DNTT</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, letterSpacing: '.18em', color: '#5A665E' }}>RÉFÉRENCE</div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 700 }}>DUT-2026-04-08821</div>
            </div>
          </div>

          <h2 style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 19, letterSpacing: '.04em', margin: '14px 0 4px' }}>
            DOCUMENT UNIQUE DE TRANSPORT
          </h2>
          <div style={{ textAlign: 'center', fontSize: 10, color: '#5A665E', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
            Arrêté n° 2025/MTI/DNTT du 14 janvier 2026
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <PdfMini title="Transporteur" rows={[['Raison', CARRIER.name], ['RCCM', CARRIER.rccm], ['NIF', CARRIER.nif]]}/>
            <PdfMini title="Itinéraire" rows={[['De', form.fromCity], ['À', form.toCity], ['Distance', `${distance} km`]]}/>
            <PdfMini title="Marchandise" rows={[['Nature', goods.label], ['Quantité', `${form.quantity} ${form.unit || goods.unit}`], ['Valeur', fmtGNF(form.value)]]}/>
            <PdfMini title="Véhicule" rows={[['Plaque', form.vehicle], ['Conducteur', form.driver], ['Permis', 'C-2018-04-771203']]}/>
          </div>

          <div style={{ marginTop: 18, padding: 14, background: '#F8FAF7', border: '1px solid #E4ECE4', borderRadius: 8 }}>
            <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5A665E', marginBottom: 6 }}>Liquidation</div>
            <PdfRow2 k="Redevance kilométrique" v={fmtGNF(baseFee)}/>
            <PdfRow2 k="Timbre fiscal" v={fmtGNF(stamp)}/>
            <PdfRow2 k="Statistique DNTT" v={fmtGNF(stat)}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #0F1A14', paddingTop: 6, marginTop: 6, fontWeight: 700, fontSize: 13.5 }}>
              <span>Total {paid ? 'réglé' : 'à régler'}</span><span>{fmtGNF(total)}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 16, marginTop: 22, paddingTop: 14, borderTop: '1px solid #E4ECE4' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5A665E' }}>Le transporteur</div>
              <div style={{ height: 36, borderBottom: '1px solid #5A665E', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, top: 12, fontFamily: '"Caveat", "Brush Script MT", cursive', fontSize: 18, color: '#1A2B6A' }}>M.S. Diallo</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5A665E' }}>Pour le DNTT</div>
              <div style={{ height: 36, borderBottom: '1px solid #5A665E', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, top: 12, fontFamily: '"Caveat", "Brush Script MT", cursive', fontSize: 18, color: '#1A2B6A' }}>F. Camara</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <FauxQr/>
              <div style={{ fontSize: 8.5, color: '#5A665E', letterSpacing: '.06em' }}>dut.gov.gn/v</div>
            </div>
          </div>
        </div>
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={modernCard()}>
          <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5A665E' }}>Statut</div>
          <div style={{ fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 500, margin: '6px 0 4px', color: paid ? '#009460' : '#73591F' }}>
            {paid ? 'Document opposable' : 'En attente de paiement'}
          </div>
          <div style={{ fontSize: 12.5, color: '#5A665E' }}>
            {paid ? 'Émis le 28/04/2026 · Validité jusqu\'au 02/05/2026' : 'Le PDF sera tamponné après règlement.'}
          </div>
        </div>

        <div style={modernCard()}>
          <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5A665E' }}>Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {[
              { i: 'download', l: 'Télécharger le PDF officiel' },
              { i: 'phone',    l: 'Recevoir par SMS' },
              { i: 'qr',       l: 'Afficher le QR pour contrôle' },
              { i: 'doc',      l: 'Dupliquer pour un nouveau trajet' },
            ].map((a) => (
              <button key={a.l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
                                          border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: '#0F1A14', textAlign: 'left' }}>
                <Icon name={a.i} size={16} style={{ color: '#009460' }}/> {a.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ ...modernCard(), background: '#0F1A14', color: '#fff' }}>
          <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#FCD116' }}>Vérification</div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <FauxQr/>
            <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
              Tout agent peut scanner ce code avec son smartphone pour authentifier le document en temps réel.
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Reusable
// ─────────────────────────────────────────────────────────────
const MField = ({ label, icon, children }) => (
  <label style={{ display: 'block', marginBottom: 14 }}>
    <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5A665E', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
      {icon && <Icon name={icon} size={12}/>} {label}
    </div>
    {children}
  </label>
);
const MFieldRow = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${React.Children.count(children)}, 1fr)`, gap: 12 }}>{children}</div>
);
const MInput = (p) => (
  <input {...p} onChange={(e) => p.onChange?.(e.target.value)} style={{
    width: '100%', padding: '12px 14px', border: '1.5px solid #E4ECE4', background: '#fff',
    borderRadius: 12, fontFamily: 'inherit', fontSize: 14, color: '#0F1A14', outline: 'none',
    boxSizing: 'border-box',
  }}/>
);
const MSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} style={{
    width: '100%', padding: '12px 14px', border: '1.5px solid #E4ECE4', background: '#fff',
    borderRadius: 12, fontFamily: 'inherit', fontSize: 14, color: '#0F1A14', outline: 'none',
  }}>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);
const MSumRow = ({ label, v }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
    <span style={{ color: '#5A665E' }}>{label}</span>
    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{v}</span>
  </div>
);
const ModernKpi = ({ label, big, suffix, hint, delta, tone }) => {
  const bg = tone === 'green' ? '#E2F1E7' : tone === 'yellow' ? '#FFF6D6' : '#fff';
  const fg = tone === 'green' ? '#1F4F2C' : tone === 'yellow' ? '#73591F' : '#0F1A14';
  return (
    <div style={{ ...modernCard(), background: bg, padding: 18 }}>
      <div style={{ fontSize: 11.5, color: fg, opacity: .7, fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: '"Fraunces", serif', fontSize: 36, fontWeight: 500, marginTop: 4, color: fg, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {big} {suffix && <span style={{ fontSize: 15, opacity: .7 }}>{suffix}</span>}
      </div>
      <div style={{ marginTop: 8, fontSize: 11.5, color: fg, opacity: .8, display: 'flex', gap: 6, alignItems: 'center' }}>
        {delta && <span style={{ background: '#009460', color: '#fff', padding: '0 6px', fontSize: 10.5, fontWeight: 600, borderRadius: 99 }}>{delta}</span>}
        {hint}
      </div>
    </div>
  );
};
const ModernPill = ({ status }) => {
  const m = {
    paid:    { bg: '#E2F1E7', fg: '#1F4F2C', label: 'Payé' },
    pending: { bg: '#FFF6D6', fg: '#73591F', label: 'En attente' },
    expired: { bg: '#FFE7EA', fg: '#8A1B1B', label: 'Expiré' },
  }[status];
  return <span style={{ background: m.bg, color: m.fg, padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 99 }}>{m.label}</span>;
};
const MReviewBlock = ({ title, items }) => (
  <div style={{ marginBottom: 12, padding: 16, background: '#F8FAF7', borderRadius: 14 }}>
    <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5A665E', marginBottom: 8 }}>{title}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 18px' }}>
      {items.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
          <span style={{ color: '#5A665E' }}>{k}</span>
          <span style={{ fontWeight: 500 }}>{v}</span>
        </div>
      ))}
    </div>
  </div>
);
const PdfMini = ({ title, rows }) => (
  <div>
    <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#5A665E', borderBottom: '1px solid #0F1A14', paddingBottom: 4, marginBottom: 6 }}>{title}</div>
    {rows.map(([k, v]) => (
      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, padding: '2px 0' }}>
        <span style={{ color: '#5A665E' }}>{k}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{v}</span>
      </div>
    ))}
  </div>
);
const PdfRow2 = ({ k, v }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
    <span style={{ color: '#5A665E' }}>{k}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</span>
  </div>
);

// styles
const modernCard = () => ({
  background: '#fff', border: '1px solid #E4ECE4', borderRadius: 20, padding: 22,
});
const modernPrimaryBtn = (size) => ({
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: size === 'big' ? '12px 22px' : '10px 18px',
  background: '#009460', color: '#fff', border: 'none',
  borderRadius: size === 'big' ? 14 : 12, cursor: 'pointer', fontFamily: 'inherit',
  fontSize: size === 'big' ? 14 : 13, fontWeight: 600,
  boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 6px 18px rgba(0,148,96,.18)',
});
const modernGhostBtn = () => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#fff',
  border: '1.5px solid #E4ECE4', color: '#0F1A14', borderRadius: 12, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
});

Object.assign(window, { ModernApp });

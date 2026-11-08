// ─────────────────────────────────────────────────────────────
// MOBILE, Responsive carrier app (iPhone-sized, fits in IOSDevice)
// Same flows: dashboard → form → payment → PDF.
// Modern civic visual language adapted for small screens.
// ─────────────────────────────────────────────────────────────

const MobileLabels = {
  fr: { hi: 'Bonjour', new: 'Nouveau DUT', recent: 'Documents récents', pay: 'Payer', back: 'Retour', next: 'Suivant', summary: 'Récapitulatif', goods: 'Marchandise', vehicle: 'Véhicule', route: 'Itinéraire', total: 'Total', overdue: 'Paiement en retard', success: 'Paiement validé', dashboard: 'Accueil', form: 'Nouveau', history: 'Mes DUT', profile: 'Profil' },
  en: { hi: 'Hello', new: 'New STD', recent: 'Recent documents', pay: 'Pay', back: 'Back', next: 'Next', summary: 'Summary', goods: 'Cargo', vehicle: 'Vehicle', route: 'Route', total: 'Total', overdue: 'Payment overdue', success: 'Payment confirmed', dashboard: 'Home', form: 'New', history: 'My STDs', profile: 'Profile' },
  sus: { hi: 'I ni sa', new: 'DUT raɲɔngɔ', recent: 'Sɛbɛ kɔrɔlen', pay: 'Sare yi', back: 'Gbilen', next: 'Ɲɔngɔ', summary: 'Tofan', goods: 'Marfayi', vehicle: 'Mobili', route: 'Kira', total: 'Hayi', overdue: 'Saren ma sɔrɔ', success: 'Saren bara sɔrɔ', dashboard: 'Tofan', form: 'Kura', history: 'N na DUT', profile: 'N profili' },
  ful: { hi: 'Jam tan', new: 'DUT keso', recent: 'Ɓe ɓennuɓe', pay: 'Yoɓ', back: 'Yiltu', next: 'Jokku', summary: 'Hollirde', goods: 'Marse', vehicle: 'Otoo', route: 'Laawol', total: 'Fof', overdue: 'Yoɓle ñawi', success: 'Yoɓle laaɓi', dashboard: 'Hollirde', form: 'Keso', history: 'DUT am', profile: 'Profil' },
  man: { hi: 'I ni sɔgɔma', new: 'DUT kura', recent: 'Sɛbɛ kɔrɔw', pay: 'Sara di', back: 'Segin', next: 'Taa', summary: 'Sigida', goods: 'Marafali', vehicle: 'Mobili', route: 'Sira', total: 'Bɛɛ', overdue: 'Sara ma di', success: 'Sara dilen', dashboard: 'Sigida', form: 'Kura', history: 'N ka DUT', profile: 'Profili' },
};

const ml = (key, lang) => (MobileLabels[lang] || MobileLabels.fr)[key] || MobileLabels.fr[key] || key;

const MobileApp = ({ lang = 'fr', userState = 'active' }) => {
  const [screen, setScreen] = React.useState('dashboard');
  const [step, setStep] = React.useState(0);
  const [paid, setPaid] = React.useState(false);
  const [paymentState, setPaymentState] = React.useState('idle');
  const [method, setMethod] = React.useState('orange');

  const total = 338000;
  const distance = 254;
  const overdue = userState === 'overdue';

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F4F6F2', color: '#0F1A14',
      fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif', fontSize: 14,
      paddingTop: 54, // status bar safe area
    }}>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 90 }}>
        {screen === 'dashboard' && <MDash lang={lang} overdue={overdue} onNew={() => { setScreen('form'); setStep(0); setPaid(false); setPaymentState('idle'); }} onOpen={() => setScreen('pdf')} />}
        {screen === 'form' && <MForm lang={lang} step={step} setStep={setStep} onSubmit={() => setScreen('payment')} onBack={() => setScreen('dashboard')} />}
        {screen === 'payment' && <MPay lang={lang} method={method} setMethod={setMethod} paymentState={paymentState} setPaymentState={setPaymentState} total={total} onDone={() => { setPaid(true); setScreen('pdf'); }} onBack={() => setScreen('form')} />}
        {screen === 'pdf' && <MPdf lang={lang} paid={paid} onClose={() => setScreen('dashboard')} />}
        {screen === 'history' && <MHistory lang={lang} onOpen={() => setScreen('pdf')} />}
        {screen === 'profile' && <MProfile lang={lang} />}
      </div>
      <MTabBar lang={lang} screen={screen} setScreen={setScreen} />
    </div>
  );
};

// Dashboard
const MDash = ({ lang, overdue, onNew, onOpen }) => (
  <div style={{ padding: '8px 18px 24px' }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: '#009460', position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 18, height: 12, background: '#FCD116', borderRadius: 1 }}/>
        <div style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, background: '#CE1126', borderRadius: '50%' }}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#5A665E', letterSpacing: '.04em' }}>DUT.gn, {CARRIER.short}</div>
        <div style={{ fontFamily: '"Fraunces", serif', fontSize: 18, fontWeight: 500, lineHeight: 1.1 }}>{ml('hi', lang)}, Mamadou</div>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fff', border: '1px solid #E4ECE4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Icon name="bell" size={16}/>
        <span style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#CE1126' }}/>
      </div>
    </div>

    {/* Hero card */}
    <div style={{ borderRadius: 22, padding: 18, background: '#0F1A14', color: '#fff', position: 'relative', overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(220px 120px at 100% 0%, rgba(0,148,96,.5), transparent 60%)' }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#FCD116' }}>Avril 2026</div>
        <div style={{ fontFamily: '"Fraunces", serif', fontSize: 32, fontWeight: 500, lineHeight: 1.05, marginTop: 6 }}>
          38 <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 18 }}>DUT émis</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>8,42 M GNF encaissés, 14 paiements</div>
        <button onClick={onNew} style={{
          marginTop: 14, width: '100%', padding: '12px 16px', background: '#FCD116', color: '#0F1A14',
          border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon name="plus" size={15} stroke={2.5}/> {ml('new', lang)}
        </button>
      </div>
    </div>

    {overdue && (
      <div style={{ padding: 12, background: '#FFE7EA', borderRadius: 14, display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: '#CE1126', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={16}/></div>
        <div style={{ flex: 1, fontSize: 12 }}>
          <div style={{ fontWeight: 700 }}>{ml('overdue', lang)}</div>
          <div style={{ color: '#7B3D43', fontSize: 11 }}>372 000 GNF, 48 h</div>
        </div>
      </div>
    )}

    {/* KPI strip */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
      <div style={{ padding: 14, background: '#fff', borderRadius: 14, border: '1px solid #E4ECE4' }}>
        <div style={{ fontSize: 10.5, color: '#5A665E', letterSpacing: '.08em' }}>EN ATTENTE</div>
        <div style={{ fontFamily: '"Fraunces", serif', fontSize: 24, fontWeight: 600, marginTop: 4 }}>2</div>
        <div style={{ fontSize: 10.5, color: '#73591F' }}>372 000 GNF</div>
      </div>
      <div style={{ padding: 14, background: '#E2F1E7', borderRadius: 14 }}>
        <div style={{ fontSize: 10.5, color: '#1F4F2C', letterSpacing: '.08em' }}>DISTANCE</div>
        <div style={{ fontFamily: '"Fraunces", serif', fontSize: 24, fontWeight: 600, marginTop: 4, color: '#1F4F2C' }}>11 624 km</div>
        <div style={{ fontSize: 10.5, color: '#1F4F2C' }}>38 trajets</div>
      </div>
    </div>

    {/* Recent */}
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
      <h3 style={{ fontFamily: '"Fraunces", serif', fontSize: 17, fontWeight: 500, margin: 0 }}>{ml('recent', lang)}</h3>
      <span style={{ fontSize: 11, color: '#5A665E' }}>Voir tout</span>
    </div>
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E4ECE4' }}>
      {RECENT_DUTS.slice(0, 4).map((d, i) => (
        <div key={d.id} onClick={onOpen} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12,
                                                    borderTop: i ? '1px solid #EEF2EE' : 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F4F6F2', color: '#009460',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="doc" size={15}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              {d.from} <Icon name="arrow" size={9}/> {d.to}
            </div>
            <div style={{ fontSize: 10.5, color: '#5A665E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.goods}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{(d.amount/1000).toFixed(0)} k</div>
            <ModernPill status={d.status}/>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Form
const MForm = ({ lang, step, setStep, onSubmit, onBack }) => {
  const [fromCity, setFromCity] = React.useState('Kamsar');
  const [toCity, setToCity] = React.useState('Conakry');
  const [goods, setGoods] = React.useState('BAUX');
  const [qty, setQty] = React.useState(32);
  const [vehicle, setVehicle] = React.useState('RC-4821-AC');
  const STEPS = [ml('route', lang), ml('goods', lang), ml('vehicle', lang), ml('summary', lang)];
  const pct = ((step + 1) / STEPS.length) * 100;
  const goodsObj = GOODS.find((g) => g.code === goods) || GOODS[0];

  return (
    <div style={{ padding: '8px 18px 24px' }}>
      <button onClick={() => step === 0 ? onBack() : setStep(step - 1)} style={{ background: 'transparent', border: 'none', color: '#0F1A14', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
        ← {ml('back', lang)}
      </button>
      <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: 26, fontWeight: 500, margin: '4px 0 4px', letterSpacing: '-0.01em' }}>{STEPS[step]}</h1>
      <div style={{ fontSize: 11.5, color: '#5A665E' }}>Étape {step + 1} / {STEPS.length}</div>

      <div style={{ height: 5, borderRadius: 99, background: '#E4ECE4', overflow: 'hidden', margin: '14px 0 18px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #009460, #FCD116, #CE1126)', borderRadius: 99 }}/>
      </div>

      {step === 0 && (
        <>
          <MobField label="De"><MobSelect value={fromCity} onChange={setFromCity} options={GUINEA_CITIES}/></MobField>
          <MobField label="Vers"><MobSelect value={toCity} onChange={setToCity} options={GUINEA_CITIES}/></MobField>
          <div style={{ padding: 14, background: '#F1F8F2', borderRadius: 14, marginTop: 4, height: 130, position: 'relative' }}>
            <svg viewBox="0 0 320 110" width="100%" height="100%">
              <defs>
                <linearGradient id="mr" x1="0" x2="1">
                  <stop offset="0" stopColor="#CE1126"/><stop offset=".5" stopColor="#FCD116"/><stop offset="1" stopColor="#009460"/>
                </linearGradient>
              </defs>
              <path d="M30 80 Q 110 30 180 60 T 290 35" stroke="url(#mr)" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <circle cx="30" cy="80" r="6" fill="#0F1A14"/>
              <circle cx="290" cy="35" r="6" fill="#009460"/>
              <text x="30" y="100" fontSize="11" fill="#0F1A14" fontWeight="600" fontFamily="DM Sans">{fromCity}</text>
              <text x="290" y="22" fontSize="11" fill="#0F1A14" fontWeight="600" textAnchor="end" fontFamily="DM Sans">{toCity}</text>
            </svg>
          </div>
          <div style={{ fontSize: 11, color: '#5A665E', marginTop: 8 }}>≈ 254 km, 5 h</div>
        </>
      )}

      {step === 1 && (
        <>
          <MobField label="Type">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {GOODS.slice(0, 6).map((g) => {
                const sel = goods === g.code;
                return (
                  <button key={g.code} onClick={() => setGoods(g.code)} style={{
                    padding: 12, borderRadius: 12, textAlign: 'left',
                    background: sel ? '#0F1A14' : '#fff', color: sel ? '#fff' : '#0F1A14',
                    border: '1.5px solid', borderColor: sel ? '#0F1A14' : '#E4ECE4', fontFamily: 'inherit',
                  }}>
                    <div style={{ fontSize: 9.5, opacity: .7, letterSpacing: '.1em' }}>{g.cat.toUpperCase()}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{g.label}</div>
                  </button>
                );
              })}
            </div>
          </MobField>
          <MobField label="Quantité"><MobInput type="number" value={qty} onChange={(v) => setQty(+v || 0)}/></MobField>
          <MobField label="Unité"><MobInput defaultValue={goodsObj.unit}/></MobField>
        </>
      )}

      {step === 2 && (
        <>
          <MobField label="Véhicule">
            {VEHICLES.slice(0, 4).map((v) => {
              const sel = vehicle === v.plate;
              return (
                <label key={v.plate} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 8,
                                              borderRadius: 12, background: sel ? '#0F1A14' : '#fff', color: sel ? '#fff' : '#0F1A14',
                                              border: '1.5px solid', borderColor: sel ? '#0F1A14' : '#E4ECE4' }}>
                  <input type="radio" checked={sel} onChange={() => setVehicle(v.plate)} style={{ accentColor: '#FCD116' }}/>
                  <div style={{ width: 44, height: 28, background: '#FCD116', color: '#0F1A14', borderRadius: 4, fontSize: 10,
                                fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>RG</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>{v.plate}</div>
                    <div style={{ fontSize: 10.5, opacity: .8 }}>{v.brand}, {v.capacity}</div>
                  </div>
                </label>
              );
            })}
          </MobField>
        </>
      )}

      {step === 3 && (
        <>
          <div style={{ padding: 14, background: '#fff', borderRadius: 14, border: '1px solid #E4ECE4' }}>
            <MSummaryLine k="Itinéraire" v={`${fromCity} → ${toCity}`}/>
            <MSummaryLine k="Marchandise" v={`${goodsObj.label}, ${qty} ${goodsObj.unit}`}/>
            <MSummaryLine k="Véhicule" v={vehicle} mono/>
            <MSummaryLine k="Distance" v="254 km"/>
            <div style={{ borderTop: '1px dashed #CDE3D5', marginTop: 8, paddingTop: 8 }}>
              <MSummaryLine k="Redevance" v="305 000 GNF"/>
              <MSummaryLine k="Timbre" v="25 000 GNF"/>
              <MSummaryLine k="DNTT" v="8 000 GNF"/>
            </div>
            <div style={{ borderTop: '2px solid #0F1A14', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, color: '#5A665E', letterSpacing: '.08em' }}>{ml('total', lang).toUpperCase()}</span>
              <span style={{ fontFamily: '"Fraunces", serif', fontSize: 24, fontWeight: 600, color: '#009460' }}>338 000 GNF</span>
            </div>
          </div>
        </>
      )}

      <button onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : onSubmit()} style={{
        marginTop: 18, width: '100%', padding: '14px 16px', background: '#009460', color: '#fff',
        border: 'none', borderRadius: 14, fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
        boxShadow: '0 6px 18px rgba(0,148,96,.25)',
      }}>
        {step < STEPS.length - 1 ? `${ml('next', lang)} →` : `${ml('pay', lang)} 338 000 GNF →`}
      </button>
    </div>
  );
};

// Payment
const MPay = ({ lang, method, setMethod, paymentState, setPaymentState, total, onDone, onBack }) => {
  React.useEffect(() => {
    if (paymentState === 'sent') {
      const a = setTimeout(() => setPaymentState('success'), 1600);
      const b = setTimeout(() => onDone(), 2600);
      return () => { clearTimeout(a); clearTimeout(b); };
    }
  }, [paymentState]);

  const methods = [
    { id: 'orange', label: 'Orange Money', tag: 'OM',  bg: '#FF6E0E' },
    { id: 'mtn',    label: 'MTN MoMo',     tag: 'MTN', bg: '#FFCC00' },
    { id: 'card',   label: 'Carte bancaire', tag: 'CB',  bg: '#1A1F71' },
    { id: 'bank',   label: 'Virement',     tag: 'IBAN', bg: '#0F1A14' },
  ];

  return (
    <div style={{ padding: '8px 18px 24px' }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#0F1A14', padding: '6px 0', fontSize: 13 }}>← {ml('back', lang)}</button>
      <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: 26, fontWeight: 500, margin: '4px 0', letterSpacing: '-0.01em' }}>{ml('pay', lang)}</h1>
      <div style={{ fontSize: 11.5, color: '#5A665E', marginBottom: 16 }}>KKiaPay, TLS 1.3, PCI-DSS</div>

      <div style={{ padding: 18, background: '#0F1A14', color: '#fff', borderRadius: 16, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,148,96,.4)', filter: 'blur(30px)' }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, color: '#FCD116', letterSpacing: '.16em' }}>{ml('total', lang).toUpperCase()}</div>
          <div style={{ fontFamily: '"Fraunces", serif', fontSize: 32, fontWeight: 600, marginTop: 4 }}>{fmtGNF(total)}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>DUT-2026-04-08821, Bauxite Kamsar → Conakry</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {methods.map((m) => {
          const sel = method === m.id;
          return (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14,
              background: sel ? '#0F1A14' : '#fff', color: sel ? '#fff' : '#0F1A14',
              border: '1.5px solid', borderColor: sel ? '#0F1A14' : '#E4ECE4',
              fontFamily: 'inherit', textAlign: 'left',
            }}>
              <div style={{ width: 40, height: 28, background: m.bg, color: '#fff', borderRadius: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{m.tag}</div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{m.label}</span>
              {sel && <Icon name="check" size={15} stroke={3} style={{ color: '#FCD116' }}/>}
            </button>
          );
        })}
      </div>

      <button onClick={() => setPaymentState('sent')} disabled={paymentState !== 'idle'} style={{
        marginTop: 16, width: '100%', padding: '14px 16px',
        background: paymentState === 'success' ? '#009460' : '#FCD116',
        color: paymentState === 'success' ? '#fff' : '#0F1A14',
        border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
        opacity: paymentState === 'sent' ? .8 : 1,
      }}>
        {paymentState === 'idle'    && <>{ml('pay', lang)} {fmtGNF(total)}</>}
        {paymentState === 'sent'    && <>*144# en cours…</>}
        {paymentState === 'success' && <>✓ {ml('success', lang)}</>}
      </button>
    </div>
  );
};

// PDF (mobile preview)
const MPdf = ({ lang, paid, onClose }) => (
  <div style={{ padding: '8px 18px 24px' }}>
    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#0F1A14', padding: '6px 0', fontSize: 13 }}>← {ml('dashboard', lang)}</button>
    <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: 24, fontWeight: 500, margin: '4px 0' }}>
      DUT prêt {paid && <span style={{ color: '#009460' }}>✓</span>}
    </h1>
    <div style={{ fontSize: 11.5, color: '#5A665E', marginBottom: 14 }}>DUT-2026-04-08821</div>

    <div style={{ background: '#fff', borderRadius: 14, padding: 18, border: '1px solid #E4ECE4', position: 'relative', fontFamily: 'Georgia, serif', color: '#0F1A14' }}>
      {paid && <div style={{ position: 'absolute', top: 12, right: 14, border: '1.5px solid #009460', color: '#009460',
                              padding: '2px 8px', transform: 'rotate(-6deg)', fontWeight: 700, letterSpacing: '.14em', fontSize: 9 }}>PAYÉ</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '1.5px solid #0F1A14' }}>
        <SealEmblem size={36}/>
        <div style={{ fontSize: 9, letterSpacing: '.16em', color: '#5A665E', textTransform: 'uppercase' }}>République de Guinée<br/>DGTT, DNTT</div>
      </div>
      <h2 style={{ textAlign: 'center', fontSize: 13, letterSpacing: '.04em', margin: '12px 0 4px', fontWeight: 600 }}>
        DOCUMENT UNIQUE DE TRANSPORT
      </h2>
      <div style={{ textAlign: 'center', fontSize: 8.5, color: '#5A665E', letterSpacing: '.16em', marginBottom: 12 }}>ARRÊTÉ 2025/MTI/DNTT</div>

      <PdfRowM k="Transporteur" v={CARRIER.short}/>
      <PdfRowM k="Itinéraire" v="Kamsar → Conakry"/>
      <PdfRowM k="Distance" v="254 km"/>
      <PdfRowM k="Marchandise" v="Bauxite, 32 t"/>
      <PdfRowM k="Véhicule" v="RC-4821-AC" mono/>
      <PdfRowM k="Conducteur" v="Ousmane Bah"/>

      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #0F1A14', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12 }}>
        <span>Total {paid ? 'réglé' : 'à régler'}</span><span>338 000 GNF</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 10, borderTop: '1px solid #E4ECE4' }}>
        <FauxQr/>
        <div style={{ fontSize: 9.5, color: '#5A665E', lineHeight: 1.4 }}>Scannez pour vérifier ce document<br/>sur dut.gov.gn/v</div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
      <button style={{ padding: '12px 16px', background: '#009460', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Icon name="download" size={14}/> PDF
      </button>
      <button style={{ padding: '12px 16px', background: '#fff', color: '#0F1A14', border: '1.5px solid #E4ECE4', borderRadius: 12, fontWeight: 600, fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Icon name="phone" size={14}/> SMS
      </button>
    </div>
  </div>
);

const MHistory = ({ lang, onOpen }) => (
  <div style={{ padding: '8px 18px 24px' }}>
    <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: 26, fontWeight: 500, margin: '8px 0 4px' }}>{ml('history', lang)}</h1>
    <div style={{ fontSize: 11.5, color: '#5A665E', marginBottom: 14 }}>142 documents, avril 2026</div>
    <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflow: 'auto' }}>
      {['Tous', 'Payés', 'En attente', 'Expirés'].map((c, i) => (
        <span key={c} style={{ padding: '6px 12px', borderRadius: 99, fontSize: 12, whiteSpace: 'nowrap',
                                background: i === 0 ? '#0F1A14' : '#fff',
                                color: i === 0 ? '#fff' : '#5A665E',
                                border: i === 0 ? 'none' : '1px solid #E4ECE4', fontWeight: 500 }}>{c}</span>
      ))}
    </div>
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E4ECE4' }}>
      {RECENT_DUTS.map((d, i) => (
        <div key={d.id} onClick={onOpen} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14,
                                                    borderTop: i ? '1px solid #EEF2EE' : 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F4F6F2', color: '#009460',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="doc" size={16}/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>{d.id.slice(-5)}</div>
            <div style={{ fontSize: 11, color: '#5A665E' }}>{d.from} → {d.to}, {d.date}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{(d.amount/1000).toFixed(0)} k</div>
            <ModernPill status={d.status}/>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MProfile = ({ lang }) => (
  <div style={{ padding: '8px 18px 24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: '#fff', borderRadius: 16, border: '1px solid #E4ECE4', marginBottom: 14 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: '#0F1A14', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>MD</div>
      <div>
        <div style={{ fontFamily: '"Fraunces", serif', fontSize: 18, fontWeight: 500 }}>{CARRIER.director}</div>
        <div style={{ fontSize: 11.5, color: '#5A665E' }}>{CARRIER.short}</div>
        <div style={{ fontSize: 10.5, color: '#5A665E', marginTop: 2 }}>NIF {CARRIER.nif}</div>
      </div>
    </div>
    {[
      { i: 'truck', l: 'Ma flotte', d: '14 véhicules' },
      { i: 'user', l: 'Conducteurs', d: '22 actifs' },
      { i: 'shield', l: 'Documents légaux', d: 'Tous à jour' },
      { i: 'coin', l: 'Mes paiements', d: '142 transactions' },
      { i: 'chat', l: 'Aide & support', d: 'FAQ, Chat' },
      { i: 'gear', l: 'Paramètres', d: 'Langue, Notifications' },
    ].map((r, i) => (
      <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: '#fff',
                                borderRadius: i === 0 ? '12px 12px 0 0' : i === 5 ? '0 0 12px 12px' : 0,
                                borderTop: i ? '1px solid #EEF2EE' : '1px solid #E4ECE4',
                                borderLeft: '1px solid #E4ECE4', borderRight: '1px solid #E4ECE4',
                                borderBottom: i === 5 ? '1px solid #E4ECE4' : 'none' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F4F6F2', color: '#009460',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={r.i} size={15}/></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{r.l}</div>
          <div style={{ fontSize: 11, color: '#5A665E' }}>{r.d}</div>
        </div>
        <Icon name="chev" size={14} style={{ color: '#9AA89E' }}/>
      </div>
    ))}
  </div>
);

// Tab bar
const MTabBar = ({ lang, screen, setScreen }) => {
  const tabs = [
    { id: 'dashboard', icon: 'home', label: ml('dashboard', lang) },
    { id: 'history', icon: 'doc', label: ml('history', lang) },
    { id: 'form', icon: 'plus', label: ml('form', lang), primary: true },
    { id: 'profile', icon: 'user', label: ml('profile', lang) },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 30, left: 12, right: 12, padding: '10px 8px',
                  background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 22, border: '1px solid rgba(228,236,228,.8)',
                  display: 'flex', justifyContent: 'space-around', boxShadow: '0 10px 30px rgba(15,26,20,.08)' }}>
      {tabs.map((tab) => {
        const active = screen === tab.id || (tab.id === 'form' && (screen === 'payment' || screen === 'pdf'));
        if (tab.primary) {
          return (
            <button key={tab.id} onClick={() => setScreen(tab.id)} style={{
              width: 50, height: 50, borderRadius: 16, background: '#009460', color: '#fff',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(0,148,96,.35)', marginTop: -8,
            }}>
              <Icon name="plus" size={20} stroke={2.5}/>
            </button>
          );
        }
        return (
          <button key={tab.id} onClick={() => setScreen(tab.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: active ? '#0F1A14' : '#9AA89E',
          }}>
            <Icon name={tab.icon} size={19} stroke={active ? 2 : 1.6}/>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Form helpers
const MobField = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: 12 }}>
    <div style={{ fontSize: 10.5, color: '#5A665E', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
    {children}
  </label>
);
const MobInput = (p) => (
  <input {...p} onChange={(e) => p.onChange?.(e.target.value)} style={{
    width: '100%', padding: '12px 14px', border: '1.5px solid #E4ECE4', background: '#fff',
    borderRadius: 12, fontFamily: 'inherit', fontSize: 14, color: '#0F1A14', outline: 'none', boxSizing: 'border-box',
  }}/>
);
const MobSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} style={{
    width: '100%', padding: '12px 14px', border: '1.5px solid #E4ECE4', background: '#fff',
    borderRadius: 12, fontFamily: 'inherit', fontSize: 14, color: '#0F1A14', outline: 'none',
  }}>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);
const MSummaryLine = ({ k, v, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
    <span style={{ color: '#5A665E' }}>{k}</span>
    <span style={{ fontFamily: mono ? '"JetBrains Mono", monospace' : 'inherit', fontWeight: 500 }}>{v}</span>
  </div>
);
const PdfRowM = ({ k, v, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}>
    <span style={{ color: '#5A665E' }}>{k}</span>
    <span style={{ fontFamily: mono ? '"JetBrains Mono", monospace' : 'inherit' }}>{v}</span>
  </div>
);

Object.assign(window, { MobileApp });

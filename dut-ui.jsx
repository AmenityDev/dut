// DUT prototype: building blocks shared by the officer, company and
// individual spaces (all wired to the shared store).

// ─── Government brand block: emblem + "République de Guinée" ───────
const GovBrand = ({ title, subtitle, dark, compact }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
    <div style={{ color: dark ? '#FCD116' : '#161413', flexShrink: 0 }}><SealEmblem size={compact ? 38 : 46}/></div>
    <div style={{ borderLeft: `1px solid ${dark ? '#3A332A' : '#DCD3BD'}`, paddingLeft: 12, minWidth: 0, lineHeight: 1.15 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: dark ? '#FBF8F2' : '#161413', whiteSpace: 'nowrap' }}>République de Guinée</div>
      <div style={{ fontSize: 9.5, letterSpacing: '.12em', color: dark ? '#C8A24A' : '#8A6A1E', fontStyle: 'italic', marginTop: 1, whiteSpace: 'nowrap' }}>Travail, Justice, Solidarité</div>
      <div className="sober-topbar-emblem-text" style={{ marginTop: 4 }}>
        <div style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 16, color: dark ? '#FBF8F2' : '#161413', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 10, color: '#9A9281', letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>}
      </div>
    </div>
  </div>
);

// ─── QR (deterministic pattern from a value) ───────────────────────
const PairQr = ({ value, size = 104 }) => {
  const n = 17;
  const cells = React.useMemo(() => {
    let s = 0;
    for (const ch of String(value)) s = (s * 31 + ch.charCodeAt(0)) % 100003;
    return Array.from({ length: n * n }, (_, i) => ((i * 7919 + s * 104729) % 9973) % 7 < 3);
  }, [value]);
  const finder = (r, c) => {
    const inBox = (r0, c0) => r >= r0 && r < r0 + 5 && c >= c0 && c < c0 + 5;
    const ring = (r0, c0) => inBox(r0, c0) && (r === r0 || r === r0 + 4 || c === c0 || c === c0 + 4 || (r === r0 + 2 && c === c0 + 2));
    if (inBox(0, 0)) return ring(0, 0) ? 1 : 0;
    if (inBox(0, n - 5)) return ring(0, n - 5) ? 1 : 0;
    if (inBox(n - 5, 0)) return ring(n - 5, 0) ? 1 : 0;
    return -1;
  };
  const u = size / (n + 2);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`QR code ${value}`} style={{ background: '#fff', border: '1px solid #161413', flexShrink: 0 }}>
      {cells.map((on, i) => {
        const r = Math.floor(i / n), c = i % n;
        const f = finder(r, c);
        return (f === -1 ? on : f === 1) ? <rect key={i} x={(c + 1) * u} y={(r + 1) * u} width={u + 0.3} height={u + 0.3} fill="#161413"/> : null;
      })}
    </svg>
  );
};

const eyebrow = { fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' };
const monoStyle = { fontFamily: '"JetBrains Mono", monospace' };

// ─── The DUT document itself (screen and print) ────────────────────
const DutDocument = ({ bill, lang = 'fr' }) => {
  const s = useDut();
  const tr = sel.transporter(s, bill.transporterId) || {};
  const v = sel.vehicle(s, bill.vehicle) || {};
  const paid = bill.status === 'paid';
  const en = lang === 'en';
  return (
    <div className="dut-paper" style={{ background: '#fff', boxShadow: '0 1px 0 rgba(0,0,0,.06), 0 24px 60px rgba(20,15,10,.12)', border: '1px solid #E5DDC9', position: 'relative', padding: 'clamp(20px, 4vw, 44px)', fontFamily: 'Georgia, "Crimson Pro", serif', color: '#161413' }}>
      {bill.status === 'pending' && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ fontSize: 'clamp(40px, 8vw, 80px)', color: 'rgba(206,17,38,.08)', transform: 'rotate(-22deg)', fontWeight: 700, letterSpacing: '.1em', whiteSpace: 'nowrap' }}>{en ? 'TO BE PAID' : 'À RÉGLER'}</div>
      </div>}
      {(bill.status === 'cancelled' || bill.status === 'expired') && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: 'clamp(40px, 8vw, 80px)', color: 'rgba(22,20,19,.08)', transform: 'rotate(-22deg)', fontWeight: 700, letterSpacing: '.1em' }}>{bill.status === 'cancelled' ? 'ANNULÉ' : 'EXPIRÉ'}</div>
      </div>}
      {paid && <div style={{ position: 'absolute', top: 24, right: 24, border: '2px solid #009460', color: '#009460', padding: '6px 12px', transform: 'rotate(-6deg)', fontWeight: 700, letterSpacing: '.14em', fontSize: 13, background: '#fff' }}>{en ? 'PAID' : 'PAYÉ'}, {fmtD(bill.payment.at)}</div>}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingBottom: 14, borderBottom: '2px solid #161413', flexWrap: 'wrap' }}>
        <SealEmblem size={60}/>
        <div style={{ flex: '1 1 220px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>République de Guinée</div>
          <div style={{ fontSize: 11, fontStyle: 'italic', color: '#6B6557' }}>Travail, Justice, Solidarité</div>
          <div style={{ fontSize: 12.5, marginTop: 6 }}>Ministère des Transports</div>
          <div style={{ fontSize: 11.5, color: '#6B6557' }}>{DNTT_HQ.name}</div>
          <div style={{ fontSize: 10.5, color: '#6B6557' }}>{DNTT_HQ.address}</div>
        </div>
        <div style={{ textAlign: 'right', marginTop: paid ? 34 : 0 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#6B6557' }}>N° DU DOCUMENT</div>
          <div style={{ ...monoStyle, fontSize: 13, fontWeight: 700 }}>{bill.id}</div>
          <div style={{ fontSize: 10.5, color: '#6B6557', marginTop: 2 }}>Émis le {fmtDT(bill.issuedAt)} GMT</div>
        </div>
      </div>

      <h2 style={{ textAlign: 'center', fontWeight: 600, fontSize: 22, letterSpacing: '.04em', margin: '18px 0 4px' }}>DOCUMENT UNIQUE DE TRANSPORT</h2>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#6B6557', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>Arrêté 2025/MTI/DNTT</div>

      <PdfSection title="I. Transporteur">
        <PdfRow k={tr.kind === 'individual' ? 'Nom et prénoms' : 'Raison sociale'} v={tr.name}/>
        <PdfRow k={tr.kind === 'individual' ? 'Pièce d’identité' : 'RCCM'} v={tr.doc}/>
        <PdfRow k="Adresse" v={tr.address}/>
        <PdfRow k="Téléphone" v={tr.phone}/>
      </PdfSection>
      <PdfSection title="II. Itinéraire">
        <PdfRow k="Ville de départ" v={bill.from}/>
        <PdfRow k="Ville d’arrivée" v={bill.to}/>
        <PdfRow k="Distance estimée" v={`${bill.km} km`}/>
        <PdfRow k="Date de départ" v={fmtD(bill.departure)}/>
      </PdfSection>
      <PdfSection title="III. Marchandise">
        <PdfRow k="Nature" v={bill.goods}/>
        <PdfRow k="Quantité" v={`${String(bill.qty).replace('.', ',')} ${bill.unit}`}/>
        {bill.value > 0 && <PdfRow k="Valeur déclarée" v={fmtGNF(bill.value)}/>}
      </PdfSection>
      <PdfSection title="IV. Véhicule et conducteur">
        <PdfRow k="Immatriculation" v={bill.vehicle}/>
        <PdfRow k="Véhicule" v={v.brand ? `${v.type}, ${v.brand} ${v.year}` : '-'}/>
        <PdfRow k="Conducteur" v={bill.driver}/>
      </PdfSection>
      <PdfSection title="V. Montant">
        <PdfRow k="Prix fixe du DUT" v={`${fmtEur(TARIFF.priceEur)}, soit ${fmtGNF(bill.amount)}`}/>
        {paid && <PdfRow k="Règlement" v={`${(PROVIDERS[bill.payment.provider || bill.payment.method] || PROVIDERS.orange).label}, réf. ${bill.payment.ref}`}/>}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #161413', paddingTop: 8, marginTop: 8 }}>
          <b>{paid ? 'Total réglé' : 'Total à régler'}</b><b>{fmtGNF(bill.amount)}</b>
        </div>
      </PdfSection>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 18, marginTop: 24, paddingTop: 16, borderTop: '1px solid #DCD3BD', alignItems: 'end' }}>
        <SignatureBlock title="Transporteur" name={tr.contact}/>
        <SignatureBlock title="DNTT" name={bill.officer}/>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <PairQr value={bill.id} size={86}/>
          <div style={{ fontSize: 9, color: '#6B6557', textAlign: 'center', lineHeight: 1.4 }}>Vérifier sur dut.gov.gn/v<br/>Scanner avec l’app Conducteur pour lier ce DUT au téléphone</div>
        </div>
      </div>
      <div style={{ marginTop: 18, fontSize: 9.5, color: '#9A9281', textAlign: 'center', letterSpacing: '.04em' }}>
        Document généré électroniquement et opposable. {DNTT_HQ.name}, {DNTT_HQ.address}.
      </div>
    </div>
  );
};

// Print: shows the document in a modal; "Imprimer" prints only the document.
const PrintDutModal = ({ bill, onClose, lang }) => (
  <DutModal title={`DUT ${bill.id}`} onClose={onClose} width={820} footer={<>
    <button style={ghostBtn()} onClick={onClose}>Fermer</button>
    <button style={primaryBtn()} onClick={() => { document.body.classList.add('dut-printing'); setTimeout(() => { window.print(); document.body.classList.remove('dut-printing'); }, 50); }}>
      <Icon name="download" size={14}/> Imprimer ou enregistrer en PDF
    </button>
  </>}>
    <div className="dut-print-area"><DutDocument bill={bill} lang={lang}/></div>
  </DutModal>
);

// ─── Trip timeline (shared by tracking views) ──────────────────────
const TripTimeline = ({ billId, compact }) => {
  const s = useDut();
  const t = s.trips[billId];
  const b = sel.bill(s, billId);
  if (!t) return null;
  const wps = routeWaypoints(b.from, b.to);
  const total = wps[wps.length - 1].km || 1;
  return (
    <div>
      <div style={{ position: 'relative', height: 8, background: '#F0E9D6', margin: '6px 0 6px' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${t.progress * 100}%`, background: t.offline ? '#FCD116' : '#009460', transition: 'width .8s linear' }}/>
        {wps.map((w, i) => (
          <div key={i} title={w.city} style={{ position: 'absolute', top: -3, left: `calc(${(w.km / total) * 100}% - 7px)`, width: 14, height: 14, borderRadius: '50%', background: w.km / total <= t.progress ? '#009460' : '#fff', border: '2px solid #161413' }}/>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#6B6557', marginBottom: 10, gap: 6 }}>
        {wps.map((w, i) => <span key={i} style={{ fontWeight: i === 0 || i === wps.length - 1 ? 600 : 400 }}>{w.city}</span>)}
      </div>
      <div style={{ fontSize: 12, color: '#3A352D', display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10 }}>
        <span><b>{Math.round(t.progress * total)}</b> / {total} km</span>
        <span>{t.pings} positions GPS</span>
        <span>{t.offline ? `Hors ligne, ${t.queued} en attente` : `Dernière position ${fmtAgo(t.lastPingAt)}`}</span>
      </div>
      {!compact && (
        <div style={{ borderTop: '1px solid #F0E9D6' }}>
          {[...t.events].reverse().slice(0, 6).map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #F0E9D6', fontSize: 12 }}>
              <span style={{ ...monoStyle, fontSize: 10.5, color: '#9A9281', width: 40, flexShrink: 0, paddingTop: 1 }}>{fmtT(e.at)}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: e.kind === 'control' ? '#161413' : e.kind === 'offline' ? '#FCD116' : e.kind === 'arrive' ? '#CE1126' : '#009460' }}/>
              <span>{e.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Pairing card (generate code, SMS, QR, linked state, live trip) ──
const PairingCard = ({ lang = 'fr', billId, actor = 'company', compact = false }) => {
  const s = useDut();
  useTick(1000);
  const toast = useToast();
  const bill = sel.bill(s, billId);
  if (!bill) return null;
  const p = s.pairings[billId];
  const trip = s.trips[billId];
  const v = sel.vehicle(s, bill.vehicle) || {};
  const paid = bill.status === 'paid';
  const left = p && p.status === 'code' ? Math.max(0, Math.round((p.expiresAt - demoNow()) / 1000)) : 0;
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  const smsSent = s.driverPhone.sms.some(m => m.billId === billId && p && m.code === p.code);

  return (
    <section style={{ background: '#fff', border: '1px solid #E5DDC9', padding: compact ? 16 : 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="pin" size={16}/></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={eyebrow}>Code de jumelage</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>Suivi du véhicule</div>
        </div>
        <TripStatus billId={billId}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, padding: '10px 12px', background: '#F7F3EB', border: '1px solid #EFE8D6', marginBottom: 14, fontSize: 12 }}>
        <div><div style={{ ...eyebrow, fontSize: 9.5 }}>Véhicule</div><div style={{ ...monoStyle, fontWeight: 600 }}>{bill.vehicle}</div></div>
        <div><div style={{ ...eyebrow, fontSize: 9.5 }}>Conducteur</div><div>{bill.driver}</div></div>
        <div><div style={{ ...eyebrow, fontSize: 9.5 }}>Trajet</div><div>{bill.from} → {bill.to}</div></div>
      </div>

      {!paid && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, background: '#F7F3EB', border: '1px dashed #DCD3BD' }}>
          <Icon name="shield" size={16} style={{ color: '#6B6557', flexShrink: 0, marginTop: 2 }}/>
          <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600 }}>Disponible après le paiement du DUT.</div>
            <div style={{ color: '#6B6557', marginTop: 2 }}>Le code permet de suivre le véhicule et la marchandise depuis le téléphone du conducteur.</div>
          </div>
        </div>
      )}

      {paid && (!p || (p.status === 'code' && left === 0)) && (
        <>
          {p && <div style={{ fontSize: 12, color: '#8A1B1B', marginBottom: 8 }}>Le code précédent a expiré.</div>}
          <p style={{ fontSize: 12.5, lineHeight: 1.55, color: '#3A352D', margin: '0 0 8px' }}>
            {actor === 'officer' ? 'Générez le code pour le compte du transporteur et remettez-le au conducteur.' : 'Générez un code à 6 chiffres et transmettez-le au conducteur.'} Il le saisit dans l’application DUT Conducteur (Android et iOS) et son téléphone devient l’unité de suivi du véhicule.
          </p>
          <p style={{ fontSize: 11.5, color: '#6B6557', margin: '0 0 14px' }}>Facultatif : le suivi peut être activé à tout moment après le paiement. Le conducteur peut aussi scanner le QR code imprimé sur le DUT.</p>
          <button onClick={() => { dutActions.generatePairing(billId, actor === 'officer' ? 'officer' : 'transporter'); toast('Code de jumelage généré, valable 15 minutes'); }} style={{ ...primaryBtn(), width: '100%', justifyContent: 'center', padding: '12px 16px' }}>
            <Icon name="qr" size={15}/> Générer le code de jumelage
          </button>
        </>
      )}

      {paid && p && p.status === 'code' && left > 0 && (
        <>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {p.code.split('').map((d, i) => (
                  <div key={i} style={{ flex: '1 1 0', maxWidth: 40, height: 48, border: '1.5px solid #161413', display: 'flex', alignItems: 'center', justifyContent: 'center', ...monoStyle, fontSize: 22, fontWeight: 700 }}>{d}</div>
                ))}
              </div>
              <div style={{ fontSize: 11.5, marginTop: 8, color: '#6B6557', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="clock" size={13}/> Valable encore <b style={{ fontVariantNumeric: 'tabular-nums', color: '#161413' }}>{mm}:{ss}</b>
              </div>
            </div>
            <PairQr value={`${billId}-${p.code}`} size={compact ? 84 : 100}/>
          </div>
          <p style={{ fontSize: 11.5, lineHeight: 1.5, color: '#6B6557', margin: '12px 0' }}>Le conducteur saisit ce code dans l’application, ou scanne ce QR code ou celui du DUT : le DUT est alors lié à son téléphone.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => { dutActions.sendPairingSms(billId); toast(`Code envoyé par SMS au ${v.driverPhone || 'conducteur'}`); }} style={{ ...primaryBtn(), flex: '1 1 200px', justifyContent: 'center' }}>
              <Icon name="phone" size={14}/> {smsSent ? 'Renvoyer le SMS' : 'Envoyer par SMS au conducteur'}
            </button>
            <button onClick={() => { try { navigator.clipboard && navigator.clipboard.writeText(p.code); } catch (e) {} toast('Code copié'); }} style={ghostBtn()}>Copier</button>
            <button onClick={() => { dutActions.generatePairing(billId, actor === 'officer' ? 'officer' : 'transporter'); toast('Nouveau code généré'); }} style={ghostBtn()}><Icon name="reload" size={13}/> Nouveau code</button>
          </div>
          {smsSent && <div style={{ marginTop: 10, fontSize: 12, color: '#1F4F2C', display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="check" size={14}/> SMS reçu sur le téléphone du conducteur ({v.driverPhone}). Ouvrez l’application Conducteur pour terminer.</div>}
        </>
      )}

      {paid && p && p.status === 'linked' && (
        <>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, background: '#E8F2EA', border: '1px solid #B9D6BF', marginBottom: 12 }}>
            <Icon name="check" size={18} style={{ color: '#1F4F2C', flexShrink: 0, marginTop: 1 }}/>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: '#1F4F2C' }}>Téléphone lié {p.via === 'qr' ? 'par QR code' : 'par code'}</div>
              <div>{bill.driver}, {p.device}, {fmtAgo(p.linkedAt)}</div>
              {!trip && <div style={{ color: '#3A5A40', marginTop: 2 }}>En attente du départ (le conducteur appuie sur « Démarrer le trajet »).</div>}
            </div>
          </div>
          {trip && <TripTimeline billId={billId} compact={compact}/>}
          {(!trip || trip.status !== 'arrived') && <button onClick={() => { dutActions.unlink(billId); toast('Téléphone délié, suivi arrêté', 'info'); }} style={{ ...ghostBtn(), marginTop: 12 }}>Délier le téléphone</button>}
        </>
      )}
    </section>
  );
};

// ─── Payment panel for the transporter himself ─────────────────────
const SelfPayPanel = ({ bills, transporterId, onDone, onCancel, lang = 'fr' }) => {
  const s = useDut();
  const toast = useToast();
  const tr = sel.transporter(s, transporterId);
  const acc = tr.payAccount;
  const [method, setMethod] = React.useState(acc && acc.provider !== 'bank' ? acc.provider : 'orange');
  const [number, setNumber] = React.useState(acc ? acc.number : tr.phone);
  const [stage, setStage] = React.useState('choose'); // choose | ussd | done
  const [pin, setPin] = React.useState('');
  const total = bills.reduce((x, b) => x + b.amount, 0);
  const mobile = method === 'orange' || method === 'mtn';
  const confirm = () => {
    if (mobile) { setStage('ussd'); return; }
    finish();
  };
  const finish = () => {
    setStage('processing');
    setTimeout(() => {
      bills.forEach(b => dutActions.payBill(b.id, { method, by: 'transporter', number: mobile ? number : null }));
      setStage('done');
      toast(bills.length > 1 ? `${bills.length} DUT réglés, ${fmtGNF(total)}` : `Paiement confirmé, ${fmtGNF(total)}`);
    }, 1400);
  };
  if (stage === 'done') return (
    <section style={{ ...paperCard(true), textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#009460', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}><Icon name="check" size={26} stroke={2.4}/></div>
      <h2 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 24, margin: '0 0 4px', fontWeight: 500 }}>Paiement confirmé</h2>
      <p style={{ color: '#6B6557', fontSize: 13, margin: '0 0 16px' }}>{bills.map(b => b.id).join(', ')} : {fmtGNF(total)}. Le reçu est disponible et le DUT porte le tampon « PAYÉ ».</p>
      <button style={primaryBtn()} onClick={() => onDone(bills)}>Voir le DUT payé →</button>
    </section>
  );
  return (
    <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
      <section style={paperCard(true)}>
        <div style={{ ...eyebrow, marginBottom: 12 }}>Moyen de paiement</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['orange', 'mtn', 'card', 'bank'].map(id => {
            const m = PROVIDERS[id]; const on = method === id;
            return (
              <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', border: '1px solid', borderColor: on ? '#161413' : '#DCD3BD', background: on ? '#FBF8F2' : '#fff', cursor: 'pointer' }}>
                <input type="radio" name={`pm-${transporterId}`} checked={on} onChange={() => setMethod(id)} style={{ accentColor: '#CE1126' }}/>
                <div style={{ width: 48, height: 30, background: m.color, color: m.ink || '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11 }}>{m.tag}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{m.label}</div>
                  <div style={{ fontSize: 11.5, color: '#6B6557' }}>{id === 'card' ? 'Visa, Mastercard, GIM-UEMOA' : id === 'bank' ? 'BICIGUI, Ecobank, UBA, Vista' : acc && acc.provider === id ? `Compte enregistré ${maskPhone(acc.number)}` : 'Confirmation par code USSD'}</div>
                </div>
              </label>
            );
          })}
        </div>
        {mobile && stage === 'choose' && (
          <div style={{ marginTop: 16 }}><Field label={`Numéro ${PROVIDERS[method].label}`}><Input value={number} onChange={setNumber}/></Field></div>
        )}
        {method === 'card' && stage === 'choose' && (
          <div style={{ marginTop: 16 }}>
            <Field label="Numéro de carte"><Input defaultValue="4532 1200 4410 7821"/></Field>
            <FieldRow><Field label="Expiration"><Input defaultValue="08/28"/></Field><Field label="CVV"><Input defaultValue="123"/></Field></FieldRow>
          </div>
        )}
        {method === 'bank' && stage === 'choose' && <div style={{ marginTop: 14, fontSize: 12, color: '#6B6557', lineHeight: 1.5 }}>Vous serez redirigé vers votre banque. Dans cette démonstration, le virement est confirmé immédiatement.</div>}
        {stage === 'ussd' && (
          <div style={{ marginTop: 16, padding: 14, background: '#FFF8E1', border: '1px solid #E8D896' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Demande envoyée au {number}</div>
            <div style={{ fontSize: 12, color: '#73591F', margin: '4px 0 10px' }}>Sur le téléphone, la fenêtre {PROVIDERS[method].label} demande le code secret pour valider {fmtGNF(total)}.</div>
            <Field label="Code secret (simulation)"><Input type="password" value={pin} onChange={setPin} placeholder="4 chiffres" maxLength={4}/></Field>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={primaryBtn()} disabled={pin.length < 4} onClick={finish}>Valider sur le téléphone</button>
              <button style={ghostBtn()} onClick={() => setStage('choose')}>Annuler</button>
            </div>
          </div>
        )}
        {stage === 'processing' && <div style={{ marginTop: 14, fontSize: 12.5, color: '#73591F' }}>Traitement du paiement en cours…</div>}
        {stage === 'choose' && (
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button style={ghostBtn()} onClick={onCancel}>← Retour</button>
            <button style={primaryBtn()} onClick={confirm}>Payer {fmtGNF(total)} →</button>
          </div>
        )}
      </section>
      <aside style={paperCard(true)}>
        <div style={eyebrow}>À régler</div>
        <h3 style={{ fontFamily: '"Crimson Pro", serif', fontSize: 22, margin: '4px 0 12px', fontWeight: 500 }}>{bills.length > 1 ? `${bills.length} DUT` : `${bills[0].from} → ${bills[0].to}`}</h3>
        {bills.map(b => <SummaryRow key={b.id} label={b.id} value={fmtGNF(b.amount)} mono/>)}
        <div style={{ marginTop: 10, fontSize: 11.5, color: '#6B6557' }}>Prix fixe : {fmtEur(TARIFF.priceEur)} par DUT ({fmtGNF(TARIFF.priceGnf)}), quel que soit le trajet.</div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '2px solid #161413', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={eyebrow}>Total</span>
          <span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 26, fontWeight: 600 }}>{fmtGNF(total)}</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 11.5, color: '#6B6557', display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="shield" size={13} style={{ color: '#009460' }}/> Paiement sécurisé KKiaPay, TLS 1.3</div>
      </aside>
    </div>
  );
};

// ─── Officer: collect payment on behalf of the transporter ─────────
const OfficerCollectPanel = ({ billId }) => {
  const s = useDut();
  const toast = useToast();
  const b = sel.bill(s, billId);
  const tr = sel.transporter(s, b.transporterId);
  const acc = tr && tr.payAccount;
  const canMandate = !!(acc && acc.mandate);
  const [method, setMethod] = React.useState(canMandate ? 'mandate' : 'cash');
  const [number, setNumber] = React.useState(tr ? tr.phone : '');
  const [received, setReceived] = React.useState(String(b.amount));
  const [busy, setBusy] = React.useState(false);
  const [ussd, setUssd] = React.useState(false);
  if (b.status !== 'pending') return null;
  const run = () => {
    if (method === 'push' && !ussd) { setUssd(true); setBusy(true); setTimeout(() => { dutActions.payBill(billId, { method: 'orange', by: 'officer', number }); setBusy(false); setUssd(false); toast(`Le transporteur a validé sur son téléphone, ${billId} est payé`); }, 3500); return; }
    setBusy(true);
    setTimeout(() => {
      dutActions.payBill(billId, method === 'cash' ? { method: 'cash', by: 'officer', received: +received } : { method: 'mandate', by: 'officer', number: acc.number });
      setBusy(false);
      toast(method === 'cash' ? 'Espèces encaissées, reçu émis' : `Compte ${PROVIDERS[acc.provider].label} du transporteur débité`);
    }, 1300);
  };
  const opt = (id, title, sub, disabled) => (
    <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 12px', border: '1px solid', borderColor: method === id ? '#161413' : '#DCD3BD', background: disabled ? '#F7F3EB' : method === id ? '#FBF8F2' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .65 : 1 }}>
      <input type="radio" name={`collect-${billId}`} disabled={disabled} checked={method === id} onChange={() => setMethod(id)} style={{ accentColor: '#CE1126', marginTop: 3 }}/>
      <span><span style={{ display: 'block', fontWeight: 600, fontSize: 13 }}>{title}</span><span style={{ display: 'block', fontSize: 11.5, color: '#6B6557', marginTop: 1 }}>{sub}</span></span>
    </label>
  );
  return (
    <section style={{ ...paperCard(true), borderTop: '3px solid #FCD116' }}>
      <header style={cardHeader()}><h2 style={cardTitle()}>Encaisser pour le transporteur</h2><span style={{ fontFamily: '"Crimson Pro", serif', fontSize: 20, fontWeight: 600 }}>{fmtGNF(b.amount)}</span></header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {opt('mandate', `Débiter le compte enregistré du transporteur`, canMandate ? `${PROVIDERS[acc.provider].label} ${maskPhone(acc.number)}, autorisation de prélèvement active` : acc ? 'Le transporteur n’a pas autorisé le prélèvement dans son espace' : 'Aucun moyen de paiement enregistré par le transporteur', !canMandate)}
        {opt('push', 'Demande de paiement mobile money', 'Le transporteur valide avec son code secret sur son téléphone')}
        {opt('cash', 'Espèces encaissées au guichet', 'Reçu de caisse remis au transporteur, versement au Trésor à la clôture')}
      </div>
      {method === 'push' && <div style={{ marginTop: 12 }}><Field label="Numéro Orange Money ou MTN MoMo du transporteur"><Input value={number} onChange={setNumber}/></Field></div>}
      {method === 'cash' && <div style={{ marginTop: 12 }}><Field label="Montant reçu (GNF)"><Input type="number" value={received} onChange={setReceived}/></Field>{+received > b.amount && <div style={{ fontSize: 12, color: '#6B6557' }}>Monnaie à rendre : {fmtGNF(+received - b.amount)}</div>}</div>}
      {ussd && <div style={{ marginTop: 12, padding: 12, background: '#FFF8E1', border: '1px solid #E8D896', fontSize: 12.5 }}>Demande envoyée au {number}. En attente de la validation du transporteur…</div>}
      <button onClick={run} disabled={busy || (method === 'cash' && +received < b.amount)} style={{ ...primaryBtn(), width: '100%', justifyContent: 'center', padding: '12px', marginTop: 14, opacity: busy ? .6 : 1 }}>
        <Icon name="coin" size={15}/> {busy ? 'Traitement…' : method === 'cash' ? 'Enregistrer l’encaissement' : method === 'mandate' ? 'Débiter le compte du transporteur' : 'Envoyer la demande de paiement'}
      </button>
    </section>
  );
};

// ─── Transporter: registered payment account + authorisation ──────
const PayAccountCard = ({ transporterId }) => {
  const s = useDut();
  const toast = useToast();
  const tr = sel.transporter(s, transporterId);
  const acc = tr.payAccount || { provider: 'orange', number: tr.phone, holder: tr.short, mandate: false, autoPay: false };
  const [f, setF] = React.useState(acc);
  React.useEffect(() => setF(acc), [JSON.stringify(acc)]);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  return (
    <section style={paperCard(true)}>
      <header style={cardHeader()}><h2 style={cardTitle()}>Moyen de paiement enregistré</h2>{tr.payAccount ? <span style={{ fontSize: 11, color: '#1F4F2C', fontWeight: 600 }}>Enregistré</span> : <span style={{ fontSize: 11, color: '#8A1B1B', fontWeight: 600 }}>Non renseigné</span>}</header>
      <p style={{ fontSize: 12.5, color: '#3A352D', lineHeight: 1.55, marginTop: 0 }}>Enregistrez votre compte mobile money. Avec votre autorisation, l’agent DNTT peut régler vos DUT directement depuis ce compte, sans que vous ayez à vous déplacer.</p>
      <FieldRow>
        <Field label="Opérateur"><Select value={f.provider} onChange={v => set('provider', v)} options={[{ value: 'orange', label: 'Orange Money' }, { value: 'mtn', label: 'MTN MoMo' }]}/></Field>
        <Field label="Numéro"><Input value={f.number} onChange={v => set('number', v)}/></Field>
      </FieldRow>
      <Field label="Titulaire du compte"><Input value={f.holder} onChange={v => set('holder', v)}/></Field>
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderTop: '1px solid #F0E9D6', cursor: 'pointer' }}>
        <input type="checkbox" checked={!!f.mandate} onChange={e => set('mandate', e.target.checked)} style={{ marginTop: 3, accentColor: '#CE1126' }}/>
        <span style={{ fontSize: 12.5 }}><b>Autoriser la DNTT à prélever ce compte</b><span style={{ display: 'block', color: '#6B6557', fontSize: 11.5 }}>L’agent peut encaisser vos DUT depuis la plateforme. Vous recevez un SMS à chaque prélèvement.</span></span>
      </label>
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderTop: '1px solid #F0E9D6', cursor: f.mandate ? 'pointer' : 'not-allowed', opacity: f.mandate ? 1 : .5 }}>
        <input type="checkbox" disabled={!f.mandate} checked={!!(f.mandate && f.autoPay)} onChange={e => set('autoPay', e.target.checked)} style={{ marginTop: 3, accentColor: '#CE1126' }}/>
        <span style={{ fontSize: 12.5 }}><b>Payer automatiquement chaque nouveau DUT</b><span style={{ display: 'block', color: '#6B6557', fontSize: 11.5 }}>Dès que l’agent émet un DUT à votre nom, il est réglé ({fmtEur(TARIFF.priceEur)}, soit {fmtGNF(TARIFF.priceGnf)}).</span></span>
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <button style={primaryBtn()} onClick={() => { dutActions.savePayAccount(transporterId, { ...f, autoPay: f.mandate && f.autoPay }); toast('Moyen de paiement enregistré'); }}>Enregistrer</button>
        {tr.payAccount && <button style={ghostBtn()} onClick={() => { dutActions.savePayAccount(transporterId, null); toast('Moyen de paiement supprimé', 'info'); }}>Supprimer</button>}
      </div>
    </section>
  );
};

// ─── Add a vehicle (transporter fleet or officer registry) ─────────
const AddVehicleModal = ({ transporterId, onClose, transporters }) => {
  const toast = useToast();
  const [f, setF] = React.useState({ plate: '', transporterId: transporterId || (transporters && transporters[0].id), type: 'Semi-remorque', brand: '', year: 2022, capacity: 30, driver: '', driverPhone: '+224 6' });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const ok = f.plate.trim().length >= 6 && f.brand && f.driver;
  return (
    <DutModal title="Ajouter un véhicule" onClose={onClose} footer={<>
      <button style={ghostBtn()} onClick={onClose}>Annuler</button>
      <button style={{ ...primaryBtn(), opacity: ok ? 1 : .5 }} disabled={!ok} onClick={() => { dutActions.addVehicle({ ...f, plate: f.plate.toUpperCase().trim(), year: +f.year, capacity: +f.capacity, status: 'active' }); toast(`Véhicule ${f.plate.toUpperCase()} ajouté`); onClose(); }}>Ajouter</button>
    </>}>
      {transporters && <Field label="Transporteur"><Select value={f.transporterId} onChange={v => set('transporterId', v)} options={transporters.map(t => ({ value: t.id, label: `${t.short} (${t.id})` }))}/></Field>}
      <FieldRow><Field label="Immatriculation"><Input value={f.plate} onChange={v => set('plate', v)} placeholder="RC-0000-AA"/></Field><Field label="Type"><Select value={f.type} onChange={v => set('type', v)} options={['Semi-remorque', 'Benne', 'Plateau', 'Camion-citerne', 'Citerne carburant', 'Frigorifique', 'Pick-up', 'Camionnette']}/></Field></FieldRow>
      <FieldRow><Field label="Marque et modèle"><Input value={f.brand} onChange={v => set('brand', v)} placeholder="ex. Renault K460"/></Field><Field label="Année"><Input type="number" value={f.year} onChange={v => set('year', v)}/></Field><Field label="Capacité (t)"><Input type="number" value={f.capacity} onChange={v => set('capacity', v)}/></Field></FieldRow>
      <FieldRow><Field label="Conducteur principal"><Input value={f.driver} onChange={v => set('driver', v)}/></Field><Field label="Téléphone du conducteur"><Input value={f.driverPhone} onChange={v => set('driverPhone', v)}/></Field></FieldRow>
    </DutModal>
  );
};

// ─── Bills table (used in several screens) ─────────────────────────
const BillsTable = ({ bills, onOpen, showTransporter, lang, empty = 'Aucun DUT.' }) => {
  const s = useDut();
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="sober-stack" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead><tr style={{ color: '#9A9281', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase' }}>
          {['N° DUT', 'Émis le', ...(showTransporter ? ['Transporteur'] : []), 'Itinéraire', 'Véhicule', 'Montant', 'Statut'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {bills.length === 0 && <tr><td colSpan={7} style={{ ...td(), color: '#6B6557' }}>{empty}</td></tr>}
          {bills.map((b, i) => {
            const tr = sel.transporter(s, b.transporterId) || {};
            return (
              <tr key={b.id} onClick={() => onOpen(b)} tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') onOpen(b); }} style={{ cursor: 'pointer', background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                <td data-label="N° DUT" style={{ ...td(), ...monoStyle, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{b.id}</td>
                <td data-label="Émis le" style={td()}>{fmtD(b.issuedAt)}</td>
                {showTransporter && <td data-label="Transporteur" style={td()}>{tr.short}{tr.kind === 'individual' && <span style={{ marginLeft: 6, fontSize: 9, letterSpacing: '.14em', padding: '1px 5px', background: '#FFF6E0', color: '#7A5A00', border: '1px solid #E8D38A', fontWeight: 600 }}>P.P.</span>}</td>}
                <td data-label="Itinéraire" style={td()}>{b.from} → {b.to}</td>
                <td data-label="Véhicule" style={{ ...td(), ...monoStyle, fontSize: 11.5 }}>{b.vehicle}</td>
                <td data-label="Montant" style={{ ...td(), textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtGNF(b.amount)}</td>
                <td data-label="Statut" style={td()}><DutStatus bill={b} lang={lang}/></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Audit trail (DUT history) ─────────────────────────────────────
const AuditTrail = ({ billId }) => {
  const s = useDut();
  const list = sel.auditOf(s, billId);
  return (
    <div style={{ position: 'relative', paddingLeft: 20 }}>
      <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 1, background: '#E5DDC9' }}/>
      {list.map((e, i) => (
        <div key={i} style={{ position: 'relative', padding: '9px 0', borderTop: i ? '1px solid #F0E9D6' : 'none' }}>
          <div style={{ position: 'absolute', left: -19, top: 13, width: 11, height: 11, borderRadius: '50%', background: e.tone === 'good' ? '#009460' : e.tone === 'bad' ? '#CE1126' : '#9A9281', border: '2px solid #fff', boxShadow: '0 0 0 1px #DCD3BD' }}/>
          <div style={{ fontSize: 10.5, color: '#9A9281', ...monoStyle }}>{fmtDT(e.at)}</div>
          <div style={{ fontWeight: 600, fontSize: 12.5, marginTop: 1 }}>{e.what}</div>
          <div style={{ fontSize: 11, color: '#6B6557' }}>par {e.who}</div>
        </div>
      ))}
    </div>
  );
};

// Simple segmented filter.
const FilterChips = ({ value, onChange, options }) => (
  <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
    {options.map(([k, l]) => (
      <button key={k} onClick={() => onChange(k)} aria-pressed={value === k} style={{ padding: '6px 12px', border: '1px solid', borderColor: value === k ? '#161413' : '#DCD3BD', background: value === k ? '#161413' : '#fff', color: value === k ? '#FCD116' : '#161413', fontSize: 12, fontWeight: value === k ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2 }}>{l}</button>
    ))}
  </div>
);

Object.assign(window, {
  GovBrand, PairQr, DutDocument, PrintDutModal, TripTimeline, PairingCard, SelfPayPanel, OfficerCollectPanel,
  PayAccountCard, AddVehicleModal, BillsTable, AuditTrail, FilterChips, eyebrow, monoStyle,
});

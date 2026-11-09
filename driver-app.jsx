// Driver mobile app (Android and iOS): interactive, wired to the shared store.
// Flow: pair the phone with a paid DUT (6-digit code or QR code of the DUT),
// start the trip, live GPS tracking (offline queue), arrival recap.

const DRIVER_PALETTE = {
  ink: '#1A1814', cream: '#F5F0E2', paper: '#FBF8F2', rule: '#DCD3BD', muted: '#6B6557',
  red: '#C8242C', yellow: '#F2C200', green: '#0F8C49', faint: '#9A9281',
};
const DP = DRIVER_PALETTE;
const dMono = { fontFamily: '"JetBrains Mono","SF Mono",ui-monospace,monospace' };

const DriverPill = ({ children, color = DP.ink, bg = '#FFFFFF', dot }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: bg, color, fontSize: 11, fontWeight: 600, letterSpacing: '.04em', border: `1px solid ${DP.rule}`, whiteSpace: 'nowrap' }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: dot }}/>}{children}
  </div>
);
const DBtn = ({ children, onClick, kind = 'dark', disabled, style }) => (
  <button onClick={onClick} disabled={disabled} style={{ width: '100%', height: 50, borderRadius: 12, border: kind === 'dark' ? 'none' : `1px solid ${DP.rule}`, background: kind === 'dark' ? DP.ink : '#FFF', color: kind === 'dark' ? '#FFF' : DP.ink, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? .45 : 1, fontFamily: 'inherit', ...style }}>{children}</button>
);
const DriverShell = ({ title, pill, children, footer }) => (
  <div style={{ width: '100%', height: '100%', background: DP.cream, color: DP.ink, paddingTop: 38, paddingBottom: 26, display: 'flex', flexDirection: 'column', fontFamily: 'Inter,-apple-system,"Segoe UI",Roboto,sans-serif', position: 'relative', boxSizing: 'border-box' }}>
    <div style={{ padding: '10px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <SealEmblem size={30}/>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.15 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>République de Guinée</div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
      </div>
      {pill}
    </div>
    <FlagBar height={2}/>
    <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 0' }}>{children}</div>
    {footer && <div style={{ padding: '12px 16px 4px' }}>{footer}</div>}
  </div>
);
const DCard = ({ children, style }) => <div style={{ background: '#FFF', border: `1px solid ${DP.rule}`, borderRadius: 12, padding: 14, ...style }}>{children}</div>;
const DLabel = ({ children }) => <div style={{ fontSize: 10, color: DP.muted, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 6 }}>{children}</div>;

const DriverApp = () => {
  const s = useDut();
  useTick(1000);
  const billId = s.driverPhone.billId;
  const bill = billId ? sel.bill(s, billId) : null;
  const trip = billId ? s.trips[billId] : null;
  if (!bill || !s.pairings[billId] || s.pairings[billId].status !== 'linked') return <DriverSetup/>;
  if (!trip) return <DriverReady bill={bill}/>;
  if (trip.status === 'arrived') return <DriverRecap bill={bill} trip={trip}/>;
  return <DriverTrip bill={bill} trip={trip}/>;
};

// ─── Pairing ───────────────────────────────────────────────────────
const DriverSetup = () => {
  const s = useDut();
  const [code, setCode] = React.useState('');
  const [err, setErr] = React.useState('');
  const [scan, setScan] = React.useState(false);
  const inputRef = React.useRef(null);
  const sms = s.driverPhone.sms.find(m => s.pairings[m.billId] && s.pairings[m.billId].status === 'code' && s.pairings[m.billId].code === m.code && s.pairings[m.billId].expiresAt > demoNow());
  const submit = (c = code) => { const r = dutActions.linkWithCode(c); if (!r.ok) setErr(r.error); };
  const scannable = s.bills.filter(b => b.status === 'paid' && !(s.pairings[b.id] && s.pairings[b.id].status === 'linked') && !(s.trips[b.id] && s.trips[b.id].status === 'arrived')).slice(0, 4);
  return (
    <DriverShell title="DUT Conducteur" pill={<DriverPill dot={DP.faint}>NON LIÉ</DriverPill>}
      footer={<DBtn disabled={code.length !== 6} onClick={() => submit()}>Lier ce téléphone au camion <Icon name="arrow" size={14} stroke={2.2}/></DBtn>}>
      {sms && (
        <div style={{ background: DP.ink, color: '#FFF', borderRadius: 12, padding: 12, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon name="chat" size={16} style={{ flexShrink: 0, marginTop: 2, color: DP.yellow }}/>
          <div style={{ flex: 1, fontSize: 12, lineHeight: 1.45 }}>
            <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '.06em' }}>SMS, DNTT, {fmtAgo(sms.at)}</div>
            {sms.text}
            <button onClick={() => { setCode(sms.code); setErr(''); submit(sms.code); }} style={{ marginTop: 8, display: 'block', background: DP.yellow, color: DP.ink, border: 'none', borderRadius: 8, padding: '7px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Utiliser ce code</button>
          </div>
        </div>
      )}
      <DLabel>Pas d’appareil lié</DLabel>
      <div style={{ fontSize: 23, fontWeight: 700, lineHeight: 1.18, marginBottom: 8 }}>Liez ce téléphone au camion</div>
      <div style={{ fontSize: 13, color: DP.muted, lineHeight: 1.5 }}>Une fois le DUT payé, le transporteur ou l’agent DNTT génère un code à 6 chiffres. Saisissez-le ici : ce téléphone devient l’unité de suivi du véhicule et de la marchandise.</div>
      <div style={{ marginTop: 18, padding: 16, background: DP.paper, border: `1px solid ${DP.rule}`, borderRadius: 14 }}>
        <DLabel>Code de jumelage</DLabel>
        <label style={{ display: 'flex', gap: 7, cursor: 'text', position: 'relative' }} onClick={() => inputRef.current && inputRef.current.focus()}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 46, border: `1.5px solid ${i < code.length ? DP.ink : DP.rule}`, background: '#FFF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, fontWeight: 700, ...dMono }}>{code[i] || ''}</div>
          ))}
          <input ref={inputRef} value={code} inputMode="numeric" aria-label="Code de jumelage à 6 chiffres" onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setErr(''); }} onKeyDown={e => { if (e.key === 'Enter' && code.length === 6) submit(); }}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'text' }}/>
        </label>
        {err && <div style={{ marginTop: 8, fontSize: 12, color: DP.red }}>{err}</div>}
        <button onClick={() => setScan(true)} style={{ marginTop: 12, width: '100%', padding: '10px 12px', background: '#FFF', border: `1px dashed ${DP.rule}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, color: DP.ink }}>
          <Icon name="qr" size={16} stroke={2}/> Scanner le QR code imprimé sur le DUT
        </button>
      </div>
      <div style={{ fontSize: 11, color: DP.muted, marginTop: 12, lineHeight: 1.5 }}>Démo : générez un code dans l’espace transporteur (Suivi des véhicules) ou chez l’agent DNTT, puis envoyez-le par SMS : il apparaît ici.</div>
      {scan && (
        <div style={{ position: 'absolute', inset: 0, background: '#0E0D0C', color: '#FFF', zIndex: 5, paddingTop: 38, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
            <b style={{ flex: 1 }}>Scanner le QR du DUT</b>
            <button onClick={() => setScan(false)} aria-label="Fermer" style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex' }}><Icon name="x" size={18}/></button>
          </div>
          <div style={{ margin: '10px 40px', aspectRatio: '1', border: `2px solid ${DP.yellow}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A9281', fontSize: 12, textAlign: 'center', padding: 20 }}>Placez le QR code du DUT dans le cadre</div>
          <div style={{ padding: '6px 16px', fontSize: 11, color: '#C8BFAA' }}>Démo : choisissez le DUT dont le QR est présenté (DUT payés).</div>
          <div style={{ padding: '0 16px', overflow: 'auto', flex: 1 }}>
            {scannable.length === 0 && <div style={{ fontSize: 12.5, color: '#C8BFAA', padding: 10 }}>Aucun DUT payé disponible.</div>}
            {scannable.map(b => (
              <button key={b.id} onClick={() => { const r = dutActions.linkWithQr(b.id); if (!r.ok) setErr(r.error); setScan(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 8, padding: 12, borderRadius: 10, background: '#1A1814', border: '1px solid #3A332A', color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ ...dMono, fontSize: 12.5, fontWeight: 700 }}>{b.id}</div>
                <div style={{ fontSize: 11.5, color: '#C8BFAA' }}>{b.vehicle}, {b.from} → {b.to}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </DriverShell>
  );
};

const DutChip = ({ bill }) => (
  <DCard style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 38, height: 38, borderRadius: 8, background: DP.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${DP.rule}` }}><Icon name="doc" size={18}/></div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <DLabel>DUT actif, payé</DLabel>
      <div style={{ fontSize: 13, fontWeight: 700, ...dMono, marginTop: -4 }}>{bill.id}</div>
      <div style={{ fontSize: 11.5, color: DP.muted }}>{bill.goods}, {bill.from} → {bill.to}</div>
    </div>
  </DCard>
);

const DriverReady = ({ bill }) => {
  const s = useDut();
  const v = sel.vehicle(s, bill.vehicle) || {};
  const tr = sel.transporter(s, bill.transporterId) || {};
  return (
    <DriverShell title="Prêt au départ" pill={<DriverPill dot={DP.green}>LIÉ</DriverPill>}
      footer={<div style={{ display: 'grid', gap: 8 }}><DBtn onClick={() => dutActions.startTrip(bill.id)}>Démarrer le trajet <Icon name="arrow" size={14} stroke={2.2}/></DBtn><DBtn kind="light" onClick={() => dutActions.unlink(bill.id)}>Délier ce téléphone</DBtn></div>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: 12, background: '#E8F2EA', borderRadius: 12, border: '1px solid #B9D6BF' }}>
        <Icon name="check" size={18} style={{ color: DP.green }}/><div style={{ fontSize: 12.5 }}><b>Téléphone lié au véhicule.</b> Le suivi GPS démarre au départ.</div>
      </div>
      <DutChip bill={bill}/>
      <DCard style={{ marginTop: 10 }}>
        <DLabel>Véhicule</DLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="truck" size={20}/>
          <div><div style={{ fontWeight: 700, ...dMono }}>{bill.vehicle}</div><div style={{ fontSize: 12, color: DP.muted }}>{tr.short}, {v.brand || ''}</div></div>
        </div>
        <div style={{ fontSize: 12, marginTop: 8 }}>Conducteur : <b>{bill.driver}</b></div>
      </DCard>
      <DCard style={{ marginTop: 10 }}>
        <DLabel>Itinéraire prévu, {bill.km} km</DLabel>
        <div style={{ fontSize: 12.5 }}>{routeWaypoints(bill.from, bill.to).map(w => w.city).join(' → ')}</div>
      </DCard>
    </DriverShell>
  );
};

const DriverTrip = ({ bill, trip }) => {
  const [showDut, setShowDut] = React.useState(false);
  const wps = routeWaypoints(bill.from, bill.to);
  const total = wps[wps.length - 1].km || 1;
  const done = trip.progress * total;
  const nextIdx = wps.findIndex(w => w.km > done);
  return (
    <DriverShell title="Trajet en cours" pill={trip.offline ? <DriverPill dot={DP.red} bg="#FFFBEA">HORS LIGNE</DriverPill> : <DriverPill dot={DP.green}>EN LIGNE</DriverPill>}
      footer={<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <DBtn kind="light" onClick={() => dutActions.setOffline(bill.id, !trip.offline)} style={{ fontSize: 12.5 }}><Icon name={trip.offline ? 'reload' : 'alert'} size={14}/>{trip.offline ? 'Rétablir le réseau' : 'Couper le réseau'}</DBtn>
        <DBtn onClick={() => dutActions.advanceTrip(bill.id, 0.15)} style={{ fontSize: 12.5 }}>Avancer (démo) <Icon name="arrow" size={13}/></DBtn>
      </div>}>
      {trip.offline && (
        <div style={{ padding: 12, background: '#FFF8E0', border: `1px solid ${DP.yellow}66`, borderRadius: 12, marginBottom: 10, display: 'flex', gap: 10 }}>
          <Icon name="alert" size={18} style={{ color: '#8A6700', flexShrink: 0 }}/>
          <div style={{ fontSize: 12, color: '#5A4500', lineHeight: 1.45 }}><b>Aucun réseau.</b> Le suivi continue sur le téléphone : <b>{trip.queued}</b> positions en attente, envoyées au retour du réseau.</div>
        </div>
      )}
      <button onClick={() => setShowDut(true)} style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}><DutChip bill={bill}/></button>
      <div style={{ margin: '12px 0 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <DLabel>Itinéraire</DLabel><span style={{ fontSize: 12, ...dMono }}>{Math.round(done)} / {total} km</span>
      </div>
      <div style={{ height: 6, background: DP.rule, borderRadius: 3, marginBottom: 10 }}><div style={{ height: 6, width: `${trip.progress * 100}%`, background: trip.offline ? DP.yellow : DP.green, borderRadius: 3, transition: 'width .8s linear' }}/></div>
      <div style={{ padding: '12px', background: DP.paper, border: `1px solid ${DP.rule}`, borderRadius: 14 }}>
        {wps.map((w, i) => {
          const st = w.km <= done ? 'done' : i === nextIdx ? 'current' : 'pending';
          const col = st === 'done' ? DP.green : st === 'current' ? DP.red : DP.faint;
          const ev = [...trip.events].reverse().find(e => e.text.includes(w.city));
          return (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 18, position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 12, height: 12, borderRadius: 999, background: st === 'pending' ? '#FFF' : col, border: `2px solid ${col}`, margin: '4px 3px', boxShadow: st === 'current' ? `0 0 0 4px ${DP.red}22` : 'none' }}/>
                {i < wps.length - 1 && <div style={{ position: 'absolute', left: 8, top: 18, bottom: -4, width: 2, background: st === 'done' ? DP.green : DP.rule }}/>}
              </div>
              <div style={{ flex: 1, paddingBottom: i < wps.length - 1 ? 12 : 0 }}>
                <div style={{ display: 'flex', gap: 8 }}><b style={{ fontSize: 13 }}>{w.city}</b><span style={{ marginLeft: 'auto', fontSize: 11, color: DP.muted, ...dMono }}>{ev ? fmtT(ev.at) : `km ${w.km}`}</span></div>
                <div style={{ fontSize: 11.5, color: st === 'current' ? DP.ink : DP.muted }}>{st === 'current' ? `Prochaine étape, ${Math.max(0, Math.round(w.km - done))} km` : st === 'done' ? (i === 0 ? 'Départ' : ev && ev.kind === 'control' ? 'Contrôle DNTT' : 'Passage enregistré') : i === wps.length - 1 ? 'Destination' : 'À venir'}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, padding: '10px 12px', background: '#FFF', border: `1px solid ${DP.rule}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: trip.offline ? DP.red : DP.green }}/>
        <span style={{ color: DP.muted }}>GPS, {trip.pings} positions</span>
        <span style={{ marginLeft: 'auto', color: DP.muted, ...dMono }}>{trip.offline ? 'en attente' : fmtT(trip.lastPingAt)}</span>
      </div>
      {showDut && (
        <div onClick={() => setShowDut(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFF', borderRadius: 16, padding: 18, width: '100%', textAlign: 'center' }}>
            <DLabel>À présenter au contrôle</DLabel>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}><PairQr value={bill.id} size={170}/></div>
            <div style={{ ...dMono, fontWeight: 700 }}>{bill.id}</div>
            <div style={{ fontSize: 12, color: DP.muted, margin: '4px 0 12px' }}>{bill.vehicle}, {bill.goods}, payé</div>
            <DBtn onClick={() => setShowDut(false)}>Fermer</DBtn>
          </div>
        </div>
      )}
    </DriverShell>
  );
};

const DriverRecap = ({ bill, trip }) => {
  const controls = trip.events.filter(e => e.kind === 'control').length;
  const dur = Math.max(1, Math.round(((trip.arrivedAt || demoNow()) - trip.startedAt) / 60000));
  return (
    <DriverShell title="Trajet terminé" pill={<DriverPill dot={DP.green}>TERMINÉ</DriverPill>}
      footer={<DBtn onClick={() => dutActions.newTrip()}>Nouveau trajet <Icon name="arrow" size={13} stroke={2.2}/></DBtn>}>
      <DCard style={{ position: 'relative', overflow: 'hidden', padding: 18 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, display: 'flex' }}><div style={{ flex: 1, background: DP.red }}/><div style={{ flex: 1, background: DP.yellow }}/><div style={{ flex: 1, background: DP.green }}/></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: DP.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={20} stroke={2.6} style={{ color: '#FFF' }}/></div>
          <div><DLabel>Arrivée confirmée</DLabel><div style={{ fontSize: 16, fontWeight: 700, marginTop: -4 }}>{bill.to}</div></div>
        </div>
        <div style={{ fontSize: 12, color: DP.muted }}>{bill.id}, arrivé à {fmtT(trip.arrivedAt)}. Le transporteur et la DNTT ont été notifiés.</div>
      </DCard>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[['Distance', `${bill.km} km`], ['Durée', dur >= 60 ? `${Math.floor(dur / 60)} h ${String(dur % 60).padStart(2, '0')}` : `${dur} min`], ['Contrôles', String(controls)], ['Positions GPS', String(trip.pings)]].map(([k, v]) => (
          <div key={k} style={{ padding: '12px 14px', background: DP.paper, border: `1px solid ${DP.rule}`, borderRadius: 10 }}><DLabel>{k}</DLabel><div style={{ fontSize: 18, fontWeight: 700, ...dMono, marginTop: -2 }}>{v}</div></div>
        ))}
      </div>
      <DCard style={{ marginTop: 12 }}>
        <DLabel>Journal du trajet</DLabel>
        {trip.events.map((e, i) => <div key={i} style={{ fontSize: 12, padding: '4px 0', display: 'flex', gap: 8 }}><span style={{ ...dMono, color: DP.muted, fontSize: 11 }}>{fmtT(e.at)}</span>{e.text}</div>)}
      </DCard>
    </DriverShell>
  );
};

Object.assign(window, { DRIVER_PALETTE, DriverPill, DriverApp });

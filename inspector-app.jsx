// Control agent mobile app (Android and iOS): interactive, wired to the store.
// Flow: list of passages at the post, read a plate, check the DUT, inspect
// the cargo, validate or report an anomaly. The passage is added to the trip
// timeline seen by the transporter and the DNTT.

const INS_PALETTE = {
  ink: '#1A1814', cream: '#F5F0E2', paper: '#FBF8F2', rule: '#DCD3BD', muted: '#6B6557',
  red: '#C8242C', yellow: '#F2C200', green: '#0F8C49', faint: '#9A9281', shadow: '#0E0D0C',
};
const IP = INS_PALETTE;

const InspectorShell = ({ title, subtitle, children, footer, dark }) => {
  const s = useDut();
  const online = s.inspector.online;
  return (
    <div style={{ width: '100%', height: '100%', background: dark ? IP.shadow : IP.cream, color: dark ? '#FFF' : IP.ink, paddingTop: 38, paddingBottom: 26, display: 'flex', flexDirection: 'column', fontFamily: 'Inter,-apple-system,"Segoe UI",Roboto,sans-serif', position: 'relative', boxSizing: 'border-box' }}>
      <div style={{ padding: '10px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color: dark ? '#FCD116' : IP.ink }}><SealEmblem size={30}/></div>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.15 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>République de Guinée, DNTT</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 10, color: dark ? '#C8BFAA' : IP.muted }}>{subtitle}</div>}
        </div>
        <button onClick={() => dutActions.setInspectorOnline(!online)} title="Simuler le réseau" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 999, background: '#FFF', color: IP.ink, border: `1px solid ${IP.rule}`, fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: online ? IP.green : IP.red }}/>{online ? 'EN LIGNE' : 'HORS LIGNE'}
        </button>
      </div>
      <FlagBar height={2}/>
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 16px 0' }}>{children}</div>
      {footer && <div style={{ padding: '12px 16px 4px' }}>{footer}</div>}
    </div>
  );
};
const IBtn = ({ children, onClick, kind = 'dark', disabled, style }) => (
  <button onClick={onClick} disabled={disabled} style={{ width: '100%', height: 52, borderRadius: 12, border: kind === 'light' ? `1px solid ${IP.rule}` : 'none', background: kind === 'red' ? IP.red : kind === 'light' ? '#FFF' : kind === 'yellow' ? IP.yellow : IP.shadow, color: kind === 'light' || kind === 'yellow' ? IP.ink : '#FFF', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? .45 : 1, fontFamily: 'inherit', ...style }}>{children}</button>
);

// Plate lookup: latest DUT for this plate (not cancelled).
const lookupPlate = (s, plate) => {
  const p = plate.trim().toUpperCase();
  const bills = s.bills.filter(b => b.vehicle === p && b.status !== 'cancelled').sort((a, b) => b.issuedAt - a.issuedAt);
  const b = bills[0];
  if (!b) return { status: 'none', plate: p };
  if (b.status === 'paid') return { status: 'ok', bill: b, plate: p };
  if (b.status === 'pending') return { status: 'unpaid', bill: b, plate: p };
  return { status: 'expired', bill: b, plate: p };
};

const InspectorApp = () => {
  const [screen, setScreen] = React.useState('queue');
  const [plate, setPlate] = React.useState('');
  const [found, setFound] = React.useState(null);
  const [last, setLast] = React.useState(null);
  const s = useDut();
  if (screen === 'plate') return <InspectorPlate plate={plate} setPlate={setPlate} onBack={() => setScreen('queue')} onFound={(r) => { setFound(r); setScreen('goods'); }}/>;
  if (screen === 'goods') return <InspectorGoods found={found} onBack={() => setScreen('plate')} onDone={(p) => { setLast(p); setScreen('confirm'); }}/>;
  if (screen === 'confirm') return <InspectorConfirm passage={last} found={found} onNext={() => { setPlate(''); setFound(null); setScreen('queue'); }}/>;
  return <InspectorQueue onNew={() => setScreen('plate')}/>;
};

const InspectorQueue = ({ onNew }) => {
  const s = useDut();
  const today = fmtD(demoNow());
  const list = s.passages.filter(p => p.post === s.inspector.post);
  const todays = list.filter(p => fmtD(p.at) === today);
  const enRoute = Object.entries(s.trips).filter(([, t]) => t.status === 'in_progress').map(([id]) => sel.bill(s, id));
  return (
    <InspectorShell title={s.inspector.post} subtitle={`${s.inspector.agent}, agent de contrôle`} footer={<IBtn onClick={onNew}><Icon name="camera" size={18} stroke={2}/> Enregistrer un passage</IBtn>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[["Aujourd’hui", todays.length, IP.ink], ['Conformes', todays.filter(p => p.result === 'ok').length, IP.green], ['Anomalies', todays.filter(p => p.result !== 'ok').length, IP.red]].map(([k, v, c]) => (
          <div key={k} style={{ padding: '10px 12px', background: IP.paper, border: `1px solid ${IP.rule}`, borderRadius: 10 }}>
            <div style={{ fontSize: 9, color: IP.muted, letterSpacing: '.16em', textTransform: 'uppercase' }}>{k}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c, ...dMono }}>{v}</div>
          </div>
        ))}
      </div>
      {enRoute.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10.5, color: IP.muted, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 6 }}>Véhicules suivis en approche</div>
          {enRoute.map(b => <div key={b.id} style={{ fontSize: 12, padding: '8px 12px', background: '#FFF', border: `1px solid ${IP.rule}`, borderRadius: 10, marginBottom: 6 }}><b style={dMono}>{b.vehicle}</b>, {b.from} → {b.to}<div style={{ fontSize: 11, color: IP.muted }}>{b.id}, DUT payé</div></div>)}
        </div>
      )}
      <div style={{ marginTop: 14, fontSize: 10.5, color: IP.muted, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 6 }}>Derniers passages</div>
      <div style={{ background: IP.paper, border: `1px solid ${IP.rule}`, borderRadius: 14 }}>
        {list.length === 0 && <div style={{ padding: 14, fontSize: 12.5, color: IP.muted }}>Aucun passage enregistré.</div>}
        {list.slice(0, 8).map((p, i) => {
          const b = p.billId ? sel.bill(s, p.billId) : null;
          const tr = b ? sel.transporter(s, b.transporterId) : null;
          return (
            <div key={p.id} style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < Math.min(list.length, 8) - 1 ? `1px solid ${IP.rule}aa` : 'none' }}>
              <div style={{ minWidth: 76, padding: '4px 4px', background: '#FFF', border: `1.5px solid ${IP.shadow}`, borderRadius: 4, textAlign: 'center', fontSize: 10, fontWeight: 700, ...dMono }}>{p.plate}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tr ? tr.short : 'Véhicule inconnu'}</div>
                <div style={{ fontSize: 10.5, color: IP.muted, ...dMono }}>{p.billId || 'Aucun DUT valide'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, color: IP.muted, ...dMono }}>{fmtT(p.at)}</div>
                <div style={{ width: 20, height: 20, borderRadius: 999, marginLeft: 'auto', background: p.result === 'ok' ? IP.green : IP.red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 11, fontWeight: 700 }}>{p.result === 'ok' ? <Icon name="check" size={11} stroke={3}/> : '!'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </InspectorShell>
  );
};

const InspectorPlate = ({ plate, setPlate, onBack, onFound }) => {
  const s = useDut();
  const [reading, setReading] = React.useState(false);
  const suggestions = [
    ...Object.entries(s.trips).filter(([, t]) => t.status === 'in_progress').map(([id]) => sel.bill(s, id).vehicle),
    ...s.bills.filter(b => b.status === 'pending').slice(0, 1).map(b => b.vehicle),
    'RC-5577-GX',
  ].filter((x, i, a) => a.indexOf(x) === i).slice(0, 4);
  const read = (p) => {
    setPlate(p); setReading(true);
    setTimeout(() => { setReading(false); onFound(lookupPlate(dutStore.get(), p)); }, 1100);
  };
  return (
    <InspectorShell dark title="Étape 1 sur 3 : plaque" subtitle={s.inspector.post} footer={<div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}><IBtn kind="light" onClick={onBack}>Retour</IBtn><IBtn kind="yellow" disabled={plate.trim().length < 6 || reading} onClick={() => read(plate)}><Icon name="camera" size={16}/>{reading ? 'Lecture…' : 'Lire la plaque'}</IBtn></div>}>
      <div style={{ position: 'relative', height: 230, borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(180deg,#2C3A44 0%,#3E4A4F 55%,#5A5246 56%,#3B352C 100%)' }}>
        <div style={{ position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%,-50%)', width: 170, height: 46, border: `3px solid ${IP.yellow}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: plate ? '#F5F0E2' : 'transparent', color: IP.ink, fontWeight: 800, fontSize: 20, ...dMono }}>{plate.toUpperCase() || ''}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, textAlign: 'center', fontSize: 11.5, color: '#E6DFCF' }}>{reading ? 'Reconnaissance de la plaque…' : 'Cadrez la plaque, ou saisissez-la ci-dessous'}</div>
      </div>
      <label style={{ display: 'block', marginTop: 14 }}>
        <div style={{ fontSize: 10.5, color: '#C8BFAA', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 6 }}>Immatriculation</div>
        <input value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} placeholder="RC-0000-AA" style={{ width: '100%', boxSizing: 'border-box', height: 46, borderRadius: 10, border: '1px solid #3A332A', background: '#1A1814', color: '#FFF', padding: '0 12px', fontSize: 17, fontWeight: 700, ...dMono }}/>
      </label>
      <div style={{ fontSize: 10.5, color: '#C8BFAA', letterSpacing: '.16em', textTransform: 'uppercase', margin: '14px 0 6px' }}>Véhicules à proximité</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {suggestions.map(p => <button key={p} onClick={() => read(p)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #3A332A', background: '#1A1814', color: '#FFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', ...dMono }}>{p}</button>)}
      </div>
    </InspectorShell>
  );
};

const InspectorGoods = ({ found, onBack, onDone }) => {
  const s = useDut();
  const b = found.bill;
  const tr = b ? sel.transporter(s, b.transporterId) : null;
  const [checks, setChecks] = React.useState({ dut: found.status === 'ok', goods: true, qty: true, seal: true, driver: true });
  const [photos, setPhotos] = React.useState(0);
  const [note, setNote] = React.useState('');
  const ok = found.status === 'ok' && Object.values(checks).every(Boolean);
  const status = {
    ok: ['DUT valide et payé', IP.green, '#E8F2EA'],
    unpaid: ['DUT émis mais non payé', '#8A6700', '#FFF8E0'],
    expired: ['DUT expiré', IP.red, '#FCEAEA'],
    none: ['Aucun DUT pour ce véhicule', IP.red, '#FCEAEA'],
  }[found.status];
  const record = (result) => {
    const reason = result === 'ok' ? 'Conforme' : (note || (found.status !== 'ok' ? status[0] : 'Écart constaté au contrôle'));
    const p = { billId: b ? b.id : null, plate: found.plate, result, note: reason, checks };
    dutActions.recordPassage(p);
    onDone({ ...p, at: demoNow() });
  };
  const items = [['dut', 'DUT présenté et valide'], ['goods', `Marchandise conforme${b ? ` (${b.goods})` : ''}`], ['qty', `Quantité cohérente${b ? ` (${String(b.qty).replace('.', ',')} ${b.unit})` : ''}`], ['seal', 'Scellés et bâche en place'], ['driver', `Conducteur identifié${b ? ` (${b.driver})` : ''}`]];
  return (
    <InspectorShell title="Étape 2 sur 3 : vérification" subtitle={found.plate} footer={<div style={{ display: 'grid', gap: 8 }}>
      <IBtn disabled={!ok} onClick={() => record('ok')}><Icon name="check" size={16} stroke={2.4}/> Valider le passage</IBtn>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}><IBtn kind="light" onClick={onBack}>Retour</IBtn><IBtn kind="red" onClick={() => record('flag')}>Signaler une anomalie</IBtn></div>
    </div>}>
      <div style={{ padding: 12, borderRadius: 12, background: status[2], border: `1px solid ${status[1]}55`, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: status[1], fontSize: 13 }}>{status[0]}</div>
        {b ? <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.5 }}><b style={dMono}>{b.id}</b><br/>{tr ? tr.short : ''}, {b.from} → {b.to}<br/>{found.status === 'unpaid' ? `${fmtGNF(b.amount)} à régler. Le conducteur peut payer par mobile money avant de repartir.` : found.status === 'ok' ? `Payé le ${fmtD(b.payment.at)}` : `Échéance ${fmtD(b.due)}`}</div>
          : <div style={{ fontSize: 12, marginTop: 4 }}>Véhicule non enregistré ou sans DUT. Immobilisation et orientation vers le guichet DNTT.</div>}
      </div>
      <div style={{ background: '#FFF', border: `1px solid ${IP.rule}`, borderRadius: 12 }}>
        {items.map(([k, l], i) => (
          <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderBottom: i < items.length - 1 ? `1px solid ${IP.rule}aa` : 'none', fontSize: 12.5, cursor: 'pointer' }}>
            <input type="checkbox" checked={checks[k]} onChange={e => setChecks(c => ({ ...c, [k]: e.target.checked }))} style={{ width: 18, height: 18, accentColor: IP.green }}/>{l}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        {Array.from({ length: photos }).map((_, i) => <div key={i} style={{ width: 52, height: 52, borderRadius: 8, background: `linear-gradient(135deg,#8C7B5A,#4A4032)`, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', color: '#FFF', fontSize: 9, padding: 3 }}>{fmtT(demoNow())}</div>)}
        <button onClick={() => setPhotos(n => Math.min(3, n + 1))} disabled={photos >= 3} style={{ width: 52, height: 52, borderRadius: 8, border: `1px dashed ${IP.rule}`, background: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Prendre une photo"><Icon name="camera" size={18}/></button>
        <span style={{ fontSize: 11.5, color: IP.muted }}>{photos} photo(s) de la marchandise</span>
      </div>
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Observation (facultatif)" style={{ marginTop: 12, width: '100%', boxSizing: 'border-box', height: 42, borderRadius: 10, border: `1px solid ${IP.rule}`, padding: '0 12px', fontSize: 13, fontFamily: 'inherit' }}/>
    </InspectorShell>
  );
};

const InspectorConfirm = ({ passage, found, onNext }) => {
  const s = useDut();
  const ok = passage.result === 'ok';
  return (
    <InspectorShell title={ok ? 'Passage validé' : 'Anomalie enregistrée'} subtitle="Étape 3 sur 3" footer={<IBtn onClick={onNext}>Nouveau passage <Icon name="arrow" size={14}/></IBtn>}>
      <div style={{ textAlign: 'center', padding: '20px 10px', background: '#FFF', border: `1px solid ${IP.rule}`, borderRadius: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: ok ? IP.green : IP.red, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#FFF', fontSize: 26, fontWeight: 800 }}>{ok ? <Icon name="check" size={28} stroke={2.8}/> : '!'}</div>
        <div style={{ fontSize: 18, fontWeight: 700, ...dMono }}>{passage.plate}</div>
        <div style={{ fontSize: 12.5, color: IP.muted, marginTop: 4 }}>{passage.billId || 'Sans DUT'}, {fmtT(passage.at)}, {s.inspector.post}</div>
        <div style={{ fontSize: 12.5, marginTop: 8 }}>{passage.note}</div>
      </div>
      <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: s.inspector.online ? '#E8F2EA' : '#FFF8E0', fontSize: 12, lineHeight: 1.5 }}>
        {s.inspector.online ? 'Synchronisé. Le passage apparaît dans le suivi du transporteur et dans l’espace DNTT.' : 'Hors ligne : le passage sera envoyé au retour du réseau.'}
      </div>
    </InspectorShell>
  );
};

Object.assign(window, { INS_PALETTE, InspectorApp });

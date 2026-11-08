// SOBER: Pairing code (jumelage) between a paid DUT and the driver's phone.
//
// Once a DUT is paid, a 6-digit code can be generated to turn the driver's
// phone into the GPS tracking unit of the vehicle and its cargo.
//   - The DNTT officer can generate it for the transporter (bill detail).
//   - The transporter (company or individual) can generate it himself.
//   - The driver can also scan the QR code printed on the DUT PDF: the DUT is
//     then linked to his phone automatically, without typing a code.
// The driver app (Android and iOS) accepts either method.

const PAIR_TXT = {
  fr: {
    title: 'Suivi du véhicule',
    kicker: 'Code de jumelage',
    locked: 'Disponible après le paiement du DUT.',
    lockedHint: 'Le code permet de suivre le véhicule et la marchandise depuis le téléphone du conducteur.',
    introCompany: 'Générez un code à 6 chiffres et transmettez-le au conducteur. Il le saisit dans l’application DUT Conducteur (Android et iOS) et son téléphone devient l’unité de suivi du véhicule.',
    introOfficer: 'Générez le code pour le compte du transporteur et remettez-le au conducteur. Son téléphone deviendra l’unité de suivi du véhicule.',
    optional: 'Facultatif : le suivi peut être activé à tout moment après le paiement.',
    generate: 'Générer le code de jumelage',
    validFor: 'Valable encore',
    expired: 'Code expiré, générez-en un nouveau.',
    sms: 'Envoyer par SMS au conducteur',
    smsSent: 'SMS envoyé au',
    copy: 'Copier',
    copied: 'Copié',
    regen: 'Nouveau code',
    simulate: 'Simuler la saisie par le conducteur',
    scanQr: 'Le conducteur peut aussi scanner ce QR code, ou celui imprimé sur le DUT : le DUT est alors lié automatiquement à son téléphone.',
    linked: 'Téléphone lié',
    linkedOn: 'Suivi GPS actif',
    lastPoint: 'Dernier point il y a 30 s',
    unlink: 'Délier le téléphone',
    vehicle: 'Véhicule',
    driver: 'Conducteur',
    route: 'Trajet',
  },
  en: {
    title: 'Vehicle tracking',
    kicker: 'Pairing code',
    locked: 'Available once the STD is paid.',
    lockedHint: 'The code lets you track the vehicle and its cargo from the driver’s phone.',
    introCompany: 'Generate a 6-digit code and send it to the driver. He enters it in the DUT Driver app (Android and iOS) and his phone becomes the vehicle’s tracking unit.',
    introOfficer: 'Generate the code on behalf of the transporter and give it to the driver. His phone becomes the vehicle’s tracking unit.',
    optional: 'Optional: tracking can be turned on at any time after payment.',
    generate: 'Generate pairing code',
    validFor: 'Valid for',
    expired: 'Code expired, generate a new one.',
    sms: 'Send to driver by SMS',
    smsSent: 'SMS sent to',
    copy: 'Copy',
    copied: 'Copied',
    regen: 'New code',
    simulate: 'Simulate the driver entering it',
    scanQr: 'The driver can also scan this QR code, or the one printed on the STD: the STD is then linked to his phone automatically.',
    linked: 'Phone linked',
    linkedOn: 'GPS tracking on',
    lastPoint: 'Last fix 30 s ago',
    unlink: 'Unlink phone',
    vehicle: 'Vehicle',
    driver: 'Driver',
    route: 'Route',
  },
};

const pairTxt = (lang) => PAIR_TXT[lang === 'en' ? 'en' : 'fr'];
const makePairCode = () => String(Math.floor(100000 + Math.random() * 900000));

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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR code" style={{ background: '#fff', border: '1px solid #161413', flexShrink: 0 }}>
      {cells.map((on, i) => {
        const r = Math.floor(i / n), c = i % n;
        const f = finder(r, c);
        const fill = f === -1 ? on : f === 1;
        return fill ? <rect key={i} x={(c + 1) * u} y={(r + 1) * u} width={u + 0.3} height={u + 0.3} fill="#161413"/> : null;
      })}
    </svg>
  );
};

const PairingCard = ({ lang = 'fr', dut, paid = true, actor = 'company', initialStatus = 'none', compact = false }) => {
  const T = pairTxt(lang);
  const [status, setStatus] = React.useState(initialStatus); // none | code | linked
  const [code, setCode] = React.useState(initialStatus === 'code' ? '482913' : null);
  const [left, setLeft] = React.useState(15 * 60);
  const [copied, setCopied] = React.useState(false);
  const [sms, setSms] = React.useState(false);

  React.useEffect(() => {
    if (status !== 'code') return;
    const id = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [status, code]);

  const generate = () => { setCode(makePairCode()); setLeft(15 * 60); setStatus('code'); setCopied(false); setSms(false); };
  const copy = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(code); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  const label = { fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' };

  return (
    <section style={{ background: '#fff', border: '1px solid #E5DDC9', padding: compact ? 16 : 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="pin" size={16}/>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={label}>{T.kicker}</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>{T.title}</div>
        </div>
      </div>

      {dut && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, padding: '10px 12px', background: '#F7F3EB', border: '1px solid #EFE8D6', marginBottom: 14, fontSize: 12 }}>
          <div><div style={{ ...label, fontSize: 9.5 }}>{T.vehicle}</div><div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{dut.vehicle}</div></div>
          {dut.driver && <div><div style={{ ...label, fontSize: 9.5 }}>{T.driver}</div><div>{dut.driver}</div></div>}
          {dut.from && <div><div style={{ ...label, fontSize: 9.5 }}>{T.route}</div><div>{dut.from} → {dut.to}</div></div>}
        </div>
      )}

      {!paid && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, background: '#F7F3EB', border: '1px dashed #DCD3BD' }}>
          <Icon name="shield" size={16} style={{ color: '#6B6557', flexShrink: 0, marginTop: 2 }}/>
          <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600 }}>{T.locked}</div>
            <div style={{ color: '#6B6557', marginTop: 2 }}>{T.lockedHint}</div>
          </div>
        </div>
      )}

      {paid && status === 'none' && (
        <>
          <p style={{ fontSize: 12.5, lineHeight: 1.55, color: '#3A352D', margin: '0 0 8px' }}>{actor === 'officer' ? T.introOfficer : T.introCompany}</p>
          <p style={{ fontSize: 11.5, color: '#6B6557', margin: '0 0 14px' }}>{T.optional}</p>
          <button onClick={generate} style={{ ...primaryBtn(), width: '100%', justifyContent: 'center', padding: '12px 16px' }}>
            <Icon name="qr" size={15}/> {T.generate}
          </button>
        </>
      )}

      {paid && status === 'code' && (
        <>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {code.split('').map((d, i) => (
                  <div key={i} style={{ flex: '1 1 0', maxWidth: 40, height: 48, border: '1.5px solid #161413', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 22, fontWeight: 700, background: left ? '#fff' : '#F0E9D6', color: left ? '#161413' : '#9A9281' }}>{d}</div>
                ))}
              </div>
              <div style={{ fontSize: 11.5, marginTop: 8, color: left ? '#6B6557' : '#8A1B1B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="clock" size={13}/>
                {left ? <>{T.validFor} <b style={{ fontVariantNumeric: 'tabular-nums', color: '#161413' }}>{mm}:{ss}</b></> : T.expired}
              </div>
            </div>
            <PairQr value={`${dut ? dut.id : 'DUT'}-${code}`} size={compact ? 88 : 104}/>
          </div>
          <p style={{ fontSize: 11.5, lineHeight: 1.5, color: '#6B6557', margin: '12px 0' }}>{T.scanQr}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setSms(true)} style={{ ...primaryBtn(), flex: '1 1 200px', justifyContent: 'center' }} disabled={!left}>
              <Icon name="phone" size={14}/> {T.sms}
            </button>
            <button onClick={copy} style={{ ...ghostBtn(), flex: '0 1 auto' }} disabled={!left}>{copied ? T.copied : T.copy}</button>
            <button onClick={generate} style={{ ...ghostBtn(), flex: '0 1 auto' }}><Icon name="reload" size={13}/> {T.regen}</button>
          </div>
          {sms && <div style={{ marginTop: 10, fontSize: 12, color: '#1F4F2C', display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="check" size={14}/> {T.smsSent} {(dut && dut.driverPhone) || '+224 622 04 18 77'}</div>}
          <button onClick={() => setStatus('linked')} style={{ marginTop: 12, background: 'none', border: 'none', padding: 0, color: '#6B6557', fontSize: 11.5, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit' }}>
            {T.simulate}
          </button>
        </>
      )}

      {paid && status === 'linked' && (
        <>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, background: '#E8F2EA', border: '1px solid #B9D6BF' }}>
            <Icon name="check" size={18} style={{ color: '#1F4F2C', flexShrink: 0, marginTop: 1 }}/>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: '#1F4F2C' }}>{T.linked}</div>
              <div>{(dut && dut.driver) || 'Conducteur'}, Samsung Galaxy A14</div>
              <div style={{ color: '#3A5A40', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#009460', display: 'inline-block' }}/>
                {T.linkedOn}. {T.lastPoint}
              </div>
            </div>
          </div>
          <button onClick={() => setStatus('none')} style={{ ...ghostBtn(), marginTop: 12 }}>{T.unlink}</button>
        </>
      )}
    </section>
  );
};

// Company transporter: dedicated tracking page listing paid DUTs.
const TransporterTracking = ({ lang = 'fr', onOpenDut }) => {
  const isFr = lang !== 'en';
  const rows = RECENT_DUTS.filter(d => d.status === 'paid').map((d, i) => ({
    ...d,
    driver: (VEHICLES.find(v => v.plate === d.vehicle) || {}).driver,
    tracking: i === 0 ? 'linked' : 'none',
  }));
  const [sel, setSel] = React.useState(rows[1] ? rows[1].id : rows[0].id);
  const current = rows.find(r => r.id === sel) || rows[0];
  const linkedCount = rows.filter(r => r.tracking === 'linked').length;
  return (
    <div>
      <PageHead kicker={isFr ? 'DUT payés, jumelage du téléphone conducteur' : 'Paid STDs, driver phone pairing'} title={isFr ? 'Suivi des véhicules' : 'Vehicle tracking'}/>
      <div className="sober-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
        <KpiTile label={isFr ? 'Véhicules suivis' : 'Tracked vehicles'} big={linkedCount} hint={isFr ? 'GPS actif' : 'GPS on'}/>
        <KpiTile label={isFr ? 'DUT payés sans suivi' : 'Paid STDs not tracked'} big={rows.length - linkedCount} hint={isFr ? 'Code à générer' : 'Code to generate'}/>
        <KpiTile label={isFr ? 'Applications' : 'Apps'} big="2" hint="Android, iOS"/>
      </div>
      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 18, alignItems: 'start' }}>
        <section style={paperCard(true)}>
          <header style={cardHeader()}><h2 style={cardTitle()}>{isFr ? 'DUT payés' : 'Paid STDs'}</h2></header>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rows.map(r => {
              const active = r.id === current.id;
              return (
                <button key={r.id} onClick={() => setSel(r.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', textAlign: 'left',
                  background: active ? '#FBF8F2' : 'transparent', border: 'none', borderLeft: active ? '2px solid #CE1126' : '2px solid transparent',
                  borderBottom: '1px solid #F0E9D6', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 600 }}>{r.id}</div>
                    <div style={{ fontSize: 12, color: '#6B6557', marginTop: 2 }}>{r.from} → {r.to}, {r.vehicle}</div>
                  </div>
                  {r.tracking === 'linked'
                    ? <span style={{ fontSize: 10.5, fontWeight: 700, color: '#1F4F2C', background: '#E8F2EA', padding: '3px 8px', whiteSpace: 'nowrap' }}>{isFr ? 'Suivi actif' : 'Tracking'}</span>
                    : <span style={{ fontSize: 10.5, fontWeight: 600, color: '#6B6557', border: '1px solid #DCD3BD', padding: '3px 8px', whiteSpace: 'nowrap' }}>{isFr ? 'Non suivi' : 'Not tracked'}</span>}
                  <Icon name="chev" size={14} style={{ color: '#9A9281', flexShrink: 0 }}/>
                </button>
              );
            })}
          </div>
        </section>
        <PairingCard key={current.id} lang={lang} actor="company" paid dut={current} initialStatus={current.tracking}/>
      </div>
    </div>
  );
};

Object.assign(window, { PairingCard, PairQr, TransporterTracking });

// Sub-screens shared across the Officer and Transporter platforms.
// All of them read and write the shared store.

const PageHead = ({ kicker, title, children }) => (
  <div className="dut-pagehead" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #E5DDC9', paddingBottom: 14, marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
    <div>
      <div style={{ fontSize: 11, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase' }}>{kicker}</div>
      <h1 style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 28, margin: '6px 0 0', fontWeight: 500 }}>{title}</h1>
    </div>
    {children && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>}
  </div>
);
const SettingsCard = ({ title, children }) => (
  <section style={paperCard(true)}><header style={cardHeader()}><h2 style={cardTitle()}>{title}</h2></header>{children}</section>
);
const ToggleSwitch = ({ checked, onChange, label }) => (
  <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} style={{ width: 38, height: 22, borderRadius: 11, border: 'none', background: checked ? '#009460' : '#DCD3BD', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .15s' }}>
    <span style={{ position: 'absolute', top: 3, left: checked ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s' }}/>
  </button>
);
// Setting row with an optional working toggle (local state, toast on change).
const SettingRow = ({ label, value, tone, toggle, defaultChecked, onClick }) => {
  const [on, setOn] = React.useState(!!defaultChecked);
  const toast = useToast();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid #F0E9D6' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {value && <div style={{ fontSize: 11.5, color: tone === 'good' ? '#1F4F2C' : '#6B6557' }}>{value}</div>}
      </div>
      {toggle && <ToggleSwitch checked={on} label={label} onChange={(v) => { setOn(v); toast(`${label} : ${v ? 'activé' : 'désactivé'}`, 'info'); }}/>}
      {onClick && <button style={{ ...ghostBtn(), padding: '5px 10px', fontSize: 11.5 }} onClick={onClick}>Modifier</button>}
    </div>
  );
};
const ContactTile = ({ icon, label, value, detail, href, onClick }) => {
  const inner = (
    <>
      <div style={{ width: 36, height: 36, background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={16}/></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10.5, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
        {detail && <div style={{ fontSize: 11.5, color: '#6B6557' }}>{detail}</div>}
      </div>
    </>
  );
  const st = { ...paperCard(), display: 'flex', gap: 12, alignItems: 'flex-start', textDecoration: 'none', color: '#161413', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%' };
  return href ? <a href={href} style={st}>{inner}</a> : <button onClick={onClick} style={st}>{inner}</button>;
};

// ─── Officer: Transporteurs ────────────────────────────────────────
const OfficerTransporters = ({ lang, go }) => {
  const s = useDut();
  const toast = useToast();
  const [q, setQ] = React.useState('');
  const [kind, setKind] = React.useState('all');
  const [add, setAdd] = React.useState(false);
  const [nt, setNt] = React.useState({ kind: 'company', short: '', contact: '', doc: '', phone: '+224 6', city: 'Conakry', address: '' });
  const list = s.transporters.filter(t => (kind === 'all' || t.kind === kind) && (t.short + t.id + t.city).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHead kicker="Référentiel, transporteurs agréés" title="Transporteurs">
        <button style={ghostBtn()} onClick={() => { downloadCsv('transporteurs.csv', [['ID', 'Nom', 'Type', 'Pièce', 'Ville', 'Téléphone'], ...s.transporters.map(t => [t.id, t.short, t.kind, t.doc, t.city, t.phone])]); toast('Export téléchargé'); }}><Icon name="download" size={13}/> Exporter</button>
        <button style={primaryBtn()} onClick={() => setAdd(true)}><Icon name="plus" size={14}/> Nouveau transporteur</button>
      </PageHead>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ flex: '1 1 220px', maxWidth: 320 }}><Input value={q} onChange={setQ} placeholder="Filtrer par nom, identifiant, ville"/></div>
        <FilterChips value={kind} onChange={setKind} options={[['all', 'Tous'], ['company', 'Personnes morales'], ['individual', 'Personnes physiques']]}/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {list.map(tr => {
          const isInd = tr.kind === 'individual';
          const bills = sel.billsOf(s, tr.id);
          const due = bills.filter(b => b.status === 'pending');
          return (
            <button key={tr.id} onClick={() => go('transporter', tr.id)} style={{ ...paperCard(), padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: '#161413' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, background: isInd ? '#FBF8F2' : '#161413', color: isInd ? '#161413' : '#FCD116', border: isInd ? '1px solid #E5DDC9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: '"Crimson Pro", serif', borderRadius: isInd ? '50%' : 0, flexShrink: 0 }}>{tr.short.split(' ').map(x => x[0]).slice(0, 2).join('')}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.short}</div>
                  <div style={{ fontSize: 10.5, color: '#9A9281', ...monoStyle }}>{tr.id}</div>
                </div>
                <span style={{ background: isInd ? '#FFF6E0' : '#E8F2EA', color: isInd ? '#7A5A00' : '#1F4F2C', padding: '2px 7px', fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>{isInd ? 'P. physique' : 'Agréé'}</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#6B6557', lineHeight: 1.7 }}>
                <div style={{ ...monoStyle, fontSize: 11 }}>{tr.doc}</div>
                <div>{tr.city}, {sel.vehiclesOf(s, tr.id).length} véhicule(s)</div>
                <div>{tr.payAccount ? `${PROVIDERS[tr.payAccount.provider].label}${tr.payAccount.mandate ? ', prélèvement autorisé' : ''}` : 'Pas de compte de paiement'}</div>
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E5DDC9', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#9A9281' }}>{bills.length} DUT</span>
                {due.length > 0 ? <span style={{ color: '#8A1B1B', fontWeight: 600 }}>{due.length} à régler</span> : <span style={{ color: '#1F4F2C' }}>À jour</span>}
              </div>
            </button>
          );
        })}
      </div>
      {add && (
        <DutModal title="Nouveau transporteur" onClose={() => setAdd(false)} footer={<><button style={ghostBtn()} onClick={() => setAdd(false)}>Annuler</button><button style={primaryBtn()} disabled={!nt.short || !nt.doc} onClick={() => { const id = (nt.kind === 'company' ? 'TRP-' : 'IND-') + Math.floor(10000 + Math.random() * 89999); dutActions.addTransporter({ ...nt, id, name: nt.kind === 'company' ? nt.short.toUpperCase() : nt.short, contact: nt.contact || nt.short, address: nt.address || nt.city, nif: '', email: '', since: 2026, payAccount: null }); toast(`${nt.short} enregistré (${id})`); setAdd(false); go('transporter', id); }}>Enregistrer</button></>}>
          <Field label="Type"><Select value={nt.kind} onChange={v => setNt(x => ({ ...x, kind: v }))} options={[{ value: 'company', label: 'Personne morale' }, { value: 'individual', label: 'Personne physique' }]}/></Field>
          <FieldRow><Field label={nt.kind === 'company' ? 'Raison sociale' : 'Nom et prénoms'}><Input value={nt.short} onChange={v => setNt(x => ({ ...x, short: v }))}/></Field><Field label={nt.kind === 'company' ? 'RCCM' : 'N° CNI'}><Input value={nt.doc} onChange={v => setNt(x => ({ ...x, doc: v }))}/></Field></FieldRow>
          <FieldRow><Field label="Représentant"><Input value={nt.contact} onChange={v => setNt(x => ({ ...x, contact: v }))}/></Field><Field label="Téléphone"><Input value={nt.phone} onChange={v => setNt(x => ({ ...x, phone: v }))}/></Field></FieldRow>
          <FieldRow><Field label="Ville"><Select value={nt.city} onChange={v => setNt(x => ({ ...x, city: v }))} options={DUT_CITIES}/></Field><Field label="Adresse"><Input value={nt.address} onChange={v => setNt(x => ({ ...x, address: v }))}/></Field></FieldRow>
        </DutModal>
      )}
    </div>
  );
};

const OfficerTransporterDetail = ({ lang, id, go }) => {
  const s = useDut();
  const [addVeh, setAddVeh] = React.useState(false);
  const tr = sel.transporter(s, id);
  if (!tr) return null;
  const bills = [...sel.billsOf(s, id)].sort((a, b) => b.issuedAt - a.issuedAt);
  const vehicles = sel.vehiclesOf(s, id);
  const acc = tr.payAccount;
  return (
    <div>
      <PageHead kicker={`${tr.kind === 'company' ? 'Personne morale' : 'Personne physique'}, ${tr.id}`} title={tr.short}>
        <button style={ghostBtn()} onClick={() => go('transporters')}>← Transporteurs</button>
        <button style={primaryBtn()} onClick={() => go('issue', null, { transporterId: id })}><Icon name="plus" size={14}/> Émettre un DUT</button>
      </PageHead>
      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 22, marginBottom: 22 }}>
        <section style={paperCard(true)}>
          <header style={cardHeader()}><h2 style={cardTitle()}>Identification</h2></header>
          <SummaryRow label={tr.kind === 'company' ? 'Raison sociale' : 'Nom'} value={tr.name}/>
          <SummaryRow label={tr.kind === 'company' ? 'RCCM' : 'Pièce'} value={tr.doc} mono/>
          <SummaryRow label="Représentant" value={tr.contact}/>
          <SummaryRow label="Téléphone" value={tr.phone}/>
          <SummaryRow label="Adresse" value={tr.address}/>
        </section>
        <section style={paperCard(true)}>
          <header style={cardHeader()}><h2 style={cardTitle()}>Paiement</h2></header>
          {acc ? (
            <>
              <SummaryRow label="Compte enregistré" value={`${PROVIDERS[acc.provider].label} ${maskPhone(acc.number)}`}/>
              <SummaryRow label="Titulaire" value={acc.holder}/>
              <SummaryRow label="Prélèvement par la DNTT" value={acc.mandate ? 'Autorisé' : 'Non autorisé'}/>
              <SummaryRow label="Paiement automatique" value={acc.mandate && acc.autoPay ? 'Activé à chaque émission' : 'Désactivé'}/>
            </>
          ) : <p style={{ fontSize: 12.5, color: '#6B6557', margin: 0 }}>Le transporteur n’a pas encore enregistré de moyen de paiement. Vous pouvez encaisser en espèces ou envoyer une demande de paiement mobile money.</p>}
          <div style={{ marginTop: 10, fontSize: 12 }}>{bills.filter(b => b.status === 'pending').length} DUT à régler, {fmtGNF(bills.filter(b => b.status === 'pending').reduce((x, b) => x + b.amount, 0))}</div>
        </section>
      </div>
      <section style={{ ...paperCard(), marginBottom: 22 }}>
        <header style={cardHeader()}><h2 style={cardTitle()}>Véhicules ({vehicles.length})</h2><button style={ghostBtn()} onClick={() => setAddVeh(true)}><Icon name="plus" size={13}/> Ajouter</button></header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {vehicles.map(v => <div key={v.plate} style={{ padding: 10, border: '1px solid #E5DDC9', fontSize: 12 }}><b style={monoStyle}>{v.plate}</b><div style={{ color: '#6B6557' }}>{v.type}, {v.brand}, {v.driver}</div></div>)}
        </div>
      </section>
      <section style={paperCard()}><header style={cardHeader()}><h2 style={cardTitle()}>DUT ({bills.length})</h2></header><BillsTable bills={bills} onOpen={(b) => go('bill', b.id)} lang={lang}/></section>
      {addVeh && <AddVehicleModal transporterId={id} onClose={() => setAddVeh(false)}/>}
    </div>
  );
};

// ─── Officer: Véhicules ────────────────────────────────────────────
const OfficerVehicles = ({ lang, go }) => {
  const s = useDut();
  const [q, setQ] = React.useState('');
  const [add, setAdd] = React.useState(false);
  const list = s.vehicles.filter(v => (v.plate + v.brand + v.driver).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHead kicker="Référentiel, véhicules immatriculés" title="Véhicules"><button style={primaryBtn()} onClick={() => setAdd(true)}><Icon name="plus" size={14}/> Ajouter un véhicule</button></PageHead>
      <div style={{ maxWidth: 320, marginBottom: 14 }}><Input value={q} onChange={setQ} placeholder="Plaque, marque ou conducteur"/></div>
      <section style={paperCard()}>
        <div style={{ overflowX: 'auto' }}>
          <table className="sober-stack" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead><tr style={{ color: '#9A9281', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase' }}>{['Plaque', 'Transporteur', 'Type', 'Marque', 'Conducteur', 'Dernier DUT'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>)}</tr></thead>
            <tbody>
              {list.map((v, i) => {
                const tr = sel.transporter(s, v.transporterId) || {};
                const last = s.bills.filter(b => b.vehicle === v.plate).sort((a, b) => b.issuedAt - a.issuedAt)[0];
                return (
                  <tr key={v.plate} style={{ background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                    <td data-label="Plaque" style={{ ...td(), ...monoStyle, fontWeight: 600 }}>{v.plate}</td>
                    <td data-label="Transporteur" style={td()}><button onClick={() => go('transporter', tr.id)} style={{ background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>{tr.short}</button></td>
                    <td data-label="Type" style={td()}>{v.type}</td>
                    <td data-label="Marque" style={td()}>{v.brand} {v.year}</td>
                    <td data-label="Conducteur" style={td()}>{v.driver}</td>
                    <td data-label="Dernier DUT" style={td()}>{last ? <button onClick={() => go('bill', last.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', ...monoStyle, fontSize: 11.5, textDecoration: 'underline' }}>{last.id}</button> : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {add && <AddVehicleModal transporters={s.transporters} onClose={() => setAdd(false)}/>}
    </div>
  );
};

// ─── Officer: Contrôles et suivi ───────────────────────────────────
const OfficerControls = ({ lang, go }) => {
  const s = useDut();
  useTick(2000);
  const tracked = Object.keys(s.trips).map(id => sel.bill(s, id)).filter(Boolean).sort((a, b) => (s.trips[a.id].status === 'in_progress' ? -1 : 1));
  return (
    <div>
      <PageHead kicker="Véhicules suivis par téléphone et passages aux postes de contrôle" title="Contrôles et suivi"/>
      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
        <section style={paperCard()}>
          <header style={cardHeader()}><h2 style={cardTitle()}>Trajets suivis</h2></header>
          {tracked.map((b, i) => (
            <div key={b.id} style={{ padding: '12px 0', borderTop: i ? '1px solid #E5DDC9' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => go('bill', b.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}><b style={monoStyle}>{b.vehicle}</b> <span style={{ fontSize: 12, color: '#6B6557' }}>{b.id}, {(sel.transporter(s, b.transporterId) || {}).short}</span></button>
                <TripStatus billId={b.id}/>
              </div>
              <TripTimeline billId={b.id} compact/>
            </div>
          ))}
        </section>
        <section style={paperCard()}>
          <header style={cardHeader()}><h2 style={cardTitle()}>Passages aux postes</h2></header>
          {s.passages.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: i ? '1px solid #E5DDC9' : 'none', fontSize: 12.5 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: p.result === 'ok' ? '#009460' : '#CE1126', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{p.result === 'ok' ? <Icon name="check" size={12} stroke={3}/> : '!'}</span>
              <div style={{ flex: 1 }}>
                <div><b style={monoStyle}>{p.plate}</b>, {p.post}</div>
                <div style={{ color: '#6B6557', fontSize: 11.5 }}>{fmtDT(p.at)}, {p.agent}. {p.note}</div>
                {p.billId && <button onClick={() => go('bill', p.billId)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', ...monoStyle, fontSize: 11, textDecoration: 'underline' }}>{p.billId}</button>}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

// ─── Officer: Tarif ────────────────────────────────────────────────
const OfficerTariffs = () => (
  <div>
    <PageHead kicker="Arrêté 2025/MTI/DNTT" title="Tarif du DUT"/>
    <div className="sober-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
      <KpiTile label="Prix fixe par DUT" big={fmtEur(TARIFF.priceEur)} hint="Tous trajets, toutes marchandises" tone="good"/>
      <KpiTile label="Montant encaissé" big={fmtGNF(TARIFF.priceGnf).replace(' GNF', '')} suffix="GNF" hint={`Taux de référence : 1 € = ${fmtGNF(TARIFF.eurToGnf)}`}/>
      <KpiTile label="Validité de paiement" big="48 h" hint="Après émission, ensuite expiré"/>
    </div>
    <section style={paperCard(true)}>
      <header style={cardHeader()}><h2 style={cardTitle()}>Règles appliquées</h2></header>
      {[
        ['Montant', `Le DUT coûte ${fmtEur(TARIFF.priceEur)}, quel que soit le trajet, la distance, le véhicule ou la marchandise.`],
        ['Paiement', 'Orange Money, MTN MoMo, carte bancaire, virement, espèces au guichet DNTT, ou prélèvement sur le compte enregistré du transporteur.'],
        ['Encaissement par l’agent', 'L’agent peut régler le DUT pour le transporteur : espèces, demande de paiement mobile money ou prélèvement autorisé.'],
        ['Suivi du véhicule', 'Facultatif, activé après paiement par un code de jumelage à 6 chiffres ou en scannant le QR code du DUT.'],
      ].map(([k, v]) => <SummaryRow key={k} label={k} value={v}/>)}
    </section>
  </div>
);

// ─── Officer: Profil ───────────────────────────────────────────────
const OfficerProfile = () => {
  const s = useDut();
  const toast = useToast();
  const [edit, setEdit] = React.useState(false);
  const [pwd, setPwd] = React.useState(false);
  const [f, setF] = React.useState(s.officer);
  const o = s.officer;
  return (
    <div>
      <PageHead kicker={`Agent DNTT, ${o.badge}`} title="Mon profil"/>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)', gap: 22 }} className="dut-profile-grid">
        <section style={paperCard(true)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Crimson Pro", serif', fontSize: 42, fontWeight: 600 }}>{o.initials}</div>
            <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 22, fontWeight: 600, textAlign: 'center' }}>{o.name}</div>
            <div style={{ fontSize: 12, color: '#6B6557', textAlign: 'center' }}>{o.role}</div>
            <div style={{ ...monoStyle, fontSize: 11, padding: '3px 8px', background: '#161413', color: '#FCD116', marginTop: 4 }}>{o.badge}</div>
          </div>
        </section>
        <section style={paperCard(true)}>
          <header style={cardHeader()}><h2 style={cardTitle()}>Coordonnées professionnelles</h2></header>
          <SummaryRow label="Affectation" value={o.office}/>
          <SummaryRow label="Adresse" value={DNTT_HQ.address}/>
          <SummaryRow label="Email" value={o.email}/>
          <SummaryRow label="Téléphone" value={o.phone}/>
          <SummaryRow label="Habilitations" value="Émission DUT, encaissement, contrôle routier"/>
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #E5DDC9', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={ghostBtn()} onClick={() => { setF(o); setEdit(true); }}>Modifier mes informations</button>
            <button style={ghostBtn()} onClick={() => setPwd(true)}>Changer le mot de passe</button>
          </div>
        </section>
      </div>
      {edit && (
        <DutModal title="Modifier mes informations" onClose={() => setEdit(false)} footer={<><button style={ghostBtn()} onClick={() => setEdit(false)}>Annuler</button><button style={primaryBtn()} onClick={() => { dutActions.updateOfficer({ ...f, initials: f.name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase() }); setEdit(false); toast('Profil mis à jour'); }}>Enregistrer</button></>}>
          <Field label="Nom complet"><Input value={f.name} onChange={v => setF(x => ({ ...x, name: v }))}/></Field>
          <FieldRow><Field label="Email"><Input value={f.email} onChange={v => setF(x => ({ ...x, email: v }))}/></Field><Field label="Téléphone"><Input value={f.phone} onChange={v => setF(x => ({ ...x, phone: v }))}/></Field></FieldRow>
        </DutModal>
      )}
      {pwd && <PasswordModal onClose={() => setPwd(false)}/>}
    </div>
  );
};
const PasswordModal = ({ onClose }) => {
  const toast = useToast();
  const [a, setA] = React.useState(''); const [b, setB] = React.useState(''); const [c, setC] = React.useState('');
  const ok = a.length >= 4 && b.length >= 8 && b === c;
  return (
    <DutModal title="Changer le mot de passe" onClose={onClose} footer={<><button style={ghostBtn()} onClick={onClose}>Annuler</button><button style={{ ...primaryBtn(), opacity: ok ? 1 : .5 }} disabled={!ok} onClick={() => { onClose(); toast('Mot de passe modifié'); }}>Valider</button></>}>
      <Field label="Mot de passe actuel"><Input type="password" value={a} onChange={setA}/></Field>
      <Field label="Nouveau mot de passe (8 caractères minimum)"><Input type="password" value={b} onChange={setB}/></Field>
      <Field label="Confirmer"><Input type="password" value={c} onChange={setC}/></Field>
      {c && b !== c && <div style={{ fontSize: 12, color: '#8A1B1B' }}>Les deux mots de passe ne correspondent pas.</div>}
    </DutModal>
  );
};

// ─── Officer: Paramètres ───────────────────────────────────────────
const OfficerSettings = () => {
  const toast = useToast();
  return (
    <div>
      <PageHead kicker="Préférences de l’application" title="Paramètres"/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <SettingsCard title="Sécurité">
          <SettingRow label="Authentification à deux facteurs" value="SMS au +224 622 04 71 88" toggle defaultChecked/>
          <SettingRow label="Verrouillage automatique" value="Après 5 minutes d’inactivité" toggle defaultChecked/>
        </SettingsCard>
        <SettingsCard title="Notifications">
          <SettingRow label="Paiements reçus" value="Push et email" toggle defaultChecked/>
          <SettingRow label="Anomalies aux postes de contrôle" value="Push immédiat" toggle defaultChecked/>
          <SettingRow label="Échéances dépassées" value="Récapitulatif à 08:00" toggle/>
        </SettingsCard>
        <SettingsCard title="Intégrations">
          <SettingRow label="SAFI, Trésor public" value="Connecté" tone="good"/>
          <SettingRow label="KKiaPay (mobile money, cartes)" value="Connecté" tone="good"/>
          <SettingRow label="RCCM, CCI" value="Connecté" tone="good"/>
        </SettingsCard>
        <SettingsCard title="Démonstration">
          <p style={{ fontSize: 12.5, color: '#6B6557', marginTop: 0 }}>Remet toutes les données du prototype à leur état initial (DUT, paiements, jumelages, trajets).</p>
          <button style={ghostBtn()} onClick={() => { dutActions.reset(); toast('Données de démonstration réinitialisées', 'info'); }}><Icon name="reload" size={13}/> Réinitialiser la démo</button>
        </SettingsCard>
      </div>
    </div>
  );
};

// ─── Transporter (company or individual): fleet ────────────────────
const TransporterFleet = ({ transporterId, go }) => {
  const s = useDut();
  const toast = useToast();
  const [add, setAdd] = React.useState(false);
  const tr = sel.transporter(s, transporterId);
  const vehicles = sel.vehiclesOf(s, transporterId);
  return (
    <div>
      <PageHead kicker={`${tr.short}, ${vehicles.length} véhicule(s)`} title="Ma flotte"><button style={primaryBtn()} onClick={() => setAdd(true)}><Icon name="plus" size={14}/> Ajouter un véhicule</button></PageHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {vehicles.map(v => {
          const active = s.bills.find(b => b.vehicle === v.plate && s.trips[b.id] && s.trips[b.id].status === 'in_progress');
          return (
            <div key={v.plate} style={{ ...paperCard(), padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 28, border: '1.5px solid #161413', background: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', ...monoStyle, fontSize: 10, fontWeight: 700 }}>RG</div>
                <div style={{ flex: 1 }}><div style={{ ...monoStyle, fontWeight: 700 }}>{v.plate}</div><div style={{ fontSize: 11.5, color: '#6B6557' }}>{v.type}, {v.brand} {v.year}</div></div>
              </div>
              <div style={{ fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>
                <div>Conducteur : <b>{v.driver}</b></div>
                <div style={{ color: '#6B6557' }}>{v.driverPhone}, capacité {v.capacity} t</div>
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E5DDC9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                {active ? <button onClick={() => go('tracking', active.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}><TripStatus billId={active.id}/></button>
                  : <span style={{ fontSize: 11, color: v.status === 'active' ? '#1F4F2C' : '#8A1B1B' }}>{v.status === 'active' ? 'Disponible' : 'En maintenance'}</span>}
                <button style={{ ...ghostBtn(), padding: '4px 10px', fontSize: 11 }} onClick={() => { dutActions.updateVehicle(v.plate, { status: v.status === 'active' ? 'maintenance' : 'active' }); toast(`${v.plate} : ${v.status === 'active' ? 'en maintenance' : 'disponible'}`, 'info'); }}>{v.status === 'active' ? 'Mettre en maintenance' : 'Remettre en service'}</button>
              </div>
            </div>
          );
        })}
      </div>
      {add && <AddVehicleModal transporterId={transporterId} onClose={() => setAdd(false)}/>}
    </div>
  );
};

// ─── Transporter: tracking page ────────────────────────────────────
const TransporterTracking = ({ transporterId, initialId, lang }) => {
  const s = useDut();
  const rows = sel.billsOf(s, transporterId).filter(b => b.status === 'paid').sort((a, b) => b.issuedAt - a.issuedAt);
  const [selId, setSel] = React.useState(initialId || (rows.find(b => !s.pairings[b.id]) || rows[0] || {}).id);
  const current = rows.find(r => r.id === selId) || rows[0];
  const tracked = rows.filter(r => sel.tripState(s, r.id) === 'in_progress').length;
  return (
    <div>
      <PageHead kicker="DUT payés, jumelage du téléphone conducteur" title="Suivi des véhicules"/>
      <div className="sober-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
        <KpiTile label="En route" big={String(tracked)} hint="GPS actif"/>
        <KpiTile label="Sans suivi" big={String(rows.filter(r => !s.pairings[r.id]).length)} hint="Code à générer"/>
        <KpiTile label="Application" big="2" hint="Android et iOS"/>
      </div>
      {rows.length === 0 ? <section style={paperCard(true)}>Aucun DUT payé pour l’instant. Le suivi devient disponible après paiement.</section> : (
        <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: 18, alignItems: 'start' }}>
          <section style={paperCard()}>
            <header style={cardHeader()}><h2 style={cardTitle()}>DUT payés</h2></header>
            {rows.map(r => {
              const on = r.id === current.id;
              return (
                <button key={r.id} onClick={() => setSel(r.id)} aria-pressed={on} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 10px', textAlign: 'left', background: on ? '#FBF8F2' : 'transparent', border: 'none', borderLeft: on ? '2px solid #CE1126' : '2px solid transparent', borderBottom: '1px solid #F0E9D6', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                  <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: 'block', ...monoStyle, fontSize: 12, fontWeight: 600 }}>{r.id}</span><span style={{ display: 'block', fontSize: 12, color: '#6B6557' }}>{r.from} → {r.to}, {r.vehicle}</span></span>
                  <TripStatus billId={r.id}/>
                </button>
              );
            })}
          </section>
          <PairingCard key={current.id} billId={current.id} actor="company" lang={lang}/>
        </div>
      )}
    </div>
  );
};

// ─── Transporter: profile, support, settings ───────────────────────
const TransporterProfile = ({ transporterId }) => {
  const s = useDut();
  const toast = useToast();
  const tr = sel.transporter(s, transporterId);
  const [edit, setEdit] = React.useState(false);
  const [f, setF] = React.useState(tr);
  return (
    <div>
      <PageHead kicker={`Compte transporteur, ${tr.id}`} title={tr.kind === 'company' ? 'Profil de ma société' : 'Mon profil'}><button style={ghostBtn()} onClick={() => { setF(tr); setEdit(true); }}>Modifier</button></PageHead>
      <div className="sober-grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
        <section style={paperCard(true)}>
          <header style={cardHeader()}><h2 style={cardTitle()}>Identification</h2></header>
          <SummaryRow label={tr.kind === 'company' ? 'Raison sociale' : 'Nom'} value={tr.name}/>
          <SummaryRow label={tr.kind === 'company' ? 'RCCM' : 'Pièce d’identité'} value={tr.doc} mono/>
          {tr.nif && <SummaryRow label="NIF" value={tr.nif} mono/>}
          <SummaryRow label="Représentant" value={tr.contact}/>
          <SummaryRow label="Adresse" value={tr.address}/>
          <SummaryRow label="Téléphone" value={tr.phone}/>
          <SummaryRow label="Email" value={tr.email || '-'}/>
          <SummaryRow label="Carte transporteur" value="Valide jusqu’au 07/06/2026"/>
        </section>
        <PayAccountCard transporterId={transporterId}/>
      </div>
      {edit && (
        <DutModal title="Modifier le profil" onClose={() => setEdit(false)} footer={<><button style={ghostBtn()} onClick={() => setEdit(false)}>Annuler</button><button style={primaryBtn()} onClick={() => { dutActions.updateTransporter(transporterId, { contact: f.contact, address: f.address, phone: f.phone, email: f.email }); setEdit(false); toast('Profil mis à jour'); }}>Enregistrer</button></>}>
          <Field label="Représentant"><Input value={f.contact} onChange={v => setF(x => ({ ...x, contact: v }))}/></Field>
          <Field label="Adresse"><Input value={f.address} onChange={v => setF(x => ({ ...x, address: v }))}/></Field>
          <FieldRow><Field label="Téléphone"><Input value={f.phone} onChange={v => setF(x => ({ ...x, phone: v }))}/></Field><Field label="Email"><Input value={f.email} onChange={v => setF(x => ({ ...x, email: v }))}/></Field></FieldRow>
        </DutModal>
      )}
    </div>
  );
};

const TransporterSupport = () => {
  const toast = useToast();
  const [open, setOpen] = React.useState(null);
  const [ticket, setTicket] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const faq = [
    ['Combien coûte un DUT ?', `Le DUT a un prix fixe de ${fmtEur(TARIFF.priceEur)} (${fmtGNF(TARIFF.priceGnf)}), quel que soit le trajet.`],
    ['Qui émet le DUT ?', 'Les agents de la DNTT. Vous recevez un SMS et le DUT apparaît dans votre espace pour paiement.'],
    ['L’agent peut-il payer à ma place ?', 'Oui. Enregistrez votre compte mobile money dans votre profil et autorisez le prélèvement : l’agent pourra régler vos DUT depuis la plateforme.'],
    ['Comment suivre mon camion ?', 'Après paiement, générez un code de jumelage dans « Suivi des véhicules » et transmettez-le au conducteur, ou faites-lui scanner le QR code du DUT.'],
  ];
  return (
    <div>
      <PageHead kicker={DNTT_HQ.name} title="Assistance"><button style={primaryBtn()} onClick={() => setTicket(true)}><Icon name="chat" size={14}/> Ouvrir un ticket</button></PageHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 22 }}>
        <ContactTile icon="phone" label="Numéro vert" value={DNTT_HQ.greenLine} detail="Gratuit, tous opérateurs" href={`tel:${DNTT_HQ.greenLine}`}/>
        <ContactTile icon="phone" label="Standard DNTT" value={DNTT_HQ.phone} detail={DNTT_HQ.hours} href={`tel:${DNTT_HQ.phone.replace(/ /g, '')}`}/>
        <ContactTile icon="email" label="Email" value={DNTT_HQ.email} detail="Réponse sous 24 h ouvrées" href={`mailto:${DNTT_HQ.email}`}/>
        <ContactTile icon="office" label="Siège de la DNTT" value="Almamya, Kaloum" detail={DNTT_HQ.address} onClick={() => toast(DNTT_HQ.address, 'info')}/>
      </div>
      <section style={paperCard(true)}>
        <header style={cardHeader()}><h2 style={cardTitle()}>Questions fréquentes</h2></header>
        {faq.map(([q, a], i) => (
          <div key={q} style={{ borderTop: i ? '1px solid #F0E9D6' : 'none' }}>
            <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} style={{ display: 'flex', width: '100%', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, textAlign: 'left', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{q}</span><Icon name={open === i ? 'chevDown' : 'chev'} size={14}/>
            </button>
            {open === i && <div style={{ fontSize: 12.5, color: '#3A352D', paddingBottom: 12, lineHeight: 1.55 }}>{a}</div>}
          </div>
        ))}
      </section>
      {ticket && (
        <DutModal title="Ouvrir un ticket" onClose={() => setTicket(false)} footer={<><button style={ghostBtn()} onClick={() => setTicket(false)}>Annuler</button><button style={primaryBtn()} disabled={msg.length < 5} onClick={() => { setTicket(false); setMsg(''); toast(`Ticket TCK-${Math.floor(1000 + Math.random() * 8999)} créé, la DNTT vous répond sous 24 h`); }}>Envoyer</button></>}>
          <Field label="Sujet"><Select value="Paiement" onChange={() => {}} options={['Paiement', 'DUT émis', 'Suivi du véhicule', 'Autre']}/></Field>
          <Field label="Message"><textarea value={msg} onChange={e => setMsg(e.target.value)} style={{ width: '100%', minHeight: 100, padding: 10, border: '1px solid #DCD3BD', fontFamily: 'inherit', fontSize: 13, boxSizing: 'border-box' }}/></Field>
        </DutModal>
      )}
    </div>
  );
};

const TransporterSettings = ({ transporterId }) => (
  <div>
    <PageHead kicker="Préférences" title="Paramètres"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
      <PayAccountCard transporterId={transporterId}/>
      <SettingsCard title="Notifications">
        <SettingRow label="SMS à chaque nouveau DUT" value="Recommandé" toggle defaultChecked/>
        <SettingRow label="SMS à chaque paiement" toggle defaultChecked/>
        <SettingRow label="Rappel avant échéance" value="24 h avant" toggle defaultChecked/>
        <SettingRow label="Alertes de suivi (départ, arrivée, contrôle)" toggle defaultChecked/>
      </SettingsCard>
      <SettingsCard title="Sécurité">
        <SettingRow label="Authentification à deux facteurs" value="SMS" toggle defaultChecked/>
        <SettingRow label="Code de validation des paiements" value="4 chiffres" toggle defaultChecked/>
      </SettingsCard>
    </div>
  </div>
);

Object.assign(window, {
  PageHead, SettingsCard, SettingRow, ToggleSwitch, ContactTile, PasswordModal,
  OfficerTransporters, OfficerTransporterDetail, OfficerVehicles, OfficerControls, OfficerTariffs, OfficerProfile, OfficerSettings,
  TransporterFleet, TransporterTracking, TransporterProfile, TransporterSupport, TransporterSettings,
});

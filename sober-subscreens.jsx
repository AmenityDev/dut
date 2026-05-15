// Sub-screens shared across Officer and Transporter platforms:
// transporters list, vehicles, tariffs, fleet, profile, support, settings.

// ─── Officer: Transporteurs (référentiel) ──────────────────────────
const OfficerTransporters = ({ lang }) => (
  <div>
    <PageHead kicker="Référentiel · transporteurs agréés" title="Transporteurs">
      <button style={ghostBtn()}><Icon name="download" size={13}/> Exporter</button>
      <button style={primaryBtn()}><Icon name="plus" size={14}/> Nouveau transporteur</button>
    </PageHead>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
      {TRANSPORTERS.map(tr => {
        const isInd = tr.kind === 'individual';
        const initials = isInd
          ? tr.contact.split(' ').map(s=>s[0]).slice(0,2).join('')
          : tr.short.split(' ').map(s=>s[0]).slice(0,2).join('');
        return (
        <div key={tr.id} style={{ ...paperCard(), padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: isInd ? '#FBF8F2' : '#161413',
              color: isInd ? '#161413' : '#FCD116',
              border: isInd ? '1px solid #E5DDC9' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontFamily: '"Crimson Pro", serif',
              borderRadius: isInd ? '50%' : 0,
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.short}</div>
              <div style={{ fontSize: 10.5, color: '#9A9281', fontFamily: '"JetBrains Mono", monospace' }}>{tr.id}</div>
            </div>
            <span style={{
              background: isInd ? '#FFF6E0' : '#E8F2EA',
              color: isInd ? '#7A5A00' : '#1F4F2C',
              padding: '2px 7px', fontSize: 10, fontWeight: 600,
              letterSpacing: '.08em', textTransform: 'uppercase',
            }}>{isInd ? 'P. physique' : 'Agréé'}</span>
          </div>
          <div style={{ fontSize: 11.5, color: '#6B6557', lineHeight: 1.7 }}>
            {!isInd && <div>{tr.contact}</div>}
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>{tr.rccm}</div>
            <div>{tr.city} · {tr.fleet} {isInd ? (tr.fleet > 1 ? 'véhicules' : 'véhicule') : 'véhicules'}</div>
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E5DDC9', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#9A9281' }}>{BILLS.filter(b => b.transporterId === tr.id).length} DUT émis</span>
            <button style={{ ...ghostBtn(), padding: '4px 10px', fontSize: 11 }}>Voir →</button>
          </div>
        </div>
        );
      })}
    </div>
  </div>
);

// ─── Officer: Véhicules ────────────────────────────────────────────
const OfficerVehicles = ({ lang }) => (
  <div>
    <PageHead kicker="Référentiel · véhicules immatriculés" title="Véhicules"/>
    <section style={paperCard()}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr style={{ color: '#9A9281', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' }}>
          {['Plaque','Type','Marque','Année','Capacité','Conducteur'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 6px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {VEHICLES.map((v, i) => (
            <tr key={v.plate} style={{ background: i % 2 ? '#FBF8F2' : 'transparent' }}>
              <td style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{v.plate}</td>
              <td style={td()}>{v.type}</td>
              <td style={td()}>{v.brand}</td>
              <td style={td()}>{v.year}</td>
              <td style={td()}>{v.capacity}</td>
              <td style={td()}>{v.driver}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  </div>
);

// ─── Officer: Grille tarifaire ─────────────────────────────────────
const OfficerTariffs = ({ lang }) => (
  <div>
    <PageHead kicker="Arrêté 2025/MTI/DNTT du 14 janvier 2026" title="Grille tarifaire en vigueur"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 22 }}>
      <KpiTile label="Redevance kilométrique" big="1 200" suffix="GNF / km" hint="Toutes catégories" tone="good"/>
      <KpiTile label="Forfait quantité" big="800" suffix="GNF / unité" hint="Pondéré par tonnage"/>
      <KpiTile label="Timbre fiscal" big="25 000" suffix="GNF" hint="Reversé au Trésor"/>
      <KpiTile label="Quote-part DNTT" big="8 000" suffix="GNF" hint="Fonctionnement DNTT"/>
    </div>
    <section style={paperCard()}>
      <header style={cardHeader()}><h2 style={cardTitle()}>Majorations & exemptions</h2></header>
      <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
        <tbody>
          {[
            ['Hydrocarbures (essence, gasoil, GPL)', '+15%', 'Majoration risque'],
            ['Marchandises classées dangereuses', '+15%', 'CMR Article 7'],
            ['Convois exceptionnels (>40 t)', '+25%', 'Étude voirie requise'],
            ['Aide humanitaire homologuée', 'Exonération totale', 'Sur visa MAE'],
            ['Produits du cru — circuits courts', '−50%', 'Décret 2024/PR/452'],
          ].map(([k, v, note], i) => (
            <tr key={k} style={{ background: i % 2 ? '#FBF8F2' : 'transparent' }}>
              <td style={td()}>{k}</td>
              <td style={{ ...td(), fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: v.startsWith('−') || v.includes('Exo') ? '#1F4F2C' : '#8A1B1B' }}>{v}</td>
              <td style={{ ...td(), color: '#9A9281', fontSize: 11.5 }}>{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  </div>
);

// ─── Officer: Profil ───────────────────────────────────────────────
const OfficerProfile = ({ lang }) => (
  <div>
    <PageHead kicker={`Agent DNTT · ${OFFICER.badge}`} title="Mon profil"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 320px) 1fr', gap: 22 }} className="dut-profile-grid">
      <section style={paperCard(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Crimson Pro", serif', fontSize: 42, fontWeight: 600 }}>FC</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 22, fontWeight: 600 }}>{OFFICER.name}</div>
          <div style={{ fontSize: 12, color: '#6B6557', textAlign: 'center' }}>{OFFICER.role}</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, padding: '3px 8px', background: '#161413', color: '#FCD116', marginTop: 4 }}>{OFFICER.badge}</div>
        </div>
      </section>
      <section style={paperCard(true)}>
        <header style={cardHeader()}><h2 style={cardTitle()}>Coordonnées professionnelles</h2></header>
        <SummaryRow label="Bureau" value={OFFICER.office}/>
        <SummaryRow label="Email" value={OFFICER.email}/>
        <SummaryRow label="Téléphone" value="+224 622 04 71 88"/>
        <SummaryRow label="Habilitations" value="Émission DUT · Contrôle routier · Verbalisation"/>
        <SummaryRow label="Dernière connexion" value="30/04/2026 · 09:38 GMT — Conakry"/>
        <SummaryRow label="Sessions actives" value="2 (poste bureau · mobile)"/>
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #E5DDC9', display: 'flex', gap: 8 }}>
          <button style={ghostBtn()}>Modifier mes informations</button>
          <button style={ghostBtn()}>Changer le mot de passe</button>
        </div>
      </section>
    </div>
  </div>
);

// ─── Officer: Paramètres ───────────────────────────────────────────
const OfficerSettings = ({ lang }) => (
  <div>
    <PageHead kicker="Préférences de l'application" title="Paramètres"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
      <SettingsCard title="Sécurité">
        <SettingRow label="Authentification à deux facteurs" value="Activée · SMS au +224 622 04 71 88" toggle/>
        <SettingRow label="Verrouillage automatique" value="Après 5 minutes d'inactivité"/>
        <SettingRow label="Journal d'audit" value="237 actions ce mois"/>
      </SettingsCard>
      <SettingsCard title="Notifications">
        <SettingRow label="DUT émis par mes collègues" value="Email seulement" toggle/>
        <SettingRow label="Paiements reçus" value="Push + email" toggle defaultChecked/>
        <SettingRow label="Échéances dépassées" value="Récap quotidien à 08:00" toggle defaultChecked/>
      </SettingsCard>
      <SettingsCard title="Préférences">
        <SettingRow label="Langue" value="Français (Guinée)"/>
        <SettingRow label="Format des dates" value="JJ/MM/AAAA"/>
        <SettingRow label="Devise par défaut" value="GNF — Franc guinéen"/>
        <SettingRow label="Fuseau horaire" value="GMT (Conakry)"/>
      </SettingsCard>
      <SettingsCard title="Intégrations">
        <SettingRow label="SAFI · Trésor public" value="Connecté" tone="good"/>
        <SettingRow label="RCCM-CCI" value="Connecté" tone="good"/>
        <SettingRow label="KKiaPay" value="Connecté" tone="good"/>
        <SettingRow label="Annuaire DGI (NIF)" value="Connecté" tone="good"/>
      </SettingsCard>
    </div>
  </div>
);

// ─── Transporter: Historique des DUT ───────────────────────────────
const TransporterHistory = ({ lang, onOpen }) => {
  const [filter, setFilter] = React.useState('all');
  const allRows = [...RECENT_DUTS, ...RECENT_DUTS.map(r => ({ ...r, id: r.id.replace('821','712'), date: '12/04/2026' }))];
  const filtered = filter === 'all' ? allRows : allRows.filter(r => r.status === filter);
  return (
    <div>
      <PageHead kicker={`${allRows.length} DUT émis depuis ${CARRIER.since}`} title={t('history', lang)}>
        <button style={ghostBtn()}><Icon name="download" size={13}/> Exporter CSV</button>
        <button style={ghostBtn()}><Icon name="search" size={13}/> Filtres avancés</button>
      </PageHead>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['all','Tous'],['paid',t('statusPaid', lang)],['pending',t('statusPending', lang)],['expired',t('statusExpired', lang)]].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: '6px 12px', border: '1px solid', borderColor: filter===k?'#161413':'#DCD3BD',
            background: filter===k?'#161413':'#fff', color: filter===k?'#FCD116':'#161413',
            fontSize: 12, fontWeight: filter===k?600:500, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2,
          }}>{l}</button>
        ))}
      </div>
      <section style={{ ...paperCard(), padding: 0 }}>
        <table className="sober-stack" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead><tr style={{ color: '#9A9281', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', background: '#FBF8F2' }}>
            {[t('docNumber', lang), t('issuedOn', lang), t('route', lang), t('cargo', lang), t('vehicle', lang), t('total', lang), 'Statut'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 12px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={d.id+'-'+i} onClick={onOpen} style={{ cursor: 'pointer', background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                <td data-label={t('docNumber', lang)} style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5 }}>{d.id}</td>
                <td data-label={t('issuedOn', lang)} style={td()}>{d.date}</td>
                <td data-label={t('route', lang)} style={td()}>{d.from} → {d.to}</td>
                <td data-label={t('cargo', lang)} style={td()}>{d.goods}</td>
                <td data-label={t('vehicle', lang)} style={{ ...td(), fontFamily: '"JetBrains Mono", monospace' }}>{d.vehicle}</td>
                <td data-label={t('total', lang)} style={{ ...td(), textAlign: 'right' }}>{fmtGNF(d.amount)}</td>
                <td data-label="Statut" style={td()}><StatusPill status={d.status} lang={lang}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

// ─── Transporter: Paiements ────────────────────────────────────────
const TransporterPayments = ({ lang, onPay, onPayImport, onViewDut, onViewImport }) => {
  const isFr = lang !== 'en';
  // Mock: bills issued to this carrier (Diallo & Frères = TRP-04812) that are unpaid.
  const pending = [
    { id: 'DUT-2026-04-08820', from: 'Boffa',   to: 'Conakry', goods: 'Ciment',         amount: 198500, due: '02/05/2026', issued: '28/04/2026', officer: 'F. Camara' },
    { id: 'DUT-2026-04-08812', from: 'Kindia',  to: 'Conakry', goods: 'Hydrocarbures',  amount: 524800, due: '03/05/2026', issued: '26/04/2026', officer: 'F. Camara' },
  ];
  const totalDue = pending.reduce((s, b) => s + b.amount, 0);

  // Vehicle import bills addressed to this company
  const myImports = (typeof IMPORT_BILLS !== 'undefined' ? IMPORT_BILLS : []).filter(b => b.importerKind === 'company' && b.importerId === 'TRP-04812');
  const pendingImports = myImports.filter(b => b.status === 'pending');
  const importDue = pendingImports.reduce((s, b) => s + b.total, 0);
  const grandTotal = totalDue + importDue;
  const [importModal, setImportModal] = React.useState(null);

  return (
    <div>
      <PageHead kicker={isFr ? 'Émis par DNTT · à régler en ligne' : 'Issued by DNTT · to be paid online'} title={isFr ? 'Mes DUT à régler' : 'Bills due'}>
        <button style={ghostBtn()}><Icon name="download" size={13}/> {isFr ? 'Relevé' : 'Statement'}</button>
      </PageHead>

      {/* Hero summary */}
      <div style={{ marginBottom: 22, padding: 18, background: '#161413', color: '#F7F3EB', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16, borderRadius: 2 }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#FCD116' }}>{isFr ? 'Total à régler' : 'Total due'}</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 36, fontWeight: 600, marginTop: 4 }}>{fmtGNF(grandTotal)}</div>
          <div style={{ fontSize: 12, color: '#B5AC97', marginTop: 4 }}>
            {pending.length} {isFr ? 'DUT' : 'DUT'}{pendingImports.length > 0 ? ` + ${pendingImports.length} ${isFr ? 'taxe d’importation véhicule' + (pendingImports.length > 1 ? 's' : '') : 'vehicle import tax' + (pendingImports.length > 1 ? 'es' : '')}` : ''} · {isFr ? 'prochain règlement avant le 02/05' : 'next due May 2'}
          </div>
        </div>
        <button onClick={onPay} style={{ background: '#FCD116', color: '#161413', border: 'none', padding: '12px 22px', fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', borderRadius: 2, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Icon name="coin" size={15}/> {isFr ? 'Tout régler maintenant' : 'Pay all now'}
        </button>
      </div>

      {/* Vehicle import bills */}
      {pendingImports.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="ship" size={13}/> {isFr ? 'Importations de véhicules' : 'Vehicle imports'} · {pendingImports.length} {isFr ? 'taxe' : 'tax'}{pendingImports.length > 1 ? 's' : ''} {isFr ? 'à régler' : 'due'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: pendingImports.length > 1 ? 'repeat(auto-fit, minmax(360px, 1fr))' : '1fr', gap: 12 }}>
            {pendingImports.map(b => (
              <ImportBillCard key={b.id} bill={b} lang={lang} onView={(x) => onViewImport ? onViewImport(x) : setImportModal(x)} onPay={(x) => onPayImport ? onPayImport(x) : setImportModal(x)}/>
            ))}
          </div>
        </section>
      )}

      {/* Pending DUT cards */}
      <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 10 }}>
        {isFr ? 'Documents Uniques de Transport' : 'Transport documents'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 14, marginBottom: 28 }}>
        {pending.map(b => (
          <article key={b.id} style={{ ...paperCard(), padding: 16, borderLeft: '3px solid #FCD116' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 700 }}>{b.id}</div>
                <div style={{ fontSize: 11, color: '#9A9281' }}>{isFr ? 'Émis le' : 'Issued'} {b.issued} · {b.officer}</div>
              </div>
              <StatusPill status="pending" lang={lang}/>
            </div>
            <div style={{ fontSize: 13, marginBottom: 4 }}>{b.from} → {b.to}</div>
            <div style={{ fontSize: 12, color: '#6B6557', marginBottom: 10 }}>{b.goods}</div>
            <div style={{ paddingTop: 10, borderTop: '1px solid #E5DDC9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10.5, color: '#9A9281', letterSpacing: '.12em', textTransform: 'uppercase' }}>{isFr ? 'À régler avant' : 'Due'}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{b.due}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18, fontWeight: 600 }}>{fmtGNF(b.amount)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => onViewDut?.(b)} style={{ ...ghostBtn(), flex: 1, justifyContent: 'center' }}>
                <Icon name="doc" size={13}/> {isFr ? 'Voir le DUT' : 'View bill'}
              </button>
              <button onClick={onPay} style={{
                flex: 1, background: '#161413', color: '#FCD116', border: 'none',
                padding: '9px 14px', fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5,
                cursor: 'pointer', borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Icon name="coin" size={13}/> {isFr ? 'Régler le DUT' : 'Pay bill'}
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* KPI strip */}
      <div className="sober-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        <KpiTile label={isFr ? 'Réglés ce mois' : 'Paid this month'} big="8,42M" suffix="GNF" hint={`14 ${isFr ? 'transactions' : 'transactions'}`} tone="good"/>
        <KpiTile label={isFr ? 'En attente' : 'Pending'} big={`${Math.round(totalDue/1000)}`} suffix="K GNF" hint={`${pending.length} DUT`} tone="warn"/>
        <KpiTile label={isFr ? 'Méthode favorite' : 'Top method'} big="OM" hint={isFr ? '64% des paiements' : '64% of payments'}/>
      </div>

      <section style={paperCard()}>
        <header style={cardHeader()}><h2 style={cardTitle()}>{isFr ? 'Transactions récentes' : 'Recent transactions'}</h2><button style={ghostBtn()}><Icon name="download" size={13}/> {isFr ? 'Relevé PDF' : 'PDF statement'}</button></header>
        <table className="sober-stack" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead><tr style={{ color: '#9A9281', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase' }}>
            {[isFr?'Référence':'Reference', 'Date', 'DUT', isFr?'Méthode':'Method', isFr?'Montant':'Amount', isFr?'Statut':'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 6px', borderBottom: '1px solid #E5DDC9', fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {[
              { ref: 'KKP-2026-A4F71B', date: '28/04', dut: 'DUT-2026-04-08821', method: 'Orange Money', amount: 338000, ok: true },
              { ref: 'KKP-2026-9B22E0', date: '25/04', dut: 'DUT-2026-04-08714', method: 'MTN MoMo',     amount: 412500, ok: true },
              { ref: 'KKP-2026-7CD104', date: '22/04', dut: 'DUT-2026-04-08698', method: 'Carte BICIGUI', amount: 372000, ok: false },
              { ref: 'KKP-2026-4F8A2E', date: '18/04', dut: 'DUT-2026-04-08512', method: 'Virement Ecobank', amount: 1240000, ok: true },
              { ref: 'KKP-2026-3119BA', date: '14/04', dut: 'DUT-2026-04-08344', method: 'Orange Money', amount: 296500, ok: true },
            ].map((p, i) => (
              <tr key={p.ref} style={{ background: i % 2 ? '#FBF8F2' : 'transparent' }}>
                <td data-label={isFr?'Référence':'Reference'} style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>{p.ref}</td>
                <td data-label="Date" style={td()}>{p.date}/2026</td>
                <td data-label="DUT" style={{ ...td(), fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>{p.dut}</td>
                <td data-label={isFr?'Méthode':'Method'} style={td()}>{p.method}</td>
                <td data-label={isFr?'Montant':'Amount'} style={{ ...td(), textAlign: 'right' }}>{fmtGNF(p.amount)}</td>
                <td data-label={isFr?'Statut':'Status'} style={td()}><StatusPill status={p.ok ? 'paid' : 'expired'} lang={lang}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {importModal && <ImportBillModal bill={importModal} lang={lang} onClose={() => setImportModal(null)} onPay={(b) => { setImportModal(null); onPayImport?.(b); }}/>}
    </div>
  );
};

// ─── Transporter: Ma flotte ────────────────────────────────────────
const TransporterFleet = ({ lang }) => (
  <div>
    <PageHead kicker={`${CARRIER.short} · ${VEHICLES.length} véhicules`} title="Ma flotte">
      <button style={ghostBtn()}><Icon name="download" size={13}/> Exporter</button>
      <button style={primaryBtn()}><Icon name="plus" size={14}/> Ajouter un véhicule</button>
    </PageHead>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
      {VEHICLES.map(v => (
        <div key={v.plate} style={{ ...paperCard(), padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, background: '#FBF8F2', border: '1px solid #E5DDC9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="truck" size={18} style={{ color: '#161413' }}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 14 }}>{v.plate}</div>
              <div style={{ fontSize: 10.5, color: '#9A9281', textTransform: 'uppercase', letterSpacing: '.1em' }}>{v.type}</div>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: '#6B6557', lineHeight: 1.7 }}>
            <SummaryRow label="Marque" value={`${v.brand} (${v.year})`}/>
            <SummaryRow label="Capacité" value={v.capacity}/>
            <SummaryRow label="Conducteur" value={v.driver}/>
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E5DDC9', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#1F4F2C', fontWeight: 600 }}>✓ Visite technique à jour</span>
            <button style={{ ...ghostBtn(), padding: '4px 10px', fontSize: 11 }}>Détail →</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Transporter: Profil ───────────────────────────────────────────
const TransporterProfile = ({ lang }) => (
  <div>
    <PageHead kicker={`Compte transporteur · ${CARRIER.id || CARRIER.rccm}`} title="Profil de ma société"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 320px) 1fr', gap: 22 }} className="dut-profile-grid">
      <section style={paperCard(true)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 96, height: 96, background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Crimson Pro", serif', fontSize: 36, fontWeight: 600 }}>D&F</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18, fontWeight: 600, textAlign: 'center' }}>{CARRIER.name}</div>
          <div style={{ fontSize: 11.5, color: '#6B6557' }}>Depuis {CARRIER.since}</div>
          <span style={{ background: '#E8F2EA', color: '#1F4F2C', padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>✓ Compte vérifié</span>
        </div>
      </section>
      <section style={paperCard(true)}>
        <header style={cardHeader()}><h2 style={cardTitle()}>Identité juridique</h2></header>
        <SummaryRow label="RCCM" value={CARRIER.rccm} mono/>
        <SummaryRow label="NIF" value={CARRIER.nif} mono/>
        <SummaryRow label="Dirigeant" value={CARRIER.director}/>
        <SummaryRow label="Adresse" value={CARRIER.address}/>
        <SummaryRow label="Téléphone" value={CARRIER.phone}/>
        <SummaryRow label="Email" value={CARRIER.email}/>
        <SummaryRow label="Flotte" value={`${CARRIER.fleet} véhicules`}/>
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #E5DDC9', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={ghostBtn()}>Modifier les informations</button>
          <button style={ghostBtn()}>Demander un duplicata RCCM</button>
        </div>
      </section>
    </div>
  </div>
);

// ─── Transporter: Support ──────────────────────────────────────────
const TransporterSupport = ({ lang }) => (
  <div>
    <PageHead kicker="Aide & assistance" title="Support transporteur"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 22 }}>
      <ContactTile icon="phone" label="USSD gratuit" value="*144#" detail="Tous opérateurs · 24/7 · français + langues nationales"/>
      <ContactTile icon="phone" label="Hotline" value="+224 657 144 144" detail="Lun–Ven 08:00–18:00 GMT"/>
      <ContactTile icon="chat"  label="WhatsApp"  value="+224 622 14 88 03" detail="Réponse sous 30 min en heures ouvrables"/>
      <ContactTile icon="search"  label="Email"     value="support@dut.gov.gn" detail="Réponse sous 24 h"/>
    </div>
    <section style={paperCard()}>
      <header style={cardHeader()}><h2 style={cardTitle()}>Questions fréquentes</h2></header>
      {[
        ['Comment puis-je payer un DUT par USSD ?', 'Composez *144# depuis le numéro associé à votre compte, choisissez "Payer une facture DUT" puis saisissez la référence DUT-AAAA-MM-XXXXX. Validez avec votre code Mobile Money.'],
        ['Que faire si le contrôle routier ne reconnaît pas mon DUT ?', 'Présentez le QR code imprimé ou affichez-le depuis l\'application. Le QR est vérifiable hors ligne sur les terminaux des agents de contrôle.'],
        ['Combien de temps un DUT est-il valide ?', 'Un DUT est valide pour le seul trajet déclaré, entre les dates de départ et d\'arrivée saisies. Au-delà, un nouveau DUT est requis.'],
        ['Puis-je contester une liquidation ?', 'Oui, dans un délai de 48 h après émission, via le bouton "Contester" sur la facture. La réclamation est instruite par la DGTT sous 5 jours ouvrés.'],
      ].map(([q, a], i) => (
        <details key={i} style={{ borderTop: i ? '1px solid #E5DDC9' : 'none', padding: '12px 0' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>{q}</summary>
          <div style={{ marginTop: 8, color: '#6B6557', fontSize: 12.5, lineHeight: 1.55 }}>{a}</div>
        </details>
      ))}
    </section>
  </div>
);

// ─── Transporter: Paramètres ───────────────────────────────────────
const TransporterSettings = ({ lang }) => (
  <div>
    <PageHead kicker="Préférences du compte" title="Paramètres"/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
      <SettingsCard title="Sécurité">
        <SettingRow label="Authentification à deux facteurs" value={`Activée · SMS au ${CARRIER.phone}`} toggle defaultChecked/>
        <SettingRow label="PIN de validation paiement" value="4 chiffres · changé il y a 14 j"/>
        <SettingRow label="Sessions actives" value="3 appareils"/>
      </SettingsCard>
      <SettingsCard title="Notifications">
        <SettingRow label="Nouvelle facture DUT émise" value="SMS + email" toggle defaultChecked/>
        <SettingRow label="Rappel d'échéance" value="J−2 · J−1 · jour J" toggle defaultChecked/>
        <SettingRow label="Confirmation de paiement" value="SMS uniquement" toggle defaultChecked/>
      </SettingsCard>
      <SettingsCard title="Moyens de paiement enregistrés">
        <SettingRow label="Orange Money" value={CARRIER.phone} tone="good"/>
        <SettingRow label="MTN MoMo" value="+224 628 41 02 17" tone="good"/>
        <SettingRow label="Carte Visa" value="•••• 7821 · BICIGUI"/>
        <button style={{ ...ghostBtn(), marginTop: 8 }}><Icon name="plus" size={12}/> Ajouter un moyen</button>
      </SettingsCard>
      <SettingsCard title="Préférences">
        <SettingRow label="Langue" value="Français"/>
        <SettingRow label="Reçus PDF par défaut" value="Téléchargement automatique" toggle defaultChecked/>
        <SettingRow label="Format des dates" value="JJ/MM/AAAA"/>
      </SettingsCard>
    </div>
  </div>
);

// ─── Small helpers used by the screens above ───────────────────────
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
  <section style={paperCard(true)}>
    <header style={cardHeader()}><h2 style={cardTitle()}>{title}</h2></header>
    {children}
  </section>
);

const SettingRow = ({ label, value, tone, toggle, defaultChecked }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #F0E9D6', gap: 14 }}>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: tone === 'good' ? '#1F4F2C' : '#6B6557', marginTop: 2 }}>{value}</div>
    </div>
    {toggle ? <ToggleSwitch defaultChecked={defaultChecked}/> : <Icon name="chev" size={14} style={{ color: '#9A9281', flexShrink: 0 }}/>}
  </div>
);

const ToggleSwitch = ({ defaultChecked }) => {
  const [on, setOn] = React.useState(!!defaultChecked);
  return (
    <button onClick={() => setOn(!on)} style={{
      width: 38, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', padding: 0,
      background: on ? '#161413' : '#DCD3BD', position: 'relative', flexShrink: 0,
    }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: on ? '#FCD116' : '#fff', transition: 'left .15s' }}/>
    </button>
  );
};

const ContactTile = ({ icon, label, value, detail }) => (
  <div style={{ ...paperCard(), padding: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 32, height: 32, background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={16}/></div>
      <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9A9281' }}>{label}</div>
    </div>
    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 17, fontWeight: 700 }}>{value}</div>
    <div style={{ fontSize: 11.5, color: '#6B6557', marginTop: 4 }}>{detail}</div>
  </div>
);

Object.assign(window, {
  OfficerTransporters, OfficerVehicles, OfficerTariffs, OfficerProfile, OfficerSettings,
  TransporterHistory, TransporterPayments, TransporterFleet, TransporterProfile, TransporterSupport, TransporterSettings,
  PageHead, SettingsCard, SettingRow, ToggleSwitch, ContactTile,
});

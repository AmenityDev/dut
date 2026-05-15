// SOBER · Officer-side Imports screens
// 3 screens: list, new (form), detail (tax invoice).

const fmtNum = (n) => new Intl.NumberFormat('fr-FR').format(n);

// ─────────────────────────────────────────────────────────────
// 1. Imports queue / list
// ─────────────────────────────────────────────────────────────
const OfficerImports = ({ lang, onOpen, onNew }) => {
  const [filter, setFilter] = React.useState('all'); // all | pending | paid
  const list = IMPORT_BILLS.filter(b => filter === 'all' ? true : b.status === filter);

  const totalDue = IMPORT_BILLS.filter(b => b.status === 'pending').reduce((s,b)=>s+b.total,0);
  const monthCount = IMPORT_BILLS.length;
  const monthRevenue = IMPORT_BILLS.filter(b => b.status === 'paid').reduce((s,b)=>s+b.total,0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 26, margin: 0, fontWeight: 500 }}>Importations de véhicules</h2>
          <p style={{ color: '#6B6557', fontSize: 13, margin: '2px 0 0' }}>Déclaration et taxation des véhicules importés · DNTT</p>
        </div>
        <button style={primaryBtn()} onClick={onNew}>
          <Icon name="plus" size={16}/> Nouvelle déclaration
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        <KpiTile label="Déclarations · ce mois" big={monthCount} hint="3 en attente · 2 payées"/>
        <KpiTile label="Recouvrement attendu" big={fmtNum(totalDue)} suffix="GNF" tone="warn"/>
        <KpiTile label="Recettes encaissées" big={fmtNum(monthRevenue)} suffix="GNF" tone="ok"/>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['all', 'pending', 'paid'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 12px', fontSize: 11.5, letterSpacing: '.04em',
            border: filter === f ? '1px solid #161413' : '1px solid #DCD3BD',
            background: filter === f ? '#161413' : 'transparent',
            color: filter === f ? '#FCD116' : '#161413',
            cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit',
          }}>
            {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : 'Réglées'}
          </button>
        ))}
      </div>

      <div style={paperCard()}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#9A9281', fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 8px', borderBottom: '1px solid #E5DDC9' }}>N°</th>
              <th style={{ padding: '8px 8px', borderBottom: '1px solid #E5DDC9' }}>Date</th>
              <th style={{ padding: '8px 8px', borderBottom: '1px solid #E5DDC9' }}>Importateur</th>
              <th style={{ padding: '8px 8px', borderBottom: '1px solid #E5DDC9' }}>Véhicule</th>
              <th style={{ padding: '8px 8px', borderBottom: '1px solid #E5DDC9', textAlign: 'right' }}>CIF</th>
              <th style={{ padding: '8px 8px', borderBottom: '1px solid #E5DDC9', textAlign: 'right' }}>Taxe due</th>
              <th style={{ padding: '8px 8px', borderBottom: '1px solid #E5DDC9' }}>État</th>
            </tr>
          </thead>
          <tbody>
            {list.map(b => (
              <tr key={b.id} onClick={() => onOpen(b)} style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FBF8F2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={td()}><span style={{ fontFamily: 'ui-monospace, monospace' }}>{b.id}</span></td>
                <td style={td()}>{b.date}</td>
                <td style={td()}>
                  <div>{b.importerName}</div>
                  <div style={{ fontSize: 10.5, color: '#9A9281', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                    {b.importerKind === 'company' ? 'Personne morale' : 'Personne physique'}
                  </div>
                </td>
                <td style={td()}>
                  <div>{b.vehicle.make} {b.vehicle.model}</div>
                  <div style={{ fontSize: 10.5, color: '#9A9281' }}>{b.vehicle.year} · {b.vehicle.fuel} · {b.vehicle.powerKw} kW</div>
                </td>
                <td style={{ ...td(), textAlign: 'right', fontFamily: 'ui-monospace, monospace' }}>{fmtNum(b.cif)}</td>
                <td style={{ ...td(), textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{fmtNum(b.total)}</td>
                <td style={td()}><StatusPill status={b.status} lang={lang}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 2. New import declaration form
// ─────────────────────────────────────────────────────────────
const OfficerImportNew = ({ lang, onCancel, onIssue }) => {
  const [step, setStep] = React.useState(0); // 0 importer · 1 vehicle · 2 valuation · 3 review

  const [importerKind, setImporterKind] = React.useState('individual');
  const [importerId, setImporterId] = React.useState('');
  const [importerName, setImporterName] = React.useState('');
  const [importerDoc, setImporterDoc] = React.useState('');

  const [vin, setVin] = React.useState('');
  const [lookupMsg, setLookupMsg] = React.useState('');
  const [make, setMake] = React.useState('');
  const [model, setModel] = React.useState('');
  const [category, setCategory] = React.useState('sedan');
  const [year, setYear] = React.useState(2022);
  const [fuel, setFuel] = React.useState('petrol');
  const [displacement, setDisplacement] = React.useState(1600);
  const [powerKw, setPowerKw] = React.useState(85);
  const [weight, setWeight] = React.useState(1400);
  const [origin, setOrigin] = React.useState('France');
  const [use, setUse] = React.useState('private');

  const [cif, setCif] = React.useState(95000000);

  const importers = IMPORTERS.filter(i => i.kind === importerKind);
  const tax = computeImportTax({ category, cif, year, powerKw, fuel, use });

  // VIN lookup
  const doLookup = () => {
    const found = VEHICLE_CATALOG.find(v => v.vin.toUpperCase() === vin.trim().toUpperCase());
    if (found) {
      setMake(found.make); setModel(found.model); setCategory(found.category);
      setYear(found.year); setFuel(found.fuel); setDisplacement(found.displacement);
      setPowerKw(found.powerKw); setWeight(found.weight);
      setLookupMsg(`✓ Correspondance trouvée — ${found.make} ${found.model} (${found.year}) — données pré-remplies, vérifiez avant de valider.`);
    } else {
      setLookupMsg(`Aucune correspondance dans le registre douanier. Saisie manuelle requise.`);
    }
  };

  const stepTitles = ['Importateur', 'Véhicule', 'Valeur CIF', 'Validation'];

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <button onClick={onCancel} style={{ ...ghostBtn(), padding: '5px 10px', fontSize: 11 }}>
          ← Retour aux importations
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h2 style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 26, margin: 0, fontWeight: 500 }}>
          Nouvelle déclaration d'importation
        </h2>
        <span style={{ fontSize: 11, color: '#9A9281', letterSpacing: '.16em', textTransform: 'uppercase' }}>
          IMV-2026-05-{String(922 + IMPORT_BILLS.length).padStart(5,'0')}
        </span>
      </div>
      <p style={{ color: '#6B6557', fontSize: 13, margin: '0 0 18px' }}>
        Déclaration de mise à la consommation d'un véhicule importé · taxation au prorata du barème DNTT 2026.
      </p>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 22 }}>
        {stepTitles.map((s, i) => (
          <div key={i} onClick={() => i <= step && setStep(i)} style={{
            flex: 1, padding: '10px 12px', cursor: i <= step ? 'pointer' : 'default',
            background: i === step ? '#161413' : i < step ? '#FBF8F2' : '#fff',
            color: i === step ? '#FCD116' : '#161413',
            border: '1px solid #DCD3BD', borderRight: i === stepTitles.length - 1 ? '1px solid #DCD3BD' : 'none',
          }}>
            <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', opacity: 0.7 }}>Étape {i + 1}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 22 }}>
        {/* Form pane */}
        <div style={paperCard(true)}>
          {step === 0 && (
            <div>
              <div style={cardHeader()}>
                <h3 style={cardTitle()}>Identité de l'importateur</h3>
              </div>
              <Field label="Type d'importateur">
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'individual', label: 'Personne physique', sub: 'CNI · particulier' },
                    { id: 'company', label: 'Personne morale', sub: 'RCCM · entreprise' },
                  ].map(o => (
                    <button key={o.id} onClick={() => { setImporterKind(o.id); setImporterId(''); setImporterName(''); setImporterDoc(''); }} style={{
                      flex: 1, padding: '10px 12px', textAlign: 'left',
                      background: importerKind === o.id ? '#161413' : '#fff',
                      color: importerKind === o.id ? '#FCD116' : '#161413',
                      border: importerKind === o.id ? '1px solid #161413' : '1px solid #DCD3BD',
                      cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{o.label}</div>
                      <div style={{ fontSize: 10.5, opacity: 0.75, letterSpacing: '.06em', marginTop: 2 }}>{o.sub}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Importateur enregistré (optionnel)">
                <Select value={importerId} onChange={(v) => {
                  setImporterId(v);
                  const f = importers.find(i => i.id === v);
                  if (f) { setImporterName(f.name); setImporterDoc(f.doc); }
                }} options={[{ value: '', label: '— Saisie manuelle —' }, ...importers.map(i => ({ value: i.id, label: `${i.name} · ${i.doc}` }))]}/>
              </Field>

              <FieldRow>
                <Field label={importerKind === 'company' ? 'Raison sociale' : 'Nom complet'}>
                  <Input value={importerName} onChange={setImporterName} placeholder={importerKind === 'company' ? 'Diallo & Frères' : 'Mamadou Diallo'}/>
                </Field>
                <Field label={importerKind === 'company' ? 'RCCM / NIF' : 'CNI / NIF'}>
                  <Input value={importerDoc} onChange={setImporterDoc} placeholder={importerKind === 'company' ? 'RCCM/CKY/B/...' : 'CNI 1234567'}/>
                </Field>
              </FieldRow>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={cardHeader()}>
                <h3 style={cardTitle()}>Caractéristiques du véhicule</h3>
              </div>

              <Field label="Numéro de châssis (VIN)" hint="17 caractères · code constructeur ISO 3779">
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input value={vin} onChange={setVin} placeholder="JTEBR3FJ80K123456"/>
                  <button onClick={doLookup} style={{ ...ghostBtn(), whiteSpace: 'nowrap' }}>
                    <Icon name="search" size={14}/> Rechercher
                  </button>
                </div>
                {lookupMsg && (
                  <div style={{ fontSize: 11.5, marginTop: 6, padding: '6px 10px',
                                background: lookupMsg.startsWith('✓') ? '#E8F0E2' : '#FBF1D9',
                                border: '1px solid', borderColor: lookupMsg.startsWith('✓') ? '#A9C39A' : '#E0CB8A',
                                color: '#3D4A30' }}>
                    {lookupMsg}
                  </div>
                )}
              </Field>

              <FieldRow>
                <Field label="Marque"><Input value={make} onChange={setMake} placeholder="Toyota"/></Field>
                <Field label="Modèle"><Input value={model} onChange={setModel} placeholder="Hilux"/></Field>
              </FieldRow>

              <FieldRow>
                <Field label="Catégorie">
                  <Select value={category} onChange={setCategory}
                          options={VEHICLE_CATEGORIES.map(c => ({ value: c.id, label: `${c.fr} · code SH ${c.code}` }))}/>
                </Field>
                <Field label="Année 1ère mise en circulation">
                  <Input type="number" value={year} onChange={(v) => setYear(Number(v))} min={1990} max={2026}/>
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Carburant">
                  <Select value={fuel} onChange={setFuel} options={FUEL_TYPES.map(f => ({ value: f.id, label: f.fr }))}/>
                </Field>
                <Field label="Cylindrée (cm³)">
                  <Input type="number" value={displacement} onChange={(v) => setDisplacement(Number(v))}/>
                </Field>
                <Field label="Puissance (kW)">
                  <Input type="number" value={powerKw} onChange={(v) => setPowerKw(Number(v))}/>
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="Poids à vide (kg)">
                  <Input type="number" value={weight} onChange={(v) => setWeight(Number(v))}/>
                </Field>
                <Field label="Pays d'origine">
                  <Select value={origin} onChange={setOrigin} options={ORIGINS.map(o => ({ value: o, label: o }))}/>
                </Field>
                <Field label="Usage prévu">
                  <Select value={use} onChange={setUse} options={USE_TYPES.map(u => ({ value: u.id, label: u.fr }))}/>
                </Field>
              </FieldRow>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={cardHeader()}>
                <h3 style={cardTitle()}>Évaluation et droits</h3>
              </div>

              <Field label="Valeur CIF (Coût · Assurance · Fret)" hint="Valeur déclarée en douane, en GNF · base de calcul des droits ad valorem">
                <Input type="number" value={cif} onChange={(v) => setCif(Number(v))}/>
              </Field>

              <div style={{ marginTop: 8, padding: 14, background: '#FBF8F2', border: '1px solid #E5DDC9' }}>
                <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 10 }}>
                  Décomposition du calcul · barème DNTT 2026
                </div>

                <SummaryRow label={`Droit de douane · ${(tax.dutyRate*100).toFixed(0)}% × coef. âge ${tax.ageMult.toFixed(2)} × coef. carburant ${tax.fuelMult.toFixed(2)} × coef. usage ${tax.useMult.toFixed(2)}`} value={`${fmtNum(tax.customsDuty)} GNF`} mono/>
                <SummaryRow label={`Surtaxe puissance · ${powerKw} kW (au‑delà de 100 kW · 8 000 GNF/kW)`} value={`${fmtNum(tax.powerSurcharge)} GNF`} mono/>
                <SummaryRow label="Redevance statistique · 0,5 % CIF" value={`${fmtNum(tax.statFee)} GNF`} mono/>
                <SummaryRow label={`TVA · 18 % sur (CIF + droits + surtaxe) = ${fmtNum(tax.vatBase)}`} value={`${fmtNum(tax.vat)} GNF`} mono/>
                <SummaryRow label="Timbre douanier" value={`${fmtNum(tax.stamp)} GNF`} mono/>

                <div style={{ borderTop: '1px solid #161413', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
                  <span>Total à régler</span>
                  <span style={{ fontFamily: 'ui-monospace, monospace' }}>{fmtNum(tax.total)} GNF</span>
                </div>
                <div style={{ fontSize: 10.5, color: '#9A9281', marginTop: 6, fontStyle: 'italic' }}>
                  Soit {((tax.total / Math.max(1, tax.cif)) * 100).toFixed(1)} % de la valeur CIF · véhicule âgé de {tax.ageY} an{tax.ageY > 1 ? 's' : ''}.
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={cardHeader()}>
                <h3 style={cardTitle()}>Vérification avant émission</h3>
              </div>

              <ReviewBlock title="Importateur">
                <ReviewLine k="Type"  v={importerKind === 'company' ? 'Personne morale' : 'Personne physique'}/>
                <ReviewLine k={importerKind === 'company' ? 'Raison sociale' : 'Nom'} v={importerName || '—'}/>
                <ReviewLine k={importerKind === 'company' ? 'RCCM / NIF' : 'CNI / NIF'} v={importerDoc || '—'} mono/>
              </ReviewBlock>

              <ReviewBlock title="Véhicule">
                <ReviewLine k="VIN" v={vin || '—'} mono/>
                <ReviewLine k="Marque · modèle" v={`${make || '—'} ${model || ''}`}/>
                <ReviewLine k="Catégorie" v={VEHICLE_CATEGORIES.find(c => c.id === category)?.fr}/>
                <ReviewLine k="Année · carburant" v={`${year} · ${FUEL_TYPES.find(f => f.id === fuel)?.fr}`}/>
                <ReviewLine k="Cylindrée · puissance" v={`${fmtNum(displacement)} cm³ · ${powerKw} kW`}/>
                <ReviewLine k="Poids · origine" v={`${fmtNum(weight)} kg · ${origin}`}/>
                <ReviewLine k="Usage" v={USE_TYPES.find(u => u.id === use)?.fr}/>
              </ReviewBlock>

              <ReviewBlock title="Taxation">
                <ReviewLine k="Valeur CIF" v={`${fmtNum(cif)} GNF`} mono/>
                <ReviewLine k="Droit de douane" v={`${fmtNum(tax.customsDuty)} GNF`} mono/>
                <ReviewLine k="Surtaxe puissance" v={`${fmtNum(tax.powerSurcharge)} GNF`} mono/>
                <ReviewLine k="TVA" v={`${fmtNum(tax.vat)} GNF`} mono/>
                <ReviewLine k="Redevance + timbre" v={`${fmtNum(tax.statFee + tax.stamp)} GNF`} mono/>
                <div style={{ borderTop: '1px solid #161413', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Total à régler</span>
                  <span style={{ fontFamily: 'ui-monospace, monospace' }}>{fmtNum(tax.total)} GNF</span>
                </div>
              </ReviewBlock>
            </div>
          )}

          {/* Step nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTop: '1px solid #E5DDC9' }}>
            <button onClick={() => step === 0 ? onCancel() : setStep(step - 1)} style={ghostBtn()}>
              {step === 0 ? 'Annuler' : '← Précédent'}
            </button>
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} style={primaryBtn()}>Continuer →</button>
            ) : (
              <button onClick={() => onIssue({
                importerKind, importerId, importerName, importerDoc,
                vehicle: { vin, make, model, category, year, fuel, displacement, powerKw, weight, origin, use },
                cif, tax,
              })} style={primaryBtn()}>
                <Icon name="check" size={14}/> Émettre la déclaration
              </button>
            )}
          </div>
        </div>

        {/* Live summary pane */}
        <aside>
          <div style={paperCard()}>
            <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 10 }}>Aperçu en direct</div>
            <div style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 19, marginBottom: 4 }}>
              {make || 'Véhicule'} {model}
            </div>
            <div style={{ fontSize: 12, color: '#6B6557', marginBottom: 14 }}>
              {VEHICLE_CATEGORIES.find(c => c.id === category)?.fr} · {year} · {FUEL_TYPES.find(f => f.id === fuel)?.fr}
            </div>

            <SummaryRow label="CIF déclaré" value={`${fmtNum(cif)} GNF`} mono/>
            <SummaryRow label="Droit de douane" value={`${fmtNum(tax.customsDuty)} GNF`} mono/>
            <SummaryRow label="Surtaxe puissance" value={`${fmtNum(tax.powerSurcharge)} GNF`} mono/>
            <SummaryRow label="TVA 18 %" value={`${fmtNum(tax.vat)} GNF`} mono/>
            <SummaryRow label="Frais & timbres" value={`${fmtNum(tax.statFee + tax.stamp)} GNF`} mono/>

            <div style={{ borderTop: '1px solid #161413', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#161413' }}>Total taxe</span>
              <span style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 22, fontWeight: 600 }}>{fmtNum(tax.total)}</span>
            </div>
            <div style={{ textAlign: 'right', fontSize: 10.5, color: '#9A9281' }}>GNF</div>

            <div style={{ marginTop: 14, padding: 10, background: '#FBF8F2', border: '1px dashed #DCD3BD', fontSize: 11, color: '#6B6557', lineHeight: 1.5 }}>
              <strong style={{ color: '#161413' }}>Note DNTT.</strong> Le calcul est indicatif jusqu'à validation. Les coefficients d'âge et de carburant sont appliqués automatiquement selon le décret 2024‑217.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 3. Import detail / invoice
// ─────────────────────────────────────────────────────────────
const OfficerImportDetail = ({ lang, bill, onBack, hideBack }) => {
  const v = bill.vehicle;
  const tax = computeImportTax({ category: v.category, cif: bill.cif, year: v.year, powerKw: v.powerKw, fuel: v.fuel, use: v.use });

  return (
    <div>
      {!hideBack && (
        <div style={{ marginBottom: 18 }}>
          <button onClick={onBack} style={{ ...ghostBtn(), padding: '5px 10px', fontSize: 11 }}>
            ← Retour aux importations
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 22 }}>
        {/* Document */}
        <div style={{ background: '#fff', border: '1px solid #161413', padding: '36px 40px', minHeight: 600, position: 'relative' }}>
          <FlagBar height={4} style={{ position: 'absolute', top: 0, left: 0 }}/>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <SealEmblem size={42}/>
                <div>
                  <div style={{ fontSize: 9.5, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6B6557' }}>République de Guinée</div>
                  <div style={{ fontSize: 11.5, fontWeight: 600 }}>Travail · Justice · Solidarité</div>
                </div>
              </div>
              <div style={{ fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#9A9281', marginTop: 6 }}>
                Contribution Générale Commune · Direction des Importations
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9A9281' }}>Référence</div>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14 }}>{bill.id}</div>
              <div style={{ fontSize: 11, color: '#6B6557', marginTop: 2 }}>Émise le {bill.date}</div>
            </div>
          </div>

          <h1 style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontSize: 30, fontWeight: 500, margin: '12px 0 4px' }}>
            Avis d'imposition · Importation
          </h1>
          <div style={{ fontSize: 11.5, color: '#6B6557', marginBottom: 18, fontStyle: 'italic' }}>
            Mise à la consommation d'un véhicule importé — barème DNTT 2026 (décret 2024‑217)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            <PdfSection title="Importateur">
              <PdfRow k="Type" v={bill.importerKind === 'company' ? 'Personne morale' : 'Personne physique'}/>
              <PdfRow k={bill.importerKind === 'company' ? 'Raison sociale' : 'Nom complet'} v={bill.importerName}/>
              <PdfRow k={bill.importerKind === 'company' ? 'RCCM' : 'CNI'} v={bill.importerId}/>
            </PdfSection>
            <PdfSection title="Véhicule importé">
              <PdfRow k="Marque · modèle" v={`${v.make} ${v.model}`}/>
              <PdfRow k="VIN" v={v.vin}/>
              <PdfRow k="Catégorie · année" v={`${VEHICLE_CATEGORIES.find(c => c.id === v.category)?.fr} · ${v.year}`}/>
              <PdfRow k="Carburant · puissance" v={`${FUEL_TYPES.find(f => f.id === v.fuel)?.fr} · ${v.powerKw} kW`}/>
              <PdfRow k="Cylindrée · poids" v={`${fmtNum(v.displacement)} cm³ · ${fmtNum(v.weight)} kg`}/>
              <PdfRow k="Origine · usage" v={`${v.origin} · ${USE_TYPES.find(u => u.id === v.use)?.fr}`}/>
            </PdfSection>
          </div>

          <PdfSection title="Décomposition de la taxe">
            <PdfRow k="Valeur CIF déclarée" v={`${fmtNum(bill.cif)} GNF`}/>
            <PdfRow k={`Droit de douane (${(tax.dutyRate*100).toFixed(0)}% × ${tax.ageMult.toFixed(2)} âge × ${tax.fuelMult.toFixed(2)} carb. × ${tax.useMult.toFixed(2)} usage)`} v={`${fmtNum(tax.customsDuty)} GNF`}/>
            <PdfRow k="Surtaxe puissance (kW > 100 · 8 000/kW)" v={`${fmtNum(tax.powerSurcharge)} GNF`}/>
            <PdfRow k="Redevance statistique (0,5 % CIF)" v={`${fmtNum(tax.statFee)} GNF`}/>
            <PdfRow k="TVA · 18 %" v={`${fmtNum(tax.vat)} GNF`}/>
            <PdfRow k="Timbre douanier" v={`${fmtNum(tax.stamp)} GNF`}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #161413', marginTop: 8, paddingTop: 8, fontSize: 14, fontWeight: 700 }}>
              <span>TOTAL À RÉGLER</span>
              <span style={{ fontFamily: 'ui-monospace, monospace' }}>{fmtNum(tax.total)} GNF</span>
            </div>
          </PdfSection>

          {/* Footer */}
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 22, alignItems: 'end' }}>
            <SignatureBlock title="Inspecteur émetteur" name={bill.officer} sig="F. Camara"/>
            <div style={{ fontSize: 10.5, color: '#6B6557', lineHeight: 1.6 }}>
              Échéance de règlement : <strong style={{ color: '#161413' }}>{bill.due}</strong><br/>
              Tout retard entraîne une majoration de 5 % par tranche de 10 jours.<br/>
              Règlement via Mobile Money, virement BCRG, ou caisse DNTT.
            </div>
            <FauxQr size={84} seed={parseInt(bill.id.replace(/\D/g,'').slice(-4) || '42')}/>
          </div>
        </div>

        {/* Side rail — État only */}
        <aside>
          <div style={paperCard()}>
            <div style={{ fontSize: 10.5, letterSpacing: '.18em', color: '#9A9281', textTransform: 'uppercase', marginBottom: 8 }}>État</div>
            <StatusPill status={bill.status} lang={lang}/>
            <div style={{ marginTop: 16, fontSize: 11.5, color: '#6B6557', lineHeight: 1.6 }}>
              Émise par <strong style={{ color: '#161413' }}>{bill.officer}</strong><br/>
              Le {bill.date} · échéance {bill.due}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

Object.assign(window, { OfficerImports, OfficerImportNew, OfficerImportDetail });

// ─────────────────────────────────────────────────────────────
// Importer-side surface: a card surfacing an import bill on the
// company / individual pay screens. Click → opens read-only invoice
// modal. Pay button hooks into the host's pay flow.
// ─────────────────────────────────────────────────────────────
const ImportBillCard = ({ bill, lang = 'fr', onPay, onView }) => {
  const v = bill.vehicle;
  const isFr = lang !== 'en';
  return (
    <article style={{ ...paperCard(), padding: 16, borderLeft: '3px solid #1F4F2C', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 14, right: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#1F4F2C',
                    background: '#E8F0E2', padding: '3px 8px', border: '1px solid #A9C39A', fontWeight: 600 }}>
        <Icon name="ship" size={11}/> {isFr ? 'Importation véhicule' : 'Vehicle import'}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700 }}>{bill.id}</span>
        <span style={{ fontSize: 11, color: '#9A9281' }}>· {isFr ? 'émise le' : 'issued'} {bill.date}</span>
      </div>
      <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 18, fontWeight: 600, marginBottom: 2 }}>
        {v.make} {v.model}
      </div>
      <div style={{ fontSize: 12, color: '#6B6557', marginBottom: 12 }}>
        {v.year} · {VEHICLE_CATEGORIES.find(c => c.id === v.category)?.fr} · {v.powerKw} kW · {v.origin}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '10px 0', borderTop: '1px solid #E5DDC9', borderBottom: '1px solid #E5DDC9', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 9.5, letterSpacing: '.14em', color: '#9A9281', textTransform: 'uppercase' }}>{isFr ? 'Valeur CIF' : 'CIF value'}</div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 600 }}>{new Intl.NumberFormat('fr-FR').format(bill.cif)}</div>
        </div>
        <div>
          <div style={{ fontSize: 9.5, letterSpacing: '.14em', color: '#9A9281', textTransform: 'uppercase' }}>{isFr ? 'Échéance' : 'Due'}</div>
          <div style={{ fontWeight: 600, fontSize: 12.5 }}>{bill.due}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9.5, letterSpacing: '.14em', color: '#9A9281', textTransform: 'uppercase' }}>{isFr ? 'Taxe due' : 'Tax due'}</div>
          <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 19, fontWeight: 700 }}>{new Intl.NumberFormat('fr-FR').format(bill.total)}</div>
          <div style={{ fontSize: 9.5, color: '#9A9281' }}>GNF</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onView?.(bill)} style={{ ...ghostBtn(), flex: 1, justifyContent: 'center' }}>
          <Icon name="doc" size={13}/> {isFr ? 'Voir l\u2019avis' : 'View notice'}
        </button>
        <button onClick={() => onPay?.(bill)} style={{
          flex: 1, background: '#161413', color: '#FCD116', border: 'none',
          padding: '9px 14px', fontFamily: 'inherit', fontWeight: 700, fontSize: 12.5,
          cursor: 'pointer', borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icon name="coin" size={13}/> {isFr ? 'Régler la taxe' : 'Pay tax'}
        </button>
      </div>
    </article>
  );
};

// Read-only modal showing the full import invoice (importer view)
const ImportBillModal = ({ bill, lang, onClose, onPay }) => {
  if (!bill) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(15,15,12,.55)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, zIndex: 100,
      overflow: 'auto',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button onClick={onClose} style={{ ...ghostBtn(), background: '#fff' }}>
            <Icon name="x" size={13}/> Fermer
          </button>
        </div>
        <OfficerImportDetail lang={lang} bill={bill} onBack={onClose}/>
        {bill.status === 'pending' && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => onPay?.(bill)} style={{ ...primaryBtn(), padding: '12px 22px' }}>
              <Icon name="coin" size={14}/> Régler la taxe d'importation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { ImportBillCard, ImportBillModal });

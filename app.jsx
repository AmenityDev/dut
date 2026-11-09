// Mounts the design canvas with the DNTT officer space, the company and the
// individual transporter spaces (desktop, tablet, phone) and the two field
// apps (driver, control agent). Every artboard shares the same data store:
// what you do in one space shows up in the others.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "fr",
  "showOfficer": true,
  "showTransporter": true,
  "showIndividual": true,
  "showMobile": true,
  "showFieldApps": true
}/*EDITMODE-END*/;

// Small always-visible toolbar (the Tweaks panel only exists in the design tool).
const ToolBar = ({ lang, setLang }) => {
  const [confirm, setConfirm] = React.useState(false);
  return (
    <div style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 40, display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(22,20,19,.92)', color: '#F7F3EB', padding: '6px 8px', borderRadius: 8, fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, boxShadow: '0 8px 24px -8px rgba(0,0,0,.5)' }}>
      <span style={{ padding: '0 4px', color: '#FCD116', fontWeight: 600 }}>Prototype</span>
      <select value={lang} onChange={e => setLang(e.target.value)} aria-label="Langue" style={{ background: '#2A2520', color: '#F7F3EB', border: '1px solid #3A332A', borderRadius: 4, padding: '4px 6px', fontFamily: 'inherit', fontSize: 12 }}>
        <option value="fr">Français</option><option value="sus">Soussou</option><option value="ful">Pular</option><option value="man">Maninka</option><option value="en">English</option>
      </select>
      {!confirm
        ? <button onClick={() => setConfirm(true)} style={{ background: 'transparent', color: '#F7F3EB', border: '1px solid #3A332A', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Réinitialiser les données</button>
        : <button onClick={() => { dutActions.reset(); setConfirm(false); }} style={{ background: '#CE1126', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Confirmer la réinitialisation</button>}
    </div>
  );
};

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const lang = tweaks.lang;
  return (
    <>
      <DesignCanvas initialZoom={0.42}>
        <DCSection id="sober" title="A. Plateformes web (desktop)"
                   subtitle="Trois espaces reliés par les mêmes données : l’agent DNTT émet et peut encaisser pour le transporteur, l’entreprise et le particulier règlent leurs DUT (prix fixe de 10 €) et suivent leurs véhicules. Tout est cliquable.">
          {tweaks.showOfficer && <DCArtboard id="officer" label="A1. Espace agent DNTT (émetteur)" width={1440} height={960}><SoberOfficerApp lang={lang}/></DCArtboard>}
          {tweaks.showTransporter && <DCArtboard id="transporter" label="A2. Espace transporteur (entreprise)" width={1440} height={960}><SoberTransporterApp lang={lang}/></DCArtboard>}
          {tweaks.showIndividual && <DCArtboard id="individual" label="A3. Espace transporteur (particulier)" width={1440} height={960}><SoberIndividualApp lang={lang}/></DCArtboard>}
        </DCSection>

        {tweaks.showMobile && (
          <DCSection id="mobile" title="A. Tablette et mobile"
                     subtitle="Mêmes applications et mêmes données, mises en page adaptatives : la barre latérale devient une barre d’onglets, les tableaux deviennent des cartes.">
            <DCArtboard id="officer-tablet" label="Tablette : agent DNTT" width={820} height={1100}><SoberOfficerApp lang={lang}/></DCArtboard>
            <DCArtboard id="transporter-tablet" label="Tablette : transporteur" width={820} height={1100}><SoberTransporterApp lang={lang}/></DCArtboard>
            <DCArtboard id="officer-phone" label="Mobile : agent DNTT" width={390} height={844}><SoberOfficerApp lang={lang}/></DCArtboard>
            <DCArtboard id="transporter-phone" label="Mobile : transporteur" width={390} height={844}><SoberTransporterApp lang={lang}/></DCArtboard>
            <DCArtboard id="individual-phone" label="Mobile : particulier" width={390} height={844}><SoberIndividualApp lang={lang}/></DCArtboard>
          </DCSection>
        )}

        {tweaks.showFieldApps && (
          <DCSection id="field" title="A. Applications terrain mobiles (Android et iOS)"
                     subtitle="Applications interactives : le conducteur lie son téléphone au DUT payé (code à 6 chiffres ou QR code) puis le trajet est suivi en direct ; l’agent au poste de contrôle lit la plaque, vérifie le DUT et la marchandise, et valide le passage.">
            <DCArtboard id="driver" label="Application Conducteur (jumelage et suivi)" width={412} height={892}>
              <AndroidDevice width={412} height={892}><DriverApp/></AndroidDevice>
            </DCArtboard>
            <DCArtboard id="inspector" label="Application Agent de contrôle" width={412} height={892}>
              <AndroidDevice width={412} height={892}><InspectorApp/></AndroidDevice>
            </DCArtboard>
          </DCSection>
        )}
      </DesignCanvas>

      <ToolBar lang={lang} setLang={(v) => setTweak('lang', v)}/>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Artboards visibles">
          <TweakToggle label="A1. Espace agent DNTT" value={tweaks.showOfficer} onChange={(v) => setTweak('showOfficer', v)}/>
          <TweakToggle label="A2. Transporteur entreprise" value={tweaks.showTransporter} onChange={(v) => setTweak('showTransporter', v)}/>
          <TweakToggle label="A3. Transporteur particulier" value={tweaks.showIndividual} onChange={(v) => setTweak('showIndividual', v)}/>
          <TweakToggle label="Tablette et mobile" value={tweaks.showMobile} onChange={(v) => setTweak('showMobile', v)}/>
          <TweakToggle label="Applications terrain" value={tweaks.showFieldApps} onChange={(v) => setTweak('showFieldApps', v)}/>
        </TweakSection>
        <TweakSection label="Langue de l’interface">
          <TweakSelect value={lang} onChange={(v) => setTweak('lang', v)} options={[
            { value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }, { value: 'sus', label: 'Soussou' }, { value: 'ful', label: 'Pular' }, { value: 'man', label: 'Maninka' },
          ]}/>
        </TweakSection>
        <TweakSection label="Données">
          <TweakButton label="Réinitialiser les données" onClick={() => dutActions.reset()}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);

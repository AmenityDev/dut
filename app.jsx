// Mounts the design canvas with the two SOBER platforms (Officer + Transporter),
// the field apps, and mobile responsive views.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "lang": "fr",
  "userState": "overdue",
  "showOfficer": true,
  "showTransporter": true,
  "showIndividual": true,
  "showMobile": true,
  "showFieldApps": true
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <DesignCanvas initialZoom={0.42}>
        <DCSection id="sober" title="A. Sobre institutionnelle (desktop)"
                   subtitle="Trois espaces distincts : l'agent DNTT émet, l'entreprise gère sa flotte, le particulier règle ses propres trajets. Tous partagent le même langage visuel ; la complexité s'adapte au rôle.">
          {tweaks.showOfficer && (
            <DCArtboard id="officer" label="A1. Espace agent DNTT (émetteur)" width={1440} height={960}>
              <SoberOfficerApp lang={tweaks.lang}/>
            </DCArtboard>
          )}
          {tweaks.showTransporter && (
            <DCArtboard id="transporter" label="A2. Espace transporteur (entreprise)" width={1440} height={960}>
              <SoberTransporterApp lang={tweaks.lang} userState={tweaks.userState}/>
            </DCArtboard>
          )}
          {tweaks.showIndividual && (
            <DCArtboard id="individual" label="A3. Espace transporteur (particulier)" width={1440} height={960}>
              <SoberIndividualApp lang={tweaks.lang}/>
            </DCArtboard>
          )}
        </DCSection>

        {tweaks.showMobile && (
          <DCSection id="mobile" title="A. Sobre (tablette et mobile)"
                     subtitle="Mêmes applications, layouts adaptatifs grâce aux container queries : la sidebar se replie en barre d'onglets bas, les tableaux deviennent des cartes empilées.">
            <DCArtboard id="officer-tablet" label="Tablette : agent DNTT" width={820} height={1100}>
              <SoberOfficerApp lang={tweaks.lang}/>
            </DCArtboard>
            <DCArtboard id="transporter-tablet" label="Tablette : transporteur" width={820} height={1100}>
              <SoberTransporterApp lang={tweaks.lang} userState={tweaks.userState}/>
            </DCArtboard>
            <DCArtboard id="officer-phone" label="Mobile : agent DNTT" width={390} height={844}>
              <SoberOfficerApp lang={tweaks.lang}/>
            </DCArtboard>
            <DCArtboard id="transporter-phone" label="Mobile : transporteur" width={390} height={844}>
              <SoberTransporterApp lang={tweaks.lang} userState={tweaks.userState}/>
            </DCArtboard>
            <DCArtboard id="individual-phone" label="Mobile : particulier" width={390} height={844}>
              <SoberIndividualApp lang={tweaks.lang}/>
            </DCArtboard>
          </DCSection>
        )}

        {tweaks.showFieldApps && (
          <DCSection id="field" title="A. Sobre (applications terrain mobiles)"
                     subtitle="Deux applications de terrain, disponibles sur Android et iOS : le téléphone du conducteur devient l'unité de suivi GPS du camion ; l'agent au poste de contrôle photographie la plaque et la marchandise pour valider chaque passage.">
            <DCArtboard id="driver-1" label="Conducteur 1 : jumelage avec le transporteur" width={412} height={892}>
              <AndroidDevice width={412} height={892}>
                <DriverScreen1Setup/>
              </AndroidDevice>
            </DCArtboard>
            <DCArtboard id="driver-2" label="Conducteur 2 : trajet en cours, suivi GPS" width={412} height={892}>
              <AndroidDevice width={412} height={892}>
                <DriverScreen2Trip/>
              </AndroidDevice>
            </DCArtboard>
            <DCArtboard id="driver-3" label="Conducteur 3 : mode hors ligne, file de synchronisation" width={412} height={892}>
              <AndroidDevice width={412} height={892}>
                <DriverScreen3Offline/>
              </AndroidDevice>
            </DCArtboard>
            <DCArtboard id="driver-4" label="Conducteur 4 : trajet terminé" width={412} height={892}>
              <AndroidDevice width={412} height={892}>
                <DriverScreen4Recap/>
              </AndroidDevice>
            </DCArtboard>
            <DCArtboard id="ins-1" label="Agent de contrôle 1 : file de passages" width={412} height={892}>
              <AndroidDevice width={412} height={892}>
                <InspectorScreen1Queue/>
              </AndroidDevice>
            </DCArtboard>
            <DCArtboard id="ins-2" label="Agent de contrôle 2 : capture de la plaque" width={412} height={892}>
              <AndroidDevice width={412} height={892} dark>
                <InspectorScreen2Plate/>
              </AndroidDevice>
            </DCArtboard>
            <DCArtboard id="ins-3" label="Agent de contrôle 3 : vérification de la marchandise" width={412} height={892}>
              <AndroidDevice width={412} height={892}>
                <InspectorScreen3Goods/>
              </AndroidDevice>
            </DCArtboard>
            <DCArtboard id="ins-4" label="Agent de contrôle 4 : passage validé" width={412} height={892}>
              <AndroidDevice width={412} height={892}>
                <InspectorScreen4Confirm/>
              </AndroidDevice>
            </DCArtboard>
          </DCSection>
        )}
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Artboards visibles">
          <TweakToggle label="A1. Espace agent DNTT"           value={tweaks.showOfficer}     onChange={(v) => setTweak('showOfficer', v)}/>
          <TweakToggle label="A2. Transporteur entreprise"     value={tweaks.showTransporter} onChange={(v) => setTweak('showTransporter', v)}/>
          <TweakToggle label="A3. Transporteur particulier"    value={tweaks.showIndividual}  onChange={(v) => setTweak('showIndividual', v)}/>
          <TweakToggle label="Tablette + mobile"          value={tweaks.showMobile}      onChange={(v) => setTweak('showMobile', v)}/>
          <TweakToggle label="Applications terrain (Android et iOS)" value={tweaks.showFieldApps} onChange={(v) => setTweak('showFieldApps', v)}/>
        </TweakSection>

        <TweakSection label="Langue de l'interface">
          <TweakSelect value={tweaks.lang} onChange={(v) => setTweak('lang', v)}
            options={[
              { value: 'fr',  label: 'Français' },
              { value: 'en',  label: 'English' },
              { value: 'sus', label: 'Soussou' },
              { value: 'ful', label: 'Pular' },
              { value: 'man', label: 'Maninka' },
            ]}/>
        </TweakSection>

        <TweakSection label="État du transporteur">
          <TweakRadio value={tweaks.userState} onChange={(v) => setTweak('userState', v)}
            options={[
              { value: 'active',  label: 'À jour' },
              { value: 'overdue', label: 'En retard' },
            ]}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);

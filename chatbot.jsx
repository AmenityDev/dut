// SOBER · Chatbot badge — floating pill bottom-right, opens a panel with
// role-specific quick actions. Same sober language: cream paper, ink, yellow accent.
//
// Usage:
//   <ChatbotBadge role="officer" lang={lang}/>
//   <ChatbotBadge role="company" lang={lang}/>
//   <ChatbotBadge role="individual" lang={lang}/>
//
// `claude.complete` is used when the user types a free-form question; quick
// actions show pre-canned responses so the demo always works without a network.

const CHATBOT_ACTIONS = {
  officer: {
    fr: [
      { id: 'rate',    icon: 'coin',  label: 'Calculer une redevance',     hint: 'Conakry → Kankan, citerne 32t' },
      { id: 'lookup',  icon: 'search', label: 'Vérifier une plaque',        hint: 'RC-3107-AB' },
      { id: 'tariff',  icon: 'doc',   label: 'Barème en vigueur (2026)',   hint: 'Décret 2024-189' },
      { id: 'cancel',  icon: 'help',  label: 'Comment annuler un DUT ?',   hint: 'Procédure agent' },
    ],
    en: [
      { id: 'rate',    icon: 'coin',  label: 'Calculate a fee',            hint: 'Conakry → Kankan, 32t tanker' },
      { id: 'lookup',  icon: 'search', label: 'Look up a plate',            hint: 'RC-3107-AB' },
      { id: 'tariff',  icon: 'doc',   label: 'Active tariff (2026)',       hint: 'Decree 2024-189' },
      { id: 'cancel',  icon: 'help',  label: 'How to cancel a STD?',       hint: 'Officer procedure' },
    ],
  },
  company: {
    fr: [
      { id: 'pay',     icon: 'coin',  label: 'Régler tous mes DUT',        hint: '2 en attente · 1 645 800 GNF' },
      { id: 'fleet',   icon: 'truck', label: 'Statut de ma flotte',         hint: '14 véhicules · 12 actifs' },
      { id: 'invoice', icon: 'doc',   label: 'Facture du mois',             hint: 'Avril 2026 · PDF' },
      { id: 'agent',   icon: 'phone', label: 'Parler à un agent DNTT',       hint: 'Lun-Ven · 8h-17h' },
    ],
    en: [
      { id: 'pay',     icon: 'coin',  label: 'Pay all my bills',           hint: '2 pending · 1,645,800 GNF' },
      { id: 'fleet',   icon: 'truck', label: 'My fleet status',             hint: '14 vehicles · 12 active' },
      { id: 'invoice', icon: 'doc',   label: 'Monthly statement',           hint: 'April 2026 · PDF' },
      { id: 'agent',   icon: 'phone', label: 'Talk to a DNTT agent',         hint: 'Mon-Fri · 8a-5p' },
    ],
  },
  individual: {
    fr: [
      { id: 'paynow',  icon: 'coin',  label: 'Régler mon DUT en attente',  hint: 'Coyah → Conakry · 64 200 GNF' },
      { id: 'next',    icon: 'doc',   label: 'Estimer mon prochain trajet', hint: 'Combien va coûter…' },
      { id: 'momo',    icon: 'phone', label: 'Aide Orange Money',           hint: 'Échec de paiement ?' },
      { id: 'office',  icon: 'help',  label: 'Bureau DNTT le plus proche',   hint: 'Coyah · ouvert' },
    ],
    en: [
      { id: 'paynow',  icon: 'coin',  label: 'Pay my pending bill',        hint: 'Coyah → Conakry · 64,200 GNF' },
      { id: 'next',    icon: 'doc',   label: 'Estimate my next trip',       hint: 'How much will it cost…' },
      { id: 'momo',    icon: 'phone', label: 'Orange Money help',           hint: 'Payment failed?' },
      { id: 'office',  icon: 'help',  label: 'Nearest DNTT office',          hint: 'Coyah · open' },
    ],
  },
};

const CHATBOT_RESPONSES = {
  // Officer
  rate: {
    fr: "**Conakry → Kankan · citerne 32 t**\n\n• Distance : 642 km\n• Tarif kilométrique : 720 GNF/km/t\n• Redevance : 14 791 680 GNF\n• Timbre fiscal : 25 000 GNF\n• Quote-part DNTT : 8 000 GNF\n\n**Total : 14 824 680 GNF**\n\nBarème : décret 2024-189, art. 12.",
    en: "**Conakry → Kankan · 32 t tanker**\n\n• Distance: 642 km\n• Per-km rate: 720 GNF/km/t\n• Fee: 14,791,680 GNF\n• Stamp: 25,000 GNF\n• DNTT share: 8,000 GNF\n\n**Total: 14,824,680 GNF**\n\nReference: decree 2024-189, art. 12.",
  },
  lookup: {
    fr: "**RC-3107-AB**\n\n• Type : Semi-remorque · Renault K460\n• Année : 2019 · 40 t\n• Transporteur : Diallo & Frères (NIF 7053219K)\n• Carte transp. : valide jusqu'au 12/2026\n• 3 DUT actifs · 0 incident\n\nVéhicule en règle.",
    en: "**RC-3107-AB**\n\n• Type: Semi-trailer · Renault K460\n• Year: 2019 · 40 t\n• Carrier: Diallo & Frères (NIF 7053219K)\n• Carrier card: valid through 12/2026\n• 3 active STDs · 0 incidents\n\nVehicle in compliance.",
  },
  tariff: {
    fr: "**Barème 2026 (décret 2024-189)**\n\n• 0 – 3,5 t : 410 GNF/km/t\n• 3,5 – 12 t : 580 GNF/km/t\n• 12 – 24 t : 690 GNF/km/t\n• > 24 t (citerne) : 720 GNF/km/t\n\n+ Timbre fiscal 25 000 GNF\n+ Quote-part DNTT 8 000 GNF\n\nTaux en vigueur depuis le 1ᵉʳ janvier 2026.",
    en: "**2026 schedule (decree 2024-189)**\n\n• 0 – 3.5 t: 410 GNF/km/t\n• 3.5 – 12 t: 580 GNF/km/t\n• 12 – 24 t: 690 GNF/km/t\n• > 24 t (tanker): 720 GNF/km/t\n\n+ Stamp 25,000 GNF\n+ DNTT share 8,000 GNF\n\nIn effect since 1 Jan 2026.",
  },
  cancel: {
    fr: "**Annuler un DUT émis**\n\nPossible jusqu'au paiement effectif. Au-delà, c'est un remboursement.\n\n1. Ouvrez le DUT dans la liste « Émis »\n2. Bouton « Annuler » (en haut à droite)\n3. Sélectionnez le motif (saisie obligatoire)\n4. Validation par votre responsable de bureau\n\nLa trace reste dans le journal d'audit.",
    en: "**Cancel an issued STD**\n\nPossible until the bill is paid. After that, it's a refund.\n\n1. Open the STD in the « Issued » list\n2. Hit « Cancel » (top right)\n3. Select reason (required)\n4. Office manager approval\n\nAudit log keeps the trace.",
  },
  // Company
  pay: {
    fr: "**Règlement groupé · 2 DUT en attente**\n\n• DUT-2026-04-08741 · 982 400 GNF\n• DUT-2026-04-08672 · 663 400 GNF\n\n**Total : 1 645 800 GNF**\n\nMéthode disponible : virement bancaire (BICIGUI), Orange Business, MTN MoMo Pro.\n\nVoulez-vous lancer le règlement ?",
    en: "**Bulk payment · 2 pending bills**\n\n• STD-2026-04-08741 · 982,400 GNF\n• STD-2026-04-08672 · 663,400 GNF\n\n**Total: 1,645,800 GNF**\n\nAvailable: bank transfer (BICIGUI), Orange Business, MTN MoMo Pro.\n\nShall I start the payment?",
  },
  fleet: {
    fr: "**Flotte Diallo & Frères · 14 véhicules**\n\n• 12 actifs (en circulation)\n• 1 en maintenance (RC-2244-AA · révision)\n• 1 immobilisé (RC-1109-CD · attente pièces)\n\n3 cartes transporteur arrivent à échéance dans les 60 jours.",
    en: "**Diallo & Frères fleet · 14 vehicles**\n\n• 12 active (on the road)\n• 1 in maintenance (RC-2244-AA · service)\n• 1 grounded (RC-1109-CD · awaiting parts)\n\n3 carrier cards expire within 60 days.",
  },
  invoice: {
    fr: "**Relevé d'avril 2026**\n\n• 18 DUT émis · 21 réglés (3 reliquats mars)\n• Total payé : 12 482 400 GNF\n• Solde au 30/04 : 1 645 800 GNF (en attente)\n\nLe PDF consolidé est prêt. Je vous l'envoie par e-mail à contact@diallo-transports.gn ?",
    en: "**April 2026 statement**\n\n• 18 STDs issued · 21 paid (3 March carry-overs)\n• Paid total: 12,482,400 GNF\n• Balance at 30/04: 1,645,800 GNF (pending)\n\nThe consolidated PDF is ready. Email it to contact@diallo-transports.gn?",
  },
  agent: {
    fr: "**Agent DNTT**\n\nVotre point de contact : **F. Camara** (bureau Conakry-Sonfonia).\n\n• Tél : 1505 (gratuit)\n• Direct : +224 656 02 14 09\n• Heures : lun-ven · 8h-17h\n\nJe peux ouvrir un ticket prioritaire si c'est urgent.",
    en: "**DNTT Agent**\n\nYour contact: **F. Camara** (Conakry-Sonfonia office).\n\n• Tel: 1505 (toll-free)\n• Direct: +224 656 02 14 09\n• Hours: Mon-Fri · 8a-5p\n\nI can open a priority ticket if it's urgent.",
  },
  // Individual
  paynow: {
    fr: "**DUT-2026-04-08819 · Coyah → Conakry**\n\n• Marchandise : produits maraîchers\n• Émis le 02/05/2026 par F. Camara\n• Échéance : 04/05/2026\n\n**À régler : 64 200 GNF**\n\nMéthode rapide : Orange Money sur +224 622 04 18 77. Tapez #144*2# pour confirmer.",
    en: "**STD-2026-04-08819 · Coyah → Conakry**\n\n• Goods: produce\n• Issued 02/05/2026 by F. Camara\n• Due: 04/05/2026\n\n**Amount due: 64,200 GNF**\n\nQuickest: Orange Money on +224 622 04 18 77. Dial #144*2# to confirm.",
  },
  next: {
    fr: "**Estimer un trajet**\n\nDites-moi : départ, destination, marchandise et poids approximatif.\n\nExemple : « Coyah → Kindia, banane plantain, 1,2 t ».\n\nJe calcule la redevance + timbre + quote-part DNTT selon le barème 2026.",
    en: "**Estimate a trip**\n\nTell me: origin, destination, goods, approximate weight.\n\nExample: « Coyah → Kindia, plantain, 1.2 t ».\n\nI'll calculate fee + stamp + DNTT share per the 2026 schedule.",
  },
  momo: {
    fr: "**Échec Orange Money — pistes courantes**\n\n1. Solde insuffisant ? Composez #144#\n2. Plafond journalier atteint (2 000 000 GNF)\n3. Numéro DUT mal saisi (12 chiffres)\n4. Réseau OM en maintenance\n\nSi rien ne marche, payez en espèces au bureau de Coyah (8h-17h, samedi inclus).",
    en: "**Orange Money failed — common fixes**\n\n1. Insufficient balance? Dial #144#\n2. Daily cap hit (2,000,000 GNF)\n3. STD number mistyped (12 digits)\n4. OM network in maintenance\n\nIf nothing works, pay cash at Coyah office (8a-5p, Sat included).",
  },
  office: {
    fr: "**Bureau DNTT · Coyah**\n\n📍 Marché central, face à la mosquée\n🕐 Lun-Sam · 8h-17h (sans rendez-vous)\n📞 +224 622 88 14 02\n\nC'est à 12 min de chez vous. Ils acceptent espèces, OM, et MTN MoMo.",
    en: "**DNTT Office · Coyah**\n\n📍 Central market, opposite the mosque\n🕐 Mon-Sat · 8a-5p (walk-in)\n📞 +224 622 88 14 02\n\n12 min from your place. They accept cash, OM, and MTN MoMo.",
  },
};

const ChatbotBadge = ({ role = 'company', lang = 'fr' }) => {
  const [open, setOpen] = React.useState(false);
  const [thread, setThread] = React.useState([]); // {who: 'bot'|'user', text}
  const [input, setInput] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const isFr = lang !== 'en';
  const actions = CHATBOT_ACTIONS[role][isFr ? 'fr' : 'en'];
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, pending]);

  const greeting = {
    officer: { fr: "Bonjour. Je peux vous aider à émettre, vérifier ou annuler un DUT, ou vous donner les barèmes. Que voulez-vous faire ?",
               en: "Hello. I can help you issue, verify, or cancel an STD, or share the rate schedule. What do you need?" },
    company: { fr: "Bonjour. Je peux régler vos DUT, suivre votre flotte, ou vous mettre en relation avec un agent DNTT. Comment puis-je aider ?",
               en: "Hello. I can pay your bills, track your fleet, or put you in touch with a DNTT agent. How can I help?" },
    individual: { fr: "Bonjour Sékou. Je peux régler votre DUT en attente, estimer un trajet, ou vous aider avec Orange Money. Que faisons-nous ?",
                  en: "Hi Sékou. I can pay your pending STD, estimate a trip, or help with Orange Money. What's up?" },
  };

  const ensureGreeting = () => {
    if (thread.length === 0) {
      setThread([{ who: 'bot', text: greeting[role][isFr ? 'fr' : 'en'] }]);
    }
  };

  const handleAction = (action) => {
    ensureGreeting();
    const userMsg = { who: 'user', text: action.label };
    const botMsg = { who: 'bot', text: CHATBOT_RESPONSES[action.id][isFr ? 'fr' : 'en'] };
    setThread(t => [...t, userMsg]);
    setPending(true);
    setTimeout(() => {
      setThread(t => [...t, botMsg]);
      setPending(false);
    }, 600);
  };

  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;
    ensureGreeting();
    setThread(t => [...t, { who: 'user', text: q }]);
    setInput('');
    setPending(true);
    try {
      const sys = `You are a helpful assistant inside the Guinean DUT (Document Unique de Transport) platform, role: ${role}. Respond in ${isFr ? 'French' : 'English'}, in 2-4 short sentences, sober institutional tone. Use GNF currency.`;
      const text = await window.claude.complete({
        messages: [{ role: 'user', content: `${sys}\n\nUser: ${q}` }],
      });
      setThread(t => [...t, { who: 'bot', text: text || (isFr ? "Je n'ai pas pu répondre cette fois-ci." : "I couldn't answer this time.") }]);
    } catch (e) {
      setThread(t => [...t, { who: 'bot', text: isFr ? "Erreur réseau. Réessayez plus tard." : "Network error. Try again later." }]);
    }
    setPending(false);
  };

  // Render
  return (
    <div style={{ position: 'absolute', right: 22, bottom: 22, zIndex: 50, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 60, right: 0, width: 360, maxHeight: 520,
          background: '#FBF8F2', border: '1px solid #DCD3BD',
          boxShadow: '0 8px 30px -8px rgba(22,20,19,.25), 0 2px 0 0 rgba(22,20,19,.04)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #E5DDC9', background: '#161413', color: '#F7F3EB', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: '#FCD116', color: '#161413', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Crimson Pro", serif', fontWeight: 700, fontSize: 14 }}>D</div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontFamily: '"Crimson Pro", serif', fontSize: 14.5, fontWeight: 600 }}>{isFr ? 'Assistant DUT' : 'STD Assistant'}</div>
              <div style={{ fontSize: 10.5, color: '#FCD116', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#71D67E', marginRight: 5, verticalAlign: 1 }}/>
                {isFr ? 'En ligne' : 'Online'}
              </div>
            </div>
            <div style={{ flex: 1 }}/>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#F7F3EB', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l10 10M13 3L3 13"/></svg>
            </button>
          </div>

          {/* Body — quick actions if no thread, else messages */}
          <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {thread.length === 0 ? (
              <>
                <div style={{ fontSize: 12.5, color: '#3A352D', padding: '6px 4px 8px', lineHeight: 1.5 }}>
                  {greeting[role][isFr ? 'fr' : 'en']}
                </div>
                <div style={{ fontSize: 10, letterSpacing: '.16em', color: '#9A9281', textTransform: 'uppercase', padding: '6px 4px 0' }}>
                  {isFr ? 'Actions rapides' : 'Quick actions'}
                </div>
                {actions.map(a => (
                  <button key={a.id} onClick={() => handleAction(a)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                    background: '#fff', border: '1px solid #E5DDC9', cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left', borderRadius: 2,
                  }}>
                    <div style={{ width: 28, height: 28, background: '#F7F3EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#161413' }}>
                      <Icon name={a.icon} size={14}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#161413' }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: '#6B6557', marginTop: 1 }}>{a.hint}</div>
                    </div>
                    <Icon name="chev" size={12} style={{ color: '#9A9281', flexShrink: 0, marginTop: 8 }}/>
                  </button>
                ))}
              </>
            ) : (
              <>
                {thread.map((m, i) => (
                  <ChatBubble key={i} who={m.who} text={m.text}/>
                ))}
                {pending && <ChatBubble who="bot" pending/>}
                {!pending && thread.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {actions.slice(0, 3).map(a => (
                      <button key={a.id} onClick={() => handleAction(a)} style={{
                        padding: '5px 10px', background: '#fff', border: '1px solid #E5DDC9',
                        fontSize: 11, color: '#3A352D', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2,
                      }}>{a.label}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: 10, borderTop: '1px solid #E5DDC9', background: '#fff', display: 'flex', gap: 6 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder={isFr ? 'Écrivez votre question…' : 'Type your question…'}
              style={{
                flex: 1, padding: '8px 10px', border: '1px solid #E5DDC9', background: '#fff',
                fontFamily: 'inherit', fontSize: 12.5, color: '#161413', outline: 'none', borderRadius: 2,
              }}
              onFocus={e => { e.target.style.borderColor = '#161413'; }}
              onBlur={e => { e.target.style.borderColor = '#E5DDC9'; }}
            />
            <button onClick={handleSend} disabled={!input.trim() || pending} style={{
              padding: '0 12px', background: input.trim() && !pending ? '#161413' : '#DCD3BD',
              color: input.trim() && !pending ? '#FCD116' : '#9A9281',
              border: 'none', cursor: input.trim() && !pending ? 'pointer' : 'default',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', borderRadius: 2,
            }}>
              {isFr ? 'ENVOYER' : 'SEND'}
            </button>
          </div>
        </div>
      )}

      {/* Pill */}
      <button onClick={() => { setOpen(o => !o); if (!open) ensureGreeting(); }} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: open ? 0 : '10px 16px 10px 12px',
        width: open ? 48 : 'auto', height: 48,
        background: '#161413', color: '#FCD116',
        border: '1px solid #161413', borderRadius: 24,
        fontFamily: 'inherit', fontSize: 13, fontWeight: 600, letterSpacing: '.02em',
        cursor: 'pointer', boxShadow: '0 6px 18px -6px rgba(22,20,19,.4)',
        justifyContent: 'center',
      }}>
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
        ) : (
          <>
            <ChatbotIcon/>
            <span>{isFr ? 'Assistant' : 'Assistant'}</span>
            {role !== 'officer' && (
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#71D67E', marginLeft: 2 }}/>
            )}
          </>
        )}
      </button>
    </div>
  );
};

const ChatBubble = ({ who, text, pending }) => {
  const isBot = who === 'bot';
  // Convert markdown bullets, bold, line breaks to JSX
  const render = (txt) => {
    if (!txt) return null;
    return txt.split('\n').map((line, i) => {
      const bolded = line.split(/\*\*(.+?)\*\*/g).map((seg, j) =>
        j % 2 ? <strong key={j} style={{ fontWeight: 700 }}>{seg}</strong> : <React.Fragment key={j}>{seg}</React.Fragment>
      );
      return <div key={i} style={{ minHeight: '1em' }}>{bolded}</div>;
    });
  };
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: isBot ? 'row' : 'row-reverse' }}>
      {isBot && (
        <div style={{ width: 24, height: 24, background: '#161413', color: '#FCD116', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Crimson Pro", serif', fontWeight: 700, fontSize: 11, flexShrink: 0, marginTop: 2 }}>D</div>
      )}
      <div style={{
        maxWidth: '78%', padding: '8px 11px',
        background: isBot ? '#fff' : '#161413',
        color: isBot ? '#161413' : '#F7F3EB',
        border: isBot ? '1px solid #E5DDC9' : 'none',
        fontSize: 12.5, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        borderRadius: 2,
      }}>
        {pending ? (
          <span style={{ display: 'inline-flex', gap: 3 }}>
            <Dot delay={0}/><Dot delay={0.15}/><Dot delay={0.3}/>
          </span>
        ) : render(text)}
      </div>
    </div>
  );
};

const Dot = ({ delay }) => (
  <>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9A9281', display: 'inline-block', animation: `chatdot 1s ${delay}s infinite ease-in-out` }}/>
    <style>{`@keyframes chatdot { 0%, 60%, 100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } }`}</style>
  </>
);

const ChatbotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16v10H8l-4 4z"/>
    <circle cx="9" cy="11" r="0.8" fill="currentColor"/>
    <circle cx="12" cy="11" r="0.8" fill="currentColor"/>
    <circle cx="15" cy="11" r="0.8" fill="currentColor"/>
  </svg>
);

Object.assign(window, { ChatbotBadge });

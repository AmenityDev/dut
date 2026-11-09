// SOBER: Chatbot badge. Floating pill that can be dragged anywhere inside its
// app (desktop, tablet, phone). Opens a panel with role-specific quick actions.
// Same sober language: cream paper, ink, yellow accent.
//
// Usage:
//   <ChatbotBadge role="officer" lang={lang}/>
//   <ChatbotBadge role="company" lang={lang}/>
//   <ChatbotBadge role="individual" lang={lang}/>
//
// Drag and drop:
//   Mouse, touch or pen: press the pill and move it. A short tap still opens it.
//   Keyboard: focus the pill and use the arrow keys (Shift for bigger steps).
//   The position is remembered per role and per layout (desktop, tablet, phone).
//
// Free-form questions use window.claude.complete when it exists. On a static
// deployment (Cloudflare Pages) it does not, so a local keyword matcher answers
// from the canned responses and the assistant keeps working without any backend.

const CHATBOT_ACTIONS = {
  officer: {
    fr: [
      { id: 'rate',    icon: 'coin',   label: 'Prix d’un DUT',              hint: 'Tarif fixe' },
      { id: 'lookup',  icon: 'search', label: 'Vérifier une plaque',        hint: 'RC-4821-AC' },
      { id: 'tariff',  icon: 'doc',    label: 'Encaisser pour un transporteur', hint: 'Espèces, mobile money, prélèvement' },
      { id: 'cancel',  icon: 'help',   label: 'Comment annuler un DUT ?',   hint: 'Procédure agent' },
    ],
    en: [
      { id: 'rate',    icon: 'coin',   label: 'Price of an STD',            hint: 'Fixed price' },
      { id: 'lookup',  icon: 'search', label: 'Look up a plate',            hint: 'RC-4821-AC' },
      { id: 'tariff',  icon: 'doc',    label: 'Collect for a transporter',  hint: 'Cash, mobile money, debit' },
      { id: 'cancel',  icon: 'help',   label: 'How to cancel an STD?',      hint: 'Officer procedure' },
    ],
  },
  company: {
    fr: [
      { id: 'pay',     icon: 'coin',  label: 'Mes DUT à régler',            hint: 'Montant et échéances' },
      { id: 'fleet',   icon: 'truck', label: 'Statut de ma flotte',         hint: 'Véhicules et trajets' },
      { id: 'invoice', icon: 'pin',   label: 'Suivre un camion',            hint: 'Code de jumelage' },
      { id: 'agent',   icon: 'phone', label: 'Contacter la DNTT',           hint: 'Siège de Kaloum' },
    ],
    en: [
      { id: 'pay',     icon: 'coin',  label: 'My bills to pay',             hint: 'Amounts and due dates' },
      { id: 'fleet',   icon: 'truck', label: 'My fleet status',             hint: 'Vehicles and trips' },
      { id: 'invoice', icon: 'pin',   label: 'Track a truck',               hint: 'Pairing code' },
      { id: 'agent',   icon: 'phone', label: 'Contact the DNTT',            hint: 'Kaloum head office' },
    ],
  },
  individual: {
    fr: [
      { id: 'paynow',  icon: 'coin',  label: 'Régler mon DUT en attente',   hint: 'Montant à payer' },
      { id: 'next',    icon: 'doc',   label: 'Combien coûte un DUT ?',      hint: 'Prix fixe' },
      { id: 'momo',    icon: 'phone', label: 'Aide Orange Money',           hint: 'Échec de paiement ?' },
      { id: 'office',  icon: 'help',  label: 'Adresse de la DNTT',          hint: 'Almamya, Kaloum' },
    ],
    en: [
      { id: 'paynow',  icon: 'coin',  label: 'Pay my pending bill',         hint: 'Amount due' },
      { id: 'next',    icon: 'doc',   label: 'How much is an STD?',         hint: 'Fixed price' },
      { id: 'momo',    icon: 'phone', label: 'Orange Money help',           hint: 'Payment failed?' },
      { id: 'office',  icon: 'help',  label: 'DNTT address',                hint: 'Almamya, Kaloum' },
    ],
  },
};

// Answers are computed from the shared store, so they match the screens.
const cbState = () => dutStore.get();
const cbDue = (tid) => sel.billsOf(cbState(), tid).filter(b => b.status === 'pending');
const CHATBOT_RESPONSES = {
  rate: {
    fr: () => `**Prix du DUT : ${fmtEur(TARIFF.priceEur)}**\n\nLe prix est fixe, quel que soit le trajet, la distance, le véhicule ou la marchandise.\n\nMontant encaissé : ${fmtGNF(TARIFF.priceGnf)} (taux de référence 1 € = ${fmtGNF(TARIFF.eurToGnf)}).`,
    en: () => `**STD price: ${fmtEur(TARIFF.priceEur)}**\n\nFixed price, whatever the route, distance, vehicle or cargo.\n\nCollected amount: ${fmtGNF(TARIFF.priceGnf)}.`,
  },
  lookup: {
    fr: () => { const s = cbState(); const v = sel.vehicle(s, 'RC-4821-AC'); const b = s.bills.filter(x => x.vehicle === 'RC-4821-AC').sort((a, c) => c.issuedAt - a.issuedAt)[0]; const tr = sel.transporter(s, v.transporterId); return `**RC-4821-AC**\n\n• ${v.type}, ${v.brand} ${v.year}\n• Transporteur : ${tr.short}\n• Conducteur : ${v.driver}\n• Dernier DUT : ${b.id} (${b.status === 'paid' ? 'payé' : 'à régler'})\n• Suivi : ${s.trips[b.id] ? (s.trips[b.id].status === 'arrived' ? 'arrivé' : `en route, ${Math.round(s.trips[b.id].progress * 100)} %`) : 'non suivi'}`; },
    en: () => `**RC-4821-AC**\n\nOpen Vehicles in the menu to see its owner, driver and latest STD.`,
  },
  tariff: {
    fr: "**Encaisser pour le transporteur**\n\nOuvrez le DUT dans la file, puis le bloc « Encaisser pour le transporteur » :\n\n1. Débiter le compte mobile money enregistré (si le transporteur a autorisé le prélèvement dans son espace)\n2. Envoyer une demande de paiement mobile money sur son numéro\n3. Enregistrer des espèces reçues au guichet\n\nLe DUT passe à « Payé » partout et le transporteur reçoit une notification.",
    en: "**Collect for the transporter**\n\nOpen the STD, then use « Collect for the transporter »: debit his registered mobile money account (if authorised), send a mobile money request, or record cash.",
  },
  cancel: {
    fr: "**Annuler un DUT émis**\n\nPossible tant que le DUT n’est pas payé.\n\n1. Ouvrez le DUT dans la file\n2. Cliquez sur « Annuler ce DUT »\n3. Choisissez le motif\n\nLe transporteur est prévenu et l’opération reste dans l’historique.",
    en: "**Cancel an issued STD**\n\nPossible until it is paid. Open the STD, click « Cancel », pick a reason. The transporter is notified.",
  },
  pay: {
    fr: () => { const d = cbDue('TRP-04812'); return d.length ? `**${d.length} DUT à régler : ${fmtGNF(d.reduce((x, b) => x + b.amount, 0))}**\n\n${d.map(b => `• ${b.id} : ${b.from} vers ${b.to}, ${fmtGNF(b.amount)}${sel.isOverdue(b) ? ' (en retard)' : ''}`).join('\n')}\n\nMoyens : Orange Money, MTN MoMo, carte, virement. Ouvrez « Régler mes DUT ».` : 'Aucun DUT à régler. Tout est à jour.'; },
    en: () => { const d = cbDue('TRP-04812'); return d.length ? `**${d.length} bills to pay: ${fmtGNF(d.reduce((x, b) => x + b.amount, 0))}**` : 'Nothing to pay.'; },
  },
  fleet: {
    fr: () => { const s = cbState(); const vs = sel.vehiclesOf(s, 'TRP-04812'); const road = sel.billsOf(s, 'TRP-04812').filter(b => s.trips[b.id] && s.trips[b.id].status === 'in_progress'); return `**Flotte Diallo & Frères : ${vs.length} véhicules**\n\n• ${vs.filter(v => v.status === 'active').length} disponibles\n• ${vs.filter(v => v.status !== 'active').length} en maintenance\n• ${road.length} en route${road.length ? ` (${road.map(b => b.vehicle).join(', ')})` : ''}`; },
    en: () => `See « Fleet » for vehicles and « Tracking » for trips on the road.`,
  },
  invoice: {
    fr: "**Suivre un camion**\n\n1. Le DUT doit être payé\n2. Menu « Suivi des véhicules », choisissez le DUT\n3. « Générer le code de jumelage », puis « Envoyer par SMS au conducteur »\n4. Le conducteur saisit le code dans l’application DUT Conducteur, ou scanne le QR code du DUT\n\nLe trajet s’affiche ensuite en direct.",
    en: "Pay the STD, open Tracking, generate the pairing code and send it to the driver, who enters it in the DUT Driver app (or scans the STD QR code).",
  },
  agent: {
    fr: () => `**${DNTT_HQ.name}**\n\n• Adresse : ${DNTT_HQ.address}\n• Numéro vert : ${DNTT_HQ.greenLine}\n• Standard : ${DNTT_HQ.phone}\n• Horaires : ${DNTT_HQ.hours}\n\nVous pouvez aussi ouvrir un ticket dans « Assistance ».`,
    en: () => `**DNTT**\n\n• ${DNTT_HQ.address}\n• Toll-free: ${DNTT_HQ.greenLine}\n• ${DNTT_HQ.phone}`,
  },
  paynow: {
    fr: () => { const d = cbDue('IND-44218'); return d.length ? `**${d[0].id} : ${d[0].from} vers ${d[0].to}**\n\n• Émis le ${fmtD(d[0].issuedAt)} par ${d[0].officer}\n• Échéance : ${fmtD(d[0].due)}\n\n**À régler : ${fmtGNF(d[0].amount)}**\n\nLe plus rapide : « Régler maintenant » puis Orange Money.` : 'Vous n’avez aucun DUT en attente.'; },
    en: () => { const d = cbDue('IND-44218'); return d.length ? `**${d[0].id}: ${fmtGNF(d[0].amount)} to pay**` : 'Nothing pending.'; },
  },
  next: {
    fr: () => `**Prix du DUT : ${fmtEur(TARIFF.priceEur)}**\n\nC’est un prix fixe : il ne dépend ni du trajet ni de la marchandise. Montant payé : ${fmtGNF(TARIFF.priceGnf)}.`,
    en: () => `**STD price: ${fmtEur(TARIFF.priceEur)}**, fixed, whatever the trip.`,
  },
  momo: {
    fr: "**Échec Orange Money : causes fréquentes**\n\n1. Solde insuffisant ? Composez #144#\n2. Plafond journalier atteint\n3. Code secret erroné\n4. Réseau Orange Money en maintenance\n\nVous pouvez aussi enregistrer votre compte dans « Profil et paiement » et autoriser le prélèvement : l’agent DNTT pourra alors régler pour vous.",
    en: "**Orange Money failed**\n\nCheck balance (#144#), daily limit, PIN or network. You can also register your account and authorise the DNTT to debit it.",
  },
  office: {
    fr: () => `**${DNTT_HQ.name}**\n\n• ${DNTT_HQ.address}\n• ${DNTT_HQ.hours}\n• Standard : ${DNTT_HQ.phone}, numéro vert ${DNTT_HQ.greenLine}`,
    en: () => `**DNTT**\n\n• ${DNTT_HQ.address}\n• ${DNTT_HQ.phone}`,
  },
};
const cbText = (id, isFr) => { const r = CHATBOT_RESPONSES[id][isFr ? 'fr' : 'en']; return typeof r === 'function' ? r() : r; };

// Keyword matcher used when no AI backend is available (static hosting).
const CHATBOT_KEYWORDS = {
  rate:    ['prix', 'combien', 'coût', 'cout', 'tarif', 'price', 'cost', 'euro'],
  lookup:  ['plaque', 'plate', 'immatricul', 'vehicule', 'véhicule', 'vehicle'],
  tariff:  ['encaiss', 'espèces', 'especes', 'cash', 'collect', 'prélèvement', 'prelevement'],
  cancel:  ['annul', 'cancel', 'rembours', 'refund'],
  pay:     ['régler', 'regler', 'payer', 'paiement', 'pay', 'facture'],
  fleet:   ['flotte', 'fleet', 'camion', 'truck'],
  invoice: ['suivi', 'suivre', 'jumelage', 'code', 'gps', 'track'],
  agent:   ['agent', 'contact', 'humain', 'human', 'appeler', 'call', 'adresse', 'dntt'],
  paynow:  ['régler', 'regler', 'payer', 'paiement', 'pay', 'attente', 'pending'],
  next:    ['prix', 'combien', 'coût', 'cout', 'tarif', 'price', 'cost'],
  momo:    ['orange', 'momo', 'mobile money', 'échec', 'echec', 'failed'],
  office:  ['bureau', 'office', 'adresse', 'address', 'horaire', 'hours', 'kaloum', 'dntt'],
};

const chatbotLocalAnswer = (q, role, isFr) => {
  const s = q.toLowerCase();
  const ids = CHATBOT_ACTIONS[role].fr.map(a => a.id);
  let best = null, bestScore = 0;
  ids.forEach(id => {
    const score = (CHATBOT_KEYWORDS[id] || []).reduce((n, k) => n + (s.includes(k) ? 1 : 0), 0);
    if (score > bestScore) { best = id; bestScore = score; }
  });
  if (best) return cbText(best, isFr);
  return isFr
    ? "Je n'ai pas encore de réponse précise à cette question pour le moment. Essayez une des actions rapides ci-dessous, ou contactez la DNTT au 1505 (numéro vert)."
    : "I don't have a precise answer to that question yet. Try one of the quick actions below, or call DNTT on 1505 (toll-free).";
};

// Position helpers. A position is stored as an offset from the nearest
// horizontal and vertical edges, so it stays coherent when the app resizes.
const CHATBOT_MARGIN = 12;
const chatbotLayout = (w) => (w <= 620 ? 'phone' : w <= 900 ? 'tablet' : 'desktop');
const chatbotDefaultPos = (layout) => ({ ax: 'right', dx: 22, ay: 'bottom', dy: layout === 'phone' ? 84 : 22 });
const chatbotStoreKey = (role, layout) => `dut-chatbot-pos:${role}:${layout}`;
const chatbotLoad = (role, layout) => {
  try {
    const raw = window.localStorage.getItem(chatbotStoreKey(role, layout));
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p.dx === 'number' && typeof p.dy === 'number') return p;
    }
  } catch (e) {}
  return null;
};
const chatbotSave = (role, layout, pos) => {
  try {
    if (pos) window.localStorage.setItem(chatbotStoreKey(role, layout), JSON.stringify(pos));
    else window.localStorage.removeItem(chatbotStoreKey(role, layout));
  } catch (e) {}
};
const chatbotClamp = (v, min, max) => Math.max(min, Math.min(max, v));

const ChatbotBadge = ({ role = 'company', lang = 'fr' }) => {
  const [open, setOpen] = React.useState(false);
  const [thread, setThread] = React.useState([]); // {who: 'bot'|'user', text}
  const [input, setInput] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const isFr = lang !== 'en';
  const actions = CHATBOT_ACTIONS[role][isFr ? 'fr' : 'en'];
  const scrollRef = React.useRef(null);

  // Drag state
  const layerRef = React.useRef(null);
  const pillRef = React.useRef(null);
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  const [pill, setPill] = React.useState({ w: 132, h: 48 });
  const [pos, setPos] = React.useState(null);        // anchored position (saved)
  const [live, setLive] = React.useState(null);      // {left, top} while dragging
  const [dragging, setDragging] = React.useState(false);
  const dragRef = React.useRef(null);
  const justDragged = React.useRef(false);
  const layout = chatbotLayout(box.w || 1440);

  // Track the size of the app the badge lives in.
  React.useLayoutEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Track the pill size (it changes when the panel opens).
  React.useLayoutEffect(() => {
    const el = pillRef.current;
    if (el) setPill({ w: el.offsetWidth, h: el.offsetHeight });
  }, [open, lang]);

  // Load the saved position for this role and layout.
  React.useEffect(() => {
    if (!box.w) return;
    setPos(chatbotLoad(role, layout));
  }, [role, layout, box.w > 0]);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, pending]);

  // Resolve the pill's top-left corner in layer pixels.
  const maxLeft = Math.max(CHATBOT_MARGIN, box.w - pill.w - CHATBOT_MARGIN);
  const maxTop = Math.max(CHATBOT_MARGIN, box.h - pill.h - CHATBOT_MARGIN);
  let left, top;
  if (live) {
    left = live.left; top = live.top;
  } else {
    const p = pos || chatbotDefaultPos(layout);
    left = p.ax === 'left' ? p.dx : box.w - pill.w - p.dx;
    top = p.ay === 'top' ? p.dy : box.h - pill.h - p.dy;
  }
  left = chatbotClamp(left, CHATBOT_MARGIN, maxLeft);
  top = chatbotClamp(top, CHATBOT_MARGIN, maxTop);

  const toAnchored = (l, t) => {
    const cx = l + pill.w / 2, cy = t + pill.h / 2;
    const right = cx > box.w / 2, bottom = cy > box.h / 2;
    return {
      ax: right ? 'right' : 'left', dx: Math.round(right ? box.w - pill.w - l : l),
      ay: bottom ? 'bottom' : 'top', dy: Math.round(bottom ? box.h - pill.h - t : t),
    };
  };

  const commit = (l, t) => {
    const next = toAnchored(chatbotClamp(l, CHATBOT_MARGIN, maxLeft), chatbotClamp(t, CHATBOT_MARGIN, maxTop));
    setPos(next);
    chatbotSave(role, layout, next);
  };

  const resetPosition = () => {
    setPos(null);
    chatbotSave(role, layout, null);
  };

  // Pointer handlers (mouse, touch, pen). The artboard may be scaled by the
  // design canvas, so screen deltas are divided by the current scale.
  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();
    const layer = layerRef.current;
    if (!layer) return;
    const rect = layer.getBoundingClientRect();
    const scale = layer.offsetWidth ? rect.width / layer.offsetWidth : 1;
    dragRef.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, left, top, scale: scale || 1, moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const mx = e.clientX - d.sx, my = e.clientY - d.sy;
    if (!d.moved && Math.hypot(mx, my) < 5) return;
    if (!d.moved) { d.moved = true; setDragging(true); }
    e.preventDefault();
    setLive({
      left: chatbotClamp(d.left + mx / d.scale, CHATBOT_MARGIN, maxLeft),
      top: chatbotClamp(d.top + my / d.scale, CHATBOT_MARGIN, maxTop),
    });
  };

  const endDrag = (e) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    if (d.moved) {
      const mx = e.clientX - d.sx, my = e.clientY - d.sy;
      commit(d.left + mx / d.scale, d.top + my / d.scale);
      justDragged.current = true;
      setTimeout(() => { justDragged.current = false; }, 0);
    }
    setLive(null);
    setDragging(false);
  };

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 48 : 16;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    e.stopPropagation();
    commit(left + m[0], top + m[1]);
  };

  const greeting = {
    officer: { fr: "Bonjour. Je peux vous aider à émettre, vérifier ou annuler un DUT, ou vous expliquer comment encaisser pour un transporteur. Que voulez-vous faire ?",
               en: "Hello. I can help you issue, verify or cancel an STD, or explain how to collect payment for a transporter. What do you need?" },
    company: { fr: "Bonjour. Je peux régler vos DUT, suivre votre flotte ou vous mettre en relation avec un agent DNTT. Comment puis-je vous aider ?",
               en: "Hello. I can pay your bills, track your fleet or put you in touch with a DNTT agent. How can I help?" },
    individual: { fr: "Bonjour Sékou. Je peux régler votre DUT en attente, vous donner le prix du DUT ou vous aider avec Orange Money. Que souhaitez-vous faire ?",
                  en: "Hi Sékou. I can pay your pending STD, give you the STD price or help with Orange Money. What would you like to do?" },
  };

  const ensureGreeting = () => {
    if (thread.length === 0) {
      setThread([{ who: 'bot', text: greeting[role][isFr ? 'fr' : 'en'] }]);
    }
  };

  const handleAction = (action) => {
    ensureGreeting();
    const userMsg = { who: 'user', text: action.label };
    const botMsg = { who: 'bot', text: cbText(action.id, isFr) };
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
    let text = null;
    if (window.claude && typeof window.claude.complete === 'function') {
      try {
        const sys = `You are a helpful assistant inside the Guinean DUT (Document Unique de Transport) platform, role: ${role}. Respond in ${isFr ? 'French' : 'English'}, in 2 to 4 short sentences, sober institutional tone. The DUT has a fixed price of 10 euros (100 000 GNF). Use GNF currency. Never use the characters em dash, en dash or middle dot.`;
        text = await window.claude.complete({
          messages: [{ role: 'user', content: `${sys}\n\nUser: ${q}` }],
        });
        if (text) text = text.replace(/\s*[\u2014\u2013]\s*/g, ', ').replace(/\s*\u00B7\s*/g, ', ');
      } catch (e) {
        text = null;
      }
    } else {
      await new Promise(r => setTimeout(r, 600));
    }
    setThread(t => [...t, { who: 'bot', text: text || chatbotLocalAnswer(q, role, isFr) }]);
    setPending(false);
  };

  // Panel geometry: opens toward the free side of the screen.
  const panelW = Math.max(240, Math.min(360, box.w - 2 * CHATBOT_MARGIN));
  const onRight = left + pill.w / 2 > box.w / 2;
  const onBottom = top + pill.h / 2 > box.h / 2;
  const panelLeft = chatbotClamp(onRight ? left + pill.w - panelW : left, CHATBOT_MARGIN, Math.max(CHATBOT_MARGIN, box.w - panelW - CHATBOT_MARGIN));
  const space = onBottom ? top - 12 - CHATBOT_MARGIN : box.h - (top + pill.h + 12) - CHATBOT_MARGIN;
  const panelMaxH = Math.max(200, Math.min(520, space));
  const panelStyle = onBottom
    ? { bottom: box.h - top + 12 }
    : { top: top + pill.h + 12 };

  const moveHint = isFr ? 'Glisser pour déplacer' : 'Drag to move';
  const ready = box.w > 0;

  // Render
  return (
    <div ref={layerRef} className="dut-chatbot" style={{
      position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none',
      fontFamily: 'Inter, system-ui, sans-serif', visibility: ready ? 'visible' : 'hidden',
    }}>
      {open && (
        <div role="dialog" aria-label={isFr ? 'Assistant DUT' : 'STD Assistant'} style={{
          position: 'absolute', left: panelLeft, ...panelStyle, width: panelW, maxHeight: panelMaxH,
          background: '#FBF8F2', border: '1px solid #DCD3BD', pointerEvents: 'auto',
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
            {pos && (
              <button onClick={resetPosition} title={isFr ? 'Replacer le bouton à sa position par défaut' : 'Move the button back to its default position'}
                aria-label={isFr ? 'Replacer le bouton' : 'Reset button position'}
                style={{ background: 'transparent', border: 'none', color: '#F7F3EB', cursor: 'pointer', padding: 4, display: 'flex', opacity: .8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>
                </svg>
              </button>
            )}
            <button onClick={() => setOpen(false)} aria-label={isFr ? 'Fermer' : 'Close'} style={{ background: 'transparent', border: 'none', color: '#F7F3EB', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>
            </button>
          </div>

          {/* Body: quick actions if no thread, else messages */}
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
              aria-label={isFr ? 'Votre question' : 'Your question'}
              style={{
                flex: 1, minWidth: 0, padding: '8px 10px', border: '1px solid #E5DDC9', background: '#fff',
                fontFamily: 'inherit', fontSize: 12.5, color: '#161413', outline: 'none', borderRadius: 2,
              }}
              onFocus={e => { e.target.style.borderColor = '#161413'; }}
              onBlur={e => { e.target.style.borderColor = '#E5DDC9'; }}
            />
            <button onClick={handleSend} disabled={!input.trim() || pending} style={{
              padding: '0 12px', background: input.trim() && !pending ? '#161413' : '#DCD3BD',
              color: input.trim() && !pending ? '#FCD116' : '#6B6557',
              border: 'none', cursor: input.trim() && !pending ? 'pointer' : 'default',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 700, letterSpacing: '.04em', borderRadius: 2,
            }}>
              {isFr ? 'ENVOYER' : 'SEND'}
            </button>
          </div>
        </div>
      )}

      {/* Pill (draggable) */}
      <button
        ref={pillRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        onClick={() => {
          if (justDragged.current) return;
          setOpen(o => !o);
          if (!open) ensureGreeting();
        }}
        title={`${open ? (isFr ? 'Fermer l’assistant' : 'Close assistant') : (isFr ? 'Ouvrir l’assistant' : 'Open assistant')}. ${moveHint}.`}
        aria-label={`${open ? (isFr ? 'Fermer l’assistant' : 'Close assistant') : (isFr ? 'Ouvrir l’assistant' : 'Open assistant')}. ${isFr ? 'Flèches du clavier pour déplacer' : 'Arrow keys to move'}.`}
        aria-expanded={open}
        style={{
          position: 'absolute', left, top, pointerEvents: 'auto',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: open ? 0 : '10px 16px 10px 12px',
          width: open ? 48 : 'auto', height: 48,
          background: '#161413', color: '#FCD116',
          border: '1px solid #161413', borderRadius: 24,
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600, letterSpacing: '.02em',
          cursor: dragging ? 'grabbing' : 'grab',
          boxShadow: dragging ? '0 14px 30px -8px rgba(22,20,19,.55)' : '0 6px 18px -6px rgba(22,20,19,.4)',
          transform: dragging ? 'scale(1.04)' : 'none',
          transition: dragging ? 'box-shadow .15s, transform .15s' : 'box-shadow .15s, transform .15s, left .18s ease-out, top .18s ease-out',
          justifyContent: 'center', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
          whiteSpace: 'nowrap',
        }}>
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        ) : (
          <>
            <ChatbotIcon/>
            <span>Assistant</span>
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
  // Convert markdown bold and line breaks to JSX
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 6h16v10H8l-4 4z"/>
    <circle cx="9" cy="11" r="0.8" fill="currentColor"/>
    <circle cx="12" cy="11" r="0.8" fill="currentColor"/>
    <circle cx="15" cy="11" r="0.8" fill="currentColor"/>
  </svg>
);

Object.assign(window, { ChatbotBadge });

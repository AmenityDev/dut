// Inspector mobile app: Android, 4 screens.
// Field-deployed agent at a control point. Photographs plate + goods,
// confirms vehicle passage, syncs to the central DUT system.
// Sober palette (cream + ink + flag accents).

const INS_PALETTE = {
  ink:    '#1A1814',
  cream:  '#F5F0E2',
  paper:  '#FBF8F2',
  rule:   '#DCD3BD',
  muted:  '#6B6557',
  red:    '#C8242C',
  yellow: '#F2C200',
  green:  '#0F8C49',
  faint:  '#9A9281',
  shadow: '#0E0D0C',
};

// ─── Header (consistent across screens) ─────────────────────────
const InsHeader = ({ title, subtitle, online = true, queue }) => (
  <div>
    <div style={{ padding: '12px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: INS_PALETTE.shadow, color: '#FFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
      }}>I</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 10, color: INS_PALETTE.muted, letterSpacing: '.16em', textTransform: 'uppercase', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {queue !== undefined && (
        <div style={{
          fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
          background: INS_PALETTE.shadow, color: '#FFF', fontFamily: '"SF Mono",ui-monospace,monospace',
        }}>{queue} en file</div>
      )}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 9px', borderRadius: 999,
        background: '#FFF', border: `1px solid ${INS_PALETTE.rule}`,
        fontSize: 10.5, fontWeight: 600,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: online ? INS_PALETTE.green : INS_PALETTE.red }}/>
        {online ? 'EN LIGNE' : 'HORS-LIGNE'}
      </div>
    </div>
    <FlagBar height={2}/>
  </div>
);

// ─── Screen 1: Inspector: Queue / today's passages ─────────────
const InspectorScreen1Queue = () => {
  const passages = [
    { plate: 'RC-4582-G',  carrier: 'Diallo & Frères', dut: 'DUT-2026-04-08512', goods: 'Bauxite, 26 t', time: '13:48', status: 'ok' },
    { plate: 'RC-2914-G',  carrier: 'TransAfrica',     dut: 'DUT-2026-04-08501', goods: 'Riz, 480 sacs', time: '12:22', status: 'ok' },
    { plate: 'KA-7821-D',  carrier: 'Conducteur particulier', dut: 'DUT-2026-04-08498', goods: 'Ciment, 12 t', time: '11:14', status: 'ok' },
    { plate: 'RC-1108-G',  carrier: 'GuineExport',     dut: 'DUT introuvable',    goods: 'Café, 8 t',     time: '10:42', status: 'flag' },
    { plate: 'RC-3340-G',  carrier: 'Sangaré Logistique', dut: 'DUT-2026-04-08487', goods: 'Bauxite, 24 t', time: '09:18', status: 'ok' },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: INS_PALETTE.cream,
      color: INS_PALETTE.ink, paddingTop: 38, paddingBottom: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    }}>
      <InsHeader title="Poste de Mambia" subtitle="F. Camara, Agent DNTT 04812" queue={3}/>

      {/* KPI row */}
      <div style={{ padding: '14px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: "Aujourd'hui", value: '12', tone: 'ink' },
          { label: 'Conformes',   value: '11', tone: 'green' },
          { label: 'Anomalies',   value: '1',  tone: 'red' },
        ].map((k, i) => (
          <div key={i} style={{ padding: '10px 12px', background: INS_PALETTE.paper, border: `1px solid ${INS_PALETTE.rule}`, borderRadius: 10 }}>
            <div style={{ fontSize: 9, color: INS_PALETTE.muted, letterSpacing: '.18em', textTransform: 'uppercase' }}>{k.label}</div>
            <div style={{
              fontSize: 22, fontWeight: 700, marginTop: 2,
              fontFamily: '"SF Mono",ui-monospace,monospace',
              color: k.tone === 'green' ? INS_PALETTE.green : k.tone === 'red' ? INS_PALETTE.red : INS_PALETTE.ink,
            }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Passage list */}
      <div style={{ padding: '14px 18px 0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ fontSize: 10.5, color: INS_PALETTE.muted, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 8 }}>
          Derniers passages
        </div>
        <div style={{
          flex: 1, background: INS_PALETTE.paper, border: `1px solid ${INS_PALETTE.rule}`,
          borderRadius: 14, overflow: 'auto',
        }}>
          {passages.map((p, i) => (
            <div key={i} style={{
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: i < passages.length - 1 ? `1px solid ${INS_PALETTE.rule}aa` : 'none',
            }}>
              <div style={{
                width: 50, padding: '5px 0',
                background: '#FFF', border: `1.5px solid ${INS_PALETTE.shadow}`,
                borderRadius: 4, textAlign: 'center',
                fontSize: 10, fontWeight: 700, fontFamily: '"SF Mono",ui-monospace,monospace',
                letterSpacing: '.04em', flexShrink: 0,
              }}>{p.plate}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.carrier}
                </div>
                <div style={{ fontSize: 10.5, color: INS_PALETTE.muted, fontFamily: '"SF Mono",ui-monospace,monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.dut}
                </div>
                <div style={{ fontSize: 10.5, color: INS_PALETTE.muted, marginTop: 1 }}>
                  {p.goods}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontSize: 10.5, color: INS_PALETTE.muted, fontFamily: '"SF Mono",ui-monospace,monospace' }}>{p.time}</div>
                {p.status === 'ok' ? (
                  <div style={{ width: 20, height: 20, borderRadius: 999, background: INS_PALETTE.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={11} stroke={3} style={{ color: '#FFF' }}/>
                  </div>
                ) : (
                  <div style={{ width: 20, height: 20, borderRadius: 999, background: INS_PALETTE.red, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 11, fontWeight: 700 }}>!</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capture FAB */}
      <div style={{ padding: '14px 18px 0' }}>
        <button style={{
          width: '100%', height: 56, borderRadius: 14, border: 'none',
          background: INS_PALETTE.shadow, color: '#FFF',
          fontSize: 14.5, fontWeight: 600, letterSpacing: '.02em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 4px 14px rgba(0,0,0,.18)',
        }}>
          <Icon name="camera" size={18} stroke={2}/>
          Enregistrer un passage
        </button>
      </div>
    </div>
  );
};

// ─── Screen 2: Inspector: Plate capture (camera viewfinder) ────
const InspectorScreen2Plate = () => (
  <div style={{
    width: '100%', height: '100%', background: '#0A0908',
    color: '#FFF', paddingTop: 38, paddingBottom: 28,
    display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  }}>
    {/* Header on dark */}
    <div style={{ padding: '12px 18px 10px', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 2 }}>
      <button style={{
        width: 36, height: 36, borderRadius: 999,
        background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)',
        color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)',
      }}>
        <Icon name="chev" size={16} stroke={2.4} style={{ transform: 'rotate(180deg)' }}/>
      </button>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Étape 1 / 3 : plaque</div>
      <div style={{
        padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,.12)',
        border: '1px solid rgba(255,255,255,.18)', fontSize: 10.5, fontWeight: 600, letterSpacing: '.04em',
      }}>13:48</div>
    </div>

    {/* Faux dashcam scene background: gradient road + horizon */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg,#1B1A18 0%,#26241F 35%,#3B342A 60%,#5C5141 80%,#7A6951 100%)',
    }}/>
    {/* Tarmac perspective lines */}
    <svg viewBox="0 0 412 600" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: .35, mixBlendMode: 'screen' }}>
      <path d="M0 600 L160 200 L252 200 L412 600 Z" fill="#000"/>
      <path d="M196 200 L196 600" stroke="#F2C200" strokeWidth="6" strokeDasharray="20 20"/>
      <path d="M216 200 L216 600" stroke="#F2C200" strokeWidth="6" strokeDasharray="20 20"/>
    </svg>

    {/* Truck silhouette */}
    <div style={{
      position: 'absolute', left: '50%', bottom: 220, transform: 'translateX(-50%)',
      width: 260, height: 130, opacity: .85,
    }}>
      <svg viewBox="0 0 260 130" width="100%" height="100%">
        <rect x="14" y="22" width="158" height="74" rx="4" fill="#2A2A2A" stroke="#000"/>
        <rect x="172" y="46" width="62" height="50" rx="4" fill="#1F1F1F" stroke="#000"/>
        <rect x="184" y="56" width="38" height="22" rx="2" fill="#62666B"/>
        <circle cx="50"  cy="104" r="14" fill="#0F0F0F" stroke="#000" strokeWidth="2"/>
        <circle cx="120" cy="104" r="14" fill="#0F0F0F" stroke="#000" strokeWidth="2"/>
        <circle cx="200" cy="104" r="14" fill="#0F0F0F" stroke="#000" strokeWidth="2"/>
        {/* Plate */}
        <rect x="184" y="86" width="44" height="12" fill="#FFF" stroke="#000"/>
      </svg>
    </div>

    {/* Plate detection overlay */}
    <div style={{
      position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)',
      width: 240, height: 80, borderRadius: 8,
      border: `2.5px solid ${INS_PALETTE.yellow}`,
      boxShadow: '0 0 0 9999px rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(255,255,255,.06)',
    }}>
      {/* Corner marks */}
      {[
        { top: -8,  left: -8,  borderTop: 3, borderLeft: 3 },
        { top: -8,  right: -8, borderTop: 3, borderRight: 3 },
        { bottom: -8, left: -8, borderBottom: 3, borderLeft: 3 },
        { bottom: -8, right: -8, borderBottom: 3, borderRight: 3 },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', width: 22, height: 22,
          borderTop: c.borderTop ? `${c.borderTop}px solid #F2C200` : 'none',
          borderLeft: c.borderLeft ? `${c.borderLeft}px solid #F2C200` : 'none',
          borderRight: c.borderRight ? `${c.borderRight}px solid #F2C200` : 'none',
          borderBottom: c.borderBottom ? `${c.borderBottom}px solid #F2C200` : 'none',
          ...c,
        }}/>
      ))}

      <div style={{
        fontFamily: '"SF Mono",ui-monospace,monospace',
        fontSize: 30, fontWeight: 800, color: '#FFF',
        letterSpacing: '.08em', textShadow: '0 0 8px rgba(0,0,0,.6)',
      }}>RC-4582-G</div>
    </div>

    {/* Detection chip */}
    <div style={{
      position: 'absolute', left: '50%', top: 'calc(46% + 60px)', transform: 'translateX(-50%)',
      padding: '6px 12px', background: INS_PALETTE.yellow, color: INS_PALETTE.shadow,
      fontSize: 11, fontWeight: 700, letterSpacing: '.06em', borderRadius: 4,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: INS_PALETTE.shadow }}/>
      DÉTECTÉ (97 %)
    </div>

    {/* Bottom info card */}
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 48,
      background: 'rgba(20,18,14,.85)',
      border: '1px solid rgba(255,255,255,.10)', borderRadius: 14,
      backdropFilter: 'blur(20px)', padding: '14px 14px',
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', letterSpacing: '.22em', textTransform: 'uppercase' }}>
        DUT correspondant trouvé
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Diallo &amp; Frères, Bauxite 26 t</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontFamily: '"SF Mono",ui-monospace,monospace', marginTop: 2 }}>
        DUT-2026-04-08512, Kamsar → Conakry
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button style={{
          flex: 1, height: 42, borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.18)', color: '#FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icon name="search" size={13} stroke={2}/>Saisie manuelle
        </button>
        <button style={{
          flex: 1.4, height: 42, borderRadius: 10, fontSize: 12.5, fontWeight: 700,
          background: INS_PALETTE.yellow, border: 'none', color: INS_PALETTE.shadow,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          Confirmer la plaque
          <Icon name="arrow" size={13} stroke={2.4}/>
        </button>
      </div>
    </div>

    {/* Step pill bottom */}
    <div style={{
      position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 6,
    }}>
      <div style={{ width: 22, height: 4, borderRadius: 999, background: INS_PALETTE.yellow }}/>
      <div style={{ width: 22, height: 4, borderRadius: 999, background: 'rgba(255,255,255,.25)' }}/>
      <div style={{ width: 22, height: 4, borderRadius: 999, background: 'rgba(255,255,255,.25)' }}/>
    </div>
  </div>
);

// ─── Screen 3: Inspector: Goods verification (review step) ─────
const InspectorScreen3Goods = () => (
  <div style={{
    width: '100%', height: '100%', background: INS_PALETTE.cream,
    color: INS_PALETTE.ink, paddingTop: 38, paddingBottom: 28,
    display: 'flex', flexDirection: 'column',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  }}>
    {/* Header */}
    <div style={{ padding: '12px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <button style={{
        width: 32, height: 32, borderRadius: 999,
        background: '#FFF', border: `1px solid ${INS_PALETTE.rule}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="chev" size={14} stroke={2.4} style={{ transform: 'rotate(180deg)', color: INS_PALETTE.ink }}/>
      </button>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Étape 2 / 3 : marchandise</div>
      <DriverPill dot={INS_PALETTE.green}>EN LIGNE</DriverPill>
    </div>
    <FlagBar height={2}/>

    {/* Step indicator */}
    <div style={{ padding: '14px 18px 0', display: 'flex', gap: 6 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 999, background: INS_PALETTE.green }}/>
      <div style={{ flex: 1, height: 4, borderRadius: 999, background: INS_PALETTE.yellow }}/>
      <div style={{ flex: 1, height: 4, borderRadius: 999, background: INS_PALETTE.rule }}/>
    </div>

    {/* DUT context card */}
    <div style={{ padding: '14px 18px 0' }}>
      <div style={{
        padding: '12px 14px', background: '#FFF', border: `1px solid ${INS_PALETTE.rule}`,
        borderRadius: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 60, padding: '4px 0',
            background: '#FFF', border: `1.5px solid ${INS_PALETTE.shadow}`,
            borderRadius: 4, textAlign: 'center',
            fontSize: 10.5, fontWeight: 700, fontFamily: '"SF Mono",ui-monospace,monospace',
            letterSpacing: '.04em',
          }}>RC-4582-G</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Diallo &amp; Frères</div>
            <div style={{ fontSize: 10.5, color: INS_PALETTE.muted, fontFamily: '"SF Mono",ui-monospace,monospace' }}>
              DUT-2026-04-08512
            </div>
          </div>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: INS_PALETTE.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={12} stroke={3} style={{ color: '#FFF' }}/>
          </div>
        </div>
      </div>
    </div>

    {/* Photo capture grid */}
    <div style={{ padding: '14px 18px 0' }}>
      <div style={{ fontSize: 10.5, color: INS_PALETTE.muted, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 8 }}>
        Photos de la marchandise
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {/* Photo 1: filled */}
        <div style={{
          aspectRatio: '4 / 3', borderRadius: 10, overflow: 'hidden',
          border: `1px solid ${INS_PALETTE.rule}`, position: 'relative',
          background: 'linear-gradient(135deg, #6B5A3F 0%, #8A7553 50%, #A78B66 100%)',
        }}>
          {/* Faux bauxite pile */}
          <svg viewBox="0 0 100 75" width="100%" height="100%" style={{ display: 'block' }}>
            <rect width="100" height="75" fill="#7A6952"/>
            <path d="M0 60 L20 38 L40 50 L60 32 L80 46 L100 30 L100 75 L0 75 Z" fill="#5A4A33"/>
            <path d="M0 70 L100 70" stroke="#3A2F20" strokeWidth=".5"/>
            <circle cx="22" cy="42" r="2" fill="#3A2F20"/>
            <circle cx="58" cy="36" r="2.5" fill="#3A2F20"/>
            <circle cx="82" cy="50" r="1.8" fill="#3A2F20"/>
          </svg>
          <div style={{
            position: 'absolute', top: 6, left: 6, padding: '2px 6px',
            background: 'rgba(0,0,0,.55)', color: '#FFF', borderRadius: 4,
            fontSize: 9, fontWeight: 600, letterSpacing: '.06em',
          }}>13:48, BENNE</div>
        </div>
        {/* Photo 2: filled */}
        <div style={{
          aspectRatio: '4 / 3', borderRadius: 10, overflow: 'hidden',
          border: `1px solid ${INS_PALETTE.rule}`, position: 'relative',
          background: 'linear-gradient(180deg, #4A4540 0%, #6B6358 100%)',
        }}>
          <svg viewBox="0 0 100 75" width="100%" height="100%" style={{ display: 'block' }}>
            <rect width="100" height="75" fill="#5C5044"/>
            <rect x="10" y="20" width="80" height="40" rx="2" fill="#9C8966"/>
            <rect x="10" y="20" width="80" height="6" fill="#7E6E55"/>
            <rect x="10" y="55" width="80" height="5" fill="#7E6E55"/>
            <text x="50" y="44" fontFamily="monospace" fontSize="10" fill="#3A2F20" textAnchor="middle" fontWeight="bold">SCEAU 0341</text>
          </svg>
          <div style={{
            position: 'absolute', top: 6, left: 6, padding: '2px 6px',
            background: 'rgba(0,0,0,.55)', color: '#FFF', borderRadius: 4,
            fontSize: 9, fontWeight: 600, letterSpacing: '.06em',
          }}>13:49, SCEAU</div>
        </div>
        {/* Add slot */}
        <button style={{
          aspectRatio: '4 / 3', borderRadius: 10, border: `1.5px dashed ${INS_PALETTE.rule}`,
          background: INS_PALETTE.paper, color: INS_PALETTE.muted,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          <Icon name="camera" size={20} stroke={1.6}/>
          <span style={{ fontSize: 11, fontWeight: 600 }}>Ajouter</span>
        </button>
        {/* Empty 4th */}
        <div style={{
          aspectRatio: '4 / 3', borderRadius: 10, border: `1px solid ${INS_PALETTE.rule}`,
          background: INS_PALETTE.paper,
        }}/>
      </div>
    </div>

    {/* Conformity check */}
    <div style={{ padding: '14px 18px 0' }}>
      <div style={{ fontSize: 10.5, color: INS_PALETTE.muted, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 8 }}>
        Conformité
      </div>
      <div style={{ background: '#FFF', border: `1px solid ${INS_PALETTE.rule}`, borderRadius: 12, overflow: 'hidden' }}>
        {[
          { label: 'Marchandise déclarée',     value: 'Bauxite, 26 t',      ok: true },
          { label: 'Sceau intact',             value: 'Sceau 0341',          ok: true },
          { label: 'Quantité visuelle',        value: 'Conforme',            ok: true },
          { label: 'Itinéraire',               value: 'Kamsar → Conakry',    ok: true },
        ].map((r, i, arr) => (
          <div key={i} style={{
            padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10,
            borderBottom: i < arr.length - 1 ? `1px solid ${INS_PALETTE.rule}aa` : 'none',
          }}>
            <div style={{ width: 18, height: 18, borderRadius: 999, background: r.ok ? INS_PALETTE.green : INS_PALETTE.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="check" size={10} stroke={3} style={{ color: '#FFF' }}/>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: INS_PALETTE.muted }}>{r.label}</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{r.value}</div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ flex: 1 }}/>

    {/* CTA */}
    <div style={{ padding: '14px 18px 0', display: 'flex', gap: 8 }}>
      <button style={{
        flex: 1, height: 48, borderRadius: 12,
        background: '#FFF', border: `1px solid ${INS_PALETTE.rule}`,
        color: INS_PALETTE.red, fontSize: 13, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Icon name="alert" size={14} stroke={2}/>Anomalie
      </button>
      <button style={{
        flex: 1.6, height: 48, borderRadius: 12,
        background: INS_PALETTE.shadow, border: 'none', color: '#FFF',
        fontSize: 13, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        Valider passage
        <Icon name="arrow" size={14} stroke={2.2}/>
      </button>
    </div>
  </div>
);

// ─── Screen 4: Inspector: Confirmation receipt ─────────────────
const InspectorScreen4Confirm = () => (
  <div style={{
    width: '100%', height: '100%', background: INS_PALETTE.cream,
    color: INS_PALETTE.ink, paddingTop: 38, paddingBottom: 28,
    display: 'flex', flexDirection: 'column',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  }}>
    <InsHeader title="Passage validé" subtitle="Étape 3 / 3 : synchronisé"/>

    {/* Hero confirmation */}
    <div style={{ padding: '24px 18px 0', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 999, background: INS_PALETTE.green,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 0 8px ${INS_PALETTE.green}22`,
      }}>
        <Icon name="check" size={34} stroke={3} style={{ color: '#FFF' }}/>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 14 }}>Passage enregistré</div>
      <div style={{ fontSize: 12, color: INS_PALETTE.muted, marginTop: 4 }}>
        Le conducteur et le bureau central ont été notifiés.
      </div>
    </div>

    {/* Receipt card */}
    <div style={{ padding: '20px 18px 0' }}>
      <div style={{
        padding: '14px 16px', background: INS_PALETTE.paper, border: `1px solid ${INS_PALETTE.rule}`,
        borderRadius: 14, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 2, display: 'flex' }}>
          <div style={{ flex: 1, background: INS_PALETTE.red }}/>
          <div style={{ flex: 1, background: INS_PALETTE.yellow }}/>
          <div style={{ flex: 1, background: INS_PALETTE.green }}/>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8 }}>
          <div style={{
            width: 64, padding: '5px 0',
            background: '#FFF', border: `1.5px solid ${INS_PALETTE.shadow}`,
            borderRadius: 4, textAlign: 'center',
            fontSize: 11, fontWeight: 700, fontFamily: '"SF Mono",ui-monospace,monospace',
            letterSpacing: '.04em',
          }}>RC-4582-G</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Diallo &amp; Frères</div>
            <div style={{ fontSize: 11, color: INS_PALETTE.muted }}>Bauxite, 26 t, Sceau 0341</div>
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${INS_PALETTE.rule}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { k: 'DUT',         v: 'DUT-2026-04-08512', mono: true },
            { k: 'Poste',       v: 'Mambia' },
            { k: 'Agent',       v: 'F. Camara, 04812' },
            { k: 'Heure',       v: '13:50:14',  mono: true },
            { k: 'Itinéraire',  v: 'Kamsar → Conakry' },
            { k: 'Réf passage', v: 'PSG-MBA-22894', mono: true },
          ].map((r, i) => (
            <div key={i}>
              <div style={{ fontSize: 9, color: INS_PALETTE.muted, letterSpacing: '.18em', textTransform: 'uppercase' }}>{r.k}</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 2, fontFamily: r.mono ? '"SF Mono",ui-monospace,monospace' : 'inherit' }}>
                {r.v}
              </div>
            </div>
          ))}
        </div>

        {/* Mini sync confirmation */}
        <div style={{
          marginTop: 14, padding: '8px 12px',
          background: '#FFF', border: `1px solid ${INS_PALETTE.rule}`, borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: INS_PALETTE.green }}/>
          <span style={{ fontSize: 11, color: INS_PALETTE.muted }}>Synchronisé, 0 en attente</span>
          <span style={{ marginLeft: 'auto', fontSize: 10.5, color: INS_PALETTE.muted, fontFamily: '"SF Mono",ui-monospace,monospace' }}>1.4 KB</span>
        </div>
      </div>
    </div>

    <div style={{ flex: 1 }}/>

    {/* CTAs */}
    <div style={{ padding: '14px 18px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button style={{
        width: '100%', height: 52, borderRadius: 12, border: 'none',
        background: INS_PALETTE.shadow, color: '#FFF',
        fontSize: 14, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <Icon name="camera" size={16} stroke={2}/>
        Enregistrer un autre passage
      </button>
      <button style={{
        width: '100%', height: 44, borderRadius: 12,
        background: 'transparent', border: 'none',
        color: INS_PALETTE.muted, fontSize: 12.5, fontWeight: 600,
      }}>
        Retour à la file
      </button>
    </div>
  </div>
);

Object.assign(window, {
  INS_PALETTE, InsHeader,
  InspectorScreen1Queue, InspectorScreen2Plate, InspectorScreen3Goods, InspectorScreen4Confirm,
});

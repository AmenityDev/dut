// Driver mobile app: Android, 4 screens.
// Pairs with the carrier's DUT account and tracks the truck's trip in real time.
// Sober palette to match the desktop platform.

const DRIVER_PALETTE = {
  ink:    '#1A1814',
  cream:  '#F5F0E2',
  paper:  '#FBF8F2',
  rule:   '#DCD3BD',
  muted:  '#6B6557',
  red:    '#C8242C',
  yellow: '#F2C200',
  green:  '#0F8C49',
  faint:  '#9A9281',
};

// ─── Status pill (top of screen, under status bar) ──────────────
const DriverPill = ({ children, color = DRIVER_PALETTE.ink, bg = '#FFFFFF', icon, dot }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 10px', borderRadius: 999,
    background: bg, color, fontSize: 11, fontWeight: 600,
    letterSpacing: '.04em', border: `1px solid ${DRIVER_PALETTE.rule}`,
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: dot }}/>}
    {icon && <Icon name={icon} size={12} stroke={2}/>}
    {children}
  </div>
);

// ─── Screen 1: Driver: pair / setup with carrier ──────────────
const DriverScreen1Setup = () => (
  <div style={{
    width: '100%', height: '100%', background: DRIVER_PALETTE.cream,
    color: DRIVER_PALETTE.ink, paddingTop: 38, paddingBottom: 28,
    display: 'flex', flexDirection: 'column',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  }}>
    {/* Brand header */}
    <div style={{ padding: '14px 22px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <SealEmblem size={34}/>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.04em' }}>DUT, Conducteur</div>
        <div style={{ fontSize: 9.5, color: DRIVER_PALETTE.muted, letterSpacing: '.18em', textTransform: 'uppercase' }}>
          République de Guinée, DNTT
        </div>
      </div>
    </div>
    <FlagBar height={2}/>

    <div style={{ flex: 1, padding: '32px 24px 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 11, color: DRIVER_PALETTE.muted, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 12 }}>
        Pas d'appareil lié
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.18, marginBottom: 10, letterSpacing: '-.01em' }}>
        Liez ce téléphone au camion
      </div>
      <div style={{ fontSize: 13.5, color: DRIVER_PALETTE.muted, lineHeight: 1.5 }}>
        Le transporteur génère un code à 6 chiffres depuis son espace, puis vous le saisissez ici. Ce téléphone deviendra l'unité de suivi du véhicule.
      </div>

      {/* Code input */}
      <div style={{ marginTop: 28, padding: 18, background: DRIVER_PALETTE.paper, border: `1px solid ${DRIVER_PALETTE.rule}`, borderRadius: 14 }}>
        <div style={{ fontSize: 10.5, color: DRIVER_PALETTE.muted, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 12 }}>
          Code de jumelage
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {['4','7','2','8','-','-'].map((c, i) => (
            <div key={i} style={{
              flex: 1, height: 48, border: `1px solid ${i < 4 ? DRIVER_PALETTE.ink : DRIVER_PALETTE.rule}`,
              background: '#FFF', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, fontFamily: '"SF Mono",ui-monospace,monospace',
              color: i < 4 ? DRIVER_PALETTE.ink : DRIVER_PALETTE.rule,
            }}>{c}</div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '8px 12px', background: '#FFF', border: `1px dashed ${DRIVER_PALETTE.rule}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="qr" size={14} stroke={2}/>
          <span style={{ fontSize: 11.5, color: DRIVER_PALETTE.muted }}>ou scanner le QR depuis l'espace transporteur</span>
        </div>
      </div>

      {/* Vehicle preview */}
      <div style={{ marginTop: 16, padding: 14, background: '#FFF', border: `1px solid ${DRIVER_PALETTE.rule}`, borderRadius: 12 }}>
        <div style={{ fontSize: 10, color: DRIVER_PALETTE.muted, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 6 }}>
          Détecté
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: DRIVER_PALETTE.cream, border: `1px solid ${DRIVER_PALETTE.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="truck" size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Diallo &amp; Frères, Renault Kerax</div>
            <div style={{ fontSize: 11, color: DRIVER_PALETTE.muted, fontFamily: '"SF Mono",ui-monospace,monospace' }}>RC-4582-G, 26 t</div>
          </div>
          <Icon name="check" size={16} style={{ color: DRIVER_PALETTE.green }}/>
        </div>
      </div>
    </div>

    {/* CTA */}
    <div style={{ padding: '18px 24px 8px' }}>
      <button style={{
        width: '100%', height: 52, borderRadius: 12, border: 'none',
        background: DRIVER_PALETTE.ink, color: '#FFF',
        fontSize: 14, fontWeight: 600, letterSpacing: '.02em',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,.12)',
      }}>
        Lier ce téléphone au camion
        <Icon name="arrow" size={14} stroke={2.2}/>
      </button>
    </div>
  </div>
);

// ─── Screen 2: Driver: Active trip with live tracking ───────────
const DriverScreen2Trip = () => {
  const checkpoints = [
    { city: 'Kamsar',         time: '06:14', state: 'done', detail: 'Départ, DUT activé' },
    { city: 'Boké',           time: '08:02', state: 'done', detail: 'DNTT contrôle, plaque scannée par F. Camara' },
    { city: 'Boffa',          time: '10:48', state: 'done', detail: 'Passage automatique (GPS)' },
    { city: 'Kindia',         time: '13:22', state: 'current', detail: 'En route vers Coyah, 64 km' },
    { city: 'Coyah',          time: '-',     state: 'pending', detail: 'Contrôle prévu' },
    { city: 'Conakry, Port', time: '-',     state: 'pending', detail: 'Destination' },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: DRIVER_PALETTE.cream,
      color: DRIVER_PALETTE.ink, paddingTop: 38, paddingBottom: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    }}>
      {/* Top bar */}
      <div style={{ padding: '12px 18px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: DRIVER_PALETTE.ink, color: '#FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
        }}>D</div>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Trajet en cours</div>
        <DriverPill dot={DRIVER_PALETTE.green}>EN LIGNE</DriverPill>
      </div>
      <FlagBar height={2}/>

      {/* DUT chip */}
      <div style={{ padding: '12px 18px 0' }}>
        <div style={{
          padding: '12px 14px', background: '#FFF', border: `1px solid ${DRIVER_PALETTE.rule}`,
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: DRIVER_PALETTE.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${DRIVER_PALETTE.rule}` }}>
            <Icon name="doc" size={18}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: DRIVER_PALETTE.muted, letterSpacing: '.18em', textTransform: 'uppercase' }}>
              DUT actif
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: '"SF Mono",ui-monospace,monospace' }}>
              DUT-2026-04-08512
            </div>
            <div style={{ fontSize: 11, color: DRIVER_PALETTE.muted }}>Bauxite, 26 t, Kamsar → Conakry</div>
          </div>
          <Icon name="qr" size={22} stroke={1.6}/>
        </div>
      </div>

      {/* Schematic route */}
      <div style={{ padding: '14px 18px 0', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 10.5, color: DRIVER_PALETTE.muted, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 10 }}>
          Itinéraire, 372 km
        </div>
        <div style={{
          flex: 1, padding: '14px 12px', background: DRIVER_PALETTE.paper,
          border: `1px solid ${DRIVER_PALETTE.rule}`, borderRadius: 14,
          overflow: 'auto', position: 'relative',
        }}>
          {checkpoints.map((cp, i) => {
            const isLast = i === checkpoints.length - 1;
            const dotColor =
              cp.state === 'done'    ? DRIVER_PALETTE.green :
              cp.state === 'current' ? DRIVER_PALETTE.red :
              DRIVER_PALETTE.faint;
            const lineColor =
              cp.state === 'done' ? DRIVER_PALETTE.green :
              cp.state === 'current' ? DRIVER_PALETTE.faint :
              DRIVER_PALETTE.faint;
            return (
              <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                {/* Rail */}
                <div style={{ width: 18, position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: 999,
                    background: cp.state === 'pending' ? '#FFF' : dotColor,
                    border: `2px solid ${dotColor}`,
                    margin: '4px 3px', position: 'relative', zIndex: 1,
                    boxShadow: cp.state === 'current' ? `0 0 0 4px ${DRIVER_PALETTE.red}22` : 'none',
                  }}/>
                  {!isLast && (
                    <div style={{
                      position: 'absolute', left: 8, top: 16, bottom: -10,
                      width: 2, background: lineColor,
                      borderLeft: cp.state === 'pending' ? `2px dashed ${lineColor}` : 'none',
                      backgroundColor: cp.state === 'pending' ? 'transparent' : lineColor,
                    }}/>
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: isLast ? 0 : 14 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{cp.city}</div>
                    <div style={{ fontSize: 11, color: DRIVER_PALETTE.muted, fontFamily: '"SF Mono",ui-monospace,monospace', marginLeft: 'auto' }}>{cp.time}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: cp.state === 'current' ? DRIVER_PALETTE.ink : DRIVER_PALETTE.muted, lineHeight: 1.4, marginTop: 2 }}>
                    {cp.detail}
                  </div>
                  {cp.state === 'current' && (
                    <div style={{ marginTop: 6, fontSize: 10.5, fontFamily: '"SF Mono",ui-monospace,monospace', color: DRIVER_PALETTE.muted }}>
                      9°44'21" N, 13°02'08" W, 62 km/h
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer pings */}
      <div style={{
        margin: '12px 18px 0', padding: '10px 14px',
        background: '#FFF', border: `1px solid ${DRIVER_PALETTE.rule}`, borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: DRIVER_PALETTE.green }}/>
        <span style={{ color: DRIVER_PALETTE.muted }}>GPS, 1 ping / 30 s</span>
        <span style={{ marginLeft: 'auto', color: DRIVER_PALETTE.muted, fontFamily: '"SF Mono",ui-monospace,monospace' }}>Dernier, 13:21:42</span>
      </div>
    </div>
  );
};

// ─── Screen 3: Driver: Offline mode with sync queue ───────────
const DriverScreen3Offline = () => {
  const queue = [
    { kind: 'GPS',     ts: '13:48:02', detail: '9°41\'18" N, 12°58\'42" W, 58 km/h' },
    { kind: 'GPS',     ts: '13:47:32', detail: '9°41\'02" N, 12°58\'31" W, 60 km/h' },
    { kind: 'GPS',     ts: '13:47:02', detail: '9°40\'48" N, 12°58\'18" W, 61 km/h' },
    { kind: 'EVENT',   ts: '13:46:14', detail: 'Passage Mambia, plaque lue (auto)' },
    { kind: 'GPS',     ts: '13:46:02', detail: '9°40\'21" N, 12°58\'02" W, 59 km/h' },
    { kind: 'GPS',     ts: '13:45:32', detail: '9°40\'02" N, 12°57\'48" W, 62 km/h' },
    { kind: 'GPS',     ts: '13:45:02', detail: '9°39\'42" N, 12°57\'31" W, 64 km/h' },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: DRIVER_PALETTE.cream,
      color: DRIVER_PALETTE.ink, paddingTop: 38, paddingBottom: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    }}>
      <div style={{ padding: '12px 18px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: DRIVER_PALETTE.ink, color: '#FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
        }}>D</div>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Mode hors-ligne</div>
        <DriverPill dot={DRIVER_PALETTE.red} bg="#FFFBEA" color={DRIVER_PALETTE.ink}>HORS-LIGNE</DriverPill>
      </div>
      <FlagBar height={2}/>

      {/* Status banner */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{
          padding: '14px 14px', background: '#FFF8E0', border: `1px solid ${DRIVER_PALETTE.yellow}66`,
          borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{ marginTop: 2 }}>
            <Icon name="alert" size={18} style={{ color: '#8A6700' }}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#5A4500' }}>Aucun réseau depuis 14 min</div>
            <div style={{ fontSize: 11.5, color: '#7A5C00', marginTop: 3, lineHeight: 1.45 }}>
              Le suivi GPS continue localement. Les positions seront envoyées dès que le réseau revient.
            </div>
          </div>
        </div>
      </div>

      {/* Queue card */}
      <div style={{ padding: '14px 18px 0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 10.5, color: DRIVER_PALETTE.muted, letterSpacing: '.22em', textTransform: 'uppercase' }}>
            File de synchronisation
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '3px 10px', background: DRIVER_PALETTE.ink, color: '#FFF', borderRadius: 999, fontFamily: '"SF Mono",ui-monospace,monospace' }}>
            87 en attente
          </div>
        </div>
        <div style={{
          flex: 1, background: DRIVER_PALETTE.paper, border: `1px solid ${DRIVER_PALETTE.rule}`,
          borderRadius: 14, overflow: 'auto',
        }}>
          {queue.map((q, i) => (
            <div key={i} style={{
              padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: i < queue.length - 1 ? `1px solid ${DRIVER_PALETTE.rule}aa` : 'none',
            }}>
              <span style={{
                fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                background: q.kind === 'EVENT' ? DRIVER_PALETTE.ink : '#FFF',
                color: q.kind === 'EVENT' ? '#FFF' : DRIVER_PALETTE.muted,
                border: q.kind === 'EVENT' ? 'none' : `1px solid ${DRIVER_PALETTE.rule}`,
                letterSpacing: '.08em', minWidth: 44, textAlign: 'center',
              }}>{q.kind}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: DRIVER_PALETTE.ink, fontFamily: '"SF Mono",ui-monospace,monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {q.detail}
                </div>
              </div>
              <div style={{ fontSize: 10.5, color: DRIVER_PALETTE.muted, fontFamily: '"SF Mono",ui-monospace,monospace' }}>{q.ts}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '14px 18px 0' }}>
        <button style={{
          width: '100%', height: 48, borderRadius: 12,
          background: '#FFF', border: `1px solid ${DRIVER_PALETTE.rule}`,
          color: DRIVER_PALETTE.muted, fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon name="reload" size={14} stroke={2}/>
          Tenter une synchronisation
        </button>
      </div>
    </div>
  );
};

// ─── Screen 4: Driver: Trip recap (after passage confirmed) ────
const DriverScreen4Recap = () => (
  <div style={{
    width: '100%', height: '100%', background: DRIVER_PALETTE.cream,
    color: DRIVER_PALETTE.ink, paddingTop: 38, paddingBottom: 28,
    display: 'flex', flexDirection: 'column',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  }}>
    <div style={{ padding: '12px 18px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: DRIVER_PALETTE.ink, color: '#FFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
      }}>D</div>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Trajet</div>
      <DriverPill dot={DRIVER_PALETTE.green}>TERMINÉ</DriverPill>
    </div>
    <FlagBar height={2}/>

    {/* Hero: passage confirmation */}
    <div style={{ padding: '20px 18px 0' }}>
      <div style={{
        padding: '20px 18px', background: '#FFF',
        border: `1px solid ${DRIVER_PALETTE.rule}`, borderRadius: 14,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, display: 'flex' }}>
          <div style={{ flex: 1, background: DRIVER_PALETTE.red }}/>
          <div style={{ flex: 1, background: DRIVER_PALETTE.yellow }}/>
          <div style={{ flex: 1, background: DRIVER_PALETTE.green }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: DRIVER_PALETTE.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={20} stroke={2.6} style={{ color: '#FFF' }}/>
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: DRIVER_PALETTE.muted, letterSpacing: '.22em', textTransform: 'uppercase' }}>
              Passage confirmé
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Arrivée Conakry, Port</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: DRIVER_PALETTE.muted, lineHeight: 1.5 }}>
          DUT-2026-04-08512, clôturé par l'agent F. Camara, 17:42
        </div>
      </div>
    </div>

    {/* Stats grid */}
    <div style={{ padding: '14px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {[
        { label: 'Distance',         value: '372 km',     mono: true },
        { label: 'Durée totale',     value: '11 h 28',    mono: true },
        { label: 'Contrôles',        value: '4',          mono: true },
        { label: 'Pings GPS',        value: '1 384',      mono: true },
      ].map((s, i) => (
        <div key={i} style={{ padding: '12px 14px', background: DRIVER_PALETTE.paper, border: `1px solid ${DRIVER_PALETTE.rule}`, borderRadius: 10 }}>
          <div style={{ fontSize: 9.5, color: DRIVER_PALETTE.muted, letterSpacing: '.18em', textTransform: 'uppercase' }}>
            {s.label}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, fontFamily: s.mono ? '"SF Mono",ui-monospace,monospace' : 'inherit' }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>

    {/* Path strip */}
    <div style={{ padding: '14px 18px 0' }}>
      <div style={{ fontSize: 10, color: DRIVER_PALETTE.muted, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 8 }}>
        Itinéraire emprunté
      </div>
      <div style={{ padding: '14px 14px', background: DRIVER_PALETTE.paper, border: `1px solid ${DRIVER_PALETTE.rule}`, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600 }}>
          <span>Kamsar</span>
          <Icon name="arrow" size={11} stroke={2} style={{ color: DRIVER_PALETTE.muted }}/>
          <span>Boké</span>
          <Icon name="arrow" size={11} stroke={2} style={{ color: DRIVER_PALETTE.muted }}/>
          <span>Boffa</span>
          <Icon name="arrow" size={11} stroke={2} style={{ color: DRIVER_PALETTE.muted }}/>
          <span>Kindia</span>
          <Icon name="arrow" size={11} stroke={2} style={{ color: DRIVER_PALETTE.muted }}/>
          <span>Coyah</span>
          <Icon name="arrow" size={11} stroke={2} style={{ color: DRIVER_PALETTE.muted }}/>
          <span>Conakry</span>
        </div>
      </div>
    </div>

    <div style={{ flex: 1 }}/>

    <div style={{ padding: '14px 18px 0', display: 'flex', gap: 10 }}>
      <button style={{
        flex: 1, height: 48, borderRadius: 12,
        background: '#FFF', border: `1px solid ${DRIVER_PALETTE.rule}`,
        color: DRIVER_PALETTE.ink, fontSize: 13, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Icon name="doc" size={14}/>Voir DUT
      </button>
      <button style={{
        flex: 1, height: 48, borderRadius: 12,
        background: DRIVER_PALETTE.ink, border: 'none', color: '#FFF',
        fontSize: 13, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        Nouveau trajet
        <Icon name="arrow" size={13} stroke={2.2}/>
      </button>
    </div>
  </div>
);

Object.assign(window, {
  DRIVER_PALETTE, DriverPill,
  DriverScreen1Setup, DriverScreen2Trip, DriverScreen3Offline, DriverScreen4Recap,
});

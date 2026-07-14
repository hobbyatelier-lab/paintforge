import { useState, useEffect } from 'react'
import { SECTION_LABELS } from '../data/paints.js'
import { isPaintForgeSampled, AnvilBadge } from './provenance.jsx'

const BRAND_CYAN    = '#36E2DD'
const SOLID_FINISH  = new Set(['flat','gloss','satin','ink','one-coat','pigment','primer','contrast_primer','dry','custom'])
const DASHED_FINISH = new Set(['metallic','wash','fx','clear','glaze','metallic_primer'])
const CAN_SUBSTITUTE = new Set(['flat','gloss','satin','ink','one-coat','metallic','wash','fx','clear','primer','contrast_primer','metallic_primer','dry','glaze'])

// ── Swatch ─────────────────────────────────────────────────────────
// Unchanged from previous version.
// Renders the 6-state finish_family swatch circle (solid / dashed / colorshift /
// auxiliary / pending / data-gap).
function Swatch({ paint, size = 56 }) {
  const ff           = paint.finish_family
  const isColorshift = ff === 'colorshift'
  const isAuxiliary  = ff === 'auxiliary' || ff === 'varnish' || ff === 'satin_varnish'
  const isPending    = !ff
  const isSolid      = SOLID_FINISH.has(ff)
  const isDashed     = DASHED_FINISH.has(ff)

  const bg = isColorshift ? '#FFFFFF'
           : isAuxiliary  ? 'transparent'
           : paint.hex    ? paint.hex
           : 'transparent'

  const border = isPending && paint.hex ? 'none'
               : isPending              ? '1.5px dashed #333'
               : isAuxiliary            ? '2px solid #3a3a4a'
               : isColorshift||isDashed ? '2px dashed rgba(255,255,255,0.7)'
               : (isSolid||ff)&&paint.hex ? '2px solid rgba(255,255,255,0.85)'
               : '2px solid #444'

  const indicator = isColorshift ? '~'
                  : isAuxiliary  ? '—'
                  : !paint.hex   ? '?'
                  : null

  return (
    <div style={{
      position:'relative',
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:bg, border,
      boxShadow: (!isColorshift&&!isAuxiliary&&paint.hex)
        ? `inset 0 0 0 3px rgba(0,0,0,0.4), inset 0 0 0 5px ${paint.hex}`
        : 'none',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {indicator && <span style={{ fontSize:12, color:isColorshift?'#888':'#666' }}>{indicator}</span>}
      {isPaintForgeSampled(paint) && <AnvilBadge size={18} />}
    </div>
  )
}

// ── HubPips ────────────────────────────────────────────────────────
// Interactive pip row for the Ownership Hub.
// Intentionally separate from the display-only Pips inside Inventory's ColorRow —
// these are the primary ownership touch target; inventory pips are read-only glances.
// If pips are ever needed in a third location, extract both here and in Inventory
// to src/components/Pips.jsx at that point.
//
// Visual layout ("|+||||" format):
//   [ pip 1 ] + [ pip 2 ][ pip 3 ][ pip 4 ][ pip 5 ]
//                └─────────── backup stock ──────────┘
//
// Pip 1 = the base bottle (owned / in My Set).
// Pips 2–5 = extra backup bottles beyond the base.
// The "backup stock" U-bracket below pips 2–5 makes this grouping explicit.
//
// count      : total active pips (0–5).
//              Green side : isOwned ? 1 + extras : 0
//              Violet side: isInSet ? 1 + targetCount : 0
// activeColor: fill and border color for active pips (#4caf50 green / #9060d0 violet)
// onTap(n)   : called with the pip number (1–5) the user tapped
function HubPips({ count, activeColor, onTap }) {
  const pip = (n) => (
    <button
      key={n}
      onClick={() => onTap(n)}
      style={{
        width:22, height:36, borderRadius:4,
        padding:0, flexShrink:0, cursor:'pointer',
        background: n <= count ? activeColor : 'transparent',
        border: `1px solid ${n <= count ? activeColor : '#333'}`,
      }}
    />
  )

  return (
    <div style={{ display:'inline-flex', flexDirection:'column', gap:2 }}>

      {/* ── Pip row ── */}
      <div style={{
        display:'flex', gap:3, alignItems:'center',
        border:'1px solid #2A3535', borderRadius:6, padding:'3px 4px',
      }}>
        {/* Pip 1 — base bottle */}
        {pip(1)}

        {/* Separator between base and backup group */}
        <span style={{ fontSize:11, color:'#3a5050', fontWeight:700, lineHeight:1, flexShrink:0 }}>+</span>

        {/* Pips 2–5 — backup bottles */}
        {[2,3,4,5].map(pip)}
      </div>

      {/* ── Label row — "backup stock" U-bracket under pips 2–5 ── */}
      {/* Uses a transparent "+" spacer to mirror the pip row layout exactly,
          so the bracket aligns with pips 2–5 without hardcoded pixel offsets. */}
      <div style={{ display:'flex', gap:3, alignItems:'flex-start', paddingLeft:5, paddingRight:5 }}>
        {/* Spacer matching pip 1 */}
        <div style={{ width:22, flexShrink:0 }} />
        {/* Spacer matching "+" — transparent, same size as the visible one above */}
        <span style={{ fontSize:11, fontWeight:700, lineHeight:1, flexShrink:0, color:'transparent' }}>+</span>
        {/* U-bracket spanning pips 2–5 */}
        <div style={{
          flex:1,
          borderLeft:   '1px solid #2a4040',
          borderBottom: '1px solid #2a4040',
          borderRight:  '1px solid #2a4040',
          borderRadius: '0 0 3px 3px',
          padding: '1px 2px 2px',
          textAlign: 'center',
          fontSize: 7,
          color: '#4a6060',
        }}>
          backup stock
        </div>
      </div>

    </div>
  )
}

// ── edgeCase ───────────────────────────────────────────────────────
// Returns a human-readable message when this paint cannot be used with IrisMatch.
// Returns null if substitution is available.
function edgeCase(paint) {
  if (!paint.finish_family)
    return 'Classification pending — substitute search not yet available for this paint.'
  if (paint.finish_family === 'auxiliary')
    return 'Auxiliary product — color substitution doesn\'t apply here.'
  if (paint.finish_family === 'colorshift')
    return 'Colorshift paint — no fixed hex to match against.'
  if (paint.finish_family === 'pigment')
    return 'Dry pigment — use Find a Color for matching instead.'
  if (!paint.hex || paint.lab_l == null)
    return 'No color data yet — try Find a Color instead.'
  return null
}

// ── DetailPopup ────────────────────────────────────────────────────
// Shows full paint detail plus the DD-01 Ownership Hub.
// The hub replaces the old read-only owned/set badge pills.
//
// Props:
//   paint        : the paint object from the catalog
//   isOwned      : whether the user currently owns this paint (boolean)
//   isInSet      : whether the paint is currently in My Set (boolean)
//   extras       : extra bottle count beyond the one base owned bottle (0–4, default 0)
//   targetCount  : My Set target count beyond the one base tracked slot (0–4, default 0)
//   toggleOwned  : (id) → flips owned boolean; used for single-field changes only
//   toggleMySet  : (id) → flips in_my_set boolean; used for single-field changes only
//   setHubState  : (id, patch) → atomic multi-field save for the hub.
//                  Used when one user tap must change two fields at once, e.g.
//                  tapping pip 2 when not owned: sets owned=true AND extras=1 together
//                  so they land in Supabase as one write, not two racing ones.
//   onClose      : () → closes this popup
//   onFindSubstitute : (paint) → opens IrisMatch for this paint; closes this popup first
//   zIndex       : z-index for the overlay.
//                  1000 when opened from the inventory list.
//                  1200 when opened from IrisMatch (SubstitutePanel sits at 1100).
export default function DetailPopup({
  paint,
  isOwned, isInSet,
  extras = 0, targetCount = 0,
  toggleOwned, toggleMySet, setHubState,
  onClose, onFindSubstitute,
  zIndex = 1000,
}) {
  if (!paint) return null

  // destructiveTarget — set when the user tries to clear pips while extra pips exist.
  // Shows the Step 6 confirm dialog until they confirm or cancel.
  // null   : no confirmation pending
  // object : { field: 'owned'|'set', count: number }
  //   field : which side is being cleared (determines copy and which state to update)
  //   count : total pips that would be removed (shown in the dialog message)
  const [destructiveTarget, setDestructiveTarget] = useState(null)

  // Close on Escape. If a confirm dialog is open, Escape clears it first
  // rather than closing the whole popup — one step back, not two.
  useEffect(() => {
    const handler = e => {
      if (e.key !== 'Escape') return
      if (destructiveTarget) setDestructiveTarget(null)
      else onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, destructiveTarget])

  const sectionLabel = SECTION_LABELS[paint.section_key] || paint.section_key
  const [brand, line] = sectionLabel.includes(' — ')
    ? sectionLabel.split(' — ')
    : [sectionLabel, '']

  const canSub  = CAN_SUBSTITUTE.has(paint.finish_family) && paint.hex && paint.lab_l != null
  const message = edgeCase(paint)

  // greenTotal — total active green pips.
  // Pip 1 = the one base owned bottle. Pips 2–5 = extra bottles.
  const greenTotal  = isOwned ? 1 + extras : 0

  // violetTotal — total active violet pips.
  // Pip 1 = the one base My Set slot. Pips 2–5 = extra target bottles.
  const violetTotal = isInSet ? 1 + targetCount : 0

  // ── Green side handlers ──────────────────────────────────────────

  // handleGreenTap — user tapped pip n on the owned (green) side.
  // Tapping the same pip as the current total toggles it off (goes to 0).
  // Tapping a different pip sets the total to n (owned=true, extras=n-1).
  function handleGreenTap(n) {
    if (n === greenTotal) {
      // toggling off — would remove all green pips
      if (extras > 0) {
        // Step 6: there are extra pips — confirm before clearing
        setDestructiveTarget({ field:'owned', count:greenTotal })
      } else {
        // only the base pip — safe to clear directly without a guard
        toggleOwned(paint.id)
        window.posthog?.capture('ownership_changed',
          { field:'owned', from:true, to:false, source:'popup' })
      }
    } else {
      // setting a new total — always owned=true, extras = n-1
      const wasOwned = isOwned
      setHubState(paint.id, { owned:true, extraCount:n - 1 })
      window.posthog?.capture('ownership_changed',
        { field:'owned', from:wasOwned, to:true, source:'popup' })
    }
  }

  // handleGreenCheckbox — user clicked the ✓ checkbox directly.
  // Checking: sets owned=true; existing extras are preserved.
  // Unchecking: fires Step 6 guard if extras > 0, otherwise clears directly.
  function handleGreenCheckbox() {
    if (isOwned) {
      if (extras > 0) {
        setDestructiveTarget({ field:'owned', count:greenTotal })
      } else {
        toggleOwned(paint.id)
        window.posthog?.capture('ownership_changed',
          { field:'owned', from:true, to:false, source:'popup' })
      }
    } else {
      toggleOwned(paint.id)
      window.posthog?.capture('ownership_changed',
        { field:'owned', from:false, to:true, source:'popup' })
    }
  }

  // ── Violet side handlers ─────────────────────────────────────────
  // Mirror of the green handlers above, operating on My Set (inSet / targetCount).

  function handleVioletTap(n) {
    if (n === violetTotal) {
      if (targetCount > 0) {
        setDestructiveTarget({ field:'set', count:violetTotal })
      } else {
        toggleMySet(paint.id)
        window.posthog?.capture('ownership_changed',
          { field:'set', from:true, to:false, source:'popup' })
      }
    } else {
      const wasInSet = isInSet
      setHubState(paint.id, { inSet:true, targetCount:n - 1 })
      window.posthog?.capture('ownership_changed',
        { field:'set', from:wasInSet, to:true, source:'popup' })
    }
  }

  function handleVioletCheckbox() {
    if (isInSet) {
      if (targetCount > 0) {
        setDestructiveTarget({ field:'set', count:violetTotal })
      } else {
        toggleMySet(paint.id)
        window.posthog?.capture('ownership_changed',
          { field:'set', from:true, to:false, source:'popup' })
      }
    } else {
      toggleMySet(paint.id)
      window.posthog?.capture('ownership_changed',
        { field:'set', from:false, to:true, source:'popup' })
    }
  }

  // ── Step 6 confirm handler ───────────────────────────────────────
  // Called when the user clicks "Yes, remove" in the destructive confirm dialog.
  // Clears all pips on the relevant side (owned=false+extras=0, or inSet=false+targetCount=0).
  function confirmDestructive() {
    if (destructiveTarget.field === 'owned') {
      setHubState(paint.id, { owned:false, extraCount:0 })
      window.posthog?.capture('ownership_changed',
        { field:'owned', from:true, to:false, source:'popup' })
    } else {
      setHubState(paint.id, { inSet:false, targetCount:0 })
      window.posthog?.capture('ownership_changed',
        { field:'set', from:true, to:false, source:'popup' })
    }
    setDestructiveTarget(null)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.72)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex, padding:20, fontFamily:"'Montserrat',system-ui,sans-serif",
      }}
    >
      {/* Card — stopPropagation so clicking inside doesn't close the overlay */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:'#1E2428', borderRadius:14, padding:24,
          width:'100%', maxWidth:400,
          border:'1px solid #2a3535', color:'#e8e8e8',
          boxShadow:'0 24px 60px rgba(0,0,0,0.6)',
        }}
      >

        {/* ── Header: swatch + name + close ── */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:20 }}>
          <Swatch paint={paint} size={56} />

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{
              fontSize:17, fontWeight:700, lineHeight:1.2,
              fontFamily:"'Barlow Condensed','Montserrat',system-ui",
              color:'#e8e8e8', marginBottom:4,
              overflow:'hidden', textOverflow:'ellipsis',
            }}>
              {paint.name}
            </div>
            <div style={{ fontSize:11, color:'#4a6060', fontFamily:'monospace', marginBottom:6 }}>
              {paint.id}
            </div>
            <div style={{ fontSize:11, color:'#6b8080' }}>
              {brand}{line ? <span style={{ color:'#3a5050' }}> · {line}</span> : ''}
            </div>
            {isPaintForgeSampled(paint) && (
              <div style={{ fontSize:10, color:'#7A9595', marginTop:5, display:'flex', alignItems:'center' }}>
                <AnvilBadge size={14} inline /> PaintForge-sampled · manufacturer digital chips
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            style={{ background:'none', border:'none', color:'#4a6060', fontSize:18, cursor:'pointer', padding:'0 4px', flexShrink:0 }}
          >✕</button>
        </div>

        {/* ── Finish / chemistry tags ── */}
        {(paint.finish_family || paint.chemistry_family) && (
          <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
            {paint.finish_family && (
              <span style={{ fontSize:10, padding:'3px 8px', background:'#141414', borderRadius:20, color:'#9B8FD0', border:'1px solid #2a2a4a' }}>
                {paint.finish_family}
              </span>
            )}
            {paint.chemistry_family && (
              <span style={{ fontSize:10, padding:'3px 8px', background:'#141414', borderRadius:20, color:'#6b8080', border:'1px solid #2a3535' }}>
                {paint.chemistry_family}
              </span>
            )}
          </div>
        )}

        {/* ── Ownership Hub ──────────────────────────────────────────
            DD-01 Step 2. Two-column layout:
            Left  (green)  = Owned — tracks physical possession.
            Right (violet) = My Set — tracks what the user wants to manage.
            The two sides are fully independent; see the sentence below.
        ─────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', gap:16 }}>

            {/* ── Green column — Owned ── */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>

              {/* Checkbox + "Owned" label — clicking mirrors tapping pip 1 */}
              <button onClick={handleGreenCheckbox} style={{
                display:'flex', alignItems:'center', gap:7,
                background:'none', border:'none', cursor:'pointer', padding:0,
              }}>
                <div style={{
                  width:17, height:17, borderRadius:3, flexShrink:0,
                  background: isOwned ? '#4caf50' : 'transparent',
                  border: isOwned ? 'none' : '1.5px solid #2a4a2a',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {isOwned && <span style={{ color:'#fff', fontSize:11, lineHeight:1 }}>✓</span>}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color: isOwned ? '#6aba6a' : '#4a6060' }}>
                  Owned
                </span>
              </button>

              {/* Green pips. Count = 1 + extras when owned, 0 when not owned. */}
              <HubPips count={greenTotal} activeColor='#4caf50' onTap={handleGreenTap} />
            </div>

            {/* ── Violet column — My Set ── */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>

              {/* Checkbox + "My Set" label */}
              <button onClick={handleVioletCheckbox} style={{
                display:'flex', alignItems:'center', gap:7,
                background:'none', border:'none', cursor:'pointer', padding:0,
              }}>
                <div style={{
                  width:17, height:17, borderRadius:3, flexShrink:0,
                  background: isInSet ? '#9060d0' : 'transparent',
                  border: isInSet ? 'none' : '1.5px solid #3a2a4a',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {isInSet && <span style={{ color:'#fff', fontSize:11, lineHeight:1 }}>♦</span>}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color: isInSet ? '#9060d0' : '#4a6060' }}>
                  My Set
                </span>
              </button>

              {/* Violet pips. Count = 1 + targetCount when in set, 0 when not. */}
              <HubPips count={violetTotal} activeColor='#9060d0' onTap={handleVioletTap} />
            </div>

          </div>

          {/* Independence sentence — verbatim from spec. Always visible. */}
          <div style={{ fontSize:10, color:'#5a7070', marginTop:12, lineHeight:1.6, fontStyle:'italic' }}>
            Owned means you have it; My Set means you're tracking it — they're independent.
          </div>
        </div>

        {/* ── Step 6: Destructive confirm dialog ────────────────────
            Appears in-place when the user tries to clear all pips
            while extra pips (beyond the base) still exist.
            Escape or Cancel = no-op. "Yes, remove" = clears all.
        ─────────────────────────────────────────────────────────── */}
        {destructiveTarget && (
          <div style={{
            background:'#141414', border:'1px solid #5a2a2a',
            borderRadius:8, padding:14, marginBottom:16,
          }}>
            <div style={{ fontSize:12, color:'#e8c0a0', lineHeight:1.6, marginBottom:12 }}>
              You have {destructiveTarget.count} {destructiveTarget.field === 'owned' ? 'owned' : 'targeted'} pip{destructiveTarget.count !== 1 ? 's' : ''} set
              for <strong>{paint.name}</strong>. Remove {destructiveTarget.count === 1 ? 'it' : 'all of them'}?
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button
                onClick={confirmDestructive}
                style={{
                  flex:1, padding:'8px', borderRadius:6, cursor:'pointer',
                  background:'#5a2a2a', border:'1px solid #8a4a4a',
                  color:'#e8a0a0', fontSize:12, fontWeight:600,
                }}
              >
                Yes, remove
              </button>
              <button
                onClick={() => setDestructiveTarget(null)}
                style={{
                  flex:1, padding:'8px', borderRadius:6, cursor:'pointer',
                  background:'transparent', border:'1px solid #2a3535',
                  color:'#8AABAB', fontSize:12, fontWeight:600,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        <div style={{ borderTop:'1px solid #2a3535', marginBottom:16 }} />

        {/* ── IrisMatch button / edge case message ── */}
        {canSub ? (
          <button
            onClick={() => onFindSubstitute(paint)}
            style={{
              width:'100%', padding:'11px', background:BRAND_CYAN,
              color:'#0A1414', border:'none', borderRadius:8,
              fontSize:14, fontWeight:700, cursor:'pointer',
              letterSpacing:'0.02em',
            }}
          >
            Find a Substitute with IrisMatch
          </button>
        ) : (
          <div style={{ fontSize:12, color:'#5a7070', textAlign:'center', lineHeight:1.5 }}>
            {message}
          </div>
        )}

      </div>
    </div>
  )
}

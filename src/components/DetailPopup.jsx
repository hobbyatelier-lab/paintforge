import { useEffect } from 'react'
import { SECTION_LABELS } from '../data/paints.js'

const BRAND_CYAN   = '#36E2DD'
const SOLID_FINISH = new Set(['flat','gloss','satin','ink','one-coat','pigment','primer','contrast_primer','dry'])
const DASHED_FINISH= new Set(['metallic','wash','fx','clear','glaze','metallic_primer'])
const CAN_SUBSTITUTE = new Set(['flat','gloss','satin','ink','one-coat','metallic','wash','fx','clear'])

function Swatch({ paint, size = 56 }) {
  const ff  = paint.finish_family
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
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:bg, border,
      boxShadow: (!isColorshift&&!isAuxiliary&&paint.hex)
        ? `inset 0 0 0 3px rgba(0,0,0,0.4), inset 0 0 0 5px ${paint.hex}`
        : 'none',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {indicator && <span style={{ fontSize:12, color:isColorshift?'#888':'#666' }}>{indicator}</span>}
    </div>
  )
}

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

export default function DetailPopup({ paint, isOwned, isInSet, onClose, onFindSubstitute }) {
  if (!paint) return null

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const sectionLabel = SECTION_LABELS[paint.section_key] || paint.section_key
  const [brand, line] = sectionLabel.includes(' — ')
    ? sectionLabel.split(' — ')
    : [sectionLabel, '']

  const canSub  = CAN_SUBSTITUTE.has(paint.finish_family) && paint.hex && paint.lab_l != null
  const message = edgeCase(paint)

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.72)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:1000, padding:20, fontFamily:"'Montserrat',system-ui,sans-serif",
      }}
    >
      {/* Card — stop propagation so clicking inside doesn't close */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:'#1E2428', borderRadius:14, padding:24,
          width:'100%', maxWidth:400,
          border:'1px solid #2a3535', color:'#e8e8e8',
          boxShadow:'0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header row: swatch + name + close */}
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
          </div>

          <button
            onClick={onClose}
            style={{ background:'none', border:'none', color:'#4a6060', fontSize:18, cursor:'pointer', padding:'0 4px', flexShrink:0 }}
          >✕</button>
        </div>

        {/* Tags row */}
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

        {/* Ownership badges */}
        {(isOwned || isInSet) && (
          <div style={{ display:'flex', gap:6, marginBottom:16 }}>
            {isOwned && (
              <span style={{ fontSize:10, padding:'3px 8px', background:'#1a2a1a', borderRadius:20, color:'#6aba6a', border:'1px solid #2a4a2a' }}>
                ✓ Owned
              </span>
            )}
            {isInSet && (
              <span style={{ fontSize:10, padding:'3px 8px', background:'#1e1a28', borderRadius:20, color:'#9060d0', border:'1px solid #3a2a4a' }}>
                ♦ My Set
              </span>
            )}
          </div>
        )}

        {/* Hex value */}
        {paint.hex && (
          <div style={{ fontSize:11, color:'#4a6060', fontFamily:'monospace', marginBottom:20 }}>
            {paint.finish_family && DASHED_FINISH.has(paint.finish_family) && (
              <span style={{ color:'#6b8080' }}>~ </span>
            )}
            {paint.hex}
            {paint.finish_family && DASHED_FINISH.has(paint.finish_family) && (
              <span style={{ color:'#4a6060', marginLeft:6 }}>(approximate)</span>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop:'1px solid #2a3535', marginBottom:16 }} />

        {/* Find a Substitute button or edge case message */}
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
            Find a Substitute
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

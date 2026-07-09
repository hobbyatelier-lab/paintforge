// SwatchPair — standalone component
// Shows target and candidate swatches touching side by side.
// Used exclusively inside SubstitutePanel — never modifies inventory.

const SOLID_FINISH  = new Set(['flat','gloss','satin','ink','one-coat','pigment','primer','contrast_primer','dry','custom'])
const DASHED_FINISH = new Set(['metallic','wash','fx','clear','glaze','metallic_primer'])

function SingleSwatch({ paint, size }) {
  const ff = paint?.finish_family
  const isColorshift = ff === 'colorshift'
  const isAuxiliary  = ff === 'auxiliary' || ff === 'varnish' || ff === 'satin_varnish'
  const isPending    = !ff
  const isSolid      = SOLID_FINISH.has(ff)
  const isDashed     = DASHED_FINISH.has(ff)

  const bg = isColorshift ? '#FFFFFF'
           : isAuxiliary  ? 'transparent'
           : paint?.hex   ? paint.hex
           : 'transparent'

  const border = isPending && paint?.hex ? 'none'
               : isPending               ? '1px dashed #333'
               : isAuxiliary             ? `1.5px solid #3a3a4a`
               : isColorshift||isDashed  ? '1.5px dashed rgba(255,255,255,0.7)'
               : (isSolid||ff)&&paint?.hex ? '1.5px solid rgba(255,255,255,0.85)'
               : '1.5px solid #444'

  const indicator = isColorshift ? '~' : isAuxiliary ? '—' : !paint?.hex ? '?' : null

  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:bg, border,
      boxShadow: (!isColorshift && !isAuxiliary && paint?.hex)
        ? `inset 0 0 0 2px rgba(0,0,0,0.4), inset 0 0 0 3.5px ${paint.hex}`
        : 'none',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      {indicator && <span style={{ fontSize: size > 20 ? 9 : 7, color:'#666' }}>{indicator}</span>}
    </div>
  )
}

export default function SwatchPair({ target, candidate, size = 22 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
      <SingleSwatch paint={target}    size={size} />
      <SingleSwatch paint={candidate} size={size} />
    </div>
  )
}

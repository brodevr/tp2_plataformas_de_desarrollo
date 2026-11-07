// Control segmentado para filtros: opciones = [{ id, texto, cantidad? }]
export default function Segmento({ opciones, valor, onChange }) {
  return (
    <div className="hb-segmento">
      {opciones.map((o) => (
        <button key={o.id} className={valor === o.id ? "activo" : ""} onClick={() => onChange(o.id)}>
          {o.texto}
          {o.cantidad != null && <span className="hb-segmento-n">{o.cantidad}</span>}
        </button>
      ))}
    </div>
  );
}

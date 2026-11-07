import Icon from "./Icon";

export default function Buscador({ valor, onChange, placeholder = "Buscar" }) {
  return (
    <label className="hb-buscador">
      <Icon name="search" size={16} />
      <input placeholder={placeholder} value={valor} onChange={(e) => onChange(e.target.value)} />
      {valor && (
        <button type="button" className="hb-buscador-x" onClick={() => onChange("")} title="Limpiar">
          <Icon name="x" size={14} />
        </button>
      )}
    </label>
  );
}

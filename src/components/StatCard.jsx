import Icon from "./Icon";

// Tarjeta de indicador. tono: "" | "in" | "gris" | "warn"
export default function StatCard({ icono, etiqueta, valor, detalle, tono = "", onClick }) {
  return (
    <button className={`hb-panel hb-stat ${tono === "warn" ? "alerta" : ""}`} onClick={onClick}>
      <span className={`hb-stat-ico ${tono}`}>
        <Icon name={icono} size={18} />
      </span>
      <span>
        <small>{etiqueta}</small>
        <strong>{valor}</strong>
        {detalle && <em>{detalle}</em>}
      </span>
    </button>
  );
}

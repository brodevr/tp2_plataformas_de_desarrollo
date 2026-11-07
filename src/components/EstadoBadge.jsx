import Icon from "./Icon";

const ESTADOS = {
  aprobado: { texto: "Aprobado", tono: "ok", icono: "check" },
  pendiente: { texto: "En revisión", tono: "warn", icono: "clock" },
  rechazado: { texto: "Rechazado", tono: "error", icono: "x" },
  activo: { texto: "Activo", tono: "ok", icono: "check" },
  bloqueado: { texto: "Bloqueado", tono: "error", icono: "lock" },
};

export default function EstadoBadge({ estado }) {
  const e = ESTADOS[estado] ?? ESTADOS.aprobado;
  return (
    <span className={`badge ${e.tono}`}>
      <Icon name={e.icono} size={12} />
      {e.texto}
    </span>
  );
}

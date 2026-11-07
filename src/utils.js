const formato = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// 245680.5 -> "245.680,50"
export const formatearMonto = (n) => formato.format(n);

// Para la lista: +$25.000 / -$4.320
export const formatearMovimiento = (n) => {
  const signo = n >= 0 ? "+" : "-";
  const abs = Math.abs(n);
  const txt = Number.isInteger(abs) ? abs.toLocaleString("es-AR") : formatearMonto(abs);
  return `${signo}$${txt}`;
};

export const iniciales = (nombre = "") =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

export const normalizar = (texto = "") => texto.trim().toLowerCase();

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const esHoy = (ts) => new Date(ts).toDateString() === new Date().toDateString();

const hora = (d) => d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

// timestamp -> "Hoy, 10:32" / "Ayer, 18:45" / "11 sep., 08:00"
export function formatearFecha(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const dia = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dias = Math.round((dia(new Date()) - dia(d)) / 86400000);
  if (dias === 0) return `Hoy, ${hora(d)}`;
  if (dias === 1) return `Ayer, ${hora(d)}`;
  return `${d.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}, ${hora(d)}`;
}

export const formatearDia = (ts) =>
  ts ? new Date(ts).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }) : "—";

export const generarCbu = () =>
  "0000003" + Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join("");

// "María José Pérez" -> "maria.jose.mb"
export const generarAlias = (nombre = "") => {
  const base = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(".");
  return base ? `${base}.mb` : "";
};

export const generarClave = () => Math.random().toString(36).slice(2, 8);

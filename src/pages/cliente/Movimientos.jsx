import { useState } from "react";
import Buscador from "../../components/Buscador";
import MovimientosTabla from "../../components/MovimientosTabla";
import Segmento from "../../components/Segmento";
import { useBanco } from "../../context/BancoContext";
import { normalizar } from "../../utils";

const FILTROS = [
  { id: "todos", texto: "Todos" },
  { id: "ingresos", texto: "Ingresos" },
  { id: "egresos", texto: "Egresos" },
  { id: "pendiente", texto: "En revisión" },
];

export default function Movimientos({ resaltarId }) {
  const { sesion } = useBanco();
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const lista = sesion.movimientos.filter((m) => {
    if (filtro === "ingresos" && m.monto < 0) return false;
    if (filtro === "egresos" && m.monto >= 0) return false;
    if (filtro === "pendiente" && m.estado !== "pendiente") return false;
    return normalizar(m.titulo).includes(normalizar(busqueda));
  });

  return (
    <section className="hb-panel hb-actividad">
      <div className="hb-herramientas">
        <Segmento opciones={FILTROS} valor={filtro} onChange={setFiltro} />
        <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar movimiento" />
      </div>

      {lista.length ? (
        <MovimientosTabla movimientos={lista} resaltarId={resaltarId} />
      ) : (
        <p className="hb-vacio">No hay movimientos que coincidan.</p>
      )}
    </section>
  );
}

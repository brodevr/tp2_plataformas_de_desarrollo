import { useState } from "react";
import Buscador from "../../components/Buscador";
import Segmento from "../../components/Segmento";
import { useBanco } from "../../context/BancoContext";
import { formatearFecha, normalizar } from "../../utils";

const TIPOS = {
  acceso: "Acceso",
  operacion: "Operación",
  admin: "Administración",
};
const TONOS = { acceso: "neutro", operacion: "ok", admin: "navy" };
const POR_PAGINA = 25;

export default function Auditoria() {
  const { auditoria } = useBanco();
  const [tipo, setTipo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [visibles, setVisibles] = useState(POR_PAGINA);

  const opciones = [
    { id: "todos", texto: "Todo", cantidad: auditoria.length },
    ...Object.entries(TIPOS).map(([id, texto]) => ({
      id,
      texto: texto === "Administración" ? "Admin" : `${texto}s`,
      cantidad: auditoria.filter((a) => a.tipo === id).length,
    })),
  ];

  const q = normalizar(busqueda);
  const lista = auditoria.filter(
    (a) =>
      (tipo === "todos" || a.tipo === tipo) &&
      [a.actor, a.accion, a.detalle].some((c) => normalizar(c).includes(q))
  );

  return (
    <section className="hb-panel hb-actividad">
      <div className="hb-herramientas">
        <Segmento
          opciones={opciones}
          valor={tipo}
          onChange={(t) => {
            setTipo(t);
            setVisibles(POR_PAGINA);
          }}
        />
        <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Usuario, acción o detalle" />
      </div>

      {lista.length === 0 ? (
        <p className="hb-vacio">No hay registros que coincidan.</p>
      ) : (
        <>
          <table className="hb-tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th className="oculta-mov">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {lista.slice(0, visibles).map((a, i) => (
                <tr key={a.id} style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}>
                  <td className="hb-fecha">{formatearFecha(a.ts)}</td>
                  <td className="hb-negrita">{a.actor}</td>
                  <td>
                    <span className={`badge ${TONOS[a.tipo]}`}>{TIPOS[a.tipo]}</span> {a.accion}
                  </td>
                  <td className="oculta-mov hb-gris">{a.detalle || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {lista.length > visibles && (
            <button className="btn hb-btn-suave hb-mas" onClick={() => setVisibles((v) => v + POR_PAGINA)}>
              Mostrar más ({lista.length - visibles} restantes)
            </button>
          )}
        </>
      )}
    </section>
  );
}

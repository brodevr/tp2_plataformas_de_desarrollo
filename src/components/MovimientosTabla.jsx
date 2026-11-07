import Icon from "./Icon";
import EstadoBadge from "./EstadoBadge";
import { formatearFecha, formatearMovimiento } from "../utils";

// Tabla de movimientos reutilizada por el cliente y por el administrador.
// Con mostrarCliente agrega una columna con el titular (vista global del admin).
export default function MovimientosTabla({ movimientos, resaltarId, mostrarCliente = false, onCliente }) {
  return (
    <table className="hb-tabla">
      <thead>
        <tr>
          <th>Fecha</th>
          {mostrarCliente && <th>Cliente</th>}
          <th>Detalle</th>
          <th className="oculta-mov">Estado</th>
          <th className="der">Monto</th>
        </tr>
      </thead>
      <tbody>
        {movimientos.map((m, i) => {
          const ingreso = m.monto >= 0;
          const nuevo = m.id === resaltarId;
          return (
            <tr key={m.id} className={nuevo ? "nuevo" : ""} style={{ animationDelay: `${i * 35}ms` }}>
              <td className="hb-fecha">{formatearFecha(m.ts)}</td>
              {mostrarCliente && (
                <td>
                  <button className="hb-link-celda" onClick={() => onCliente?.(m.clienteId)}>
                    {m.cliente}
                  </button>
                </td>
              )}
              <td>
                <div className="hb-detalle">
                  <div className={`hb-mov-ico ${ingreso ? "in" : ""} ${m.ajuste ? "ajuste" : ""}`}>
                    <Icon name={m.ajuste ? "sliders" : ingreso ? "arrowDown" : "arrowUp"} size={15} />
                  </div>
                  <span className="hb-detalle-txt">{m.titulo}</span>
                  {nuevo && <span className="hb-chip-nuevo">Nuevo</span>}
                </div>
              </td>
              <td className="oculta-mov">
                <EstadoBadge estado={m.estado} />
              </td>
              <td className={`der hb-monto ${ingreso ? "in" : ""} ${m.estado === "rechazado" ? "anulado" : ""}`}>
                {formatearMovimiento(m.monto)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

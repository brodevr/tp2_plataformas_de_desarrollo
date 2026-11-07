import Icon from "../../components/Icon";
import MovimientosTabla from "../../components/MovimientosTabla";
import StatCard from "../../components/StatCard";
import { useBanco } from "../../context/BancoContext";
import { esHoy, formatearFecha, formatearMonto, iniciales } from "../../utils";

export default function Panel({ irA }) {
  const { usuarios, auditoria, pendientes } = useBanco();

  const clientes = usuarios.filter((u) => u.rol === "cliente");
  const activos = clientes.filter((u) => u.estado === "activo").length;
  const custodia = clientes.reduce((a, u) => a + u.saldo, 0);

  const actividad = clientes
    .flatMap((u) => u.movimientos.map((m) => ({ ...m, cliente: u.nombre, clienteId: u.id })))
    .sort((a, b) => b.ts - a.ts);
  const deHoy = actividad.filter((m) => esHoy(m.ts) && m.estado !== "rechazado");
  const volumenHoy = deHoy.reduce((a, m) => a + Math.abs(m.monto), 0);

  const ranking = [...clientes].sort((a, b) => b.saldo - a.saldo).slice(0, 5);
  const verUsuario = (id) => irA("usuario", { usuarioId: id });

  return (
    <>
      <div className="hb-stats cuatro">
        <StatCard icono="users" tono="gris" etiqueta="Clientes activos" valor={`${activos} de ${clientes.length}`} onClick={() => irA("usuarios")} />
        <StatCard icono="bank" etiqueta="Dinero en custodia" valor={`$ ${formatearMonto(custodia)}`} />
        <StatCard
          icono="activity"
          tono="in"
          etiqueta="Operaciones de hoy"
          valor={deHoy.length}
          detalle={`$ ${formatearMonto(volumenHoy)} movidos`}
        />
        <StatCard
          icono="clock"
          tono={pendientes.length ? "warn" : "gris"}
          etiqueta="Revisiones pendientes"
          valor={pendientes.length}
          detalle={pendientes.length ? "Requieren tu aprobación" : "Todo al día"}
          onClick={() => irA("revisiones")}
        />
      </div>

      {pendientes.length > 0 && (
        <button className="hb-banner warn accion" onClick={() => irA("revisiones")}>
          <Icon name="alert" size={18} />
          <p>
            <strong>{pendientes[0].usuario.nombre}</strong> quiere transferir $ {formatearMonto(-pendientes[0].monto)} a{" "}
            {pendientes[0].destino}
            {pendientes.length > 1 && ` y hay ${pendientes.length - 1} más esperando`}.
          </p>
          <span>Revisar →</span>
        </button>
      )}

      <div className="hb-dos-col">
        <section className="hb-panel hb-actividad">
          <div className="hb-actividad-head">
            <h2>Actividad de las cuentas</h2>
            <span className="hb-etiqueta">Todos los clientes</span>
          </div>
          <MovimientosTabla movimientos={actividad.slice(0, 8)} mostrarCliente onCliente={verUsuario} />
        </section>

        <div className="hb-columna">
          <section className="hb-panel hb-lista-panel">
            <h2>Mayores saldos</h2>
            {ranking.map((u, i) => (
              <button key={u.id} className="hb-lista-item" onClick={() => verUsuario(u.id)}>
                <span className="hb-puesto">{i + 1}</span>
                <span className="avatar">{iniciales(u.nombre)}</span>
                <span className="hb-lista-txt">
                  <strong>{u.nombre}</strong>
                  <small>{u.alias}</small>
                </span>
                <span className="hb-lista-monto">$ {formatearMonto(u.saldo)}</span>
              </button>
            ))}
          </section>

          <section className="hb-panel hb-lista-panel">
            <div className="hb-actividad-head">
              <h2>Últimas acciones</h2>
              <button className="link" onClick={() => irA("auditoria")}>
                Ver registro
              </button>
            </div>
            {auditoria.slice(0, 5).map((a) => (
              <div key={a.id} className="hb-log">
                <span className={`hb-log-punto ${a.tipo}`} />
                <div>
                  <p>
                    <strong>{a.actor}</strong> · {a.accion}
                  </p>
                  <small>{formatearFecha(a.ts)}</small>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}

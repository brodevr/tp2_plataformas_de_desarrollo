import Icon from "../../components/Icon";
import EstadoBadge from "../../components/EstadoBadge";
import { useBanco } from "../../context/BancoContext";
import { formatearFecha, formatearMonto, iniciales } from "../../utils";

export default function Revisiones({ irA, avisar }) {
  const { usuarios, pendientes, config, resolverTransferencia } = useBanco();

  const resueltas = usuarios
    .flatMap((u) => (u.movimientos ?? []).filter((m) => m.revisadoTs).map((m) => ({ ...m, usuario: u })))
    .sort((a, b) => b.revisadoTs - a.revisadoTs)
    .slice(0, 6);

  const resolver = (p, aprobar) => {
    resolverTransferencia(p.usuario.id, p.id, aprobar);
    avisar(
      aprobar
        ? `Transferencia de ${p.usuario.nombre} aprobada`
        : `Transferencia rechazada: se devolvieron $ ${formatearMonto(-p.monto)} a ${p.usuario.nombre}`,
      aprobar ? "ok" : "warn"
    );
  };

  return (
    <>
      <div className="hb-banner info">
        <Icon name="shield" size={18} />
        <p>
          Las transferencias mayores a <strong>$ {formatearMonto(config.limiteRevision)}</strong> quedan retenidas hasta
          que un administrador las revise. El dinero se reserva en la cuenta del cliente mientras tanto.
        </p>
        <button className="link" onClick={() => irA("configuracion")}>
          Cambiar límite
        </button>
      </div>

      {pendientes.length === 0 ? (
        <section className="hb-panel hb-vacio-panel">
          <span className="hb-vacio-ico">
            <Icon name="check" size={22} />
          </span>
          <p>No hay transferencias esperando revisión.</p>
        </section>
      ) : (
        <div className="hb-revisiones">
          {pendientes.map((p) => {
            const destinoInterno = usuarios.find((u) => u.id === p.destinoId);
            return (
              <article key={p.id} className="hb-panel hb-revision">
                <div className="hb-revision-top">
                  <span className="avatar">{iniciales(p.usuario.nombre)}</span>
                  <div>
                    <button className="hb-link-celda" onClick={() => irA("usuario", { usuarioId: p.usuario.id })}>
                      {p.usuario.nombre}
                    </button>
                    <small>{formatearFecha(p.ts)}</small>
                  </div>
                  <EstadoBadge estado="pendiente" />
                </div>

                <p className="hb-revision-monto">$ {formatearMonto(-p.monto)}</p>

                <dl className="hb-meta compacta">
                  <div>
                    <dt>Destino</dt>
                    <dd>{p.destino}</dd>
                  </div>
                  <div>
                    <dt>Tipo</dt>
                    <dd>{destinoInterno ? "Cliente MiBanco" : "Otro banco"}</dd>
                  </div>
                  <div>
                    <dt>Saldo restante</dt>
                    <dd>$ {formatearMonto(p.usuario.saldo)}</dd>
                  </div>
                  <div>
                    <dt>Veces el límite</dt>
                    <dd>{(-p.monto / config.limiteRevision).toFixed(1)}×</dd>
                  </div>
                </dl>

                <div className="hb-revision-acciones">
                  <button className="btn hb-btn-peligro-suave" onClick={() => resolver(p, false)}>
                    <Icon name="x" size={16} /> Rechazar
                  </button>
                  <button className="btn btn-navy" onClick={() => resolver(p, true)}>
                    <Icon name="check" size={16} /> Aprobar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {resueltas.length > 0 && (
        <section className="hb-panel hb-lista-panel">
          <h2>Resueltas recientemente</h2>
          {resueltas.map((m) => (
            <div key={m.id} className="hb-log">
              <span className={`hb-log-punto ${m.estado === "aprobado" ? "operacion" : "error"}`} />
              <div>
                <p>
                  <strong>{m.usuario.nombre}</strong> → {m.destino} · $ {formatearMonto(-m.monto)}
                </p>
                <small>
                  {m.estado === "aprobado" ? "Aprobada" : "Rechazada"} por {m.revisadoPor} · {formatearFecha(m.revisadoTs)}
                </small>
              </div>
              <EstadoBadge estado={m.estado} />
            </div>
          ))}
        </section>
      )}
    </>
  );
}

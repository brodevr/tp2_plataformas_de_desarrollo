import { useState } from "react";
import EstadoBadge from "../../components/EstadoBadge";
import Icon from "../../components/Icon";
import MovimientosTabla from "../../components/MovimientosTabla";
import Segmento from "../../components/Segmento";
import { useBanco } from "../../context/BancoContext";
import { formatearDia, formatearFecha, formatearMonto, iniciales } from "../../utils";
import AccionesUsuario from "./AccionesUsuario";

const MOTIVOS = {
  credito: ["Bonificación", "Reintegro", "Corrección de saldo", "Depósito en efectivo"],
  debito: ["Cargo administrativo", "Corrección de saldo", "Extracción en sucursal"],
};

export default function UsuarioDetalle({ usuarioId, irA, avisar }) {
  const { usuarios, sesion, ajustarSaldo } = useBanco();
  const u = usuarios.find((x) => x.id === usuarioId);

  const [tipo, setTipo] = useState("credito");
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState(MOTIVOS.credito[0]);

  if (!u) {
    return (
      <section className="hb-panel hb-vacio-panel">
        <p>Este usuario ya no existe.</p>
        <button className="btn btn-navy hb-btn-chico" onClick={() => irA("usuarios")}>
          Volver a usuarios
        </button>
      </section>
    );
  }

  const esCliente = u.rol === "cliente";
  const propio = u.id === sesion.id;

  const aplicarAjuste = (e) => {
    e.preventDefault();
    const r = ajustarSaldo(u.id, tipo, parseFloat(monto), motivo);
    if (!r.ok) return avisar(r.error, "error");
    avisar(`${tipo === "credito" ? "Acreditados" : "Debitados"} $ ${formatearMonto(parseFloat(monto))}`);
    setMonto("");
  };

  const cambiarTipo = (t) => {
    setTipo(t);
    setMotivo(MOTIVOS[t][0]);
  };

  return (
    <AccionesUsuario avisar={avisar} onEliminado={() => irA("usuarios")}>
      {(acciones) => (
        <>
          <button className="hb-volver" onClick={() => irA("usuarios")}>
            <Icon name="arrowLeft" size={16} /> Usuarios
          </button>

          <section className="hb-panel hb-perfil">
            <div className="hb-perfil-top">
              <span className={`avatar grande ${esCliente ? "" : "admin"}`}>{iniciales(u.nombre)}</span>
              <div className="hb-perfil-nombre">
                <h2>{u.nombre}</h2>
                <p>{u.email}</p>
                <div className="hb-badges">
                  <span className={`badge ${esCliente ? "neutro" : "navy"}`}>{esCliente ? "Cliente" : "Administrador"}</span>
                  <EstadoBadge estado={u.estado} />
                </div>
              </div>
              <div className="hb-perfil-acciones">
                <button className="btn hb-btn-suave hb-btn-chico" onClick={() => acciones.editar(u)}>
                  <Icon name="edit" size={15} /> Editar
                </button>
                <button className="btn hb-btn-suave hb-btn-chico" onClick={() => acciones.clave(u)}>
                  <Icon name="key" size={15} /> Contraseña
                </button>
                {!propio && (
                  <>
                    <button className="btn hb-btn-suave hb-btn-chico" onClick={() => acciones.bloqueo(u)}>
                      <Icon name={u.estado === "activo" ? "lock" : "unlock"} size={15} />
                      {u.estado === "activo" ? "Bloquear" : "Desbloquear"}
                    </button>
                    <button className="btn hb-btn-peligro-suave hb-btn-chico" onClick={() => acciones.eliminar(u)}>
                      <Icon name="trash" size={15} /> Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>

            {u.estado === "bloqueado" && (
              <div className="hb-banner error chico">
                <Icon name="lock" size={16} />
                <p>Cuenta bloqueada{u.motivoBloqueo ? `: ${u.motivoBloqueo}` : ""}.</p>
              </div>
            )}

            <dl className="hb-meta">
              {esCliente && (
                <>
                  <div>
                    <dt>Alias</dt>
                    <dd>{u.alias}</dd>
                  </div>
                  <div>
                    <dt>CBU</dt>
                    <dd>{u.cbu}</dd>
                  </div>
                </>
              )}
              <div>
                <dt>Cliente desde</dt>
                <dd>{formatearDia(u.alta)}</dd>
              </div>
              <div>
                <dt>Último acceso</dt>
                <dd>{u.ultimoAcceso ? formatearFecha(u.ultimoAcceso) : "Nunca ingresó"}</dd>
              </div>
            </dl>
          </section>

          {esCliente && (
            <>
              <div className="hb-dos-col angosta">
                <section className="hb-panel hb-saldo-panel">
                  <p className="hb-etiqueta">Saldo en pesos</p>
                  <p className="hb-saldo">$ {formatearMonto(u.saldo)}</p>
                  <dl className="hb-meta compacta">
                    <div>
                      <dt>Dólares</dt>
                      <dd>US$ {formatearMonto(u.dolares)}</dd>
                    </div>
                    <div>
                      <dt>Reservas</dt>
                      <dd>$ {formatearMonto(u.reservas)}</dd>
                    </div>
                    <div>
                      <dt>Inversiones</dt>
                      <dd>$ {formatearMonto(u.inversiones)}</dd>
                    </div>
                  </dl>
                </section>

                <form className="hb-panel hb-ajuste" onSubmit={aplicarAjuste}>
                  <h2>Ajuste manual de saldo</h2>
                  <Segmento
                    opciones={[
                      { id: "credito", texto: "Acreditar" },
                      { id: "debito", texto: "Debitar" },
                    ]}
                    valor={tipo}
                    onChange={cambiarTipo}
                  />
                  <div className="hb-campos">
                    <div>
                      <label className="hb-label">Monto</label>
                      <input
                        className="input input-borde"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="hb-label">Motivo</label>
                      <select className="input input-borde" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                        {MOTIVOS[tipo].map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button className={`btn ${tipo === "credito" ? "btn-navy" : "btn-peligro"} hb-btn-chico`} type="submit">
                    <Icon name={tipo === "credito" ? "plus" : "minus"} size={15} />
                    {tipo === "credito" ? "Acreditar" : "Debitar"}
                  </button>
                  <p className="hb-nota">Queda registrado en los movimientos del cliente y en la auditoría.</p>
                </form>
              </div>

              <section className="hb-panel hb-actividad">
                <div className="hb-actividad-head">
                  <h2>Movimientos</h2>
                  <span className="hb-etiqueta">{u.movimientos.length} en total</span>
                </div>
                {u.movimientos.length ? (
                  <MovimientosTabla movimientos={u.movimientos} />
                ) : (
                  <p className="hb-vacio">Sin movimientos.</p>
                )}
              </section>
            </>
          )}
        </>
      )}
    </AccionesUsuario>
  );
}

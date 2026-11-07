import { useState } from "react";
import Icon from "../../components/Icon";
import { useBanco } from "../../context/BancoContext";
import { formatearMonto, iniciales, normalizar } from "../../utils";

const RAPIDOS = [1000, 5000, 10000, 25000];

export default function Transferir({ avisar, onHecho }) {
  const { sesion, config, buscarCuenta, transferir } = useBanco();
  const [destino, setDestino] = useState("");
  const [monto, setMonto] = useState("");

  const saldo = sesion.saldo;
  const valor = parseFloat(monto);
  const montoValido = !isNaN(valor) && valor > 0;
  const excede = montoValido && valor > saldo;
  const enRevision = montoValido && !excede && valor > config.limiteRevision;

  const cuenta = buscarCuenta(destino);
  const propia = cuenta?.id === sesion.id;

  const confirmar = () => {
    if (!destino.trim()) return avisar("Ingresá un destinatario", "error");
    if (!montoValido) return avisar("Ingresá un monto válido", "error");
    if (excede) return avisar("Saldo insuficiente", "error");

    const r = transferir(destino, valor);
    if (!r.ok) return avisar(r.error, "error");
    onHecho(r);
  };

  return (
    <div className="hb-transferir">
      <section className="hb-panel hb-form">
        <label className="hb-label">Destinatario</label>
        <input
          className="input input-borde"
          placeholder="Alias o CBU"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        />
        {destino.trim() && (
          <p className={`hb-destino ${propia || cuenta?.estado === "bloqueado" ? "error" : cuenta ? "ok" : ""}`}>
            {propia
              ? "Es tu propia cuenta"
              : cuenta?.estado === "bloqueado"
                ? "Esta cuenta no puede recibir transferencias"
                : cuenta
                  ? `✓ ${cuenta.nombre} · Cliente MiBanco`
                  : "Cuenta de otro banco"}
          </p>
        )}

        <label className="hb-label">Monto</label>
        <input
          className={`input input-borde ${excede ? "error" : ""}`}
          type="number"
          min="0"
          placeholder="0"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
        <div className="hb-rapidos">
          {RAPIDOS.map((r) => (
            <button key={r} type="button" onClick={() => setMonto(String(r))}>
              $ {r.toLocaleString("es-AR")}
            </button>
          ))}
          <button type="button" onClick={() => setMonto(String(saldo))}>
            Todo
          </button>
        </div>

        <div className={`hb-resumen ${excede ? "error" : ""}`}>
          <span>Disponible</span>
          <strong>$ {formatearMonto(saldo)}</strong>
          <span>{excede ? "Te faltan" : "Te quedan"}</span>
          <strong>$ {formatearMonto(excede ? valor - saldo : saldo - (montoValido ? valor : 0))}</strong>
        </div>

        {enRevision && (
          <div className="hb-banner warn chico">
            <Icon name="clock" size={16} />
            <p>Supera los $ {formatearMonto(config.limiteRevision)}: quedará en revisión hasta que el banco la apruebe.</p>
          </div>
        )}

        <button className="btn btn-navy hb-confirmar" onClick={confirmar}>
          {enRevision ? "Enviar a revisión" : "Confirmar transferencia"}
        </button>
      </section>

      <section className="hb-panel hb-frecuentes">
        <h2>Contactos frecuentes</h2>
        {sesion.contactos.length === 0 && <p className="hb-vacio chico">Tus destinatarios aparecerán acá.</p>}
        {sesion.contactos.map((c) => (
          <button
            key={c.alias}
            className={`hb-contacto ${normalizar(destino) === c.alias ? "activo" : ""}`}
            onClick={() => setDestino(c.alias)}
          >
            <span className="avatar">{iniciales(c.nombre)}</span>
            <span>
              <strong>{c.nombre}</strong>
              <small>{c.alias}</small>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}

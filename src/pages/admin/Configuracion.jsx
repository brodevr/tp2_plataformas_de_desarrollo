import { useState } from "react";
import ConfirmDialog from "../../components/ConfirmDialog";
import Icon from "../../components/Icon";
import { useBanco } from "../../context/BancoContext";
import { formatearMonto } from "../../utils";

const SUGERIDOS = [50000, 150000, 500000];

export default function Configuracion({ avisar }) {
  const { config, guardarConfig, restablecerDatos } = useBanco();
  const [limite, setLimite] = useState(String(config.limiteRevision));
  const [confirmar, setConfirmar] = useState(false);

  const valor = parseFloat(limite);
  const cambio = !isNaN(valor) && valor > 0 && valor !== config.limiteRevision;

  const guardar = (e) => {
    e.preventDefault();
    if (isNaN(valor) || valor <= 0) return avisar("Ingresá un límite válido", "error");
    guardarConfig({ limiteRevision: valor });
    avisar(`Nuevo límite: $ ${formatearMonto(valor)}`);
  };

  const restablecer = () => {
    restablecerDatos();
    setConfirmar(false);
    setLimite(String(150000));
    avisar("Datos de demostración restablecidos");
  };

  return (
    <div className="hb-config">
      <form className="hb-panel hb-config-item" onSubmit={guardar}>
        <div className="hb-config-ico">
          <Icon name="shield" size={20} />
        </div>
        <div className="hb-config-cuerpo">
          <h2>Límite de revisión</h2>
          <p className="hb-nota">
            Las transferencias que superen este monto quedan retenidas hasta que un administrador las apruebe.
          </p>
          <div className="hb-config-fila">
            <div className="hb-input-pesos">
              <span>$</span>
              <input className="input input-borde" type="number" min="1" value={limite} onChange={(e) => setLimite(e.target.value)} />
            </div>
            <button className="btn btn-navy hb-btn-chico" type="submit" disabled={!cambio}>
              Guardar
            </button>
          </div>
          <div className="hb-rapidos">
            {SUGERIDOS.map((s) => (
              <button key={s} type="button" onClick={() => setLimite(String(s))}>
                $ {s.toLocaleString("es-AR")}
              </button>
            ))}
          </div>
        </div>
      </form>

      <section className="hb-panel hb-config-item">
        <div className="hb-config-ico gris">
          <Icon name="refresh" size={20} />
        </div>
        <div className="hb-config-cuerpo">
          <h2>Datos de demostración</h2>
          <p className="hb-nota">
            Toda la información se guarda en este navegador. Restablecer vuelve a los usuarios, saldos y movimientos
            originales.
          </p>
          <button className="btn hb-btn-peligro-suave hb-btn-chico" onClick={() => setConfirmar(true)}>
            <Icon name="refresh" size={15} /> Restablecer datos
          </button>
        </div>
      </section>

      {confirmar && (
        <ConfirmDialog
          titulo="Restablecer datos"
          mensaje="Se pierden todos los cambios: usuarios creados, transferencias, ajustes y registros de auditoría."
          textoConfirmar="Restablecer"
          peligro
          onConfirmar={restablecer}
          onCancelar={() => setConfirmar(false)}
        />
      )}
    </div>
  );
}

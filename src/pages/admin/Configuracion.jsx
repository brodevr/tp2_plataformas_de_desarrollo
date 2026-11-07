import { useState } from "react";
import Icon from "../../components/Icon";
import { useBanco } from "../../context/BancoContext";
import { formatearMonto } from "../../utils";

const SUGERIDOS = [50000, 150000, 500000];

export default function Configuracion({ avisar }) {
  const { config, guardarConfig } = useBanco();
  const [limite, setLimite] = useState(String(config.limiteRevision));

  const valor = parseFloat(limite);
  const cambio = !isNaN(valor) && valor > 0 && valor !== config.limiteRevision;

  const guardar = (e) => {
    e.preventDefault();
    if (isNaN(valor) || valor <= 0) return avisar("Ingresá un límite válido", "error");
    guardarConfig({ limiteRevision: valor });
    avisar(`Nuevo límite: $ ${formatearMonto(valor)}`);
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
    </div>
  );
}

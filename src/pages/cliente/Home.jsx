import { useState } from "react";
import Icon from "../../components/Icon";
import MovimientosTabla from "../../components/MovimientosTabla";
import StatCard from "../../components/StatCard";
import { useBanco } from "../../context/BancoContext";
import useCountUp from "../../hooks/useCountUp";
import { formatearMonto } from "../../utils";

export default function Home({ irA, resaltarId }) {
  const { sesion } = useBanco();
  const [oculto, setOculto] = useState(false);
  const [tab, setTab] = useState("pesos");

  const tabs = [
    { id: "pesos", texto: "Pesos", moneda: "$", valor: sesion.saldo, nota: `Cuenta principal ···· ${sesion.cbu.slice(-4)}` },
    { id: "dolares", texto: "Dólares", moneda: "US$", valor: sesion.dolares, nota: "Caja de ahorro en dólares" },
    { id: "reservas", texto: "Reservas", moneda: "$", valor: sesion.reservas, nota: "Rinde 21,4% anual" },
    { id: "inversiones", texto: "Inversiones", moneda: "$", valor: sesion.inversiones, nota: "Rinde 24,1% anual" },
  ];
  const actual = tabs.find((t) => t.id === tab);
  const valor = useCountUp(actual.valor);

  const validos = sesion.movimientos.filter((m) => m.estado !== "rechazado");
  const ingresos = validos.filter((m) => m.monto > 0).reduce((a, m) => a + m.monto, 0);
  const egresos = validos.filter((m) => m.monto < 0).reduce((a, m) => a + m.monto, 0);
  const enRevision = sesion.movimientos.filter((m) => m.estado === "pendiente");
  const ocultar = (txt) => (oculto ? "$ ••••" : txt);

  return (
    <>
      <section className="hb-panel">
        <div className="hb-tabs">
          {tabs.map((t) => (
            <button key={t.id} className={`hb-tab ${tab === t.id ? "activo" : ""}`} onClick={() => setTab(t.id)}>
              {t.texto}
            </button>
          ))}
        </div>

        <div className="hb-cuenta">
          <div>
            <p className="hb-etiqueta">Saldo disponible</p>
            <div className="hb-saldo-fila">
              <p className="hb-saldo">
                {oculto ? `${actual.moneda} ••••••` : `${actual.moneda} ${formatearMonto(valor)}`}
              </p>
              <button
                className="hb-icon-btn chico"
                onClick={() => setOculto(!oculto)}
                title={oculto ? "Mostrar saldo" : "Ocultar saldo"}
              >
                <Icon name={oculto ? "eyeOff" : "eye"} size={18} />
              </button>
            </div>
            <p className="hb-rinde">{actual.nota}</p>
          </div>
          <div className="hb-acciones">
            <button className="btn btn-navy" onClick={() => irA("transferir")}>
              <Icon name="send" size={16} /> Transferir
            </button>
            <button className="btn hb-btn-suave" onClick={() => irA("alias")}>
              <Icon name="tag" size={16} /> Alias y CBU
            </button>
          </div>
        </div>
      </section>

      {enRevision.length > 0 && (
        <div className="hb-banner warn">
          <Icon name="clock" size={18} />
          <p>
            Tenés {enRevision.length === 1 ? "una transferencia" : `${enRevision.length} transferencias`} en revisión
            por $ {formatearMonto(-enRevision.reduce((a, m) => a + m.monto, 0))}. El dinero queda reservado hasta
            que el banco la apruebe.
          </p>
        </div>
      )}

      <div className="hb-stats">
        <StatCard icono="arrowDown" tono="in" etiqueta="Ingresos" valor={ocultar(`$ ${formatearMonto(ingresos)}`)} onClick={() => irA("movimientos")} />
        <StatCard icono="arrowUp" etiqueta="Egresos" valor={ocultar(`$ ${formatearMonto(-egresos)}`)} onClick={() => irA("movimientos")} />
        <StatCard icono="list" tono="gris" etiqueta="Movimientos" valor={sesion.movimientos.length} onClick={() => irA("movimientos")} />
      </div>

      <section className="hb-panel hb-actividad">
        <div className="hb-actividad-head">
          <h2>Últimos movimientos</h2>
          <button className="link" onClick={() => irA("movimientos")}>
            Ver todos
          </button>
        </div>
        {sesion.movimientos.length ? (
          <MovimientosTabla movimientos={sesion.movimientos.slice(0, 5)} resaltarId={resaltarId} />
        ) : (
          <p className="hb-vacio">Todavía no tenés movimientos.</p>
        )}
      </section>
    </>
  );
}

import { useState } from "react";
import Icon from "../../components/Icon";
import { useBanco } from "../../context/BancoContext";

export default function Alias() {
  const { sesion } = useBanco();
  const [copiado, setCopiado] = useState("");

  const copiar = async (id, valor) => {
    try {
      await navigator.clipboard.writeText(valor);
    } catch {
      // si el navegador bloquea el portapapeles, igual mostramos la confirmación
    }
    setCopiado(id);
    setTimeout(() => setCopiado(""), 1800);
  };

  const datos = [
    { id: "titular", etiqueta: "Titular", valor: sesion.nombre },
    { id: "alias", etiqueta: "Alias", valor: sesion.alias },
    { id: "cbu", etiqueta: "CBU", valor: sesion.cbu },
  ];
  const todo = `Titular: ${sesion.nombre}\nAlias: ${sesion.alias}\nCBU: ${sesion.cbu}\nBanco: MiBanco`;

  return (
    <section className="hb-panel hb-datos">
      {datos.map((d) => (
        <div className="hb-dato" key={d.id}>
          <div>
            <p className="hb-etiqueta">{d.etiqueta}</p>
            <p className="hb-dato-valor">{d.valor}</p>
          </div>
          {d.id !== "titular" && (
            <button
              className={`btn hb-btn-suave hb-btn-chico ${copiado === d.id ? "copiado" : ""}`}
              onClick={() => copiar(d.id, d.valor)}
            >
              <Icon name={copiado === d.id ? "check" : "copy"} size={15} />
              {copiado === d.id ? "Copiado" : "Copiar"}
            </button>
          )}
        </div>
      ))}
      <div className="hb-dato">
        <button
          className={`btn btn-navy hb-btn-chico ${copiado === "todo" ? "copiado" : ""}`}
          onClick={() => copiar("todo", todo)}
        >
          <Icon name={copiado === "todo" ? "check" : "copy"} size={15} />
          {copiado === "todo" ? "Copiado" : "Copiar todo"}
        </button>
      </div>
    </section>
  );
}

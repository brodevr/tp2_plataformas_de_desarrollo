import { useEffect } from "react";
import Icon from "./Icon";

export default function Modal({ titulo, onCerrar, children, ancho = 460 }) {
  useEffect(() => {
    const tecla = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onCerrar]);

  return (
    <div className="modal-fondo" onMouseDown={onCerrar}>
      <div
        className="modal"
        style={{ maxWidth: ancho }}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{titulo}</h2>
          <button className="hb-icon-btn chico" onClick={onCerrar} title="Cerrar">
            <Icon name="x" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

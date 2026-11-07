import Modal from "./Modal";

export default function ConfirmDialog({
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  peligro = false,
  onConfirmar,
  onCancelar,
  children,
}) {
  return (
    <Modal titulo={titulo} onCerrar={onCancelar} ancho={420}>
      <p className="modal-texto">{mensaje}</p>
      {children}
      <div className="modal-acciones">
        <button className="btn hb-btn-suave" onClick={onCancelar}>
          Cancelar
        </button>
        <button className={`btn ${peligro ? "btn-peligro" : "btn-navy"}`} onClick={onConfirmar}>
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}

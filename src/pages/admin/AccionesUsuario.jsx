import { useState } from "react";
import ConfirmDialog from "../../components/ConfirmDialog";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import { useBanco } from "../../context/BancoContext";
import UsuarioForm from "./UsuarioForm";

const MOTIVOS = ["Actividad sospechosa", "Pedido del cliente", "Documentación vencida", "Deuda pendiente"];

// Centraliza los modales de gestión de un usuario (crear, editar, bloquear,
// eliminar, contraseña temporal) para reutilizarlos en la lista y en el detalle.
export default function AccionesUsuario({ avisar, onEliminado, children }) {
  const { sesion, crearUsuario, editarUsuario, cambiarBloqueo, eliminarUsuario, restablecerClave } = useBanco();
  const [modal, setModal] = useState(null); // { tipo, usuario, clave? }
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const cerrar = () => setModal(null);

  const acciones = {
    crear: () => setModal({ tipo: "form" }),
    editar: (usuario) => setModal({ tipo: "form", usuario }),
    bloqueo: (usuario) => {
      setMotivo(MOTIVOS[0]);
      setModal({ tipo: "bloqueo", usuario });
    },
    eliminar: (usuario) => setModal({ tipo: "eliminar", usuario }),
    clave: (usuario) => setModal({ tipo: "clave", usuario }),
  };

  const guardar = (datos) => {
    const u = modal.usuario;
    const r = u ? editarUsuario(u.id, datos) : crearUsuario(datos);
    if (r.ok) {
      avisar(u ? "Cambios guardados" : `Usuario ${datos.nombre.trim()} creado`);
      cerrar();
    }
    return r;
  };

  const confirmarBloqueo = () => {
    const r = cambiarBloqueo(modal.usuario.id, motivo);
    if (!r.ok) avisar(r.error, "error");
    else avisar(r.bloqueado ? `${modal.usuario.nombre} fue bloqueado` : `${modal.usuario.nombre} fue desbloqueado`);
    cerrar();
  };

  const confirmarEliminar = () => {
    const r = eliminarUsuario(modal.usuario.id);
    if (!r.ok) avisar(r.error, "error");
    else {
      avisar(`${modal.usuario.nombre} fue eliminado`);
      onEliminado?.();
    }
    cerrar();
  };

  const confirmarClave = () => {
    const clave = restablecerClave(modal.usuario.id);
    setModal({ tipo: "claveLista", usuario: modal.usuario, clave });
  };

  const u = modal?.usuario;
  const bloquear = u?.estado === "activo";

  return (
    <>
      {children(acciones)}

      {modal?.tipo === "form" && (
        <UsuarioForm usuario={u} esPropio={u?.id === sesion.id} onGuardar={guardar} onCerrar={cerrar} />
      )}

      {modal?.tipo === "bloqueo" && (
        <ConfirmDialog
          titulo={bloquear ? "Bloquear usuario" : "Desbloquear usuario"}
          mensaje={
            bloquear
              ? `${u.nombre} no va a poder iniciar sesión ni recibir transferencias.`
              : `${u.nombre} va a poder volver a operar normalmente.`
          }
          textoConfirmar={bloquear ? "Bloquear" : "Desbloquear"}
          peligro={bloquear}
          onConfirmar={confirmarBloqueo}
          onCancelar={cerrar}
        >
          {bloquear && (
            <>
              <label className="hb-label">Motivo</label>
              <select className="input input-borde" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                {MOTIVOS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </>
          )}
        </ConfirmDialog>
      )}

      {modal?.tipo === "eliminar" && (
        <ConfirmDialog
          titulo="Eliminar usuario"
          mensaje={`Se va a eliminar a ${u.nombre} de forma permanente. Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          peligro
          onConfirmar={confirmarEliminar}
          onCancelar={cerrar}
        />
      )}

      {modal?.tipo === "clave" && (
        <ConfirmDialog
          titulo="Contraseña temporal"
          mensaje={`Se va a generar una contraseña nueva para ${u.nombre}. La actual deja de funcionar.`}
          textoConfirmar="Generar"
          onConfirmar={confirmarClave}
          onCancelar={cerrar}
        />
      )}

      {modal?.tipo === "claveLista" && (
        <Modal titulo="Contraseña generada" onCerrar={cerrar} ancho={400}>
          <p className="modal-texto">Comunicale esta contraseña a {u.nombre}:</p>
          <div className="hb-clave">
            <code>{modal.clave}</code>
            <button
              className="hb-icon-btn chico"
              title="Copiar"
              onClick={() => {
                navigator.clipboard?.writeText(modal.clave).catch(() => {});
                avisar("Contraseña copiada");
              }}
            >
              <Icon name="copy" size={16} />
            </button>
          </div>
          <div className="modal-acciones">
            <button className="btn btn-navy" onClick={cerrar}>
              Listo
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

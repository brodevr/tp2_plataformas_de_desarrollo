import { useState } from "react";
import Modal from "../../components/Modal";
import Segmento from "../../components/Segmento";
import { generarAlias } from "../../utils";

const ROLES = [
  { id: "cliente", texto: "Cliente" },
  { id: "admin", texto: "Administrador" },
];

// Alta y edición de usuarios. onGuardar devuelve { ok, error }.
export default function UsuarioForm({ usuario, esPropio = false, onGuardar, onCerrar }) {
  const editando = Boolean(usuario);
  const [datos, setDatos] = useState({
    nombre: usuario?.nombre ?? "",
    email: usuario?.email ?? "",
    password: "",
    rol: usuario?.rol ?? "cliente",
    alias: usuario?.alias ?? "",
    saldo: "",
  });
  const [aliasManual, setAliasManual] = useState(editando);
  const [error, setError] = useState("");

  const cambiar = (campo, valor) => {
    setDatos((d) => {
      const nuevo = { ...d, [campo]: valor };
      if (campo === "nombre" && !aliasManual) nuevo.alias = generarAlias(valor);
      return nuevo;
    });
    setError("");
  };

  const guardar = (e) => {
    e.preventDefault();
    const r = onGuardar({ ...datos, saldo: datos.saldo === "" ? 0 : parseFloat(datos.saldo) });
    if (!r.ok) setError(r.error);
  };

  return (
    <Modal titulo={editando ? "Editar usuario" : "Nuevo usuario"} onCerrar={onCerrar} ancho={500}>
      <form className="hb-form-modal" onSubmit={guardar} noValidate>
        <label className="hb-label">Rol</label>
        {esPropio ? (
          <p className="hb-nota">No podés cambiar tu propio rol.</p>
        ) : (
          <Segmento opciones={ROLES} valor={datos.rol} onChange={(v) => cambiar("rol", v)} />
        )}

        <div className="hb-campos">
          <div className="hb-campo-full">
            <label className="hb-label">Nombre completo</label>
            <input className="input input-borde" value={datos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} autoFocus />
          </div>
          <div className="hb-campo-full">
            <label className="hb-label">Correo</label>
            <input className="input input-borde" type="email" value={datos.email} onChange={(e) => cambiar("email", e.target.value)} />
          </div>
          <div className={datos.rol === "cliente" && !editando ? "" : "hb-campo-full"}>
            <label className="hb-label">{editando ? "Nueva contraseña" : "Contraseña"}</label>
            <input
              className="input input-borde"
              type="password"
              placeholder={editando ? "Dejar vacío para mantenerla" : "Mínimo 6 caracteres"}
              value={datos.password}
              onChange={(e) => cambiar("password", e.target.value)}
            />
          </div>
          {datos.rol === "cliente" && !editando && (
            <div>
              <label className="hb-label">Depósito inicial</label>
              <input
                className="input input-borde"
                type="number"
                min="0"
                placeholder="0"
                value={datos.saldo}
                onChange={(e) => cambiar("saldo", e.target.value)}
              />
            </div>
          )}
          {datos.rol === "cliente" && (
            <div className="hb-campo-full">
              <label className="hb-label">Alias</label>
              <input
                className="input input-borde"
                value={datos.alias}
                onChange={(e) => {
                  setAliasManual(true);
                  cambiar("alias", e.target.value.toLowerCase());
                }}
              />
              {!editando && <p className="hb-nota">Se genera con el nombre; podés cambiarlo. El CBU se asigna solo.</p>}
            </div>
          )}
        </div>

        {error && <p className="hb-error">{error}</p>}

        <div className="modal-acciones">
          <button type="button" className="btn hb-btn-suave" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-navy">
            {editando ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useState } from "react";
import Buscador from "../../components/Buscador";
import EstadoBadge from "../../components/EstadoBadge";
import Icon from "../../components/Icon";
import Segmento from "../../components/Segmento";
import { useBanco } from "../../context/BancoContext";
import { formatearFecha, formatearMonto, iniciales, normalizar } from "../../utils";
import AccionesUsuario from "./AccionesUsuario";

export default function Usuarios({ irA, avisar }) {
  const { usuarios, sesion } = useBanco();
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const contar = (fn) => usuarios.filter(fn).length;
  const filtros = [
    { id: "todos", texto: "Todos", cantidad: usuarios.length },
    { id: "cliente", texto: "Clientes", cantidad: contar((u) => u.rol === "cliente") },
    { id: "admin", texto: "Admins", cantidad: contar((u) => u.rol === "admin") },
    { id: "bloqueado", texto: "Bloqueados", cantidad: contar((u) => u.estado === "bloqueado") },
  ];

  const q = normalizar(busqueda);
  const lista = usuarios.filter((u) => {
    if (filtro === "bloqueado" && u.estado !== "bloqueado") return false;
    if ((filtro === "cliente" || filtro === "admin") && u.rol !== filtro) return false;
    return [u.nombre, u.email, u.alias ?? ""].some((c) => normalizar(c).includes(q));
  });

  return (
    <AccionesUsuario avisar={avisar}>
      {(acciones) => (
        <section className="hb-panel hb-actividad">
          <div className="hb-herramientas">
            <Segmento opciones={filtros} valor={filtro} onChange={setFiltro} />
            <div className="hb-herramientas-der">
              <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Nombre, correo o alias" />
              <button className="btn btn-navy hb-btn-chico" onClick={acciones.crear}>
                <Icon name="userPlus" size={16} /> Nuevo usuario
              </button>
            </div>
          </div>

          {lista.length === 0 ? (
            <p className="hb-vacio">No hay usuarios que coincidan.</p>
          ) : (
            <table className="hb-tabla hb-tabla-usuarios">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th className="oculta-mov">Rol</th>
                  <th>Estado</th>
                  <th className="der oculta-mov">Saldo</th>
                  <th className="oculta-tab">Último acceso</th>
                  <th className="der">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((u, i) => (
                  <tr
                    key={u.id}
                    className="clickeable"
                    style={{ animationDelay: `${i * 30}ms` }}
                    onClick={() => irA("usuario", { usuarioId: u.id })}
                  >
                    <td>
                      <div className="hb-detalle">
                        <span className={`avatar ${u.rol === "admin" ? "admin" : ""}`}>{iniciales(u.nombre)}</span>
                        <span className="hb-usuario-celda">
                          <strong>
                            {u.nombre}
                            {u.id === sesion.id && <em> (vos)</em>}
                          </strong>
                          <small>{u.email}</small>
                        </span>
                      </div>
                    </td>
                    <td className="oculta-mov">
                      <span className={`badge ${u.rol === "admin" ? "navy" : "neutro"}`}>
                        {u.rol === "admin" ? "Administrador" : "Cliente"}
                      </span>
                    </td>
                    <td>
                      <EstadoBadge estado={u.estado} />
                    </td>
                    <td className="der hb-monto oculta-mov">{u.rol === "cliente" ? `$ ${formatearMonto(u.saldo)}` : "—"}</td>
                    <td className="hb-fecha oculta-tab">{u.ultimoAcceso ? formatearFecha(u.ultimoAcceso) : "Nunca"}</td>
                    <td className="der" onClick={(e) => e.stopPropagation()}>
                      <div className="hb-iconos">
                        <button className="hb-icon-btn chico" title="Editar" onClick={() => acciones.editar(u)}>
                          <Icon name="edit" size={16} />
                        </button>
                        {u.id !== sesion.id && (
                          <>
                            <button
                              className="hb-icon-btn chico"
                              title={u.estado === "activo" ? "Bloquear" : "Desbloquear"}
                              onClick={() => acciones.bloqueo(u)}
                            >
                              <Icon name={u.estado === "activo" ? "lock" : "unlock"} size={16} />
                            </button>
                            <button className="hb-icon-btn chico peligro" title="Eliminar" onClick={() => acciones.eliminar(u)}>
                              <Icon name="trash" size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </AccionesUsuario>
  );
}

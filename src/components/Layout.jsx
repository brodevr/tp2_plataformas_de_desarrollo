import { useState } from "react";
import Icon from "./Icon";
import { iniciales } from "../utils";

const MENUS = {
  cliente: [
    { id: "home", icono: "home", texto: "Inicio" },
    { id: "transferir", icono: "send", texto: "Transferir" },
    { id: "movimientos", icono: "list", texto: "Movimientos" },
    { id: "alias", icono: "tag", texto: "Alias y CBU" },
  ],
  admin: [
    { id: "panel", icono: "grid", texto: "Panel" },
    { id: "usuarios", icono: "users", texto: "Usuarios" },
    { id: "revisiones", icono: "clock", texto: "Revisiones" },
    { id: "auditoria", icono: "activity", texto: "Auditoría" },
    { id: "configuracion", icono: "sliders", texto: "Configuración" },
  ],
};

export default function Layout({ sesion, activo, irA, onLogout, titulo, subtitulo, badges = {}, aviso, children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const esAdmin = sesion.rol === "admin";

  const ir = (id) => {
    setMenuAbierto(false);
    irA(id);
  };

  return (
    <div className="hb">
      {menuAbierto && <div className="hb-velo" onClick={() => setMenuAbierto(false)} />}

      <aside className={`hb-sidebar ${menuAbierto ? "abierto" : ""}`}>
        <div className="hb-sidebar-top">
          <div className="hb-logo"><Icon name="bank" size={20} /></div>
          <span className="hb-marca">MiBanco</span>
        </div>

        <nav className="hb-nav">
          {MENUS[sesion.rol].map((it) => (
            <button
              key={it.id}
              className={`hb-nav-item ${activo === it.id ? "activo" : ""}`}
              onClick={() => ir(it.id)}
            >
              <Icon name={it.icono} size={18} />
              {it.texto}
              {badges[it.id] > 0 && <span className="hb-nav-badge">{badges[it.id]}</span>}
            </button>
          ))}
        </nav>

        <div className="hb-sidebar-pie">
          {esAdmin ? (
            <>
              <span className="badge navy">Administrador</span>
              <p>Gestión interna del banco</p>
            </>
          ) : (
            <>
              <span className="badge ok">Cliente</span>
              <p>Cuenta ···· {sesion.cbu.slice(-4)}</p>
            </>
          )}
        </div>
      </aside>

      <div className="hb-contenido">
        <header className="hb-topbar">
          <button className="hb-icon-btn hb-hamburguesa" onClick={() => setMenuAbierto(true)}>
            <Icon name="menu" />
          </button>
          <div className="hb-saludo">
            <h1>{titulo}</h1>
            <p>{subtitulo}</p>
          </div>
          <div className="hb-usuario">
            <div className={`avatar ${esAdmin ? "admin" : ""}`}>{iniciales(sesion.nombre)}</div>
            <span>{sesion.nombre}</span>
          </div>
          <button className="hb-icon-btn" onClick={onLogout} title="Cerrar sesión">
            <Icon name="logout" />
          </button>
        </header>

        <main className="hb-main" key={activo + titulo}>{children}</main>

        {aviso && (
          <div className={`hb-aviso ${aviso.tipo}`} key={aviso.id}>
            <Icon name={aviso.tipo === "ok" ? "check" : "alert"} size={16} />
            {aviso.texto}
          </div>
        )}
      </div>
    </div>
  );
}

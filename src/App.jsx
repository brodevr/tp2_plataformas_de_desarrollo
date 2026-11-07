import { useRef, useState } from "react";
import Layout from "./components/Layout";
import { BancoProvider, useBanco } from "./context/BancoContext";
import Login from "./pages/Login";
import Alias from "./pages/cliente/Alias";
import Home from "./pages/cliente/Home";
import Movimientos from "./pages/cliente/Movimientos";
import Transferir from "./pages/cliente/Transferir";
import Auditoria from "./pages/admin/Auditoria";
import Configuracion from "./pages/admin/Configuracion";
import Panel from "./pages/admin/Panel";
import Revisiones from "./pages/admin/Revisiones";
import UsuarioDetalle from "./pages/admin/UsuarioDetalle";
import Usuarios from "./pages/admin/Usuarios";

const INICIO = { cliente: "home", admin: "panel" };

const TITULOS = {
  home: (s) => [`Hola, ${s.nombre.split(" ")[0]}`, "Bienvenido de nuevo"],
  transferir: () => ["Transferir", "Enviá dinero a un Alias o CBU"],
  movimientos: () => ["Movimientos", "Historial completo de tu cuenta"],
  alias: () => ["Alias y CBU", "Compartí tus datos para recibir transferencias"],
  panel: (s) => [`Hola, ${s.nombre.split(" ")[0]}`, "Resumen general del banco"],
  usuarios: () => ["Usuarios", "Alta, edición, bloqueo y baja de clientes y administradores"],
  usuario: () => ["Ficha del usuario", "Datos, saldo y movimientos"],
  revisiones: () => ["Revisiones", "Transferencias retenidas por superar el límite"],
  auditoria: () => ["Auditoría", "Registro de todo lo que pasa en el banco"],
  configuracion: () => ["Configuración", "Reglas de operación del banco"],
};

const PERMITIDAS = {
  cliente: ["home", "transferir", "movimientos", "alias"],
  admin: ["panel", "usuarios", "usuario", "revisiones", "auditoria", "configuracion"],
};

function Aplicacion() {
  const { sesion, pendientes, logout } = useBanco();
  const [vista, setVista] = useState({ id: null });
  const [aviso, setAviso] = useState(null);
  const [resaltado, setResaltado] = useState(null);
  const timer = useRef(null);

  if (!sesion) return <Login />;

  const rol = sesion.rol;
  const id = PERMITIDAS[rol].includes(vista.id) ? vista.id : INICIO[rol];
  const irA = (nuevo, params = {}) => setVista({ id: nuevo, ...params });

  const avisar = (texto, tipo = "ok") => {
    clearTimeout(timer.current);
    setAviso({ id: Date.now(), texto, tipo });
    timer.current = setTimeout(() => setAviso(null), 3200);
  };

  const cerrarSesion = () => {
    setVista({ id: null });
    logout();
  };

  const transferenciaHecha = (r) => {
    irA("home");
    setResaltado(r.movId);
    setTimeout(() => setResaltado(null), 6000);
    if (r.pendiente) avisar(`Transferencia a ${r.nombreDestino} enviada a revisión`, "warn");
    else avisar(`Transferencia enviada a ${r.nombreDestino}`);
  };

  const [titulo, subtitulo] = TITULOS[id](sesion);
  const props = { irA, avisar };

  const paginas = {
    home: <Home {...props} resaltarId={resaltado} />,
    transferir: <Transferir {...props} onHecho={transferenciaHecha} />,
    movimientos: <Movimientos resaltarId={resaltado} />,
    alias: <Alias />,
    panel: <Panel {...props} />,
    usuarios: <Usuarios {...props} />,
    usuario: <UsuarioDetalle {...props} usuarioId={vista.usuarioId} />,
    revisiones: <Revisiones {...props} />,
    auditoria: <Auditoria />,
    configuracion: <Configuracion {...props} />,
  };

  return (
    <Layout
      sesion={sesion}
      activo={id === "usuario" ? "usuarios" : id}
      irA={irA}
      onLogout={cerrarSesion}
      titulo={titulo}
      subtitulo={subtitulo}
      badges={{ revisiones: pendientes.length }}
      aviso={aviso}
    >
      {paginas[id]}
    </Layout>
  );
}

export default function App() {
  return (
    <BancoProvider>
      <Aplicacion />
    </BancoProvider>
  );
}

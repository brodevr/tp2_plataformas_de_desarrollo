import { createContext, useContext, useEffect, useState } from "react";
import { CLIENTE_BASE, crearSeed } from "../data/seed";
import { formatearMonto, generarCbu, generarClave, normalizar, uid } from "../utils";

// "Base de datos" del banco: vive en memoria y se guarda en localStorage.
// Todas las pantallas leen y modifican la información a través de este contexto.

const CLAVE = "mibanco-db-v1";
const BancoContext = createContext(null);

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado?.usuarios?.length) return guardado;
  } catch {
    // datos corruptos o storage bloqueado: arrancamos con la semilla
  }
  return crearSeed();
}

const $ = (n) => `$ ${formatearMonto(n)}`;

const registrar = (estado, actor, accion, detalle, tipo) => ({
  ...estado,
  auditoria: [{ id: uid(), ts: Date.now(), actor, accion, detalle, tipo }, ...estado.auditoria].slice(0, 300),
});

const conUsuario = (estado, id, fn) => ({
  ...estado,
  usuarios: estado.usuarios.map((u) => (u.id === id ? fn(u) : u)),
});

const acreditar = (estado, id, deNombre, monto, ts) =>
  conUsuario(estado, id, (u) => ({
    ...u,
    saldo: u.saldo + monto,
    movimientos: [
      { id: uid(), ts, titulo: `Transferencia de ${deNombre}`, monto, estado: "aprobado" },
      ...u.movimientos,
    ],
  }));

const agregarContacto = (contactos = [], nuevo) =>
  [nuevo, ...contactos.filter((c) => c.alias !== nuevo.alias)].slice(0, 6);

export function BancoProvider({ children }) {
  const [estado, setEstado] = useState(cargar);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {
      // sin persistencia: la app sigue funcionando en memoria
    }
  }, [estado]);

  const { usuarios, auditoria, config } = estado;
  const sesion = usuarios.find((u) => u.id === estado.sesionId) ?? null;
  const actor = sesion?.nombre ?? "Sistema";

  const buscarCuenta = (texto) => {
    const t = normalizar(texto);
    if (!t) return null;
    return usuarios.find((u) => u.rol === "cliente" && (u.alias === t || u.cbu === t)) ?? null;
  };

  const pendientes = usuarios
    .flatMap((u) =>
      (u.movimientos ?? []).filter((m) => m.estado === "pendiente").map((m) => ({ ...m, usuario: u }))
    )
    .sort((a, b) => a.ts - b.ts);

  // ---------- Sesión ----------

  const login = (email, password) => {
    const u = usuarios.find((x) => x.email === normalizar(email));
    if (!u || u.password !== password) return { ok: false, error: "Correo o contraseña incorrectos" };

    if (u.estado === "bloqueado") {
      setEstado(registrar(estado, u.nombre, "Acceso denegado", "Cuenta bloqueada", "acceso"));
      return { ok: false, error: "Tu cuenta está bloqueada. Comunicate con tu sucursal." };
    }

    let nuevo = conUsuario(estado, u.id, (x) => ({ ...x, ultimoAcceso: Date.now() }));
    nuevo = registrar(
      { ...nuevo, sesionId: u.id },
      u.nombre,
      "Inicio de sesión",
      u.rol === "admin" ? "Panel de administración" : "Home banking",
      "acceso"
    );
    setEstado(nuevo);
    return { ok: true };
  };

  const logout = () => {
    setEstado(registrar({ ...estado, sesionId: null }, actor, "Cierre de sesión", "", "acceso"));
  };

  // ---------- Operaciones del cliente ----------

  const transferir = (destinoTexto, monto) => {
    const origen = sesion;
    const dest = buscarCuenta(destinoTexto);

    if (dest?.id === origen.id) return { ok: false, error: "No podés transferirte a tu propia cuenta" };
    if (dest?.estado === "bloqueado") return { ok: false, error: "La cuenta destino no puede recibir transferencias" };
    if (monto > origen.saldo) return { ok: false, error: "Saldo insuficiente" };

    const nombreDestino = dest?.nombre ?? destinoTexto.trim();
    const pendiente = monto > config.limiteRevision;
    const ts = Date.now();
    const movId = uid();

    let nuevo = conUsuario(estado, origen.id, (u) => ({
      ...u,
      saldo: u.saldo - monto,
      movimientos: [
        {
          id: movId,
          ts,
          titulo: `Transferencia a ${nombreDestino}`,
          monto: -monto,
          estado: pendiente ? "pendiente" : "aprobado",
          destino: nombreDestino,
          destinoId: dest?.id ?? null,
        },
        ...u.movimientos,
      ],
      contactos: agregarContacto(u.contactos, {
        nombre: nombreDestino,
        alias: dest?.alias ?? normalizar(destinoTexto),
      }),
    }));

    if (!pendiente && dest) nuevo = acreditar(nuevo, dest.id, origen.nombre, monto, ts);

    nuevo = registrar(
      nuevo,
      origen.nombre,
      pendiente ? "Transferencia retenida" : "Transferencia",
      `${$(monto)} a ${nombreDestino}${pendiente ? " · supera el límite" : ""}`,
      "operacion"
    );
    setEstado(nuevo);
    return { ok: true, pendiente, movId, nombreDestino };
  };

  // ---------- Gestión de usuarios (admin) ----------

  const validarUsuario = (datos, id = null) => {
    const email = normalizar(datos.email);
    const alias = normalizar(datos.alias);

    if (datos.nombre.trim().length < 3) return "Ingresá el nombre completo";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Ingresá un correo válido";
    if (usuarios.some((u) => u.email === email && u.id !== id)) return "Ya existe un usuario con ese correo";
    if (!id && datos.password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    if (id && datos.password && datos.password.length < 6) return "La contraseña debe tener al menos 6 caracteres";

    if (datos.rol === "cliente") {
      if (!/^[a-z0-9.]{6,20}$/.test(alias)) return "El alias debe tener entre 6 y 20 caracteres (letras, números y puntos)";
      if (usuarios.some((u) => u.alias === alias && u.id !== id)) return "Ese alias ya está en uso";
    }
    if (!id && (isNaN(datos.saldo) || datos.saldo < 0)) return "El saldo inicial no puede ser negativo";
    return null;
  };

  const crearUsuario = (datos) => {
    const error = validarUsuario(datos);
    if (error) return { ok: false, error };

    const ahora = Date.now();
    const base = {
      id: uid(),
      nombre: datos.nombre.trim(),
      email: normalizar(datos.email),
      password: datos.password,
      rol: datos.rol,
      estado: "activo",
      alta: ahora,
      ultimoAcceso: null,
    };
    const usuario =
      datos.rol === "cliente"
        ? {
            ...CLIENTE_BASE,
            ...base,
            alias: normalizar(datos.alias),
            cbu: generarCbu(),
            saldo: datos.saldo,
            movimientos: datos.saldo > 0
              ? [{ id: uid(), ts: ahora, titulo: "Depósito inicial", monto: datos.saldo, estado: "aprobado" }]
              : [],
          }
        : base;

    setEstado(
      registrar(
        { ...estado, usuarios: [...usuarios, usuario] },
        actor,
        "Creó un usuario",
        `${usuario.nombre} · ${usuario.rol === "admin" ? "Administrador" : "Cliente"}`,
        "admin"
      )
    );
    return { ok: true, usuario };
  };

  const editarUsuario = (id, datos) => {
    const actual = usuarios.find((u) => u.id === id);
    const error = validarUsuario(datos, id);
    if (error) return { ok: false, error };
    if (id === sesion.id && datos.rol !== actual.rol) return { ok: false, error: "No podés cambiar tu propio rol" };
    if (actual.rol === "cliente" && datos.rol === "admin" && actual.saldo > 0) {
      return { ok: false, error: "La cuenta tiene saldo: no puede pasar a ser administrador" };
    }

    const cambios = {
      nombre: datos.nombre.trim(),
      email: normalizar(datos.email),
      rol: datos.rol,
      ...(datos.password ? { password: datos.password } : {}),
    };
    if (datos.rol === "cliente") {
      Object.assign(cambios, {
        ...(actual.rol === "admin" ? { ...CLIENTE_BASE, cbu: generarCbu() } : {}),
        alias: normalizar(datos.alias),
      });
    }

    setEstado(
      registrar(
        conUsuario(estado, id, (u) => ({ ...u, ...cambios })),
        actor,
        "Editó un usuario",
        cambios.nombre + (datos.password ? " · cambió la contraseña" : ""),
        "admin"
      )
    );
    return { ok: true };
  };

  const cambiarBloqueo = (id, motivo = "") => {
    const u = usuarios.find((x) => x.id === id);
    if (id === sesion.id) return { ok: false, error: "No podés bloquear tu propia cuenta" };
    const bloquear = u.estado === "activo";

    setEstado(
      registrar(
        conUsuario(estado, id, (x) => ({
          ...x,
          estado: bloquear ? "bloqueado" : "activo",
          motivoBloqueo: bloquear ? motivo : undefined,
        })),
        actor,
        bloquear ? "Bloqueó un usuario" : "Desbloqueó un usuario",
        u.nombre + (bloquear && motivo ? ` · ${motivo}` : ""),
        "admin"
      )
    );
    return { ok: true, bloqueado: bloquear };
  };

  const eliminarUsuario = (id) => {
    const u = usuarios.find((x) => x.id === id);
    if (id === sesion.id) return { ok: false, error: "No podés eliminar tu propia cuenta" };
    if (u.rol === "cliente" && u.saldo > 0) {
      return { ok: false, error: "La cuenta tiene saldo. Debitalo o bloqueá la cuenta en su lugar." };
    }
    setEstado(
      registrar(
        { ...estado, usuarios: usuarios.filter((x) => x.id !== id) },
        actor,
        "Eliminó un usuario",
        u.nombre,
        "admin"
      )
    );
    return { ok: true };
  };

  const restablecerClave = (id) => {
    const u = usuarios.find((x) => x.id === id);
    const clave = generarClave();
    setEstado(
      registrar(
        conUsuario(estado, id, (x) => ({ ...x, password: clave })),
        actor,
        "Generó una contraseña temporal",
        u.nombre,
        "admin"
      )
    );
    return clave;
  };

  const ajustarSaldo = (id, tipo, monto, motivo) => {
    const u = usuarios.find((x) => x.id === id);
    if (isNaN(monto) || monto <= 0) return { ok: false, error: "Ingresá un monto válido" };
    if (tipo === "debito" && monto > u.saldo) return { ok: false, error: "El débito supera el saldo de la cuenta" };

    const valor = tipo === "debito" ? -monto : monto;
    setEstado(
      registrar(
        conUsuario(estado, id, (x) => ({
          ...x,
          saldo: x.saldo + valor,
          movimientos: [
            { id: uid(), ts: Date.now(), titulo: motivo, monto: valor, estado: "aprobado", ajuste: true },
            ...x.movimientos,
          ],
        })),
        actor,
        tipo === "debito" ? "Debitó saldo" : "Acreditó saldo",
        `${u.nombre} · ${$(monto)} · ${motivo}`,
        "admin"
      )
    );
    return { ok: true };
  };

  const resolverTransferencia = (usuarioId, movId, aprobar) => {
    const u = usuarios.find((x) => x.id === usuarioId);
    const m = u?.movimientos.find((x) => x.id === movId);
    if (!m || m.estado !== "pendiente") return;

    const ahora = Date.now();
    let nuevo = conUsuario(estado, usuarioId, (x) => ({
      ...x,
      // si se rechaza, se devuelve el dinero retenido (m.monto es negativo)
      saldo: aprobar ? x.saldo : x.saldo - m.monto,
      movimientos: x.movimientos.map((y) =>
        y.id === movId
          ? { ...y, estado: aprobar ? "aprobado" : "rechazado", revisadoPor: actor, revisadoTs: ahora }
          : y
      ),
    }));
    if (aprobar && m.destinoId) nuevo = acreditar(nuevo, m.destinoId, u.nombre, -m.monto, ahora);

    setEstado(
      registrar(
        nuevo,
        actor,
        aprobar ? "Aprobó una transferencia" : "Rechazó una transferencia",
        `${u.nombre} → ${m.destino} · ${$(-m.monto)}`,
        "admin"
      )
    );
  };

  const guardarConfig = (cambios) => {
    setEstado(
      registrar(
        { ...estado, config: { ...config, ...cambios } },
        actor,
        "Cambió el límite de revisión",
        `${$(config.limiteRevision)} → ${$(cambios.limiteRevision)}`,
        "admin"
      )
    );
  };

  const restablecerDatos = () => {
    const semilla = crearSeed();
    const sigueLogueado = semilla.usuarios.some((u) => u.id === estado.sesionId);
    setEstado(
      registrar(
        { ...semilla, sesionId: sigueLogueado ? estado.sesionId : null },
        actor,
        "Restableció los datos de demostración",
        "",
        "admin"
      )
    );
  };

  const valor = {
    usuarios,
    auditoria,
    config,
    sesion,
    pendientes,
    buscarCuenta,
    login,
    logout,
    transferir,
    crearUsuario,
    editarUsuario,
    cambiarBloqueo,
    eliminarUsuario,
    restablecerClave,
    ajustarSaldo,
    resolverTransferencia,
    guardarConfig,
    restablecerDatos,
  };

  return <BancoContext.Provider value={valor}>{children}</BancoContext.Provider>;
}

// eslint-disable-next-line react/only-export-components
export const useBanco = () => useContext(BancoContext);

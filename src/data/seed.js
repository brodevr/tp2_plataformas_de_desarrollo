// Datos iniciales hardcodeados (no hay backend).
// Las fechas se calculan relativas a "hoy" para que la demo siempre se vea actual.

const hace = (dias, h, m) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(h, m, 0, 0);
  return d.getTime();
};

let contador = 0;
const mov = (dias, h, m, titulo, monto, extra = {}) => ({
  id: `m${++contador}`,
  ts: hace(dias, h, m),
  titulo,
  monto,
  estado: "aprobado",
  ...extra,
});

export const CLIENTE_BASE = {
  saldo: 0,
  dolares: 0,
  reservas: 0,
  inversiones: 0,
  movimientos: [],
  contactos: [],
};

export function crearSeed() {
  contador = 0;

  const usuarios = [
    {
      id: "u1",
      nombre: "Juan Ferreyra",
      email: "admin@demo.com",
      password: "123456",
      rol: "admin",
      estado: "activo",
      alta: hace(420, 9, 0),
      ultimoAcceso: hace(1, 17, 32),
    },
    {
      ...CLIENTE_BASE,
      id: "u2",
      nombre: "Carlos Méndez",
      email: "carlos@demo.com",
      password: "abcdef",
      rol: "cliente",
      estado: "activo",
      alta: hace(380, 11, 20),
      ultimoAcceso: hace(0, 9, 2),
      alias: "carlos.mendez.mp",
      cbu: "0000003100010203040506",
      saldo: 245680.5,
      dolares: 1250,
      reservas: 52300,
      inversiones: 120000,
      contactos: [
        { nombre: "Martina Rios", alias: "martina.rios" },
        { nombre: "Juan Pablo Torres", alias: "jp.torres" },
        { nombre: "Sofia Duarte", alias: "sofi.duarte" },
      ],
      movimientos: [
        mov(0, 10, 32, "Transferencia de Martina Rios", 25000),
        mov(0, 9, 15, "Farmacia Central", -4320),
        mov(1, 18, 45, "Supermercado Norte", -18450),
        mov(1, 12, 10, "Reembolso", 2100),
        mov(4, 8, 0, "StreamPlus", -3990),
        mov(6, 7, 30, "Sueldo", 180000),
        mov(7, 16, 20, "Transferencia a Lucas Pereyra", -12000, { destino: "Lucas Pereyra", destinoId: "u6" }),
      ],
    },
    {
      ...CLIENTE_BASE,
      id: "u3",
      nombre: "Martina Rios",
      email: "martina@demo.com",
      password: "123456",
      rol: "cliente",
      estado: "activo",
      alta: hace(210, 15, 45),
      ultimoAcceso: hace(0, 10, 30),
      alias: "martina.rios",
      cbu: "0000003100048827710394",
      saldo: 98340,
      reservas: 30000,
      contactos: [{ nombre: "Carlos Méndez", alias: "carlos.mendez.mp" }],
      movimientos: [
        mov(0, 10, 32, "Transferencia a Carlos Méndez", -25000, { destino: "Carlos Méndez", destinoId: "u2" }),
        mov(2, 9, 0, "Sueldo", 210000),
        mov(3, 20, 15, "Restaurante El Puerto", -15600),
        mov(5, 13, 40, "Librería Alfa", -7200),
      ],
    },
    {
      ...CLIENTE_BASE,
      id: "u4",
      nombre: "Juan Pablo Torres",
      email: "jp@demo.com",
      password: "123456",
      rol: "cliente",
      estado: "activo",
      alta: hace(95, 10, 5),
      ultimoAcceso: hace(0, 11, 2),
      alias: "jp.torres",
      cbu: "0000003100071100552861",
      saldo: 412500,
      inversiones: 300000,
      movimientos: [
        mov(0, 11, 5, "Transferencia a Inmobiliaria Sur", -320000, {
          estado: "pendiente",
          destino: "Inmobiliaria Sur",
          destinoId: null,
        }),
        mov(3, 16, 30, "Venta de vehículo", 650000),
        mov(4, 9, 10, "Seguro del auto", -24500),
      ],
    },
    {
      ...CLIENTE_BASE,
      id: "u5",
      nombre: "Sofia Duarte",
      email: "sofi@demo.com",
      password: "123456",
      rol: "cliente",
      estado: "activo",
      alta: hace(30, 12, 0),
      ultimoAcceso: hace(2, 21, 15),
      alias: "sofi.duarte",
      cbu: "0000003100090412237745",
      saldo: 15780,
      movimientos: [
        mov(1, 14, 0, "Cuota gimnasio", -9500),
        mov(8, 7, 30, "Sueldo", 145000),
        mov(8, 19, 10, "Alquiler", -119720),
      ],
    },
    {
      ...CLIENTE_BASE,
      id: "u6",
      nombre: "Lucas Pereyra",
      email: "lucas@demo.com",
      password: "123456",
      rol: "cliente",
      estado: "bloqueado",
      motivoBloqueo: "Actividad sospechosa",
      alta: hace(60, 18, 30),
      ultimoAcceso: hace(2, 3, 47),
      alias: "lucas.pereyra",
      cbu: "0000003100055519920017",
      saldo: 3200,
      movimientos: [
        mov(2, 3, 41, "Compra online", -8800),
        mov(7, 16, 20, "Transferencia de Carlos Méndez", 12000),
      ],
    },
  ];

  const auditoria = [
    { id: "a1", ts: hace(0, 11, 5), actor: "Juan Pablo Torres", accion: "Transferencia retenida", detalle: "$ 320.000,00 a Inmobiliaria Sur · supera el límite", tipo: "operacion" },
    { id: "a2", ts: hace(0, 10, 32), actor: "Martina Rios", accion: "Transferencia", detalle: "$ 25.000,00 a Carlos Méndez", tipo: "operacion" },
    { id: "a3", ts: hace(0, 9, 2), actor: "Carlos Méndez", accion: "Inicio de sesión", detalle: "Home banking", tipo: "acceso" },
    { id: "a4", ts: hace(1, 17, 40), actor: "Juan Ferreyra", accion: "Bloqueó un usuario", detalle: "Lucas Pereyra · Actividad sospechosa", tipo: "admin" },
    { id: "a5", ts: hace(2, 3, 47), actor: "Lucas Pereyra", accion: "Inicio de sesión", detalle: "Home banking", tipo: "acceso" },
  ];

  return {
    // huella de los usuarios iniciales: si cambian acá, la app descarta los datos guardados
    firma: JSON.stringify(usuarios.map((u) => [u.id, u.nombre, u.email, u.password, u.rol, u.estado])),
    usuarios,
    auditoria,
    config: { limiteRevision: 150000 },
    sesionId: null,
  };
}

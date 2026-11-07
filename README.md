# MiBanco — Home banking + panel de administración

Trabajo práctico de **Plataformas de Desarrollo** (ACN4AV · Escuela Da Vinci).
Versión web de la app Android de Aplicaciones Móviles: misma identidad visual y mismas pantallas del cliente,
más un panel interno para el banco.

Solo frontend (React + Vite). No hay API ni backend: los datos están hardcodeados en `src/data/seed.js`
y los cambios se guardan en el `localStorage` del navegador.

## Usuarios de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | admin@demo.com | 123456 |
| Cliente | user@demo.com | abcdef |
| Cliente | martina@demo.com, jp@demo.com, sofi@demo.com | 123456 |
| Cliente bloqueado | lucas@demo.com | 123456 |

En el login hay botones para completar los datos de demo.

## Funcionalidades

**Cliente**
- Saldo por cuenta (pesos, dólares, reservas, inversiones) con opción de ocultarlo.
- Transferencias por alias o CBU, con contactos frecuentes que se actualizan solos, montos rápidos y
  validaciones. Si el destino es otro cliente de MiBanco, el dinero se le acredita.
- Las transferencias que superan el límite del banco quedan **en revisión** y el dinero queda reservado.
- Historial con filtros (ingresos, egresos, en revisión) y buscador.
- Alias y CBU con botón de copiar.

**Administrador**
- Panel con indicadores: clientes activos, dinero en custodia, operaciones del día, revisiones pendientes.
- Gestión de usuarios: alta, edición, bloqueo con motivo, baja y contraseña temporal.
- Ficha de cada cliente con sus movimientos y **ajuste manual de saldo** (acreditar o debitar con motivo).
- Revisión de transferencias retenidas: aprobar (se acredita al destino) o rechazar (se devuelve el dinero).
- Auditoría: registro de accesos, operaciones y acciones administrativas, con filtros y búsqueda.
- Configuración del límite de revisión y botón para restablecer los datos de demo.

## Estructura

```
src/
  components/   piezas reutilizables (Layout, Modal, tablas, badges, filtros…)
  context/      BancoContext: estado global y todas las acciones
  data/         datos iniciales hardcodeados
  hooks/        useCountUp (animación de montos)
  pages/        Login, pantallas del cliente y del administrador
  styles/       base, estructura, admin y login
```

## Scripts

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # genera la carpeta dist/
```

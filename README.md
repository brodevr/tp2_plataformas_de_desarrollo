# MiBanco — Home banking + panel de administración

Trabajo práctico de **Plataformas de Desarrollo** (ACN4AV · Escuela Da Vinci).
Versión web de la app Android que hicimos en Aplicaciones Móviles: misma identidad visual y mismas
pantallas del cliente, más un panel interno para que el banco administre usuarios y operaciones.

Solo frontend (HTML, CSS y JavaScript con React + Vite). No hay API ni backend: los datos iniciales están
escritos en `src/data/seed.js` y los cambios se guardan en el `localStorage` del navegador.

---

## Índice

1. [Cómo correrlo](#cómo-correrlo)
2. [Usuarios de prueba](#usuarios-de-prueba)
3. [Cómo cumplimos la consigna](#cómo-cumplimos-la-consigna)
4. [React en pocas palabras (con ejemplos del proyecto)](#react-en-pocas-palabras-con-ejemplos-del-proyecto)
5. [Cómo está armada la app](#cómo-está-armada-la-app)
6. [Página por página](#página-por-página)
7. [Componentes reutilizables](#componentes-reutilizables)
8. [Reglas del banco](#reglas-del-banco)
9. [Estilos](#estilos)
10. [Datos y persistencia](#datos-y-persistencia)
11. [Recorrido sugerido para la exposición](#recorrido-sugerido-para-la-exposición)

---

## Cómo correrlo

```bash
npm install      # instala dependencias (solo la primera vez)
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # genera la carpeta dist/ con la versión compilada
npm run lint     # revisa el código con oxlint
```

## Usuarios de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | admin@demo.com | 123456 |
| Cliente (Carlos Méndez) | carlos@demo.com | abcdef |
| Cliente | martina@demo.com, jp@demo.com, sofi@demo.com | 123456 |
| Cliente bloqueado | lucas@demo.com | 123456 |

En el login hay botones "Probar como…" que completan los datos.

---

## Cómo cumplimos la consigna

| Pide la consigna | Cómo lo resolvimos |
| --- | --- |
| Usuarios: login, logout, gestión | Login con validación, logout desde la barra superior y una pantalla de **Usuarios** para crear, editar, bloquear y eliminar. |
| Al menos dos roles | **Cliente** y **Administrador**. Cada uno ve un menú y pantallas distintas, y un cliente no puede entrar a las del admin. |
| Gestionar la información desde la interfaz | Todo se crea y modifica desde pantallas: usuarios, saldos, transferencias, aprobaciones y el límite del banco. |
| Separar en componentes | Cada pantalla y cada pieza visual es un componente en su propio archivo (`components/` y `pages/`). |
| Solo tecnologías de frontend | React + Vite. Sin servidor, sin base de datos, sin otros lenguajes. |
| Información hardcodeada, sin API | Los datos iniciales están en `src/data/seed.js`. |
| Funcionalidades originales | Transferencias que quedan **en revisión** si superan un límite, acreditación real entre clientes, ajustes de saldo con motivo y **auditoría** de todo lo que pasa. |

---

## React en pocas palabras (con ejemplos del proyecto)

React es una librería para armar interfaces a partir de **componentes**: funciones que devuelven lo que se
tiene que ver en pantalla. Cuando cambian los datos, React vuelve a ejecutar esas funciones y actualiza solo
lo que cambió en la página.

### Componentes y JSX

Un componente es una función que devuelve **JSX**, una sintaxis parecida a HTML dentro de JavaScript.
Ejemplo real, `src/components/StatCard.jsx`:

```jsx
export default function StatCard({ icono, etiqueta, valor, onClick }) {
  return (
    <button className="hb-panel hb-stat" onClick={onClick}>
      <Icon name={icono} size={18} />
      <small>{etiqueta}</small>
      <strong>{valor}</strong>
    </button>
  );
}
```

- En JSX se usa `className` en lugar de `class`.
- Lo que va entre llaves `{ }` es JavaScript: variables, cuentas, funciones.

### Props: datos que un componente le pasa a otro

Las **props** son los "parámetros" de un componente. La misma `StatCard` se usa con datos distintos:

```jsx
<StatCard icono="arrowDown" etiqueta="Ingresos" valor="$ 207.100,00" />
<StatCard icono="arrowUp" etiqueta="Egresos" valor="$ 38.760,00" />
```

Así escribimos el diseño una sola vez y lo reutilizamos.

### Estado con `useState`

El **estado** es información que puede cambiar mientras la pantalla está abierta. Cuando cambia, React
vuelve a dibujar el componente. Ejemplo del Inicio: el ojo que oculta el saldo.

```jsx
const [oculto, setOculto] = useState(false);   // valor inicial: visible

<button onClick={() => setOculto(!oculto)}>…</button>
<p>{oculto ? "$ ••••••" : `$ ${formatearMonto(saldo)}`}</p>
```

`oculto` es el valor actual y `setOculto` la función para cambiarlo. Nunca se modifica la variable a mano:
siempre se usa el `set…`, para que React se entere.

### Eventos

Se escriben como props que reciben una función: `onClick`, `onChange`, `onSubmit`. En los formularios
cada campo está **controlado** por el estado:

```jsx
<input value={monto} onChange={(e) => setMonto(e.target.value)} />
```

### Mostrar cosas según una condición

```jsx
{error && <p className="lg-error">{error}</p>}          // solo si hay error
{esAdmin ? <span>Administrador</span> : <span>Cliente</span>}
```

### Listas con `.map()` y `key`

Para dibujar una lista se recorre un array. Cada elemento lleva una `key` única para que React sepa cuál es cuál:

```jsx
{movimientos.map((m) => (
  <tr key={m.id}>…</tr>
))}
```

### Efectos con `useEffect`

Sirven para hacer algo **después** de dibujar: guardar en `localStorage`, escuchar el teclado, animaciones.
En `BancoContext.jsx` guardamos los datos cada vez que cambian:

```jsx
useEffect(() => {
  localStorage.setItem(CLAVE, JSON.stringify(estado));
}, [estado]);   // se ejecuta cada vez que cambia "estado"
```

### Contexto con `useContext`: datos compartidos por toda la app

Varias pantallas necesitan los mismos datos (usuarios, sesión, saldos). En vez de pasarlos de prop en prop,
creamos un **contexto**, una especie de "base de datos" en memoria que cualquier componente puede leer:

```jsx
// En App.jsx envolvemos toda la app
<BancoProvider>
  <Aplicacion />
</BancoProvider>

// En cualquier pantalla
const { sesion, transferir } = useBanco();
```

### Hooks propios

Un **hook** es una función que usa otros hooks. Hicimos `useCountUp` (`src/hooks/useCountUp.js`), que anima
un número desde su valor anterior hasta el nuevo. Lo usamos para el saldo del Inicio.

### Vite

Es la herramienta que levanta el servidor de desarrollo (`npm run dev`) con recarga instantánea, y que en
`npm run build` empaqueta todo en la carpeta `dist/` para publicarlo.

---

## Cómo está armada la app

### Carpetas

```
src/
  main.jsx              punto de entrada: monta <App /> e importa los estilos
  App.jsx               decide qué pantalla mostrar según el rol y la navegación
  utils.js              funciones de ayuda (formatear montos y fechas, generar alias/CBU…)
  context/
    BancoContext.jsx    estado global y TODAS las acciones (login, transferir, crear usuario…)
  data/
    seed.js             usuarios, movimientos y auditoría iniciales
  hooks/
    useCountUp.js       animación de números
  components/           piezas reutilizables (Layout, Modal, tabla, badges, filtros…)
  pages/
    Login.jsx
    cliente/            Home, Transferir, Movimientos, Alias
    admin/              Panel, Usuarios, UsuarioDetalle, Revisiones, Auditoria, Configuracion
                        + UsuarioForm y AccionesUsuario (modales de gestión)
  styles/               base.css, app.css, admin.css, login.css
  assets/               imagen de fondo del login (optimizada en WebP)
```

### Flujo de los datos

```
seed.js ──► BancoContext (estado + localStorage) ──► App.jsx ──► Layout ──► página ──► componentes
                  ▲                                                            │
                  └──────────── acciones: transferir(), crearUsuario()… ◄──────┘
```

1. Al abrir la app, `BancoContext` carga los datos guardados en el navegador o, si no hay, los de `seed.js`.
2. Las páginas **leen** los datos con `useBanco()`.
3. Cuando el usuario hace algo (transferir, bloquear, aprobar…), la página llama a una **acción** del contexto.
4. La acción valida, arma el estado nuevo, agrega un registro en la auditoría y lo guarda.
5. React vuelve a dibujar todas las pantallas que usan esos datos.

Las acciones nunca modifican los objetos existentes: crean copias con los cambios (`{ ...usuario, saldo: nuevo }`).
Así React detecta el cambio y actualiza la interfaz.

### Navegación sin librerías

No usamos React Router. En `App.jsx` hay un estado `vista` con la pantalla actual, y una función `irA()` que
se pasa a las páginas:

```jsx
const [vista, setVista] = useState({ id: null });
const irA = (nuevo, params = {}) => setVista({ id: nuevo, ...params });

// desde cualquier página:
irA("transferir");
irA("usuario", { usuarioId: "u2" });   // con parámetros
```

`App.jsx` también controla los permisos: cada rol tiene una lista de pantallas permitidas (`PERMITIDAS`).
Si se intenta abrir otra, se muestra la pantalla de inicio de ese rol.

### Avisos

`App.jsx` tiene la función `avisar(texto, tipo)`, que muestra un aviso flotante abajo de la pantalla durante
3 segundos. Hay tres tipos: `ok` (azul), `warn` (ámbar) y `error` (rojo). Las páginas la reciben como prop.

---

## Página por página

### Login — `pages/Login.jsx`

- Formulario de correo y contraseña con íconos y botón para ver u ocultar la contraseña.
- Valida que los campos no estén vacíos y llama a `login()` del contexto, que busca el usuario en los datos.
- Si los datos son incorrectos, el formulario **se sacude** y muestra el error. Para repetir la animación
  usamos un truco: cambiar la `key` del formulario hace que React lo vuelva a crear.
- Un usuario **bloqueado** no puede entrar, y el intento queda registrado en la auditoría.
- Al entrar, el botón muestra un spinner durante 600 ms para simular la verificación.
- Los botones "Probar como…" completan los datos de los usuarios demo.
- El panel izquierdo tiene la foto de fondo con un degradé azul encima, para que el texto se lea bien.

### Pantallas del cliente

**Inicio — `pages/cliente/Home.jsx`**
- Pestañas Pesos / Dólares / Reservas / Inversiones con el saldo de cada una. El número se anima con
  `useCountUp` al cambiar de pestaña o después de transferir.
- Ojo para ocultar los montos, botones rápidos a Transferir y a Alias y CBU.
- Si hay transferencias **en revisión**, aparece un aviso con el total reservado.
- Tres indicadores (ingresos, egresos y cantidad de movimientos) calculados en el momento a partir de los
  movimientos reales; no se guardan aparte.
- Los últimos 5 movimientos. Después de transferir, el nuevo aparece resaltado con la etiqueta "Nuevo".

**Transferir — `pages/cliente/Transferir.jsx`**
- Campo de destinatario (alias o CBU). Mientras se escribe, busca la cuenta y avisa si es un cliente de
  MiBanco, una cuenta de otro banco, una cuenta bloqueada o la propia.
- Campo de monto con botones de montos rápidos y "Todo".
- Resumen en vivo: cuánto queda disponible o, si no alcanza, cuánto falta (y el campo se pone rojo).
- Si el monto supera el **límite de revisión**, avisa que la transferencia va a quedar pendiente y el botón
  cambia a "Enviar a revisión".
- Contactos frecuentes: se completan solos con cada transferencia que se hace.
- Al confirmar, llama a `transferir()` del contexto y vuelve al Inicio con un aviso.

**Movimientos — `pages/cliente/Movimientos.jsx`**
- Historial completo con filtros (Todos, Ingresos, Egresos, En revisión) y buscador.
- La lista filtrada no se guarda en el estado: se calcula en cada render a partir de los movimientos y de
  los filtros elegidos.

**Alias y CBU — `pages/cliente/Alias.jsx`**
- Muestra titular, alias y CBU del usuario logueado, con botones para copiar cada dato o todos juntos.
- Copia con `navigator.clipboard` y el botón cambia a "Copiado" por un momento.

### Pantallas del administrador

**Panel — `pages/admin/Panel.jsx`**
- Cuatro indicadores: clientes activos, dinero en custodia (suma de saldos), operaciones de hoy y
  revisiones pendientes (resaltado en ámbar si hay alguna).
- Aviso con la primera transferencia esperando aprobación.
- Actividad de todas las cuentas juntas, ranking de mayores saldos y últimas acciones de la auditoría.
- Todo se calcula combinando los datos de todos los clientes (`flatMap`, `sort`, `reduce`).

**Usuarios — `pages/admin/Usuarios.jsx`**
- Tabla de todos los usuarios con filtros (Todos, Clientes, Admins, Bloqueados) y buscador por nombre,
  correo o alias.
- Acciones por fila: editar, bloquear o desbloquear y eliminar. Al tocar una fila se abre la ficha.
- Botón "Nuevo usuario".

**Formulario de usuario — `pages/admin/UsuarioForm.jsx`**
- Un mismo modal para crear y para editar: si recibe un usuario, edita; si no, crea.
- Al escribir el nombre genera un alias sugerido (por ejemplo "Ana Paz" → `ana.paz.mb`). El CBU se asigna solo.
- Las validaciones están en el contexto (`validarUsuario`): correo válido y no repetido, contraseña de al
  menos 6 caracteres, alias de 6 a 20 caracteres y no repetido.

**Acciones de usuario — `pages/admin/AccionesUsuario.jsx`**
- Componente que reúne todos los modales de gestión (crear, editar, bloquear con motivo, eliminar,
  contraseña temporal) para usarlos tanto en la lista como en la ficha sin repetir código.
- Usa el patrón **render prop**: recibe una función como hijo y le entrega las acciones disponibles.

**Ficha del usuario — `pages/admin/UsuarioDetalle.jsx`**
- Datos del usuario (alias, CBU, fecha de alta, último acceso), estado y motivo de bloqueo.
- Botones para editar, generar una contraseña temporal, bloquear y eliminar.
- Saldo de todas sus cuentas y **ajuste manual**: acreditar o debitar un monto con un motivo. El ajuste
  aparece en los movimientos del cliente con un ícono distinto y queda en la auditoría.
- Todos sus movimientos.

**Revisiones — `pages/admin/Revisiones.jsx`**
- Tarjetas con cada transferencia retenida: quién, a quién, cuánto, cuántas veces supera el límite y
  cuánto saldo le queda al cliente.
- **Aprobar**: la transferencia pasa a "Aprobado" y, si el destino es cliente de MiBanco, se le acredita.
- **Rechazar**: pasa a "Rechazado" y el dinero vuelve a la cuenta del cliente.
- Lista de las últimas revisiones resueltas y quién las resolvió.

**Auditoría — `pages/admin/Auditoria.jsx`**
- Registro de todo: inicios y cierres de sesión, accesos denegados, transferencias y acciones del admin.
- Filtros por tipo (Accesos, Operaciones, Admin), buscador y botón "Mostrar más" (de a 25).

**Configuración — `pages/admin/Configuracion.jsx`**
- Permite cambiar el **límite de revisión** (por defecto $150.000), con montos sugeridos.

---

## Componentes reutilizables

| Componente | Para qué sirve | Dónde se usa |
| --- | --- | --- |
| `Layout` | Barra lateral con el menú según el rol, barra superior con usuario y logout, y avisos flotantes | Todas las pantallas internas |
| `MovimientosTabla` | Tabla de movimientos con fecha, detalle, estado y monto | Inicio, Movimientos, Panel y Ficha |
| `EstadoBadge` | Etiqueta de color según el estado (aprobado, en revisión, bloqueado…) | Tablas, ficha y revisiones |
| `StatCard` | Tarjeta de indicador con ícono, etiqueta y valor | Inicio y Panel |
| `Segmento` | Botones de filtro tipo "pestañas" | Movimientos, Usuarios, Auditoría y formularios |
| `Buscador` | Campo de búsqueda con botón para limpiar | Movimientos, Usuarios y Auditoría |
| `Modal` | Ventana emergente que se cierra con Escape o tocando afuera | Formularios y confirmaciones |
| `ConfirmDialog` | Modal de "¿Estás seguro?" con botón de confirmar | Bloquear, eliminar y contraseña |
| `Icon` | Íconos SVG propios, sin librerías externas | En toda la app |

---

## Reglas del banco

Están implementadas en `context/BancoContext.jsx`:

- **Límite de revisión**: las transferencias mayores al límite quedan "En revisión". El dinero se descuenta
  igual (queda reservado) y se devuelve si el administrador la rechaza.
- **Transferencias entre clientes**: si el alias o CBU de destino es de otro cliente de MiBanco, el dinero se
  le acredita y le aparece el movimiento "Transferencia de …".
- No se puede transferir a la propia cuenta, a una cuenta bloqueada ni más que el saldo disponible.
- Un usuario bloqueado no puede iniciar sesión ni recibir transferencias.
- No se puede eliminar una cuenta que tiene saldo (hay que debitarlo o bloquearla).
- Un administrador no puede bloquearse, eliminarse ni cambiarse el rol a sí mismo.
- Una cuenta con saldo no puede pasar a ser administrador.
- Cada acción importante se registra en la **auditoría** con fecha, quién la hizo y el detalle.

---

## Estilos

- CSS propio, sin frameworks. Los colores son variables definidas en `styles/base.css` (`--navy`, `--teal`,
  `--gold`…), con la misma paleta que la app Android.
- `app.css`: estructura (barra lateral, barra superior, paneles, tablas) y pantallas del cliente.
- `admin.css`: badges, modales, formularios y pantallas del administrador.
- `login.css`: pantalla de inicio de sesión.
- **Responsive**: en pantallas chicas la barra lateral se esconde detrás del botón ☰, las columnas se apilan
  y las tablas ocultan columnas secundarias.
- **Animaciones**: las pantallas y filas entran con un leve desplazamiento, el saldo se anima, los modales
  aparecen con zoom y el login se sacude ante un error.
- La foto del login se convirtió a WebP en dos tamaños (92 KB y 34 KB, en lugar de los 3,9 MB del original).

---

## Datos y persistencia

- Los datos iniciales están en `src/data/seed.js`. Las fechas se calculan relativas a hoy, para que la demo
  siempre muestre movimientos de "Hoy" y "Ayer".
- Todo lo que se hace en la app se guarda en el `localStorage` del navegador, en la clave `mibanco-db-v1`.
  Si se recarga la página, los cambios siguen ahí.
- **Si se editan los usuarios en `seed.js`**, alcanza con recargar: la app guarda una "firma" de los usuarios
  iniciales y, si no coincide, descarta lo guardado y vuelve a cargar `seed.js`.
- Para volver a los datos originales a mano: F12 → Console →
  `localStorage.removeItem("mibanco-db-v1"); location.reload();`
- Cada dirección tiene sus propios datos: `localhost:5173` y una URL publicada no comparten lo guardado.

---

## Recorrido sugerido para la exposición

1. Entrar como **Carlos** (cliente). Mostrar el saldo, ocultarlo con el ojo y cambiar de pestaña.
2. Transferir **$ 10.000 a `martina.rios`**: se descuenta al instante y aparece resaltada en el Inicio.
3. Transferir **$ 200.000** a cualquier alias: queda **en revisión** y aparece el aviso en el Inicio.
4. Mostrar Movimientos con los filtros y el buscador, y copiar el alias en Alias y CBU.
5. Cerrar sesión y entrar como **administrador**. En el Panel se ve la revisión pendiente.
6. En Revisiones, **aprobar o rechazar** la transferencia de Carlos.
7. En Usuarios, abrir la ficha de Martina: le llegaron los $ 10.000. Hacerle un ajuste de saldo.
8. Crear un usuario nuevo, bloquearlo y mostrar que no puede entrar.
9. Terminar en **Auditoría**, donde quedó registrado todo lo anterior.

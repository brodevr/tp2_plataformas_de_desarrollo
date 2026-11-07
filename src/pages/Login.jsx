import { useState } from "react";
import fondo from "../assets/login-fondo.webp";
import fondoChico from "../assets/login-fondo-800.webp";
import Icon from "../components/Icon";
import { useBanco } from "../context/BancoContext";

const DEMOS = [
  { texto: "Cliente demo Carlos", email: "carlos@demo.com", password: "abcdef" },
  { texto: "Cliente demo Martina", email: "martina@demo.com", password: "123456" },
  { texto: "Administrador demo", email: "admin@demo.com", password: "123456" },
];

export default function Login() {
  const { login } = useBanco();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [sacudir, setSacudir] = useState(0);

  const fallar = (msg) => {
    setError(msg);
    setSacudir((n) => n + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cargando) return;
    if (!email.trim() || !password) return fallar("Completá todos los campos");

    setError("");
    setCargando(true);
    // pequeña espera para simular la verificación
    setTimeout(() => {
      const r = login(email, password);
      if (!r.ok) {
        setCargando(false);
        fallar(r.error);
      }
    }, 600);
  };

  const usarDemo = (d) => {
    setEmail(d.email);
    setPassword(d.password);
    setError("");
  };

  return (
    <div className="lg-page">
      <aside className="lg-lado" style={{ "--lg-fondo": `url(${fondo})`, "--lg-fondo-chico": `url(${fondoChico})` }}>
        <div className="lg-marca">
          <span className="lg-logo"><Icon name="bank" size={22} /></span>
          MiBanco
        </div>
        <h2 className="lg-frase">Juntos, cuidamos lo tuyo.</h2>
      </aside>

      <main className="lg-form-wrap">
        <form key={sacudir} className={`lg-form ${sacudir ? "sacudir" : ""}`} onSubmit={handleSubmit} noValidate>
          <h1>Ingresá a tu cuenta</h1>
          <p className="lg-sub">Usá tu correo y contraseña para continuar.</p>

          <label className="lg-label">Correo</label>
          <div className="lg-campo">
            <Icon name="mail" size={18} />
            <input
              type="email"
              placeholder="nombre@correo.com"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label className="lg-label">Contraseña</label>
          <div className="lg-campo">
            <Icon name="lock" size={18} />
            <input
              type={verPass ? "text" : "password"}
              placeholder="••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="lg-ojo"
              onClick={() => setVerPass(!verPass)}
              title={verPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <Icon name={verPass ? "eyeOff" : "eye"} size={18} />
            </button>
          </div>

          {error && <p className="lg-error">{error}</p>}

          <button className="lg-entrar" type="submit" disabled={cargando}>
            {cargando ? <span className="lg-spinner" /> : "Entrar"}
          </button>

          <div className="lg-demos">
            <span>Probar como</span>
            {DEMOS.map((d) => (
              <button key={d.email} type="button" onClick={() => usarDemo(d)}>
                {d.texto}
              </button>
            ))}
          </div>
        </form>
      </main>
    </div>
  );
}

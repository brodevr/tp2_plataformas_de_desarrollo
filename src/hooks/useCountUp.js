import { useEffect, useRef, useState } from "react";

// Anima un número desde su valor anterior hasta el nuevo
export default function useCountUp(objetivo, ms = 600) {
  const [valor, setValor] = useState(objetivo);
  const actual = useRef(objetivo);

  useEffect(() => {
    const desde = actual.current;
    const inicio = performance.now();
    let raf;
    const paso = (t) => {
      const p = Math.min((t - inicio) / ms, 1);
      const suave = 1 - Math.pow(1 - p, 3);
      actual.current = desde + (objetivo - desde) * suave;
      setValor(actual.current);
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [objetivo, ms]);

  return valor;
}

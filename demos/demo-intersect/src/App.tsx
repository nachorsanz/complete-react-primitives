import { useInView } from "@complete/react-intersect";
function Block({ i }: { i: number }) {
  return (<div style={{ height: 300, margin: "16px 0", background: "#efefef", display: "grid", placeItems: "center" }}>Bloque {i}</div>);
}
export default function App() {
  const [ref, inView] = useInView({ rootMargin: "150px", once: true });
  return (<div style={{ fontFamily: "system-ui", padding: 24 }}>
    <h1>react-intersect</h1>
    {Array.from({ length: 8 }, (_, i) => <Block key={i} i={i + 1} />)}
    <div ref={ref} style={{ height: 240, background: inView ? "#c6f6d5" : "#fde68a", display: "grid", placeItems: "center" }}>
      {inView ? "¡En vista!" : "Desplázate hasta aquí"}
    </div>
    {Array.from({ length: 8 }, (_, i) => <Block key={i} i={i + 9} />)}
  </div>);
}
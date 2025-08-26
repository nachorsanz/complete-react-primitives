import { useUrlState } from "complete-react-url-state";
export default function App() {
  const [q, setQ] = useUrlState({ page: 1, q: "" }, { history: "push" });
  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>react-url-state</h1>
      <input value={q.q} onChange={(e) => setQ({ q: e.target.value, page: 1 })} placeholder="Buscar…" />
      <button onClick={() => setQ({ page: q.page + 1 })}>Next page</button>
      <pre>{JSON.stringify(q, null, 2)}</pre>
    </div>
  );
}

import { useStorage } from "@complete/react-storage";
export default function App() {
  const [token, setToken, clear] = useStorage("token", "", { ttl: 10_000, crossTab: true });
  return (<div style={{ fontFamily: "system-ui", padding: 24 }}>
    <h1>react-storage</h1>
    <p>Token: {token || "(vacío)"} </p>
    <button onClick={() => setToken(Math.random().toString(36).slice(2))}>Set token</button>
    <button onClick={clear}>Clear</button>
    <p>Caduca en 10s (TTL)</p>
  </div>);
}
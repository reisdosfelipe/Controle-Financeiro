import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";
import { Icon } from "./components/Icon.jsx";
import FinanceApp from "./FinanceApp.jsx";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking, null = logged out
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loginWithGithub() {
    setAuthError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.href },
    });
    if (error) setAuthError("Não consegui iniciar o login. Tenta de novo.");
  }

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f4ef", color: "#1c2b26", fontFamily: "Georgia, serif" }}>
        Carregando...
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f4ef", padding: 16 }}>
        <div style={{ maxWidth: 360, width: "100%", background: "#ffffff", border: "1px solid #e6e1d3", borderRadius: 16, padding: 32, textAlign: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#0f3d33", marginBottom: 6 }}>Controle financeiro</div>
          <div style={{ fontSize: 13, color: "#6b6558", marginBottom: 24 }}>Entre com sua conta do GitHub pra acessar seus lançamentos.</div>
          <button
            onClick={loginWithGithub}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#0f3d33", color: "#fff", border: "none", borderRadius: 10, padding: "12px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            <Icon name="github" size={18} color="#fff" /> Entrar com GitHub
          </button>
          {authError && <div style={{ marginTop: 12, fontSize: 12, color: "#991b1b" }}>{authError}</div>}
        </div>
      </div>
    );
  }

  return <FinanceApp user={session.user} />;
}

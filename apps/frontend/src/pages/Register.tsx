import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const msg = err.response.data?.message;
        setError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Error al registrarse"));
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">

      {/* Radial glow — surgical emerald from center */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 42%, rgba(0,245,160,0.055) 0%, transparent 68%)",
        }}
      />

      {/* Lab grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Content */}
      <div className="relative w-full max-w-[360px] animate-fade-in">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <svg
              className="w-[15px] h-[15px] text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12h4l2.5-7 3 14 2.5-7H22" />
            </svg>
          </div>
          <span className="text-[15px] font-mono font-medium text-zinc-100 tracking-tight">
            BioAI Hub
          </span>
        </div>

        {/* Card */}
        <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-lg shadow-2xl shadow-black/60 overflow-hidden">

          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent" />

          <div className="px-7 pt-7 pb-8">

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-600">
                  Nuevo acceso
                </span>
              </div>
              <h1 className="text-[15px] font-semibold text-zinc-100 leading-snug">Crear cuenta</h1>
              <p className="text-[11px] font-mono text-zinc-600 mt-1">Acceso al sistema de análisis médico</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-5 flex items-start gap-2 px-3 py-2.5 bg-red-500/8 border border-red-500/20 rounded-lg">
                <svg
                  className="w-3.5 h-3.5 text-red-400 shrink-0 mt-px"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="text-[11px] font-mono text-red-400 leading-relaxed">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-medium text-zinc-500 tracking-[0.1em] uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  placeholder="medico@hospital.com"
                  className="w-full px-3 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/60 focus:shadow-[0_0_15px_rgba(0,245,160,0.10)] disabled:opacity-40 transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-medium text-zinc-500 tracking-[0.1em] uppercase">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder="Mín. 8 caracteres"
                  className="w-full px-3 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/60 focus:shadow-[0_0_15px_rgba(0,245,160,0.10)] disabled:opacity-40 transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-medium text-zinc-500 tracking-[0.1em] uppercase">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder="Repetir contraseña"
                  className="w-full px-3 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/60 focus:shadow-[0_0_15px_rgba(0,245,160,0.10)] disabled:opacity-40 transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 font-semibold rounded-lg text-sm tracking-wide transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creando cuenta...
                  </span>
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] font-mono text-zinc-600">
              ¿Ya tenés cuenta?{" "}
              <Link
                to="/login"
                className="text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] font-mono text-zinc-700 tracking-wide">
          Proyecto educativo · No reemplaza criterio médico
        </p>
      </div>
    </div>
  );
}

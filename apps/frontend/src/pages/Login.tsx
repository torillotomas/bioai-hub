import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const msg = err.response.data?.message;
        setError(Array.isArray(msg) ? msg.join(", ") : (msg ?? "Error al iniciar sesión"));
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-[360px] animate-fade-in">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
            <svg
              className="w-[15px] h-[15px] text-indigo-600"
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
          <span className="text-[15px] font-semibold text-gray-800 tracking-tight">
            BioAI Hub
          </span>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-7 pt-7 pb-8">

            <div className="mb-6">
              <h1 className="text-lg font-semibold text-gray-800">Iniciar sesión</h1>
              <p className="text-sm text-gray-400 mt-1">Sistema de análisis médico</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                <svg
                  className="w-3.5 h-3.5 text-red-500 shrink-0 mt-px"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="text-[11px] text-red-600 leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-gray-600">
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
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:opacity-40 disabled:bg-gray-50 transition-all duration-150"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-gray-600">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:opacity-40 disabled:bg-gray-50 transition-all duration-150"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-all duration-150 shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Autenticando...
                  </span>
                ) : "Ingresar"}
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] text-gray-400">
              ¿No tenés cuenta?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
              >
                Registrarse
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-gray-400">
          Proyecto educativo · No reemplaza criterio médico
        </p>
      </div>
    </div>
  );
}

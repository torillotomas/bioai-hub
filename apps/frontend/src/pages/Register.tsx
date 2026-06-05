import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex">
      {/* Panel izquierdo — branding, oculto en mobile */}
      <div className="hidden lg:flex w-1/2 bg-[#071f14] flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-xl font-display text-white">BioAI Hub</span>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-display text-white leading-snug">
              Diagnóstico asistido<br />por inteligencia<br />artificial
            </h2>
            <p className="mt-5 text-[#6db891] text-base leading-relaxed">
              Análisis de radiografías de tórax con DenseNet121
              entrenado sobre NIH ChestX-ray14. Incluye Grad-CAM
              para visualizar qué zona activó el diagnóstico.
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-semibold text-white">14</p>
              <p className="text-xs text-[#6db891] mt-0.5">patologías</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-semibold text-white">112k</p>
              <p className="text-xs text-[#6db891] mt-0.5">radiografías</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-semibold text-white">Grad-CAM</p>
              <p className="text-xs text-[#6db891] mt-0.5">explicabilidad</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-[#3a6b4a]">
          Proyecto educativo. Los resultados no reemplazan el criterio médico.
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-4 bg-warm-bg">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 justify-center lg:hidden">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xl font-display font-normal text-warm-text">BioAI Hub</span>
          </div>

          <div className="bg-white border border-warm-border rounded-2xl shadow-sm p-8">
            <h1 className="text-xl font-semibold text-warm-text mb-6">Crear cuenta</h1>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-muted mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-3 py-3 border border-warm-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 min-h-[44px]"
                  placeholder="medico@hospital.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-muted mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full px-3 py-3 border border-warm-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 min-h-[44px]"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-muted mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-3 py-3 border border-warm-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 min-h-[44px]"
                  placeholder="Repetir contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm min-h-[44px]"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-warm-muted">
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

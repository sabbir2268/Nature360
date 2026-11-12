import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import Button from "../../../components/ui/Button";
import TextField from "../../../components/ui/TextField";
import { PATHS } from "../../../utils/paths";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState("");

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice("Demo only — authentication is not connected yet.");
  };

  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/15 bg-emerald-50/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
        Welcome back
      </span>
      <h1 className="mt-4 font-display text-[1.9rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-forest-950 sm:text-4xl">
        Sign in to EcoTrack
      </h1>
      <p className="mt-2.5 text-[13px] leading-6 text-slate-500">
        Access your reports, follow complaint updates, and stay connected to environmental action in
        your community.
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <TextField
          id="login-email"
          label="Email address"
          name="email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <TextField
          id="login-password"
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-forest-50 hover:text-forest-800"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-slate-500">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-forest-900/20 accent-emerald-600"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => setNotice("Password reset is not connected in this demo.")}
            className="text-[11px] font-bold text-emerald-700 transition-colors hover:text-forest-900 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" className="group w-full">
          Sign in
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Button>

        {notice && (
          <p
            role="status"
            aria-live="polite"
            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] font-medium text-amber-800"
          >
            {notice}
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-[12px] text-slate-500">
        New to EcoTrack?{" "}
        <Link to={PATHS.REGISTER} className="font-bold text-emerald-700 hover:text-forest-900 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-forest-900/[0.07] bg-white/50 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-[10px] leading-5 text-slate-500">
          This is a demo form. No credentials are sent or stored.
        </p>
      </div>
    </div>
  );
}

export default Login;

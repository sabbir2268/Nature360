import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import Button from "../../../components/ui/Button";
import GoogleIcon from "../../../components/ui/GoogleIcon";
import TextField from "../../../components/ui/TextField";
import { PATHS } from "../../../utils/paths";
import {
  getAuthErrorMessage,
  loginUser,
  loginWithGoogle,
  sendResetEmail,
} from "../services/authServices";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.message || "");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      await loginUser({ ...formData, remember });
      const destination = location.state?.from?.pathname || PATHS.DASHBOARD;
      navigate(destination, { replace: true });
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setNotice("");

    if (!formData.email.trim()) {
      setError("Enter your email address first, then tap “Forgot password?” again.");
      return;
    }

    try {
      await sendResetEmail(formData.email);
      setNotice("Password reset link sent. Check your inbox (and spam folder).");
    } catch (resetError) {
      setError(getAuthErrorMessage(resetError));
    }
  };

  const handleGoogle = async () => {
    setError("");
    setNotice("");
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      // PublicRoute redirects the authenticated user to their profile.
    } catch (googleError) {
      const message = getAuthErrorMessage(googleError);
      if (message) setError(message);
      setGoogleLoading(false);
    }
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

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleGoogle}
        disabled={googleLoading || submitting}
        className="mt-6 w-full gap-2.5"
      >
        <GoogleIcon className="h-4 w-4" />
        {googleLoading ? "Connecting to Google…" : "Continue with Google"}
      </Button>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-forest-900/10" />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          or use email
        </span>
        <span className="h-px flex-1 bg-forest-900/10" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
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
            onClick={handleForgotPassword}
            className="text-[11px] font-bold text-emerald-700 transition-colors hover:text-forest-900 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" className="group w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[11px] font-medium text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          aria-live="polite"
          className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] font-medium text-emerald-800"
        >
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {notice}
        </p>
      )}

      <p className="mt-6 text-center text-[12px] text-slate-500">
        New to EcoTrack?{" "}
        <Link to={PATHS.REGISTER} className="font-bold text-emerald-700 hover:text-forest-900 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-forest-900/[0.07] bg-white/50 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-[10px] leading-5 text-slate-500">
          Your credentials are handled securely by Firebase Authentication and are never stored in
          this app.
        </p>
      </div>
    </div>
  );
}

export default Login;

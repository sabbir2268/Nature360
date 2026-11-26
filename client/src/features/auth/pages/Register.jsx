import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, ClipboardCheck, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import Button from "../../../components/ui/Button";
import GoogleIcon from "../../../components/ui/GoogleIcon";
import TextField from "../../../components/ui/TextField";
import { PATHS } from "../../../utils/paths";
import {
  clearPendingRole,
  getAuthErrorMessage,
  loginWithGoogle,
  queueVolunteerRole,
  registerUser,
} from "../services/authServices";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [accountType, setAccountType] = useState("Citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please check both password fields.");
      return;
    }

    setSubmitting(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: accountType,
      });

      navigate(PATHS.LOGIN, {
        replace: true,
        state: {
          message:
            accountType === "Volunteer"
              ? "Volunteer account created. Sign in and an officer can assign cases to you."
              : "Account created successfully. Please sign in with your new credentials.",
        },
      });
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");

    if (!agreed) {
      setError("Please tick the acknowledgement checkbox before continuing with Google.");
      return;
    }

    setGoogleLoading(true);

    try {
      if (accountType === "Volunteer") queueVolunteerRole();
      else clearPendingRole();

      await loginWithGoogle();
      // PublicRoute sends authenticated users to their profile.
    } catch (googleError) {
      clearPendingRole();
      const message = getAuthErrorMessage(googleError);
      if (message) setError(message);
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/15 bg-emerald-50/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
        Join the community
      </span>
      <h1 className="mt-4 font-display text-[1.9rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-forest-950 sm:text-4xl">
        Create your account
      </h1>
      <p className="mt-2.5 text-[13px] leading-6 text-slate-500">
        Report environmental problems, follow action, and help make accountability visible in your
        community.
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

      <fieldset className="mt-5">
        <legend className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Register as
        </legend>
        <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
          {[
            {
              value: "Citizen",
              label: "Community member",
              description: "Report and track complaints",
              icon: User,
            },
            {
              value: "Volunteer",
              label: "Field volunteer",
              description: "Investigate cases assigned by officers",
              icon: ClipboardCheck,
            },
          ].map((option) => {
            const Icon = option.icon;
            const selected = accountType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setAccountType(option.value)}
                aria-pressed={selected}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors ${
                  selected
                    ? "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500/30"
                    : "border-forest-900/10 bg-white/60 hover:border-emerald-300 hover:bg-emerald-50/40"
                }`}
              >
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? "text-emerald-600" : "text-slate-400"}`}
                />
                <span>
                  <span className="block text-[12px] font-bold text-forest-950">{option.label}</span>
                  <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <form className="mt-4 space-y-3.5" onSubmit={handleSubmit}>
        <TextField
          id="register-name"
          label="Full name"
          name="name"
          type="text"
          icon={User}
          placeholder="Your name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          minLength={2}
          maxLength={80}
          required
        />

        <TextField
          id="register-email"
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
          id="register-password"
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
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

        <TextField
          id="register-confirm-password"
          label="Confirm password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          placeholder="Repeat your password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={8}
        />

        <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-[10px] leading-5 text-slate-500">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            required
            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-forest-900/20 accent-emerald-600"
          />
          I understand that environmental officers make the final decisions on complaints, and that
          false reports may be removed.
        </label>

        <Button type="submit" size="lg" className="group w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
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

      <p className="mt-6 text-center text-[12px] text-slate-500">
        Already have an account?{" "}
        <Link to={PATHS.LOGIN} className="font-bold text-emerald-700 hover:text-forest-900 hover:underline">
          Sign in
        </Link>
      </p>

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-forest-900/[0.07] bg-white/50 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-[10px] leading-5 text-slate-500">
          Accounts are secured by Firebase Authentication. After registering you will be asked to
          sign in.
        </p>
      </div>
    </div>
  );
}

export default Register;

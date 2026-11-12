import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import Button from "../../../components/ui/Button";
import TextField from "../../../components/ui/TextField";
import { PATHS } from "../../../utils/paths";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [notice, setNotice] = useState("");

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setNotice("Passwords do not match. Please check both password fields.");
      return;
    }
    setNotice("Demo only — registration is not connected yet.");
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

      <form className="mt-7 space-y-3.5" onSubmit={handleSubmit}>
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
          I understand that this is a demo registration experience and that environmental officers
          make final decisions on complaints.
        </label>

        <Button type="submit" size="lg" className="group w-full">
          Create account
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
        Already have an account?{" "}
        <Link to={PATHS.LOGIN} className="font-bold text-emerald-700 hover:text-forest-900 hover:underline">
          Sign in
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

export default Register;

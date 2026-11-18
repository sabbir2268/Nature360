import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  MailCheck,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import TextField from "../../../components/ui/TextField";
import { RoleBadge, VerificationBadge } from "../../../components/ui/Badge";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  getAuthErrorMessage,
  reloadCurrentUser,
  sendResetEmail,
  sendVerificationEmail,
  updateMyProfile,
} from "../../auth/services/authServices";
import { getApiErrorMessage } from "../../../lib/api";
import { formatDateTime } from "../../../utils/format";

function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setForm({
        name: profile?.name || "",
        phone: profile?.phone || "",
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [profile?.name, profile?.phone]);

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setFlash("");
    setSaving(true);
    try {
      await updateMyProfile({ name: form.name.trim(), phone: form.phone.trim() });
      await refreshProfile();
      setFlash("Profile updated.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setFlash("");
    setVerificationBusy(true);
    try {
      await sendVerificationEmail();
      setFlash("Verification email sent. Check your inbox and spam folder.");
    } catch (verifyError) {
      setError(getAuthErrorMessage(verifyError));
    } finally {
      setVerificationBusy(false);
    }
  };

  const handleRefreshVerification = async () => {
    setError("");
    setFlash("");
    setVerificationBusy(true);
    try {
      await reloadCurrentUser();
      await refreshProfile();
      setFlash("Verification status refreshed.");
    } catch (verifyError) {
      setError(getAuthErrorMessage(verifyError));
    } finally {
      setVerificationBusy(false);
    }
  };

  const handleReset = async () => {
    if (!profile?.email) return;
    setError("");
    setFlash("");
    setResetBusy(true);
    try {
      await sendResetEmail(profile.email);
      setFlash(`Password reset email sent to ${profile.email}.`);
    } catch (resetError) {
      setError(getAuthErrorMessage(resetError));
    } finally {
      setResetBusy(false);
    }
  };

  const verified = Boolean(user?.emailVerified || profile?.emailVerified);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Keep your contact details current and manage the security of your Nature360 account."
      />

      {flash && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-[11px] font-semibold text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="flex-1 leading-5">{flash}</p>
          <button type="button" onClick={() => setFlash("")} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1 leading-5">{error}</p>
          <button type="button" onClick={() => setError("")} className="text-rose-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Reveal>
          <form onSubmit={handleSave} className="glass rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
                <User className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                  Profile
                </p>
                <h2 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
                  Personal details
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <TextField
                id="settings-name"
                label="Full name"
                icon={User}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                minLength={2}
                maxLength={80}
                required
              />
              <TextField
                id="settings-phone"
                label="Phone number (optional)"
                placeholder="+880 1XXX XXXXXX"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                maxLength={30}
              />
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-forest-900">
                  Email address
                </label>
                <div className="flex h-12 items-center justify-between gap-2 rounded-xl border border-forest-900/10 bg-forest-50/60 px-4">
                  <span className="min-w-0 truncate text-sm font-medium text-forest-950">
                    {profile?.email || user?.email || "—"}
                  </span>
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    {verified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">
                  Email changes are managed through Firebase Authentication.
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </div>
          </form>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={0.05}>
            <div className="glass rounded-[1.75rem] p-5">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                    Access
                  </p>
                  <h2 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
                    Account status
                  </h2>
                </div>
              </div>

              <dl className="mt-3 space-y-2.5 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-400">Role</dt>
                  <dd>
                    <RoleBadge role={profile?.role || "Citizen"} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-400">Account</dt>
                  <dd className="font-semibold text-forest-950">{profile?.status || "Active"}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-400">Email</dt>
                  <dd>
                    <VerificationBadge status={verified ? "Verified" : "Pending"} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-400">Member since</dt>
                  <dd className="font-semibold text-forest-950">
                    {profile?.createdAt ? formatDateTime(profile.createdAt) : "—"}
                  </dd>
                </div>
              </dl>

              {!verified && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                    <MailCheck className="h-3.5 w-3.5" />
                    Verify your email
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-amber-700">
                    Verification helps secure your account and makes sure you receive complaint
                    updates.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleResend}
                      disabled={verificationBusy}
                    >
                      {verificationBusy ? "Please wait..." : "Resend email"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleRefreshVerification}
                      disabled={verificationBusy}
                      className="gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      I verified
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="glass rounded-[1.75rem] p-5">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                    Security
                  </p>
                  <h2 className="font-display text-base font-extrabold tracking-[-0.03em] text-forest-950">
                    Password
                  </h2>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                We will email a secure reset link to <strong>{profile?.email || "your address"}</strong>.
                Your password is never stored by Nature360.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={resetBusy || !profile?.email}
                className="mt-3 w-full gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {resetBusy ? "Sending..." : "Send password reset"}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

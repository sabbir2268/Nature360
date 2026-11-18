import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Reveal from "../../../components/ui/Reveal";
import Button from "../../../components/ui/Button";
import ComplaintForm from "../components/ComplaintForm";
import { getPost, updatePost } from "../services/postServices";
import { getApiErrorMessage } from "../../../lib/api";
import { PATHS, postDetailsPath } from "../../../utils/paths";

function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getPost(postId)
      .then((data) => {
        if (active) setPost(data);
      })
      .catch((loadError) => {
        if (active) setError(getApiErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [postId]);

  const handleSubmit = async (payload) => {
    const updated = await updatePost(postId, payload);
    navigate(postDetailsPath(updated.id), {
      replace: true,
      state: { message: "Complaint updated successfully." },
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-40 animate-pulse rounded-full bg-white/60" />
        <div className="h-[34rem] animate-pulse rounded-[1.75rem] border border-white/70 bg-white/50" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="glass rounded-[1.75rem] px-6 py-14 text-center">
        <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
        <h2 className="mt-3 font-display text-lg font-extrabold text-forest-950">
          Complaint not available
        </h2>
        <p className="mt-1 text-[11px] text-slate-500">{error || "This complaint could not be loaded."}</p>
        <Button to={PATHS.TRACK_POST} size="sm" variant="outline" className="mt-4 gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to complaints
        </Button>
      </div>
    );
  }

  if (!["Submitted", "Under Review", "Rejected"].includes(post.status)) {
    return (
      <div className="glass rounded-[1.75rem] px-6 py-14 text-center">
        <RefreshCw className="mx-auto h-7 w-7 text-amber-500" />
        <h2 className="mt-3 font-display text-lg font-extrabold text-forest-950">
          This complaint can no longer be edited
        </h2>
        <p className="mx-auto mt-1 max-w-md text-[11px] leading-5 text-slate-500">
          Editing is available while a complaint is Submitted, Under Review or Rejected. Contact an
          officer if you need to add information to a case under investigation.
        </p>
        <Button to={postDetailsPath(post.id)} size="sm" className="mt-4">
          View complaint
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
      <Reveal>
        {post.status === "Rejected" && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] font-medium text-rose-700">
            This complaint was rejected: {post.rejectionReason || "No reason recorded."} Saving changes
            will resubmit it for review.
          </div>
        )}
        <ComplaintForm initial={post} onSubmit={handleSubmit} submitLabel="Save changes" />
      </Reveal>

      <Reveal delay={0.08}>
        <div className="glass rounded-[1.75rem] p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">Editing</p>
          <h3 className="mt-1 font-display text-lg font-extrabold text-forest-950">
            Keep records accurate
          </h3>
          <p className="mt-2 text-[11px] leading-6 text-slate-500">
            All changes are timestamped and recorded in the audit log. Officers see the latest
            information before verifying the case.
          </p>
          <Button to={postDetailsPath(post.id)} variant="outline" size="sm" className="mt-4 w-full gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to complaint
          </Button>
        </div>
      </Reveal>
    </div>
  );
}

export default EditPost;

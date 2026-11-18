import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { getUnreadCount } from "../services/notificationServices";
import { PATHS } from "../../../utils/paths";
import { cn } from "../../../utils/cn";

function NotificationBell({ className = "" }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;

    const load = () => {
      getUnreadCount()
        .then((count) => {
          if (active) setUnread(count);
        })
        .catch(() => {});
    };

    load();
    const timer = setInterval(load, 45000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <Link
      to={PATHS.NOTIFICATIONS}
      aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-xl border border-forest-900/10 bg-white/70 text-forest-900 shadow-sm backdrop-blur transition-colors hover:border-emerald-500/30 hover:bg-white",
        className,
      )}
    >
      <Bell className="h-4 w-4" />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-extrabold text-white ring-2 ring-mist">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}

export default NotificationBell;

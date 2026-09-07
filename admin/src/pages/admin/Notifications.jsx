import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Trash2,
  CheckCheck,
  RefreshCw,
  Loader2,
  Mail,
  MailOpen,
  Send,
  ExternalLink,
} from "lucide-react";
import api from "../../api/axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Manage individual reply inputs per message ID
  const [replyTexts, setReplyTexts] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/api/admin/notifications", {
        withCredentials: true,
      });

      if (data?.success && Array.isArray(data?.notifications)) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load notifications."
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const isNotificationRead = (item) => {
    return Boolean(item.showedMessage ?? item.isRead ?? false);
  };

  const handleMarkAsRead = async (id) => {
    try {
      setActionLoading(true);
      const { data } = await api.put(
        `/api/admin/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );

      if (data?.success) {
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === id
              ? { ...item, showedMessage: true, isRead: true }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionLoading(true);
      const { data } = await api.put(
        "/api/admin/notifications",
        {},
        { withCredentials: true }
      );

      if (data?.success) {
        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            showedMessage: true,
            isRead: true,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      const { data } = await api.delete(`/api/admin/notifications/${id}`, {
        withCredentials: true,
      });

      if (data?.success) {
        setNotifications((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplyChange = (id, text) => {
    setReplyTexts((prev) => ({ ...prev, [id]: text }));
  };

  const handleSendReply = async (id) => {
    const text = replyTexts[id];
    if (!text || !text.trim()) return;

    try {
      setSendingReplyId(id);
      const { data } = await api.post(
        `/api/admin/notifications/${id}/reply`,
        { message: text },
        { withCredentials: true }
      );

      if (data?.success) {
        // Clear the input on success
        setReplyTexts((prev) => ({ ...prev, [id]: "" }));
        alert(data.message || "Reply sent successfully!");
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
      alert(
        err?.response?.data?.message || "Failed to send reply to user."
      );
    } finally {
      setSendingReplyId(null);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "Just now";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (item) => {
    const isRead = isNotificationRead(item);

    if (isRead) {
      return <CheckCheck size={16} className="text-black/40" />;
    }

    switch (item.type?.toLowerCase()) {
      case "contact":
      case "message":
        return <Mail size={16} className="text-black" />;
      case "success":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "warning":
      case "alert":
        return <AlertCircle size={16} className="text-amber-600" />;
      default:
        return <Info size={16} className="text-black" />;
    }
  };

  const unreadCount = notifications.filter(
    (n) => !isNotificationRead(n)
  ).length;

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#dadada]">
        <div className="flex flex-col items-center gap-3 text-black/50">
          <Loader2 size={26} className="animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider">
            Loading Notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-[#dadada] text-black antialiased">
      {/* Top Bar */}
      <div className="TopBar w-full h-16 border-b border-[#0000009b] bg-[#dadada] flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
            <Bell size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">
              Notifications
            </h1>
            <p className="text-[11px] text-black/40 mt-1">
              {unreadCount} unread · {notifications.length} total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={actionLoading}
              className="h-9 px-3.5 rounded-lg border border-black/20 bg-white/40 hover:bg-black hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <CheckCheck size={15} />
              Mark all read
            </button>
          )}

          <button
            type="button"
            onClick={fetchNotifications}
            disabled={actionLoading}
            title="Refresh"
            className="w-9 h-9 rounded-lg border border-black/20 bg-[#dadada] flex items-center justify-center hover:bg-black hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 2xl:p-8 max-w-5xl w-full">
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="h-full min-h-[320px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2.5 text-center">
              <div className="w-12 h-12 rounded-2xl border border-dashed border-black/30 flex items-center justify-center text-black/40">
                <Bell size={20} />
              </div>
              <p className="text-sm font-semibold text-black/70">
                No notifications yet
              </p>
              <p className="text-xs text-black/40">
                Messages and portfolio inquiries will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((item) => {
              const isRead = isNotificationRead(item);
              const isReplying = sendingReplyId === item._id;

              return (
                <div
                  key={item._id}
                  className={`w-full p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                    !isRead
                      ? "bg-white/70 border-black/50 shadow-xs"
                      : "bg-[#dadada]/50 border-black/15 hover:border-black/35"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          !isRead
                            ? "bg-white border-black/30 shadow-xs"
                            : "bg-black/5 border-black/10"
                        }`}
                      >
                        {getNotificationIcon(item)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2
                            className={`text-xs sm:text-sm font-semibold leading-snug truncate ${
                              !isRead ? "text-black font-bold" : "text-black/70"
                            }`}
                          >
                            {item.title || item.name || "Portfolio Inquiry"}
                          </h2>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-black shrink-0 animate-pulse" />
                          )}
                        </div>

                        <p
                          className={`text-xs mt-1 leading-relaxed whitespace-pre-wrap ${
                            !isRead ? "text-black/85 font-medium" : "text-black/60"
                          }`}
                        >
                          {item.message}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-black/40 flex-wrap">
                          <span>{formatTimestamp(item.createdAt)}</span>
                          {item.email && (
                            <>
                              <span>•</span>
                              <span className="text-black/60 font-medium">
                                {item.email}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right-side Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {!isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(item._id)}
                          disabled={actionLoading}
                          title="Mark as Read"
                          className="w-8 h-8 rounded-lg border border-black/20 bg-white/50 hover:bg-black hover:text-white transition-colors flex items-center justify-center text-black cursor-pointer disabled:opacity-40"
                        >
                          <MailOpen size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        disabled={actionLoading}
                        title="Delete Notification"
                        className="w-8 h-8 rounded-lg border border-black/20 hover:bg-red-600 hover:text-white hover:border-transparent transition-colors flex items-center justify-center text-black/60 cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Inline Reply Box: Appears only when status is Read/showedMessage === true */}
                  {isRead && item.email && (
                    <div className="mt-2 pt-2.5 border-t border-black/10 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Reply to ${item.name || item.email}...`}
                        value={replyTexts[item._id] || ""}
                        onChange={(e) => handleReplyChange(item._id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply(item._id);
                          }
                        }}
                        disabled={isReplying}
                        className="flex-1 bg-white/60 border border-black/20 rounded-lg px-3 py-1.5 text-xs text-black placeholder:text-black/40 focus:outline-none focus:border-black transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendReply(item._id)}
                        disabled={isReplying || !replyTexts[item._id]?.trim()}
                        className="h-8 px-3 rounded-lg bg-black text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-black text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        {isReplying ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Send size={13} />
                        )}
                        <span>{isReplying ? "Sending..." : "Reply"}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
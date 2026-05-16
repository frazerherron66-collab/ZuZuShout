import { r as __toESM } from "../_runtime.mjs";
import { f as useNavigate, m as require_react, p as require_jsx_runtime, u as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-CjreNzYf.mjs";
import { E as Heart, F as Bell, a as UserPlus, b as Mail, f as ShieldCheck, y as MessageCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inbox-Dee2-0U4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InboxPage() {
	const navigate = useNavigate();
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		fetchNotifications();
	}, []);
	const fetchNotifications = async () => {
		setLoading(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				navigate({ to: "/auth" });
				return;
			}
			const { data, error } = await supabase.from("notifications").select(`
          *,
          sender:profiles (username, avatar_url)
        `).eq("receiver_id", user.id).order("created_at", { ascending: false });
			if (error) {
				console.error("Supabase Error:", error);
				throw error;
			}
			setNotifications(data || []);
		} catch (err) {
			console.error("Inbox Error:", err);
			toast.error("Failed to load notifications");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-screen w-full bg-black text-white flex flex-col overflow-hidden font-sans",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "p-6 pt-12 border-b-2 border-white/10 flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-black italic uppercase tracking-tighter",
					children: "Inbox"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
						size: 24,
						className: "text-white/50"
					}), notifications.some((n) => !n.is_read) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-1 -right-1 w-3 h-3 bg-[#fe2c55] rounded-full border-2 border-black" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto pb-24 no-scrollbar",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col items-center justify-center h-full opacity-20 animate-pulse",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-black italic uppercase tracking-widest text-xs",
						children: "Checking Alerts..."
					})
				}) : notifications.length > 0 ? notifications.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `p-4 flex items-center gap-4 border-b border-white/5 active:bg-white/5 transition-colors ${!n.is_read ? "bg-white/[0.02]" : ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 bg-zinc-800 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: n.sender?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${n.sender?.username}`,
								alt: "avatar",
								className: "w-full h-full object-cover"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-bold leading-snug",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-white",
										children: ["@", n.sender?.username || "user"]
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-white/60",
										children: [
											n.type === "like" && "liked your shout",
											n.type === "follow" && "started following you",
											n.type === "comment" && `commented: ${n.content}`,
											n.type === "system" && n.content
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-black uppercase text-white/20 mt-1 tracking-tighter",
								children: new Date(n.created_at).toLocaleDateString()
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shrink-0 ml-2",
							children: [
								n.type === "like" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
									size: 18,
									className: "fill-[#fe2c55] text-[#fe2c55]"
								}),
								n.type === "follow" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, {
									size: 18,
									className: "text-blue-400"
								}),
								n.type === "comment" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
									size: 18,
									className: "text-emerald-400"
								}),
								n.type === "system" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
									size: 18,
									className: "text-amber-400"
								})
							]
						})
					]
				}, n.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-full flex flex-col items-center justify-center opacity-20 p-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
						size: 64,
						strokeWidth: 1,
						className: "mb-4"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-black italic uppercase text-sm tracking-widest leading-tight",
						children: [
							"Your space is quiet...",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Go post a shout!"
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "fixed bottom-0 w-full h-24 bg-black border-t border-white/10 flex justify-around items-center z-50 px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/feed",
						className: "flex flex-col items-center text-white/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl",
							children: "🏠"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-black uppercase mt-1 tracking-tighter",
							children: "Home"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/search",
						className: "flex flex-col items-center text-white/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl",
							children: "🔍"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-black uppercase mt-1 tracking-tighter",
							children: "Search"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						onClick: () => navigate({ to: "/record" }),
						className: "w-14 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-3xl shadow-lg cursor-pointer active:scale-90 transition-transform",
						children: "+"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/inbox",
						className: "flex flex-col items-center text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl",
							children: "📩"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-black uppercase mt-1 tracking-tighter text-[#fe2c55]",
							children: "Inbox"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/profile",
						className: "flex flex-col items-center text-white/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl",
							children: "👤"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-black uppercase mt-1 tracking-tighter",
							children: "Profile"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { InboxPage as component };

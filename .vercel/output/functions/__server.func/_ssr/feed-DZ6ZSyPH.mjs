import { r as __toESM } from "../_runtime.mjs";
import { f as useNavigate, m as require_react, p as require_jsx_runtime, u as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-CjreNzYf.mjs";
import { E as Heart, m as Search, p as Share2, y as MessageCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/feed-DZ6ZSyPH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FeedPage() {
	const navigate = useNavigate();
	const [shouts, setShouts] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [activeTopTab, setActiveTopTab] = (0, import_react.useState)("foryou");
	(0, import_react.useEffect)(() => {
		fetchShouts();
	}, [activeTopTab]);
	const fetchShouts = async () => {
		setLoading(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			let query = supabase.from("shouts").select(`*, profiles(username)`).order("created_at", { ascending: false });
			if (activeTopTab === "following" && user) {
				const { data: followData } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
				const followingIds = followData?.map((f) => f.following_id) || [];
				if (followingIds.length > 0) query = query.in("user_id", followingIds);
				else {
					setShouts([]);
					setLoading(false);
					return;
				}
			}
			const { data, error } = await query;
			if (error) throw error;
			setShouts(data?.map((s) => ({
				id: s.id,
				video_url: s.video_url,
				username: s.profiles?.username || "shouter",
				caption: s.caption || "",
				likes: "0",
				comments: "0"
			})) || []);
		} catch (err) {
			console.error(err);
			toast.error("Failed to load feed");
		} finally {
			setLoading(false);
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-screen bg-black flex items-center justify-center text-white font-black italic uppercase animate-pulse",
		children: "Loading..."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-screen w-full bg-black flex flex-col overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "w-full bg-black z-50 flex justify-center items-center pt-8 pb-4 px-6 gap-6 border-b border-white/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTopTab("following"),
						className: `text-[15px] font-bold transition-colors ${activeTopTab === "following" ? "text-white" : "text-white/40"}`,
						children: "Following"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTopTab("foryou"),
						className: `text-[15px] font-bold relative transition-colors ${activeTopTab === "foryou" ? "text-white" : "text-white/40"}`,
						children: ["For You", activeTopTab === "foryou" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						onClick: () => navigate({ to: "/search" }),
						className: "absolute right-6 text-white/80 cursor-pointer active:scale-90 hover:text-white transition-all",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 20 })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black pb-24",
				children: shouts.length > 0 ? shouts.map((shout) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoPost, { shout }, shout.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full flex flex-col items-center justify-center text-zinc-500 gap-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-bold uppercase tracking-tighter",
						children: "No shouts to show here yet!"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "fixed bottom-0 w-full h-24 bg-black border-t border-white/10 flex justify-around items-center z-50 px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/feed",
						className: "flex flex-col items-center text-white",
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
						className: "flex flex-col items-center text-white/40 hover:text-white transition-colors",
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
						className: "w-14 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-3xl shadow-lg cursor-pointer active:scale-95 transition-transform",
						children: "+"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/inbox",
						className: "flex flex-col items-center text-white/40 hover:text-white transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl",
							children: "📩"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-black uppercase mt-1 tracking-tighter",
							children: "Inbox"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/profile",
						className: "flex flex-col items-center text-white/40 hover:text-white transition-colors",
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
function VideoPost({ shout }) {
	const videoRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) videoRef.current?.play().catch(() => {});
			else videoRef.current?.pause();
		}, { threshold: .6 });
		if (videoRef.current) observer.observe(videoRef.current);
		return () => observer.disconnect();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative h-full w-full snap-start bg-black flex items-center justify-center overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				src: shout.video_url,
				className: "w-full h-full object-cover",
				loop: true,
				playsInline: true,
				muted: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-4 bottom-10 flex flex-col gap-6 items-center z-20 text-white",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
							size: 32,
							fill: "white"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[12px] font-black",
							children: shout.likes
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
							size: 32,
							fill: "white"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[12px] font-black",
							children: shout.comments
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
						size: 32,
						fill: "white"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/80 to-transparent z-10 text-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "font-black text-base mb-1",
					children: ["@", shout.username]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[14px] font-medium leading-snug mb-3 line-clamp-2 max-w-[80%]",
					children: shout.caption
				})]
			})
		]
	});
}
//#endregion
export { FeedPage as component };

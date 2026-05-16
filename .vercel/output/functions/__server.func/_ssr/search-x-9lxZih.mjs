import { r as __toESM } from "../_runtime.mjs";
import { f as useNavigate, m as require_react, p as require_jsx_runtime, u as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-CjreNzYf.mjs";
import { I as ArrowLeft, c as TrendingUp, m as Search, s as Trophy, t as Zap, u as Star, v as Music } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-x-9lxZih.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [isSearching, setIsSearching] = (0, import_react.useState)(false);
	const [searchResults, setSearchResults] = (0, import_react.useState)([]);
	const [trendingTopics, setTrendingTopics] = (0, import_react.useState)([]);
	const [trendingUsers, setTrendingUsers] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const fetchDiscoveryData = async () => {
			const { data: shoutData } = await supabase.from("shouts").select("caption").limit(10);
			if (shoutData) setTrendingTopics(shoutData.map((s) => s.caption?.split(" ")[0]?.toUpperCase()).filter(Boolean).slice(0, 4).map((name, i) => ({
				id: i,
				name: name || "TRENDING",
				icon: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {})
				][i % 4],
				color: [
					"bg-yellow-400/5",
					"bg-emerald-400/5",
					"bg-pink-400/5",
					"bg-blue-400/5"
				][i % 4]
			})));
			const { data: userData } = await supabase.from("profiles").select("id, username, avatar_url").limit(4);
			if (userData) setTrendingUsers(userData);
		};
		fetchDiscoveryData();
	}, []);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(async () => {
			if (searchQuery.length < 2) {
				setIsSearching(false);
				setSearchResults([]);
				return;
			}
			setIsSearching(true);
			const { data } = await supabase.from("profiles").select("id, username, avatar_url, bio").ilike("username", `%${searchQuery}%`).limit(10);
			if (data) setSearchResults(data);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);
	const handleFollow = async (targetUserId, targetUsername) => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return toast.error("Login to follow users!");
		const { error } = await supabase.from("follows").insert([{
			follower_id: user.id,
			following_id: targetUserId
		}]);
		if (!error) toast.success(`Following @${targetUsername}`);
		else toast.info("Already following!");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-screen w-full bg-black text-white flex flex-col font-sans",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "p-6 pt-12 border-b-2 border-white/10 flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => navigate({ to: "/feed" }),
					className: "p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 20 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative group flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						className: "absolute left-5 top-1/2 -translate-y-1/2 text-white/30",
						size: 20
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: searchQuery,
						onChange: (e) => setSearchQuery(e.target.value),
						placeholder: "SEARCH USERS OR TOPICS...",
						className: "w-full bg-[#111] border-2 border-white/5 rounded-full py-4 pl-14 pr-6 text-xs font-black italic uppercase tracking-[0.2em] focus:outline-none focus:border-[#fe2c55]/50 transition-all placeholder:text-white/10"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto pb-32",
				children: !isSearching ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 space-y-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[#fe2c55] text-2xl",
							children: "#"
						}), " TRENDING TOPICS"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-4",
						children: trendingTopics.map((topic) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setSearchQuery(topic.name),
							className: `flex flex-col items-start p-6 rounded-[2rem] border-2 border-white/5 ${topic.color} active:scale-95 transition-all`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-4 text-white/80",
								children: topic.icon
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-black italic uppercase text-[11px] tracking-widest",
								children: topic.name
							})]
						}, topic.id))
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
							className: "text-blue-500",
							size: 24
						}), " TRENDING USERS"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: trendingUsers.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between bg-white/5 p-4 rounded-[1.5rem] border border-white/5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-zinc-800",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`,
										alt: "avatar",
										className: "w-full h-full object-cover"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-black italic uppercase text-sm tracking-tight",
									children: ["@", user.username]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[10px] text-emerald-400 font-black uppercase tracking-tighter flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { size: 10 }), " Rising Star"]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => handleFollow(user.id, user.username),
								className: "bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase active:scale-90 transition-transform",
								children: "Follow"
							})]
						}, user.id))
					})] })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 space-y-4",
					children: searchResults.length > 0 ? searchResults.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4 cursor-pointer",
							onClick: () => navigate({ to: "/profile" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`,
								className: "w-14 h-14 rounded-full border-2 border-white/20 bg-zinc-800"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-black italic uppercase tracking-tighter",
								children: ["@", user.username]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-white/40 font-bold uppercase truncate max-w-[150px]",
								children: user.bio || "New Shouter"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => handleFollow(user.id, user.username),
							className: "bg-[#fe2c55] p-3 rounded-xl active:scale-90 transition-all shadow-lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
								size: 18,
								fill: "white"
							})
						})]
					}, user.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-white/20 font-black italic uppercase text-xs py-20 tracking-widest",
						children: "No shouters found"
					})
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
						className: "flex flex-col items-center text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl",
							children: "🔍"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-black uppercase mt-1 tracking-tighter text-[#fe2c55]",
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
						className: "flex flex-col items-center text-white/40",
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
export { SearchPage as component };

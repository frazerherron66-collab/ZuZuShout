import { r as __toESM } from "../_runtime.mjs";
import { f as useNavigate, m as require_react, p as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-CjreNzYf.mjs";
import { t as useAuth } from "./useAuth-rc5cznTz.mjs";
import { d as Sparkles, h as RefreshCw, m as Search, x as LogOut } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parent-B_vgBvcs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ParentDashboard() {
	const { user, profile, loading, refreshProfile, signOut } = useAuth();
	const navigate = useNavigate();
	const [child, setChild] = (0, import_react.useState)(null);
	const [shouts, setShouts] = (0, import_react.useState)([]);
	const [searches, setSearches] = (0, import_react.useState)([]);
	const [generating, setGenerating] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({
			to: "/auth",
			search: { role: "parent" }
		});
		if (profile && profile.role !== "parent") navigate({ to: "/child" });
	}, [
		user,
		profile,
		loading,
		navigate
	]);
	const loadChild = async () => {
		if (!user) return;
		const { data } = await supabase.from("profiles").select("*").eq("paired_with", user.id).maybeSingle();
		setChild(data ?? null);
		if (data) {
			const [{ data: sh }, { data: se }] = await Promise.all([supabase.from("shouts").select("id, video_id, created_at, videos(title, category)").eq("child_id", data.id).order("created_at", { ascending: false }).limit(50), supabase.from("search_history").select("id, query, created_at").eq("child_id", data.id).order("created_at", { ascending: false }).limit(50)]);
			setShouts(sh ?? []);
			setSearches(se ?? []);
		}
	};
	(0, import_react.useEffect)(() => {
		loadChild();
	}, [user, profile?.paired_with]);
	(0, import_react.useEffect)(() => {
		if (!child) return;
		const ch = supabase.channel(`shouts-${child.id}`).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "shouts",
			filter: `child_id=eq.${child.id}`
		}, async (p) => {
			const newRow = p.new;
			const { data: video } = await supabase.from("videos").select("title").eq("id", newRow.video_id).single();
			toast(`📣 ${child.username} shouted!`, {
				description: video?.title ?? "A video",
				duration: 6e3
			});
			loadChild();
		}).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [child]);
	const generateCode = async () => {
		if (!user) return;
		setGenerating(true);
		const code = String(Math.floor(1e5 + Math.random() * 9e5));
		const expires = new Date(Date.now() + 1e3 * 60 * 30).toISOString();
		const { error } = await supabase.from("profiles").update({
			pairing_code: code,
			pairing_code_expires_at: expires
		}).eq("id", user.id);
		setGenerating(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		await refreshProfile();
		toast.success("New code ready! Valid for 30 min.");
	};
	const togglePause = async (next) => {
		if (!child) return;
		const { error } = await supabase.from("profiles").update({ paused: next }).eq("id", child.id);
		if (error) {
			toast.error(error.message);
			return;
		}
		setChild({
			...child,
			paused: next
		});
		toast.success(next ? "App paused for your child." : "App resumed.");
	};
	if (loading || !profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen grid place-items-center",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b-2 border-border bg-background/80 backdrop-blur sticky top-0 z-30",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-5xl mx-auto px-4 py-4 flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid place-items-center rounded-2xl shadow-md w-11 h-11",
						style: { background: "var(--primary)" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { fontSize: 22 },
							children: "👪"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-extrabold text-lg leading-tight",
							children: "Parent Dashboard"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: profile.username
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: signOut,
						className: "p-2 rounded-full hover:bg-muted",
						"aria-label": "Sign out",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "w-5 h-5" })
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "max-w-5xl mx-auto px-4 pt-6 space-y-6",
			children: !child ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-bubbly text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-6xl mb-3",
						children: "🔗"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-extrabold mb-2",
						children: "Link your child's account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground mb-5",
						children: "Generate a 6-digit code, then have them enter it on their device."
					}),
					profile.pairing_code && profile.pairing_code_expires_at && new Date(profile.pairing_code_expires_at) > /* @__PURE__ */ new Date() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-5xl font-extrabold tracking-[0.4em] py-4 rounded-2xl",
							style: {
								background: "var(--accent)",
								color: "var(--accent-foreground)"
							},
							children: profile.pairing_code
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground mt-2",
							children: ["Expires ", new Date(profile.pairing_code_expires_at).toLocaleTimeString()]
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: generateCode,
						disabled: generating,
						className: "btn-bubbly btn-primary disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "inline w-5 h-5 mr-2" }), profile.pairing_code ? "Generate new code" : "Generate code"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "card-bubbly flex flex-wrap items-center gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarMask, {
						template: child.avatar,
						size: 72
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-[160px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs uppercase tracking-wider font-bold text-muted-foreground",
							children: "Linked child"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-extrabold",
							children: child.username
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-3 cursor-pointer select-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold",
							children: "Remote Pause"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "relative",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "sr-only peer",
									checked: child.paused,
									onChange: (e) => togglePause(e.target.checked)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block w-14 h-8 rounded-full bg-muted peer-checked:bg-primary transition" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition peer-checked:translate-x-6" })
							]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid md:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-bubbly",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid place-items-center w-9 h-9 rounded-xl",
							style: { background: "var(--accent)" },
							children: "📣"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-extrabold",
							children: "Recent Shouts"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2 max-h-96 overflow-auto",
						children: [shouts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-muted-foreground text-sm",
							children: "No shouts yet."
						}), shouts.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 p-3 rounded-2xl bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold leading-tight",
									children: s.videos?.title ?? "Video"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										s.videos?.category,
										" • ",
										timeAgo(s.created_at)
									]
								})]
							})]
						}, s.id))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-bubbly",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid place-items-center w-9 h-9 rounded-xl",
							style: { background: "var(--accent)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-extrabold",
							children: "Curiosity Log"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2 max-h-96 overflow-auto",
						children: [searches.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-muted-foreground text-sm",
							children: "No searches yet."
						}), searches.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "p-3 rounded-2xl bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-bold",
								children: [
									"\"",
									s.query,
									"\""
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: timeAgo(s.created_at)
							})]
						}, s.id))]
					})]
				})]
			})] })
		})]
	});
}
function timeAgo(iso) {
	const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1e3);
	if (s < 60) return `${s}s ago`;
	if (s < 3600) return `${Math.floor(s / 60)}m ago`;
	if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
	return `${Math.floor(s / 86400)}d ago`;
}
//#endregion
export { ParentDashboard as component };

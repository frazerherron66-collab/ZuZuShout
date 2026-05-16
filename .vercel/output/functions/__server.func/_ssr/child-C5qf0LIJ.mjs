import { r as __toESM } from "../_runtime.mjs";
import { f as useNavigate, m as require_react, p as require_jsx_runtime, u as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-CjreNzYf.mjs";
import { t as useAuth } from "./useAuth-rc5cznTz.mjs";
import { O as Flag, m as Search, r as Video, w as Link2, x as LogOut } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/child-C5qf0LIJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATS = [
	{
		id: "all",
		label: "For You",
		emoji: "✨"
	},
	{
		id: "laboratory",
		label: "Laboratory",
		emoji: "🧪"
	},
	{
		id: "pixel_play",
		label: "Pixel Play",
		emoji: "🎮"
	},
	{
		id: "studio",
		label: "Studio",
		emoji: "🎨"
	},
	{
		id: "vibe_flow",
		label: "Vibe & Flow",
		emoji: "🎵"
	},
	{
		id: "nature_scouts",
		label: "Nature Scouts",
		emoji: "🌿"
	}
];
function ChildView() {
	const { user, profile, loading, signOut } = useAuth();
	const navigate = useNavigate();
	const [cat, setCat] = (0, import_react.useState)("all");
	const [videos, setVideos] = (0, import_react.useState)([]);
	const [shouts, setShouts] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [search, setSearch] = (0, import_react.useState)("");
	const [paused, setPaused] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({
			to: "/auth",
			search: { role: "child" }
		});
		if (profile && profile.role !== "child") navigate({ to: "/parent" });
	}, [
		user,
		profile,
		loading,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		setPaused(profile?.paused ?? false);
	}, [profile?.paused]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		const ch = supabase.channel(`profile-${user.id}`).on("postgres_changes", {
			event: "UPDATE",
			schema: "public",
			table: "profiles",
			filter: `id=eq.${user.id}`
		}, (p) => {
			setPaused(Boolean(p.new.paused));
		}).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [user]);
	(0, import_react.useEffect)(() => {
		let q = supabase.from("videos").select("*").order("created_at", { ascending: false });
		if (cat !== "all") q = q.eq("category", cat);
		q.then(({ data }) => setVideos(data ?? []));
	}, [cat]);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		supabase.from("shouts").select("video_id").eq("child_id", user.id).then(({ data }) => setShouts(new Set((data ?? []).map((s) => s.video_id))));
	}, [user]);
	const shout = async (videoId) => {
		if (!user) return;
		if (shouts.has(videoId)) {
			await supabase.from("shouts").delete().eq("child_id", user.id).eq("video_id", videoId);
			setShouts((s) => {
				const n = new Set(s);
				n.delete(videoId);
				return n;
			});
		} else {
			const { error } = await supabase.from("shouts").insert({
				child_id: user.id,
				video_id: videoId
			});
			if (error) {
				toast.error(error.message);
				return;
			}
			setShouts((s) => new Set(s).add(videoId));
			toast.success("📣 Shouted!");
		}
	};
	const report = async (videoId) => {
		if (!user) return;
		await supabase.from("reports").insert({
			reporter_id: user.id,
			video_id: videoId
		});
		toast.success("Thanks — a grown-up will check this.");
	};
	const submitSearch = async (e) => {
		e.preventDefault();
		if (!user || !search.trim()) return;
		await supabase.from("search_history").insert({
			child_id: user.id,
			query: search.trim().slice(0, 200)
		});
		toast.success(`Searching for "${search}"`);
		setSearch("");
	};
	if (loading || !profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen grid place-items-center",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 backdrop-blur bg-background/80 border-b-2 border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-5xl mx-auto px-4 py-3 flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarMask, {
								template: profile.avatar,
								size: 44
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-extrabold text-lg leading-tight",
									children: [
										"Hi ",
										profile.username,
										"!"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: profile.paired_with ? "👪 Linked to a parent" : "Not linked yet"
								})]
							}),
							!profile.paired_with && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/link",
								className: "btn-bubbly btn-accent !py-2 !px-4 !text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "inline w-4 h-4 mr-1" }), "Link parent"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/record",
								className: "btn-bubbly btn-primary !py-2 !px-4 !text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "inline w-4 h-4 mr-1" }), "Record"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: signOut,
								className: "p-2 rounded-full hover:bg-muted",
								"aria-label": "Sign out",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "w-5 h-5" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-w-5xl mx-auto px-4 pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
							onSubmit: submitSearch,
							className: "flex gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: search,
									onChange: (e) => setSearch(e.target.value),
									placeholder: "Search shouts…",
									maxLength: 100,
									className: "w-full rounded-full border-2 border-input bg-white pl-12 pr-4 py-2.5 font-medium focus:outline-none focus:border-primary"
								})]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-w-5xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto",
						children: CATS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setCat(c.id),
							className: `shrink-0 rounded-full px-4 py-2 font-bold text-sm transition ${cat === c.id ? "btn-primary shadow-md" : "bg-secondary text-secondary-foreground"}`,
							style: cat === c.id ? {
								background: "var(--primary)",
								color: "var(--primary-foreground)"
							} : {},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mr-1",
								children: c.emoji
							}), c.label]
						}, c.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "max-w-3xl mx-auto px-4 pt-6 space-y-6",
				children: [videos.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-muted-foreground",
					children: "No videos yet."
				}), videos.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
					video: v,
					shouted: shouts.has(v.id),
					onShout: () => shout(v.id),
					onReport: () => report(v.id)
				}, v.id))]
			}),
			paused && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseOverlay, {})
		]
	});
}
function VideoCard({ video, shouted, onShout, onReport }) {
	const [popping, setPopping] = (0, import_react.useState)(false);
	const handleShout = () => {
		if (!shouted) {
			setPopping(true);
			setTimeout(() => setPopping(false), 500);
		}
		onShout();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "card-bubbly !p-0 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 bg-black aspect-[9/14] sm:aspect-video relative",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: video.video_url,
					controls: true,
					playsInline: true,
					className: "w-full h-full object-cover",
					preload: "metadata"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "w-20 shrink-0 flex flex-col items-center justify-end gap-4 p-3 bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: handleShout,
					className: "flex flex-col items-center gap-1 group",
					"aria-label": "Shout",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `w-14 h-14 rounded-full grid place-items-center text-2xl shadow-lg ${popping ? "animate-shout" : ""}`,
						style: {
							background: shouted ? "var(--shout)" : "var(--accent)",
							color: shouted ? "white" : "var(--accent-foreground)"
						},
						children: "📣"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold",
						children: shouted ? "Shouted!" : "Shout"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: onReport,
					className: "flex flex-col items-center gap-1",
					"aria-label": "Report",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-12 h-12 rounded-full grid place-items-center bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "w-5 h-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold",
						children: "Report"
					})]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 flex items-center gap-3 border-t-2 border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarMask, {
				template: video.creator_avatar,
				size: 40
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-bold leading-tight",
					children: video.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: ["@", video.creator_name]
				})]
			})]
		})]
	});
}
function PauseOverlay() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center p-6",
		style: { background: "oklch(0.18 0.05 295 / 0.92)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-bubbly text-center max-w-md",
			style: { background: "var(--accent)" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-7xl mb-4",
					children: "⏸️"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-4xl font-extrabold mb-2",
					children: "Time for a Break!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg font-medium",
					children: "A grown-up has paused ShoutTube. Take a stretch! 🌿"
				})
			]
		})
	});
}
//#endregion
export { ChildView as component };

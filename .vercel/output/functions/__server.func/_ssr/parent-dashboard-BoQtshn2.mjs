import { r as __toESM } from "../_runtime.mjs";
import { f as useNavigate, m as require_react, p as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-CjreNzYf.mjs";
import { A as CircleCheck, I as ArrowLeft, N as ChartColumn, P as Camera, S as Lock, T as KeyRound, f as ShieldCheck, i as Users, k as Clock, l as Trash2, n as X } from "../_libs/lucide-react.mjs";
import { t as Html5QrcodeScanner } from "../_libs/html5-qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parent-dashboard-BoQtshn2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ParentDashboard() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = (0, import_react.useState)("queue");
	const [isUnlocked, setIsUnlocked] = (0, import_react.useState)(false);
	const [isSettingPin, setIsSettingPin] = (0, import_react.useState)(false);
	const [pinInput, setPinInput] = (0, import_react.useState)("");
	const [savedPin, setSavedPin] = (0, import_react.useState)(null);
	const [linkedChildren, setLinkedChildren] = (0, import_react.useState)([]);
	const [selectedChild, setSelectedChild] = (0, import_react.useState)(null);
	const [childShouts, setChildShouts] = (0, import_react.useState)([]);
	const [isScanning, setIsScanning] = (0, import_react.useState)(false);
	const [followingList, setFollowingList] = (0, import_react.useState)([]);
	const [stats, setStats] = (0, import_react.useState)({
		totalShouts: 0,
		totalLikes: 0,
		totalComments: 0
	});
	const [isTimingOut, setIsTimingOut] = (0, import_react.useState)(false);
	const [customMinutes, setCustomMinutes] = (0, import_react.useState)(15);
	const fetchInitialData = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		const { data: profile } = await supabase.from("profiles").select("parent_pin").eq("id", user.id).single();
		if (profile?.parent_pin) setSavedPin(profile.parent_pin);
		else setIsSettingPin(true);
		const { data } = await supabase.from("parent_child_links").select(`
        child_id,
        profiles:child_id (id, username, avatar_url)
      `).eq("parent_id", user.id);
		if (data) {
			const children = data.map((item) => item.profiles);
			setLinkedChildren(children);
			if (children.length > 0 && !selectedChild) setSelectedChild(children[0]);
		}
	};
	(0, import_react.useEffect)(() => {
		fetchInitialData();
	}, []);
	const handlePinSubmit = async () => {
		if (pinInput.length < 4 || pinInput.length > 6) return toast.error("PIN must be 4-6 digits");
		if (isSettingPin) {
			const { data: { user } } = await supabase.auth.getUser();
			const { error } = await supabase.from("profiles").update({ parent_pin: pinInput }).eq("id", user?.id);
			if (!error) {
				toast.success("PIN set! Dashboard secured.");
				setSavedPin(pinInput);
				setIsSettingPin(false);
				setIsUnlocked(true);
			}
		} else if (pinInput === savedPin) {
			setIsUnlocked(true);
			toast.success("Access Granted");
		} else {
			setPinInput("");
			toast.error("Incorrect PIN");
		}
	};
	const startScanner = () => {
		setIsScanning(true);
		setTimeout(() => {
			const scanner = new Html5QrcodeScanner("reader", {
				fps: 10,
				qrbox: {
					width: 250,
					height: 250
				}
			}, false);
			scanner.render(async (decodedText) => {
				const { data: { user } } = await supabase.auth.getUser();
				if (!user) return;
				const { error } = await supabase.from("parent_child_links").insert([{
					parent_id: user.id,
					child_id: decodedText
				}]);
				if (error) if (error.code === "23505") toast.info("Child already linked!");
				else toast.error("Could not link account.");
				else {
					toast.success("New child added to dashboard!");
					fetchInitialData();
				}
				scanner.clear();
				setIsScanning(false);
			}, () => {});
		}, 100);
	};
	(0, import_react.useEffect)(() => {
		if (selectedChild && isUnlocked) fetchChildData();
	}, [
		selectedChild,
		activeTab,
		isUnlocked
	]);
	const fetchChildData = async () => {
		const { data: shouts } = await supabase.from("shouts").select("*").eq("user_id", selectedChild.id).order("created_at", { ascending: false });
		setChildShouts(shouts || []);
		if (activeTab === "social") fetchSocial();
		if (activeTab === "stats") fetchStats();
	};
	const approveShout = async (shoutId) => {
		const { error } = await supabase.from("shouts").update({ is_approved: true }).eq("id", shoutId);
		if (!error) {
			setChildShouts((prev) => prev.map((s) => s.id === shoutId ? {
				...s,
				is_approved: true
			} : s));
			toast.success("Shout Approved!");
		}
	};
	const deleteShout = async (shoutId) => {
		if (!window.confirm("Remove this post permanently?")) return;
		const { error } = await supabase.from("shouts").delete().eq("id", shoutId);
		if (!error) {
			setChildShouts((prev) => prev.filter((s) => s.id !== shoutId));
			toast.success("Post removed.");
		}
	};
	const fetchSocial = async () => {
		const { data } = await supabase.from("follows").select(`following_id, profiles!follows_following_id_fkey(username, avatar_url)`).eq("follower_id", selectedChild.id);
		setFollowingList(data || []);
	};
	const fetchStats = async () => {
		const { count: sCount } = await supabase.from("shouts").select("*", {
			count: "exact",
			head: true
		}).eq("user_id", selectedChild.id);
		const { data: shouts } = await supabase.from("shouts").select("id").eq("user_id", selectedChild.id);
		const sIds = shouts?.map((s) => s.id) || [];
		const { count: lCount } = await supabase.from("likes").select("*", {
			count: "exact",
			head: true
		}).in("shout_id", sIds);
		const { count: cCount } = await supabase.from("comments").select("*", {
			count: "exact",
			head: true
		}).in("shout_id", sIds);
		setStats({
			totalShouts: sCount || 0,
			totalLikes: lCount || 0,
			totalComments: cCount || 0
		});
	};
	const triggerTimeOut = async (minutes) => {
		if (!selectedChild) return toast.error("Select a child first");
		setIsTimingOut(true);
		const lockoutTime = /* @__PURE__ */ new Date();
		lockoutTime.setMinutes(lockoutTime.getMinutes() + minutes);
		const { error } = await supabase.from("profiles").update({ lockout_until: minutes > 0 ? lockoutTime.toISOString() : null }).eq("id", selectedChild.id);
		if (!error) toast[minutes > 0 ? "error" : "success"](minutes > 0 ? `LOCKOUT ACTIVE` : "Access Restored");
		setIsTimingOut(false);
	};
	if (!isUnlocked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-xs flex flex-col items-center text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, {
					size: 64,
					className: "text-emerald-400 mb-8 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-4xl font-black italic uppercase tracking-tighter text-white mb-2",
					children: "Parent Lock"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-white/70 text-[10px] uppercase font-bold tracking-[0.15em] mb-12",
					children: isSettingPin ? "Create a 4-6 digit pin to secure your dashboard" : "Enter PIN to access your parental controls"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							pattern: "[0-9]*",
							inputMode: "numeric",
							value: pinInput,
							maxLength: 6,
							onChange: (e) => setPinInput(e.target.value.replace(/\D/g, "")),
							className: "w-full bg-white/5 border-2 border-emerald-400 rounded-[2rem] py-6 text-center text-5xl font-black tracking-[0.5em] text-white outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all placeholder:text-white/10",
							placeholder: "••••"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: handlePinSubmit,
							className: "w-full bg-emerald-400 hover:bg-emerald-300 text-black py-5 rounded-[1.5rem] font-black italic uppercase tracking-widest active:scale-95 transition-all shadow-[0_10px_20px_rgba(52,211,153,0.3)]",
							children: isSettingPin ? "SET PIN" : "UNLOCK"
						}),
						!isSettingPin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => navigate({ to: "/profile" }),
							className: "text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors pt-2",
							children: "Go Back"
						})
					]
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-black text-white p-6 pt-12 font-sans pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-10 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => navigate({ to: "/profile" }),
						className: "p-2 bg-white/5 rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 20 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-4xl font-black italic uppercase tracking-tighter text-emerald-500",
						children: "Parent View"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setIsUnlocked(false),
					className: "p-2 bg-white/5 rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
						size: 20,
						className: "text-emerald-500"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3 overflow-x-auto pb-6 no-scrollbar",
				children: [linkedChildren.map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSelectedChild(child),
					className: `flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selectedChild?.id === child.id ? "bg-emerald-500 border-emerald-500 text-black" : "bg-white/5 border-white/10 text-white/60"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: child.avatar_url,
						className: "w-5 h-5 rounded-full"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[10px] font-black uppercase tracking-tighter",
						children: ["@", child.username]
					})]
				}, child.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: startScanner,
					className: "flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 active:scale-90 transition-transform",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { size: 18 })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "grid grid-cols-4 gap-1 mb-8 bg-white/5 p-1 rounded-2xl border border-white/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("queue"),
						className: `py-3 rounded-xl font-black italic uppercase text-[9px] flex flex-col items-center gap-1 transition-all ${activeTab === "queue" ? "bg-emerald-500 text-black" : "text-white/40"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 14 }), " Queue"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("social"),
						className: `py-3 rounded-xl font-black italic uppercase text-[9px] flex flex-col items-center gap-1 transition-all ${activeTab === "social" ? "bg-emerald-500 text-black" : "text-white/40"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 14 }), " Social"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("stats"),
						className: `py-3 rounded-xl font-black italic uppercase text-[9px] flex flex-col items-center gap-1 transition-all ${activeTab === "stats" ? "bg-emerald-500 text-black" : "text-white/40"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { size: 14 }), " Activity"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab("settings"),
						className: `py-3 rounded-xl font-black italic uppercase text-[9px] flex flex-col items-center gap-1 transition-all ${activeTab === "settings" ? "bg-emerald-500 text-black" : "text-white/40"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 14 }), " Safety"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [isScanning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: "reader",
						className: "overflow-hidden rounded-[2.5rem] bg-black border border-emerald-500/30"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setIsScanning(false),
						className: "absolute top-4 right-4 bg-red-500 p-2 rounded-full z-20 shadow-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
					})]
				}), selectedChild ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "animate-in fade-in slide-in-from-bottom-4",
					children: [
						activeTab === "queue" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] font-black uppercase text-emerald-500/50 px-2 tracking-widest",
								children: ["Reviewing Shouts: @", selectedChild.username]
							}), childShouts.map((shout) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white/5 rounded-[2rem] overflow-hidden border border-white/5 flex h-32 relative",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
										src: shout.video_url,
										className: `w-24 object-cover bg-black ${!shout.is_approved ? "opacity-30" : "opacity-80"}`
									}),
									!shout.is_approved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute left-8 top-1/2 -translate-y-1/2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
											size: 16,
											className: "text-yellow-500"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 p-4 flex flex-col justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-white/80 font-medium italic truncate",
											children: [
												"\"",
												shout.caption,
												"\""
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [!shout.is_approved ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => approveShout(shout.id),
												className: "flex-1 bg-emerald-500 text-black py-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 12 }), " Approve"]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 flex items-center justify-center gap-1 text-emerald-500 text-[9px] font-black uppercase",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 12 }), " Live"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => deleteShout(shout.id),
												className: "flex-1 bg-red-500/10 text-red-500 py-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1 border border-red-500/10",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 12 }), " Delete"]
											})]
										})]
									})
								]
							}, shout.id))]
						}),
						activeTab === "social" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-[10px] font-black uppercase text-emerald-500 tracking-widest px-2",
								children: [
									"Following (",
									followingList.length,
									")"
								]
							}), followingList.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: item.profiles?.avatar_url,
										className: "w-10 h-10 rounded-full border border-white/10"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-bold text-sm",
										children: ["@", item.profiles?.username]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "text-red-500 text-[9px] font-black uppercase bg-red-500/10 px-4 py-2 rounded-xl",
									children: "Block"
								})]
							}, i))]
						}),
						activeTab === "stats" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-4xl font-black italic text-emerald-500",
										children: stats.totalShouts
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[9px] font-black uppercase tracking-widest text-white/40 mt-1",
										children: "Shouts"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-white/5 border border-white/10 p-6 rounded-[2rem] text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-4xl font-black italic text-white",
										children: stats.totalLikes
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[9px] font-black uppercase tracking-widest text-white/40 mt-1",
										children: "Likes"
									})]
								})]
							})
						}),
						activeTab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "bg-red-600/5 border border-red-600/20 rounded-[2.5rem] p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 mb-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
										size: 20,
										className: "text-red-600"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-black italic uppercase text-sm text-red-500",
										children: "Instant Time Out"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-3 mb-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										value: customMinutes,
										onChange: (e) => setCustomMinutes(Number(e.target.value)),
										className: "flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none font-black italic text-xl text-center"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => triggerTimeOut(customMinutes),
										className: "bg-red-600 text-white px-8 rounded-2xl font-black italic uppercase text-[10px]",
										children: "Lock"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => triggerTimeOut(0),
									className: "w-full bg-white/5 border border-white/10 py-3 rounded-xl font-black italic uppercase text-[9px]",
									children: "Restore Access"
								})
							]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-20 text-center opacity-20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
						size: 48,
						className: "mx-auto mb-4"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-black uppercase italic tracking-widest",
						children: "Select a child or scan to add"
					})]
				})]
			})
		]
	});
}
//#endregion
export { ParentDashboard as component };

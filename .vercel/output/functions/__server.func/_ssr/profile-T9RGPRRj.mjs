import { r as __toESM } from "../_runtime.mjs";
import { f as useNavigate, m as require_react, p as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-CjreNzYf.mjs";
import { D as Grid3x3, E as Heart, I as ArrowLeft, M as Check, S as Lock, _ as Play, g as QrCode, j as ChevronDown, n as X } from "../_libs/lucide-react.mjs";
import { t as QRCodeSVG } from "../_libs/qrcode.react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-T9RGPRRj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AVATAR_LIBRARY = [
	{
		id: "lion",
		url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Lion"
	},
	{
		id: "panda",
		url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Panda"
	},
	{
		id: "cat",
		url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kitty"
	},
	{
		id: "prince-1",
		url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Prince"
	},
	{
		id: "princess-1",
		url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Princess"
	}
];
function ProfilePage() {
	const navigate = useNavigate();
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [activeTab, setActiveTab] = (0, import_react.useState)("posts");
	const [showEditModal, setShowEditModal] = (0, import_react.useState)(false);
	const [showQrModal, setShowQrModal] = (0, import_react.useState)(false);
	const [showSuggested, setShowSuggested] = (0, import_react.useState)(false);
	const [suggestedAccounts, setSuggestedAccounts] = (0, import_react.useState)([]);
	const [userShouts, setUserShouts] = (0, import_react.useState)([]);
	const [profile, setProfile] = (0, import_react.useState)({
		username: "",
		avatar_url: "",
		id: "",
		bio: "A short bio to describe your space 🦆",
		following: 0,
		followers: 0,
		likes: 0
	});
	(0, import_react.useEffect)(() => {
		fetchProfile();
		fetchSuggested();
	}, []);
	const fetchProfile = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			setLoading(false);
			return;
		}
		const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
		const { count: followingCount } = await supabase.from("follows").select("*", {
			count: "exact",
			head: true
		}).eq("follower_id", user.id);
		const { count: followersCount } = await supabase.from("follows").select("*", {
			count: "exact",
			head: true
		}).eq("following_id", user.id);
		const { data: shoutsData } = await supabase.from("shouts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
		if (profileData) setProfile({
			...profileData,
			id: user.id,
			following: followingCount || 0,
			followers: followersCount || 0,
			likes: profileData.total_likes || 0
		});
		if (shoutsData) setUserShouts(shoutsData);
		setLoading(false);
	};
	const fetchSuggested = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		const { data } = await supabase.from("profiles").select("id, username, avatar_url").neq("id", user?.id).limit(5);
		if (data) setSuggestedAccounts(data);
	};
	const handleFollow = async (targetUserId, targetUsername) => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return toast.error("Please login to follow!");
		const { error } = await supabase.from("follows").insert([{
			follower_id: user.id,
			following_id: targetUserId
		}]);
		if (error) if (error.code === "23505") toast.info(`Already following @${targetUsername}`);
		else toast.error(error.message);
		else {
			toast.success(`Following @${targetUsername}`);
			fetchProfile();
		}
	};
	const handleSaveProfile = async (newUsername, newAvatarUrl, newBio) => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		const { error } = await supabase.from("profiles").upsert({
			id: user.id,
			username: newUsername,
			avatar_url: newAvatarUrl,
			bio: newBio
		}, { onConflict: "id" });
		if (!error) {
			setProfile((prev) => ({
				...prev,
				username: newUsername,
				avatar_url: newAvatarUrl,
				bio: newBio
			}));
			setShowEditModal(false);
			toast.success("Profile Updated!");
		} else toast.error(error.message);
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-screen bg-black flex items-center justify-center text-white font-black italic uppercase tracking-widest animate-pulse",
		children: "Loading..."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-black text-white font-sans pb-20 overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex justify-between items-center p-4 sticky top-0 bg-black z-10 border-b border-white/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
						className: "cursor-pointer hover:scale-110 transition-all",
						onClick: () => navigate({ to: "/feed" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-bold text-sm tracking-tight",
						children: profile.username || "Profile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, {
						className: "cursor-pointer text-white/40 hover:text-white",
						size: 20,
						onClick: () => setShowQrModal(true)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center pt-4 px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-900 overflow-hidden mb-3 shadow-2xl",
						children: profile.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: profile.avatar_url,
							className: "w-full h-full object-cover",
							alt: "Profile"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full h-full bg-gradient-to-tr from-zinc-700 to-zinc-900" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-bold text-base mb-6 flex items-center gap-1",
						children: [
							"@",
							profile.username || "user",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-cyan-400 text-black text-[8px] p-0.5 rounded-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
									size: 8,
									strokeWidth: 4
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-10 mb-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-lg leading-none",
									children: profile.following
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-zinc-500 text-[11px] mt-1 font-medium",
									children: "Following"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center border-x border-white/10 px-10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-lg leading-none",
									children: profile.followers
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-zinc-500 text-[11px] mt-1 font-medium",
									children: "Followers"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-lg leading-none",
									children: profile.likes
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-zinc-500 text-[11px] mt-1 font-medium",
									children: "Likes"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 w-full max-w-xs mb-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowEditModal(true),
							className: "flex-1 bg-[#fe2c55] py-2.5 rounded-sm font-bold text-[15px] active:scale-95 transition-all shadow-lg",
							children: "Edit Profile"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowSuggested(!showSuggested),
							className: `bg-zinc-800 p-2.5 rounded-sm active:scale-90 transition-colors ${showSuggested ? "bg-zinc-700" : ""}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
								className: `transition-transform duration-300 ${showSuggested ? "rotate-180" : ""}`,
								size: 18
							})
						})]
					}),
					showSuggested && suggestedAccounts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full mb-6 animate-in fade-in slide-in-from-top-4 duration-300",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-between items-center mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-black text-zinc-500 uppercase tracking-widest",
								children: "Suggested Accounts"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x",
							children: suggestedAccounts.map((acc, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-shrink-0 w-36 bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center snap-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-white/5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: acc.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${acc.username}`,
											className: "w-full h-full object-cover"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] font-bold truncate w-full text-center mb-3",
										children: ["@", acc.username]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => handleFollow(acc.id, acc.username),
										className: "w-full bg-[#fe2c55] py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
										children: "Follow"
									})
								]
							}, i))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center text-sm mb-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-zinc-300 px-10 leading-relaxed font-medium",
							children: profile.bio
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex border-t border-white/10 mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setActiveTab("posts"),
					className: `flex-1 flex justify-center py-3 border-b-2 transition-all ${activeTab === "posts" ? "border-white opacity-100" : "border-transparent opacity-40"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, { size: 22 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActiveTab("liked"),
					className: `flex-1 flex justify-center py-3 border-b-2 transition-all ${activeTab === "liked" ? "border-white opacity-100" : "border-transparent opacity-40"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
							size: 22,
							className: "mr-1"
						}),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { size: 22 })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-[1.5px]",
				children: userShouts.length > 0 ? userShouts.map((shout, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: () => navigate({ to: "/feed" }),
					className: "aspect-[3/4] bg-zinc-900 relative group cursor-pointer overflow-hidden transition-opacity hover:opacity-90 border-zinc-950 border-[0.5px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: shout.video_url,
							className: "w-full h-full object-cover pointer-events-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-black drop-shadow-lg text-white",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
									size: 10,
									fill: "white"
								}),
								" ",
								shout.views || 0
							]
						}),
						i === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-2 left-2 bg-[#fe2c55] text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-xl",
							children: "Latest"
						})
					]
				}, shout.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-3 py-20 text-center text-zinc-600",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-black italic uppercase tracking-tighter",
						children: "No Shouts yet"
					})
				})
			}),
			showQrModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm bg-zinc-900 p-8 rounded-[3rem] border border-white/10 flex flex-col items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-full flex justify-end mb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								className: "cursor-pointer text-white/40",
								onClick: () => setShowQrModal(false)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-black italic uppercase text-xl tracking-tighter mb-2",
							children: "Safety ID"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8 text-center px-4",
							children: "Ask your parent to scan this to verify your space"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-6 bg-white rounded-[2rem] shadow-2xl mb-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRCodeSVG, {
								value: profile.id,
								size: 180,
								level: "H"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] text-white/20 break-all text-center px-6",
							children: profile.id
						})
					]
				})
			}),
			showEditModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditProfileModal, {
				profile,
				onClose: () => setShowEditModal(false),
				onSave: handleSaveProfile,
				avatarLibrary: AVATAR_LIBRARY
			})
		]
	});
}
//#endregion
export { ProfilePage as component };

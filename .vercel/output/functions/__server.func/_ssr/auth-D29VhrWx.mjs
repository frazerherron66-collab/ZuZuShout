import { r as __toESM } from "../_runtime.mjs";
import { f as useNavigate, m as require_react, p as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Route } from "./ssr.mjs";
import { t as supabase } from "./client-CjreNzYf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-D29VhrWx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const { role } = Route.useSearch();
	const currentRole = role || "child";
	const [isLoggingIn, setIsLoggingIn] = (0, import_react.useState)(true);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const handleAuth = async (e) => {
		e.preventDefault();
		setLoading(true);
		if (isLoggingIn) {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (error) toast.error(error.message);
			else {
				toast.success("Welcome back!");
				navigate({ to: currentRole === "parent" ? "/parent-dashboard" : "/feed" });
			}
		} else {
			const { data, error: authError } = await supabase.auth.signUp({
				email,
				password,
				options: { data: { role: currentRole } }
			});
			if (authError) toast.error(authError.message);
			else if (data.user) {
				const { error: profileError } = await supabase.from("profiles").insert([{
					id: data.user.id,
					username: email.split("@")[0],
					avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.user.id}`,
					bio: "Welcome to my space! 🚀"
				}]);
				if (profileError) console.error("Profile auto-creation error:", profileError);
				toast.success("Account Created! You can log in now.");
				setIsLoggingIn(true);
			}
		}
		setLoading(false);
	};
	const isParent = currentRole === "parent";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `min-h-screen ${isParent ? "bg-slate-900" : "bg-yellow-400"} flex items-center justify-center p-6 transition-colors duration-500`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-5xl w-full grid md:grid-cols-12 gap-6 items-stretch",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:col-span-4 flex flex-col justify-center order-2 md:order-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setIsLoggingIn(!isLoggingIn),
					className: "group h-full bg-white/20 hover:bg-white/30 border-4 border-dashed border-white/60 p-8 rounded-[40px] text-center transition-all flex flex-col items-center justify-center gap-4 shadow-inner",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-white font-black text-2xl uppercase tracking-tighter italic",
						children: isLoggingIn ? "New Here?" : "Have an account?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-sm group-hover:scale-110 transition-transform shadow-lg",
						children: isLoggingIn ? "CREATE ACCOUNT" : "GO TO LOGIN"
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:col-span-8 bg-white rounded-[50px] p-10 md:p-16 shadow-2xl border-4 border-black order-1 md:order-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-5xl font-black italic tracking-tighter uppercase text-black leading-none",
						children: isLoggingIn ? "Log In" : "Sign Up"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest",
						children: isParent ? "Parent Dashboard Access" : "Kid Safe Zone"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleAuth,
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-black uppercase ml-4 text-gray-400",
								children: "Email Address"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								placeholder: "email@example.com",
								className: "w-full p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-[10px] font-black uppercase ml-4 text-gray-400",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "password",
								placeholder: "••••••••",
								className: "w-full p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loading,
							className: "w-full bg-blue-600 text-white p-6 rounded-3xl font-black text-2xl hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_0_rgba(0,0,0,0.2)] mt-4 uppercase italic tracking-tighter",
							children: loading ? "WAITING..." : isLoggingIn ? "Let's Go! 🚀" : "Register! ✨"
						})
					]
				})]
			})]
		})
	});
}
//#endregion
export { AuthPage as component };

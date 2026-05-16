import { r as __toESM } from "../_runtime.mjs";
import { f as useNavigate, m as require_react, p as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as supabase } from "./client-CjreNzYf.mjs";
import { t as useAuth } from "./useAuth-rc5cznTz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/link-DbHTLTfG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LinkParent() {
	const { user, refreshProfile } = useAuth();
	const navigate = useNavigate();
	const [code, setCode] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const submit = async (e) => {
		e.preventDefault();
		if (!user) return;
		setBusy(true);
		const { error } = await supabase.rpc("redeem_pairing_code", { _code: code.trim() });
		setBusy(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Linked! 🎉");
		await refreshProfile();
		navigate({ to: "/child" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen grid place-items-center p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-bubbly w-full max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-6xl mb-4",
					children: "🔗"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-extrabold mb-2",
					children: "Enter your parent's code"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground mb-6",
					children: "Ask your grown-up for the 6-digit code from their dashboard."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: code,
							onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
							placeholder: "123456",
							inputMode: "numeric",
							maxLength: 6,
							className: "w-full text-center text-4xl font-extrabold tracking-[0.5em] rounded-2xl border-2 border-input bg-white py-4 focus:outline-none focus:border-primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy || code.length !== 6,
							className: "btn-bubbly btn-primary w-full disabled:opacity-60",
							children: busy ? "Linking…" : "Link with parent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => navigate({ to: "/child" }),
							className: "font-bold underline text-sm",
							children: "Skip for now"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { LinkParent as component };

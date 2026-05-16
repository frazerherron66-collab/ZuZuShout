import { r as __toESM } from "../_runtime.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import "./client-CjreNzYf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useAuth-rc5cznTz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
require_jsx_runtime();
var Ctx = (0, import_react.createContext)(void 0);
function useAuth() {
	const c = (0, import_react.useContext)(Ctx);
	if (!c) throw new Error("useAuth outside AuthProvider");
	return c;
}
//#endregion
export { useAuth as t };

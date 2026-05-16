import { StartClient } from "@tanstack/react-start";
import { createRoot } from "react-dom/client";
import { getRouter } from "./router";

const router = getRouter();

createRoot(document.getElementById("root")!).render(
  <StartClient router={router} />
);

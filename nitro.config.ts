import { defineNitroConfig } from "nitro/config"

export default defineNitroConfig({
  preset: "vercel",
  vercel: {
    config: {
      runtime: "nodejs20.x"
    }
  }
})

import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server"
import { getRouter as createRouter } from "./router"

export default createStartHandler({
  createRouter,
})(defaultStreamHandler)

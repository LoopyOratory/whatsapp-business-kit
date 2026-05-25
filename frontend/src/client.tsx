import { StartClient } from "@tanstack/react-start/client"
import { hydrateRoot } from "react-dom/client"
import { router } from "./router"
import "./styles.css"

hydrateRoot(document, <StartClient router={router} />)

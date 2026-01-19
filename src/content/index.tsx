import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setupShadowRoot } from "./core/shadow-root";
import { initMessageListener } from "./core/message-listener";
import App from "./app";

initMessageListener();

const container = setupShadowRoot();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

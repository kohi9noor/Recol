import styleText from "../styles/main.css?inline";

export function setupShadowRoot() {
  const host = document.createElement("div");
  host.id = "recol-extension-root";
  host.style.all = "initial";
  host.style.fontFamily = "inter, sans-serif";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const styleElement = document.createElement("style");
  styleElement.textContent = styleText;
  shadow.appendChild(styleElement);

  const container = document.createElement("div");
  container.id = "recol-root";
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.right = "20px";
  container.style.zIndex = "2147483647";
  container.style.pointerEvents = "none";
  shadow.appendChild(container);

  return container;
}

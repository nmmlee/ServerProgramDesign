import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import cookingHero from "./assets/cooking-hero.png";

let faviconLink = document.querySelector<HTMLLinkElement>("link[rel='icon']");
if (!faviconLink) {
  faviconLink = document.createElement("link");
  faviconLink.rel = "icon";
  document.head.appendChild(faviconLink);
}
faviconLink.type = "image/png";
faviconLink.href = cookingHero;

createRoot(document.getElementById("root")!).render(<App />);

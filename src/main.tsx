import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker early so push notifications work on mobile/desktop
if ('serviceWorker' in navigator) {
	window.addEventListener('load', async () => {
		try {
			const reg = await navigator.serviceWorker.register('/sw.js');
			console.log('Service Worker registered at startup:', reg);
		} catch (e) {
			console.warn('Service Worker registration failed at startup:', e);
		}
	});
}

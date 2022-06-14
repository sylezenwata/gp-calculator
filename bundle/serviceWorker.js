const staticGpCalc = "gp-calculator-app-v1";
const assets = [
	"./",
	"./index.html",
	"./manifest.json",
	"./main.js",
	"./main.css",
	"./src_js_app_js~chunk.js",
];

self.addEventListener("install", (installEvent) => {
	installEvent.waitUntil(
		caches.open(staticGpCalc).then((cache) => {
			cache.addAll(assets);
		})
	);
});

self.addEventListener("fetch", (fetchEvent) => {
	fetchEvent.respondWith(
		caches.match(fetchEvent.request).then((res) => {
			return res || fetch(fetchEvent.request);
		})
	);
});

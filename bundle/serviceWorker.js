const staticDevCoffee = "gp-calculator-app-v1";
const assets = [
	"./",
	"./index.html",
	"./main.css",
	"./main.js",
	"./src_js_app_js~chunk.js",
	"./manifest.json",
];

self.addEventListener("install", (installEvent) => {
	installEvent.waitUntil(
		caches.open(staticDevCoffee).then((cache) => {
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

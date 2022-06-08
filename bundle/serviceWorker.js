const staticGpCalc = "gp-calculator-app-v1";
const assets = [
	"./",
	"./index.html",
	"./manifest.json",
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

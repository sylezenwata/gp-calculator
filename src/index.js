import "./css/style.css";
import spinnerGif from "./img/spinner.gif";

import { $, calcScreenSize, forceScreenSize, on } from "./js/modules";

// set app screen size
const [ _width, _height ] = calcScreenSize();
forceScreenSize(_width, _height);

// create page loader
const loader = $("[data-loader]");
const spinner = document.createElement("img");
spinner.src = spinnerGif;
loader.appendChild(spinner);

// load app
on("load", window, () => {
	import("./js/app")
		.then(() => {
			// remove loader
			$("body").style.position = "";
			loader.remove();

			// service worker
			if ("serviceWorker" in navigator) {
				navigator.serviceWorker
					.register("./serviceWorker.js")
					.then((res) => console.log("service worker registered"))
					.catch((err) => console.log("service worker not registered", err));
			}
		})
		.catch((error) => console.log(error));
});

// query selector function
export function $(selector, all = false, context = document) {
	if ("string" !== typeof selector) {
		return selector;
	}
	return all
		? context.querySelectorAll.bind(context)(selector)
		: context.querySelector.bind(context)(selector);
}

/**
 * function to bind event
 * @param {String} event
 * @param {String|Node} element
 * @param {Function} callback
 * @param {String|Node} optionalTarget
 * @param {Object|Boolean} options
 * @returns void
 */
export function on(event, element, callback, optionalTarget, options) {
	element =
		"string" === typeof element ? document.querySelector(element) : element;
	if (!element) {
		return;
	}
	if (optionalTarget) {
		element.addEventListener(
			event,
			(e) => {
				if (e.target.matches(optionalTarget)) {
					callback(e);
				}
			},
			options
		);
	} else {
		element.addEventListener(event, callback, options);
	}
}

/**
 * function to split array into chunks
 * @param {Number} chunkSize
 * @returns {Array}
 */
Array.prototype.chunk = function (chunkSize) {
	const _chunk = [];
	for (let i = 0; i < this.length; i += chunkSize) {
		_chunk.push(this.slice(i, i + chunkSize));
	}
	return _chunk;
};

export function checkIsNotElectron() {
	return navigator.userAgent.toLowerCase().indexOf(" electron/") == -1;
}

/**
 * fubction to store data in localStorage
 * @param {String} key
 * @param {*} value
 */
export function storeLocalItem(key, value) {
	try {
		if ("string" !== typeof value) {
			value = JSON.stringify(value);
		}
		localStorage.setItem(key, value);
	} catch (error) {
		console.log(error);
	}
}

/**
 * function to get an item stored in localStorage
 * @param {String} key
 * @returns {*}
 */
export function getLocalItem(key) {
	let data;
	try {
		data = JSON.parse(localStorage.getItem(key));
	} catch (error) {
		console.log(error);
	}
	return data;
}

/**
 * function to delete an item stored in localStorage
 * @param {String} key
 */
export function deleteLocalItem(key) {
	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.log(error);
	}
}

/**
 * function to close dialogue
 * @param {String|Node} id
 */
export function closeDialogue(id) {
	$(id)?.remove();
}

/**
 * function to trigger custom dialogue
 * @param {String} info
 * @param {String} type
 * @param {Function} callBackOk
 * @param {Function|null} callBackCancel
 */
export function dialogue(
	info,
	type,
	callBackOk,
	callBackCancel = null,
	contextToAppend = "#root"
) {
	// validate type
	type = type.toString().toLowerCase();
	const validTypes = ["alert", "confirm", "prompt"];
	if (!validTypes.some((e) => e === type)) {
		throw new Error("Param type can only be " + validTypes.join(" or "));
	}

	// get temp
	const dialogueTemp = $("[data-dialogue-template]").content.cloneNode(true)
		.children[0];
	const dialogueForm = dialogueTemp.querySelector("[data-dialogue-form]");
	const [infoSection, controlSection] = dialogueForm.children;

	// modal id
	const dialogueId = "dia" + Math.round(Math.random() * 1000000);
	dialogueTemp.setAttribute("data-dialogue", dialogueId);

	// pass text to first child of info section
	[...infoSection.children].filter((e) =>
		e.hasAttribute("data-dialogue-info")
	)[0].textContent = info;

	// remove input from temp if type is not prompt
	if (type !== validTypes[2]) {
		[...infoSection.children]
			.filter((e) => e.hasAttribute("data-dialogue-input"))[0]
			?.remove();
	}

	// remove cancel button when type is alert
	if (type === validTypes[0]) {
		[...controlSection.children]
			.filter((e) => e.hasAttribute("data-dialogue-cancel"))[0]
			?.remove();
	}

	// when form is submitted or ok is clicked
	on("submit", dialogueForm, (e) => {
		e.preventDefault();
		if (type === validTypes[2]) {
			const promptValue = [e.target.elements].filter((e) =>
				e.hasAttribute("data-dialogue-input")
			)[0].value;
			callBackOk(dialogueId, promptValue);
		} else {
			callBackOk(dialogueId);
		}
		noOverFlow();
	});

	// when cancel is clicked
	if (callBackCancel) {
		on(
			"click",
			controlSection.querySelector("[data-dialogue-cancel]"),
			(e) => {
				callBackCancel(dialogueId);
				noOverFlow();
			},
			null,
			{
				once: true,
			}
		);
	}

	// append dialogue to body
	$(contextToAppend).append(dialogueTemp);

	// set modal-content c-height
	const modalContent = dialogueTemp.children[0];
	modalContent.style.setProperty(
		"--c-height",
		`${modalContent.clientHeight}px`
	);

	// prevent body from scrolling
	noOverFlow();

	// focus input if type is  prompt
	if (type === validTypes[2]) {
		$(`[data-dialogue-input]`).focus();
	} else {
		$(`[data-dialogue-ok]`).focus();
	}
}

/**
 * function to prevent body from scrolling
 */
let _top;
export function noOverFlow() {
	const body = $("body");
	// when there is no-overflow is active
	if (body.classList.contains("no-overflow")) {
		body.classList.remove("no-overflow");
		body.style.top = "";
		window.scroll(null, parseInt(_top.replace(/[\-px]/g, "")));
		return;
	}

	// toggle body scroll and maintain scroll position
	_top = `-${window.scrollY}px`;
	body.classList.add("no-overflow");
	body.style.top = _top;
}

/**
 * function to check if app is installed
 */
export function isInstalled() {
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		window.navigator.standalone === true
	);
}

/**
 * function to set app screen size
 * @param {Number} width
 * @param {*} height
 * @param {*} force
 */
export function forceScreenSize(width, height, force = false) {
	if (isInstalled()) {
		// Size window after open the app
		window.resizeTo(width, height);

		// force size after resize
		if (force) {
			window.addEventListener("resize", () => {
				window.resizeTo(width, height);
			});
		}
	}
}

/**
 * function to calculate screen width and height to set
 * @param {Number} defWidth
 * @param {Number} defHeight
 * @returns {Array}
 */
export function calcScreenSize(defWidth = 950, defHeight = 650) {
	const { availavleWidth, availavleHeight } = window.screen;
	let calcWidth = availavleWidth / 1.25;
	let calcHeight = availavleHeight / 1.25;
	if (calcWidth > defWidth) {
		calcWidth = defWidth;
	}
	if (calcHeight > defHeight) {
		calcHeight = defHeight;
	}
	return [calcWidth, calcHeight];
}

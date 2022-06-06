import {
	$,
	closeDialogue,
	deleteLocalItem,
	dialogue,
	getLocalItem,
	on,
	storeLocalItem,
} from "./modules";

/**
 * function to get each course values from dom and organize them in chunks of array
 * @returns {Array}
 */
function domCoursesRefined() {
	const courses = $("[data-course]", true);
	return [...courses].reduce((_arr, _item) => {
		let [_course, _unit, _passMark] = _item.children;
		_unit = /\d/.test(_unit.value) ? parseInt(_unit.value) : _unit.value;
		_passMark = /\d/.test(_passMark.value)
			? parseInt(_passMark.value)
			: _passMark.value;
		_arr.push([_course.value, _unit, _passMark]);
		return _arr;
	}, []);
}

/**
 * function generate courses
 * @param {Number} size
 */
function generateCourses(size) {
	// get persisted courses or new array
	const courses = getLocalItem("courses") || domCoursesRefined();

	// create append new course
	for (let index = 0; index < size; index++) {
		courses.push(["", "", 40]);
	}

	// clear existing courses
	$("[data-courses-container]").innerHTML = "";

	// create courses elements and pass values
	courses.forEach((eachCol, index) => {
		const temp = $("[data-course-template]").content.cloneNode(true)
			.children[0];
		temp.setAttribute("data-course", index);
		[...temp.children].map((e, i) => (e.value = eachCol[i]));
		$("[data-courses-container]").append(temp);
	});
}

// generate courses with persisted courses on page load
const storedCourses = getLocalItem("courses");
if (storedCourses && storedCourses.length > 0) {
	generateCourses(0);
}

/**
 * function to handle when dialogue is cancelled
 * can also be used to handle when dialogue of type "alert" is submitted
 * @param  {...any} args
 */
const dialogueCancelCallBack = (...args) => {
	closeDialogue(`[data-dialogue="${args[0]}"]`);
};

// add courses button
on("click", "[data-add-courses]", () => {
	dialogue(
		"How many courses do you want to add?",
		"prompt",
		(...args) => {
			const size = args[0];
			generateCourses(size);
			closeDialogue(`[data-dialogue="${args[1]}"]`);
		},
		dialogueCancelCallBack
	);
});

// clear courses button
on("click", "[data-clear-courses]", () => {
	if (domCoursesRefined().length > 0) {
		dialogue(
			"Are you sure you want to clear courses?",
			"confirm",
			(...args) => {
				deleteLocalItem("courses");
				$("[data-courses-container]").innerHTML = "";
				closeDialogue(`[data-dialogue="${args[0]}"]`);
			},
			dialogueCancelCallBack
		);
	}
});

/**
 * function to calculate grade
 * @param {Number} score
 * @param {Number} unit
 * @param {Number} passMark
 * @returns
 */
function calcGrade(score, unit, passMark) {
	if (score < 40 || score < passMark) {
		return 0 * unit;
	}
	if (score <= 44) {
		return 1 * unit;
	}
	if (score <= 49) {
		return 2 * unit;
	}
	if (score <= 59) {
		return 3 * unit;
	}
	if (score <= 69) {
		return 4 * unit;
	}
	if (score >= 70) {
		return 5 * unit;
	}
}

/**
 * function to calculate gp
 * @param {Array} data
 * @param {Array} courses
 * @returns {Array}
 */
function calculator(data, courses) {
	// check if there is deferred courses
	const hasDeferredCourses = data.some((e) => e === "-");

	// get all units
	const units = [...courses]
		.map((e, i) => ("-" !== data[i] ? e[1] : null))
		.filter((e) => null !== e);

	// get all pass mark
	const passMarks = [...courses]
		.map((e, i) => ("-" !== data[i] ? e[2] : null))
		.filter((e) => null !== e);

	// update data
	if (hasDeferredCourses) {
		data = [...data].filter((e) => "-" !== e);
	}

	// get total grade
	const totalGrade = data
		.map((score, i) => calcGrade(parseInt(score), units[i], passMarks[i]))
		.reduce((res, item) => {
			res += parseInt(item);
			return res;
		}, 0);

	// get total units
	const totalUnits = units.reduce((res, item) => {
		res += parseInt(item);
		return res;
	}, 0);

	// calc failed units
	const failedUnits = units
		.filter((unit, index) => data[index] < passMarks[index])
		.reduce((res, item) => {
			res += parseInt(item);
			return res;
		}, 0);

	// calc gp
	return [
		totalUnits,
		totalUnits - failedUnits,
		failedUnits,
		totalGrade,
		Number(totalGrade / totalUnits).toFixed(2),
	].map((e) => e.toString());
	// .map((e, i) => (3 !== i && e === "0" ? " " : e));
}

// var to monitor when there is a change in input course
let coursesChanged = false;

/**
 * function to handle calculate form
 * @param {*} e
 * @returns void
 */
function calculate(e) {
	e.preventDefault();

	// clear result element
	$("[data-show-calculation]").textContent =
		"Calculated result will appear here...";

	// get courses
	const courses = domCoursesRefined();

	// validate if data equals courses
	if (courses.length <= 0) {
		return dialogue(
			"Oops, please add course(s) to continue.",
			"alert",
			dialogueCancelCallBack
		);
	}

	// store courses in localStorage
	if (coursesChanged === true) {
		storeLocalItem("courses", courses);
		coursesChanged = false;
	}

	// form data
	const [results] = [...this.elements].filter((e) =>
		e.hasAttribute("data-valid")
	);

	// organize data
	let data = results.value
		.trim()
		.split(/(\t|\n)/)
		.filter((e) => e !== "\t" && e !== "\n")
		.reduce((d, i) => {
			if (/^\d+[a-zA-Z]+$/.test(i)) {
				i = i.replace(/[a-zA-Z]+/g, "");
			}
			if (/^\d+$/.test(i.trim())) {
				d.push(i);
			} else if ("-" === i.trim()) {
				d.push("-");
			} else {
				d.push("0");
			}
			return d;
		}, []);

	// chunk data array into chunks
	// each chunk represents each row in results
	data = data.chunk(courses.length);

	// validate if data equals courses
	if (data.some((arr) => arr.length !== courses.length)) {
		return dialogue(
			"Oops, invalid inputed result format. Each score is matched to each existing courses accordingly.",
			"alert",
			dialogueCancelCallBack
		);
	}

	// run calculator
	let calculatedResult = [];
	data.forEach((eachData) => {
		calculatedResult.push(calculator(eachData, courses));
	});

	// show result
	let count = 1;
	let tabulateResult = `<div class="flex justify-content-end m-b-10"><button style="padding: 2px 4px;" data-clear-result>Clear</button></div>`;
	tabulateResult += `<table><thead><tr><th>No.</th><th>Total Units</th><th>Units Passed</th><th>Carryover Units</th><th>GP</th><th>GPA</th></tr></thead><tbody>`;
	for (let eachCalculatedResult of calculatedResult) {
		eachCalculatedResult = [count].concat(eachCalculatedResult);
		tabulateResult += eachCalculatedResult.reduce((str, item, index) => {
			if (index === 0) {
				str = `<tr>`;
			}
			str += `<td>${item}</td>`;
			if (index === eachCalculatedResult.length - 1) {
				str += `</tr>`;
			}
			return str;
		}, ``);
		count += 1;
	}
	tabulateResult += `</tbody></table>`;
	$("[data-show-calculation]").innerHTML = tabulateResult;
}

// calculate form
on("submit", "[data-calculator-form]", calculate);

// monitor each courses input chage
// this will allow for updating persisted
on("change", document, () => (coursesChanged = true), "[data-course] input");

// clear result
on(
	"click",
	document,
	() => {
		$("[data-show-calculation]").textContent =
			"Calculated result will appear here...";
	},
	"[data-clear-result]"
);

const packager = require("electron-packager");
const electronInstaller = require('electron-winstaller');
const path = require("path");

async function build(options) {

	const appPaths = await packager(options);

	console.log(`✅ App build ready in: ${appPaths.join("\n")}`);

	try {
		await electronInstaller.createWindowsInstaller({
			appDirectory: "./dist/GP-Calculator-win32-ia32",
			outputDirectory: "./dist/installer",
			authors: "Sylvester Ezenwata",
			description: "Dynamic grade point(GP) calculator",
			exe: "GP-Calculator.exe",
		});
		console.log("💻 Installer is created in dist/installer");
	} catch (e) {
		console.log(`The following error occured: ${e.message}`);
	}
}

build({
	name: "GP-Calculator",
	dir: path.resolve(__dirname + "/"),
	out: "dist",
	overwrite: true,
	asar: true,
	platform: "win32",
	arch: "ia32",
	icon: path.resolve(__dirname + "/bundle/icons/favicon-96x96.png"),
  ignore: [
    "./src",
    "./.vscode",
  ],
});

const EI = require('electron-winstaller');

try{
	EI.createWindowsInstaller({
		appDirectory: `./${process.argv.slice(-1)[0]}-win32-x64`,
		outputDirectory: `${process.argv.slice(-1)[0]}-installer`,
		authors: `Matthias Southwick`,
		exe: `${process.argv.slice(-1)[0]}.exe`
	}).then(e=>{
		console.log('Success');
	}).catch(e=>{
		console.error(e.message);
	})
} catch(e) {
	console.error(e.message);
}
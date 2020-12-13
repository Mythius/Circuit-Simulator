const canvas = obj('#editor');
const ctx = canvas.getContext('2d');
var fps = 30;

// hide(obj('main'));

obj('#delete').on('click',e=>{
	if(CurrentBoard.cur_chip){
		CurrentBoard.cur_chip.remove();
	}
});

obj('#clear').on('click',e=>{
	CurrentBoard.clear();
});

obj('#input').on('change',e=>{
	CurrentBoard.setInputs(+obj('#input').value);
});

obj('#output').on('change',e=>{
	CurrentBoard.setOutputs(+obj('#output').value);
});

obj('#create').on('click',e=>{
	let name = obj('#boardname').value || 'default'+random(0,1000);
	new Shortcut(CurrentBoard.toJSON(name),name);
	obj('#boardname').value = "";
});

upload(obj('#upload'),data=>{
	let obj = JSON.parse(data);
	for(let thing of obj){
		new Shortcut(thing.data,thing.name);
	}
});

obj('#download').on('click',e=>{
	// TEMPRORARY
	let data = JSON.stringify(Shortcut.CustomPieces);
	download('data.json',data);
	// download('file.json',Data.export());
});

function setupEditor(){

	new Shortcut(inputs=>[inputs[0]&&inputs[1]],'AND',2,1);
	new Shortcut(inputs=>[inputs[0]||inputs[1]],'OR',2,1);
	new Shortcut(inputs=>[!inputs[0]],'NOT',1,1);

}


function setup(){

	setupEditor();

	mouse.start(canvas);
	keys.start();

	loop();
}

function loop(){
	setTimeout(loop,1000/fps);
	ctx.clearRect(-2,-2,canvas.width+2,canvas.height+2);
	CurrentBoard.draw();
}

setup();

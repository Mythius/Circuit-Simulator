const canvas = obj('#editor');
const ctx = canvas.getContext('2d');
// hide(obj('main'));

obj('#delete').on('click',e=>{
	if(CurrentBoard.cur_chip){
		CurrentBoard.cur_chip.remove();
	}
})

function setupEditor(){

	new Shortcut(inputs=>[inputs[0]&&inputs[1]],'AND',2,1);
	new Shortcut(inputs=>[inputs[0]||inputs[1]],'OR',2,1);
	new Shortcut(inputs=>[!inputs[0]],'NOT',1,1);

}


function setup(){

	setupEditor();

	mouse.start(canvas);
	keys.start();

	CurrentBoard.setInputs(2);
	CurrentBoard.setOutputs(1);

	loop();
}

function loop(){
	setTimeout(loop,1000/30);
	ctx.clearRect(-2,-2,canvas.width+2,canvas.height+2);
	CurrentBoard.draw();
}

setup();
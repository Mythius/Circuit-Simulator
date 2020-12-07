const canvas = obj('#editor');
const ctx = canvas.getContext('2d');
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
})

obj('#output').on('change',e=>{
	CurrentBoard.setOutputs(+obj('#output').value);
})

function setupEditor(){

	new Shortcut(inputs=>[inputs[0]&&inputs[1]],'AND',2,1);
	new Shortcut(inputs=>[inputs[0]||inputs[1]],'OR',2,1);
	new Shortcut(inputs=>[!inputs[0]],'NOT',1,1);
	new Shortcut(inputs=>[!(inputs[0]||inputs[1])],'NOR',2,1);
	new Shortcut(inputs=>[inputs[0]^inputs[1]],'XOR',2,1);
	new Shortcut(inputs=>[inputs[0]==inputs[4]&&inputs[1]==inputs[5]&&inputs[2]==inputs[6]&&inputs[3]==inputs[7]],'EQUALS',8,1);

}


function setup(){

	setupEditor();

	mouse.start(canvas);
	keys.start();

	loop();
}

function loop(){
	setTimeout(loop,1000/30);
	ctx.clearRect(-2,-2,canvas.width+2,canvas.height+2);
	CurrentBoard.draw();
}

setup();
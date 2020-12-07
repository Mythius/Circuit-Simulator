class Vector{
	static distance(x1,y1,x2,y2){
		return Math.sqrt((x2-x1)**2+(y2-y1)**2);
	}
	static getDir(x,y){
		return (Math.atan(y/x)+(x<0?0:Math.PI))*180/Math.PI;
	}
	static rad(deg){
		return deg*Math.PI/180;
	}
	static getPointIn(dir,dist,ox=0,oy=0){
		let x = ox + Math.cos(dir) * dist;
		let y = oy + Math.sin(dir) * dist;
		return new Vector(x,y);
	}
	constructor(x=0,y=0){
		this.x = x;
		this.y = y;
	}
	mult(m){
		return new Vector(this.x*m,this.y*m);
	}
	add(v){
		return new Vector(this.x+v.x,this.y+v.y);
	}
	clone(){
		return new Vector(this.x,this.y);
	}
}

class Wire{
	constructor(node){
		// if(!node instanceof Input) throw new Error('Wrong Node');
		this.points = [node.pos.clone()];
		this.start = node;
		this.end = null;
		this.start.wires.push(this);
		this.toggleDir = true; // X is true, Y is false
		this.closed = false;
		this.value = false;
		this.color = 'black';
	}
	draw(){
		this.calcOutput();
		ctx.beginPath();
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 5;
		if(this.closed){
			ctx.moveTo(this.points[0].x,this.points[0].y);
			for(let i=1;i<this.points.length;i++){
				ctx.lineTo(this.points[i].x,this.points[i].y);
			}
			ctx.stroke();
		} else {
			ctx.moveTo(this.points[0].x,this.points[0].y);
			for(let i=1;i<this.points.length;i++){
				ctx.lineTo(this.points[i].x,this.points[i].y);
			}
			let prev = this.points[this.points.length-1];
			if(this.toggleDir){
				ctx.lineTo(mouse.pos.x,prev.y);
			} else {
				ctx.lineTo(prev.x,mouse.pos.y);
			}
			ctx.stroke();
		}
	}
	updateWire(pos,done=false){
		let prev = this.points[this.points.length-1];
		if(this.toggleDir){
			if(done){
				prev.y = pos.y;
				this.points.push(pos);
			} else {
				this.points.push(new Vector(pos.x,prev.y));
			}
		} else {
			if(done){
				prev.x = pos.x;
				this.points.push(pos);
			} else {
				this.points.push(new Vector(prev.x,pos.y));
			}
		}
		this.toggleDir = !this.toggleDir;
	}
	closeWire(node){
		this.end = node;
		this.updateWire(node.pos,true);
		CurrentBoard.wires.push(this);
		this.end.wires.push(this);
		CurrentBoard.cur_node = null;
		CurrentBoard.cur_wire = null;
		this.closed = true;
	}
	calcOutput(){
		if(this.closed){
			this.value = this.start.value;
			this.end.value = this.value;
			this.color = this.value ? 'red' : 'black';
		}
	}
	get value(){
		return this.data;
	}
	set value(v){
		this.data = v;
	}
	remove(){
		var ix;
		ix = this.start.wires.indexOf(this);
		this.start.wires.splice(ix,1);
		ix = this.end.wires.indexOf(this);
		this.end.wires.splice(ix,1);
		ix = CurrentBoard.wires.indexOf(this);
		CurrentBoard.wires.splice(ix,1);
	}
}

class Input{
	constructor(vector=new Vector){
		this.pos = vector;
		this.length = 50;
		this.radius = 20;
		this.node = new ConnectorNode('OUTPUT',new Vector(this.pos.x+this.length,this.pos.y));
		this.value = false;
		this.mouseOver = false;
	}
	draw(){
		if(mouse.down){
			if((Vector.distance(this.pos.x,this.pos.y,mouse.pos.x,mouse.pos.y) < this.radius)){
				if(!this.mouseOver){
					this.mouseOver = true;
					this.value = !this.value;
				}
			} else {
				this.mouseOver = false;
			}
		} else {
			this.mouseOver = false;
		}
		ctx.beginPath();
		ctx.fillStyle = this.value ? '#f00' : '#888';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 5;
		ctx.moveTo(this.pos.x,this.pos.y);
		ctx.lineTo(this.node.pos.x,this.node.pos.y);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = '#444';
		ctx.arc(this.pos.x,this.pos.y,this.radius,0,Math.PI*2);
		ctx.fill();
		ctx.stroke();
		this.node.value = this.value;
		this.node.draw();
	}
	setPos(vector){
		this.pos = vector;
		this.node.pos = new Vector(this.pos.x+this.length,this.pos.y);
	}
}

class Output{
	constructor(vector=new Vector){
		this.pos = vector;
		this.length = -50;
		this.radius = 20;
		this.node = new ConnectorNode('INPUT',new Vector(this.pos.x+this.length,this.pos.y));
		this.value = false;
		this.mouseOver = false;
	}
	draw(){
		ctx.beginPath();
		ctx.fillStyle = this.value ? '#f00' : '#888';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 5;
		ctx.moveTo(this.pos.x,this.pos.y);
		ctx.lineTo(this.node.pos.x,this.node.pos.y);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = '#444';
		ctx.arc(this.pos.x,this.pos.y,this.radius,0,Math.PI*2);
		ctx.fill();
		ctx.stroke();
		this.node.draw();
		this.value = this.node.value;
	}
	setPos(vector){
		this.pos = vector;
		this.node.pos = new Vector(this.pos.x+this.length,this.pos.y);
	}
}

class ConnectorNode{
	constructor(type='INPUT',vector=new Vector){
		this.pos = vector;
		this.radius = 5;
		this.color = 'black';
		this.data = false;
		this.type = type;
		this.wires = [];
	}
	draw(){
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.pos.x,this.pos.y,this.radius,0,Math.PI*2);
		ctx.fill();
		if(mouse.down){
			if(CurrentBoard.cur_node == this){
				// CurrentBoard.cur_wire.upa
			} else if((Vector.distance(this.pos.x,this.pos.y,mouse.pos.x,mouse.pos.y) < this.radius)){
				if(!this.mouseOver){
					this.mouseOver = true;
					if(this.type == 'OUTPUT'){
						CurrentBoard.cur_node = this;
						CurrentBoard.cur_wire = new Wire(this);
					} else if(CurrentBoard.cur_wire) {
						CurrentBoard.cur_wire.closeWire(this);
					}
				}
			} else {
				this.mouseOver = false;
			}
		} else {
			this.mouseOver = false;
		}
	}
	set value(bool){
		this.data = !!bool;
		this.color = this.data ? 'red' : 'black';
		return this.data;
	}
	get value(){
		return this.data;
	}
}

class Board{
	constructor(name,inputs,outputs){
		this.pos = new Vector(0,0);
		this.width = name.length * 12.5 + 20;
		this.height = Math.max(inputs,outputs) * 20;
		this.color = '#88f';
		this.inputs = [];
		this.outputs = [];
		this.name = name;
		this.offsetMouse = new Vector;
		for(let i=0;i<inputs;i++) this.inputs.push(new ConnectorNode('INPUT'));
		for(let i=0;i<outputs;i++) this.outputs.push(new ConnectorNode('OUTPUT'));
	}
	moveTo(vec){
		this.pos = vec;
		let inamount = this.inputs.length + 1;
		let inseg = (this.height) / inamount;
		let outamount = this.outputs.length + 1;
		let outseg = (this.height) / outamount;
		for(let i=0;i<this.inputs.length;i++){
			this.inputs[i].pos = new Vector(this.pos.x-this.width/2,this.pos.y + (i+1) * inseg);
		}
		for(let i=0;i<this.outputs.length;i++){
			this.outputs[i].pos = new Vector(this.pos.x+this.width/2,this.pos.y + (i+1) * outseg);
		}
	}
	draw(){
		if(mouse.down){
			if(CurrentBoard.cur_chip == this){
				let mp = new Vector(mouse.pos.x,mouse.pos.y);
				this.moveTo(mp.add(this.offsetMouse));
			} else if(!CurrentBoard.cur_chip){
				let mp = new Vector(mouse.pos.x,mouse.pos.y);

				if(mp.x > this.pos.x - this.width/2 && mp.x < this.pos.x + this.width/2){
					if(mp.y > this.pos.y && mp.y < this.pos.y + this.height){
						this.offsetMouse = this.pos.add(mp.mult(-1));
						CurrentBoard.cur_chip = this;
					}
				}

			}
		} else {
			// CurrentBoard.cur_chip = null;
		}
		this.calcOutput();
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.rect(this.pos.x-this.width/2,this.pos.y,this.width,this.height);
		ctx.fill();
		for(let input of this.inputs) input.draw();
		for(let output of this.outputs) output.draw();
		ctx.font = '20px monospace';
		ctx.fillStyle = 'black';
		ctx.fillText(this.name,this.pos.x-this.width/2+10,this.pos.y+this.height/2+7);
	}
	remove(){
		var ix;
		if(CurrentBoard.cur_chip == this){
			CurrentBoard.cur_chip = null;
		}
		ix = CurrentBoard.boards.indexOf(this);
		CurrentBoard.boards.splice(ix,1);
		for(let wire of this.inputs.concat(this.outputs).map(e=>e.wires).flat()){
			wire.remove();
		}
	}
	// calcOutput(){} // Overwrite
}

class BuiltInBoard extends Board{
	constructor(callback,...args){
		super(...args);
		this.callback = callback;
	}
	calcOutput(){
		let inputs = this.inputs.map(e=>e.data);
		let outputs = this.callback(inputs);
		for(let i=0;i<this.outputs.length;i++){
			this.outputs[i].value = !!outputs[i];
		}
	}
}

class CustomBoard extends Board{
	constructor(){

	}
}

class Shortcut{
	constructor(callback,name,inputs,outputs){
		let el = create('button',name);
		this.name = name;
		el.classList.add('comp');
		el.on('click',e=>{
			let board = new BuiltInBoard(callback,name,inputs,outputs);
			if(CurrentBoard.cur_chip){
				CurrentBoard.cur_chip.color = '#88f';
			}
			CurrentBoard.cur_chip = board;
			CurrentBoard.addBoard(board);
			board.moveTo(new Vector(100,100));
		});
		obj('#components').appendChild(el);
	}
}

class ShortcutFolder{

}

(function(global){ // Component List Module
	const ComponentList = {};
	global.ComponentList = ComponentList;

	ComponentList.boards = [];

})(this);


(function(global){ // Current Board Editor Module
	const CurrentBoard = {};
	global.CurrentBoard = CurrentBoard;

	let x = 30;
	let y = 30;

	// const ANDGATE = new BuiltInBoard(inputs=>[inputs[0]&&inputs[1]],'AND',2,1);

	// const NOTGATE = new BuiltInBoard(inputs=>[!inputs[0]],'NOT',1,1);

	CurrentBoard.inputs = [];
	CurrentBoard.outputs = [];
	CurrentBoard.boards = [];
	CurrentBoard.wires = [];

	CurrentBoard.cur_node = null;
	CurrentBoard.cur_wire = null;
	CurrentBoard.cur_chip = null;

	function drawOutline(){
		let width = canvas.width - x*2;
		let height = canvas.height - y*2;
		ctx.beginPath();
		ctx.strokeStyle = '#444';
		ctx.lineWidth = 5;
		ctx.rect(x,y,width,height);
		ctx.stroke();
	}

	CurrentBoard.updateInputs = function(){
		let inputs = CurrentBoard.inputs;
		let amount = inputs.length + 1;
		let segment_length = (canvas.height - y*2) / amount;
		for(let i=0;i<inputs.length;i++){
			let inputnode = inputs[i];
			inputnode.setPos(new Vector(x,y + (i+1) * segment_length));
		}
	}

	CurrentBoard.setInputs = function(amount){
		if(amount > CurrentBoard.inputs.length){
			while(CurrentBoard.inputs.length < amount){
				CurrentBoard.inputs.push(new Input);
			}
		} else {
			while(CurrentBoard.inputs.length > amount){
				CurrentBoard.inputs.pop();
			}
		}
		this.updateInputs();
	}

	CurrentBoard.updateOutputs = function(){
		let outputs = CurrentBoard.outputs;
		let amount = outputs.length + 1;
		let segment_length = (canvas.height - y*2) / amount;
		for(let i=0;i<outputs.length;i++){
			let outputnode = outputs[i];
			outputnode.setPos(new Vector(canvas.width-x,y + (i+1) * segment_length));
		}
	}

	CurrentBoard.setOutputs = function(amount){
		if(amount > CurrentBoard.outputs.length){
			while(CurrentBoard.outputs.length < amount){
				CurrentBoard.outputs.push(new Output);
			}
		} else {
			while(CurrentBoard.outputs.length > amount){
				CurrentBoard.outputs.pop();
			}
		}
		this.updateOutputs();
	}

	CurrentBoard.addBoard = function(board){
		this.boards.push(board);
	}

	CurrentBoard.draw = function(){
		var col;
		if(this.cur_chip){
			col = this.cur_chip.color;
			this.cur_chip.color = 'yellow';
		}
		if(!mouse.down){
			this.cur_wire = null;
			this.cur_node = null;
		}
		if(mouse.right && this.cur_wire){
			this.cur_wire.updateWire(mouse.pos);
			mouse.right = false;
		} else if(mouse.right && this.cur_chip){
			this.cur_chip.color = '#88f';
			this.cur_chip = null;
		}
		drawOutline();
		for(let input of this.inputs) input.draw();
		for(let output of this.outputs) output.draw();
		for(let board of this.boards) board.draw();
		for(let wire of this.wires) wire.draw();
		if(this.cur_wire) this.cur_wire.draw();
	}

	CurrentBoard.clear = function(){
		// this.inputs = [];
		// this.outputs = [];
		this.boards = [];
		this.wires = [];

		this.cur_node = null;
		this.cur_wire = null;
		this.cur_chip = null;
	}
})(this);
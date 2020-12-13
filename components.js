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
				if(this.points.length == 1){

				} else {
					prev.y = pos.y;
				}
				this.points.push(pos);
			} else {
				this.points.push(new Vector(pos.x,prev.y));
			}
		} else {
			if(done){
				if(this.points.length == 1){
					
				} else {
					prev.x = pos.x;
				}
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
		for(let wire of this.end.wires){
			wire.remove();
		}
		CurrentBoard.wires.push(this);
		this.end.wires = [this];
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
		if(ix == -1) console.error('Wire Not Found');
		this.start.wires.splice(ix,1);
		ix = this.end.wires.indexOf(this);
		if(ix == -1) console.error('Wire Not Found');
		this.end.wires.splice(ix,1);
		ix = CurrentBoard.wires.indexOf(this);
		if(ix == -1) console.error('Wire Not Found');
		CurrentBoard.wires.splice(ix,1);
	}
	straiten(){
		if(this.closed){
			let first = this.start.pos.clone();
			let last = this.end.pos.clone();
			this.points = [first,last];
		}
	}
}

class Input{
	constructor(ix,vector=new Vector){
		this.pos = vector;
		this.length = 50;
		this.radius = 20;
		this.index = ix;
		this.node = new ConnectorNode('OUTPUT',this,ix,new Vector(this.pos.x+this.length,this.pos.y));
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
	reset(){
		this.value = false;
		this.node.wires = [];
	}
}

class Output{
	constructor(ix,vector=new Vector){
		this.pos = vector;
		this.length = -50;
		this.radius = 20;
		this.index = ix;
		this.node = new ConnectorNode('INPUT',this,ix,new Vector(this.pos.x+this.length,this.pos.y));
		this.node.source = this;
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
	reset(){
		this.node.value = false;
		this.node.wires = [];
	}
}

class ConnectorNode{
	constructor(type='INPUT',source=null,index=0,vector=new Vector){
		this.pos = vector;
		this.radius = 5;
		this.color = 'black';
		this.data = false;
		this.type = type;
		this.wires = [];
		this.index = index;
		this.source = source;
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
						obj('#moveComponents').checked = true;
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
		for(let i=0;i<inputs;i++) this.inputs.push(new ConnectorNode('INPUT',this,i));
		for(let i=0;i<outputs;i++) this.outputs.push(new ConnectorNode('OUTPUT',this,i));
	}
	moveTo(vec){
		this.pos = vec;
		let inamount = this.inputs.length + 1;
		let inseg = (this.height) / inamount;
		let outamount = this.outputs.length + 1;
		let outseg = (this.height) / outamount;
		for(let i=0;i<this.inputs.length;i++){
			this.inputs[i].pos = new Vector(this.pos.x-this.width/2,this.pos.y + (i+1) * inseg);
			let wires = this.inputs[i].wires;
			for(let wire of wires) wire.straiten();
		}
		for(let i=0;i<this.outputs.length;i++){
			this.outputs[i].pos = new Vector(this.pos.x+this.width/2,this.pos.y + (i+1) * outseg);
			let wires = this.outputs[i].wires;
			for(let wire of wires) wire.straiten();
		}
	}
	draw(calcOutput=true){
		if(mouse.down && CurrentBoard.moveChips){
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
		} else if(!CurrentBoard.moveChips && CurrentBoard.cur_chip == this){
			CurrentBoard.cur_chip.color = '#88f';
			CurrentBoard.cur_chip = null;
		}
		if(calcOutput) this.calcOutput();
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
	// calcOutput(){} // Overwrite // Visual Board on Screen
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
	constructor(json){
		let pb = new PackagedBoard(json);
		super(pb.name,pb.input_number,pb.output_number);
		this.pb = pb;
	}
	calcOutput(){
		this.pb.inputs = this.inputs.map(e=>e.data);
		let v = this.pb.calcOutput();
		for(let i=0;i<v.length;i++){
			this.outputs[i].value = v[i];
		}
	}
}

class VirtualBoard{
	constructor(name,callback){
		this.name = name;
		this.callback = callback;
		this.inputs = [];
		this.outputs = [];
	}
	calcOutput(){
		this.outputs = this.callback(this.inputs);
		return this.outputs;
	}
}

class PackagedBoard{
	static createAND(){
		return new VirtualBoard('AND',inputs=>[inputs[0]&&inputs[1]]);
	}
	static createNOT(){
		return new VirtualBoard('NOT',inputs=>[!inputs[0]]);
	}
	static createOR(){
		return new VirtualBoard('OR',inputs=>[inputs[0]||inputs[1]]);
	}
	static customBoards = {};
	static builtInBoards = ['AND','OR','NOT'];
	constructor(json){
		// {
		// 		name: 'string',
		// 		input_count: number,
		// 		output_count: number,
		// 		boards: [
		// 				'AND',
		// 				'NOT',
		// 				...
		// 		],
		// 		connections: 
		// 		[
		// 				{from: inputs[0], to: 'board_index#input_number'},
		// 				{from: board_index#output_number, to: 'board_index#input_number'},
		// 				{from: board_index#output_number, to: inputs[0]},
		//  			...
		// 		]
		// }
		let obj = JSON.parse(json);
		this.name = obj.name;
		this.input_number = obj.input_count;
		this.output_number = obj.output_count;
		this.boards = [];
		this.connections = obj.connections;
		this.inputs = [];
		this.outputs = [];
		let ix = 0;
		for(let board of obj.boards){
			if(PackagedBoard.builtInBoards.includes(board)){
				let bd = PackagedBoard[`create${board.toUpperCase()}`]();
				bd.id = ix;
				this.boards.push(bd);
			} else if(board in PackagedBoard.customBoards){
				let bd = new PackagedBoard(PackagedBoard.customBoards[board]);
				bd.id = ix;
				this.boards.push(bd);
			}
			ix++;
		}
	}
	calcOutput(){
		for(let con of this.connections){
			let v = this.getValue(con);
			this.setValue(v,con);
		}
		return this.outputs;
	}
	getValue(con){
		let from = con.from;
		if(typeof from == 'number'){
			return this.inputs[from];
		} else {
			let board_index = Number(con.from.split('#')[0]);
			let output_number = Number(con.from.split('#')[1]);
			let board = this.boards[board_index];
			return board.calcOutput()[output_number];
		}
	}
	setValue(value,con){
		let to = con.to;
		if(typeof to == 'number'){
			this.outputs[to] = value;
		} else {
			let board_index = Number(con.to.split('#')[0]);
			let input_number = Number(con.to.split('#')[1]);
			let board = this.boards[board_index];
			board.inputs[input_number] = value;
		}
	}
}

class Shortcut{
	static CustomPieces = [];
	constructor(callback,name,inputs,outputs){
		let el = create('button',name);
		let x = create('img');
		x.src = 'xbutton.svg';
		this.name = name;
		el.classList.add('comp');
		x.style.float = 'right';
		x.style.width = '15px';
		el.on('click',e=>{
			if(e.target == el){
				let board;
				obj('#moveComponents').checked = false;
				if(typeof callback == 'string'){
					board = new CustomBoard(callback);
				} else if(typeof callback == 'function'){
					board = new BuiltInBoard(callback,name,inputs,outputs);
				}
				if(CurrentBoard.cur_chip){
					CurrentBoard.cur_chip.color = '#88f';
				}
				CurrentBoard.cur_chip = board;
				CurrentBoard.addBoard(board);
				board.moveTo(new Vector(100,100));
			} else if(e.target == x){
				let del = confirm(`Delete Component ${name}?`);
				if(del){
					PackagedBoard.customBoards[name] = undefined;
					for (var i = Shortcut.CustomPieces.length - 1; i >= 0; i--) {
						if(Shortcut.CustomPieces[i].name == name) Shortcut.CustomPieces.splice(i,1);
					}
					el.remove();
				}
			}
		});
		obj('#components').appendChild(el);
		if(typeof callback == 'string'){
			Shortcut.CustomPieces.push({name,data:callback});
			PackagedBoard.customBoards[name] = callback;
			el.appendChild(x);
		}
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

	CurrentBoard.moveChips = true;

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
				CurrentBoard.inputs.push(new Input(CurrentBoard.inputs.length));
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
				CurrentBoard.outputs.push(new Output(CurrentBoard.outputs.length));
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

	CurrentBoard.draw = function(calcOutput=true){
		this.moveChips = !obj('#moveComponents').checked;
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
		for(let input of this.inputs) input.draw(calcOutput);
		for(let output of this.outputs) output.draw(calcOutput);
		for(let board of this.boards) board.draw(calcOutput);
		for(let wire of this.wires) wire.draw(calcOutput);
		if(this.cur_wire) this.cur_wire.draw(calcOutput);
	}

	CurrentBoard.clear = function(){
		// this.inputs = [];
		// this.outputs = [];
		this.boards = [];
		this.wires = [];

		for(let input of this.inputs) input.reset();
		for(let output of this.outputs) output.reset();

		this.cur_node = null;
		this.cur_wire = null;
		this.cur_chip = null;
	}

	CurrentBoard.toJSON = function(name){
		let output = {};
		output.name = name;
		output.input_count = this.inputs.length;
		output.output_count = this.outputs.length;
		output.boards = this.boards.map(e=>e.name);
		output.connections = [];
		for(let wire of this.wires){
			let val = {from:'',to:''};

			let from_node = wire.start;
			if(from_node.source instanceof Input){
				val.from = this.inputs.indexOf(from_node.source);
			} else if(from_node.source instanceof Output){
				val.from = this.outputs.indexOf(from_node.source);
			} else if(from_node.source instanceof Board){
				val.from = this.boards.indexOf(from_node.source) + '#' + from_node.index;
			}


			let to_node = wire.end;
			if(to_node.source instanceof Input){
				val.to = this.inputs.indexOf(to_node.source);
			} else if(to_node.source instanceof Output){
				val.to = this.outputs.indexOf(to_node.source);
			} else if(to_node.source instanceof Board){
				val.to = this.boards.indexOf(to_node.source) + '#' + to_node.index;
			}

			output.connections.push(val);

		}
		return JSON.stringify(output);
	}
})(this);
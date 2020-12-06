// ctx must be defined.
// Vector Must be defined {x:Number,y:Number}
(function(glob){
	var Gamepad = {};
	glob.Gamepad = Gamepad;

	Gamepad.color1 = 'red';
	Gamepad.color2 = 'white';
	Gamepad.lineWidth = 5;

	Gamepad.button = {};
	Gamepad.joystick = {};

	Gamepad.button.circle = new Path2D;
	Gamepad.button.square = new Path2D;
	Gamepad.button.arrow = new Path2D;
	Gamepad.button.pentagon = new Path2D;
	Gamepad.joystick.socket = new Path2D;
	Gamepad.joystick.stick = new Path2D;

	Gamepad.Joystick = class Joystick{
		constructor(pos=new Vector,add=true){
			this.offsetX = 0;
			this.offsetY = 0;
			this.position = pos;
			this.socket = Gamepad.joystick.socket;
			this.stick = Gamepad.joystick.stick;
			if(add) Gamepad.elements.push(this);
		}
		draw(vis=true){
			this.offsetX = 0;
			this.offsetY = 0;
			ctx.beginPath();
			ctx.lineWidth = 10;
			ctx.strokeStyle = Gamepad.color1;
			ctx.fillStyle = Gamepad.color2;
			ctx.save();
			ctx.translate(this.position.x,this.position.y);
			var active = false;
			const THIS = this;
			Touch.checkPos(touches=>{
				active |= ctx.isPointInPath(THIS.socket,touches.start.x,touches.start.y);
				if(active){
					let tx = touches.pos.x - this.position.x;
					let ty = touches.pos.y - this.position.y;
					let dist = Math.min(Vector.distance(0,0,tx,ty),100);
					let dir = Vector.getDir(tx,ty) + 180;
					let np = Vector.getPointIn(dir*Math.PI/180,dist);
					THIS.offsetX = np.x;
					THIS.offsetY = np.y;
				}
			});
			if(vis) ctx.fill(this.socket);
			if(vis) ctx.stroke(this.socket);
			// ctx.restore();
			// ctx.save();
			ctx.translate(this.offsetX,this.offsetY);
			if(active) ctx.fillStyle = Gamepad.color1;
			if(vis) ctx.fill(this.stick);
			if(vis) ctx.stroke(this.stick);
			ctx.restore();
		}
	}

	Gamepad.Button = class Button{
		constructor(pos=new Vector,add=true){
			this.down = false;
			this.position = pos;
			this.path = new Path2D;
			if(add) Gamepad.elements.push(this);
		}
		draw(translate=true,vis=true){
			if(translate) ctx.save();
			ctx.strokeStyle = Gamepad.color1;
			ctx.fillStyle = Gamepad.color2;
			ctx.lineWidth = Gamepad.lineWidth;
			if(translate) ctx.translate(this.position.x,this.position.y);
			this.down = false;
			Touch.checkPos(touches=>{
				this.down |= ctx.isPointInPath(this.path,touches.pos.x,touches.pos.y);
			});
			if(this.down) ctx.fillStyle = Gamepad.color1;
			if(vis) ctx.fill(this.path);
			if(vis) ctx.stroke(this.path);
			if(translate) ctx.restore();
		}
	}

	Gamepad.dPad = class dPad{
		constructor(pos = new Vector,add=true){
			this.position = pos;
			this.up = new Gamepad.Button(pos,false);
			this.up.path = Gamepad.button.pentagon;
			this.down = new Gamepad.Button(pos,false);
			this.down.path = Gamepad.button.pentagon;
			this.left = new Gamepad.Button(pos,false);
			this.left.path = Gamepad.button.pentagon;
			this.right = new Gamepad.Button(pos,false);
			this.right.path = Gamepad.button.pentagon;
			if(add) Gamepad.elements.push(this);
		}
		draw(vis=true){
			let btns = [this.up,this.right,this.down,this.left];
			ctx.beginPath();
			ctx.save();
			ctx.translate(this.position.x,this.position.y);
			for(let btn of btns){
				btn.draw(false,vis);
				ctx.rotate(Math.PI/2);
			}
			ctx.restore();
		}
	}

	Gamepad.draw = function(){
		if(!Gamepad.show) return;
		for(let elements of Gamepad.elements){
			elements.draw();
		}
	}

	Gamepad.show = true;

	Gamepad.elements = [];

	// Touchscreen Events


	// Define Looks

	Gamepad.button.circle.arc(0,0,50,0,Math.PI*2);
	// Gamepad.button.square.rect(-40,-40,80,80);

	Gamepad.joystick.socket.arc(0,0,100,0,Math.PI*2);
	Gamepad.joystick.stick.arc(0,0,30,0,Math.PI*2);

	Gamepad.button.pentagon.moveTo(0,0);
	Gamepad.button.pentagon.lineTo(-75,-75);
	Gamepad.button.pentagon.lineTo(-75,-150);
	Gamepad.button.pentagon.lineTo(75,-150);
	Gamepad.button.pentagon.lineTo(75,-75);
	Gamepad.button.pentagon.closePath();


})(this);
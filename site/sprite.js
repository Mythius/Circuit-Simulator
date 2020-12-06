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
	add(x,y){
		return new Vector(this.x+x,this.y+y);
	}
	clone(){
		return new Vector(this.x,this.y);
	}
}
function Line(px1=0,py1=0,px2=1,py2=1){
	var x1 = px1;
	var y1 = py1;
	var x2 = px2;
	var y2 = py2;
	function setPos(px1,py1,px2,py2){
		x1 = px1;
		y1 = py1;
		x2 = px2;
		y2 = py2;
	}
	function getPosA(){return new Vector(x1,y1)}
	function getPosB(){return new Vector(x2,y2)}
	function touches(line){
		let posA = line.getPosA();
		let posB = line.getPosB();
		const x3 = posA.x;
		const y3 = posA.y;
		const x4 = posB.x;
		const y4 = posB.y;
		const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if(den == 0){
			return;
		}
		const t =  ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
		const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
		if(t >= 0 && t <= 1 && u >= 0 && u <= 1){
			const pt = new Vector();
			pt.x = x1 + t * (x2-x1);
			pt.y = y1 + t * (y2-y1);
			return pt;
		}
		else return;
	}
	function draw(color='white'){
		ctx.beginPath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = color;
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
	}	
	this.getPosA = getPosA;
	this.getPosB = getPosB;
	this.touches = touches;
	this.draw = draw;
	this.setPos = setPos;
}
class Animation{
	static xml(path,fn){
	    var x=new XMLHttpRequest();
	    x.onreadystatechange=function(){
	        if(this.readyState==4&&this.status==200) fn(this.responseText);
	    }
	    x.open("GET",path,true);
	    x.send();
	}
	#animID=0;
	#frLists=[];
	#dir="";
	#prom;
	constructor(element,data){
		var file = JSON.parse(data);
		this.file = file;
		this.frames = [];
		this.element = element;
		this.current_frame = 0;
		this.#animID=0;
		this.#frLists = file.frames.map(e=>e.frames);
		this.names = file.frames.map(e=>e.name);
		this.fps = 30;
		this.frame_count = file.count;
		this.#dir = file.dirname;
		this.isLoop = false;
		this.playing = false;
		this.name = "";
		this.last_time = new Date().getTime();
		this.next_frame = null;
		this.end = () => {};
		for(let i=0;i<this.frame_count;i++){
			this.frames.push(createImage(this.pad(i)));
		}
		this.element.src = this.frames[0].src;
		this.next_frame = this.frames[0];

		function createImage(path){
			let i = document.createElement('img');
			i.src = path;
			return i;
		}
	}
	pad(n){
		let len = (this.frame_count+'').length;
		return this.#dir+'/'+('0'.repeat(len)+n).slice(-len)+'.png';
	}
	loop(){
		if(!this.playing) return;
		let t = new Date().getTime();
		let diff = t-this.last_time;
		if(diff > 1000/this.fps){
			if(this.current_frame<this.#frLists[this.#animID].length){
				let id = this.#animID;
				this.element.src = this.next_frame.src;
				this.next_frame = this.frames[this.#frLists[id][this.current_frame]];
				this.current_frame++;
			} else {
				if(this.isLoop){
					this.current_frame=0;
					this.loop();
				} else {
					this.playing = false;
					this.stop();
				}
			}
			this.last_time = t;
		}
	}
	play(name,is_loop=false){
		if(this.name == name) return new Promise(r=>r(0));
		if(this.playing){
			this.stop();
		}
		const THIS = this;
		if(this.playing && this.name == name) return new Promise(r=>r(0));
		this.isLoop = is_loop;
		this.playing = true;
		this.current_frame = 1;
		var index = this.names.indexOf(name);
		if(index!=-1){
			this.fps = this.file.frames[index].fps;
			this.#animID = index;
			this.name = name;
			this.current_frame = 1;
			this.next_frame = this.frames[this.#frLists[index][Math.min(0,this.#frLists[index].length)]];
			this.last_time = new Date().getTime();
			this.#prom = new Promise(resolve=>{
				THIS.end=c=>{
					resolve(c);
				}
			});
			return this.#prom;
		} else {
			console.warn('Not a valid Animation: '+name);
			return new Promise(r=>r(0));
		}
	}
	stop(){
		let arr = this.#frLists[this.#animID];
		if(arr){
			this.element.src = this.frames[arr[arr.length-1]].src;
		}
		this.playing = false;
		this.isLoop = false;
		this.name = "";
		this.end(1);
	}
}
class Hitbox{
	static show = false;
	constructor(pos,w,h){
		this.pos = pos;
		this.w = w;
		this.h = h;
		this.lines = [new Line,new Line,new Line,new Line];
		this.angles = [];
		this.scale = new Vector(1,1);
		this.offset = new Vector;
		this.dir = 0;
		this.update();
	}
	update(){
		let scaleX = this.scale.x;
		let scaleY = this.scale.y;
		let w2 = (this.w*scaleX)/2;
		let h2 = (this.h*scaleY)/2;
		let px = this.pos.x;
		let py = this.pos.y;
		this.angles[0] = Vector.getDir(-w2,-h2);
		this.angles[1] = Vector.getDir(w2,-h2);
		this.angles[2] = Vector.getDir(w2,h2);
		this.angles[3] = Vector.getDir(-w2,h2);
		let points = [];
		let dist = Vector.distance(px,py,px-w2,py-h2);
		let offsetX = this.offset.x;
		let offsetY = this.offset.y;
		for(let i=0;i<4;i++){
			let ln = this.lines[i];
			let an = this.angles[i];
			let pt = Vector.getPointIn(Vector.rad(this.dir+an),dist,px+offsetX,py+offsetY);
			points.push(pt);
		}
		for(let i=4;i<8;i++){
			let pt1 = points[i%4];
			let pt2 = points[(i-1)%4];
			this.lines[i%4].setPos(pt1.x,pt1.y,pt2.x,pt2.y);
		}
	}
	DRAW(color='white'){
		ctx.fillStyle = color;
		ctx.fillRect(this.pos.x-1,this.pos.y-1,3,3);
		ctx.beginPath();
		ctx.lineWidth = 3;
		for(let line of this.lines){
			line.draw(color);
		}
		ctx.stroke();
	}
	touches(hitbox){
		if(hitbox instanceof Hitbox){
			let lines = this.lines;
			let other = hitbox.lines;
			for(let l1 of lines){
				for(let l2 of other){
					if(l1.touches(l2)){
						return true;
					}
				}
			}
		}
		return false;
	}
	set direction(d){
		this.dir = d;
		this.update();
		return d;
	}
	set position(v){
		this.pos.x = v.x;
		this.pos.y = v.y;
		this.update();
		return v;
	}
	set width(w){
		this.w = w;
		this.update();
		return w;
	}
	set height(h){
		this.h = h;
		this.update();
		return h;
	}
	set setScale(v){
		this.scale.x = v.x;
		this.scale.y = v.y;
		this.update();
		return v;
	}
	set setOffset(v){
		this.offset.x = v.x;
		this.offset.y = v.y;
		this.update();
		return v;
	}
}
class Sprite extends Hitbox{
	#iter = 0;
	#max_iter = 0;
	#slide_x = 0;
	#slide_y = 0;
	#end_slide;
	constructor(image_path){
		var once = false;
		super(new Vector(-100,-100),1,1);
		const THIS = this;
		this.element = document.createElement('img');
		this.element.src = image_path;
		this.animation;
		this.transformX = 1;
		this.sliding = false;
		this.visible = true;
		this.element.onload = function(){
			if(once) return;
			once = true;
			THIS.width = THIS.element.width;
			THIS.height = THIS.element.height;
		}
		this.move = data => {};
	}
	draw(){
		if(!this.visible) return;
		if(this.animation) this.animation.loop();
		if(this.sliding) {
			if(this.#iter <= this.#max_iter){
				let p = this.pos;
				this.position = new Vector(p.x+this.#slide_x,p.y+this.#slide_y);
			} else {
				this.sliding = false;
				if(typeof this.#end_slide == 'function'){
					this.#end_slide();
				}
			}
			this.#iter++;
		} else {
			this.move(this.pos.clone());
		}
		if(this.attack && typeof this.attack == 'function'){
			this.attack();
		}
		let pos = this.pos;
		let drawPos = this.lines[2].getPosA();
		ctx.save();
		ctx.translate(pos.x,pos.y);
		ctx.rotate(Vector.rad(this.dir));
		ctx.scale(this.transformX,1);
		ctx.drawImage(this.element,-this.w/2,-this.h/2);
		ctx.restore();
		if(Hitbox.show) this.DRAW();
	}
	addAnimation(animation_path){
		return new Promise(resolve=>{
			Animation.xml(animation_path,data=>{
				this.animation = new Animation(this.element,data);
				resolve();
			});
		});
	}
	addMovement(callback){
		this.move = callback;
	}
	attack(callback){
		this.attack = callback;
	}
	slideTo(x,y,segs=8){
		return new Promise(resolve=>{
			this.sliding = true;
			let pos = this.pos;
			this.#max_iter = segs;
			this.#iter = 1;
			this.#slide_x = (x-pos.x)/segs;
			this.#slide_y = (y-pos.y)/segs;
			this.#end_slide = function(){
				resolve();
			}
		});
	}
	distanceTo(sprite){
		if(sprite instanceof Sprite){
			let d = distance(this.pos.x,this.pos.y,sprite.pos.x,sprite.pos.y);
			return d;
		}
	}
}
class TileSprite extends Hitbox{
	constructor(tile){
		super(tile.getCenter(),tile.grid.scale,tile.grid.scale);
		const THIS = this;
		this.tile = tile;
		this.animation = null;
		this.transformX = 1;
		tile.img = new Image();
		tile.img.src = "";
		this.angle = 0;
		tile.drawImg = function(){
			let c = tile.getCenter();
			let s = tile.grid.scale;
			ctx.beginPath();
			ctx.save();
			ctx.translate(c.x,c.y);
			ctx.rotate(THIS.angle * Math.PI / 180);
			ctx.scale(THIS.transformX,1);
			ctx.drawImage(this.img,-s/2,-s/2,s,s);
			ctx.restore();

			if(THIS.animation){
				THIS.animation.loop();
			}
		}
		tile.sprite = this;
	}
	addAnimation(path){
		return new Promise(resolve=>{
			Animation.xml(path,text=>{
				this.animation = new Animation(this.tile.img,text);
				resolve(this.animation);
			});
		});
	}
}
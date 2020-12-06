class Button{
	constructor(x,y,w,h,callback,img){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.img = img;
		this.click = callback;
		this.visible = true;
	}
	draw(color='transparent'){
		if(!this.visible) return;
		ctx.beginPath();
		ctx.save();
		ctx.lineWidth = 2;
		ctx.strokeStyle = color;
		ctx.translate(this.x,this.y);
		ctx.rect(-this.w/2,-this.h/2,this.w,this.h);
		if(this.img) ctx.drawImage(this.img,0,0,this.img.width,this.img.height,-this.w/2,-this.h/2,this.w,this.h);
		ctx.stroke();
		ctx.restore();
		if(mouse.down&&mouse.pos.x>this.x-this.w/2&&mouse.pos.x<this.x+this.w/2&&mouse.pos.y>this.y-this.h/2&&mouse.pos.y<this.y+this.h/2){
			this.click();
		}
	}
	hide(){
		this.visible = false;
	}
	show(){
		this.visible = true;
	}
}

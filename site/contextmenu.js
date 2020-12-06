function contextmenu(element,callback,...items){
	var ctx = create('ctx');
	var event;
	hide(ctx);
	for(var i of items){
		var ite;
		if (typeof i == 'string'){
			ite = create('item');
			ite.innerHTML = i;
		} else {
			ite = create('item');
			ite.appendChild(i);
		}
		ctx.appendChild(ite);
		ite.on('click',(e)=>{
			callback(e.srcElement.innerText,event);
			hide(ctx);
		});
	}
	game.appendChild(ctx);
	element.on('contextmenu',function(e){
		e.preventDefault();
		ctx.style.left = e.clientX + 'px';
		ctx.style.top = e.clientY + 'px';
		show(ctx);
		event = e;
	});
	document.on('mousedown',function(e){
		if(e.path.indexOf(ctx) == -1){
			hide(ctx);
		}
	});
}
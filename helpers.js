const obj=id=>document.querySelector(id);
Node.prototype.on=function(a,b,c){this.addEventListener(a,b,c)};
const random=(min,max)=>Math.floor(min+Math.random()*(max-min+1));
const rColor=()=>'rgb('+random(0,255)+','+random(0,255)+','+random(0,255)+')';
function show(o){o.style.visibility='inherit';}
function hide(o){o.style.visibility='hidden';}
function create(el,text=''){
    let e = document.createElement(el);
    e.innerHTML = text;
    return e;
}
function map(v,n1,n2,m1,m2){
    return (v-n1)/(n2-n1)*(m2-m1)+m1;
}
// const distance=(x,y,x1,y1)=>Math.round(Math.sqrt((x-x1)**2+(y-y1)**2));
function range(min,max){
    let a=[],i;
    for(i=min;i<max;i++)a.push(i);
    return a;
} 
function download(filename,text){
    var e=create('a');
    e.href='data:text/plain;charset=utf-8,'+encodeURIComponent(text);
    e.download=filename;
    e.style.display='none';
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
}
function upload(inputObject,cal) {
    inputObject.on('change',function(e){
        for(let f of e.target.files){
            if(f){
                var r=new FileReader();
                r.readAsText(f);
                r.onload=function(e){cal(e.target.result,f.name)}
            }
        }
    });
}
function xml(f,fn){
    var x=new XMLHttpRequest();
    x.onreadystatechange=function(){
        if(this.readyState==4&&this.status==200)fn(this.responseText);
    }
    x.open("GET",f,true);
    x.send();
}
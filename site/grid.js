class Tile{
    constructor(x,y,grid) {
        this.x = x;
        this.y = y;
        this.color = '#222';
        this.grid = grid;
    }
    draw_box(color=this.color) {
        let scale = this.grid.scale;
        let offsetX = this.grid.offsetX;
        let offsetY = this.grid.offsetY;
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.fillStyle =  color;
        ctx.rect(offsetX+this.x*scale,offsetY+this.y*scale,scale,scale);
        ctx.fill();
        ctx.stroke();
    }
    hasPoint(x,y) {
        let scale = this.grid.scale;
        let offsetX = this.grid.offsetX;
        let offsetY = this.grid.offsetY;
        return x >= this.x * scale + offsetX &&
            x < this.x * scale + offsetX + scale &&
            y >= this.y * scale + offsetY &&
            y < this.y * scale + offsetY + scale;
    }
    getCenter(){
        let scale = this.grid.scale;
        let offsetX = this.grid.offsetX;
        let offsetY = this.grid.offsetY;
        let x = offsetX + this.x * scale + scale / 2;
        let y = offsetY + this.y * scale + scale / 2;
        return {x,y};
    }
}
class Grid{
    constructor(w,h,scale=40) {
        this.tiles = [];
        this.width = w;
        this.height = h;
        this.scale = scale;
        this.offsetX = 0;
        this.offsetY = 0;
        for (let x = 0; x < w; x++) {
            let row = [];
            for (let y = 0; y < h; y++) {
                row.push(new Tile(x,y,this));
            }
            this.tiles.push(row);
        }
    }
    inBounds(x,y){
        return x>=0&&x<this.width&&y>=0&&y<this.height;
    }
    getTileAt(x,y){
        if(this.inBounds(x,y)){
            return this.tiles[x][y];
        }
    }
    forEach(callback) {
        for (let row of this.tiles) {
            for (let tile of row) {
                let stop = callback(tile);
                if (stop) return;
            }
        }
    }
    draw_boxes() {
        this.forEach(tile => {
            tile.draw_box();
        });
    }
    getActiveTile(x,y) {
        let result;
        this.forEach(tile => {
            if (tile.hasPoint(x?x:mouse.pos.x,y?y:mouse.pos.y)) {
                result = tile;
                return true;
            }
        });
        return result;
    }
}
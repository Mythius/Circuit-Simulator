class Save{
	static db = openDatabase('save_data',1,'save_data',10*1024);
	static init(){
		Save.sql('CREATE TABLE save_data (name VARCHAR(25), data VARCHAR(255))');
	}
	static async save(name,data){
		var a = await Save.sql(`SELECT COUNT(*) AS amount FROM save_data AS sd WHERE sd.name == "${name}"`);
		if(a?.rows[0]?.amount === 0){
			Save.sql(`INSERT INTO save_data (name,data) VALUES ("${name}","${data}")`);
		} else {
			Save.sql(`UPDATE save_data SET data="${data}" WHERE name="${name}"`);
		}
	}
	static async read(name){
		let result = await Save.sql(`SELECT data FROM save_data WHERE name == "${name}"`);
		return result?.rows[0]?.data;
	}
	static drop(){
		Save.sql('DROP TABLE save_data');
	}
	static async getAll(){
		let a = await Save.sql('SELECT * FROM save_data');
		return a?.rows;
	}
	static sql(q){
		return new Promise(resolve=>{
			Save.db.transaction(e=>{
				e.executeSql(q,undefined,(t,r)=>{
					resolve(r);
				},f=>{
					resolve();
				});
			});
		});
	}
}
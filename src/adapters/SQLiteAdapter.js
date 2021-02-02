import initSqlJs from 'sql.js'
export default class SQLiteAdapter {
    constructor() {
        this.db = false
        const that = this
        initSqlJs({locateFile: (f) => '/'+f}).then((SQL)=>{
            const db = new SQL.Database();
            that.db = db
            db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
            db.run("CREATE TABLE messages (id INTEGER PRIMARY KEY, uid INTEGER, cid INTEGER, txt TEXT, att TEXT, date INTEGER, FOREIGN KEY (uid) REFERENCES users(id))")
        })
    }
    addUser(uObj) {
        this.db.run(`INSERT INTO users (id, name) VALUES (${uObj[0]}, '${this.q(uObj[1])}')`)
    }
    addMessage(mObj) {
        let query = `INSERT INTO messages (id, uid, cid, txt, att, date)
        VALUES (${mObj.id}, ${mObj.from}, ${mObj.cid}, '${this.q(mObj.txt)}', '${mObj.att.length > 0 ? (this.q(JSON.stringify(mObj.att))) : ""}', ${mObj.date})`
        this.db.run(query)
    }
    q(txt) {
        return txt.replace(/'/g, '"')
    }
}
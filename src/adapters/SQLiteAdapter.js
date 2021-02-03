import initSqlJs from 'sql.js'
import FilterMixin from '../mixins/Filter'
export default class SQLiteAdapter {
    constructor(create=true, dbfile=false) {
        this.db = false
        this.dbReady = new Promise((resolve, reject) => {
            initSqlJs({locateFile: (f) => '/' + f}).then((SQL) => {
                if (create) {
                    const db = new SQL.Database();
                    this.db = db
                    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
                    db.run("CREATE TABLE chats (id INTEGER PRIMARY KEY, name TEXT)")
                    db.run("CREATE TABLE messages (id INTEGER PRIMARY KEY, uid INTEGER, cid INTEGER, txt TEXT, att TEXT, date INTEGER, FOREIGN KEY (uid) REFERENCES users(id))")
                } else {
                    this.db = new SQL.Database(dbfile)
                }
                this.db ? resolve() : reject(0)
            })
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
    addChat(id, name) {
        this.db.run(`INSERT INTO chats (id, name) VALUES (${id}, '${this.q(name)}')`)
    }
    normalize(data) {
        let output = []
        for (let row of data.values) {
            let o = {}
            for (let col in data.columns) {
                o[data.columns[col]] = row[col]
            }
            output.push(o)
        }
        return output
    }
    async getChats() {
        return new Promise((resolve, reject) => {
            let data = this.db.exec(`SELECT * FROM chats`)[0]
            if (data) {
                resolve(this.normalize(data))
            } else {
                reject(0)
            }
        })
    }
    async getUsers() {
        return new Promise((resolve, reject) => {
            let data = this.db.exec(`SELECT * FROM users`)[0]
            if (data) {
                resolve(this.normalize(data))
            } else {
                reject(0)
            }
        })
    }
    async getMessages(req) {
        return new Promise((resolve, reject) => {
            let fil = FilterMixin.SQLFilterFormer(req)
            let data = this.db.exec(`SELECT * FROM messages WHERE ${fil}`)[0]
            if (data) {
                resolve(this.normalize(data).map(x=>{x.att = x.att?JSON.parse(x.att):x.att;return x}))
            } else {
                reject(0)
            }
        })
    }
    q(txt) {
        return txt.replace(/'/g, '"')
    }
}

import FilterMixin from '../mixins/Filter'
export default class WebSQLAdapter {
    constructor(create=true) {
        let db = openDatabase('vkdb', '1.0', 'Database with messages exported from VK', 2 * 1024 * 1024, (db) => {
            if (db.version != '1.0') {
                alert('Обнаружен баг Chrome, в котором версия базы WebSQL не совпадает с созданной. Это проблема устаняется обновлением страницы.')
                window.location.reload()
            }
        })
        if (create) {
            db.transaction(tx => {
                tx.executeSql("DROP TABLE IF EXISTS users",[])
                tx.executeSql("DROP TABLE IF EXISTS messages",[])
                tx.executeSql("DROP TABLE IF EXISTS chats",[])
                tx.executeSql("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
                tx.executeSql("CREATE TABLE chats (id INTEGER PRIMARY KEY, name TEXT)")
                tx.executeSql("CREATE TABLE messages (id INTEGER PRIMARY KEY, uid INTEGER, cid INTEGER, txt TEXT, att TEXT, date INTEGER, FOREIGN KEY (uid) REFERENCES users(id))")
            })
        }
        this.db = db
    }
    addUser(uObj) {
        this.db.transaction(tx => {
            tx.executeSql(`INSERT INTO users (id, name) VALUES (${uObj[0]}, '${this.q(uObj[1])}')`)
        })
    }
    async addMessage(mObj) {
        return new Promise((resolve) => {
            this.db.transaction(tx => {
                let query = `INSERT INTO messages (id, uid, cid, txt, att, date) VALUES (${mObj.id}, ${mObj.from}, ${mObj.cid}, '${this.q(mObj.txt)}', '${mObj.att.length > 0 ? (this.q(JSON.stringify(mObj.att))) : ""}', ${mObj.date})`
                tx.executeSql(query, [], resolve, (a,e)=>{console.error(e), resolve()})
            })
        })
    }
    addChat(id, name) {
        this.db.transaction(tx => {
            tx.executeSql(`INSERT INTO chats (id, name) VALUES (${id}, '${this.q(name)}')`)
        })
    }
    async getChats() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(`SELECT * FROM chats`, [], (a, b) => resolve(Array.from(b.rows), ()=>reject(0)))
            })
        })
    }
    async getUsers() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(`SELECT * FROM users`, [], (a, b) => resolve(Array.from(b.rows), ()=>reject(0)))
            })
        })
    }
    async getMessages(req) {
        return new Promise((resolve, reject) => {
            let fil = FilterMixin.SQLFilterFormer(req)
            this.db.transaction(tx => {
                tx.executeSql(`SELECT * FROM messages WHERE ${fil}`, [],
                    (a, b) => resolve(Array.from(b.rows).map(x=>{x.att = x.att?JSON.parse(x.att):x.att;return x}), ()=>reject(0)))
            })
        })
    }
    q(txt) {
        return txt.replace(/'/g, '"')
    }
    async check() {
        return new Promise((resolve, reject) =>{
            this.db.transaction(tx => {
                tx.executeSql("SELECT * FROM users LIMIT 1 OFFSET 0", [], ()=>resolve(true), ()=>reject(false))
            })
        }).catch(e=>e) || false
    }
}

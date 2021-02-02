import Dexie from 'dexie';

export default class IDBAdapter {
    constructor(create=true) {
        if(create) {
            Dexie.delete('vkdb').then(this.init())
        } else {
            this.init()
        }
    }
    addUser(uObj) {
        this.db.users.put({id: uObj[0], name: uObj[1]})
    }
    addMessage(mObj) {
        this.db.messages.put({id: mObj.id, uid: mObj.from, cid: mObj.cid, txt: mObj.txt, att: mObj.att, date: mObj.date})
    }
    init() {
        this.db = new Dexie('vkdb')
        this.db.version(1).stores({
            users: 'id, name',
            messages: 'id, uid, cid, txt, att, date'
        })
    }
    async check() {
        return await this.db.users.count() != 0
    }
}

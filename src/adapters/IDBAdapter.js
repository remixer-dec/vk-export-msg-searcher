import Dexie from 'dexie';

export default class IDBAdapter {
    constructor() {
        Dexie.delete('vkdb').then(() => {
            this.db = new Dexie('vkdb');
            this.db.version(1).stores({
                users: 'id, name',
                messages: 'id, uid, cid, txt, att, date'
            });
        })
    }
    addUser(uObj) {
        this.db.users.put({id: uObj[0], name: uObj[1]})
    }
    addMessage(mObj) {
        this.db.messages.put({id: mObj.id, uid: mObj.from, cid: mObj.cid, txt: mObj.txt, att: mObj.att, date: mObj.date})
    }
}

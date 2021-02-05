import Dexie from 'dexie';

function getAllWords(text) {
    return Array.from(new Set(text.replace(/[,.!?:"'()\n\r]/g,'').toLowerCase().split(' ')))
}

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
    //async+await prevents memory leak in the library, but makes the process 5x slower
    async addMessage(mObj) {
        await this.db.messages.put({id: mObj.id, uid: mObj.from, cid: mObj.cid, txt: mObj.txt, att: mObj.att, date: mObj.date})
    }
    addChat(id, name) {
        this.db.chats.put({id, name})
    }
    async getChats() {
        return await this.db.chats.toArray()
    }
    async getUsers() {
        return await this.db.chats.toArray()
    }
    async getMessages(req) {
        console.log(req, this.db.messages)
        let ops = {
            '<' : 'bellow',
            '>' : 'above',
            '=' : 'equals',
            'LIKE' : 'equals'
        }
        let mdb = this.db.messages

        if ('cid' in req && 'id' in req) {
            mdb = mdb.where('cid').equals(req.cid['=']).and(x => '<' in req.id ? (x.id < req.id['<']) : (x.id > req.id['>']))
        } else if ('date' in req) {
            mdb = mdb.where('date').between(req.date['>'], req.date['<'])
        } else {
            for (let rowName in req) {
                if (rowName[0] == '_') continue

                //text search by every word

                if ('LIKE' in req[rowName]) {
                    mdb = mdb.where('words')
                } else {
                    mdb = mdb.where(rowName)
                }

                for (let operator in req[rowName]) {
                    if (operator == 'LIKE') {
                        req[rowName][operator] = req[rowName][operator].replace(/[%']/g,'')
                    }
                    mdb = mdb[ops[operator]](req[rowName][operator])
                }
            }
        }
        if ('_offset' in req) {
            mdb = mdb.offset(req['_offset'])
        }
        if ('_limit' in req) {
            mdb = mdb.limit(req['_limit'])
        }
        if('_order' in req) {
            if ('_order_type' in req) {
                if (req['_order_type'] != 'ASC') {
                    mdb = mdb.reverse()
                }
                mdb = await mdb.sortBy(req['_order'])
            }
        }
        return 'toArray' in mdb ? mdb.toArray() : mdb
    }
    init() {
        this.db = new Dexie('vkdb')
        this.db.version(1).stores({
            users: 'id, name',
            chats: 'id, name',
            messages: 'id, uid, cid, txt, att, date, *words'
        })
        this.db.messages.hook("creating", function (primKey, obj) {
            if (typeof obj.txt == 'string') obj.words = getAllWords(obj.txt);
        });

    }
    async check() {
        return await this.db.users.count() != 0
    }
}

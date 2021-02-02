const months = "янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек".split("|")
export default class MessagePageParser {
    parse(src, chatID) {
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(src, 'text/html');
        let items = htmlDoc.getElementsByClassName('message')
        let messages = []
        let fromDB = new Map()
        for (let msg of items) {
            let idreg = /(public|club|id)([0-9-]+)/
            let from = (msg.firstElementChild.getElementsByTagName('a').length > 0) ?
                msg.firstElementChild.getElementsByTagName('a')[0].getAttribute('href').match(idreg) : 0
            let fromWho = 'Вы'
            if (from) {
                from = (from[1].match(/public|club/)? -1 : 1) * parseInt(from[2])
                fromWho = msg.firstElementChild.firstElementChild.innerText
            }
            fromDB.set(from, fromWho)
            let parsedMSG = {
                id: parseInt(msg.getAttribute('data-id')),
                cid: parseInt(chatID),
                from,
                date: this.parseDate(msg.firstElementChild.textContent),
                txt: msg.children[1].firstChild.innerText ? '' : 1,
                att: []
            }
            let attachments = msg.getElementsByClassName('attachment')
            if (attachments.length == 0 && parsedMSG.txt == "") {
                try {
                    parsedMSG.txt = msg.getElementsByClassName('kludges')[0].innerText
                } catch {
                    parsedMSG.txt = ''
                }
            }
            for (let a of attachments) {
                parsedMSG.att.push(this.parseAttachment(a))
            }
            if (parsedMSG.txt === 1) {
                if (msg.getElementsByClassName('kludges').length > 0) {
                    msg.children[1].removeChild(msg.children[1].lastChild)
                }
                parsedMSG.txt = msg.children[1].innerText
            }
            messages.push(parsedMSG)
        }
        return {messages, fromDB}
    }
    parseDate(txt) {
        let d =txt.match(/([0-9]{1,2}) (янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек) ([0-9]{4}) в ([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})/)
        let dt = new Date()
        dt.setYear(d[3])
        dt.setMonth(months.indexOf(d[2]))
        dt.setDate(d[1])
        dt.setHours(d[4],d[5],d[6])
        return ~~ (dt.getTime() / 1000)
    }
    parseAttachment(attElement) {
        let link = attElement.getElementsByClassName('attachment__link')
        return {desc: attElement.getElementsByClassName('attachment__description')[0].innerText,
         link: (link.length > 0) ? link[0].getAttribute('href') : undefined}
    }
}

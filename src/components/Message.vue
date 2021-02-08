<template lang="html">
        <div class="message" :class="{'message-right': source.uid == 0, 'message-plus-date': date != ''}" :set="date = getDate(source.date)">
            <div class="date" v-if="date">{{date}}</div>
            <span v-html="activateLinks(source.txt)"></span>
            <div v-html="getAttachmentsHTML(source)"></div>
            <div class="bottomtext">
                <span class="msgauthor" v-if="source.cid >= 2000000000">{{source.uname}} в</span>
                {{getTime(source.date)}}
            </div>
        </div>
</template>

<script>
let cachedDate = 0
export default {
    data() {
        return {
            date: ''
        }
    },
    props: {
        source: {
            type: Object,
            default () {
                return {
                    id: '',
                    cid: 0,
                    uid: 0,
                    txt: 0,
                    date: 0,
                    att: []
                }
            }
        }
    },
    methods: {
        activateLinks(txt) {
            txt = txt.replace(/</g,'&lt;').replace(/>/g,'&gt;')
            var urlreg = /((https?:\/\/|)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/img
            txt = txt.replace(urlreg,`<a target="_blank" href="$1">$1</a>`)
            return txt
        },
        getTime(ts) {
            return new Date(ts * 1000).toLocaleTimeString()
        },
        getDate(ts) {
            let d = new Date(ts * 1000).toLocaleDateString()
            if (cachedDate == d) {
                return ''
            } else {
                cachedDate = d
                return d
            }
        },
        getAttachmentsHTML(msg) {
            let str = ''
            if (msg.att) {
                for (let att of msg.att) {
                    switch (att.desc) {
                        case 'Фотография':
                            str += `<a href="${att.link}" target="_blank"><img src="${att.link}" class="msg-img"></a>`
                        break
                        default:
                            if (att.desc.match('прикреп')) {
                                str += `<div class="attach forwarded">${att.desc}</div>`
                            } else {
                                if (att.link) {
                                    str += `<div><a href="${att.link}" target="_blank" class="attach">${att.desc}</a></div>`
                                } else {
                                    str += `<div class="attach">${att.desc}</div>`
                                }
                            }
                        break
                    }
                }
            }
            return str
        }
    }
}
</script>

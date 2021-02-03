<template lang="html">
    <div class="messagelist-wrapper" ref="wrapper">
        <div ref="dialogStart"></div>
        <div v-for="(msg, index) in messages" :key="index" class="message" :class="{'message-right': msg.uid == 0}" :set="date = getDate(msg.date)">
            <div class="date" v-if="msg">{{date}}</div>
            <span v-html="activateLinks(msg.txt)"></span>
            <div v-html="getAttachmentsHTML(msg)"></div>
            <div class="bottomtext"><span class="msgauthor" v-if="chatid >= 2000000000">{{msg.uname}} в </span>{{parseTime(msg.date)}}</div>
        </div>
        <div ref="dialogEnd"></div>
    </div>
</template>

<script>
let cachedDate = 0
export default {
    props: ['messages', 'chatid'],
    mounted() {
        let itv = setInterval(() => this.$refs.dialogEnd.scrollIntoView(), 10)
        setTimeout(()=>clearInterval(itv), 900)
        window.addEventListener('scroll', this.scrollHandler)
    },
    unmounted() {
        window.removeEventListener('scroll', this.scrollHandler)
    },
    beforeUpdate() {
        let pos = this.$refs.wrapper.scrollHeight
        let scroll = window.scrollY
        let si = setInterval(() => window.scrollTo({top: scroll + (this.$refs.wrapper.scrollHeight - pos)}), 2)
        setTimeout(() => {clearInterval(si); this.dataRequest = false}, 64)
    },
    methods: {
        scrollHandler() {
            if (window.scrollY < 200) {
                if (!this.dataRequest && this.messages.length > 0) {
                    this.dataRequest = true
                    this.$emit('prevmsg', {dir: -1, mid: this.messages[0].id})
                }
            }
        },
        activateLinks(txt) {
            var urlreg = /((https?:\/\/|)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/img
            txt = txt.replace(urlreg,`<a target="_blank" href="$1">$1</a>`)
            return txt
        },
        parseTime(ts) {
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
                                    str += `<div><a href="${att.link}" class="attach">${att.desc}</a></div>`
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
    },
    data() {
        return {
            cachedDate: 0,
            dataRequest: false
        }
    }
}
</script>

<style lang="css" scoped>
a {
    color: #5181b8
}
.messagelist-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 800px;
    margin: 0 auto;
    padding: 16px 0;
    background: rgba(0,0,0,.02);
    position: relative;
    transition: height 0.66s ease-out;
}
.message {
    background: #fff;
    max-width: 340px;
    width: max-content;
    margin: 10px 6px 18px;
    padding: 10px;
    border-radius: 20px;
    text-align: left;
    white-space: pre-wrap;
    box-shadow: 0px 1px 4px rgba(0,0,0,.05);
    user-select: text !important;
}
.message.message-right {
    margin-left: auto;
}
.bottomtext {
    position: absolute;
    font-size: 12px;
    color: #ccc;
    transform: translate(-10px, 14px);
}
.message-right .bottomtext{
    right: 10px;
    transform: translate(0, 14px)
}
.date {
    position: absolute;
    background: #000;
    color: #fff;
    text-align: center;
    width: 90px;
    margin: 0 auto;
    left: 50%;
    transform: translate(-50%, -32px);
    border-radius: 20px;
    opacity: .1;
    font-size: 14px;
}
</style>
<style>
.msg-img {
    max-height: 270px;
    margin: 2px;
    max-width: 100%;
}
.attach {
    color: #ccc;
}
.forwarded {
    font-size: 12px;
    margin: 2px;
}
</style>

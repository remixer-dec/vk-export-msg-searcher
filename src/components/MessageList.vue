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
        this.scrollTarget = this.$refs.wrapper.parentElement.parentElement.parentElement
        setTimeout(()=>clearInterval(itv), 900)
        this.scrollTarget.addEventListener('scroll', this.scrollHandler)
    },
    unmounted() {
        window.removeEventListener('scroll', this.scrollHandler)
    },
    beforeUpdate() {
        //https://stackoverflow.com/questions/50074823/how-can-i-keep-scroll-position-when-add-dom-to-top
        //TODO: find a better solution, this one is not perfect
        //maybe use this library
        //https://tangbc.github.io/vue-virtual-scroll-list/#/chat-room
        let scrollTarget = this.scrollTarget
        let pos = scrollTarget.scrollHeight  - scrollTarget.clientHeight
        let sy = scrollTarget.scrollTop
        let si = setInterval(() => {
            let diff = (scrollTarget.scrollHeight  - scrollTarget.clientHeight) - pos
            let ydiff = sy + diff
            scrollTarget.scrollTop = ydiff
        }, 2)
        setTimeout(() => {clearInterval(si); this.dataRequest = false}, 300)
    },
    methods: {
        scrollHandler() {
            //https://gomakethings.com/detecting-when-a-visitor-has-stopped-scrolling-with-vanilla-javascript/
            window.clearTimeout(this.isScrolling)
            this.isScrolling = setTimeout(() => {
                if (this.scrollTarget.scrollTop < 200) {
                    if (!this.dataRequest && this.messages.length > 0) {
                        this.dataRequest = true
                        this.$emit('prevmsg', {dir: -1, mid: this.messages[0].id})
                    }
                }
            }, 90)
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
            isScrolling: 0,
            scrollTarget: false,
            dataRequest: false
        }
    }
}
</script>

<style lang="css" scoped>
.messagelist-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 800px;
    margin: 0 auto;
    padding: 16px 0;
    position: relative;
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
    background: #f2f7ff;
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
    height: auto;
}
.attach {
    color: #ccc;
}
.forwarded {
    font-size: 12px;
    margin: 2px;
}
.messagelist-wrapper a {
    color: #5181b8
}
</style>

<template lang="html">
    <div class="messagelist-wrapper" ref="wrapper">
        <virtual-list v-show="!!messages.length" class="msg-stream scroll-touch" ref="vsl"
          :data-key="'id'"
          :data-sources="messages"
          :data-component="messageComponent"
          :estimate-size="58"
          :item-class="'stream-item'"
          :keeps="30"
          @totop="loadMore(-1)"
          @tobottom="loadMore(1)"
        />
    </div>
</template>

<script>
import Message from './Message'
import VirtualList from 'vue-virtual-scroll-list'

export default {
    props: ['messages', 'chatid'],
    mounted() {
        this.$refs.vsl.scrollToBottom()
        setTimeout(() => {
            this.$refs.vsl.scrollToBottom()
        }, 100)
        setTimeout(() => {
            this.dataRequest = false
        }, 600)
    },
    beforeUpdate() {
        if (this.dataRequest && this.msgLoadDir == -1) {
            this.sids = this.messages.slice(0, this.messages.findIndex(x => x.id == this.firstMid)).map(m => m.id)
            this.$nextTick(this.fixPosition)
        }
    },
    updated() {
        if (this.msgLoadDir) {
            this.dataRequest = false
        }
    },
    components: {
        VirtualList
    },
    methods: {
        loadMore(dir) {
            if (!this.dataRequest) {
                this.dataRequest = true
                this.msgLoadDir = dir
                this.firstMid = this.messages[0].id
                let lastMid = this.messages[this.messages.length-1].id
                this.$emit('prevmsg', {dir, mid: dir < 0 ? this.firstMid : lastMid })
            }
        },
        fixPosition() {
            let sids = this.sids
            if (sids.length == 0) return
            let offset = sids.reduce((tv, cv) => tv += this.$refs.vsl.getSize(cv), 0)
            this.$refs.vsl.scrollToOffset(offset)

        },
    },
    data() {
        return {
            dataRequest: true,
            msgLoadDir: 0,
            sids: [],
            firstMid: 0,
            messageComponent: Message
        }
    }
}
</script>

<style lang="css">
.msg-stream {
    overflow-y: auto;
    min-height: 100%;
    position: relative;
    height: calc(100vh - 46px);
}
.messagelist-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 800px;
    margin: 0 auto;
    padding: 0;
    position: relative;
}
.message {
    background: #fff;
    max-width: 340px;
    width: max-content;
    margin: 24px 6px 18px;
    padding: 10px;
    border-radius: 20px;
    text-align: left;
    white-space: pre-wrap;
    box-shadow: 0px 1px 4px rgba(0,0,0,.05);
    user-select: text !important;
}
.message-plus-date {
    margin: 30px 6px 18px;
}
.message.message-right {
    margin-left: auto;
    background: #f2f7ff;
}
.bottomtext {
    position: absolute;
    font-size: 12px;
    color: #ccc;
    transform: translate(0, 14px);
}
.message-right .bottomtext {
    right: 16px;
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
.msg-img {
    max-height: 270px;
    margin: 2px;
    max-width: 100%;
    height: 270px;
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
.msgwrap {
    display: flex;
}
.stream-item {
    display: flex
}
</style>

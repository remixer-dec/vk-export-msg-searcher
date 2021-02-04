<template lang="html">
    <div class="wrapper" ref="reswrapper">
        <Group>
            <List>
                <Cell v-for="(msg, index) in data.results" :key="index" @click="loadDialog(msg.cid, msg.id)">
                    {{msg.txt}}
                    <div class="search-meta">{{msg.uname}} <span v-if="msg.uid == msg.cid">в личном сообщении </span>
                        <span v-else>в диалоге {{msg.cname}} </span>в {{getDate(msg.date)}}</div>
                </Cell>
            </List>
        </Group>
    </div>
</template>

<script>
export default {
    mounted() {
        this.scrollTarget = this.$refs.reswrapper.parentElement.parentElement.parentElement
        this.scrollTarget.addEventListener('scroll', this.scrollHandler)
    },
    unmounted() {
        this.scrollTarget.removeEventListener('scroll', this.scrollHandler)
    },
    beforeUpdate() {
        this.dataRequest = false
    },
    data() {
        return {dataRequest: false, scrollTarget: false}
    },
    props: ['data'],
    methods: {
        scrollHandler() {
            if ((this.scrollTarget.scrollTop > (this.scrollTarget.scrollHeight - document.body.offsetHeight) - 200) && !this.dataRequest) {
                this.dataRequest = true
                this.$emit('more')
            }
        },
        getDate(ts) {
            return new Date(ts * 1000).toLocaleDateString()
        },
        loadDialog(cid, mid){
            this.$emit('chat', {cid, mid})
        }
    }
}
</script>

<style lang="css" scoped>
.wrapper {
    max-width: 600px;
    margin: 0 auto;
    text-align: left;
}
</style>

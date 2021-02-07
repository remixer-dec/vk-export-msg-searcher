<template lang="html">
    <Cell @click="dialogOpener(source.id, source.name)">
        {{source.name}}
    </Cell>
</template>

<script>
export default {
    props: {
        source: {
            type: Object,
            default () {
                return {
                    id: 0,
                    name: ''
                }
            }
        },
        dialogOpener: {
            type: Function
        }
    }
}
</script>

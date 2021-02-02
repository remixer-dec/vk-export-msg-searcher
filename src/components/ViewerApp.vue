<template lang="html">
    <VKView activePanel="dialoglist">
        <Panel id="dialoglist">
            <PanelHeader>Диалоги
                <template v-slot:left>
                    <HeaderButton @click="mainPage">
                        <vkui-icon name="home" />
                    </HeaderButton>
                    <HeaderButton @click="dbSelectorOpened = !dbSelectorOpened">
                        <vkui-icon name="upload" />
                    </HeaderButton>
                </template>
                <template v-slot:right>
                    <HeaderButton v-if="searchOpened">
                        <vkui-icon name="newsfeed" />
                    </HeaderButton>
                    <HeaderButton @click="filterOpened = !filterOpened">
                        <vkui-icon name="filter" />
                    </HeaderButton>
                    <HeaderButton @click="searchOpened = !searchOpened">
                        <vkui-icon name="search" />
                    </HeaderButton>
                </template>
            </PanelHeader>
            <HeaderContext :opened="dbSelectorOpened" :onClose="closeDBSelector">
                <List>
                    <Cell @click="selectDataSource('idb')">Использовать IndexedDB</Cell>
                    <Cell @click="selectDataSource('wql')">Использовать WebSQL</Cell>
                    <label for="sqlDBselector"><Cell>Загрузить из файла SQLite</Cell></label>
                    <CellButton level="danger" v-if="dbError">{{dbError}}</CellButton>
                    <input type="file" id="sqlDBselector" @change="fileSelected">
                </List>
            </HeaderContext>
            <HeaderContext :opened="filterOpened" :onClose="closeFilterSelector">
                <Tabs>
                  <TabsItem :selected="idFilter == 'all'" @click="idFilter = 'all'">Все</TabsItem>
                  <TabsItem :selected="idFilter == 'users'" @click="idFilter = 'users'">Люди</TabsItem>
                  <TabsItem :selected="idFilter == 'groups'" @click="idFilter = 'groups'">Группы</TabsItem>
                  <TabsItem :selected="idFilter == 'chats'" @click="idFilter = 'chats'">Беседы</TabsItem>
                </Tabs>
            </HeaderContext>
            <HeaderContext :opened="searchOpened" :onClose="closeSearchBox">
                <Search/>
            </HeaderContext>
        </Panel>
    </VKView>
</template>

<script>
import SQLiteAdapter from '../adapters/SQLiteAdapter'
import WebSQLAdapter from '../adapters/WebSQLAdapter'
import IDBAdapter from '../adapters/IDBAdapter'

export default {
    name: 'ViewerApp',
    provide: {
        webviewType: 'internal'
    },
    methods: {
        fileSelected() {
            let f = window.sqlDBselector.files[0]
            let r = new FileReader()
            r.onload = () => {
                let u8 = new Uint8Array(r.result)
                this.dbProvider = new this.dbAdapters['sql'](false, u8)
                this.closeDBSelector()
                this.dbError = false
            }
            r.readAsArrayBuffer(f)
        },
        selectDataSource(src) {
            this.dbProvider = new this.dbAdapters[src](false)
            this.dbProvider.check().then(dbExists => {
                this.dbError = dbExists ? false : 'Не удалось найти данные в выбранной БД.'
                if (dbExists) {
                    this.closeDBSelector()
                }
            })
        },
        closeDBSelector() {
            this.dbSelectorOpened = false
        },
        closeFilterSelector() {
            this.filterOpened = false
        },
        closeSearchBox() {
            this.searchOpened = false
        },
		mainPage() {
			this.$emit('gohome')
		}
    },
    mounted(){

    },
    data() {
        return {
            dbChoice: localStorage['vkmsg-db-sel'],
            dbAdapters: {
                idb: IDBAdapter,
                wql: WebSQLAdapter,
                sql: SQLiteAdapter
            },
            dbSelectorOpened: false,
            filterOpened: false,
            searchOpened: false,
            dbError: false,
			dbProvider: false,
            idFilter: 'all'
        }
    }
}
</script>

<style lang="css">
.PanelHeader-left-in.PanelHeader-left-in--brand {
    display: flex;
}
input[type=file] {
    display: none;
}
</style>

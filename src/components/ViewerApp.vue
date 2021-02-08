<template lang="html">
    <VKView :activePanel="panel">
        <Panel id="dialoglist">
            <PanelHeader>
                Диалоги
                <template v-slot:left>
                    <HeaderButton @click="mainPage">
                        <vkui-icon name="home" />
                    </HeaderButton>
                    <HeaderButton @click="dbSelectorOpened = !dbSelectorOpened">
                        <vkui-icon name="upload" />
                    </HeaderButton>
                </template>
                <template v-slot:right>
                    <HeaderButton v-if="searchOpened" @click="showDatePicker = !showDatePicker">
                        <date-picker type="date" :open="showDatePicker" @input="dateSelected"></date-picker>
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
                    <CellButton level="danger" id="dbError" v-if="dbError">{{dbError}}</CellButton>
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
                <BetterSearch placeholder="Поиск диалогов" v-on:input="applyNameFilter" cache="dialogSearch"/>
            </HeaderContext>
            <HeaderContext :opened="searchOpened" :onClose="closeSearchBox">
                <BetterSearch placeholder="Поиск сообщений" v-on:input="findMessages" cache="messageSearch" />
            </HeaderContext>
            <Group v-if="filteredChats.length > 0" :class="{'blurred': searchOpened || filterOpened}">
                <List>
                    <VirtualList
                    :data-sources="filteredChats"
                    :data-key="'id'"
                    :data-component="dialogListItemComponent"
                    :estimate-size="44"
                    :keeps="40"
                    :extra-props="{dialogOpener: openDialog}"
                    :page-mode="true"
                    item-class="Cell Cell--ios">
                    </VirtualList>
                </List>
            </Group>
            <div v-else>
                <Div v-if="chats.length > 0">Нет результатов</Div>
                <div v-else>
                    <Div v-if="dbProvider">
                        <ScreenSpinner />
                    </Div>
                    <Div v-else>Выберете источник данных</Div>
                </div>
            </div>
        </Panel>
        <Panel id="searchresults">
            <PanelHeader>
                Результаты поиска
                <template v-slot:left>
                    <HeaderButton @click="goBack()">
                        <vkui-icon name="back" />
                    </HeaderButton>
                </template>
            </PanelHeader>
            <Div v-if="search.results.length == 0">Нет результатов</Div>
            <SearchResults v-else :data="search" v-on:more="loadMoreSearchResults" v-on:chat="openDialogFromSearch"/>
        </Panel>
        <Panel id="dialogview">
            <PanelHeader>
                {{selectedChat.name}}
                <template v-slot:left>
                    <HeaderButton @click="goBack()">
                        <vkui-icon name="back" />
                    </HeaderButton>
                </template>
            </PanelHeader>
            <MessageList :messages="msgsInSelectedChat" :chatid="selectedChat.id" v-on:prevmsg="loadMoreMessages" ref="msglist"/>
        </Panel>
    </VKView>
</template>

<script>
import SQLiteAdapter from '../adapters/SQLiteAdapter'
import WebSQLAdapter from '../adapters/WebSQLAdapter'
import IDBAdapter from '../adapters/IDBAdapter'
import FilterMixin from '../mixins/Filter'
import BetterSearch from './BetterSearch'
import MessageList from './MessageList'
import SearchResults from './SearchResults'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import VirtualList from 'vue-virtual-scroll-list'
import DialogListItem from './DialogListItem'



export default {
    name: 'ViewerApp',
    provide: {
        webviewType: 'internal'
    },
    components: {BetterSearch, MessageList, DatePicker, SearchResults, VirtualList},
    computed: {
        filteredChats() {
            let fchats = this.chats.filter(item => FilterMixin['idFilter'][this.idFilter](item))
            if (this.chatNameFilter) {
                let fregx = new RegExp(this.chatNameFilter, 'i')
                fchats = fchats.filter(item => item.name.match(fregx))
            }
            return fchats
        }
    },
    methods: {
        fileSelected() {
            let f = window.sqlDBselector.files[0]
            let r = new FileReader()
            this.dbError = 'Загрузка...'
            r.onload = () => {
                let u8 = new Uint8Array(r.result)
                this.dbProvider = new this.dbAdapters['sql'](false, u8)
                this.dbProvider.dbReady.then(() => {
                    this.dbError = false
                    this.loadChatList()
                })
                this.closeDBSelector()
            }
            r.readAsArrayBuffer(f)
        },
        selectDataSource(src, auto=false) {
            this.dbProvider = new this.dbAdapters[src](false)
            this.dbProvider.check().then(dbExists => {
                this.dbError = dbExists ? false : 'Не удалось найти данные в выбранной БД.'
                if (auto && !dbExists) {
                    this.dbError = ''
                    this.dbSelectorOpened = true
                }
                if (dbExists) {
                    this.closeDBSelector()
                    this.loadChatList()
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
        goBack() {
            history.back()
        },
		mainPage() {
			this.$emit('gohome')
            window.location.replace('#')
		},
        loadChatList() {
            this.dbProvider.getChats().then(chats => {
                this.chats = chats
                this.chats.map(c => {
                    this.chatsById[c.id] = c.name
                })
                this.loadUserList()
            })
        },
        loadUserList() {
            this.dbProvider.getUsers().then(users => {
                users.map(u => {
                    this.usersById[u.id] = u.name
                })
            })
        },
        applyNameFilter(srch) {
            this.chatNameFilter = srch
            this.closeFilterSelector()
        },
        addUsername(arr) {
            for(let i=0,l=arr.length; i<l; i++) {
                arr[i]['uname'] = this.usersById[arr[i].uid] || ''
            }
            return arr
        },
        addChatname(arr) {
            for(let i=0,l=arr.length; i<l; i++) {
                arr[i]['cname'] = this.chatsById[arr[i].cid] || ''
            }
            return arr
        },
        openDialog(id, name) {
            this.resetSelectedChat(name, id)
            history.pushState({}, 'Просмотр сообщений', '#viewer/messages')
            this.selectedChat.bottomLimitReached = true
            this.dbProvider.getMessages({'cid': {'=': id}, '_limit': 30, '_order': 'id', '_order_type': 'DESC'}).then(msgs => {
                this.addUsername(msgs)
                this.msgsInSelectedChat = msgs.reverse()
            })
        },
        loadMoreMessages({dir, mid}) {
            let dirObj = dir > 0 ? {'>': mid} : {'<': mid}
            if ((dir == -1 && this.selectedChat.topLimitReached) || dir == 1 && this.selectedChat.bottomLimitReached) {
                this.$refs.msglist.dataRequest = false
                return
            }

            let request = {'cid': {'=': this.selectedChat.id}, id: dirObj, '_limit': 30, '_order': 'id', '_order_type': (dir == -1) ? 'DESC' : 'ASC'}
            this.dbProvider.getMessages(request).then(msgs => {
                if (msgs.length == 0) {
                    this.limitReached(dir)
                    this.$refs.msglist.dataRequest = false
                }
                this.addUsername(msgs)
                this.msgsInSelectedChat = dir < 0 ? [...msgs.reverse(), ...this.msgsInSelectedChat] : [...this.msgsInSelectedChat, ...msgs]
            }).catch(() => {
                this.limitReached(dir)
                this.$refs.msglist.dataRequest = false
            })
        },
        limitReached(dir) {
            if (dir == -1)
                this.selectedChat.topLimitReached = true
            else
                this.selectedChat.bottomLimitReached = true
        },
        openDialogFromSearch({cid, mid}) {
            history.pushState({}, 'Просмотр сообщений', '#viewer/messages')
            this.resetSelectedChat(this.chats.find(c => c.id == cid).name, cid)
            this.loadMoreMessages({dir: -1, mid: mid + 5})
        },
        dateSelected(date) {
            let start = new Date(date.setHours(0))
            let end = new Date(date.setDate(date.getDate() + 1))
            this.showDatePicker = false
            this.dateSearch(~~(start.getTime()/1000), ~~(end.getTime()/1000))
        },
        resetSelectedChat(name, cid) {
            this.selectedChat.name = name
            this.selectedChat.id = cid
            this.panel = 'dialogview'
            this.selectedChat.topLimitReached = false
            this.selectedChat.bottomLimitReached = false
            this.msgsInSelectedChat = []
        },
        dateSearch(start, end) {
            history.pushState({}, 'Поиск по дате', '#viewer/searchbydate')
            this.panel = 'searchresults'
            this.dbProvider.getMessages({'date': {'<': end, '>': start}, '_order': 'id', '_order_type': 'DESC'}).then(results => {
                this.search.results = results
            }).catch(()=>{})
        },
        runSearch(text, offset) {
            this.dbProvider.getMessages({'txt': {'LIKE': `'%${text.replace(/%|'/g,'')}%'`},
             '_limit': 30, '_offset': offset, '_order': 'id', '_order_type': 'DESC'}).then(results => {
                 this.search.results = [...this.search.results, ...results]
                 this.search.offset += 30
             }).catch(() => {
                 if (this.search.offset == 0) {
                     //no results
                 }
             })
        },
        findMessages(text) {
            if (text == '') return
            history.pushState({}, 'Поиск сообщений', '#viewer/search')
            this.panel = 'searchresults'
            this.search.results = []
            this.search.query = text
            this.search.offset = 0
            this.runSearch(text, 0)
        },
        loadMoreSearchResults() {
            this.runSearch(this.search.query, this.search.offset)
        }
    },
    watch: {
        'search.results' : function() {
            this.addUsername(this.search.results)
            this.addChatname(this.search.results)
        }
    },
    created() {
        this.$root.$off('back')
        this.$root.$on('back', () => {
            switch (this.panel) {
                case 'dialoglist':
                    if (this.filterOpened || this.searchOpened || this.dbSelectorOpened) {
                        this.filterOpened = false
                        this.searchOpened = false
                        this.dbSelectorOpened = false
                    } else {
                        this.mainPage()
                    }
                break
                case 'searchresults':
                    this.panel = 'dialoglist'
                break
                case 'dialogview':
                    this.panel = this.searchOpened? 'searchresults' : 'dialoglist'
                break
            }
        })
    },
    mounted() {
        if (this.dbChoice && this.dbChoice != 'sql') {
            this.selectDataSource(this.dbChoice, true)
        } else {
            if (!this.$root.db) {
                this.dbSelectorOpened = true
            } else {
                this.dbProvider = this.$root.db
                this.loadChatList()
            }
        }
    },
    data() {
        return {
            chats: [],
            chatsById: {},
            usersById: {},
            selectedChat: {
                id: 0,
                name: '',
                topLimitReached: false,
                bottomLimitReached: false
            },
            search: {
                query: '',
                offset: 0,
                results: []
            },
            msgsInSelectedChat: [],
            showDatePicker: false,
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
            idFilter: 'all',
            chatNameFilter: '',
            panel: 'dialoglist',
            dialogListItemComponent: DialogListItem
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
.mx-datepicker {
    visibility: hidden;
    width: 0;
}
.mx-datepicker-main.mx-datepicker-popup {
    transform: translateX(120px);
}
.search-meta {
    color: #ccc;
    font-size: 12px;
    line-height: 12px;
}

#dbError {
    text-align: center;
}
#dbError .CellButton__content {
    width: 100%
}
.msg-stream {
    will-change: scroll-position;
}
.blurred {
    filter:blur(2px)
}
.Panel {
    will-change: transform;
}
</style>

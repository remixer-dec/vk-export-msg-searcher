<template>
<div id="app">
	<VKView :activePanel="activePanel">
		<Panel id="storageSourceSelector">
			<PanelHeader>Импортировать сообщения в</PanelHeader>
			<Group title="Выберете, куда будут сохранены сообщения">
				<FormLayout class="leftform">
					<Div>
						<Radio name="radio" value="idb">IndexedDB (этот браузер) медленно, просмотр + поиск по слову или дате</Radio>
						<Radio default modelValue="wql" name="radio" value="wql">WebSQL (этот браузер) очень медленно, просмотр + полноценный поиск, только для браузеров на основе Chromium</Radio>
						<Radio name="radio" value="sql">SQLite (файл) быстро, просмотр + полноценный поиск, потребляет много оперативной памяти</Radio>
					</Div>
					<Div>
						<Button level="outline" @click="dbSelected">Далее</Button>
					</Div>
				</FormLayout>
			</Group>
		</Panel>
		<Panel id="importSourceSelector">
			<PanelHeader>Импорт из архива ВК</PanelHeader>
			<br>
			<Group>
				<Div>
					<label for="zipselect"><Button>Импортировать из zip-папки с директорией messages</Button></label>
				</Div>
				<Div>
					<label for="dirselect"><Button>Импортировать директорию messages</Button></label>
				</Div>
				<CellButton level="danger" v-if="errorMsg">{{errorMsg}}</CellButton>
			</Group>
			<Div v-if="storageQuotaSupported && storage.quota < 400000000 && !persisted && radioValue != 'sql'">
					Доступного места в хранилище браузера может не хватить для крупного архива сообщений. Сейчас сайту доступно {{~~(storage.quota / 1000000)}} МБ.
					Освободите память, или дайте сайту разрешение на постоянное хранилище.
					В браузерах на основе Chromium для этого необходимо поднять приоритет сайта, для этого например можно включить у него уведомления.
					После чего необходимо обновить страницу и это сообщение исчезнет.
			</Div>
		</Panel>
		<Panel id="loading">
			<PanelHeader>Загрузка</PanelHeader>
			<Div>
				<Spinner/>
			</Div>
			<Group>
				<Div>
					<Group title="Импорт всех диалогов">
						<InfoRow :title="progress + '%'">
							<Progress :value="progress" />
						</InfoRow>
					</Group>
					<br>
					<Group title="Импорт всех файлов">
						<InfoRow :title="progress1 + '%'">
							<Progress :value="progress1" />
						</InfoRow>
					</Group>
					<br>
					<Group :title="progress2text">
						<InfoRow :title="progress2 + '%'">
							<Progress :value="progress2" />
						</InfoRow>
					</Group>
					<br>
					<Group title="Использование оперативной памяти" v-if="memoryUseSupported">
						<InfoRow :title="memory + '%'">
							<Progress :value="memory" />
						</InfoRow>
					</Group>
					<Group title="Использование постоянной памяти" v-if="storageQuotaSupported && radioValue != 'sql'">
						<InfoRow :title="storage.percent + '%'">
							<Progress :value="storage.percent" />
						</InfoRow>
					</Group>
				</Div>
			</Group>
		</Panel>
		<Panel id="finalstep">
			<PanelHeader>БД импортирована</PanelHeader>
			<br><br><br>
			<Div v-if="radioValue == 'sql'">
				<Button @click="downloadDB">Скачать файл ещё раз</Button>
			</Div>
			<Div v-if="radioValue == 'sql'">
				<Button @click="useRAMDB">Перейти к просмотру</Button>
			</Div>
			<Div>
				<Button @click="mainPage">На главную</Button>
			</Div>
		</Panel>
	</VKView>
	<input type="file" id="dirselect" webkitdirectory directory @change="dirSelected" />
	<input type="file" id="zipselect" accept=".zip" @change="zipSelected" />
</div>
</template>

<script>
import FileOperationMixin from './mixins/Files'
import DownloaderMixin from './mixins/Downloader'
import MessagePageParser from './parsers/MessagePageParser'
import SQLiteAdapter from './adapters/SQLiteAdapter'
import WebSQLAdapter from './adapters/WebSQLAdapter'
import IDBAdapter from './adapters/IDBAdapter'

export default {
	name: 'App',
	data() {
		return {
			activePanel: 'storageSourceSelector',
			status: 'загрузка метаданных',
			errorMsg: false,
			progress: 0,
			progress1: 0,
			progress2: 0,
			progress2text: '',
			memory: 0,
			storage: {quota: Infinity, usage: 0, percent:0},
			storageQuotaSupported: navigator.storage && navigator.storage.estimate,
			memoryUseSupported: window.performance && window.performance.memory,
			dbAdapters: {
				idb: IDBAdapter,
				wql: WebSQLAdapter,
				sql: SQLiteAdapter
			},
			dbProvider: false,
			persisted: false,
			radioValue: 'wql'
		}
	},
	components: {},
	mixins: { FileOperationMixin },
	methods: {
		async getStorageData() {
			if (this.storageQuotaSupported) {
				this.storage = await navigator.storage.estimate()
				this.storage.percent = ~~(this.storage.usage / this.storage.quota * 100)
			}
		},
		useRAMDB() {
			console.log(this.$root)
			this.$root.db = this.dbProvider
			this.$parent.selectView(2)
		},
		dbSelected() {
			this.radioValue = document.querySelector('input[type=radio]:checked').value
			this.dbProvider = new this.dbAdapters[this.radioValue](true)
			if (this.radioValue != 'sql' && navigator.storage && navigator.storage.persist) {
				navigator.storage.persist().then(ps => {
					this.persisted = ps
				})
			}
			this.getStorageData()
			console.log(this)
			this.activePanel = 'importSourceSelector'
		},
		metaLoadingSuccess(data) {
			this.startParsingMessages(data)
		},
		metaLoadingError(er) {
			this.activePanel = 'importSourceSelector'
			this.errorMsg = 'Что-то пошло не так. Не удалось найти необходимые файлы. (' + er + ')'
		},
		zipSelected() {
			let zipselect = document.getElementById('zipselect')
			FileOperationMixin.loadZip(zipselect.files[0])
				.then(d => this.metaLoadingSuccess(d))
				.catch(e => this.metaLoadingError(e))
			this.activePanel = 'loading'
		},
		dirSelected() {
			let dirselect = document.getElementById('dirselect')
			FileOperationMixin.loadFolder(dirselect)
				.then(d => this.metaLoadingSuccess(d))
				.catch(e => this.metaLoadingError(e))
			this.activePanel = 'loading'
		},
		downloadDB() {
			DownloaderMixin.downloadBlob(
				this.dbProvider.db.export(),
				'vk-msg.sqlite',
				'application/octet-stream'
			)
		},
		mainPage() {
			this.$emit('gohome')
		},
		async startParsingMessages(data) {
			let chatsArr = Object.keys(data.chats)
			let mpp = new MessagePageParser()
			let chatsArrLen = chatsArr.length
			let c = 0
			let fc = 0
			let fileCount = Object.values(data.chatFiles).reduce((a, b) => a + b.length, 0)
			let userDBMap = new Map()
			for (let id of chatsArr) {
				c++
				this.progress = ~~((c / chatsArrLen) * 100)
				let l = data.chatFiles[id].length
				for (let i in data.chatFiles[id]) {
					fc++
					if (i == 0) {
						this.progress2text = 'Импорт сообщений из диалога ' + data.chats[id]
						this.getStorageData()
						this.memory = this.memoryUseSupported
							? ~~((window.performance.memory.usedJSHeapSize / window.performance.memory.jsHeapSizeLimit) * 100)
							: 0
					}
					let mpd = mpp.parse(
						await data.contentAdapterInstance.getFileContent(
							data.indexDir + id + '/messages' + data.chatFiles[id][i] + '.html'
						),
						id
					)

					for (let msg of mpd.messages) {
						await this.dbProvider.addMessage(msg)
						msg = undefined
					}

					userDBMap = new Map([...userDBMap, ...(mpd.fromDB)])

					this.progress1 = ~~((fc / fileCount) * 100)
					this.progress2 = ~~((i / l) * 100)
				}
				this.dbProvider.addChat(parseInt(id), data.chats[id])
			}
			for (let usr of userDBMap.entries()) {
				this.dbProvider.addUser(usr)
			}
			userDBMap = undefined
			this.activePanel = 'finalstep'
			localStorage['vkmsg-db-sel'] = this.radioValue
			if (this.radioValue == 'sql') this.downloadDB()
		}
	}
}
</script>

<style>
.leftform {
	text-align: left;
}
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>

<template>
<div id="app">
	<VKView :activePanel="activePanel">
		<Panel id="storageSourceSelector">
			<PanelHeader>Импортировать сообщения в</PanelHeader>
			<Group title="Выберете, куда будут сохранены сообщения">
				<FormLayout class="leftform">
					<Div>
						<Radio default modelValue="idb" name="radio" value="idb">IndexedDB (этот браузер)</Radio>
						<Radio name="radio" value="wql">WebSQL (этот браузер) (только для браузеров на основе Chromium)</Radio>
						<Radio name="radio" value="sql">SQLite3 (файл)</Radio>
					</Div>
					<Div>
						<Button level="outline" @click="dbSelected">Далее</Button>
					</Div>
				</FormLayout>
			</Group>
		</Panel>
		<Panel id="importSourceSelector">
			<PanelHeader>Импорт сообщений из архива ВК</PanelHeader>
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
				</Div>
			</Group>
		</Panel>
		<Panel id="finalstep">
			<PanelHeader>БД импортирована</PanelHeader>
			<br><br><br>
			<Div>
				<Button @click="downloadDB" v-if="radioValue == 'sql'">Сохранить ещё раз</Button>
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
const SQLiteProvider = new SQLiteAdapter()

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
			memoryUseSupported: window.performance && window.performance.memory,
			dbProviders: {
				idb: false,
				wql: false,
				sql: SQLiteProvider
			},
			radioValue: 'idb'
		}
	},
	components: {},
	mixins: { FileOperationMixin },
	methods: {
		dbSelected() {
			this.radioValue = document.querySelector('input[type=radio]:checked').value
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
				this.dbProviders[this.radioValue].db.export(),
				'vk-msg.sqlite',
				'application/octet-stream'
			)
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
						this.dbProviders[this.radioValue].addMessage(msg)
						msg = undefined
					}

					userDBMap = new Map([...userDBMap, ...(mpd.fromDB)])

					this.progress1 = ~~((fc / fileCount) * 100)
					this.progress2 = ~~((i / l) * 100)
				}
			}
			for (let usr of userDBMap.entries()) {
				this.dbProviders[this.radioValue].addUser(usr)
			}
			userDBMap = undefined
			this.activePanel = 'finalstep'
			this.downloadDB()
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

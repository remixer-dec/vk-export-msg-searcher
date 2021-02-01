<template>
<div id="app">
	<VKView :activePanel="activePanel">
		<Panel id="storageSourceSelector">
			<PanelHeader>Импортировать сообщения в</PanelHeader>
			<Group title="Выберете куда будут сохранены сообщения">
				<FormLayout class="leftform">
					<Div>
						<Radio default modelValue="idb" name="radio" value="idb">IndexedDB</Radio>
						<Radio name="radio" value="wql">WebSQL (Chromium only)</Radio>
						<Radio name="radio" value="sql">SQLite3 file</Radio>
					</Div>
					<Div>
						<Button level="outline" @click="activePanel = 'importSourceSelector'">Далее</Button>
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
					<InfoRow :title="progress + '%'">
						<Progress :value="progress" />
					</InfoRow>
				</Div>
			</Group>
		</Panel>
	</VKView>
	<input type="file" id="dirselect" webkitdirectory directory @change="dirSelected" />
	<input type="file" id="zipselect" accept=".zip" @change="zipSelected" />
</div>
</template>

<script>
import FileOperationMixin from './mixins/Files'
import MessagePageParser from './parsers/MessagePageParser'
export default {
	name: 'App',
	data() {
		return {
			activePanel: 'storageSourceSelector',
			status: 'загрузка метаданных',
			errorMsg: false,
            progress: 0
		}
	},
	components: {},
	mixins: { FileOperationMixin },
	methods: {
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
		async startParsingMessages(data) {
			let chatsArr = Object.keys(data.chats)
			let mpp = new MessagePageParser()
            let chatsArrLen = chatsArr.length
            let c = 0
			for (let id of chatsArr) {
                c++
				this.progress = (~~(c / chatsArrLen) * 100)
				for (let i = 0, l = data.chatFiles[id]; i <= l; i++) {
					let mpd = mpp.parse(
						await data.contentAdapterInstance.getFileContent(data.indexDir + id + '/messages' + i + '.html')
					)
					console.log(mpd)
				}
			}
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

<template lang="html">
    <div id="app">
    <VKView activePanel="menu" v-if="viewSelected == 0">
        <Panel id="menu">
			<PanelHeader>Добро пожаловать</PanelHeader>
            <br>
			<Group id="homescreen-block">
				<Div>
                    Это приложение позволяет осуществлять быстрый поиск по сообщеням, выгруженным с помощью экспорта данных из ВКонтакте.
                    При первом запуске необходимо выбрать папку с сообщениями, импортировать и проиндексировать их. Все данные будут храниться локально.
                    Отключите интернет на устройстве, чтобы в этом убедиться. Исходный код данного проекта открыт и доступен тут.
				</Div>
				<Div>
                    <Button @click="selectView(1)">Импортировать сообщения</Button>
				</Div>
                <Div>
                    <Button @click="selectView(2)">Перейти к поиску</Button>
                </Div>
			</Group>
		</Panel>
    </VKView>
    <App v-if="viewSelected == 1" v-on:gohome="viewSelected = 0"/>
    <ViewerApp v-if="viewSelected == 2" v-on:gohome="viewSelected = 0"/>
    </div>
</template>

<script>
import App from '../App.vue'
import ViewerApp from './ViewerApp.vue'

export default {
    data(){
        return {
            'viewSelected': 0
        }
    },
    components: {App, ViewerApp},
    methods: {
        selectView(view) {
            this.viewSelected = view
        }
    }
}
</script>

<style lang="css" scoped>
</style>

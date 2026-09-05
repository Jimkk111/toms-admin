import { createApp } from 'vue'
import App from './App.vue'
import { pinia } from './stores'
import router from './router'
import 'normalize.css'
import '@/styles/index.scss'
import '@/styles/icon/iconfont.css'
import 'virtual:svg-icons-register'
import './permission'

createApp(App).use(pinia).use(router).mount('#app')

import { createPinia } from 'pinia'

//引入pinia数据持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
//使用pinia数据持久化插件
pinia.use(piniaPluginPersistedstate)

export { pinia }
export * from './app'
export * from './userInfo'
export * from './modal'
export * from './draft'
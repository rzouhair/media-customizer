import { setupLayouts } from 'virtual:generated-layouts'
import Naive from 'naive-ui'
import { createHead } from '@vueuse/head'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import generatedRoutes from '~pages'

import './styles/main.css'
import './styles/reset.css'
import 'uno.css'

const routes = setupLayouts(generatedRoutes)

// https://github.com/antfu/vite-ssg
/* export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  (ctx) => {
    // install all modules under `modules/`

    ctx.app.use(Naive)
    Object.values(import.meta.globEager('./modules/*.ts')).forEach(i => i.install?.(ctx))
  },
) */

const messages = Object.fromEntries(
  Object.entries(
    import.meta.globEager('../../locales/*.y(a)?ml'))
    .map(([key, value]) => {
      const yaml = key.endsWith('.yaml')
      return [key.slice(14, yaml ? -5 : -4), value.default]
    }),
)

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages,
})

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const head = createHead()

const app = createApp(App)
app.use(router)
app.use(head)
app.use(i18n)
app.use(Naive)
app.mount('#app')


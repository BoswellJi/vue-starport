import type { Plugin } from 'vue'
import { Starport, StarportCarrier } from './components'
import { InjectionOptions } from './constants'
import type { StarportOptions } from './types'

export function StarportPlugin(defaultOptions: StarportOptions = {}): Plugin {
  return {
    install(app) {
      // 给vue应用注册参数
      app.provide(InjectionOptions, defaultOptions)
      app.component('Starport', Starport)
      app.component('StarportCarrier', StarportCarrier)
    },
  }
}

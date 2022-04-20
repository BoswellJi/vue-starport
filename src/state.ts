import { reactive } from 'vue'
import type { Component } from 'vue'
import type { StarportOptions } from './types'
import type { StarportInstance } from './instance'
import { createStarportInstance } from './instance'

export function createInternalState(options: StarportOptions) {
  // portMap是响应式对象，对他的操作会进行响应式处理
  const portMap = reactive(new Map<string, StarportInstance>())

  /**
   * 获取星港实例
   * @param port 星港标识
   * @param component 星港插槽组件实例
   * @returns
   */
  function getInstance(port: string, component: Component) {
    let context = portMap.get(port)
    if (!context) {
      // 返回的也是响应式对象，根据星港标识，插槽组件实例，全局配置选型创建，星港实例
      context = createStarportInstance(port, component, options)
      portMap.set(port, context)
    }
    context.component = component

    return context
  }

  function dispose(port: string) {
    portMap.get(port)?.scope.stop()
    portMap.delete(port)
  }

  return {
    portMap,
    dispose,
    getInstance,
  }
}

export type InternalState = ReturnType<typeof createInternalState>

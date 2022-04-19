import { isObject } from '@vueuse/core'
import type { DefineComponent } from 'vue'
import { defineComponent, h, inject, isVNode, markRaw, onMounted, ref } from 'vue'
import { InjectionState } from '../constants'
import { proxyProps } from '../options'
import type { StarportProps } from '../types'
import { StarportProxy } from './StarportProxy'
 * 所有飞行的星港组件的运载组件应该在App.vue中只触发一次
    // 注入参数
        // 将 [[key,val],...]，生成所有飞行器组件;初始化时没有portMap，所以不会执行StarportCraft逻辑

/**
 * The proxy component wrapper for the Starport.
 */
export const Starport = defineComponent({
  name: 'Starport',
  inheritAttrs: true,
  props: proxyProps,
  setup(props, ctx) {
    const state = inject(InjectionState)

    if (!state)
      throw new Error('[Vue Starport] Failed to find <StarportCarrier>, have you initialized it?')

    const isMounted = ref(false)
    onMounted(() => {
      isMounted.value = true
    })

    return () => {
      const slots = ctx.slots.default?.()

      if (!slots)
        throw new Error('[Vue Starport] Slot is required to use <Starport>')
      if (slots.length !== 1)
        throw new Error(`[Vue Starport] <Starport> requires exactly one slot, but got ${slots.length}`)

      // 插槽组件
      const slot = slots[0]
      // 组件类型(options对象)
      let component = slot.type as any

      // 不是组件，只是vnode/虚拟节点，转换为组件
      if (!isObject(component) || isVNode(component)) {
        component = {
          render() {
            return slots
          },
        }
      }

      return h(StarportProxy, {
        // 星港props
        ...props,
        // 星港标识
        key: props.port,
        // 将组件定义为不可响应式对象
        component: markRaw(component),
        // 插槽组件的props
        props: slot.props,
      })
    }
  },
}) as DefineComponent<StarportProps>

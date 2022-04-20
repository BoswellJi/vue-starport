import type { DefineComponent, StyleValue } from 'vue'
import { Teleport, computed, defineComponent, h, inject, mergeProps } from 'vue'
import { InjectionState } from '../constants'
import type { StarportCraftProps } from '../types'

/**
 * @internal
 */
export const StarportCraft = defineComponent({
  name: 'StarportCraft',
  props: {
    port: { // 星港标识
      type: String,
      required: true,
    },
    component: { // 星港插槽组件实例
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const state = inject(InjectionState)!
    // 获取星港组件的上下文实例
    const sp = computed(() => state.getInstance(props.port, props.component))
    // 获取港组件的id
    const id = computed(() => sp.value.el?.id || sp.value.id)
    // 获取飞行器的样式
    const style = computed((): StyleValue => {
      // 起飞了多少毫秒
      const elapsed = Date.now() - sp.value.liftOffTime
      // 计算过渡时间
      const duration = Math.max(0, sp.value.options.duration - elapsed)
      // 动画信息及操作
      const rect = sp.value.rect
      // 基础样式
      const style: StyleValue = {
        position: 'absolute',
        left: 0,
        top: 0,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        transform: `translate3d(${rect.left}px,${rect.top}px,0px) scale3d(.5,.5,.5)`,
        background: 'red',
      }
      // 星港不可见 || 星港不存在 ，直接将飞行器隐藏
      if (!sp.value.isVisible || !sp.value.el) {
        return {
          ...style,
          zIndex: -1,
          display: 'none',
        }
      }
      // 星港已经落地，直接将飞行器隐藏
      if (sp.value.isLanded) {
        style.display = 'none'
      }
      else {
        // 星港在飞行中，过渡
        Object.assign(style, {
          transitionProperty: 'all',
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: sp.value.options.easing,
        })
      }
      return style
    })

    const additionalProps = process.env.NODE_ENV === 'production'
      ? {}
      : {
        // 过渡结束事件
        onTransitionend(e: TransitionEvent) {
          if (sp.value.isLanded)
            return
          console.warn(`[Vue Starport] Transition duration of component "${sp.value.componentName}" is too short (${e.elapsedTime}s) that may cause animation glitches. Try to increase the duration of that component, or decrease the duration the Starport (current: ${sp.value.options.duration / 1000}s).`)
        },
      }

    return () => {
      // 星港组件落地 && dom元素
      const teleport = !!(sp.value.isLanded && sp.value.el)
      return h(
        'div',
        {
          'style': style.value,
          'data-starport-craft': sp.value.componentId,
          'data-starport-landed': sp.value.isLanded ? 'true' : undefined,
          'data-starport-floating': !sp.value.isLanded ? 'true' : undefined,
          'onTransitionend': sp.value.land,
        },
        h(
          Teleport,
          {
            // 飞行器落地,将运载的组件通过Teleport放到指定位置
            to: teleport ? `#${id.value}` : 'body',
            disabled: !teleport,
          },
          // 星港插槽组件实例, 飞行过程中为空
          h(sp.value.component as any,
            mergeProps(additionalProps, sp.value.props),
          ),
        ),
      )
    }
  },
}) as DefineComponent<StarportCraftProps>

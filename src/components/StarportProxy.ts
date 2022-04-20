import type { DefineComponent } from 'vue'
import { computed, defineComponent, h, inject, mergeProps, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { InjectionState } from '../constants'
import { proxyProps } from '../options'
import type { StarportProxyProps } from '../types'

/**
 * @internal
 */
export const StarportProxy = defineComponent({
  name: 'StarportProxy',
  props: {
    props: { // 星港插槽组件的props
      type: Object,
      default: () => ({}),
    },
    component: { // 星港插槽组件实例
      type: Object,
      required: true,
    },
    ...proxyProps, // 星港组件props
  },
  setup(props, ctx) {
    // 获取搬运工注册的状态
    const state = inject(InjectionState)!
    // 通过星港标识获取/存储插槽组件的组件实例
    const sp = computed(() => state.getInstance(props.port, props.component))
    // 存储模板ref的dom对象
    const el = ref<HTMLElement>()
    // 生成星港的插槽组件的标识id
    const id = sp.value.generateId()
    // 是否被安装
    const isMounted = ref(false)

    // first time appearing, directly landed
    // 第一次出现，直接落地
    if (!sp.value.isVisible) {
      // 直接落地
      sp.value.land()
      // 标记已被安装
      isMounted.value = true
    }

    onMounted(async() => {
      // 在同一个组件中只能使用一次port的标识,不能重复,因为`sp`是通过port来获取的
      if (sp.value.el) {
        if (process.env.NODE_ENV === 'development')
          console.error(`[Vue Starport] Multiple proxies of "${sp.value.componentName}" with port "${props.port}" detected. The later one will be ignored.`)
        return
      }
      // 将安装的星港代理组件dom元素赋值给星港上下文实例
      sp.value.el = el.value
      await nextTick()
      isMounted.value = true
      // 开始动画
      sp.value.rect.update()
      // warn if no width or height
      if (process.env.NODE_ENV === 'development') {
        if (sp.value.rect.width === 0 || sp.value.rect.height === 0) {
          const attr = sp.value.rect.width === 0 ? 'width' : 'height'
          console.warn(`[Vue Starport] The proxy of component "${sp.value.componentName}" has no ${attr} on initial render, have you set the size for it?`)
        }
      }
    })
    onBeforeUnmount(async() => {
      sp.value.rect.update()
      sp.value.liftOff()
      sp.value.el = undefined
      isMounted.value = false

      if (sp.value.options.keepAlive)
        return

      await nextTick()
      await nextTick()
      if (sp.value.el)
        return

      // dispose
      state.dispose(sp.value.port)
    })

    watch(
      () => props,
      async() => {
        // 给teleport一个周期时间飞行,然后更新props
        // wait a tick for teleport to lift off then update the props
        if (sp.value.props)
          await nextTick()
          // 星港插槽组件的props , 星港插槽组件实例+星港组件props
        const { props: childProps, ...options } = props
        sp.value.props = childProps || {}
        // 这里是代理组件的props
        sp.value.setLocalOptions(options)
      },
      { deep: true, immediate: true },
    )

    return () => {
      const { initialProps, mountedProps, ..._attrs } = props
      const attrs = mergeProps(
        _attrs as any,
        // 判断是否已经安装还是已安装之前时期
        (isMounted.value ? mountedProps : initialProps) || {},
      )

      return h(
        'div',
        mergeProps(attrs, {
          id,
          'ref': el,
          'data-starport-proxy': sp.value.componentId,
          'data-starport-landed': sp.value.isLanded ? 'true' : undefined,
          'data-starport-floating': !sp.value.isLanded ? 'true' : undefined,
        }),
        ctx.slots.default
          ? h(ctx.slots.default)
          : undefined,
      )
    }
  },
}) as DefineComponent<StarportProxyProps>

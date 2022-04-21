import { computed, effectScope, nextTick, reactive, ref, watch } from 'vue'
import type { Component, Ref } from 'vue'
import { useElementBounding } from './composables'
import { defaultOptions } from './options'
import type { ResolvedStarportOptions, StarportOptions } from './types'
import { getComponentName, kebabCase, nanoid } from './utils'

/**
 * 有星港动画元素的各种信息，通过这些信息来做动画
 * @internal
 */
export function createStarportInstance(
  port: string,
  component: Component,
  inlineOptions: StarportOptions = {},
) {
  const componentName = getComponentName(component)
  const componentId = kebabCase(componentName) || nanoid()
  // 星港代理组件的根节点dom
  const el: Ref<HTMLElement | undefined> = ref()
  // 插槽组件的props
  const props: Ref<any> = ref(null)
  // 是否落地
  const isLanded: Ref<boolean> = ref(false)
  // 是否可见
  const isVisible = ref(false)
  // 副作用作用域
  const scope = effectScope(true)
  const localOptions = ref<StarportOptions>({})
  const options = computed<ResolvedStarportOptions>(() => ({
    ...defaultOptions, // 星港默认props
    ...inlineOptions, // 注册插件时传递的props
    ...localOptions.value,
  }))
  const liftOffTime = ref(0)

  let rect: ReturnType<typeof useElementBounding> = undefined!

  scope.run(() => {
    rect = useElementBounding(el)
    // 当el被赋值后，展示这个飞行器
    watch(el, async (v) => {
      if (v)
        isVisible.value = true
      await nextTick()
      if (!el.value)
        isVisible.value = false
    })
  })

  const portId = kebabCase(port)
  function generateId() {
    return `starport-${componentId}-${portId}-${nanoid()}`
  }

  const id = generateId()

  return reactive({
    el, // 星港代理组件的dom对象
    id, // 星港代理组件的id
    port, // 星港组件标识
    props, // 星港插槽元素的props
    rect, // 元素的尺寸位置信息,以及动画操作
    scope, // 副作用作用域对象
    isLanded, // 星港是否落地
    isVisible, // 星港是否可见
    options, // 星港选项
    liftOffTime, // 开始飞行时间
    component, // 星港插槽组件的实例
    componentName, // 组件名称
    componentId, // 根据组件名生成的组件id
    generateId, // 星港id
    setLocalOptions(options: StarportOptions = {}) {
      localOptions.value = JSON.parse(JSON.stringify(options))
    },
    elRef() {
      return el // 星港代理组件的dom对象
    },
    // 起飞，起飞的星港元素
    liftOff() {
      // 未落地，不处理
      if (!isLanded.value)
        return
      // 标记星港未落地
      isLanded.value = false
      // 起飞时的时间
      liftOffTime.value = Date.now()
      // 开始动画
      rect.listen()
      // console.log('lift off', port)
    },
    // 落地，降落的星港元素
    land() {
      // 已经落地的不处理
      if (isLanded.value)
        return
      // 标记星港是否落地
      isLanded.value = true
      // 暂停飞行动画
      rect.pause()
      // console.log('land', port)
    },
  })
}

export type StarportInstance = ReturnType<typeof createStarportInstance>

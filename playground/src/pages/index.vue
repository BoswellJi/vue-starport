<script setup lang="ts">
import { images } from '~/composables/data'

const mode = useStorage('starport-image-mode', false)
const toggle = useToggle(mode)
let disabled = $ref(true)

function btnDisabled() {
  disabled = !disabled
}

</script>

<template>
  <div px6 py-2>
    <TheLogo w40 h40 ma />
    <p pb5>
      Shared component across routes with animations
    </p>
    <div p5 flex="~ gap-2" justify-center>
      <button btn @click="toggle(); btnDisabled();">
        Toggle Size
      </button>
    </div>
    <div id="gallery" grid="~ cols-1 sm:cols-2 md:cols-3 lg:cols-4 xl:cols-6" px-10 justify-center>
      <!-- 切换路由,通过click事件切换路由组件 -->
      <RouterLink v-for="img, idx of images" :key="img" :class="`image-${idx}`" :to="`/${idx}`">
        <Starport :port="String(idx)" :style="{ width: 150 + 'px', height: 150 + 'px' }">
          <MyComponent :class="mode ? 'rounded shadow-lg' : ''" :index="idx" />
        </Starport>
      </RouterLink>
    </div>
    <div p4>
      <div font-600>
        Other Examples
      </div>
      <div flex="~ gap-2" justify-center>
        <RouterLink to="/in-page" hover:text-teal5>
          In page transitions
        </RouterLink>
        <div op20>
          /
        </div>
        <RouterLink to="/transfer-list" hover:text-teal5>
          Transfer List
        </RouterLink>
      </div>
    </div>
    <!-- for cypress -->
    <div>
      <RouterLink id="link-warning-no-size" to="/warning-no-size">
        Warning No Size
      </RouterLink>
      <RouterLink id="link-warning-port-conflict" to="/warning-port-conflict">
        Warning Port Conflict
      </RouterLink>
      <RouterLink id="link-warning-no-size" to="/test">
        test
      </RouterLink>
    </div>
    <div id="teleport1">
      <Teleport to="#tele1" :disabled="disabled">
        <div>hhhh tele1</div>
      </Teleport>
    </div>

    <div class="one" :class="{ two: !disabled }"></div>
  </div>
</template>

<style>
.one {
  width: 100px;
  height: 100px;
  background: red;
  transition: all 1s;
}

.two {
  transition: all 1s;
  width: 200px;
}
</style>

<script setup lang="ts">
import { Starport } from 'vue-starport'

</script>

<template>
  <div>
    <Starport port="0" w-20 h-20>
      <MyComponent :index="2" />
    </Starport>
  </div>
</template>

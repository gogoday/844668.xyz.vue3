<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { basicSetup, EditorView } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'

const target = useTemplateRef('target')

const originJSONString = ref('')
const errorClass = ref('')

watch(originJSONString, (origin) => {
  let doc = '{}'
  try {
    doc = JSON.stringify(JSON.parse(origin), null, 2)
  } catch (e) {
    // console.log(e)
    if (target.value) {
      target.value.innerText = e.message
      errorClass.value = 'error'
    }
    return
  }
  if (!target.value) {
    return
  }
  errorClass.value = ''
  target.value.innerHTML = ''
  new EditorView({
    doc,
    extensions: [basicSetup, javascript()],
    parent: target.value,
  })
})
</script>

<template>
  <div class="text-xl m-xl ml-0">JSON 字符串格式化工具</div>
  <div class="flex">
    <div class="grow basis-20rem shrink-0">
      <div>字符串：</div>
      <textarea
        v-model="originJSONString"
        class="w-100% min-h-400px border border-solid border-[#767676] rounded-3px p-2px"
        name="origin"
        id="origin"
      ></textarea>
    </div>
    <div class="grow basis-20rem shrink-0 ml-20px">
      <div>格式化：</div>
      <div
        class="min-h-400px border border-solid border-[#767676] rounded-3px p-2px"
        :class="errorClass"
        ref="target"
      ></div>
    </div>
  </div>
</template>

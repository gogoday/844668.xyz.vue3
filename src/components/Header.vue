<script setup lang="ts">
import { ref } from 'vue'

const activeIndex = ref(0)

function handleSelect() {}
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    class="bg-green-50"
    mode="horizontal"
    @select="handleSelect"
  >
    <el-menu-item index="1">
      <RouterLink to="/">JSON 工具</RouterLink>
    </el-menu-item>
    <el-menu-item index="2">
      <RouterLink to="/sudo">数独</RouterLink>
    </el-menu-item>
    <!-- <el-sub-menu index="2">
      <template #title>Workspace</template>
      <el-menu-item index="2-1">item one</el-menu-item>
      <el-menu-item index="2-2">item two</el-menu-item>
      <el-menu-item index="2-3">item three</el-menu-item>
      <el-sub-menu index="2-4">
        <template #title>item four</template>
        <el-menu-item index="2-4-1">item one</el-menu-item>
        <el-menu-item index="2-4-2">item two</el-menu-item>
        <el-menu-item index="2-4-3">item three</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="3" disabled>Info</el-menu-item>
    <el-menu-item index="4">Orders</el-menu-item> -->
  </el-menu>
</template>

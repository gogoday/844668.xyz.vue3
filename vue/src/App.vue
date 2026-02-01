<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header><Header></Header></el-header>
      <el-main>
        <RouterView />
      </el-main>
      <el-footer><Footer></Footer></el-footer>
    </el-container>
  </div>
</template>

<style scoped></style>

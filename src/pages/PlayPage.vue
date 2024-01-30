<script lang="ts" setup>
  const row = 20;
  const column = 10;
  const filed = new Array(row);

  for (let i = 0 ; i < row ;i++){
    const filedColumn = new Array(column).fill(0);
    filed[i] = filedColumn;
  }

</script>

<template>
  <h1>プレイ画面</h1>
  <h2>ユーザ名: {{ $route.query.name }}</h2>

  <div class="container">
    <table class="filed" style="border-collapse: collapse;">
      <tr v-for="(row,y) in filed" :key="y" >
        <td
          class="block"
          v-for="(col,x) in row" :key="() => `${x}${y}`" >
        </td>
      </tr>
    </table>
  </div>
</template>

<!-- テトリスのフィールドのデザインを整えるためのスタイルシート -->
<!-- scoped 対象のコンポーネント内のみ適用-->
<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: stretch;
}
.field {
  border: ridge 0.4em #2c3e50;
  border-top: none;
} 
.block {
  width: 1em;
  height: 1em;
  border: 0.1px solid #95a5a6;
}
</style>
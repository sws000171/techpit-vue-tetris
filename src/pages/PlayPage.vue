<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import { Tetromino,TETROMINO_TYPE } from '../common/Tetromino';
import { Field } from '../common/Field';

//field生成（reactiveではない）
//new した段階でField内のコンストラクタで、空fieldを生成する
let staticField = new Field();
//落下中のfield保持用
const tetris = reactive({
  field: new Field(),
});

const tetromino = reactive({
  current: Tetromino.random(),
  position: {x:3,y:0},
});

//最初から画面にテトリミノを表示したいので解りやすくonMounted
onMounted(()=>{
  tetris.field.update(tetromino.current.data, tetromino.position);
})

//ブロック文字列の色情報を返すメソッド
const classBlockColor = (_x:number, _y:number): string => {
  const type = tetris.field.data[_y][_x];
  if (type > 0){
    return Tetromino.id(type as TETROMINO_TYPE);
  }
  const { x, y } = tetromino.position;
  const { data } = tetromino.current;
 
  if (y <= _y && _y < y + data.length) {
    const cols = data[_y - y];
    if (x <= _x && _x < x + cols.length) {
      if (cols[_x - x] > 0) {
        return Tetromino.id(cols[_x - x] as TETROMINO_TYPE);
      }
    }
  }
  return "";
}

const canDropCurrentTetromino = (): boolean => {
  const { x, y } = tetromino.position;
  const droppedPosition = {x, y: y + 1};
 
  const data = tetromino.current.data;
  //1個下に動かしたときの判定
  return tetris.field.canMove(data, droppedPosition);
}
 
const nextTetrisField = () => {
  const data = tetromino.current.data;
  const position = tetromino.position;
 
  tetris.field.update(data, position);
  //field再生成（移動中のデータで）
  staticField = new Field(tetris.field.data);
  //この命令はおそらく不要↓setInterval()と被る
  //tetris.field = Field.deepCopy(staticField);
  
  //次のテトロミノ
  tetromino.current = Tetromino.random();
  tetromino.position = { x: 3, y: 0 };
}

//１秒毎に下（y）に１個落とす
setInterval(() => {
  
  tetris.field = Field.deepCopy(staticField);
  if (canDropCurrentTetromino()){
    tetromino.position.y++;
  }else{
    nextTetrisField();
  }
}, 1 * 1000);

</script>

<template>
  <h1>プレイ画面</h1>
  <h2>ユーザ名: {{ $route.query.name }}</h2>

  <div class="container">
    <table class="field" style="border-collapse: collapse;">
      <tr v-for="(row, y) in tetris.field.data" :key="y">
        <!-- テトリスのフィールドの各マス目にその状態を描画する (0: 空白, 1: I-テトリミノ, etc.)
             クラスはブロック値に応じて設定し色を変える -->
        <td
          class="block"
          v-for="x in row" :key="() => `${x}${y}`" 
            v-bind:class="classBlockColor(x,y)">
      </td>
      </tr>
    </table>
  </div>
</template>

<!-- テトリスのフィールドのデザインを整えるためのスタイルシート -->
<!-- scoped 対象のコンポーネント内のみ適用-->
<!-- スタイルシートに SCSS 記法 (Sass) を利用する -->
<style lang="scss" scoped>
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
/*
 各テトリミノに対応した色を扱うクラス定義
 .block-i, .block-o のようにクラスが定義される
*/
  &-i {
    background: #3498db;
  }
  &-o {
    background: #f1c40f;
  }
  &-t {
    background: #9b59b6;
  }
  &-j {
    background: #1e3799;
  }
  &-l {
    background: #e67e22;
  }
  &-s {
    background: #2ecc71;
  }
  &-z {
    background: #e74c3c;
  }
}
</style>
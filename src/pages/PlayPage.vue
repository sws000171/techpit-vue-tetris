<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive } from 'vue';
import { Tetromino,TETROMINO_TYPE } from '../common/Tetromino';
import { Field } from '../common/Field';
import TetrominoPreviewComponent  from '../components/TetrominoPreviewComponent.vue';

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
  next: Tetromino.random(),
});

//最初から画面にテトリミノを表示したいので解りやすくonMounted
onMounted(()=>{
  resetDrop();
  document.addEventListener('keydown',onKeyDown);
})

onBeforeUnmount(()=>{
  document.removeEventListener('keydown',onKeyDown);
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
  tetris.field = Field.deepCopy(staticField);
  
  //次のテトロミノ
  //リアクティブで次のテトロミノを作成
  tetromino.current = tetromino.next;
  tetromino.next = Tetromino.random();
  //tetromino.current = Tetromino.random();
  tetromino.position = { x: 3, y: 0 };
}

const onKeyDown = (e:KeyboardEvent) => {
  switch (e.key) {
    case "Down":
    case "ArrowDown":
      //  判定して移動可能なら下に１個落とす
      if (canDropCurrentTetromino()){
        tetromino.position.y++;
        resetDrop();
      }else{
        nextTetrisField();
      }
      break;
    case "Up":
    case "ArrowUp":
      while(canDropCurrentTetromino()){
        tetromino.position.y++;
        resetDrop();
      }
      nextTetrisField();
      break;
    case "Left":
    case "ArrowLeft":
    {
      const data = tetromino.current.data;
      const {x,y} = tetromino.position;
      const leftPosition = {x:x - 1,y:y};
      if (tetris.field.canMove(data,leftPosition)){
        tetromino.position.x--;
      }
    }
    break;
    case "Right":
    case "ArrowRight":
    {
      const data = tetromino.current.data;
      const {x,y} = tetromino.position;
      const RightPosition = {x:x + 1,y:y};
      if (tetris.field.canMove(data,RightPosition)){
        tetromino.position.x++;
      }
    }
      break;
  }
}

// 1 秒ごとに 1 マス下に落下する関数を作成する関数
const resetDropInterval = () =>{
  // 1秒ごとに発火する関数の識別子・状態を持つ
  let intervalId = -1;

  return () => {
    //解除（初回以外、初回は-1なので）
    if (intervalId !== -1) clearInterval(intervalId);
    //clearInterval(intervalId);
    //１秒毎に下（y）に１個落とす
    intervalId = setInterval(() => {
      tetris.field = Field.deepCopy(staticField);
      if (canDropCurrentTetromino()){
        tetromino.position.y++;
      }else{
        nextTetrisField();
      }
    }, 1 * 1000);
  };
};
const resetDrop = resetDropInterval();


</script>

<template>
  <h1>プレイ画面</h1>
  <h2>ユーザ名: {{ $route.query.name }}</h2>

  <div class="container">
    <div class="tetris">
      <table class="field" style="border-collapse: collapse;">
        <tr v-for="(row, y) in tetris.field.data" :key="y">
          <!-- テトリスのフィールドの各マス目にその状態を描画する (0: 空白, 1: I-テトリミノ, etc.)
               クラスはブロック値に応じて設定し色を変える -->
          <td
            class="block"
            v-for="(col, x) in row" :key="() => `${x}${y}`" 
              v-bind:class="classBlockColor(x,y)">
          </td>
        </tr>
      </table>
    </div>
    <div class="information">
      <TetrominoPreviewComponent v-bind:tetromino="tetromino.next.data"/>
    </div>
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
 /** テトリスに関する情報をテトリスのフィールドの右に表示する **/
.information {
  margin-left: 0.5em;
}
</style>
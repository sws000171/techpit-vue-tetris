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
  score: 0,
});

const tetromino = reactive({
  current: Tetromino.random(),
  position: {x:3,y:0},
  rotate: 0,
  next: Tetromino.random(),
});

onMounted(()=>{
  document.addEventListener('keydown',onKeyDown);
  resetDrop();
})

onBeforeUnmount(()=>{
  document.removeEventListener('keydown',onKeyDown);
})

// 落下中のテトリミノ (二次元配列) を `rotate` 回、回転させた結果を取得する
const currentTetrominoData = () =>{
  return Tetromino.rotate(tetromino.rotate, tetromino.current.data);
}

//ブロック文字列の色情報を返すメソッド
const classBlockColor = (_x:number, _y:number): string => {
  const type = tetris.field.data[_y][_x];
  if (type > 0){
    return Tetromino.id(type as TETROMINO_TYPE);
  }
  const { x, y } = tetromino.position;
  //const { data } = tetromino.current;
  const data = currentTetrominoData();
 
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

//１ライン下に動かす（判定）メソッド
const canDropCurrentTetromino = (): boolean => {
  const { x, y } = tetromino.position;
  const droppedPosition = {x, y: y + 1};
 
  //const data = tetromino.current.data;
  const data = currentTetrominoData();
  //1個下に動かしたときの判定
  return tetris.field.canMove(data, droppedPosition);
}
 
//次のテトロミノの作成
const nextTetrisField = () => {
  //const data = tetromino.current.data;
  const data = currentTetrominoData();
  const position = tetromino.position;
 
  tetris.field.update(data, position);
  const {field,score} = deleteLine();

  //field再生成（移動中のデータで）
  //staticField = new Field(tetris.field.data);
  staticField = new Field(field);

  //この命令はおそらく不要↓setInterval()と被る
  tetris.field = Field.deepCopy(staticField);

  tetris.score += score;
  
  //次のテトロミノ
  //リアクティブで次のテトロミノを作成
  tetromino.current = tetromino.next;
  tetromino.next = Tetromino.random();
  //tetromino.current = Tetromino.random();
  tetromino.rotate = 0;
  tetromino.position = { x: 3, y: 0 };
}

//キーイベント部分
const onKeyDown = (e:KeyboardEvent) => {
  switch (e.key) {
    case " ":
      {
        const nextRotate = (tetromino.rotate + 1) % 4;
        //90度回転
        const data = Tetromino.rotate(nextRotate, tetromino.current.data);
        //90度回転した状態で動かせるかを判定
        if (tetris.field.canMove(data, tetromino.position)) {
          //動かせるのならspaceを押した回数/4を設定
          tetromino.rotate = nextRotate;
        }
      }
      break;
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
        //const data = tetromino.current.data;
        const data = currentTetrominoData();
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
        //const data = tetromino.current.data;
        const data = currentTetrominoData();
        const {x,y} = tetromino.position;
        const RightPosition = {x:x + 1,y:y};
        if (tetris.field.canMove(data,RightPosition)){
          tetromino.position.x++;
        }
      }
      break;
  }
}

//ライン削除メソッド
const deleteLine = () =>{
  let score = 0;
  const field = tetris.field.data.filter((row)=>{
    if (row.every(col => col > 0)){
      score++;
      return false;
    }
    return true;
  });

  for (let i = 0; i < score; i++) {
    field.unshift(new Array(field[0].length).fill(0));
  }
  return { score, field };
};

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
      <ul class="data">
        <i>スコア：{{tetris.score}}</i>
      </ul>
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
position: relative;
  margin-left: 0.5em;
}
ul.data {
    list-style: none;
    position: absolute;
    font-size: 1.3em;
    padding-left: 0;
    bottom: 0;
  }
</style>
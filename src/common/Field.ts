export class Field {
  private field: number[][]

  //data? で引数省略でも動く
  constructor(data?: number[][]){
    if (data){
      this.field = data;
    }else{
      // 3-1 で作成したテトリスのフィールドを定義するコード（初期化）
      const row = 20;
      const column = 10;

      const data = new Array<Array<number>>(row);
      //fill は配列の初期化（0で初期化）
      for (let i = 0; i < row; i++) {
        const fieldColumn = new Array(column).fill(0);
        data[i] = fieldColumn;
      }
      this.field = data;
    }
  }

  // 自身のテトリスのフィールドの二次元配列を取得する
  get data(): number[][]{  
    return this.field;
  } 
  // テトリスのフィールドで落下中のテトリミノの状態を反映する
  update(data: number[][],position:{x:number,y:number}): void {
    for (var i = 0; i < data.length; i++){
      const cols = data[i];
      for (var j = 0; j < cols.length; j++){
        const block = cols[j];
        //ブロックだったら（ブロックの種類、0超の値を設定する）
        if (block > 0) {
          this.field[i + position.y][j + position.x] = block;
        }
      }
    }
  }
  // テトリスのフィールドをディープコピーするために利用する
  // field 引数には、クローンしたいテトリスのフィールドを指定する
  static deepCopy(field:Field): Field {
    const data = field.data;
    const newFieldData = new Array<Array<number>>(data.length);
    for (const [i, rows] of data.entries()) {
      newFieldData[i] = new Array(rows.length);
      for (const [j] of rows.entries()) {
        newFieldData[i][j] = data[i][j];
      }
    }
    return new Field(newFieldData);
  }
}
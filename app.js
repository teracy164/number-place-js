const express = require("express");
const bodyParser = require("body-parser");
const questionService = require('./services/questions');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// 静的ファイル公開用
app.use(express.static('public'));

// 初期表示画面
app.get("/", (req, res) => {
  // 出題する問題は固定
  const level = 'very-easy';

  // 問題を取得
  const [question, fixedCells, questionNum] = questionService.getQuestion(level);

  // 初期データで画面を表示
  res.render("index.ejs", {
    level: level,
    questionNum: questionNum,
    inputs: question,
    fixedCells: fixedCells,
    result: "",
  });
});

// 判定
app.post("/check", (req, res) => {
  // インプットパラメータの取り出し
  const level = req.body.level;
  const questionNum = Number(req.body.questionNum);
  const inputValues = req.body.inputs.map((value) => Number(value));

  // 2次元配列に変換
  const inputs = questionService.to2DArray(inputValues);

  // 入力状態をサーバーログに出力
  console.log('=================')
  inputs.forEach(cols => console.log(cols.map(c => c || ' ').join(',')));
  console.log('=================')

  // 判定
  const check = require('./services/check');
  const errors = check(inputs);

  let result = '';
  if (errors.length) {
    for (let i = 0; i < errors.length; i++) {
      const row = errors[i].row ? errors[i].row + '行' : '';
      const col = errors[i].col ? errors[i].col + '列' : '';
      result += row + col + '　' + errors[i].message + '\n';
    }
  } else {
    result = 'クリア!'
  }

  // 問題の読み込み
  const [question, fixedCells] = questionService.getQuestion(level, questionNum);

  // 結果をHTMLに組み込んで返却
  res.render("index.ejs", {
    level: level,
    questionNum: questionNum,
    inputs: inputs,
    fixedCells: fixedCells,
    result: result,
  });
});

app.listen(process.env.PORT || 3000);
console.log("listen: http://localhost:3000");

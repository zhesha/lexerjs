![Build Status](https://travis-ci.com/zhesha/lexerjs.svg?branch=master)
```
var tokens = lexer("5+5", [
  {
    name: "number",
    tester: function(tested) {
      var regResult = tested.match(/\d/);
      if (regResult && regResult[0] == tested) {
        return lexerResults.posible;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "sign",
    tester: function(tested) {
      if (tested == "+") {
        return lexerResults.exect;
      } else {
        return lexerResults.none;
      }
    }
  }
]);
```

returns:
```
[
  { type: "number", value: "5" },
  { type: "sign", value: "+" },
  { type: "number", value: "5" }
]
```

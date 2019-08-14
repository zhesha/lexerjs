![Build Status](https://travis-ci.com/zhesha/lexerjs.svg?branch=master)

Lexerjs is simple lexical analyzer.

```
var tokens = lexer("5+5", [
  {
    name: "number",
    tester: function(tested) {
      var regResult = tested.match(/\d/);
      if (regResult && regResult[0] == tested) {
        return lexerResults.possible;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "sign",
    tester: function(tested) {
      if (tested == "+") {
        return lexerResults.exact;
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

It have only one function `lexer` what receive string and array of rules, and returns array of tokens.

Each rule must have `name`, what will be used as token type, and `tester`. Tester is a function what receive string what must be tested and return one of 'lexerResults'.
`lexerResults.none` - if tested string doesn't fit to this rule.
`lexerResults.start` - if token can start as tested string, but it must contains some more characters.
`lexerResults.exact` - if tested string is exact a token and can't be expanded with extra character.
`lexerResults.possible` - if tested string is a token and it can contain more character as well.
`lexerResults.skip` - if tested string is a token but it should not be in the result list.

Lexer returns array of tokens, each token have a `type`, and a `value` what is a part of original string what fit to the rule.

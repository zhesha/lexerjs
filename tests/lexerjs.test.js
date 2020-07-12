var lexerjs = require("../lexerjs");
var lexer = lexerjs.lexer;
var lexerResults = lexerjs.lexerResults;

test("arifmetic expretion tokenize successful", function() {
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
  expect(tokens.length).toBe(3);
  expect(tokens).toEqual([
    { type: "number", value: "5" },
    { type: "sign", value: "+" },
    { type: "number", value: "5" }
  ]);
});

test("variable statement tokenize successful", function() {
  var tokens = lexer("var var1 = 1;", variableStatementRules);
  expect(tokens.length).toBe(5);
  expect(tokens).toEqual([
    { type: "var_kw", value: "var" },
    { type: "identifier", value: "var1" },
    { type: "operator", value: "=" },
    { type: "number", value: "1" },
    { type: "terminator", value: ";" }
  ]);
});

test("variable statement if identifier is start of keyword", function() {
  var tokens = lexer("var va = 1;", variableStatementRules);
  expect(tokens.length).toBe(5);
  expect(tokens).toEqual([
    { type: "var_kw", value: "var" },
    { type: "identifier", value: "va" },
    { type: "operator", value: "=" },
    { type: "number", value: "1" },
    { type: "terminator", value: ";" }
  ]);
});

test("empty json tokenize successful", function() {
  var tokens = lexer("{}", jsonRules);

  expect(tokens.length).toBe(2);
  expect(tokens).toEqual([
    { type: "ObjectOpen", value: "{" },
    { type: "ObjectClose", value: "}" }
  ]);
});

test("json tokenize successful", function() {
  var tokens = lexer('{"a": 1, "b": null, "c": false, "d": "d"}', jsonRules);

  expect(tokens).toEqual([
    { type: "ObjectOpen", value: "{" },
    { type: "String", value: '"a"' },
    { type: "Colon", value: ":" },
    { type: "Number", value: "1" },
    { type: "coma", value: "," },
    { type: "String", value: '"b"' },
    { type: "Colon", value: ":" },
    { type: "Nil", value: "null" },
    { type: "coma", value: "," },
    { type: "String", value: '"c"' },
    { type: "Colon", value: ":" },
    { type: "Boolean", value: "false" },
    { type: "coma", value: "," },
    { type: "String", value: '"d"' },
    { type: "Colon", value: ":" },
    { type: "String", value: '"d"' },
    { type: "ObjectClose", value: "}" }
  ]);
});

test("throws on wrong first param", function() {
  expect(() => {
    var tokens = lexer(5 + 5, []);
  }).toThrow();
});

test("throws on wrong second param", function() {
  expect(() => {
    var tokens = lexer("5+5", null);
  }).toThrow();
});

test("throws on wrong rules", function() {
  expect(() => {
    var tokens = lexer("5+5", [1]);
  }).toThrow();
});

test("error object converts to string", function() {
  var error;
  try {
    var tokens = lexer(5 + 5, null);
  } catch (e) {
    error = e;
  }
  expect(error.message).toBe("" + error);
});

test("unxpected token throws error even if starts same", function() {
  var rules = [
    {
      name: "var_kw",
      tester: function(tested) {
        if ("var".startsWith(tested)) {
          return lexerResults.start;
        } else if (tested == "var") {
          return lexerResults.exact;
        } else {
          return lexerResults.none;
        }
      }
    }
  ];

  expect(() => {
    var tokens = lexer("va1", rules);
  }).toThrow();
});

test("new line can be handled", function() {
  var tokens = lexer("\n5+\n5", [
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
    },
    {
      name: "newline",
      tester: function(tested) {
        if (tested == "\n") {
          return lexerResults.skip;
        } else {
          return lexerResults.none;
        }
      }
    }
  ]);
  expect(tokens.length).toBe(3);
  expect(tokens).toEqual([
    { type: "number", value: "5" },
    { type: "sign", value: "+" },
    { type: "number", value: "5" }
  ]);
});

test("throws if last token not finished", function() {
  var rules = [
    {
      name: "var_kw",
      tester: function(tested) {
        if ("var".startsWith(tested)) {
          return lexerResults.start;
        } else if (tested == "var") {
          return lexerResults.exact;
        } else {
          return lexerResults.none;
        }
      }
    }
  ];

  expect(() => {
    var tokens = lexer("va", rules);
  }).toThrow();
});

test("throws if tester returns wrong result", function() {
  var rules = [
    {
      name: "test",
      tester: function(tested) {
        return -1;
      }
    }
  ];

  expect(() => {
    var tokens = lexer(" ", rules);
  }).toThrow();
});

test("throws if token only starts", function() {
  var rules = [
    {
      name: 'number',
      tester: function (tested) {
        if(/^\d+\.$/.test(tested)) {
          return lexerResults.start;
        }
        if(/^\d+(\.\d+)?$/.test(tested)) {
          return lexerResults.possible;
        }
        return lexerResults.none;
      }
    },
    {
      name: 'terminator',
      tester: function (tested) {
        if(tested === ';') {
          return lexerResults.exact;
        }
        return lexerResults.none;
      }
    }
  ];

  expect(() => {
    var tokens = lexer("1.;", rules);
  }).toThrow();
});

var jsonRules = [
  {
    name: "Whitespace",
    tester: function(tested) {
      var regResult = tested.match(/\s+/);
      if (regResult && regResult[0] == tested) {
        return lexerResults.skip;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "ArrayOpen",
    tester: function(tested) {
      if (tested == "[") {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "ArrayClose",
    tester: function(tested) {
      if (tested == "]") {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "ObjectOpen",
    tester: function(tested) {
      if (tested == "{") {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "ObjectClose",
    tester: function(tested) {
      if (tested == "}") {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "Colon",
    tester: function(tested) {
      if (tested == ":") {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "coma",
    tester: function(tested) {
      if (tested == ",") {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "Number",
    tester: function(tested) {
      var regResult = tested.match(
        /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/
      );
      if (regResult && regResult[0] == tested) {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "Boolean",
    tester: function(tested) {
      if ("false" == tested || "true" == tested) {
        return lexerResults.exact;
      } else if ("false".startsWith(tested) || "true".startsWith(tested)) {
        return lexerResults.start;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "Nil",
    tester: function(tested) {
      if ("null" == tested) {
        return lexerResults.exact;
      } else if ("null".startsWith(tested)) {
        return lexerResults.start;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "String",
    tester: function(tested) {
      var regexp = /"/g;
      var match,
        matches = [];
      while ((match = regexp.exec(tested)) != null) {
        matches.push(match.index);
      }

      if (matches.length == 1 && matches[0] == 0) {
        return lexerResults.start;
      }
      if (
        matches.length == 2 &&
        matches[0] == 0 &&
        matches[1] == tested.length - 1
      ) {
        return lexerResults.exact;
      }

      return lexerResults.none;
    }
  }
];

var variableStatementRules = [
  {
    name: "var_kw",
    tester: function(tested) {
      if (tested == "v" || tested == "va") {
        return lexerResults.start;
      } else if (tested == "var") {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
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
    name: "identifier",
    tester: function(tested) {
      var regResult = tested.match(/[a-z1-9]*/);
      if (regResult && regResult[0] == tested) {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "operator",
    tester: function(tested) {
      if (tested == "=") {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "terminator",
    tester: function(tested) {
      if (tested == ";") {
        return lexerResults.exact;
      } else {
        return lexerResults.none;
      }
    }
  },
  {
    name: "whitespace",
    tester: function(tested) {
      if (tested == " ") {
        return lexerResults.skip;
      } else {
        return lexerResults.none;
      }
    }
  }
];

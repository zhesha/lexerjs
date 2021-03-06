(function(exports) {
  const lexerResults = {
    none: 0,
    start: 1,
    exact: 2,
    possible: 3,
    skip: 4
  };

  function lexer(str, rules) {
    validateStr(str);
    validateRules(rules);
    return tokenize(str, rules);
  }

  function tokenize(str, rules) {
    let prevRuleIndex = null, ruleIndex, type;
    const tokens = [];
    let char = 0;
    let line = 0;
    let col = char + 1;
    let testerStartIndex = 0;
    let tested = str[char];
    if (tested === "\n") {
      line = 1;
      col = 0;
    }

    while (char < str.length) {
      ruleIndex = null;
      let result;
      for (let j = testerStartIndex; j < rules.length; j++) {
        result = rules[j].tester(tested);
        if (result === lexerResults.none) {
          if (ruleIndex == null) {
            testerStartIndex++;
          }

        } else if (result === lexerResults.start) {
          ruleIndex = j;
          type = result;
        } else if (
          result === lexerResults.exact ||
          result === lexerResults.possible ||
          result === lexerResults.skip
        ) {
          ruleIndex = j;
          type = result;
          break;
        } else {
          throw error(
            'unexpected result of tester, result given: "' +
              result +
              '", from tester: ' +
              rules[j].name +
              ' while testing "' +
              tested +
              '"'
          );
        }
      }

      if (ruleIndex !== null) {
        if (type !== lexerResults.skip && char === str.length - 1) {
          if (result !== lexerResults.start) {
            tokens.push({ type: rules[ruleIndex].name, value: tested });
          } else {
            throw error(errorMessage());
          }
        }
        prevRuleIndex = ruleIndex;
        char++;
        tested += str[char];
        if (str[char] === "\n") {
          line++;
          col = 0;
        }
      } else {
        if (prevRuleIndex === null || type === lexerResults.start) {
          throw error(errorMessage());
        }
        if (type !== lexerResults.skip) {
          tokens.push({
            type: rules[prevRuleIndex].name,
            value: tested.slice(0, -1)
          });
        }
        testerStartIndex = 0;
        prevRuleIndex = null;
        tested = str[char];
      }
    }
    return tokens;

    function errorMessage() {
      return (
        "tested string can't fit any token: " +
        tested +
        '", char: ' +
        (char + 1) +
        ", line: " +
        line +
        ", col: " +
        col
      );
    }
  }

  function validateStr(str) {
    if (typeof str != "string") {
      throw error("first parameter must be string");
    }
  }

  function validateRules(rules) {
    if (!Array.isArray(rules)) {
      throw error("rules must be Array");
    }
    for (const value of rules) {
      if (typeof value.name != "string" || typeof value.tester != "function") {
        throw error(
          "each rool must have `name` as string and `tester` as function"
        );
      }
    }
  }

  function error(message) {
    return {
      message: "Lexerjs: " + message,
      toString: function() {
        return this.message;
      }
    };
  }

  exports.lexer = lexer;
  exports.lexerResults = lexerResults;
})(typeof exports === "object" ? exports : this);

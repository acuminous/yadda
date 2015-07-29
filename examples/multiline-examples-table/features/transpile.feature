Feature: Multline Examples Table

Scenario: [case] Scenario

    Given I need to transpile [case]
    When EcmaScript6=[EcmaScript6]
    Then EcmaScript5=[EcmaScript5]

Examples:
  case             | EcmaScript6              | EcmaScript5
  -----------------|--------------------------|-------------------------------
  arrow function   | var r=arr.map((x)=>x*x); | "use strict";
                   |                          |
                   |                          | var r = arr.map(function (x) {
                   |                          |   return x * x;
                   |                          | });
  -----------------|--------------------------|-------------------------------
  template strings | var s=`x=${x}            | "use strict";
                   | y=${y}`;                 |
                   |                          | var s = "x=" + x + "\ny=" + y;


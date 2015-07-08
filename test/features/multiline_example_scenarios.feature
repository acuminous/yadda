Scenario: [case]

    Given I need to transpile
    When EcmaScript6=[EcmaScript6]
    Then EcmaScript5=[EcmaScript5]

Examples:
  case             | EcmaScript6              | EcmaScript5

  arrow function   | var r=arr.map((x)=>x*x); | "use strict";
                   |                          |
                   |                          | var r=arr.map(
                   |                          |   function(x){
                   |                          |     return x*x;
                   |                          | });

  template strings | var s=`x=${x}            | var s='x='.concat(x).concat('\n')
                   | y=${y}`;                 | .concat('y=').concat(y);
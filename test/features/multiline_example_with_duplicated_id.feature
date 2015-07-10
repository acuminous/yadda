Scenario: [case]

    Given I need to transpile
    When EcmaScript6 at [EcmaScript6.start.line]:[EcmaScript6.start.column]-[EcmaScript6.end.line]:[EcmaScript6.end.column] = [EcmaScript6]
    Then EcmaScript5 at [EcmaScript5.start.line]:[EcmaScript5.start.column]-[EcmaScript5.end.line]:[EcmaScript5.end.column] = [EcmaScript5]

Examples:
  case:ID          | EcmaScript6:LOC          | EcmaScript5:LOC


  arrow            | var r=arr.map((x)=>x*x); | "use strict";
  function         |                          |
                   |                          | var r=arr.map(
                   |                          |   function(x){
                   |                          |     return x*x;
                   |                          | });


  template         | var s=`x=${x}            | var s='x='.concat(x).concat('\n')
  strings          | y=${y}`;                 | .concat('y=').concat(y);


  arrow function   | var r=arr.map((x)=>x*x); | "use strict";
                   |                          |
                   |                          | var r=arr.map(
                   |                          |   function(x){
                   |                          |     return x*x;
                   |                          | });


import spaces from './spaces.js'

function tabsToSpaces(str) {
  return str.replace(/^\t+/, (match) => match.split('\t').join('  '))
}
  // /test/validator/properties-unexpected-b文件为例
export default function getCodeFrame(source, line, column) {
  // properties-unexpected-b文件
  // 	source: <div></div>
  // <script>
  //         export default {
  //                 doSomething () {
  //                         alert( 'boo' );
  //                 }
  //         };
  // </script>
  // line: 4
  // column: 2
  // line和column为export的开始位置
  const lines = source.split('\n')

  const frameStart = Math.max(0, line - 2)
  const frameEnd = Math.min(line + 3, lines.length)

  const digits = String(frameEnd + 1).length
  // frameStart,frameEnd,digits: 2 7 1
  return lines
    .slice(frameStart, frameEnd)
    .map((str, i) => {
      const isErrorLine = frameStart + i === line

      let lineNum = String(i + frameStart + 1)
      while (lineNum.length < digits) lineNum = ` ${lineNum}`

      if (isErrorLine) {
        const indicator = spaces(digits + 2 + tabsToSpaces(str.slice(0, column)).length) + '^'
        return `${lineNum}: ${tabsToSpaces(str)}\n${indicator}`
      }

      return `${lineNum}: ${tabsToSpaces(str)}`
    })
    .join('\n')

  // /test/validator/properties-unexpected-b：
  // return内容:3: <script>
  // 4:   export default {
  // 5:     doSomething () {
  //        ^
  // 6:       alert( 'boo' );
  // 7:     }
}

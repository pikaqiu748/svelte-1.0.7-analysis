export default function flatten(node) {
  // binding-input-text-deep文件
  // Node {
  // 	type: 'MemberExpression',
  // 	start: 42,
  // 	end: 51,
  // 	object: Node { type: 'Identifier', start: 42, end: 46, name: 'user' },
  // 	property: Node { type: 'Identifier', start: 47, end: 51, name: 'name' },
  // 	computed: false
  //   }
  const parts = []
  while (node.type === 'MemberExpression') {
    if (node.computed) return null
    parts.unshift(node.property.name)

    node = node.object
  }

  if (node.type !== 'Identifier') return null

  const name = node.name
  parts.unshift(name)
  //  return  { name: 'user', keypath: 'user.name' }
  return { name, keypath: parts.join('.') }
}

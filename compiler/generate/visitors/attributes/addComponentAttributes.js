import createBinding from './binding/index.js'
import deindent from '../../utils/deindent.js'

// generator定义在generator的index.js文件中的一个对象
export default function addComponentAttributes(generator, node, local) {
  local.staticAttributes = []
  local.dynamicAttributes = []
  local.bindings = []
  node.attributes.forEach((attribute) => {
    if (attribute.type === 'Attribute') {
      if (attribute.value === true) {
        // attributes without values, e.g. <textarea readonly>
        local.staticAttributes.push({
          name: attribute.name,
          value: true,
        })
      } else if (attribute.value.length === 0) {
        local.staticAttributes.push({
          name: attribute.name,
          value: `''`,
        })
      }
      // [
      // 	{
      // 	  start: 16,
      // 	  end: 21,
      // 	  type: 'MustacheTag',
      // 	  expression: Node { type: 'Identifier', start: 18, end: 19, name: 'x' }
      // 	}
      //   ]
      // 		✓ observe-component-ignores-irrelevant-changes
      else if (attribute.value.length === 1) {
        const value = attribute.value[0]

        if (value.type === 'Text') {
          // static attributes
          const result = isNaN(parseFloat(value.data)) ? JSON.stringify(value.data) : value.data
          local.staticAttributes.push({
            name: attribute.name,
            value: result,
          })
        } else {
          // simple dynamic attributes
          const { dependencies, string } = generator.contextualise(value.expression)
          // dependencies: [ 'x' ] string: root.x
          //   ✓ observe-component-ignores-irrelevant-changes 文件
          // TODO only update attributes that have changed
          local.dynamicAttributes.push({
            name: attribute.name,
            value: string,
            dependencies,
          })
        }
      } else {
        // complex dynamic attributes
        // 既有静态属性也有动属性
        const allDependencies = []
        // attribute:{
        // 	start: 46,
        // 	end: 81,
        // 	type: 'Attribute',
        // 	name: 'qux',
        // 	value: [
        // 	  { start: 51, end: 61, type: 'Text', data: 'this is a ' },
        // 	  { start: 61, end: 73, type: 'MustacheTag', expression: [Node] },
        // 	  { start: 73, end: 80, type: 'Text', data: ' string' }
        // 	]
        //   }
        // 		✓ component-data-dynamic
        const value =
          (attribute.value[0].type === 'Text' ? '' : `"" + `) +
          attribute.value
            .map((chunk) => {
              if (chunk.type === 'Text') {
                return JSON.stringify(chunk.data)
              } else {
                generator.addSourcemapLocations(chunk.expression)

                const { dependencies, string } = generator.contextualise(chunk.expression)
                dependencies.forEach((dependency) => {
                  if (!~allDependencies.indexOf(dependency)) allDependencies.push(dependency)
                })

                return `( ${string} )`
              }
            })
            .join(' + ')

        local.dynamicAttributes.push({
          name: attribute.name,
          value,
          dependencies: allDependencies,
        })
      }
    } else if (attribute.type === 'EventHandler') {
      // TODO verify that it's a valid callee (i.e. built-in or declared method)
      generator.addSourcemapLocations(attribute.expression)
      generator.code.prependRight(attribute.expression.start, 'component.')

      const usedContexts = new Set()
      attribute.expression.arguments.forEach((arg) => {
        const { contexts } = generator.contextualise(arg, true, true)

        contexts.forEach((context) => {
          usedContexts.add(context)
          local.allUsedContexts.add(context)
        })
      })

      // TODO hoist event handlers? can do `this.__component.method(...)`
      const declarations = [...usedContexts].map((name) => {
        if (name === 'root') return 'var root = this.__svelte.root;'

        const listName = generator.current.listNames[name]
        const indexName = generator.current.indexNames[name]

        return `var ${listName} = this.__svelte.${listName}, ${indexName} = this.__svelte.${indexName}, ${name} = ${listName}[${indexName}]`
      })
      const handlerBody = (declarations.length ? declarations.join('\n') + '\n\n' : '') + `[✂${attribute.expression.start}-${attribute.expression.end}✂];`
      //   handlerBody [✂26-57✂];
      //   ✓ component-events-data文件
      local.init.push(deindent`
				${local.name}.on( '${attribute.name}', function ( event ) {
					${handlerBody}
				});
			`)
    } else if (attribute.type === 'Binding') {
      createBinding(generator, node, attribute, generator.current, local)
    } else if (attribute.type === 'Ref') {
      generator.usesRefs = true

      local.init.push(deindent`
				component.refs.${attribute.name} = ${local.name};
			`)

      local.teardown.push(deindent`
				if ( component.refs.${attribute.name} === ${local.name} ) component.refs.${attribute.name} = null;
			`)
    } else {
      throw new Error(`Not implemented: ${attribute.type}`)
    }
  })
}

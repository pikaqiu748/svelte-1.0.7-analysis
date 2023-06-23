export default function checkForDupes ( validator, properties ) {
	// sourcemap/script测试例子
	// validator:{
	// 	error: [Function: error],
	// 	warn: [Function: warn],
	// 	templateProperties: {},
	// 	errors: [],
	// 	warnings: [],
	// 	defaultExport: Node {
	// 	  type: 'ExportDefaultDeclaration',
	// 	  start: 23,
	// 	  end: 84,
	// 	  declaration: Node {
	// 		type: 'ObjectExpression',
	// 		start: 38,
	// 		end: 84,
	// 		properties: [Array]
	// 	  }
	// 	}
	//   } 
	//properties: [
	// 	Node {
	// 	  type: 'Property',
	// 	  start: 42,
	// 	  end: 81,
	// 	  method: true,
	// 	  shorthand: false,
	// 	  computed: false,
	// 	  key: Node { type: 'Identifier', start: 42, end: 50, name: 'onrender' },
	// 	  kind: 'init',
	// 	  value: Node {
	// 		type: 'FunctionExpression',
	// 		start: 51,
	// 		end: 81,
	// 		id: null,
	// 		generator: false,
	// 		expression: false,
	// 		async: false,
	// 		params: [],
	// 		body: [Node]
	// 	  }
	// 	}
	//   ]
	const seen = Object.create( null );

	properties.forEach( prop => {
		if ( seen[ prop.key.name ] ) {
			validator.error( `Duplicate property '${prop.key.name}'`, prop.start );
		}

		seen[ prop.key.name ] = true;
	});
}

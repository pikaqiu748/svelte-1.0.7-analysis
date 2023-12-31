import deindent from './deindent.js';
import getGlobals from './getGlobals.js';

export default function getIntro ( format, options, imports ) {
	if ( format === 'es' ) return '';
	if ( format === 'amd' ) return getAmdIntro( options, imports );
	if ( format === 'cjs' ) return getCjsIntro( options, imports );
	if ( format === 'iife' ) return getIifeIntro( options, imports );
	if ( format === 'umd' ) return getUmdIntro( options, imports );

	throw new Error( `Not implemented: ${format}` );
}

function getAmdIntro ( options, imports ) {
	// generates an AMD module文件
	//options:{ format: 'amd', amd: { id: 'foo' }, onwarn: [Function (anonymous)] 
	// imports:	[
	// Node {
	// 	  type: 'ImportDeclaration',
	// 	  start: 33,
	// 	  end: 61,
	// 	  specifiers: [ [Node] ],
	// 	  source: Node {
	// 		type: 'Literal',
	// 		start: 52,
	// 		end: 60,
	// 		value: 'answer',
	// 		raw: "'answer'"
	// 	  },
	// 	  name: 'answer'
	// 	}
	//   ]
	  
	const sourceString = imports.length ?
		`[ ${imports.map( declaration => `'${declaration.source.value}'` ).join( ', ' )} ], ` :
		'';

	const id = options.amd && options.amd.id;

	return `define(${id ? ` '${id}', ` : ''}${sourceString}function (${paramString( imports )}) { 'use strict';\n\n`;
}

function getCjsIntro ( options, imports ) {
	const requireBlock = imports
		.map( declaration => `var ${declaration.name} = require( '${declaration.source.value}' );` )
		.join( '\n\n' );

	if ( requireBlock ) {
		return `'use strict';\n\n${requireBlock}\n\n`;
	}

	return `'use strict';\n\n`;
}

function getIifeIntro ( options, imports ) {
	if ( !options.name ) {
		throw new Error( `Missing required 'name' option for IIFE export` );
	}

	return `var ${options.name} = (function (${paramString( imports )}) { 'use strict';\n\n`;
}

function getUmdIntro ( options, imports ) {
	if ( !options.name ) {
		throw new Error( `Missing required 'name' option for UMD export` );
	}

	const amdId = options.amd && options.amd.id ? `'${options.amd.id}', ` : '';

	const amdDeps = imports.length ? `[${imports.map( declaration => `'${declaration.source.value}'` ).join( ', ')}], ` : '';
	const cjsDeps = imports.map( declaration => `require('${declaration.source.value}')` ).join( ', ' );
	const globalDeps = getGlobals( imports, options );

	return deindent`
		(function ( global, factory ) {
			typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(${cjsDeps}) :
			typeof define === 'function' && define.amd ? define(${amdId}${amdDeps}factory) :
			(global.${options.name} = factory(${globalDeps}));
		}(this, (function (${paramString( imports )}) { 'use strict';` + '\n\n';
}

// imports:	[
	// Node {
	// 	  type: 'ImportDeclaration',
	// 	  start: 33,
	// 	  end: 61,
	// 	  specifiers: [ [Node] ],
	// 	  source: Node {
	// 		type: 'Literal',
	// 		start: 52,
	// 		end: 60,
	// 		value: 'answer',
	// 		raw: "'answer'"
	// 	  },
	// 	  name: 'answer'
	// 	}
	//   ]
	  
function paramString ( imports ) {
	return imports.length ? ` ${imports.map( dep => dep.name ).join( ', ' )} ` : '';
}

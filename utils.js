define( 'utils', {
	
	'drawCircle': function ( canvasContext, x, y, r, color ) {
		canvasContext.fillStyle = color;
		canvasContext.beginPath();
		canvasContext.arc( x, y, r, 0, Math.PI * 2, true );
		canvasContext.fill();
	},
	/*
	 * @func draw a line between the centers of 2 entities
	 */
	'drawLine': function ( canvasContext, e1, e2 ) {
		canvasContext.beginPath();
		canvasContext.moveTo(e1.x + e1.w / 2, e1.y + e1.h / 2);
		canvasContext.lineTo(e2.x + e2.w / 2, e2.y + e2.h / 2);
		canvasContext.stroke();
	},
	/*
	 * return false if x is null or undefined, oherwise true
	 */
	'isSet': function ( x ) {
		return x !== undefined && x !== null;
	},
	/*
		* used to inherit objects
		*/
	'inheritObject': function ( o ) {
		var temp = function () {};
		temp.prototype = o;
		return new temp();
	},
   /*
	* used to inherit construcotr functions ( like classes )
	* 
	* @param
	*	baseObject - the object to inherit from
	*	constrExtended - body of the function that has to inherit from baseObject
	* 
	*/
	'inheritConstructor': function ( baseObject, constrExtended ) {
		constrExtended.prototype = baseObject;
		constrExtended.prototype.constructor = constrExtended;
		constrExtended.fn = constrExtended.prototype;
		return constrExtended;
	},
	/*  
	 *  lightenHexColor('#1289cd', 5) => "#178ed2"
	 */
	'lightenHexColor': function ( hexColor, hexIncrementValue ) {
		
		var r = parseInt( hexColor.substr(1, 2), 16 ) + parseInt( hexIncrementValue, 16 ),
			g = parseInt( hexColor.substr(3, 2), 16 ) + parseInt( hexIncrementValue, 16 ),
			b = parseInt( hexColor.substr(5, 2), 16 ) + parseInt( hexIncrementValue, 16 );
		
		r = r < 16 ? '0' + r.toString(16) : r.toString(16);
		g = g < 16 ? '0' + g.toString(16) : g.toString(16);
		b = b < 16 ? '0' + b.toString(16) : b.toString(16);
		
		r = r.length > 2 ? 'ff' : r;
		g = g.length > 2 ? 'ff' : g;
		b = b.length > 2 ? 'ff' : b;
		
		return '#' + r + g + b;
		
	},
	/*
	 * TODO
	 */
	'preloadImages': function ( arrayOfImageNames ) {
		for( var i = 0, k = arrayOfImageNames.length; i < k; ++i ) {
			var _temp = new Image();
			_temp.src = arrayOfImageNames[i];
		}
	},
	'getKeyByValue': function ( object, value ) {
		for( enumerableKey in object ) {
			if( object[enumerableKey] === value ) {
				return enumerableKey;
			}
		}
	},
	'requestFrame': window.requestAnimationFrame	||
		window.webkitRequestAnimationFrame			||
		window.mozRequestAnimationFrame				||
		window.oRequestAnimationFrame				||
		window.msRequestAnimationFrame				||
		function( callback ){
			setTimeout(callback, 1000 / 60);
		}
	
});



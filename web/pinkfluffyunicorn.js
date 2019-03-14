var assetReference = {};
var overlays = {};

function LoadAsset( name, path ) {
	var fileExt = path.split('.').pop();
	switch( fileExt ) {
		case "jpg":
		case "png":
		case "svg":
		case "jpeg":
		case "gif":
			assetReference[ name ] = PIXI.Texture.from( path );
			break;
		default:
			throw new Error( "Unsupported File Format: " + fileExt );
	}
}

function AddOverlay( name, assetName, x, y ) {
	try {
		if( name ) {
			var sprite = new PIXI.Sprite(
				assetReference[ assetName ]
			);
			sprite.x = x;
			sprite.y = y;
			app.stage.addChild( sprite );
			overlays[ name ] = sprite;
			return sprite;
		}
	}
	catch( err ) {
		console.log( "Failed to add overlay", err );
	}
	return null;
}

function RemoveOverlay( name ) {
	if( overlays[ name ] ) {
		app.stage.removeChild( overlays[ name ] );
		delete overlays[ name ];
	}
}

var app = undefined;
var opts = undefined;

function createTheUnicorn( element, options ) {
	try {
		opts = options;
		app = new PIXI.Application( {
			width: opts.width,	// default: 800
			height: opts.height,	// default: 600
			antialias: true,		// default: false
			transparent: opts.background === "transparent", // default: false
			backgroundColor: opts.background === "transparent" ? null : opts.background,
			resolution: 1       // default: 1
		} );
		if( element instanceof Element || element instanceof HTMLDocument ) {
			element.appendChild( app.view );
		}
		else if( typeof element === "string" || element instanceof String ) {
			document.getElementById( element ).appendChild( app.view );
		}
		else {
			throw new Error( "Invalid Element Type" );
		}
		if( opts.channel ) {
			ComfyJS.Init( opts.channel );
			ComfyJS.onCommand = opts.onCommand;
			ComfyJS.onChat = opts.onChat;
		}
		// Initialize the engine
		opts.init();
		window.requestAnimationFrame( updateTheUnicorn );
		return true;
	}
	catch( err ) {
		console.log( "Init Error", err );
		return false;
	}
}

var prevStep = -1;
function updateTheUnicorn( timestamp ) {
	try {
		if( prevStep < 0 ) {
			prevStep = timestamp;
		}
		opts.update( timestamp, timestamp - prevStep );
		prevStep = timestamp;
		window.requestAnimationFrame( updateTheUnicorn );
	}
	catch( err ) {
		console.log( "Update Error", err );
	}
}

window.Unicorn = {
	Create: createTheUnicorn,
	Load: LoadAsset,
	AddOverlay: AddOverlay,
	RemoveOverlay: RemoveOverlay,
};

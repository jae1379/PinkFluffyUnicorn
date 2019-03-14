var assetReference = {};
var overlays = {};
var objects = {};
var objectSprite = {};

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
		// TODO: Check that the overlay name doesn't already exist
		if( name ) {
			var sprite = new PIXI.Sprite(
				assetReference[ assetName ]
			);
			sprite.x = x;
			sprite.y = y;
			groupOverlay.addChild( sprite );
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
		groupOverlay.removeChild( overlays[ name ] );
		delete overlays[ name ];
	}
}

function AddObject( name, options ) {
	try {
		// TODO: Check that the object name doesn't already exist
		if( name ) {
			if( Array.isArray( options ) ) {
				// TODO: Add Composite Object Support
				throw new Error( "Composite Objects Not Supported" );
			}
			var body = null;
			switch( options.type.toLowerCase() ) {
				case "circle":
					body = Matter.Bodies.circle( options.x, options.y, options.radius );
					break;
				case "rectangle":
					body = Matter.Bodies.rectangle( options.x, options.y, options.width, options.height );
					break;
				// TODO: Add Custom Polygon Object Support
				default:
					throw new Error( "Unsupported Object Type", options.type );
			}
			// Set the body values
			body.angle = options.angle || 0;
			body.density = options.density || 0.001;
			body.force = options.force || { x: 0, y: 0 };
			body.friction = options.friction || 0.1;
			body.frictionAir = options.frictionAir || 0.01;
			body.frictionStatic = options.frictionStatic || 0.5;
			body.isStatic = options.isStatic || false;
			body.restitution = options.bounce || 0;
			body.torque = options.torque || 0;

			var sprite = new PIXI.Sprite(
				assetReference[ options.sprite ]
			);
			sprite.anchor.set( 0.5 );
			sprite.x = body.position.x;
			sprite.y = body.position.y;
			sprite.rotation = body.angle;
			objectSprite[ body.id ] = sprite;
			groupWorld.addChild( sprite );
			objects[ name ] = body;
			Matter.World.add( physics.world, [ body ] );
			return body;
		}
	}
	catch( err ) {
		console.log( "Failed to add overlay", err );
	}
	return null;
}

function RemoveObject( name ) {
	if( objects[ name ] ) {
		// app.stage.removeChild( objects[ name ] );
		delete objects[ name ];
	}
}

var app = undefined;
var groupOverlay = undefined;
var groupWorld = undefined;
var opts = undefined;
var physics = undefined;

function createTheUnicorn( element, options ) {
	try {
		opts = options;
		PIXI.utils.skipHello();
		app = new PIXI.Application( {
			width: opts.width,		// default: 800
			height: opts.height,	// default: 600
			antialias: true,		// default: false
			transparent: opts.background === "transparent",
			backgroundColor: opts.background === "transparent" ? null : opts.background,
			resolution: 1       	// default: 1
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
		groupWorld = new PIXI.Container();
		app.stage.addChild( groupWorld );
		groupOverlay = new PIXI.Container();
		app.stage.addChild( groupOverlay );
		if( opts.channel ) {
			ComfyJS.Init( opts.channel );
			ComfyJS.onCommand = opts.onCommand;
			ComfyJS.onChat = opts.onChat;
		}
		physics = Matter.Engine.create();
		physics.world.gravity.x = opts.gravity ? opts.gravity.x : 0;
		physics.world.gravity.y = opts.gravity ? opts.gravity.y : 1;
		if( opts.screenWalls || typeof opts.screenWalls === "undefined" ) {
			// Set Walls
			Matter.World.add( physics.world, [
				Matter.Bodies.rectangle( opts.width / 2, -50, opts.width, 100, { isStatic: true } ),
				Matter.Bodies.rectangle( opts.width / 2, opts.height + 50, opts.width, 100, { isStatic: true } ),
				Matter.Bodies.rectangle( -50, opts.height / 2, 100, opts.height, { isStatic: true } ),
				Matter.Bodies.rectangle( opts.width + 50, opts.height / 2, 100, opts.height, { isStatic: true } )
			] );
		}
		Matter.Engine.run( physics );
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
		// Update the object sprites based on the world
		physics.world.bodies.forEach( b => {
			var sprite = objectSprite[ b.id ];
			if( sprite ) {
				sprite.x = b.position.x;
				sprite.y = b.position.y;
				sprite.rotation = b.angle;
			}
		});
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
	AddObject: AddObject,
	RemoveObject: RemoveObject,
	Assets: assetReference,
	Overlays: overlays,
	Objects: objects
};

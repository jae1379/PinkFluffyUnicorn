var assetReference = {};
var overlays = {};
var objects = {};
var objectSprite = {};
var detectEnter = {};
var detectExit = {};
var connection = {};

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

function AddDetector( name, options, onEnter, onExit ) {
	options = Object.assign( options, {
		onEnter: onEnter,
		onExit: onExit
	} );
	return AddObject( name, options );
}

function RemoveDetector( name ) {
	RemoveObject( name );
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
			body.label = name;
			if( options.onEnter ) {
				body.isSensor = true;
				body.isStatic = true;
				detectEnter[ name ] = options.onEnter;
			}
			if( options.onExit ) {
				body.isSensor = true;
				body.isStatic = true;
				detectExit[ name ] = options.onExit;
			}

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
		delete objectSprite[ objects[ name ].id ];
		groupWorld.removeChild( objects[ name ] );
		delete objects[ name ];
		delete detectEnter[ name ]; // remove any detectors if exist
		delete detectExit[ name ]; // remove any detectors if exist
	}
}

function ConnectObjects( nameA, nameB, options, offsetA, offsetB ) {
	options = options || {};
	var constraint = {
		pointA: offsetA || { x: 0, y: 0 },
		pointB: offsetB || { x: 0, y: 0 },
		damping: options.damping || 0,
		length: options.length,
		stiffness: options.stiffness || 1
	};
	var constraintName = nameA + "_" + nameB;
	if( objects[ nameA ] ) {
		constraint.bodyA = objects[ nameA ];
	}
	if( objects[ nameB ] ) {
		constraint.bodyB = objects[ nameB ];
	}
	connection[ constraintName ] = Matter.Constraint.create( constraint );
	Matter.Composite.add( physics.world, connection[ constraintName ] );
}

function DisconnectObjects( nameA, nameB ) {
	if( connection[ nameA + "_" + nameB ] ) {
		Matter.Composite.remove( physics.world, connection[ nameA + "_" + nameB ] );
		delete connection[ nameA + "_" + nameB ];
	}
	else if( connection[ nameB + "_" + nameA ] ) {
		Matter.Composite.remove( physics.world, connection[ nameB + "_" + nameA ] );
		delete connection[ nameB + "_" + nameA ];
	}
}

function Raycast( pointA, pointB ) {
	return Matter.Query.ray( Matter.Composite.allBodies( physics.world ), pointA, pointB );
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
		Matter.Events.on( physics, 'collisionStart', function( event ) {
			var pairs = event.pairs;
			for( var i = 0, j = pairs.length; i != j; ++i ) {
				var pair = pairs[ i ];
				if( pair.bodyA.isSensor ) {
					if( detectEnter[ pair.bodyA.label ] ) {
						detectEnter[ pair.bodyA.label ]( pair.bodyB.label, pair.bodyB );
					}
				}
				else if ( pair.bodyB.isSensor ) {
					if( detectEnter[ pair.bodyB.label ] ) {
						detectEnter[ pair.bodyB.label ]( pair.bodyA.label, pair.bodyA );
					}
				}
			}
		} );
		Matter.Events.on( physics, 'collisionEnd', function( event ) {
			var pairs = event.pairs;
			for( var i = 0, j = pairs.length; i != j; ++i ) {
				var pair = pairs[ i ];
				if( pair.bodyA.isSensor ) {
					if( detectExit[ pair.bodyA.label ] ) {
						detectExit[ pair.bodyA.label ]( pair.bodyB.label, pair.bodyB );
					}
				}
				else if ( pair.bodyB.isSensor ) {
					if( detectExit[ pair.bodyB.label ] ) {
						detectExit[ pair.bodyB.label ]( pair.bodyA.label, pair.bodyA );
					}
				}
			}
		} );
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
	ConnectObjects: ConnectObjects,
	DisconnectObjects: DisconnectObjects,
	AddDetector: AddDetector,
	RemoveDetector: RemoveDetector,
	Raycast: Raycast,
	Assets: assetReference,
	Overlays: overlays,
	Objects: objects
};

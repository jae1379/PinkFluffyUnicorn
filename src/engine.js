var assetReference = {};
var overlays = {};
var objects = {};
var objectSprite = {};
var particles = {};
var particleImage = null;
var timers = {};
var texts = {};
var detectEnter = {};
var detectExit = {};
var connection = {};

// TODO: Layer Support (add a Z-depth parameter)
// TODO: Custom Width/Height Support

function CropAsset( name, srcName, x, y, width, height ) {
	return assetReference[ name ] = new PIXI.Texture( assetReference[ srcName ], new PIXI.Rectangle( x, y, width, height ) );
}

function LoadAsset( name, path ) {
	if( typeof( name ) === "object" ) {
		return Object.keys( name ).map( x => LoadAsset( x, name[ x ] ) );
	}
	var fileExt = path.split('.').pop();
	switch( fileExt ) {
		case "jpg":
		case "png":
		case "svg":
		case "jpeg":
		case "gif":
		case "mp4":
			return assetReference[ name ] = PIXI.Texture.from( path );
		case "wav":
		case "mp3":
			return assetReference[ name ] = PIXI.sound.Sound.from( path );
		default:
			if( path.startsWith( "http://" ) || path.startsWith( "https://" ) ) {
				// Assume an image
				return assetReference[ name ] = PIXI.Texture.from( path );
			}
			else {
				throw new Error( "Unsupported File Format: " + fileExt );
			}
	}
}

function LoadAssetCustom( name, asset, type, options ) {
	switch( type ) {
		case "texture":
			return assetReference[ name ] = PIXI.Texture.from( asset, options );
		case "sound":
			return assetReference[ name ] = PIXI.sound.Sound.from( asset );
		default:
			throw new Error( "Unsupported Asset Type: " + type );
	}
}

function PlaySound( name, options ) {
	if( assetReference[ name ] ) {
		assetReference[ name ].volume = options.volume || 1;
		assetReference[ name ].play();
	}
}

function AddBacklay( name, assetName, x, y, options ) {
	try {
		// TODO: Check that the overlay name doesn't already exist
		if( name ) {
			if( typeof( name ) === "object" ) {
				return Object.keys( name ).map( x => AddBacklay( x, name[ x ].asset, name[ x ].x, name[ x ].y, name[ x ].options ) );
			}
			var sprite = new PIXI.Sprite(
				assetReference[ assetName ]
			);
			sprite.x = x;
			sprite.y = y;
			groupBacklay.addChild( sprite );
			overlays[ name ] = sprite;
			if( options ) {
				var isInteractive = false;
				if( options.onPress instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerdown", options.onPress );
				}
				if( options.onRelease instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerup", options.onRelease );
					sprite.on( "pointerupoutside", options.onRelease );
				}
				if( options.onHover instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerover", options.onHover );
				}
				if( options.onLeave instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerout", options.onLeave );
				}
				if( options.onMove instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointermove", options.onMove );
				}
				if( isInteractive ) {
					sprite.interactive = true;
					sprite.buttonMode = true;
				}
			}
			return sprite;
		}
	}
	catch( err ) {
		console.log( "Failed to add overlay", err );
	}
	return null;
}

function RemoveBacklay( name ) {
	if( overlays[ name ] ) {
		groupBacklay.removeChild( overlays[ name ] );
		delete overlays[ name ];
	}
}

function AddOverlay( name, assetName, x, y, options ) {
	try {
		// TODO: Check that the overlay name doesn't already exist
		if( name ) {
			if( typeof( name ) === "object" ) {
				return Object.keys( name ).map( x => AddOverlay( x, name[ x ].asset, name[ x ].x, name[ x ].y, name[ x ].options ) );
			}
			var sprite = new PIXI.Sprite(
				assetReference[ assetName ]
			);
			sprite.x = x;
			sprite.y = y;
			groupOverlay.addChild( sprite );
			overlays[ name ] = sprite;
			if( options ) {
				if( options.z ) {
					sprite.zIndex = options.z;
				}
				var isInteractive = false;
				if( options.onPress instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerdown", options.onPress );
				}
				if( options.onRelease instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerup", options.onRelease );
					sprite.on( "pointerupoutside", options.onRelease );
				}
				if( options.onHover instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerover", options.onHover );
				}
				if( options.onLeave instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerout", options.onLeave );
				}
				if( options.onMove instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointermove", options.onMove );
				}
				if( isInteractive ) {
					sprite.interactive = true;
					sprite.buttonMode = true;
				}
			}
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

function AddText( name, text, x, y, options ) {
	try {
		if( name ) {
			if( typeof( name ) === "object" ) {
				return Object.keys( name ).map( x => AddText( x, name[ x ].asset, name[ x ].x, name[ x ].y, name[ x ].options ) );
			}
			var textObj = new PIXI.Text( text, new PIXI.TextStyle( options ) );
			textObj.x = x;
			textObj.y = y;
			groupOverlay.addChild( textObj );
			texts[ name ] = textObj;
			if( options ) {
				if( options.z ) {
					textObj.zIndex = options.z;
				}
			}
			return textObj;
		}
	}
	catch( err ) {
		console.log( "Failed to add text", err );
	}
	return null;
}

function RemoveText( name ) {
	if( texts[ name ] ) {
		groupOverlay.removeChild( texts[ name ] );
		delete texts[ name ];
	}
}

function AddDetector( name, options, onEnter, onExit ) {
	if( typeof( name ) === "object" ) {
		return Object.keys( name ).map( x => AddDetector( x, name[ x ].options, name[ x ].onEnter, name[ x ].onExit ) );
	}
	options = Object.assign( options, {
		isDetector: true,
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
			if( typeof( name ) === "object" ) {
				return Object.keys( name ).map( x => AddObject( x, name[ x ] ) );
			}
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
			if( options.isDetector ) {
				body.isSensor = true;
				body.isStatic = true;
			}
			if( options.onEnter ) {
				detectEnter[ name ] = options.onEnter;
			}
			if( options.onExit ) {
				detectExit[ name ] = options.onExit;
			}

			if( options.animations ) {
				for( var anim in options.animations ) {
					var sprite = new PIXI.AnimatedSprite(
						options.animations[ anim ].frames.map( a => assetReference[ a ] )
					);
					sprite.animationSpeed = options.animations[ anim ].framerate || ( 10 / 60 );
					sprite.loop = options.animations[ anim ].loop;
					sprite.onComplete = options.animations[ anim ].onComplete;
					sprite.visible = false;
					sprite.anchor.set( 0.5 );
					sprite.x = body.position.x;
					sprite.y = body.position.y;
					sprite.rotation = body.angle;
					objectSprite[ body.id ] = sprite;
					if( options.z ) {
						sprite.zIndex = options.z;
					}
					if( options.scale ) {
						sprite.scale.x = options.scale.x;
						sprite.scale.y = options.scale.y;
					}
					groupWorld.addChild( sprite );
					var isInteractive = false;
					if( options.onPress instanceof Function ) {
						isInteractive = true;
						sprite.on( "pointerdown", options.onPress );
					}
					if( options.onRelease instanceof Function ) {
						isInteractive = true;
						sprite.on( "pointerup", options.onRelease );
						sprite.on( "pointerupoutside", options.onRelease );
					}
					if( options.onHover instanceof Function ) {
						isInteractive = true;
						sprite.on( "pointerover", options.onHover );
					}
					if( options.onLeave instanceof Function ) {
						isInteractive = true;
						sprite.on( "pointerout", options.onLeave );
					}
					if( options.onMove instanceof Function ) {
						isInteractive = true;
						sprite.on( "pointermove", options.onMove );
					}
					if( isInteractive ) {
						sprite.interactive = true;
						sprite.buttonMode = true;
					}
					if( !body.animations ) {
						body.animations = {};
					}
					body.animations[ anim ] = sprite;
				}
				// Set to the first animation
				body.currentAnimation = Object.keys( body.animations )[ 0 ];
				body.animations[ body.currentAnimation ].visible = true;
				body.animations[ body.currentAnimation ].gotoAndPlay( 0 );
			}
			else if( options.sprite ) {
				var sprite = new PIXI.Sprite(
					assetReference[ options.sprite ]
				);
				sprite.anchor.set( 0.5 );
				sprite.x = body.position.x;
				sprite.y = body.position.y;
				sprite.rotation = body.angle;
				objectSprite[ body.id ] = sprite;
				if( options.z ) {
					sprite.zIndex = options.z;
				}
				if( options.scale ) {
					sprite.scale.x = options.scale.x;
					sprite.scale.y = options.scale.y;
				}
				groupWorld.addChild( sprite );
				var isInteractive = false;
				if( options.onPress instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerdown", options.onPress );
				}
				if( options.onRelease instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerup", options.onRelease );
					sprite.on( "pointerupoutside", options.onRelease );
				}
				if( options.onHover instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerover", options.onHover );
				}
				if( options.onLeave instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerout", options.onLeave );
				}
				if( options.onMove instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointermove", options.onMove );
				}
				if( isInteractive ) {
					sprite.interactive = true;
					sprite.buttonMode = true;
				}
				body.sprite = sprite;
			}
			else if( !options.isDetector ) {
				// Create a debug object
				var sprite = new PIXI.Graphics();
				sprite.lineStyle( 2, 0xFFFFFF, options.outlineThickness || 1 );
				if( options.color ) {
					if( typeof options.color === "string" || options.color instanceof String ) {
						options.color = PIXI.utils.string2hex( options.color );
					}
					sprite.beginFill( options.color );
				}
				else {
					sprite.beginFill( PIXI.utils.string2hex( getRandomColor() ) );
				}
				switch( options.type.toLowerCase() ) {
					case "circle":
						sprite.drawCircle( 0, 0, options.radius );
						break;
					case "rectangle":
						sprite.drawRect( -options.width / 2, -options.height / 2, options.width, options.height );
						break;
					// TODO: Add Custom Polygon Object Support
					default:
						throw new Error( "Unsupported Object Type", options.type );
				}
				sprite.endFill();
				sprite.x = body.position.x;
				sprite.y = body.position.y;
				sprite.rotation = body.angle;
				objectSprite[ body.id ] = sprite;
				if( options.z ) {
					sprite.zIndex = options.z;
				}
				if( options.scale ) {
					sprite.scale.x = options.scale.x;
					sprite.scale.y = options.scale.y;
				}
				groupWorld.addChild( sprite );
				var isInteractive = false;
				if( options.onPress instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerdown", options.onPress );
				}
				if( options.onRelease instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerup", options.onRelease );
					sprite.on( "pointerupoutside", options.onRelease );
				}
				if( options.onHover instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerover", options.onHover );
				}
				if( options.onLeave instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointerout", options.onLeave );
				}
				if( options.onMove instanceof Function ) {
					isInteractive = true;
					sprite.on( "pointermove", options.onMove );
				}
				if( isInteractive ) {
					sprite.interactive = true;
					sprite.buttonMode = true;
				}
				body.sprite = sprite;
			}
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
		groupWorld.removeChild( objectSprite[ objects[ name ].id ] );
		delete objectSprite[ objects[ name ].id ];
		groupWorld.removeChild( objects[ name ] );
		Matter.Composite.remove( physics.world, objects[ name ] );
		delete objects[ name ];
		delete detectEnter[ name ]; // remove any detectors if exist
		delete detectExit[ name ]; // remove any detectors if exist
	}
}

function PlayObjectAnimation( name, animation, startFrame = 0, shouldLoop = false ) {
	if( objects[ name ] && objects[ name ].animations && objects[ name ].animations[ animation ] ) {
		objects[ name ].animations[ objects[ name ].currentAnimation ].visible = false;
		objects[ name ].animations[ objects[ name ].currentAnimation ].stop();
		objects[ name ].currentAnimation = animation;
		objects[ name ].animations[ objects[ name ].currentAnimation ].visible = true;
		objects[ name ].animations[ objects[ name ].currentAnimation ].loop = shouldLoop;
		objects[ name ].animations[ objects[ name ].currentAnimation ].gotoAndPlay( startFrame );
	}
}

function StopObjectAnimation( name ) {
	if( objects[ name ] && objects[ name ].animations ) {
		objects[ name ].animations[ objects[ name ].currentAnimation ].stop();
	}
}

function SetPosition( name, posX, posY ) {
	if( objects[ name ] ) {
		Matter.Body.setPosition( objects[ name ], { x: posX, y: posY } );
	}
}

function SetVelocity( name, velX, velY ) {
	if( objects[ name ] ) {
		Matter.Body.setVelocity( objects[ name ], { x: velX, y: velY } );
	}
}

function AddTimer( name, time, callback ) {
	try {
		// TODO: Check that the timer name doesn't already exist
		if( name ) {
			timers[ name ] = {
				time: time,
				callback: callback
			};
			return timers[ name ];
		}
	}
	catch( err ) {
		console.log( "Failed to add timer", err );
	}
	return null;
}

function ResetTimer( name, time ) {
	if( timers[ name ] ) {
		timers[ name ].time = time;
	}
}

function RemoveTimer( name ) {
	if( timers[ name ] ) {
		delete timers[ name ];
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

function AddParticles( name, options, x, y ) {
	try {
		// TODO: Check that the overlay name doesn't already exist
		if( name ) {
			let particleTimer = setInterval( function() {
				var texture = PIXI.Texture.fromImage( options.image || particleImage );
				// HACKHACKHACK: just for fireworks
				if( options.flySpeed ) {
					y -= options.flySpeed * 1000 / options.intensity;
				}
				for( var i = 0; i < 10; i++ ) {
					var pImage = new PIXI.Sprite( texture );
					pImage.anchor.set( 0.5 );
					pImage.x = x;
					pImage.y = y;
					pImage.blendMode = options.blendMode || PIXI.BLEND_MODES.ADD;
					if( typeof options.startColor === "string" || options.startColor instanceof String ) {
						options.startColor = PIXI.utils.string2hex( options.startColor );
					}
					if( typeof options.endColor === "string" || options.endColor instanceof String ) {
						options.endColor = PIXI.utils.string2hex( options.endColor );
					}
					options.angle = options.angle || 0;
					options.spread = options.spread || 0;
					options.lineDirection = options.lineDirection || 0;
					options.length = options.length || app.view.width;
					options.gravityX = options.gravityX || 0;
					options.gravityY = options.gravityY || 0;
					options.timeInterval = 1000 / options.intensity;
					pImage.tint = options.startColor;
					var particleLife = Math.random() * options.decay * 1000;
					var velocity = Math.random() * ( options.maxSpeed - options.minSpeed ) + options.minSpeed;
					var particle = {
						image: pImage,
						x: x,
						y: y,
						vX: 0,
						vY: 0,
						growOverTime: options.growOverTime || false,
						fadeOut: options.fadeOut || false,
						startColor: options.startColor,
						endColor: options.endColor,
						// angle: Math.random() * Math.PI * 2,
						velocity: velocity,
						gravityX: options.gravityX,
						gravityY: options.gravityY,
						maxLife: particleLife,
						life: particleLife
					};
					switch( options.shape ) {
						case "circle":
							particle.angle = Math.random() * Math.PI * 2;
							break;
						case "cone":
							particle.angle = options.angle + Math.random() * options.spread - options.spread / 2;
							break;
						case "line":
							particle.x += Math.cos( options.lineDirection ) * Math.random() * options.length;
							particle.y += Math.sin( options.lineDirection ) * Math.random() * options.length;
							particle.angle = options.angle + Math.random() * options.spread - options.spread / 2;
							break;
						default:
							particle.angle = options.angle;
					}

					particle.vX = Math.cos( particle.angle ) * velocity;
					particle.vY = Math.sin( particle.angle ) * velocity;
					pImage.x = particle.x;
					pImage.y = particle.y;
					var invProgress = particle.life / particle.maxLife;
					particle.image.scale = { x: invProgress, y: invProgress };
					// console.log( pImage );
					groupOverlay.addChild( pImage );
					particles[ name ].points.push( particle );
				}
			}, 1000 / options.intensity );
			particles[ name ] = {
				name: name,
				timer: particleTimer,
				options: options,
				points: []
			};
			return particles[ name ];
		}
	}
	catch( err ) {
		console.log( "Failed to add particles", err );
	}
	return null;
}

function RemoveParticles( name, options, x, y ) {
	if( particles[ name ] ) {
		clearInterval( particles[ name ].timer );
		particles[ name ].isDeleted = true;
	}
}

function Raycast( pointA, pointB ) {
	return Matter.Query.ray( Matter.Composite.allBodies( physics.world ), pointA, pointB );
}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function lerpColor( colorA, colorB, progress ) {
	try {
		var cA = PIXI.utils.hex2rgb( colorA );
		var cB = PIXI.utils.hex2rgb( colorB );
		var cResult = [ 0, 0, 0 ];
		for( var i = 0; i < 3; i++ ) {
			cResult[ i ] = cA[ i ] + ( cB[ i ] - cA[ i ] ) * progress;
		}
		return PIXI.utils.rgb2hex( cResult );
	}
	catch( err ) {
		console.log( err );
	}
}

var app = undefined;
var groupBacklay = undefined;
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
		groupBacklay = new PIXI.Container();
		groupBacklay.sortableChildren = true;
		app.stage.addChild( groupBacklay );
		groupWorld = new PIXI.Container();
		groupWorld.sortableChildren = true;
		app.stage.addChild( groupWorld );
		groupOverlay = new PIXI.Container();
		groupOverlay.sortableChildren = true;
		app.stage.addChild( groupOverlay );
		if( opts.channel ) {
			if( opts.username && opts.password ) {
				ComfyJS.Init( opts.username, opts.password, [ opts.channel ] );
			}
			else {
				ComfyJS.Init( opts.channel );
			}
			ComfyJS.onCommand = opts.onCommand;
			ComfyJS.onChat = opts.onChat;
		}
		physics = Matter.Engine.create();
		physics.world.gravity.x = opts.gravity ? opts.gravity.x : 0;
		physics.world.gravity.y = opts.gravity ? opts.gravity.y : 1;
		var topWall = false;
		var botWall = false;
		var leftWall = false;
		var rightWall = false;
		if( opts.screenWalls ) {
			topWall = botWall = leftWall = rightWall = true;
		}
		else if( typeof opts.screenWalls === "undefined" ) {
			if( opts.wallTop || opts.wallBottom || opts.wallLeft || opts.wallRight ) {
				topWall = opts.wallTop;
				botWall = opts.wallBottom;
				leftWall = opts.wallLeft;
				rightWall = opts.wallRight;
			}
			else {
				topWall = botWall = leftWall = rightWall = true;
			}
		}
		// Set Walls
		if( topWall ) {
			Matter.World.add( physics.world, [ Matter.Bodies.rectangle( opts.width / 2, -50, opts.width * 2, 100, { isStatic: true } ) ] );
		}
		if( botWall ) {
			Matter.World.add( physics.world, [ Matter.Bodies.rectangle( opts.width / 2, opts.height + 50, opts.width * 2, 100, { isStatic: true } ) ] );
		}
		if( leftWall ) {
			Matter.World.add( physics.world, [ Matter.Bodies.rectangle( -50, opts.height / 2, 100, opts.height * 2, { isStatic: true } ) ] );
		}
		if( rightWall ) {
			Matter.World.add( physics.world, [ Matter.Bodies.rectangle( opts.width + 50, opts.height / 2, 100, opts.height * 2, { isStatic: true } ) ] );
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
				else {
					if( detectEnter[ pair.bodyA.label ] ) {
						detectEnter[ pair.bodyA.label ]( pair.bodyB.label, pair.bodyB );
					}
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
				else {
					if( detectExit[ pair.bodyA.label ] ) {
						detectExit[ pair.bodyA.label ]( pair.bodyB.label, pair.bodyB );
					}
					if( detectExit[ pair.bodyB.label ] ) {
						detectExit[ pair.bodyB.label ]( pair.bodyA.label, pair.bodyA );
					}
				}
			}
		} );
		Matter.Engine.run( physics );
		particleImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAQAAAC0jZKKAAACPElEQVR4AbXXcW/TMBAF8EtCypa1LCDB9/98ILG1dKNNCOZZT8h6N4562eZTzH8/ni6dfWns4kqtvbMOT2tmv+0XasG/F1aTLFxd5lDcCS8o0tyX58K9bVA9WZe40LNNqLkevrJr1HvrC1vgQoM820/UqQZubQBKWDKjDJjP+wg41/J/eAOQsGb2rWDlvKzMTyEMaJvBIHNpBdswOfhoZ4VL2h3Irc+srSiJPYv9B1Mr3IHcCS2ZJTFf2+RZ1NEWD5PF7mmQ/nfs85I9klb4KrNCa2YkZitcXmVZpwL3zFtwpYH6l3cWtqDMPP+Fb+zWPthW6BvUIJmZuOTN7APqKOjB9vZAuAM6ArvFE9CSeI5Y1B7PPfAFMPKMKMWVZmbCzKusoveoKcODjQDzgx3c6GnUFnADOAFGV5V16B7PI2BkBRjgmf4IWBbYu8I6lPuhSa2w4xP8k7CF/l5Q7HuiZW9ST+wpjgKLvP9ed6gAJXztWcG/2CaAJ/tKlJSnm7RTTHHATQAnwAFKWCn/H3y2eH2L2ZfDIf06rXD8m768l//cAvzN/kBe709a8cPFQ4jXFA8hHpvVh1D9scmrqfbYrD/oO0s5caYrDvraqwlwW3811V6mvXUrLtOq6x+NYCt0vIqv/2hgcUPWqoFFRixlB9tEIxZHWKHJLmuGQraifijUMTbIq63QzDLGrh+8wVYO3rI6nzdohc+81H3cDHiijxvNfAJ9Wv855hJL5nnlB2Tw8ojzC7UelrXqk/cPn233eGpGsfAAAAAASUVORK5CYII=";

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
		var timeDiff = timestamp - prevStep;
		Object.keys( timers ).forEach( t => {
			if( timers[ t ].time > 0 ) {
				timers[ t ].time -= timeDiff;
				if( timers[ t ].time <= 0 ) {
					timers[ t ].callback();
				}
			}
		});
		for( var part in particles ) {
			if( particles[ part ].isDeleted && particles[ part ].points.length <= 0 ) {
				delete particles[ part ];
			}
			else {
				for( var p = 0; p < particles[ part ].points.length; p++ ) {
					var particle = particles[ part ].points[ p ];
					particle.life -= timeDiff;
					if( particle.life <= 0 ) {
						// DELETE!
						particles[ part ].points.splice( p, 1 );
						groupOverlay.removeChild( particle.image );
						p--;
						continue;
					}
					else {
						particle.vX += particle.gravityX / 10000 * timeDiff;
						particle.vY += particle.gravityY / 10000 * timeDiff;
						particle.x += particle.vX * timeDiff;
						particle.y += particle.vY * timeDiff;
						particle.image.x = particle.x;
						particle.image.y = particle.y;
						var invProgress = particle.life / particle.maxLife;
						var progress = 1.0 - invProgress;
						if( particle.fadeOut ) {
							particle.image.alpha = invProgress;
						}
						if( particle.growOverTime ) {
							particle.image.scale = { x: progress, y: progress };
						}
						else {
							particle.image.scale = { x: invProgress, y: invProgress };
						}
						particle.image.tint = lerpColor( particle.startColor, particle.endColor, progress );
						// console.log( particle );
					}
				};
			}
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
	LoadCustom: LoadAssetCustom,
	Crop: CropAsset,
	AddBacklay: AddBacklay,
	RemoveBacklay: RemoveBacklay,
	AddOverlay: AddOverlay,
	RemoveOverlay: RemoveOverlay,
	AddObject: AddObject,
	RemoveObject: RemoveObject,
	ConnectObjects: ConnectObjects,
	DisconnectObjects: DisconnectObjects,
	PlayObjectAnimation: PlayObjectAnimation,
	StopObjectAnimation: StopObjectAnimation,
	AddText: AddText,
	RemoveText: RemoveText,
	AddDetector: AddDetector,
	RemoveDetector: RemoveDetector,
	AddParticles: AddParticles,
	RemoveParticles: RemoveParticles,
	AddTimer: AddTimer,
	ResetTimer: ResetTimer,
	RemoveTimer: RemoveTimer,
	SetPosition: SetPosition,
	SetVelocity: SetVelocity,
	PlaySound: PlaySound,
	Raycast: Raycast,
	Assets: assetReference,
	Overlays: overlays,
	Objects: objects
};

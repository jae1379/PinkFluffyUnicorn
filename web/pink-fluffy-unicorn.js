function Load() {
  // Load all assets here
  LoadImage( "unicorn", "assets/Unicorn.png" );
}

function Init() {
  // Add Initialization Here
  AddImageObject( 100, 100, "unicorn" );
}

function Update( timeDiffInMs ) {
  // Add Update Loop
  // console.log( timeDiffInMs );
}

function OnChatCommand( user, command, message, flags ) {
  // Handle Chat Commands
  if( flags.broadcaster && command == "test" ) {
    console.log( "!test was typed in chat" );
  }
}

function OnChatMessage( user, message, flags, self ) {
  // Handle Chat Messages
  console.log( message );
}

ComfyJS.onCommand = OnChatCommand;
ComfyJS.onChat = OnChatMessage;
ComfyJS.Init( "instafluff" );

var assetReference = {};

function LoadImage( name, path ) {
  assetReference[ name ] = PIXI.Texture.fromImage(path);
  // if( phaser ) {
  //   phaser.load.image( name, path );
  // }
}

function LoadAudio( name, path ) {
  // TODO!
}

function AddImageObject( x, y, imageName ) {
  let sprite = new PIXI.Sprite(
    assetReference[ imageName ]
  );
  app.stage.addChild( sprite );
  if( phaser ) {
    phaser.add.image( x, y, imageName );
  }
}

let app = new PIXI.Application({
    width: 1280,         // default: 800
    height: 720,        // default: 600
    antialias: true,    // default: false
    transparent: true, // default: false
    resolution: 1       // default: 1
  }
);

var prevStep = -1;
function updateTheUnicorn( timestamp ) {
  if( prevStep < 0 ) {
    prevStep = timestamp;
  }
  Update( timestamp - prevStep );
  prevStep = timestamp;
  window.requestAnimationFrame( updateTheUnicorn );
}

window.addEventListener('load', () => {
  document.getElementById("unicorn-display").appendChild( app.view );
  Load();
  Init();
  window.requestAnimationFrame( updateTheUnicorn );
});
//
// var config = {
// 	type: Phaser.CANVAS,
// 	width: 1280,
// 	height: 720,
// 	transparent: true,
// 	parent: 'unicorn-display',
// 	physics: {
// 			default: 'arcade',
// 			arcade: {
// 					// debug: true,
// 					gravity: { y: 200 }
// 			}
// 	},
// 	scene: {
//     preload: preload,
//     create: create,
//     update: update
// 	},
//   audio: {
//   	disableWebAudio: true
//   }
// };

// var game = new Phaser.Game(config);
var phaser = undefined;

function preload () {
  phaser = this;
}

function create () {
	phaser.game.antialias = true;
	phaser.game.clearBeforeRender = true;
  Init();
}

function update( time, delta ) {
  Update( delta );
}

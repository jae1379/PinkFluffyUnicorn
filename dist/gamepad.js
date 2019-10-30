// import * as WEE from './eventemitter.js'

class GamepadClass extends EventEmitter {
  constructor() {
    super();
  }
  connect( gamepad ) {
    this.emit( "connected", gamepad );
  }
  disconnect( gamepad ) {
    this.emit( "disconnect", gamepad );
  }
  update( gamepad ) {
    this.emit( "update", gamepad );
  }
}

let gamepad = new GamepadClass();

var haveEvents = 'ongamepadconnected' in window;
var controllers = {};

function connecthandler(e) {
  controllers[ e.gamepad.index ] = e.gamepad;
  gamepad.connect( e.gamepad );
  requestAnimationFrame( updateStatus );
}

function disconnecthandler(e) {
  delete controllers[ e.gamepad.index ];
  gamepad.disconnect( e.gamepad );
}

function updateStatus() {
  if( !haveEvents ) {
    scangamepads();
  }

  var i = 0;
  var j;

  for (j in controllers) {
    var controller = controllers[ j ];
    gamepad.update( controller );
  }

  requestAnimationFrame( updateStatus );
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        var e = gamepads[i];
        controllers[ e.gamepad.index ] = e.gamepad;
        gamepad.connect( e.gamepad );
        requestAnimationFrame( updateStatus );
      }
    }
  }
}

window.addEventListener( "gamepadconnected", connecthandler );
window.addEventListener( "gamepaddisconnected", disconnecthandler );
//
// if( !haveEvents ) {
//   setInterval( scangamepads, 500 );
// }

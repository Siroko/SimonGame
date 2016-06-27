/**
 * Created by siroko on 6/27/16.
 */
var GamePads = function(){


};

GamePads.prototype.update = function(){
    // Loop over every gamepad and if we find any that have a pose use it.
    var vrGamepads = [];
    var gamepads = navigator.getGamepads();
    for (var i = 0; i < gamepads.length; ++i) {
        var gamepad = gamepads[i];

        // The array may contain undefined gamepads, so check for that as
        // well as a non-null pose.
        if (gamepad && gamepad.pose) {
            vrGamepads.push(gamepad);
            if ("vibrate" in gamepad) {
                for (var j = 0; j < gamepad.buttons.length; ++j) {
                    if (gamepad.buttons[j].pressed) {
                        //gamepad.vibrate(1000);
                        // Vibrate the gamepad relative to the amount the button is pressed.
                        var vibrationDelay = (500 * (1.0 - gamepad.buttons[j].value)) + 100;
                        if (t - lastVibration > vibrationDelay) {
                            gamepad.vibrate(100);
                            lastVibration = t;
                        }
                        break;
                    }
                }
            }
        }
    }
};

module.exports = GamePads;
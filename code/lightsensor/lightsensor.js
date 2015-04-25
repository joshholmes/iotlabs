var five = require("johnny-five");

var board = new five.Board();

board.on("ready", function(){
  console.log("Board connected...");

  var light = new five.Sensor("A0");

  light.on("change", function() {
    var lightValue = Math.round(this.value * .1);

    //JOSH - check console.write
    console.log("Light is @ " + lightValue + "%");
  });      
});

var os = require('os');

var five = require("johnny-five");

function getBoardOnYun()
{
  var serialport = require("serialport");

        var serialPort = new serialport.SerialPort("/dev/ttyATH0", {
           baudrate: 57600
   });
      return new five.Board({
              port: serialPort,
              debug: true
    });
}

module.exports.getBoard = function() {
  var OS = os.platform();

  console.log("OS: " + os.platform());

  if (OS == "win32") {
    return new five.Board(
      { port: "COM7"}); // Make sure that this is your COM Port
  }
  if (OS == "darwin") { // This is OSX
    return new five.Board();
  }
  if (OS == "linux")
  {
    return getBoardOnYun();
  }
}

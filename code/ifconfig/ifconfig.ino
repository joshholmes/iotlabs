#include <Process.h>

void setup() {
  // Initialize Bridge
  Bridge.begin();

  // Initialize Serial
  Serial.begin(9600);
  
  //Wait on the serial port to connect
  while (!Serial);

  Serial.println("Ready.");
}

void loop() {
  // Wait until a Serial Monitor is connected.
  if (Serial)
  {
    Serial.println("running ifconfig.");
    // run various example processes
    runIFConfig();
    
    delay(10000);
  }
}

void runIFConfig() {
  // Launch "curl" command and get Arduino ascii art logo from the network
  // curl is command line program for transferring data using different internet protocols
  Process p;        // Create a process and call it "p"
  p.begin("ifconfig");  // Process that launch the "curl" command
  p.run();      // Run the process and wait for its termination

  // Print arduino logo over the Serial
  // A process output can be read with the stream methods
  while (p.available()>0) {
    char c = p.read();
    Serial.print(c);
  }
  // Ensure the last bit of data is sent.
  Serial.flush();
}

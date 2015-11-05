#include <IRremote.h>

#define IRPIN 10

IRrecv irrecv(A2);
IRsend irsend;
String buf;
String mode;

void setup() {
  irrecv.enableIRIn();
  Serial.begin(9600);
  buf = "";
  mode = "nec";
}

void send(String data) {
  unsigned long code = strtol(data.c_str(), NULL, 16);
  if (code < 0) {
    Serial.print("error: invalid code" + data + "\n");
    return;
  }
   
  if (mode == "sony")
    irsend.sendSony(code, IRPIN);
  else if (mode == "samsung")
    irsend.sendSAMSUNG(code, IRPIN);
  else if (mode == "nec")
    irsend.sendNEC(code, IRPIN);
  else
    Serial.print("error: unknown mode " + mode + "\n");
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n') {
      if (buf == "sony" || buf == "nec" || buf == "samsung") {
        mode = buf;
        Serial.print("set mode to " + mode + "\n");
      } else {
        send(buf);
      }
      buf = "";
    } else {
      buf += c;
    }
  }
}


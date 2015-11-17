#include <IRremote.h>

IRrecv irrecv(A2);
IRsend irsend; // hard-coded to pin 3
String buf;
String mode;

void setup() {
  irrecv.enableIRIn();
  Serial.begin(9600);
  buf = "";
  mode = "samsung";
}

void send(unsigned long code) {
  Serial.print("sending ");
  Serial.println(code, HEX);
  
  for (int i = 0; i < 3; i++) {
    if (mode == "sony")
      irsend.sendSony(code, 32);
    else if (mode == "rc5")
      irsend.sendRC6(code, 32);
    else if (mode == "rc6")
      irsend.sendRC5(code, 32);
    else if (mode == "samsung")
      irsend.sendSAMSUNG(code, 32);
    else if (mode == "nec") 
      irsend.sendNEC(code, 32);
    else
      Serial.print("error: unknown mode " + mode + "\n");
      
    delay(40);
  }

  Serial.print("end\n");
}

unsigned long convert(const char *data) {
  unsigned long result = 0;
  
  for (char c = *data; c != '\0'; c = *++data) {
    int part = 0;
    if (c >= '0' && c <= '9')
      part = c - '0';
    else if (c>= 'a' && c <= 'f')
      part = c - 'a' + 0xa;
    else if (c >= 'A' && c <= 'F')
      part = c - 'A' + 0xA;
    
    result <<= 4;
    result += part;
  }

  return result;
}

void sender() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n') {
      if (buf == "sony" || buf == "nec" || buf == "samsung") {
        mode = buf;
        Serial.print("set mode to " + mode + "\n");
      } else {
        send(convert(buf.c_str()));
      }
      buf = "";
    } else {
      buf += c;
    }
  }
}

void listener() {
  decode_results results;
  if (irrecv.decode(&results)) {
    Serial.print(results.decode_type);
    Serial.print(" (");
    Serial.print(results.bits);
    Serial.print("): ");
    Serial.println(results.value, HEX);
    irrecv.resume();
  }
}

void loop() {
  sender();
  //listener();
}


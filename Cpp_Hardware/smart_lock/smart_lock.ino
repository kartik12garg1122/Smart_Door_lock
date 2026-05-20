#include <LiquidCrystal.h>
#include <Keypad.h>

// ── Pin Definitions ─────────────────────────────────────────
#define RELAY_PIN   4    // Relay signal → controls solenoid lock

// ── Keypad Setup (4×4) ──────────────────────────────────────
const byte ROWS = 4;
const byte COLS = 4;
char hexaKeys[ROWS][COLS] = {
  { '1', '2', '3', 'A' },
  { '4', '5', '6', 'B' },
  { '7', '8', '9', 'C' },
  { '*', '0', '#', 'D' }
};

// Keypad Rows: D13, D12, D11, D10
byte rowPins[ROWS] = { 13, 12, 11, 10 };
// Keypad Cols: D9, D8, D7, D6 (C4 moved to D6)
byte colPins[COLS] = {  9,  8,  7,  6 };

Keypad customKeypad = Keypad(makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS);

// ── LCD Setup (Parallel) ────────────────────────────────────
// Pins: RS, E, D4, D5, D6, D7
// NOTE: We moved D5 and D6 to Analog pins A1 and A2 so we don't break the Serial USB connection!
LiquidCrystal lcd(5, 3, 2, A1, A2, A0);

// ── OTP Variables ───────────────────────────────────────────
String receivedOTP = "";    
bool   otpReady    = false; 
const int OTP_LENGTH = 4;   
String serialBuffer = "";
bool isDisplayingReady = false;

// ============================================================
//  SETUP
// ============================================================
void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Start HIGH (locked) for active-LOW relay

  Serial.begin(9600);   
  lcd.begin(16, 2);

  lcdPrint("  Smart Secure", "  Door  Lock");
  isDisplayingReady = true;

  Serial.println("STATUS:SYSTEM_READY");
}

// ============================================================
//  MAIN LOOP
// ============================================================
void loop() {
  readSerialFromPython();

  if (!otpReady) {
    if (!isDisplayingReady) {
      lcdPrint("   OTP Based", "  Door  Lock");
      isDisplayingReady = true;
    }
  } else {
    if (isDisplayingReady) {
      lcdPrint("Enter OTP :", "");
      isDisplayingReady = false;
    }
    getOTPFromKeypad();
  }
}

// ============================================================
//  READ SERIAL FROM PYTHON
// ============================================================
void readSerialFromPython() {
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\n') {
      serialBuffer.trim();

      if (serialBuffer.startsWith("OTP:")) {
        receivedOTP = serialBuffer.substring(4);
        otpReady    = true;
        Serial.println("STATUS:OTP_RECEIVED");
      }
      else if (serialBuffer == "OPEN") {
        unlockDoor();
      }

      serialBuffer = "";
    } else {
      serialBuffer += c;
    }
  }
}

// ============================================================
//  GET OTP FROM KEYPAD
// ============================================================
void getOTPFromKeypad() {
  String entered = "";

  while (true) {
    char key = customKeypad.getKey();

    if (key) {
      if (key == '*') {
        entered = "";
        lcdPrint("Enter OTP :", "");
        continue;
      }
      if (key == '#') break;

      if (key >= '0' && key <= '9') {
        entered += key;

        String masked = "";
        for (int i = 0; i < (int)entered.length(); i++) masked += '*';
        lcd.setCursor(0, 1);
        lcd.print("                ");
        lcd.setCursor(0, 1);
        lcd.print(masked);

        if ((int)entered.length() == OTP_LENGTH) {
          delay(300);
          break;
        }
      }
    }
    // Still allow python to send OPEN while someone is typing OTP
    readSerialFromPython();
    if (!otpReady) return; // if OTP state got reset
  }

  Serial.print("INFO:Entered OTP: ");
  Serial.println(entered);

  if (entered == receivedOTP) {
    Serial.println("STATUS:OTP_CORRECT");
    lcdPrint("Access Granted", "Door Opening..");
    unlockDoor();
  } else {
    Serial.println("STATUS:OTP_WRONG");
    lcdPrint("Access Failed", "Try Again !!!");
    delay(3000);
    resetOTPState();
  }
}

// ============================================================
//  UNLOCK DOOR
// ============================================================
void unlockDoor() {
  Serial.println("STATUS:ACCESS_GRANTED");
  digitalWrite(RELAY_PIN, LOW);    // Energise active-low relay
  delay(5000);                      // Open for 5 seconds
  digitalWrite(RELAY_PIN, HIGH);   // Re-lock
  Serial.println("STATUS:LOCKED");
  lcdPrint("Door Locked", "System Ready");
  delay(1000);
  resetOTPState();
}

// ============================================================
//  RESET OTP STATE
// ============================================================
void resetOTPState() {
  receivedOTP  = "";
  otpReady     = false;
  serialBuffer = "";
  isDisplayingReady = false;
  Serial.println("INFO:Ready for next session");
}

// ============================================================
//  LCD HELPER
// ============================================================
void lcdPrint(String line1, String line2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1);
  lcd.setCursor(0, 1);
  lcd.print(line2);
}

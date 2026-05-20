# Smart Secure Door Lock — OTP System Setup Guide

## Files Overview

| File | Purpose |
|---|---|
| `backend/otp_system.py` | Main Python script — generates OTP, emails it, talks to Arduino |
| `arduino/smart_lock_otp.ino` | Arduino sketch — receives OTP, reads keypad, unlocks door |

---

## Step 1 — Install Python Dependencies

```bash
pip install pyserial
```

> `smtplib` and `email` are part of Python's standard library — no install needed.

---

## Step 2 — Gmail App Password Setup

> **Important:** Gmail blocks sign-in from scripts using your normal password.  
> You must create a dedicated **App Password**.

1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)  
2. Scroll to **"How you sign in to Google"** → click **2-Step Verification** → enable it  
3. Go back to Security, search for **"App passwords"**  
4. Select app: **Mail** | Device: **Other (Custom name)** → type `SmartDoorLock`  
5. Click **Generate** — copy the **16-character password** (spaces don't matter)  
6. Paste it into `otp_system.py`:

```python
SENDER_EMAIL        = "your_gmail@gmail.com"
SENDER_APP_PASSWORD = "abcd efgh ijkl mnop"   # ← 16-char App Password here
RECIPIENT_EMAIL     = "recipient@example.com"
```

---

## Step 3 — Find Your Arduino COM Port

1. Plug in your Arduino via USB  
2. Open Arduino IDE → **Tools → Port** — note the COM port (e.g. `COM3`)  
3. Set it in `otp_system.py`:

```python
SERIAL_PORT = "COM3"   # ← your Arduino port
```

Or run this one-liner in Python to list ports:

```python
import serial.tools.list_ports
for p in serial.tools.list_ports.comports():
    print(p.device, p.description)
```

---

## Step 4 — Upload Arduino Sketch

1. Open `arduino/smart_lock_otp.ino` in Arduino IDE  
2. Install the **Keypad** library: `Sketch → Include Library → Manage Libraries` → search `Keypad` by Mark Stanley  
3. Select your board (**Arduino Uno / Nano**) and COM port  
4. Click **Upload**  
5. Open **Serial Monitor** (baud: 9600) — you should see `STATUS:SYSTEM_READY`

---

## Step 5 — Wiring Diagram

```
Arduino Uno
────────────────────────────────────────────
Relay Signal  → D7   (door lock control)
Relay VCC     → 5V
Relay GND     → GND

4×4 Keypad Row Pins  → D2, D3, D4, D5
4×4 Keypad Col Pins  → D8, D9, D10, D11

Solenoid 12V Lock → Relay COM/NO terminals
12V Power Supply  → Solenoid + Relay power

(Optional LCD 16×2 I2C)
LCD SDA → A4
LCD SCL → A5
LCD VCC → 5V
LCD GND → GND
```

---

## Step 6 — Run the Python Script

```bash
cd "e:\IP Project II\Attempt2\backend"
python otp_system.py
```

### Expected Console Output

```
============================================================
  Smart Secure Door Lock — OTP Authentication System
============================================================
[SERIAL] Available COM ports:
         COM3  —  USB-SERIAL CH340

[OTP] Generated OTP: 847392  (DEBUG — remove in production)

[EMAIL] Connecting to Gmail SMTP server (smtp.gmail.com:587)...
[EMAIL] Logging in...
[EMAIL] Sending OTP email to: recipient@example.com
[EMAIL] ✅ OTP email sent successfully!

[SERIAL] Opening serial port COM3 at 9600 baud...
[SERIAL] Waiting for Arduino to initialise...
[ARDUINO] STATUS:SYSTEM_READY
[SERIAL] ✅ Sent OTP to Arduino: OTP:847392

[MONITOR] Waiting up to 60s for Arduino response...
[ARDUINO] STATUS:OTP_RECEIVED
[ARDUINO] INFO:Key pressed: 8
... (user types on keypad)
[ARDUINO] STATUS:OTP_CORRECT
[ARDUINO] STATUS:ACCESS_GRANTED
[MONITOR] ✅ OTP verified! Door unlocked.
[ARDUINO] STATUS:LOCKED

============================================================
  RESULT: ✅ Access Granted — Door Unlocked
============================================================
```

---

## How Email Sending Works

```
Python Script
    │
    │  smtplib.SMTP("smtp.gmail.com", 587)
    │  → server.starttls()          ← encrypts the connection
    │  → server.login(email, app_password)
    │  → server.sendmail(...)
    ▼
Gmail SMTP Server
    │
    ▼
Recipient's Inbox  ✉️
```

- Port **587** = Standard SMTP with STARTTLS encryption  
- **App Password** = A special 16-char password Gmail generates for apps (not your login password)  
- The email contains the OTP in plaintext — user checks their phone/email and enters it on the keypad

---

## How Serial Communication Works

```
Python (otp_system.py)            Arduino (smart_lock_otp.ino)
──────────────────────            ─────────────────────────────
ser.write("OTP:847392\n") ──────► Serial.read() until '\n'
                                  → stores "847392" as receivedOTP
                                  → Keypad.getKey() collects digits
                                  → compares enteredOTP == receivedOTP
ser.readline() ◄─────────────────  Serial.println("STATUS:OTP_CORRECT")
                                  → digitalWrite(RELAY_PIN, LOW)  ← UNLOCK
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `SMTPAuthenticationError` | Use App Password, not your Gmail password. Enable 2FA first. |
| `SerialException: COM3 not found` | Check Arduino is plugged in. Find correct port via Arduino IDE. |
| Arduino resets on Serial open | Normal — Arduino resets when Python opens the port. Script waits 2s for boot. |
| Wrong OTP length | Make sure `OTP_LENGTH` in Python matches `OTP_LENGTH` in Arduino sketch. |
| Relay clicking but door not unlocking | Check relay is wired to COM/NO (not COM/NC). Check 12V supply. |

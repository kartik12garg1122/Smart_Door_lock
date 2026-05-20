"""
=============================================================
  Smart Secure Door Lock — OTP System
=============================================================
  Description:
    - Generates a secure random 6-digit OTP
    - Sends the OTP to a specified email via Gmail SMTP
    - Transmits the OTP to Arduino over Serial (COM port)
    - Arduino compares the OTP with keypad input

  Prerequisites:
    pip install pyserial

  Gmail App Password Setup:
    1. Go to https://myaccount.google.com/security
    2. Enable 2-Step Verification (if not already)
    3. Go to "App Passwords" (search in Google Account)
    4. Select "Mail" + your device, then click Generate
    5. Copy the 16-character password — use it as SENDER_APP_PASSWORD below

  Author: Smart Secure Project
  Date  : 2026-03-26
=============================================================
"""

import smtplib                        # Built-in library for SMTP email sending
import random                         # For generating random OTP digits
import time                           # For adding delays
import serial                         # pip install pyserial — for Arduino communication
import serial.tools.list_ports        # To list available COM ports
from email.mime.text import MIMEText  # For creating plain-text email body
from email.mime.multipart import MIMEMultipart  # For constructing multi-part email


# =============================================================
#   CONFIGURATION — Edit these values before running
# =============================================================

SENDER_EMAIL       = "your_email@gmail.com"      # Your Gmail address
SENDER_APP_PASSWORD = "xxxx xxxx xxxx xxxx"      # 16-char Gmail App Password (NOT your login password)
RECIPIENT_EMAIL    = "recipient@example.com"     # The email address to send the OTP to

OTP_LENGTH         = 6       # Change to 4 if you want a 4-digit OTP
SERIAL_PORT        = "COM3"  # Arduino COM port — check Arduino IDE → Tools → Port
BAUD_RATE          = 9600    # Must match Serial.begin() in your Arduino sketch
SERIAL_TIMEOUT     = 5       # Seconds to wait for Arduino response

# =============================================================
#   STEP 1: Generate a Secure OTP
# =============================================================

def generate_otp(length: int = OTP_LENGTH) -> str:
    """
    Generates a cryptographically secure random OTP.
    Uses random.SystemRandom() which relies on OS entropy — safer than random.randint().
    
    Args:
        length: Number of digits in the OTP (4 or 6 recommended)
    
    Returns:
        OTP as a zero-padded string (e.g., "047382")
    """
    secure_random = random.SystemRandom()
    digits = [str(secure_random.randint(0, 9)) for _ in range(length)]
    return "".join(digits)


# =============================================================
#   STEP 2: Send OTP via Gmail SMTP
# =============================================================

def send_otp_email(otp: str, recipient: str) -> bool:
    """
    Sends the OTP to the recipient's email using Gmail's SMTP server.
    
    How it works:
        - Gmail's SMTP server (smtp.gmail.com) on port 587 allows sending email
        - We use STARTTLS to encrypt the connection
        - Authentication uses your Gmail address + App Password (NOT your login password)
        - The email is formatted as a simple plain-text message
    
    Args:
        otp      : The generated OTP string
        recipient: Destination email address
    
    Returns:
        True if email sent successfully, False otherwise
    """
    # --- Build the email message ---
    message = MIMEMultipart("alternative")
    message["Subject"] = "🔐 Smart Door Lock — Your OTP Code"
    message["From"]    = SENDER_EMAIL
    message["To"]      = recipient

    # Plain-text email body
    body = f"""
Smart Secure Door Lock System
==============================

Your One-Time Password (OTP) is:

    ➤  {otp}

This OTP is valid for one-time use only.
Enter it on the keypad within 60 seconds to unlock the door.

If you did not request this OTP, please ignore this email.

— Smart Secure System
"""
    message.attach(MIMEText(body, "plain"))

    # --- Connect to Gmail SMTP and send ---
    try:
        print("[EMAIL] Connecting to Gmail SMTP server (smtp.gmail.com:587)...")
        
        # smtplib.SMTP() opens a plain connection to port 587
        with smtplib.SMTP("smtp.gmail.com", port=587, timeout=10) as server:
            server.ehlo()              # Identify ourselves to the server
            server.starttls()          # Upgrade connection to encrypted TLS
            server.ehlo()              # Re-identify after TLS upgrade
            
            print("[EMAIL] Logging in...")
            server.login(SENDER_EMAIL, SENDER_APP_PASSWORD)  # Authenticate
            
            print(f"[EMAIL] Sending OTP email to: {recipient}")
            server.sendmail(SENDER_EMAIL, recipient, message.as_string())
        
        print("[EMAIL] ✅ OTP email sent successfully!")
        return True

    except smtplib.SMTPAuthenticationError:
        # Wrong email or App Password
        print("[EMAIL] ❌ Authentication failed!")
        print("         Check SENDER_EMAIL and SENDER_APP_PASSWORD in the config section.")
        print("         Make sure you are using an App Password, not your Gmail login password.")
        return False

    except smtplib.SMTPConnectError:
        print("[EMAIL] ❌ Could not connect to Gmail SMTP server.")
        print("         Check your internet connection.")
        return False

    except TimeoutError:
        print("[EMAIL] ❌ Connection timed out. Check your internet/firewall settings.")
        return False

    except Exception as e:
        print(f"[EMAIL] ❌ Unexpected error: {e}")
        return False


# =============================================================
#   STEP 3: Send OTP to Arduino via Serial
# =============================================================

def list_com_ports():
    """Prints all available COM ports — helpful for finding your Arduino port."""
    ports = serial.tools.list_ports.comports()
    if ports:
        print("[SERIAL] Available COM ports:")
        for port in ports:
            print(f"         {port.device}  —  {port.description}")
    else:
        print("[SERIAL] No COM ports found. Is the Arduino plugged in?")


def send_otp_to_arduino(otp: str) -> bool:
    """
    Sends the OTP string to the Arduino over USB Serial.
    
    How it works:
        - Python opens a serial connection to the Arduino's COM port
        - It sends the OTP followed by a newline character ('\\n')
        - Arduino reads until '\\n' to get the complete OTP string
        - Arduino stores it and compares it against keypad input

    Args:
        otp: The OTP string to transmit

    Returns:
        True if transmission succeeded, False otherwise
    """
    try:
        print(f"[SERIAL] Opening serial port {SERIAL_PORT} at {BAUD_RATE} baud...")
        
        # Open the serial connection
        # timeout = how long to wait for a response from Arduino
        with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=SERIAL_TIMEOUT) as ser:
            
            # Wait for Arduino to boot (it resets when serial opens)
            print("[SERIAL] Waiting for Arduino to initialise...")
            time.sleep(2)
            
            # Read any startup messages from Arduino
            while ser.in_waiting:
                startup_msg = ser.readline().decode("utf-8", errors="ignore").strip()
                if startup_msg:
                    print(f"[ARDUINO] {startup_msg}")
            
            # Send the OTP — Arduino expects: "<OTP>\n"
            otp_message = f"OTP:{otp}\n"
            ser.write(otp_message.encode("utf-8"))
            print(f"[SERIAL] ✅ Sent OTP to Arduino: {otp_message.strip()}")
            
            # Wait and read Arduino's acknowledgement
            time.sleep(0.5)
            while ser.in_waiting:
                response = ser.readline().decode("utf-8", errors="ignore").strip()
                if response:
                    print(f"[ARDUINO] {response}")
        
        return True

    except serial.SerialException as e:
        print(f"[SERIAL] ❌ Serial error: {e}")
        print(f"         Is {SERIAL_PORT} correct? Run with --list-ports to see available ports.")
        return False

    except Exception as e:
        print(f"[SERIAL] ❌ Unexpected serial error: {e}")
        return False


# =============================================================
#   STEP 4: Monitor Arduino for OTP Verification Result
# =============================================================

def monitor_arduino_response(timeout_seconds: int = 60) -> str:
    """
    Listens on the serial port for the Arduino's OTP verification result.
    
    Expected Arduino messages:
        STATUS:OTP_CORRECT   — User entered the correct OTP, door unlocked
        STATUS:OTP_WRONG     — User entered wrong OTP
        STATUS:OTP_TIMEOUT   — User did not enter OTP in time
        STATUS:ACCESS_GRANTED — Door has been unlocked
        STATUS:LOCKED         — Door has been re-locked

    Args:
        timeout_seconds: Maximum time to wait for a result

    Returns:
        The final status string from Arduino
    """
    print(f"\n[MONITOR] Waiting up to {timeout_seconds}s for Arduino response...")
    
    try:
        with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
            start_time = time.time()
            
            while (time.time() - start_time) < timeout_seconds:
                if ser.in_waiting:
                    line = ser.readline().decode("utf-8", errors="ignore").strip()
                    if line:
                        print(f"[ARDUINO] {line}")
                        
                        # Check for terminal states
                        if "OTP_CORRECT" in line or "ACCESS_GRANTED" in line:
                            print("[MONITOR] ✅ OTP verified! Door unlocked.")
                            return "SUCCESS"
                        
                        elif "OTP_WRONG" in line:
                            print("[MONITOR] ❌ Wrong OTP entered.")
                            return "WRONG_OTP"
                        
                        elif "OTP_TIMEOUT" in line or "LOCKED" in line:
                            print("[MONITOR] ⏰ OTP timed out. Door remains locked.")
                            return "TIMEOUT"
                
                time.sleep(0.1)
            
            print("[MONITOR] ⏰ Python monitoring timeout reached.")
            return "TIMEOUT"

    except serial.SerialException as e:
        print(f"[MONITOR] ❌ Serial error while monitoring: {e}")
        return "ERROR"


# =============================================================
#   MAIN — Entry Point
# =============================================================

def main():
    print("=" * 60)
    print("  Smart Secure Door Lock — OTP Authentication System")
    print("=" * 60)
    
    # --- List available COM ports (useful for first-time setup) ---
    list_com_ports()
    print()
    
    # --- Generate OTP ---
    otp = generate_otp(OTP_LENGTH)
    print(f"[OTP] Generated OTP: {otp}  (DEBUG — remove in production)")
    print()
    
    # --- Send OTP via Email ---
    email_success = send_otp_email(otp, RECIPIENT_EMAIL)
    print()
    
    if not email_success:
        print("[MAIN] ⚠️  Email failed. Proceeding to send OTP to Arduino anyway...")
    
    # --- Send OTP to Arduino ---
    serial_success = send_otp_to_arduino(otp)
    print()
    
    if not serial_success:
        print("[MAIN] ❌ Could not send OTP to Arduino. Exiting.")
        return
    
    # --- Monitor Arduino for result ---
    result = monitor_arduino_response(timeout_seconds=60)
    
    print()
    print("=" * 60)
    if result == "SUCCESS":
        print("  RESULT: ✅ Access Granted — Door Unlocked")
    elif result == "WRONG_OTP":
        print("  RESULT: ❌ Access Denied — Incorrect OTP")
    else:
        print("  RESULT: ⏰ Session Expired — Door Remains Locked")
    print("=" * 60)


# --- Run the script ---
if __name__ == "__main__":
    # Uncomment the next line to only list COM ports without running the full flow:
    # list_com_ports(); exit()
    main()

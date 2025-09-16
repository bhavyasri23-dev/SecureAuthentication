from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)   # allow calls from your frontend

# Temporary store for OTPs
otp_store = {}

# Endpoint 1 → Send OTP
@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    phone = data.get("phone")

    if not phone:
        return jsonify({"error": "Phone number required"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[phone] = otp

    print(f"OTP for {phone}: {otp}")  # Debug log
    return jsonify({"message": "OTP sent successfully", "otp": otp})  # show OTP for testing


# Endpoint 2 → Verify OTP
@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    phone = data.get("phone")
    user_otp = data.get("otp")

    if not phone or not user_otp:
        return jsonify({"error": "Phone and OTP required"}), 400

    if otp_store.get(phone) == user_otp:
        return jsonify({"message": "OTP verified successfully"})
    else:
        return jsonify({"error": "Invalid OTP"}), 400


if __name__ == "__main__":
    app.run(debug=True)


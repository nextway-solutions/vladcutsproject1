from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Config - In production, use environment variables
# For this preview, these are placeholders or expected to be set in the OS
SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
MAIL_USERNAME = os.environ.get('MAIL_USERNAME', 'vladd.cuts@gmail.com')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', 'your_app_password')

@app.route('/api/send-email', methods=['POST'])
def send_email():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    name = data.get('name')
    email = data.get('email')
    topic = data.get('topic')
    message = data.get('message')
    
    if not all([name, email, topic, message]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = MAIL_USERNAME
        msg['To'] = MAIL_USERNAME  # Send to self (Vlad)
        msg['Subject'] = f"New Contact: {topic} from {name}"
        
        body = f"""
        New message from Website Contact Form:
        
        Name: {name}
        Email: {email}
        Topic: {topic}
        
        Message:
        {message}
        """
        msg.attach(MIMEText(body, 'plain'))

        # Connect to server
        # Note: This requires valid credentials to actually work
        if os.environ.get('MAIL_PASSWORD'):
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            text = msg.as_string()
            server.sendmail(MAIL_USERNAME, MAIL_USERNAME, text)
            server.quit()
            return jsonify({'message': 'Email sent successfully!'}), 200
        else:
            # Simulation mode if no password set
            print("--- EMAIL SIMULATION ---")
            print(body)
            print("------------------------")
            return jsonify({'message': 'Simulation: Email logged to console (No credentials found).'}), 200

    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

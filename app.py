import base64

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging
from requests.exceptions import RequestException, HTTPError, ConnectionError, Timeout


app = Flask(__name__)
CORS(app)  # Allow frontend (React) to communicate with backend (Flask)

# Alloy API Credentials 
WORKFLOW_TOKEN = ""
WORKFLOW_SECRET = ""

# Encode credentials for Alloy API authentication
auth_string = f"{WORKFLOW_TOKEN}:{WORKFLOW_SECRET}"
auth_header = base64.b64encode(auth_string.encode()).decode()


HEADERS = {
    "Authorization": f"Basic {auth_header}",
    "Content-Type": "application/json"
}

ALLOY_API_URL = "https://sandbox.alloy.co/v1/evaluations/"  # Define API URL once


# Set up logging
logging.basicConfig(level=logging.ERROR)

@app.route("/submit", methods=["POST"])
def submit_application():
    """Handles form submission and sends data to Alloy API."""
    try:
        data = request.json  #  Get data from React frontend


        #  Send request to Alloy API
        response = requests.post(ALLOY_API_URL, headers=HEADERS, json=data, timeout=10)
        response.raise_for_status()  # Raises an HTTPError for bad responses

        alloy_response = response.json()
        print("Alloy Full Response:", alloy_response)  #  Debugging

        # Extract the outcome from the Alloy response
        outcome = alloy_response.get("summary", {}).get("outcome", "No decision available")

        # Check last name for special cases (this overrides the Alloy response)
        if data.get('name_last', '').lower() == 'review':
            outcome = "Manual Review"
        elif data.get('name_last', '').lower() == 'deny':
            outcome = "Denied"

        # Return the outcome and the full response for debugging
        return jsonify({
            "outcome": outcome,
            "full_response": alloy_response
        }), 200

    except HTTPError as http_err:
        logging.error(f"HTTP error occurred: {http_err}")
        return jsonify({"error": "An error occurred while processing your request. Please try again later."}), 500

    except ConnectionError as conn_err:
        logging.error(f"Connection error occurred: {conn_err}")
        return jsonify({"error": "Unable to connect to the service. Please check your internet connection and try again."}), 503

    except Timeout as timeout_err:
        logging.error(f"Timeout error occurred: {timeout_err}")
        return jsonify({"error": "The request timed out. Please try again later."}), 504

    except RequestException as req_err:
        logging.error(f"An error occurred: {req_err}")
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500




if __name__ == "__main__":
    app.run(debug=True)

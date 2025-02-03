import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import json

# Configure logging
logging.basicConfig(level=logging.INFO,
                format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants for Ollama API
OLLAMA_API_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "mistral"

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def generate_response(user_input):
    try:
        # Prepare the request payload
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "user", "content": user_input}
            ],
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.95,
                "num_predict": 1000
            }
        }

        logger.info(f"Sending request to Ollama API for input: {user_input[:50]}...")
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()

        result = response.json()
        logger.debug(f"Received response from Ollama: {result}")

        if "message" not in result:
            logger.error(f"Unexpected response format - missing 'message' field: {result}")
            raise KeyError("Missing 'message' field in response")
        
        if "content" not in result["message"]:
            logger.error(f"Unexpected response format - missing 'content' field: {result}")
            raise KeyError("Missing 'content' field in message")
        
        return result["message"]["content"].strip()

    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling Ollama API: {str(e)}")
        return "I apologize, but I encountered an error communicating with the AI model. Please try again."

    except (KeyError, json.JSONDecodeError) as e:
        logger.error(f"Error parsing Ollama response: {str(e)}")
        return "I apologize, but I received an invalid response from the AI model. Please try again."

    except Exception as e:
        logger.error(f"Unexpected error in generate_response: {str(e)}")
        return "An unexpected error occurred. Please try again later."

# Route for serving the index.html file
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Define the API endpoint
@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_input = request.json.get("message")
        if not user_input:
            logger.warning("Received chat request with no message")
            return jsonify({"error": "No message provided"}), 400

        logger.info(f"Received chat request with message: {user_input[:50]}...")
        response = generate_response(user_input)
        return jsonify({"response": response})

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        return jsonify({"error": "An error occurred while processing your request"}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001)
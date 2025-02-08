import os
import json
import threading
import asyncio
import requests
import jwt
from dotenv import load_dotenv
from flask import Flask, request
from websockets.sync.client import connect
import websockets.asyncio.server as websocketsasyncio

###############################################################################
# CONFIG
###############################################################################
TWITCH_CLIENT_ID = os.getenv('TWITCH_CLIENT_ID', '')
TWITCH_CLIENT_SECRET = os.getenv('TWITCH_CLIENT_SECRET', '')

if not TWITCH_CLIENT_ID or not TWITCH_CLIENT_SECRET:
    load_dotenv()
    TWITCH_CLIENT_ID = os.getenv('TWITCH_CLIENT_ID', None)
    TWITCH_CLIENT_SECRET = os.getenv('TWITCH_CLIENT_SECRET', None)

REDIRECT_URI = "http://localhost:5000/callback"

FLASK_PORT = 5000
WS_PORT = 8765

###############################################################################
# GLOBALS
###############################################################################
app = Flask(__name__)
websocket_server = None

###############################################################################
# WEBSOCKETS
###############################################################################
async def handler(websocket): 
    """
    Handle incoming WebSocket connections.
    """
    print("[WebSocket] A client connected.")
    
    try:
        async for message in websocket:
            print("[WebSocket] Received from client:", message)
            # You can handle incoming messages if needed
    except Exception as ex:
        print("[WebSocket] Connection error:", ex)
    finally:
        print("[WebSocket] A client disconnected.")


async def start_websocket_server():
    """
    Start the WebSocket server in a blocking manner.
    """
    print(f"[WebSocket] Starting Websocket Server on ws://localhost:{WS_PORT}")

    global websocket_server
    websocket_server = await websocketsasyncio.serve(handler, "localhost", WS_PORT)
    await websocket_server.serve_forever()

    print(f"[WebSocket] Started Websocket Server on ws://localhost:{WS_PORT}")


def broadcast_data(data):
    """
    Broadcast data to all connected WebSocket clients.
    """
    websocketsasyncio.broadcast(websocket_server.connections, json.dumps(data))


###############################################################################
# FLASK
###############################################################################
@app.route("/")
def index():
    return (
        "<h2>Python OAuth + WebSocket Server</h2>"
        f"<p>Flask running on :{FLASK_PORT}, WS on :{WS_PORT}.</p>"
        "<p>Use <code>/callback</code> for Twitch OAuth flow.</p>"
    )

@app.route('/callback')
def twitch_callback():
    """
    Twitch redirects to this endpoint with ?code=... after the user authorizes
    your app. We exchange the code for a token, then broadcast the token over
    the WebSocket to any connected clients.
    """
    code = request.args.get('code')
    if not code:
        return "No code provided by Twitch. Check the 'code' query param.", 400
    
    if not TWITCH_CLIENT_ID or not TWITCH_CLIENT_SECRET:
        return "Twitch Client ID/Secret is not configured.", 500

    # Exchange code for tokens
    token_url = "https://id.twitch.tv/oauth2/token"
    params = {
        "client_id": TWITCH_CLIENT_ID,
        "client_secret": TWITCH_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI
    }
    try:
        response = requests.post(token_url, params=params)
        data = response.json()
        # Data should contain access_token, refresh_token, etc.
        if "access_token" not in data:
            return f"Error from Twitch token exchange: {data}", 400

        print(data)

        access_token = data["access_token"]
        refresh_token = data["refresh_token"]
        id_token = data["id_token"]
        scope = data["scope"]
        print(f"[OAuth] Received access_token: {access_token[:10]}... (truncated)")
        print(f"[OAuth] Scopes: {scope}")

        # Decode the ID token (if available)
        if id_token:
            id_info = decode_id_token(id_token)

        # Optionally fetch user info
        user_info = fetch_user_info(access_token, id_info.get("email"))
        print("[OAuth] Twitch user info:", user_info)

        # Broadcast tokens to any connected WebSocket clients
        broadcast_data({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_data": user_info
        })

        # Establish a WebSocket connection to the server
        # websocket_connection = asyncio.run(establish_websocket_connection(access_token, user_info[0]["id"]))       

        return (
            "<h3>Twitch OAuth Success!</h3>"
            "<p>You can close this tab and return to your application.</p>"
        )
    except Exception as e:
        print("[OAuth] Exception during token exchange:", e)
        return "Error exchanging code for token.", 500


# async def establish_websocket_connection(access_token, user_info):
#     """
#     Example: Establish a WebSocket connection to the server.
#     """
#     ws_url = f"wss://eventsub.wss.twitch.tv/ws"
#     session_id = None

#     with connect(ws_url) as ws:
#         print("[WebSocket] Connected to", ws_url)
        
#         # Recieve welcome message
#         welcome = ws.recv()
#         print("[WebSocket] Received welcome message:", welcome)

#         session_id = json.loads(welcome)["payload"]["session"]["id"]

#         # Subscribe to EventSub topics
#         subscribe_to_eventsub(access_token, user_info[0]["id"], session_id)

#         while True:
#             try:
#                 message = ws.recv()
#                 print("[WebSocket] Received message:", message)
#             except Exception as e:
#                 print("[WebSocket] Error receiving message:", e)
#                 break


def subscribe_to_eventsub(access_token, user_id, session_id):
    """
    Example: Subscribe to EventSub topics.
    """
    headers = {
        "Client-ID": TWITCH_CLIENT_ID,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "type": "channel.chat.message",
        "version": "1",
        "condition": {
            "broadcaster_user_id": user_id,
            "user_id": user_id
        },
        "transport": {
            "method": "websocket",
            "session_id": session_id
        }
    }
    resp = requests.post("https://api.twitch.tv/helix/eventsub/subscriptions", headers=headers, json=data)
    print("[EventSub] Subscription response:", resp.json())


def decode_id_token(id_token):
    """
    Example: Decode the ID token returned by Twitch OAuth.
    """
    try:
        discovery_endpoint = "https://id.twitch.tv/oauth2/.well-known/openid-configuration"
        config = requests.get(discovery_endpoint).json()

        jwks_client = jwt.PyJWKClient(config["jwks_uri"])

        signing_key = jwks_client.get_signing_key_from_jwt(id_token)

        return jwt.decode_complete(
            id_token,
            key=signing_key,
            audience=TWITCH_CLIENT_ID,
            algorithms=["RS256"],
        )
    except Exception as e:
        print("[OAuth] Error decoding ID token:", e)
        return None

def fetch_user_info(access_token, login):
    """
    Example: Retrieve user info from Twitch Helix API.
    """
    headers = {
        "Client-ID": TWITCH_CLIENT_ID,
        "Authorization": f"Bearer {access_token}"
    }
    resp = requests.get("https://api.twitch.tv/helix/users", params={"login": login}, headers=headers)
    data = resp.json()
    return data.get("data", [])

###############################################################################
# MAIN
###############################################################################
if __name__ == "__main__":
    # Start Flask (blocking) in a background thread
    print(f"[Flask] Starting on http://localhost:{FLASK_PORT}")
    flask_thread = threading.Thread(target=lambda: app.run(port=FLASK_PORT, debug=False), daemon=True).start()

    # Start the WebSocket server in the main thread
    asyncio.run(start_websocket_server())

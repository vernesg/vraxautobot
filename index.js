const fs = require('fs');
const path = require('path');
const { login } = require('facebook-chat-api'); // or your fb chat api package
const config = require('./config.json');

const APPSTATE_FILE = path.join(__dirname, 'appstate.json');

// Function to save appstate to file
function saveAppState(appState) {
  fs.writeFileSync(APPSTATE_FILE, JSON.stringify(appState, null, 2), 'utf-8');
  console.log('Appstate saved to', APPSTATE_FILE);
}

// Function to load appstate from file if exists
function loadAppState() {
  if (fs.existsSync(APPSTATE_FILE)) {
    try {
      const rawData = fs.readFileSync(APPSTATE_FILE, 'utf-8');
      return JSON.parse(rawData);
    } catch (e) {
      console.error('Failed to parse appstate:', e);
      return null;
    }
  }
  return null;
}

// Main login function
function startBot() {
  const appState = loadAppState();

  const loginOptions = {
    appState: appState || undefined,
    userAgent: config.loginoptions.userAgent,
    // you can add other login options here based on your config.loginoptions
  };

  login(loginOptions, (err, api) => {
    if (err) {
      console.error('Login failed:', err);
      if (err.error === 'login-approval') {
        console.error('Please complete login approval challenge.');
      }
      return;
    }

    // Save appstate for future logins
    saveAppState(api.getAppState());

    console.log('Logged in successfully!');

    // Your bot logic here
    api.setOptions({
      listenEvents: config.loginoptions.listenEvents,
      selfListen: config.loginoptions.selfListen,
      autoReconnect: config.loginoptions.autoReconnect,
      online: config.loginoptions.online,
      // etc, as you want to map
    });

    // Example: listen for messages
    const stopListening = api.listen((err, event) => {
      if (err) {
        console.error('Listen error:', err);
        return;
      }

      if (event.type === 'message') {
        console.log(`Received message from ${event.senderID}: ${event.body}`);
        // Your reply or handling logic here
      }
    });
  });
}

startBot();

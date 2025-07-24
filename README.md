# RandomChatApp

This repository contains a minimal folder structure for a chat application with:

- **Frontend**: React Native using Expo.
- **Backend**: Node.js with WebSockets.

Directory layout:

- `RandomChatApp/frontend` – Expo project files.
- `RandomChatApp/backend` – Node.js server files.

Each subproject includes a `package.json` with the necessary dependencies and basic starter code.

## Testing Backend

To run the automated tests for the Node.js backend, install the dependencies and execute:

```bash
cd RandomChatApp/backend
npm install
npm test
```

The tests verify that users are paired correctly and that messages are stored in the SQLite database.

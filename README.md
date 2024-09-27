# Battleship
This is a JavaScript implementation of the classic board game Battleship. The game can be played either locally or online, and is built using Node.js, Electron, and Sockets.io.

---

---
## Table of Contents
- [Quick Start Guide](#quick-start-guide)
  - [Dependencies](#dependencies)
  - [Starting the Game](#starting-the-game)
- [In Depth Guide](#in-depth-guide)
  - [The Server](#the-server)
  - [The Client](#the-client)
  - [Online Play](#online-play)
  - [Committing Changes](#committing-changes)
- [End Credits](#end-credits)
---

---

# Quick Start Guide
## Dependencies
Before doing anything else, ensure that you have done the following:
- Install node.js. Node can be installed from https://nodejs.org/en.
- Open a terminal in this folder (the top level directory) and run `npm install`. This will install some packages and complete required setup steps.
- Once this step completes successfully, you will be able to build, run, and test the game. 

## Starting the Game
- open a terminal and navigate to this folder (the top level directory)
- run /scripts/start.sh
  - this script will start the server and two clients, allowing you to play a game locally
  - for online play, see the instructions below

---

# In Depth Guide
Whether hosted locally or remotely, this implementation of battleship comes in two parts: The Server, and the Client.

## The Server
The Server is the backend code that controls game state, match making, and player communications. Code for the Server can be found in the `back` and `back/server` folder. 

### Testing Locally
To run a local version of the server, open a terminal in this (the top level) folder and run `npm run server`. This will launch a local build of the server at https://localhost:5100. 
You can check to see if the server is running by visiting that url in any web browser and ensuring a page is displayed that says the server is operational.

For more information on the server, how to modify it, and what it does, please see the [Server README.md](./back/README.md) file.
The Server README file will also describe how to deploy your own branch of this repository to render.com to mimic our setup.


## The Client
The Client is the frontend code that displays the main menu, game board, and provides an area for the user to interact with. Our frontend visuals are constructed via html and css, and presented using Node.JS and electron.

### Testing Against a Local Server
- Edit the Config Script
- Ensure that the "DevServerAddress" value is set to "http://127.0.0.1:5100"
- Set the "Build" value to "Dev"
- Ensure that the "ClientId" value is set to `null`

[//]: # (#### Testing Against Your Own Hosted Server:)
[//]: # (- Use the same settings as testing against our Render server, but make sure you update the LiveServerAddress value to match your server's address.)

[//]: # (### Running the Client)
[//]: # (Once you have the client config.json updated, you can run the client by opening a terminal in this folder &#40;the top level folder&#41; and running `npm run play`. This will build and launch the game client.)

[//]: # (### Testing Locally with Two Clients)
[//]: # (If you want to test two clients locally &#40;to play a match using a local server&#41;, you will need two terminals opened in this folder.)

[//]: # (In the first terminal, run: `npm run play`)
[//]: # (In the second terminal, run: `npm run play second`)

[//]: # (This is necessary because of the way that we track clients. By specifying "second", the client will use a static 'config_dev.json' file instead of 'config.json', so that the ClientIDs will be unique.)
[//]: # (If you run both clients using npm run play, without specifying second for one, the server will not be able to tell the two clients apart and that will result in match communication failure errors.)

### Running Individual Scripts
If desired, it is also possible to manually run either of the clients and or the server locally. This can be done by running the following commands in the terminal:
- `npm run server` to start the server
- `npm run play` to start the first client
- `npm run play second` to start the second client

During normal operations, the start.sh script runs these commands in sequence in a single shell window.In most cases there is no reason to run them individually.


## Online Play
Version 1.0 was tested on a server instance hosted on render.com. The code should be able to be deployed to any server that supports Node.js and WebSockets. **YMMV**.

Before you run the client, you will need to make some config changes depending on your testing setup:
CONFIG SCRIPT: [config.json](./front/assets/config.json) | ./front/assets/config.json
### Editing the Config Script
- Set the "LiveServerAddress" value to the address of the server you are testing against
    - e.g. `https://battleship-q6f4.onrender.com`
- Set the "Build" value to "Live"
- Ensure that the "ClientId" value is set to `null`


## Committing Changes
If you have tested locally, the ClientID in the config file will have been modified. To clean that up, we recommend running `npm run clean` before committing changes to your branches.

---
# End Credits

For more information and documentation on electron, the tool that allows us to display html/css/js as a native application, please see the project's official website at https://www.electronjs.org/.

## About the Project

### Languages:
- Frontend: node.js, css, html, JavaScript
- Backend: node.js
### Technologies:
- Frontend: electron, sockets.io
- Backend: express, sockets.io

[//]: # (### Roles:)
[//]: # (- backend: Matthew, Wil)
[//]: # (- frontend: Katie, Emily, Chase)
### Requirements:
- frontend: Can be played either locally or online. need design for 10x10 grid, way to put battleships, pull from backend, send states
- backend: control state, act as mediary, pass info about strikes
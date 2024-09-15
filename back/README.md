# BattleShip Server
### Created by William Johnson

## Installation
The battleship server can be run locally, or hosted via a cloud service. We recommend https://render.com/ 's free tier for simplicity.
To run a BattlShip Server locally, do the following:

### 0. Ensure that you have Node.JS installed. It can be found at https://nodejs.org/en. 
### 1. Open a terminal (Linux/Mac) or PowerShell window (Windows) and navigate to `battleship/back/server`.
### 2. Install the required dependencies by running `npm ci` in your terminal window.
### 3. Once the required packages have been installed, start the server by running `node ./server.js`. 
### 4. Monitor. The terminal will now host the server. By default, the server will be hosted on http://localhost:5100.
### 5. To ensure that the clients use the local server, you will need to update the `battleship/front/assets/config.json` file so that the 'Build' value is set to 'Dev' instead of 'Live'.

## Configuring your Server Client
The main script for the server can be found at battleship/back/server/server.js. 
A server is hosted by using the node.js express package. The default port, 5100, is specified in the code at line 45.
### IF YOU CHANGE THE SERVER PORT:
If you change the server port, and you want to test locally, you will also need to update the following files:
- `battleship/front/assets/config.json`
- `battleship/front/assets/config_dev.json`

These files currently contain DevServer pointers to localhost:5100 that would need to be updated to match the new server port.
However, in general, there should be no need to modify the server port.


## Running in Live Mode
To play using a cloud hosted server, before any playing can begin, you must replace the "LiveServerAddress" link for all clients. Again, we recommend render. You must use a web service to run this game - private services will not work. 

To get your github repo working in Render:

### 0. Sign in with your Github account. 
### 1. Paste the repo that you plan to use for this 
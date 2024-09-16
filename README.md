# Battleship
# How-To Run Battleship

## Set-Up

Before doing anything else, ensure that you have done the following:
- Install node.js. Node can be installed from https://nodejs.org/en.
- Open a terminal in this folder (the top level directory) and run `npm install`. This will install some packages and complete required setup steps.
- Once this step completes successfully, you will be able to build, run, and test the game.

This implementation of battleship comes in two parts: The Server, and the Client.

## The Server

The Server is the backend code that controls game state, match making, and player communications. Code for the Server can be found in the `back` and `back/server` folder. 

To run a local version of the server, open a terminal in this (the top level) folder and run `npm run server`


## About the Project

### Languages:
- Frontend: node.js, css, html, JavaScript
- Backend: node.js
### Technologies:
- Frontend: electron, sockets.io
- Backend: express, sockets.io
### Roles:
- backend: Matthew, Wil
- frontend: Katie, Emily, Chase
### Requirements:
- frontend: Can be played either locally or online. need design for 10x10 grid, way to put battleships, pull from backend, send states
- backend: control state, act as mediary, pass info about strikes
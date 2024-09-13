//__DEVELOPMENT_COPY_ONLY__//
<<<<<<< HEAD
// The real copy of this script should be in front-end. This version should be a mirror.
=======
// The real copy of this script should be in front-end. This version should be a mirror and is only used by test.js for testing comms.
>>>>>>> 9ce4380f3979d0f10c2bd4f913f859924b507e86

fetch('./config.json')
    .then(response => response.json())
    .then(config => {
        let serverAddress;
        if (config.Build === "Dev") {
            serverAddress = config.DevServerAddress;
        } else {
            serverAddress = config.LiveServerAddress;
        }

        const script = document.createElement('script');
        script.src = serverAddress + "/socket.io/socket.io.js";

        script.onload = () => {
            console.log("Socket.IO script loaded successfully from:", serverAddress);

            window.socket = io(serverAddress);

            window.socket.on('getClientId', () => {
                socket.emit('registerClientId', { ClientId: config.ClientId });
            });
        };

        script.onerror = () => {
            console.error("Failed to load the Socket.IO script from:", serverAddress);
        };

        document.head.appendChild(script);
    })
    .catch(error => console.error("Error loading config.json:", error));

window.api.loadConfig()
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

            window.clientId = config.ClientId;

            const new_socket = io(serverAddress);

            new_socket.on('getClientId', () => {
                socket.emit('registerClientId', { ClientId: config.ClientId });
            });

            new_socket.on('acknowledgeRegistration', ( data ) => {
                window.socket = new_socket;
            });
        };

        script.onerror = () => {
            console.error("Failed to load the Socket.IO script from:", serverAddress);
        };

        document.head.appendChild(script);
    })
    .catch(error => console.error("Error loading config.json:", error));

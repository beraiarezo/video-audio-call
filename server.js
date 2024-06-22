const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

server.on("connection", (socket) => {
  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Broadcast the message to all connected clients
      server.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8080");

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import dotenv from 'dotenv';

dotenv.config();
const app = express();
const server = createServer(app);

export const io = new Server(server, {
    cors: {
        origin: ["https://chaton-real-time-chat-web-app.vercel.app"], // Set your frontend URL here
        methods: ["GET", "POST","PUT"], credentials: true,
    }
});


// used to store online users
const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (userId) => {
    console.log("getReceiverSocketId called with:", userId);
    console.log("Current userSocketMap:", userSocketMap);

    if (!userSocketMap[userId]) {
        console.log("❌ No socket ID found for this user.");
    }

    return userSocketMap[userId]; // Return socket ID
};


io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const userId = socket.handshake.query.userId;
    console.log("User ID from handshake:", userId); // Add this log

    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log("Updated userSocketMap:", userSocketMap); // Add this log
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        // Remove user from socket map
        const disconnectedUserId = Object.keys(userSocketMap).find(
            (key) => userSocketMap[key] === socket.id
        );

        if (disconnectedUserId) {
            delete userSocketMap[disconnectedUserId];
            console.log("Updated userSocketMap after disconnect:", userSocketMap);
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});


const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Socket.io server running on port ${PORT}`));


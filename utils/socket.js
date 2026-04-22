import { Server } from "socket.io";

let io;
const userSockets = new Map(); // Store userId -> socketId mapping

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        const branchId = socket.handshake.query.branchId;

        if (userId) {
            userSockets.set(userId, socket.id);
            socket.join(`user:${userId}`); // Personal room
        }

        if (branchId) {
            socket.join(`branch:${branchId}`); // Branch-wide room
        }

        console.log(`User connected: ${userId} to branch ${branchId}`);

        socket.on("disconnect", () => {
            if (userId) userSockets.delete(userId);
            console.log("User disconnected:", userId);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

/**
 * Emit to a specific user
 */
export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

/**
 * Emit to an entire branch
 */
export const emitToBranch = (branchId, event, data) => {
    if (io) {
        io.to(`branch:${branchId}`).emit(event, data);
    }
};

/**
 * Broadcast to everyone (Global)
 */
export const broadcast = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

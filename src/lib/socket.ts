import { io, Socket } from "socket.io-client";
let socket: Socket | null = null;

export const createSocket = (token: string) => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      autoConnect: false,
      transports: ["websocket"],
      auth: {
        token: token,
      },
    });
  }
  return socket;
};

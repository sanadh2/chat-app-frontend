"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { Button } from "./ui/button";

type Message = {
  user: string;
  message: string;
};

export default function ChatPage({
  recipientId,
}: {
  recipientId: string | null;
}) {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth?action=login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!token) return;

    socketRef.current = createSocket(token);

    socketRef.current?.connect();

    const handleActiveUsers = (users: string[]) => {
      setActiveUsers(users);
    };

    const handlePrivateMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    socketRef.current.on("activeUsers", handleActiveUsers);
    socketRef.current.on("privateMessage", handlePrivateMessage);

    return () => {
      socketRef.current?.off("activeUsers", handleActiveUsers);
      socketRef.current?.off("privateMessage", handlePrivateMessage);
      socketRef.current?.disconnect();
    };
  }, [token]);

  const sendPrivateMessage = () => {
    if (newMessage.trim() && recipientId) {
      socketRef.current?.emit("privateMessage", {
        recipientId,
        message: newMessage,
      });

      setMessages((prev) => [...prev, { user: "You", message: newMessage }]);

      setNewMessage("");
    }
  };

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.user}:</strong> {msg.message}
          </li>
        ))}
      </ul>
      <div className="">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button onClick={sendPrivateMessage} disabled={!recipientId}>
          Send
        </Button>
      </div>
    </div>
  );
}

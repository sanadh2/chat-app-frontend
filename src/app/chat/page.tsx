"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import { createSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { UserType } from "@/types/models";

type Message = {
  sender: UserType;
  message: string;
};

export default function ChatPage() {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<Message>({
    sender: user!,
    message: "",
  });
  const socketRef = useRef<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  console.log(messages);
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth?action=login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!token) return;

    socketRef.current = createSocket(token);

    socketRef.current?.connect();

    const handleMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleActiveUsers = (users: string[]) => {
      setActiveUsers(users);
    };
    const handleUserTyping = (userId: string) => {
      if (userId !== user?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    };

    socketRef.current.on("message", handleMessage);
    socketRef.current.on("activeUsers", handleActiveUsers);
    socketRef.current?.on("userTyping", handleUserTyping);
    return () => {
      // Cleanup listeners
      socketRef.current?.off("message", handleMessage);
      socketRef.current?.off("activeUsers", handleActiveUsers);
      socketRef.current?.off("userTyping", handleUserTyping);

      socketRef.current?.disconnect();
    };
  }, [token]);

  const handleNewMessage = (e: ChangeEvent<HTMLInputElement>) =>
    setNewMessage((prev) => ({
      ...prev,
      message: e.target.value,
    }));

  const sendMessage = () => {
    if (newMessage.message.trim()) {
      socketRef.current?.emit("message", newMessage);
      setNewMessage((prev) => ({
        ...prev,
        message: "",
      }));
    }
  };

  const handleTyping = () => {
    socketRef.current?.emit("typing", user?._id);
  };

  return (
    <div>
      <h3>Active Users:</h3>
      <ul>
        {activeUsers.map((username) => (
          <li key={username}>
            {username === user?.username ? "You" : username}
          </li>
        ))}
      </ul>
      <input
        onKeyDown={handleTyping}
        value={newMessage.message}
        onChange={handleNewMessage}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
      {isTyping && <p>Someone is typing...</p>}

      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            {msg.sender.username}:&nbsp;&nbsp;&nbsp;{msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

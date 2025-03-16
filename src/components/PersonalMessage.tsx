"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import { createSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { Button } from "./ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { MessageType, UserType } from "@/types/models";
import { formatTime } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { ArrowLeftIcon } from "lucide-react";

export default function ChatPage({
  recipient,
  selectRecipient,
}: {
  recipient: UserType;
  selectRecipient: Dispatch<SetStateAction<UserType | null>>;
}) {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const fetchMessages = async () => {
    try {
      const res = await axiosInstance.get(`/chat/${recipient._id}`, {
        withCredentials: true,
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth?action=login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!token) return;

    if (!socketRef.current) {
      socketRef.current = createSocket(token);
    }

    const handlePrivateMessage = (data: MessageType) => {
      setMessages((prev) => [...prev, data]);
    };
    fetchMessages();

    const handleUserTyping = (userId: string) => {
      if (userId !== user?._id) {
        setTypingUser(userId);
        setTimeout(() => setTypingUser(null), 3000);
      }
    };

    socketRef.current.connect();
    socketRef.current.on("activeUsers", (users) => {
      setOnlineUsers(users);
    });
    socketRef.current.on("userTyping", handleUserTyping);
    socketRef.current.on("privateMessage", handlePrivateMessage);

    return () => {
      socketRef.current?.off("privateMessage", handlePrivateMessage);
      socketRef.current?.off("userTyping", handleUserTyping);
      socketRef.current?.disconnect();
    };
  }, [token]);

  const handleSendMessage = () => {
    if (newMessage.trim() && recipient) {
      const message: MessageType = {
        sender: user?._id!,
        receiver: recipient._id,
        content: newMessage,
        createdAt: new Date().toISOString(),
      };

      socketRef.current?.emit("privateMessage", {
        sender: user?._id,
        receiver: recipient._id,
        content: newMessage,
      });

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    }
  };

  const handleTyping = () => {
    if (recipient) {
      socketRef.current?.emit("typing", {
        recipientId: recipient._id,
        senderId: user?._id,
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  console.log(onlineUsers);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="bg-black text-white px-4 py-2 flex items-center gap-2">
        <button
          onClick={() => selectRecipient(null)}
          className="size-8 rounded-full border-white cursor-pointer flex justify-center items-center"
        >
          <ArrowLeftIcon className="size-6" strokeWidth="1" />
        </button>
        <div className="">
          <h2 className={" h-12 text-2xl font-bold py-4 w-full"}>
            {recipient?.username}
          </h2>
          <p
            className={
              "text-xs " +
              (onlineUsers.includes(String(recipient?._id))
                ? "text-green-500"
                : "text-red-500")
            }
          >
            {onlineUsers.includes(String(recipient?._id))
              ? "online"
              : "offline"}
            {typingUser && (
              <span className="text-neutral-500 block text-xs">Typing...</span>
            )}
          </p>
        </div>
      </div>
      <div className="grow flex flex-col gap-3 overflow-y-scroll px-4">
        {messages.map((msg, index) => (
          <div key={index} className="w-full h-fit ">
            <span
              className={
                " w-fit py-1 px-4 rounded-md grid text-base" +
                (msg.sender === user?._id
                  ? " bg-green-300 float-right "
                  : " border shadow float-left ")
              }
            >
              <span className="text-base">{msg.content}</span>
              <div className="w-full">
                <span className="float-right text-[5px] uppercase text-muted-foreground">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 h-fit">
        <input
          className="w-full h-10 px-4 border outline-neutral-400"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <Button
          className="h-10 rounded"
          onClick={handleSendMessage}
          disabled={!recipient}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

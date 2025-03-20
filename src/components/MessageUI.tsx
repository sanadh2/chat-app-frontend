"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, ChangeEvent, useCallback } from "react";
import { createSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { Button } from "./ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { MessageType, UserType, GroupType } from "@/types/models";
import { formatTime } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { ArrowLeftIcon } from "lucide-react";

type RecipientType = UserType | GroupType;

export default function MessageUI({
  recipient,
  selectRecipient,
}: {
  recipient: RecipientType;
  selectRecipient: Dispatch<SetStateAction<RecipientType | null>>;
}) {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isGroupChat = "members" in recipient;

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axiosInstance.get(
        isGroupChat ? `/chat/group/${recipient._id}` : `/chat/${recipient._id}`,
        {
          withCredentials: true,
        }
      );
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [recipient, isGroupChat]);

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

    const handleUserTyping = (username: string) => {
      console.log(username);
      if (username !== user?.username) {
        setTypingUser(username);
        setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      }
    };
    const handleGroupMessage = (data: MessageType) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleActiveUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    socketRef.current.connect();
    socketRef.current.on("activeUsers", handleActiveUsers);

    if (isGroupChat) {
      if (isGroupChat && !socketRef.current.hasListeners("groupMessage")) {
        socketRef.current.emit("joinGroup", recipient._id);
        socketRef.current.on("groupMessage", handleGroupMessage);
        socketRef.current?.on("groupTyping", handleUserTyping);
      }
    } else {
      if (!socketRef.current.hasListeners("userTyping")) {
        socketRef.current.on("userTyping", handleUserTyping);
      }
      if (!socketRef.current.hasListeners("privateMessage")) {
        socketRef.current.on("privateMessage", handlePrivateMessage);
      }
    }

    return () => {
      socketRef.current?.off("privateMessage", handlePrivateMessage);
      socketRef.current?.off("userTyping", handleUserTyping);
      socketRef.current?.off("groupMessage", handleGroupMessage);
      socketRef.current?.off("groupTyping", handleUserTyping);
      socketRef.current?.off("activeUsers", handleActiveUsers);

      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [token, recipient, fetchMessages, isGroupChat, user]);

  const handleSendMessage = () => {
    if (newMessage.trim() && recipient) {
      const message: MessageType = {
        sender: user!,
        content: newMessage,
        createdAt: new Date().toISOString(),
        ...(isGroupChat ? { group: recipient } : { receiver: recipient }),
        isRead: false,
      };
      console.log(message);
      if (isGroupChat) {
        socketRef.current?.emit("sendGroupMessage", {
          sender: user,
          group: recipient,
          content: newMessage,
        });
      } else {
        socketRef.current?.emit("privateMessage", {
          sender: user,
          receiver: recipient,
          content: newMessage,
        });
        setMessages((prev) => [...prev, message]);
      }

      setNewMessage("");
    }
  };

  const handleTyping = () => {
    if (recipient) {
      if (isGroupChat) {
        socketRef.current?.emit("groupTyping", {
          groupId: recipient._id,
          senderId: user?._id,
          username: user?.username,
        });
      } else {
        socketRef.current?.emit("typing", {
          recipientId: recipient._id,
          senderId: user?._id,
          username: user?.username,
        });
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const joinGroup = useCallback(async () => {
    try {
      await axiosInstance.patch(`/chat/join-group/${recipient._id}`);
      if (isGroupChat) {
        const members = [user!, ...recipient.members];
        const newRecipient: GroupType = {
          ...recipient,
          members,
        };
        selectRecipient(newRecipient);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [recipient, isGroupChat, selectRecipient, user]);

  return (
    <div className="flex flex-col gap-2 h-full p-3 md:p-0">
      <div className="bg-black text-white px-4 min-h-20 flex items-center gap-0">
        <button
          onClick={() => selectRecipient(null)}
          className="size-8 rounded-full border-white cursor-pointer flex justify-center items-center"
        >
          <ArrowLeftIcon className="size-6" strokeWidth="1" />
        </button>
        <div className="">
          <h2 className={" text-2xl font-bold w-full"}>
            {isGroupChat ? recipient.name : recipient.username}
          </h2>
          <p
            className={
              "text-xs " +
              (onlineUsers.includes(String(recipient?._id))
                ? "text-green-500"
                : "text-red-500")
            }
          >
            {typingUser ? (
              <span className="text-neutral-500 block text-xs">
                {isGroupChat ? `${typingUser} Typing...` : "Typing..."}
              </span>
            ) : (
              !isGroupChat &&
              (onlineUsers.includes(String(recipient?._id))
                ? "online"
                : "offline")
            )}
          </p>
        </div>
      </div>
      <div
        ref={messagesEndRef}
        className="grow flex flex-col gap-3 overflow-y-scroll px-4"
      >
        {messages.map((msg, index) => (
          <div key={index} className="w-full h-fit ">
            <span
              className={
                " w-fit py-1 px-4 rounded-md grid text-base" +
                (msg.sender._id === user?._id
                  ? " bg-green-300 float-right "
                  : " border shadow float-left ")
              }
            >
              {isGroupChat && msg.sender._id !== user?._id ? (
                <span className="text-sky-600">{msg.sender.username}</span>
              ) : null}
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
        {isGroupChat ? (
          Array.isArray(recipient?.members) &&
          !recipient.members
            .map((member) => member._id)
            .includes(String(user?._id)) ? (
            <Button className="w-full h-10" onClick={joinGroup}>
              Join this Group
            </Button>
          ) : (
            <>
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
            </>
          )
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

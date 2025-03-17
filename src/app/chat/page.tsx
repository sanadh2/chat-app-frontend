"use client";
import MessageUI from "@/components/MessageUI";
import UserList from "@/components/UserList";
import { useAuth } from "@/context/AuthContext";
import { createSocket } from "@/lib/socket";
import { GroupType, UserType } from "@/types/models";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

type RecipientType = UserType | GroupType;

export default function ChatPage() {
  const [recipient, setRecipient] = useState<RecipientType | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    if (!socketRef.current) {
      socketRef.current = createSocket(token);
    }

    socketRef.current.connect();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, recipient]);

  return (
    <div className="min-h-dvh flex flex-col">
      <h2 className="text-2xl font-bold text-center hidden md:flex h-40 justify-center items-center">
        ChatSphere
      </h2>
      <div className="h-full grow flex justify-center items-center md:-mt-16 p-0 md:p-5 lg:p-10 gap-2">
        <div
          className={
            "w-[max(24rem,100%)] md:w-96 flex border relative min-h-[100dvh] md:min-h-[60dvh]" +
            (recipient ? " hidden md:block" : "")
          }
        >
          <UserList
            selectRecipient={setRecipient}
            selectedRecipient={recipient}
          />
        </div>
        <div
          className={
            " border size-full h-[100dvh] md:h-[60dvh]" +
            (recipient ? "" : " hidden md:block")
          }
        >
          {recipient ? (
            <MessageUI recipient={recipient} selectRecipient={setRecipient} />
          ) : (
            <div className="flex justify-center items-center grow h-full">
              <h3>ChatSphere: Connect Instantly, Talk Infinitely.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

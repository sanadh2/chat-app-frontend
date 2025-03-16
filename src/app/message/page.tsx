"use client";
import ChatPage from "@/components/PersonalMessage";
import SearchUser from "@/components/SearchUser";
import { UserType } from "@/types/models";
import { useState } from "react";

export default function page() {
  const [recipient, setRecipient] = useState<UserType | null>(null);

  return (
    <div className="flex justify-center items-center min-h-dvh p-10 gap-2">
      <SearchUser
        selectRecipient={setRecipient}
        selectedRecipient={recipient}
      />
      <div className="border size-full h-[60dvh]">
        {recipient ? (
          <ChatPage
            key={recipient._id}
            selectRecipient={setRecipient}
            recipient={recipient}
          />
        ) : (
          <div className="flex justify-center items-center grow">
            <h3>ChatSphere: Connect Instantly, Talk Infinitely.</h3>
          </div>
        )}
      </div>
    </div>
  );
}

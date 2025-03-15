"use client";
import ChatPage from "@/components/PersonalMessage";
import SearchUser from "@/components/SearchUser";
import { useState } from "react";

export default function page() {
  const [recipientId, setRecipientId] = useState<string | null>(null);

  return (
    <div className="flex justify-center items-center min-h-dvh p-10 gap-2">
      <SearchUser selectRecipient={setRecipientId} />
      <div className="border size-full h-[60dvh]">
        <ChatPage recipientId={recipientId} />
      </div>
    </div>
  );
}

"use client";
import { useAuth } from "@/context/AuthContext";
import { UserType } from "@/types/models";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction } from "react";
import CreateGroupModel from "./CreateGroupModel";
import useConversations from "@/useConversations";

export default function SearchUser({
  selectRecipient,
  selectedRecipient,
}: {
  selectRecipient: Dispatch<SetStateAction<UserType | null>>;
  selectedRecipient: UserType | null;
}) {
  const { user } = useAuth();
  const { data } = useConversations();
  return (
    <div className="w-96 border min-h-[60dvh] flex flex-col">
      <div className="overflow-y-scroll min-h-[90%] grow">
        {data?.users
          .filter((person) => person._id != user?._id)
          .map((user) => (
            <Button
              onClick={() => selectRecipient(user)}
              className={"list-none h-12 rounded-none text-center py-4 w-full"}
              variant={
                selectedRecipient?._id === user._id ? "default" : "secondary"
              }
              key={user._id}
            >
              {user.username}
            </Button>
          ))}
        {data?.groups.map((group) => (
          <Button
            // onClick={() => selectRecipient(user)}
            className={"list-none h-12 rounded-none text-center py-4 w-full"}
            // variant={
            //   selectedRecipient?._id === user._id ? "default" : "secondary"
            // }
            key={group._id}
          >
            {group.name}
          </Button>
        ))}
      </div>
      <div className="h-[10%]">
        <CreateGroupModel />
      </div>
    </div>
  );
}

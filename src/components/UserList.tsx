"use client";
import { useAuth } from "@/context/AuthContext";
import { GroupType, UserType } from "@/types/models";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction } from "react";
import CreateGroupModel from "./CreateGroupModel";
import useConversations from "@/hooks/useConversations";

type RecipientType = UserType | GroupType;

export default function UserList({
  selectRecipient,
  selectedRecipient,
}: {
  selectRecipient: Dispatch<SetStateAction<RecipientType | null>>;
  selectedRecipient: RecipientType | null;
}) {
  const { user } = useAuth();
  const { data } = useConversations();
  const isGroup = (recipient: RecipientType): recipient is GroupType => {
    return "members" in recipient;
  };
  return (
    <div className="min-h-full grow flex flex-col p-3 md:p-0">
      <div className="grow min-h-[90%]  w-full">
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
            onClick={() => selectRecipient(group)}
            className={"list-none h-12 rounded-none text-center py-4 w-full"}
            variant={
              selectedRecipient &&
              isGroup(selectedRecipient) &&
              selectedRecipient._id === group._id
                ? "default"
                : "secondary"
            }
            key={group._id}
          >
            {group.name}
          </Button>
        ))}
      </div>
      <div className=" ">
        <span className="absolute z-3 bottom-16 text-center italic text-green-300 w-full">
          ChatSphere
        </span>
        <div className="absolute z-2 bottom-0 w-full">
          <CreateGroupModel />
        </div>
      </div>
    </div>
  );
}

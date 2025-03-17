import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import { UsersIcon } from "lucide-react";
import useConversations from "@/hooks/useConversations";
import { useCallback, useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";

export default function CreateGroupModel() {
  const { data } = useConversations();
  const { user } = useAuth();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  const handleMemberSelection = useCallback((userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }, []);
  const isMemberSelected = (userId: string) => selectedMembers.includes(userId);
  useEffect(() => {
    if (user?._id) {
      setSelectedMembers((prev) =>
        prev.includes(user._id) ? prev : [...prev, user._id]
      );
    }
  }, [user?._id]);

  const createGroup = async () => {
    console.log("Selected Members:", selectedMembers);

    if (selectedMembers.length < 3) {
      toast.error("You cannot create a group with less than 3 members.");
      return;
    }

    try {
      const response = await axiosInstance.post("/chat/create-group", {
        name: groupName,
        members: selectedMembers,
      });

      toast.success(`Group "${groupName}" created successfully!`);
      console.log("Group Created:", response.data);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create the group. Please try again.");
    }
  };

  const handleGroupNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full h-10 rounded-none" variant={"outline"}>
          Create Group <UsersIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Group Members</DialogTitle>
          <DialogDescription>
            select members to add to the group
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <div className="flex items-center gap-3">
            <label htmlFor="groupName">Group Name:</label>
            <input
              id="groupName"
              className="border h-10 rounded px-3"
              value={groupName}
              onChange={handleGroupNameChange}
            />
          </div>
          {data?.users
            .filter((userData) => userData._id !== user?._id)
            .map((userData) => (
              <div
                key={userData._id}
                className="flex items-center gap-2 uppercase"
              >
                <input
                  id={userData._id}
                  type="checkbox"
                  className="cursor-pointer accent-accent"
                  checked={isMemberSelected(userData._id)}
                  onChange={() => handleMemberSelection(userData._id)}
                />
                <label className="cursor-pointer " htmlFor={userData._id}>
                  {userData.username}
                </label>
              </div>
            ))}
        </div>
        <Button onClick={createGroup} disabled={selectedMembers.length === 0}>
          Create
        </Button>
      </DialogContent>
    </Dialog>
  );
}

import { useQuery } from "@tanstack/react-query";
import { GroupType, UserType } from "./types/models";
import axiosInstance from "./utils/axiosInstance";

const fetchConversations = async (): Promise<{
  success: boolean;
  users: UserType[];
  groups: GroupType[];
}> => {
  const res = await axiosInstance.get("/chat/conversations");
  return res.data;
};

export default function useConversations() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchConversations,
  });
}

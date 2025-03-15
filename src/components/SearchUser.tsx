"use client";
import { useAuth } from "@/context/AuthContext";
import { UserType } from "@/types/user";
import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const fetchUsers = async (): Promise<{
  success: boolean;
  users: UserType[];
}> => {
  const res = await axiosInstance.get("/auth/users");
  return res.data;
};

export default function SearchUser({
  selectRecipient,
}: {
  selectRecipient: (userId: string) => void;
}) {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
  console.log(data);
  return (
    <div className="w-96 border min-h-[60dvh]">
      {data?.users
        .filter((person) => person._id != user?._id)
        .map((user) => (
          <li
            onClick={() => selectRecipient(user._id)}
            className="list-none text-center py-4 w-full hover:bg-neutral-300 active:bg-neutral-400 focus:bg-neutral-400 ease-in-out duration-500"
            key={user._id}
          >
            {user.username}
          </li>
        ))}
    </div>
  );
}

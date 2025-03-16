export type UserType = {
  _id: string;
  username: string;
  online: boolean;
  lastSeen: string;
};

export type MessageType = {
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
};

export type GroupType = {
  _id: string;
  name: string;
  members: UserType[];
  messages: MessageType[];
};

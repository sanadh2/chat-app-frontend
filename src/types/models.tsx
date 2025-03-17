export type UserType = {
  _id: string;
  username: string;
  online: boolean;
  lastSeen: string;
};

export type MessageType = {
  sender: UserType;
  receiver?: UserType;
  group?: GroupType;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type GroupType = {
  _id: string;
  name: string;
  members: UserType[];
  messages: MessageType[];
};

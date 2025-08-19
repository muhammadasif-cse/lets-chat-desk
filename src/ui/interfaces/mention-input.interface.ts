import { IChatUser } from "./chat.interface";

export interface IMentionInputProps {
  value: string;
  onChange: (
    value: string,
    mentions: Array<{ id: string; name: string; start: number; length: number }>
  ) => void;
  onSubmit: () => void;
  placeholder?: string;
  users: IChatUser[];
  disabled?: boolean;
}

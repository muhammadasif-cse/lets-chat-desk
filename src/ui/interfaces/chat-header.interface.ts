interface IHeaderProps {
  selectedChat?: {
    id: string | number;
    name: string;
    photo?: string;
    type: "user" | "group";
    isOnline?: boolean;
    lastSeen?: string;
    memberCount?: number;
  };
  onBack?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearch?: () => void;
  onInfo?: () => void;
}

export const renderReply = ({
  replyTo,
  isOwn,
}: {
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  isOwn: boolean;
}) => {
  if (!replyTo) return null;

  return (
    <div
      className={`rounded-md border-l-4 border-green p-3 py-2 mb-2 ${
        isOwn ? "bg-dark2/50" : "bg-dark4/50"
      }`}
    >
      <div className="text-green text-xs font-medium mb-1">
        {replyTo.senderName}
      </div>
      <div className="text-gray2 text-xs truncate leading-tight">
        {replyTo.text}
      </div>
    </div>
  );
};

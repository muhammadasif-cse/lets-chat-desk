import { ClockIcon } from "lucide-react";
import { Check2Icon, CheckIcon } from "../../../assets/icons/check.icon";

export const renderMessageStatus = ({
  isOwn,
  status,
}: {
  isOwn: boolean;
  status: string;
}) => {
  if (!isOwn) return null;

  switch (status) {
    case "sending":
      return <ClockIcon className="text-gray" />;
    case "sent":
      return <CheckIcon className="text-gray " />;
    case "delivered":
      return <Check2Icon className="text-gray" />;
    case "read":
      return <Check2Icon className="text-blue" />;
    default:
      return null;
  }
};

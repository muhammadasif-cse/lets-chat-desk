import moment from "moment-timezone";

interface FormatMessageTimeProps {
  dateString: string;
  showTime?: boolean;
}

export const formatMessageTime = ({
  dateString,
  showTime = true,
}: FormatMessageTimeProps): string => {
  if (!dateString || dateString.trim() === "") {
    return "";
  }

  const date = moment.tz(dateString, "Asia/Dhaka");
  if (!date.isValid()) {
    return "";
  }

  const now = moment.tz("Asia/Dhaka");
  const diffInMinutes = now.diff(date, "minutes");
  const diffInDays = now.diff(date, "days");

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  } else if (date.isSame(now, "day")) {
    return showTime ? `Today at ${date.format("h:mm A")}` : "Today";
  } else if (date.isSame(now.clone().subtract(1, "day"), "day")) {
    return showTime ? `Yesterday at ${date.format("h:mm A")}` : "Yesterday";
  } else if (diffInDays < 7) {
    return showTime ? `${date.format("ddd")} at ${date.format("h:mm A")}` : date.format("ddd");
  } else if (date.isSame(now, "year")) {
    return showTime ? `${date.format("MMM D")} at ${date.format("h:mm A")}` : date.format("MMM D");
  } else {
    return showTime
      ? `${date.format("MMM D, YYYY")} at ${date.format("h:mm A")}`
      : date.format("MMM D, YYYY");
  }
};

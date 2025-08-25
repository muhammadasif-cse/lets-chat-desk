import moment from "moment";

export const renderUserList = (list: any[], label: string, isSeen = false) => (
    <div className="mb-6">
      <p className="mb-2 text-sm text-gray-400">{label}</p>
      <div className="space-y-3">
        {list.map((user: any, idx: number) => {
          const time = isSeen ? user.seenAt : user.deliveredAt;
          const showTime = !!time;

          return (
            <div
              key={idx}
              className="flex items-center justify-between border-b border-gray pb-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray text-sm font-medium uppercase text-white">
                  {user.userName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div className="font-medium text-white">{user.userName}</div>
              </div>
              {showTime && (
                <div className="text-sm text-gray-400">
                  {moment(time).format("DD MMM YYYY, h:mm:ss A")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

const MessageInfoSkeleton = () => {
  return (
     <div className="animate-pulse space-y-6">
          <div className="h-4 w-32 rounded bg-gray" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gray" />
            <div className="h-4 flex-1 rounded bg-gray" />
          </div>
          <div className="h-4 w-24 rounded bg-gray" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gray" />
            <div className="h-4 flex-1 rounded bg-gray" />
          </div>
          <div className="h-4 w-28 rounded bg-gray" />
          <div className="h-4 w-44 rounded bg-gray" />
        </div>
  )
}

export default MessageInfoSkeleton
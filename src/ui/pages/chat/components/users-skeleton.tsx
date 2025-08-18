const UsersSkeleton = ({ skeleton = 3 }: { skeleton?: number }) => {
  return Array.from({ length: skeleton })?.map((_, index) => (
    <div key={index} className="flex w-full animate-pulse items-center justify-between px-3 py-3">
      <div className="mr-5 h-[50px] w-[60px] rounded-full bg-gray-700/50" />

      <div className="flex h-full w-full justify-between border-t border-neutral-700 py-1 mt-0.5">
        <div className="flex flex-col justify-between space-y-2">
          <div className="h-4 w-24 rounded bg-gray-700/50" />
          <div className="h-3 w-40 rounded bg-gray-700/50" />
        </div>
        <div className="flex flex-col items-end justify-between">
          <div className="h-3 w-14 rounded bg-gray-700/50" />
        </div>
      </div>
    </div>
  ));
};

export default UsersSkeleton;

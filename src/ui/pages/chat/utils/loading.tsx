const Loading = () => {
  return (
    <div className="flex items-center space-x-2 bg-dark3/80 backdrop-blur-sm rounded-full px-4 py-2">
      <div className="loading-dots">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <span className="text-gray text-sm">Loading messages...</span>
    </div>
  );
};

export default Loading;

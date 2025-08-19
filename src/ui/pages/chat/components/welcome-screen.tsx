export const WelcomeScreen = () => {
  return (
    <div className="h-full w-full bg-dark flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='0.1'%3e%3ccircle cx='30' cy='30' r='1.5'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <div className="max-w-md text-center relative z-10">
        <div className="w-40 h-40 mx-auto mb-8 bg-green2/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-green2/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            className="w-20 h-20 text-green2"
          >
            <path
              fill="currentColor"
              d="M10 2a8 8 0 1 1-3.613 15.14l-.121-.065l-3.645.91a.5.5 0 0 1-.62-.441v-.082l.014-.083l.91-3.644l-.063-.12a8 8 0 0 1-.83-2.887l-.025-.382L2 10a8 8 0 0 1 8-8m.5 9h-3l-.09.008a.5.5 0 0 0 0 .984L7.5 12h3l.09-.008a.5.5 0 0 0 0-.984zm2-3h-5l-.09.008a.5.5 0 0 0 0 .984L7.5 9h5l.09-.008a.5.5 0 0 0 0-.984z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-light text-light mb-4">
          Let's Chat Desktop
        </h1>
        <p className="text-gray text-lg leading-relaxed mb-8">
          Welcome to Let's Chat! Select a chat from the sidebar to start
          messaging.
        </p>

        <div className="mt-12 p-4 bg-dark3/30 rounded-lg border border-dark3/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center text-gray">
              <div className="w-8 h-8 rounded-full bg-green2/20 flex items-center justify-center mr-3">
                <span className="text-green2 font-semibold text-sm">1</span>
              </div>
              <span className="text-sm">
                Click on any contact to start chatting
              </span>
            </div>

            <div className="flex items-center text-gray">
              <div className="w-8 h-8 rounded-full bg-green2/20 flex items-center justify-center mr-3">
                <span className="text-green2 font-semibold text-sm">2</span>
              </div>
              <span className="text-sm">
                Share files, photos, and documents
              </span>
            </div>
            <div className="flex items-center text-gray">
              <div className="w-8 h-8 rounded-full bg-green2/20 flex items-center justify-center mr-3">
                <span className="text-green2 font-semibold text-sm">3</span>
              </div>
              <span className="text-sm">Express yourself with emojis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../components/ui/resizable";
import { WelcomeScreen } from "./components/welcome-screen";
import Chats from "./container/chats";
import RecentList from "./container/recent-list";

const Index = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel
          defaultSize={30}
          minSize={25}
          maxSize={40}
          className="h-full bg-foreground flex flex-col"
        >
          <RecentList
            onUserSelect={handleUserSelect}
            selectedUserId={selectedUser?.id}
          />
        </ResizablePanel>
        <ResizableHandle className="cursor-col-resize bg-dark3 hover:bg-gray transition-colors w-1" />
        <ResizablePanel
          defaultSize={70}
          minSize={50}
          className="h-full flex flex-col"
        >
          {selectedUser ? (
            <Chats selectedUser={selectedUser} />
          ) : (
            <WelcomeScreen />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;

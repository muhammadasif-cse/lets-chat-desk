import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../components/ui/resizable";
import Chats from "./container/chats";
import RecentList from "./container/recent-list";

const Index = () => {
  return (
    <div className="hidden h-screen w-full md:flex">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel
          defaultSize={27}
          minSize={20}
          maxSize={35}
          className="h-full bg-foreground"
        >
          <RecentList />
        </ResizablePanel>
        <ResizableHandle className="cursor-col-resize bg-gray hover:w-1.5" />
        <ResizablePanel defaultSize={73} minSize={50} className="h-full">
          <Chats />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;

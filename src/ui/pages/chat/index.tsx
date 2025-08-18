import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../components/ui/resizable";
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
          <div className="flex h-full flex-col overflow-hidden border-r border-gray-700">
            <RecentList />
          </div>
        </ResizablePanel>
        <ResizableHandle className="cursor-col-resize bg-gray-700 hover:w-1.5" />
        <ResizablePanel defaultSize={73} minSize={50} className="h-full">
          
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;

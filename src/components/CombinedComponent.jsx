import { ChatSideBar } from "./ChatSideBar";
import ChatBot from "./ChatBot";

const CombinedComponent = () => {
  return (
    <div className="relative min-h-screen bg-black flex">
      <ChatSideBar />
      <div className="flex-1 flex justify-center items-center">
        <ChatBot />
      </div>
    </div>
  );
};

export default CombinedComponent;

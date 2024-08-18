import { useState } from "react";
import { FiMenu } from "react-icons/fi"; // Importing the menu icon from react-icons

const navItems = ["home", "settings", "build", "cloud", "mail", "bookmark"];

export const ChatSideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="min-h-screen bg-[#17132a]">
      <aside className={`bg-slate-700 h-full transition-all duration-500 ${isOpen ? "w-[260px]" : "w-0"}`}>
        <div className="relative h-full">
          <header className="flex items-center justify-between h-16 p-2 bg-black bg-opacity-25">
            <button
              type="button"
              className="text-white p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              <FiMenu size={24} /> {/* Using the menu icon */}
            </button>
            {isOpen && <span className="h-7 transition-opacity duration-300" >Vision</span>}
          </header>
          {isOpen && (
            <nav className="p-2 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="flex items-center gap-3 p-3 text-white rounded-md hover:bg-black hover:bg-opacity-30"
                >
                  <span className="material-symbols-outlined">{item}</span>
                  <p>{item}</p>
                </button>
              ))}
            </nav>
          )}
        </div>
      </aside>
    </section>
  );
};

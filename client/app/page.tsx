'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import FileUploadComponent from "@/components/FileComponent";
import ChatComp from "@/components/chat";

export default function Home() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <main className="flex w-full h-screen overflow-hidden bg-[#fefae0]">
      <aside className="hidden md:flex md:w-[35%] lg:w-[30%] h-full p-6 justify-center items-center border-r-4 border-black overflow-y-auto">
        <FileUploadComponent />
      </aside>

      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="relative w-[85%] max-w-sm h-full bg-[#fefae0] p-4 overflow-y-auto border-r-4 border-black shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
            <div className="flex justify-end">
              <button
                onClick={() => setDrawerOpen(false)}
                className="bg-[#ff006e] text-white border-[3px] border-black w-10 h-10 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                aria-label="Close upload panel"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
            <FileUploadComponent />
          </aside>
        </div>
      )}

      <section className="flex-1 h-full overflow-hidden">
        <ChatComp onMenuClick={() => setDrawerOpen(true)} />
      </section>
    </main>
  );
}

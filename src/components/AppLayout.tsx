import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import Footer from "./Footer";

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <main className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ClickSpark from "./components/ClickSpark";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Submit from "./pages/Submit";
import Approve from "./pages/Approve";
import Transactions from "./pages/Transactions";

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      {isHome ? (
        /* Home: top navbar, full-width content — no spark on homepage */
        <>
          <TopNavbar />
          <main style={{ paddingTop: 60 }}>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
        </>
      ) : (
        /* Authenticated pages: ClickSpark enabled */
        <ClickSpark enabled>
          <div className="app-shell">
            <Sidebar />
            <main className="main-content" style={{ fontFamily: "var(--font-content)" }}>
              <Routes>
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/submit"
                  element={
                    <ProtectedRoute ownerOnly>
                      <Submit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/approve"
                  element={
                    <ProtectedRoute ownerOnly>
                      <Approve />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <Transactions />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </ClickSpark>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#111118",
            color: "#e2e8f0",
            border: "1px solid rgba(168,85,247,0.35)",
            borderRadius: "8px",
            fontSize: "13.5px",
            fontFamily: "var(--font-content)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          },
          success: {
            iconTheme: { primary: "#a855f7", secondary: "#fff" },
          },
        }}
      />
      <AppLayout />
    </BrowserRouter>
  );
}
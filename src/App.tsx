import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppRoutes } from "@/app/routes";
import { AuthProvider } from "@/context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#2a1f15",
              border: "1px solid rgba(179, 0, 27, 0.25)",
              boxShadow: "0 12px 32px rgba(42, 31, 21, 0.12)",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

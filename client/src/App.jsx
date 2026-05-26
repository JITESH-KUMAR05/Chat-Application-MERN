import { createBrowserRouter, RouterProvider } from "react-router";

import ChatWorkspace from "./pages/ChatWorkspace";
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatArea from "./components/ChatArea";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./utils/protectedRoute";
import DashboardPage from "./pages/DashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SplashScreen />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/chat",
    // 🚨 CRITICAL SECURITY: Kept the ProtectedRoute wrapper from Code 1
    element: (
      <ProtectedRoute>
        <ChatWorkspace />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        // 🚨 POLISHED: Matched the Dark Mode theme of your ChatArea
        element: (
          <div className="flex-1 bg-[#020617] flex items-center justify-center">
            <p className="text-slate-500 text-lg">Select a chat to start messaging</p>
          </div>
        )
      },
      {
        path: ":userId",
        element: <ChatArea />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      }
    ]
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    )
  }
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
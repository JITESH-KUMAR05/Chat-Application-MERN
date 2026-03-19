import { createBrowserRouter, RouterProvider } from "react-router";
import ChatWorkspace from "./pages/ChatWorkspace";
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatArea from "./components/ChatArea";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SplashScreen />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/chat",
    element: <ChatWorkspace />,
    children: [
      {
        index: true,
        element: (
          <div className="flex-1 bg-white flex items-center justify-center">
            <p className="text-gray-500 text-lg">
              Select a chat to start messaging
            </p>
          </div>
        ),
      },
      {
        path: ":userId",
        element: <ChatArea />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

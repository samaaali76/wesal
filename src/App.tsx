import MainLayout from "./layouts/MainLayout";
import Profile from "./pages/Profile";
import { createHashRouter, RouterProvider } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Feed from "./pages/Feed";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Bookmarks from "./pages/Bookmarks";
import UserProfile from "./pages/UserProfile";
import PostPage from "./pages/PostPage";
const router = createHashRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "signup", element: <SignUp /> },
      { path: "signin", element: <SignIn /> },
        { path: "*", element: <NotFound /> },
        { path: "/bookmarks", element: <Bookmarks /> },
{ path: "/users/:id", element: <UserProfile /> },
    ],
  },
  {
  element: <ProtectedRoute />,
  children: [
    {
      element: <MainLayout />,
      children: [
        { path: "/", element: <Feed /> },
        { path: "/profile", element: <Profile /> },
        { path: "/notifications", element: <Notifications /> },
        { path: "/posts/:id", element: <PostPage /> },
      ],
    },
  ],
},
]);

export default function App() {
  return <RouterProvider router={router} />;
}
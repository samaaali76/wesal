import { Navigate, Outlet } from "react-router-dom";
import { get_token } from "../lib/api";

export default function ProtectedRoute() {
  return get_token() ? <Outlet /> : <Navigate to="/signin" replace />;
}
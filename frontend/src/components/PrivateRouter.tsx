import { Navigate, Outlet } from "react-router-dom";

interface PrivateRouterProps {
  redirectTo?: string;
}

const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access_token");
};

export default function PrivateRouter({ 
  redirectTo = "/login" 
}: PrivateRouterProps): React.JSX.Element {
  return isAuthenticated() ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
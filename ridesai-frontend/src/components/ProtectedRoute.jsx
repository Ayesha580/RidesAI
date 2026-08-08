import { Navigate } from "react-router-dom";
import { hasFeature } from "../utils/planAccess";
import FeatureNotAvailable from "./FeatureNotAvailable";

export default function ProtectedRoute({ children, feature }) {

  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (feature && !hasFeature(feature)) {
    return <FeatureNotAvailable />;
  }

  // Login + feature available
  return children;
}

import { hasFeature } from "../utils/planAccess";
import FeatureNotAvailable from "./FeatureNotAvailable";

export default function ProtectedRoute({ children, feature }) {

    if(feature && !hasFeature(feature)){
        return <FeatureNotAvailable />;
    }

    return children;
}
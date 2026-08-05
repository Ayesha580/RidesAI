export default function FeatureNotAvailable(){
    return (
        <div style={{
            padding:"40px",
            textAlign:"center"
        }}>
            <h2>Feature not available in your plan</h2>
            <p>Please upgrade your subscription to access this feature.</p>
        </div>
    );
}
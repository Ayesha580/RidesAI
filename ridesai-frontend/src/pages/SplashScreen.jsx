import "./SplashScreen.css";
import logo from "../assets/logo.jpeg";

export default function SplashScreen() {
  return (
    <div className="splash-screen">

      {/* Cute Cartoon Characters */}
      <div className="cartoon cartoon-one">
        <div className="character-face">
          <span className="eye">●</span>
          <span className="eye">●</span>
          <span className="smile">⌣</span>
        </div>
        <div className="character-body">🎒</div>
      </div>

      <div className="cartoon cartoon-two">
        <div className="animal-face">
          <span>●</span>
          <span>●</span>
          <small>⌣</small>
        </div>
        <div className="animal-body">🐾</div>
      </div>

      <div className="cartoon cartoon-three">
        <div className="robot">
          <span className="robot-eye">●</span>
          <span className="robot-eye">●</span>
          <div className="robot-smile">⌣</div>
        </div>
      </div>

      {/* Floating Decorations */}
      <div className="star star-one">✦</div>
      <div className="star star-two">✦</div>
      <div className="cloud cloud-one">☁</div>
      <div className="cloud cloud-two">☁</div>

      {/* Main Content */}
      <div className="splash-content">
        <img src={logo} alt="Rides AI" className="splash-logo" />

        <h1>Rides AI</h1>
      </div>

      <div className="splash-bottom">
        Owned by <strong>Rides Technologies</strong>
      </div>
    </div>
  );
}
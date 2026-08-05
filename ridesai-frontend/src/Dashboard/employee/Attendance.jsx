import { useEffect, useState, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import "./Attendance.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

export default function Attendance() {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState("00:00:00");
  const [monitoring, setMonitoring] = useState(false);
  const [officeHours, setOfficeHours] = useState(null);

  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
  });

  const streamRef = useRef(null);
  const captureTimeoutRef = useRef(null);

  useEffect(() => {
    getLocation();
    loadAttendance();
    loadOfficeHours();

    // Agar tab band ho ya reload ho, screen-share cleanly rok dein
    return () => {
      stopScreenMonitoring();
    };
  }, []);

  // Live-updating timer while clocked in and not yet clocked out
  useEffect(() => {
    if (!attendance?.clock_in || attendance?.clock_out) return;

    const interval = setInterval(() => {
      const start = new Date(attendance.clock_in);
      const now = new Date();

      let diff = Math.floor((now - start) / 1000);

      let h = String(Math.floor(diff / 3600)).padStart(2, "0");
      diff %= 3600;

      let m = String(Math.floor(diff / 60)).padStart(2, "0");
      let s = String(diff % 60).padStart(2, "0");

      setTimer(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [attendance]);

  const getLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.log(err);
      }
    );
  };

  const loadAttendance = async () => {
    try {
      const res = await axiosClient.get("/hr/employee/attendance/today/");
      setAttendance(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadOfficeHours = async () => {
    try {
      const res = await axiosClient.get("/hr/company/office-hours/");
      setOfficeHours(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const sendAttendance = async (url) => {
    setLoading(true);

    try {
      await axiosClient.post(url, {
        latitude: location.latitude,
        longitude: location.longitude,
        browser: navigator.userAgent,
        device: navigator.platform,
        os: navigator.platform,
      });

      loadAttendance();
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    }

    setLoading(false);
  };

  // ---------------- Screenshot Monitoring ----------------

  const startScreenMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      streamRef.current = stream;
      setMonitoring(true);

      scheduleNextCapture();

      // Agar employee khud "Stop sharing" dabaye (browser ki built-in bar se)
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopScreenMonitoring();
      });

      return true;
    } catch (err) {
      console.log("Screen share permission denied:", err);
      alert(
        "Check-in requires screen-share permission for periodic activity screenshots."
      );
      return false;
    }
  };

  const scheduleNextCapture = () => {
    // Random interval, 5–15 minutes
    const delay = (5 + Math.random() * 10) * 60 * 1000;

    captureTimeoutRef.current = setTimeout(() => {
      captureFrame();
      scheduleNextCapture();
    }, delay);
  };

  const captureFrame = async () => {
    
    if (!streamRef.current) return;

    try {
      const video = document.createElement("video");
      video.srcObject = streamRef.current;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append("image", blob, "screenshot.png");

        try {
          await axiosClient.post(
            "/hr/employee/screenshots/upload/",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        } catch (err) {
          console.log("Screenshot upload failed:", err);
        }
      }, "image/png");
    } catch (err) {
      console.log("Capture failed:", err);
    }
  };

  const stopScreenMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }

    setMonitoring(false);
  };

  const handleCheckIn = async () => {
    const granted = await startScreenMonitoring();
    if (!granted) return; // permission na mile to check-in cancel

    sendAttendance("/hr/employee/checkin/");
  };

  const handleCheckOut = () => {
    stopScreenMonitoring();
    sendAttendance("/hr/employee/checkout/");
  };

  // ---------------------------------------------------------

  // NOTE: this only checks that we have coordinates + are clocked in,
  // it does not actually verify distance from an office location.
  const insideOffice =
    attendance?.clock_in && location.latitude && location.longitude;

  return (
    <div className="attendance-page">
      <div className="attendance-card">
        <h2>Attendance</h2>

        <div className="row">
          <span>Date</span>
          <strong>{attendance?.date || "-"}</strong>
        </div>

        <div className="row">
          <span>Clock In</span>
          <strong>{attendance?.clock_in || "-"}</strong>
        </div>

        <div className="row">
          <span>Clock Out</span>
          <strong>{attendance?.clock_out || "-"}</strong>
        </div>

        <div className="row">
          <span>Working Hours</span>
          <strong>{attendance?.worked_hours || "0"} hrs</strong>
        </div>

        <div className="row">
          <span>Break</span>
          <strong>{attendance?.total_break_minutes || 0} mins</strong>
        </div>

        <div className="row">
          <span>Status</span>
          <strong className={attendance?.is_late ? "late" : "ontime"}>
            {attendance?.is_late ? "Late" : "On Time"}
          </strong>
        </div>

        {officeHours && (
        <>
          <div className="row">
            <span>Office Hours</span>
            <strong>
              {officeHours.shift_start} - {officeHours.shift_end}
            </strong>
          </div>

          <div className="row">
            <span>Time Zone</span>
            <strong>{officeHours.timezone}</strong>
          </div>
        </>
      )}
        <div className="row">
          <span>Latitude</span>
          <strong>{location.latitude}</strong>
        </div>

        <div className="row">
          <span>Longitude</span>
          <strong>{location.longitude}</strong>
        </div>

        {monitoring && (
          <div
            className="row"
            style={{ color: "#0f766e", fontWeight: 600 }}
          >
            <span>🟢 Activity Monitoring</span>
            <strong>Active</strong>
          </div>
        )}

        {!attendance?.clock_in && (
          <p style={{ fontSize: 13, color: "#666", margin: "10px 0" }}>
            ⚠️ Checking in will ask for screen-share permission — periodic
            activity screenshots will be captured during work hours.
          </p>
        )}

        <div className="buttons">
          {!attendance?.clock_in && (
    <button onClick={handleCheckIn} disabled={loading}>
      {loading ? "Checking In..." : "Check In"}
    </button>
  )}
          {attendance?.clock_in && !attendance?.clock_out && (
  <>
    {!attendance?.is_on_break && (
      <button onClick={() => sendAttendance("/hr/employee/break/start/")}>
        Start Break
      </button>
    )}

    {attendance?.is_on_break && (
      <button onClick={() => sendAttendance("/hr/employee/break/end/")}>
        End Break
      </button>
    )}

    <button onClick={handleCheckOut} disabled={loading}>
      Check Out
    </button>
  </>
)}
        </div>

        <div className="row">
          <span>Office Status</span>
          <strong className={insideOffice ? "ontime" : "late"}>
            {insideOffice ? "Inside Office" : "Outside"}
          </strong>
        </div>

        <div className="timer">
          <h1>{timer}</h1>
          <p>Today's Working Time</p>
        </div>

        <MapContainer
          center={[location.latitude || 31.45, location.longitude || 73.13]}
          zoom={16}
          style={{
            height: 300,
            borderRadius: 12,
            marginTop: 25,
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {location.latitude && (
            <Marker position={[location.latitude, location.longitude]}>
              <Popup>Current Location</Popup>
            </Marker>
          )}
        </MapContainer>

        <div className="gps-card">
          <h3>GPS Tracking</h3>
          <p>
            Latitude : <strong>{location.latitude}</strong>
          </p>
          <p>
            Longitude : <strong>{location.longitude}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
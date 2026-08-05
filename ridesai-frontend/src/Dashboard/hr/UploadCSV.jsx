import { useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function UploadCSV({ onSuccess }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      await axiosClient.post(
        "/hr/applications/upload-csv/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("CSV uploaded successfully.");

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error(error);
      alert("Failed to upload CSV.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function downloadSample() {
    try {
      setDownloading(true);

      const response = await axiosClient.get(
        "/hr/applications/sample-csv/",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "sample_candidates.csv";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert("Unable to download sample CSV.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        onClick={triggerFilePicker}
        disabled={uploading}
        style={btnStyle}
      >
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />

      <button
        onClick={downloadSample}
        disabled={downloading}
        style={btnStyle}
      >
        {downloading ? "Downloading..." : "Download Sample"}
      </button>
    </>
  );
}

const btnStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  background: "#000",
  color: "#fff",
  cursor: "pointer",
  marginRight: "10px",
};
import { useState } from "react";
import CandidateModal from "./CandidateModal";

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  designation: "",
  department: "",
  salary: "",
  joining_date: "",
  resume: null,

};

export default function AddCandidate({ onSuccess }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function openModal() {
    setForm(emptyForm);
    setShowModal(true);
  }

  async function handleSubmit() {
  setSaving(true);

  try {
    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    await fetch("/api/hr/applications/add/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: formData,
    });

    setShowModal(false);
    onSuccess();

  } catch (error) {
    console.log(error);
  } finally {
    setSaving(false);
  }
}

  return (
    <>
      <button onClick={openModal} style={btnStyle}>
        + Add Candidate
      </button>

      {showModal && (
        <CandidateModal
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

const btnStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  background: "#000",
  cursor: "pointer",
};
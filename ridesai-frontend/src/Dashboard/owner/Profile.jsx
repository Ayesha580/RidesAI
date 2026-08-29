import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Profile.css";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

export default function Profile() {

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    cnic: "",

    business_name: "",
    business_type: "",
    business_address: "",

    is_registered: false,
    registration_number: "",
  });


  const [documents, setDocuments] = useState({
    business_registration_document: null,
    cnic_front: null,
    cnic_back: null,
    passport_size_photo: null,
  });


  const [newDocuments, setNewDocuments] = useState({
    business_registration_document: null,
    cnic_front: null,
    cnic_back: null,
    passport_size_photo: null,
  });


  const [previews, setPreviews] = useState({
    business_registration_document: null,
    cnic_front: null,
    cnic_back: null,
    passport_size_photo: null,
  });


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");


  useEffect(() => {
    loadProfile();
  }, []);


  async function loadProfile() {

    try {

      const res = await axiosClient.get("/owner/profile/");

      setForm({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        username: res.data.username || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        cnic: res.data.cnic || "",

        business_name: res.data.business_name || "",
        business_type: res.data.business_type || "",
        business_address: res.data.business_address || "",

        is_registered: res.data.is_registered || false,
        registration_number: res.data.registration_number || "",
      });


      setDocuments({

        business_registration_document:
          res.data.business_registration_document_url || null,

        cnic_front:
          res.data.cnic_front_url || null,

        cnic_back:
          res.data.cnic_back_url || null,

        passport_size_photo:
          res.data.passport_size_photo_url || null,

      });


    } catch (err) {

      console.log(err);

      setMessage("Failed to load profile.");

    } finally {

      setLoading(false);

    }

  }


  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };


  const handleFileChange = (e, fieldName) => {

    const file = e.target.files[0];

    if (!file) return;


    setNewDocuments({
      ...newDocuments,
      [fieldName]: file
    });


    const ext = file.name
      .split(".")
      .pop()
      .toLowerCase();


    if (IMAGE_EXTENSIONS.includes(ext)) {

      setPreviews({
        ...previews,
        [fieldName]: URL.createObjectURL(file)
      });

    } else {

      setPreviews({
        ...previews,
        [fieldName]: null
      });

    }

  };


  const isImage = (url) => {

    if (!url) return false;

    const ext = url
      .split("?")[0]
      .split(".")
      .pop()
      .toLowerCase();

    return IMAGE_EXTENSIONS.includes(ext);

  };


  const renderDocument = (
    label,
    fieldName
  ) => {

    const currentUrl = documents[fieldName];

    const newFile = newDocuments[fieldName];

    const preview = previews[fieldName];


    return (

      <div className="form-group">

        <label>
          {label}
        </label>


        {/* Current document */}

        {currentUrl && !preview && (

          <div className="doc-preview-wrap">

            {isImage(currentUrl) ? (

              <img
                src={currentUrl}
                alt={label}
                className="doc-preview-img"
              />

            ) : (

              <p className="doc-name">
                📄 Current document
              </p>

            )}


            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Current Document
            </a>

          </div>

        )}


        {/* New image preview */}

        {preview && (

          <div className="doc-preview-wrap">

            <p>
              New preview:
            </p>

            <img
              src={preview}
              alt={`New ${label}`}
              className="doc-preview-img"
            />

          </div>

        )}


        {/* New PDF / non-image */}

        {newFile && !preview && (

          <p className="doc-name">
            📄 Selected: {newFile.name}
          </p>

        )}


        {/* No document */}

        {!currentUrl && !newFile && (

          <p className="doc-empty">
            No document uploaded yet.
          </p>

        )}


        <input
          type="file"
          accept={
            fieldName === "passport_size_photo"
              ? "image/*"
              : "image/*,.pdf"
          }
          onChange={(e) =>
            handleFileChange(
              e,
              fieldName
            )
          }
        />

      </div>

    );

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setSaving(true);
    setMessage("");


    try {

      const payload = new FormData();


      // User + company fields

      Object.entries(form).forEach(
        ([key, value]) => {

          if (key !== "username") {

            payload.append(
              key,
              value
            );

          }

        }
      );


      // Documents

      Object.entries(newDocuments).forEach(
        ([key, file]) => {

          if (file) {

            payload.append(
              key,
              file
            );

          }

        }
      );


      await axiosClient.put(
        "/owner/profile/",
        payload,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );


      setMessage(
        "Profile updated successfully."
      );


      // Reload current documents

      await loadProfile();


      setNewDocuments({
        business_registration_document: null,
        cnic_front: null,
        cnic_back: null,
        passport_size_photo: null,
      });


      setPreviews({
        business_registration_document: null,
        cnic_front: null,
        cnic_back: null,
        passport_size_photo: null,
      });


    } catch (err) {

      console.log(err);

      setMessage(
        err.response?.data?.error ||
        "Failed to update profile."
      );

    } finally {

      setSaving(false);

    }

  };


  if (loading) {

    return (

      <div className="profile-form">

        <p>
          Loading profile...
        </p>

      </div>

    );

  }


  return (

    <form
      className="profile-form"
      onSubmit={handleSubmit}
    >


      {/* =================================
          PERSONAL INFORMATION
      ================================= */}

      <div className="form-group">

        <label>
          First Name
        </label>

        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
        />

      </div>


      <div className="form-group">

        <label>
          Last Name
        </label>

        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
        />

      </div>


      <div className="form-group">

        <label>
          Username
        </label>

        <input
          name="username"
          value={form.username}
          disabled
        />

      </div>


      <div className="form-group">

        <label>
          Email
        </label>

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

      </div>


      <div className="form-group">

        <label>
          Phone
        </label>

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />

      </div>


      <div className="form-group">

        <label>
          CNIC
        </label>

        <input
          name="cnic"
          value={form.cnic}
          onChange={handleChange}
        />

      </div>


      <hr />


      {/* =================================
          BUSINESS INFORMATION
      ================================= */}

      <div className="form-group">

        <label>
          Business Name
        </label>

        <input
          name="business_name"
          value={form.business_name}
          onChange={handleChange}
        />

      </div>


      <div className="form-group">

        <label>
          Business Type
        </label>

        <input
          name="business_type"
          value={form.business_type}
          onChange={handleChange}
        />

      </div>


      <div className="form-group">

        <label>
          Business Address
        </label>

        <input
          name="business_address"
          value={form.business_address}
          onChange={handleChange}
        />

      </div>


      {/* =================================
          BUSINESS REGISTRATION
      ================================= */}

      {
        form.is_registered && (

          <>

            <div className="form-group">

              <label>
                Registration Number
              </label>

              <input
                name="registration_number"
                value={form.registration_number}
                onChange={handleChange}
              />

            </div>


            {renderDocument(
              "Business Registration Document",
              "business_registration_document"
            )}

          </>

        )
      }


      {/* =================================
          OWNER DOCUMENTS
      ================================= */}

      <hr />


      <h4>
        Owner Documents
      </h4>


      {renderDocument(
        "CNIC / ID Card Front",
        "cnic_front"
      )}


      {renderDocument(
        "CNIC / ID Card Back",
        "cnic_back"
      )}


      {renderDocument(
        "Passport-size Photo",
        "passport_size_photo"
      )}


      {/* =================================
          MESSAGE
      ================================= */}

      {message && (

        <p className="form-message">
          {message}
        </p>

      )}


      {/* =================================
          SAVE
      ================================= */}

      <button
        type="submit"
        disabled={saving}
      >

        {
          saving
            ? "Saving..."
            : "Save Changes"
        }

      </button>


    </form>

  );

}

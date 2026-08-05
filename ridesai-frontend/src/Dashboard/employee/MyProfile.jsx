import { useEffect, useState } from "react";
import "./MyProfile.css";

export default function MyProfile() {

    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        designation: "",
        joining_date: "",
        gender: "",
        dob: "",
        employment_type: "",
        address: "",
        photo: null,
        status: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {

        const response = await fetch(
            "/api/hr/employee/profile/",
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            }
        );

        const data = await response.json();

        setProfile(data);
    }

    async function updateProfile() {

        const formData = new FormData();

        Object.keys(profile).forEach((key) => {

            if (profile[key] !== null) {
                formData.append(key, profile[key]);
            }

        });

        const response = await fetch(
            "/api/hr/employee/profile/",
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: formData,
            }
        );

        if (response.ok) {
            alert("Profile Updated Successfully");
        } else {
            alert("Unable to update profile.");
        }
    }

    function handleChange(e) {

        const { name, value } = e.target;

        setProfile({
            ...profile,
            [name]: value,
        });

    }

    function handlePhoto(e) {

        setProfile({
            ...profile,
            photo: e.target.files[0],
        });

    }

    return (

        <div className="employee-dashboard">

            <div className="panel">

                <div className="profile-header">

                    <div>

                        <img
                            className="profile-image"
                            src={
                                profile.photo instanceof File
                                    ? URL.createObjectURL(profile.photo)
                                    : profile.photo ||
                                      `https://ui-avatars.com/api/?name=${profile.first_name}`
                            }
                            alt=""
                        />

                        <input
                            type="file"
                            onChange={handlePhoto}
                        />

                    </div>

                    <div>

                        <h2>
                            {profile.first_name} {profile.last_name}
                        </h2>

                        <p>{profile.designation}</p>


                    </div>

                </div>

                <div className="profile-grid">

                    <div>
                        <label>First Name</label>
                        <input
                            name="first_name"
                            value={profile.first_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Last Name</label>
                        <input
                            name="last_name"
                            value={profile.last_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Email</label>
                        <input
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Phone</label>
                        <input
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Gender</label>
                        <select
                            name="gender"
                            value={profile.gender}
                            onChange={handleChange}
                        >
                            <option value="">Select</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={profile.dob || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Address</label>
                        <textarea
                            name="address"
                            value={profile.address}
                            onChange={handleChange}
                        />
                    </div>


                    <div>
                        <label>Designation</label>
                        <input
                            value={profile.designation}
                            readOnly
                        />
                    </div>


                </div>

                <div className="profile-actions">

                    <button
                        className="save-btn"
                        onClick={updateProfile}
                    >
                        Save Changes
                    </button>

                </div>

            </div>

        </div>
    );
}
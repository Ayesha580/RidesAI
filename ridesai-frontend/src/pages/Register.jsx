import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axiosClient from "../api/axiosClient";

import "./Register.css";


const initialState = {

    first_name: "",
    username: "",
    email: "",
    phone: "",
    cnic: "",

    business_type: "",
    business_name: "",
    business_address: "",

    is_registered: false,

    registration_number: "",

    password: "",
    confirm_password: "",

};


// Small helper component: label + red required star
function RequiredLabel({ text }) {

    return (

        <label className="field-label">

            {text} <span className="required-star">*</span>

        </label>

    );

}


export default function Register() {


    const [fields, setFields] = useState(initialState);

    const [businessRegistrationDocument, setBusinessRegistrationDocument] = useState(null);
    const [cnicFront, setCnicFront] = useState(null);
    const [cnicBack, setCnicBack] = useState(null);
    const [passportSizePhoto, setPassportSizePhoto] = useState(null);

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();


    function handleChange(e) {

        const {
            name,
            value,
            type,
            checked
        } = e.target;


        setFields({

            ...fields,

            [name]:
                type === "checkbox"
                    ?
                    checked
                    :
                    value

        });

    }


    async function handleSubmit(e) {

        e.preventDefault();

        setErrors({});


        // Clear any leftover tokens from a previous session/testing
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");


        if (fields.password !== fields.confirm_password) {

            setErrors({

                confirm_password:
                    "Passwords do not match."

            });

            return;

        }


        // Business registration document is required
        // only when business is registered.
        if (
            fields.is_registered &&
            !businessRegistrationDocument
        ) {

            setErrors({

                business_registration_document:
                    "Business registration document is required."

            });

            return;

        }


        // CNIC front is required
        if (!cnicFront) {

            setErrors({

                cnic_front:
                    "CNIC / ID Card front is required."

            });

            return;

        }


        // CNIC back is required
        if (!cnicBack) {

            setErrors({

                cnic_back:
                    "CNIC / ID Card back is required."

            });

            return;

        }


        // Passport-size photo is required
        if (!passportSizePhoto) {

            setErrors({

                passport_size_photo:
                    "Passport-size photo is required."

            });

            return;

        }


        setSubmitting(true);


        try {


            const formData = new FormData();


            Object.entries(fields).forEach(
                ([key, value]) => {

                    if (key !== "confirm_password") {

                        formData.append(
                            key,
                            value
                        );

                    }

                }
            );


            // Business registration document
            if (businessRegistrationDocument) {

                formData.append(
                    "business_registration_document",
                    businessRegistrationDocument
                );

            }


            // CNIC front
            if (cnicFront) {

                formData.append(
                    "cnic_front",
                    cnicFront
                );

            }


            // CNIC back
            if (cnicBack) {

                formData.append(
                    "cnic_back",
                    cnicBack
                );

            }


            // Passport-size photo
            if (passportSizePhoto) {

                formData.append(
                    "passport_size_photo",
                    passportSizePhoto
                );

            }


            await axiosClient.post(

                "/register/",

                formData,

                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }

            );


            // Account is NOT created yet.
            navigate("/select-plan");


        }
        catch (error) {


            console.log(
                error.response?.data
            );


            setErrors(

                error.response?.data ||
                {
                    detail:
                        "Registration failed."
                }

            );


        }
        finally {

            setSubmitting(false);

        }

    }


    return (

        <>


            <Header />


            <div className="register-page">


                <div className="register-card">


                    <h2>
                        Create Account
                    </h2>


                    {
                        Object.keys(errors).length > 0 &&

                        <div className="error-box">


                            {
                                Object.entries(errors).map(
                                    ([key, value]) => (

                                        <p key={key}>

                                            <strong>
                                                {key}
                                            </strong>
                                            :
                                            {
                                                Array.isArray(value)
                                                    ?
                                                    value.join(", ")
                                                    :
                                                    value
                                            }

                                        </p>

                                    )
                                )

                            }


                        </div>

                    }


                    <form
                        onSubmit={handleSubmit}
                        encType="multipart/form-data"
                    >


                        <RequiredLabel text="Full Name" />

                        <input
                            className="form-input"
                            name="first_name"
                            placeholder="John Smith"
                            onChange={handleChange}
                            required
                        />


                        <RequiredLabel text="Username" />

                        <input
                            className="form-input"
                            name="username"
                            placeholder="john"
                            onChange={handleChange}
                            required
                        />


                        <RequiredLabel text="Email" />

                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            placeholder="john12@gmail.com"
                            onChange={handleChange}
                            required
                        />


                        <RequiredLabel text="CNIC / ID Card Number" />

                        <input
                            className="form-input"
                            name="cnic"
                            placeholder="35403-9765437-9"
                            onChange={handleChange}
                            required
                        />


                        <RequiredLabel text="Phone Number" />

                        <input
                            className="form-input"
                            name="phone"
                            placeholder="03123456789"
                            onChange={handleChange}
                            required
                        />


                        <h4>
                            Business Status
                        </h4>


                        <div className="radio-group">


                            <label>

                                <input
                                    type="radio"
                                    checked={
                                        fields.is_registered === true
                                    }
                                    onChange={() =>
                                        setFields({
                                            ...fields,
                                            is_registered: true
                                        })
                                    }
                                />

                                Registered Business

                            </label>


                            <label>

                                <input
                                    type="radio"
                                    checked={
                                        fields.is_registered === false
                                    }
                                    onChange={() =>
                                        setFields({
                                            ...fields,
                                            is_registered: false
                                        })
                                    }
                                />

                                Non Registered Business

                            </label>


                        </div>


                        <RequiredLabel text="Business Name" />

                        <input
                            className="form-input"
                            name="business_name"
                            placeholder="Business Name"
                            onChange={handleChange}
                            required
                        />


                        <RequiredLabel text="Business Type" />

                        <input
                            className="form-input"
                            name="business_type"
                            placeholder="Business Type"
                            onChange={handleChange}
                            required
                        />


                        <RequiredLabel text="Business Address" />

                        <textarea
                            className="form-input"
                            name="business_address"
                            placeholder="Business Address"
                            onChange={handleChange}
                            required
                        />


                        {/* ================================= */}
                        {/* BUSINESS REGISTRATION */}
                        {/* ================================= */}

                        {
                            fields.is_registered &&

                            <div className="file-box">


                                <h4>
                                    Business Registration
                                </h4>


                                <RequiredLabel text="Registration Number" />

                                <input
                                    className="form-input"
                                    name="registration_number"
                                    placeholder="Business Registration Number"
                                    onChange={handleChange}
                                    required
                                />


                                <RequiredLabel text="Business Registration Document" />

                                <input
                                    type="file"
                                    accept="application/pdf,image/*"
                                    onChange={(e) =>
                                        setBusinessRegistrationDocument(
                                            e.target.files[0]
                                        )
                                    }
                                    required
                                />


                            </div>

                        }


                        {/* ================================= */}
                        {/* OWNER IDENTITY DOCUMENTS */}
                        {/* ================================= */}

                        <div className="file-box">


                            <h4>
                                Owner Identity Documents
                            </h4>


                            <RequiredLabel text="CNIC / ID Card Front" />

                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) =>
                                    setCnicFront(
                                        e.target.files[0]
                                    )
                                }
                                required
                            />

                            <RequiredLabel text="CNIC / ID Card Back" />

                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) =>
                                    setCnicBack(
                                        e.target.files[0]
                                    )
                                }
                                required
                            />


                            <RequiredLabel text="Passport-size Photo" />

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setPassportSizePhoto(
                                        e.target.files[0]
                                    )
                                }
                                required
                            />

                        </div>


                        {/* ================================= */}
                        {/* PASSWORD */}
                        {/* ================================= */}

                        <RequiredLabel text="Password" />

                        <input
                            className="form-input"
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleChange}
                            required
                        />


                        <RequiredLabel text="Confirm Password" />

                        <input
                            className="form-input"
                            type="password"
                            name="confirm_password"
                            placeholder="Confirm Password"
                            onChange={handleChange}
                            required
                        />


                        <button
                            className="register-btn"
                            disabled={submitting}
                        >

                            {
                                submitting
                                    ? "Creating Account..."
                                    : "Register & Continue"
                            }

                        </button>


                        <div className="login-link">

                            <br />

                            <span>
                                Already have an account?
                            </span>

                            <Link to="/login">
                                Log In
                            </Link>

                        </div>


                    </form>


                </div>


            </div>


            <Footer />


        </>

    );

}

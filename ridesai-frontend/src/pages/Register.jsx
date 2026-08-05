import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axiosClient from "../api/axiosClient";

import "./Register.css";


const initialState = {

    first_name:"",
    username:"",
    email:"",
    phone:"",
    cnic:"",

    business_type:"",
    business_name:"",
    business_address:"",

    is_registered:false,

    password:"",
    confirm_password:"",

};


// Small helper component: label + red required star
function RequiredLabel({ text }) {

    return (

        <label className="field-label">

            {text} <span className="required-star">*</span>

        </label>

    );

}



export default function Register(){


const [fields,setFields] = useState(initialState);

const [registrationDocs,setRegistrationDocs] = useState(null);

const [errors,setErrors] = useState({});

const [submitting,setSubmitting] = useState(false);


const navigate = useNavigate();



function handleChange(e){

    const {
        name,
        value,
        type,
        checked
    } = e.target;


    setFields({

        ...fields,

        [name]:
        type==="checkbox"
        ?
        checked
        :
        value

    });

}



async function handleSubmit(e){

e.preventDefault();

setErrors({});

// Clear any leftover tokens from a previous session/testing —
// the account doesn't exist yet at this stage, so no token
// should be attached to requests until after payment completes.
localStorage.removeItem("access_token");
localStorage.removeItem("refresh_token");



if(fields.password !== fields.confirm_password){

    setErrors({

        confirm_password:
        "Passwords do not match."

    });

    return;

}



if(fields.is_registered && !registrationDocs){

    setErrors({

        registration_docs:
        "Registration documents required."

    });

    return;

}



setSubmitting(true);



try{


const formData = new FormData();



Object.entries(fields).forEach(
([key,value])=>{

    if(key !== "confirm_password"){

        formData.append(
            key,
            value
        );

    }

});



if(registrationDocs){

    formData.append(
        "registration_docs",
        registrationDocs
    );

}



await axiosClient.post(

    "/register/",

    formData,

    {
        headers:{
            "Content-Type":
            "multipart/form-data"
        }
    }

);



// Account is NOT created yet — details are only saved in the
// session until payment is completed. No tokens to store here.

navigate("/select-plan");



}
catch(error){


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
finally{

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
([key,value])=>(

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

placeholder="Full Name"

onChange={handleChange}

required

/>



<RequiredLabel text="Username" />

<input

className="form-input"

name="username"

placeholder="Username"

onChange={handleChange}

required

/>



<RequiredLabel text="Email" />

<input

className="form-input"

type="email"

name="email"

placeholder="Email"

onChange={handleChange}

required

/>



<RequiredLabel text="CNIC / ID Card" />

<input

className="form-input"

name="cnic"

placeholder="CNIC / ID Card"

onChange={handleChange}

required

/>



<RequiredLabel text="Phone Number" />

<input

className="form-input"

name="phone"

placeholder="Phone Number"

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

onChange={()=>setFields({

...fields,

is_registered:true

})}

/>

Registered Business

</label>




<label>

<input

type="radio"

checked={
fields.is_registered === false
}

onChange={()=>setFields({

...fields,

is_registered:false

})}

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







{
fields.is_registered &&

<div className="file-box">


<label>

Registration Documents <span className="required-star">*</span>

</label>



<input

type="file"

accept="application/pdf,image/*"

onChange={(e)=>
setRegistrationDocs(
e.target.files[0]
)
}

/>


</div>

}






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
  {submitting
    ? "Creating Account..."
    : "Register & Continue"}
</button>

<div className="login-link">
    <br/>
  <span>Already have an account? </span>
  <Link to="/login">Log In</Link>
</div>



</form>


</div>


</div>



<Footer />


</>


);


}
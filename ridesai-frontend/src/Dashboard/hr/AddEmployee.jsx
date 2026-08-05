import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./HRDashboard.css";

export default function AddEmployee({ onSuccess }) {

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    designation: "",
    age: "",
    manager: "",
  });

    const [managers,setManagers] = useState([]);


useEffect(()=>{

    console.log("Fetching managers...");

    axiosClient
    .get("/hr/managers/list/")
    .then(res=>{
        console.log("Managers response:", res.data);
        setManagers(res.data);
    })
    .catch(err=>{
        console.error("Managers fetch FAILED:", err);
        console.error("Status:", err.response?.status);
        console.error("Data:", err.response?.data);
    });

},[])

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setSubmitting(true);
    setErrors({});


    try {

      const res = await axiosClient.post(
        "/hr/employees/add/api/",
        form
      );


      onSuccess?.(res.data);


      setForm({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        designation: "",
        age: "",
        manager: "",
      });


    } catch(err) {

      if(err.response?.data){
        setErrors(err.response.data);
      }

    } finally {

      setSubmitting(false);

    }

  };


  return (

    <div className="employee-form-container">


      <div className="form-title">

        <h2>
          Add New Employee
        </h2>

        <p>
          Fill in the employee information below.
        </p>

      </div>
      {errors.error && (
      <div style={{
        background: "#fef2f2",
        color: "#991b1b",
        padding: "12px 16px",
        borderRadius: "8px",
        marginBottom: "20px",
      }}>
        {errors.error}
      </div>
    )}



      <form onSubmit={handleSubmit}>


        <div className="form-grid">


          <div className="form-group">

            <label>
              First Name
            </label>

            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="John"
              required
            />

            {errors.first_name &&
              <small>{errors.first_name}</small>
            }

          </div>




          <div className="form-group">

            <label>
              Last Name
            </label>

            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Smith"
              required
            />

            {errors.last_name &&
              <small>{errors.last_name}</small>
            }

          </div>




          <div className="form-group">

            <label>
              Username
            </label>

            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="johnsmith"
              required
            />

            {errors.username &&
              <small>{errors.username}</small>
            }

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
              placeholder="john@email.com"
              required
            />

            {errors.email &&
              <small>{errors.email}</small>
            }

          </div>




          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              required
            />

            {errors.password &&
              <small>{errors.password}</small>
            }

          </div>




          {/* Designation Dropdown */}

          <div className="form-group">

            <label>
              Designation
            </label>


            <select
              name="designation"
              value={form.designation}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Designation
              </option>

              <option value="Sales Executive">
                Sales Executive
              </option>

              <option value="Frontend Developer">
                Frontend Developer
              </option>

              <option value="Backend Developer">
                Backend Developer
              </option>

              <option value="MERN Stack Developer">
                MERN Stack Developer
              </option>

              <option value="App Developer">
                App Developer
              </option>

              <option value="UI/UX Designer">
                UI/UX Designer
              </option>

              <option value="QA Engineer">
                QA Engineer
              </option>

              <option value="DevOps Engineer">
                DevOps Engineer
              </option>

            </select>


            {errors.designation &&
              <small>{errors.designation}</small>
            }

          </div>
          <div className="form-group">

<label>
Manager
</label>
<select
    name="manager"
    value={form.manager}
    onChange={handleChange}
    required
  >
    <option value="">Select Manager</option>

    {managers.map((m) => (
      <option key={m.id} value={m.id}>
        {m.name} - {m.designation}
      </option>
    ))}

  </select>

  {errors.manager && (
    <small>{errors.manager}</small>
  )}

</div>





          <div className="form-group">

            <label>
              Age
            </label>

            <input
              type="number"
              name="age"
              min="18"
              max="100"
              value={form.age}
              onChange={handleChange}
              placeholder="25"
              required
            />

          </div>


        </div>




        <button
          type="submit"
          disabled={submitting}
          className="submit-btn"
        >

          {
            submitting
            ? "Creating Employee..."
            : "Add Employee"
          }

        </button>


      </form>


    </div>

  );

}
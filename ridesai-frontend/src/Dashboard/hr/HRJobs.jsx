import { useState } from "react";
import AddJob from "./AddJob";
import JobList from "./JobList";
import "./Jobs.css";

export default function HRJobs() {

    const [reload, setReload] = useState(false);
    const [showForm, setShowForm] = useState(false);

    return (

        <div className="jobs-container">

            <div className="jobs-header">

                <div>

                    <h1>Job Management</h1>

                    <p>Create and manage recruitment openings.</p>

                </div>

                <button
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Close" : "+ Create Job"}
                </button>

            </div>

            {showForm && (

                <div className="job-form-wrapper">

                    <AddJob
                        onSuccess={()=>{
                            setReload(!reload);
                            setShowForm(false);
                        }}
                    />

                </div>

            )}

            <JobList reload={reload}/>

        </div>

    );

}
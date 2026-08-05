import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "../Dashboard.css";


export default function ManagerDashboard(){

    const [stats,setStats] = useState({
        employees:0,
        tasks:0,
        pending_tasks:0,
        completed_tasks:0
    });


    useEffect(()=>{

        fetchDashboard();

    },[]);



    const fetchDashboard = async()=>{

        try{

            const res = await axiosClient.get(
                "/dashboard/manager/"
            );

            setStats(res.data);

        }
        catch(error){

            console.log(error);

        }

    }



    return (

        <div className="dashboard-container">


            <h2>
                Manager Dashboard
            </h2>


            <div className="cards">


                <div className="card">
                    <h3>
                        Team Members
                    </h3>

                    <p>
                        {stats.employees}
                    </p>
                </div>



                <div className="card">

                    <h3>
                        Total Tasks
                    </h3>

                    <p>
                        {stats.tasks}
                    </p>

                </div>



                <div className="card">

                    <h3>
                        Pending Tasks
                    </h3>

                    <p>
                        {stats.pending_tasks}
                    </p>

                </div>



                <div className="card">

                    <h3>
                        Completed
                    </h3>

                    <p>
                        {stats.completed_tasks}
                    </p>

                </div>


            </div>


        </div>

    )
}
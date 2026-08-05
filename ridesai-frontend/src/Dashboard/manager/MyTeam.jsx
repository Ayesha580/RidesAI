import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function MyTeam(){

    const [employees,setEmployees] = useState([]);
    const [loading,setLoading] = useState(true);


    useEffect(()=>{

    axiosClient
    .get("/hr/manager/team/")
    .then(res=>{

        console.log("MY TEAM RESPONSE:", res.data);

        setEmployees(res.data);

    })
    .catch(err=>{

        console.log("TEAM ERROR:", err.response?.data || err);

    })
    .finally(()=>{

        setLoading(false);

    })

},[]);



    if(loading){

        return <p>Loading team...</p>;

    }



    return (

        <div className="dashboard-container">

            <h2>
                My Team
            </h2>


            {
                employees.length === 0 ?

                <p>
                    No employees assigned to your team.
                </p>

                :

                <div className="table-card">

                    <table>

                        <thead>

                            <tr>

                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Designation</th>

                            </tr>

                        </thead>


                        <tbody>

                        {
                            employees.map(emp=>(

                                <tr key={emp.id}>

                                    <td>
                                        {emp.name}
                                    </td>

                                    <td>
                                        {emp.email}
                                    </td>


                                    <td>
                                        {emp.department || "-"}
                                    </td>


                                    <td>
                                        {emp.designation || "-"}
                                    </td>


                                </tr>

                            ))
                        }

                        </tbody>


                    </table>

                </div>

            }


        </div>

    )

}
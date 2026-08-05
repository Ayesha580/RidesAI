import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./OwnerEmployees.css";


export default function OwnerEmployees(){

    const [employees,setEmployees] = useState([]);
    const [loading,setLoading] = useState(true);


    useEffect(()=>{

        axiosClient
        .get("/hr/employees/list/api/")
        .then(res=>{
            setEmployees(res.data);
        })
        .catch(err=>{
            console.log(err);
        })
        .finally(()=>{
            setLoading(false);
        });

    },[]);



return (

<div className="owner-employees-page">


<h2>
Employees
</h2>



<div className="employee-table">


{
loading ?

<p>Loading...</p>


:


<table>


<thead>

<tr>

<th>Name</th>

<th>Email</th>

<th>Username</th>

<th>Designation</th>

<th>Age</th>

</tr>

</thead>



<tbody>


{
employees.length > 0 ?


employees.map(emp=>(


<tr key={emp.id}>


<td>
{emp.name}
</td>


<td>
{emp.email}
</td>


<td>
{emp.username}
</td>


<td>
{emp.designation || "-"}
</td>


<td>
{emp.age || "-"}
</td>


</tr>


))


:


<tr>

<td colSpan="5">
No Employees Found
</td>

</tr>


}



</tbody>



</table>


}


</div>


</div>


)

}
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./EmployeeAttendance.css";


export default function OwnerAttendance(){

    const [attendance,setAttendance] = useState([]);
    const [loading,setLoading] = useState(true);


    useEffect(()=>{

        axiosClient
        .get("/hr/attendance/company/")
        .then(res=>{
            setAttendance(res.data);
        })
        .catch(err=>{
            console.log(err);
        })
        .finally(()=>{
            setLoading(false);
        });


    },[]);



return(

<div className="owner-attendance-page">


<h2>
Employee Attendance
</h2>



<div className="attendance-table">


{
loading ?

<p>Loading...</p>


:


<table>


<thead>

<tr>

<th>Employee</th>

<th>Date</th>

<th>Clock In</th>

<th>Clock Out</th>

<th>Late</th>

</tr>

</thead>



<tbody>


{

attendance.length > 0 ?


attendance.map(record=>(


<tr key={record.id}>


<td>
{
record.employee_name ||
record.employee?.user?.name ||
"-"
}
</td>



<td>
{record.date}
</td>



<td>
{record.clock_in || "-"}
</td>



<td>
{record.clock_out || "-"}
</td>



<td>

{
record.is_late
?
"Yes"
:
"No"
}

</td>



</tr>


))


:


<tr>

<td colSpan="5">
No Attendance Found
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
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./OwnerTasks.css";


export default function OwnerTasks(){


    const [type,setType] = useState("");

    const [users,setUsers] = useState([]);
    const [tasks,setTasks] = useState([]);
    const [form,setForm] = useState({

        title:"",
        description:"",
        priority:"medium",
        due_date:"",
        assigned_to:""

    });



    useEffect(()=>{

        fetchTasks();

    },[]);




    const fetchTasks = async()=>{

        try{

            const res = await axiosClient.get(
                "/hr/owner/tasks/"
            );

            setTasks(res.data);

        }
        catch(err){

            console.log(err);

        }

    };





    const loadUsers = async (role) => {
    try {
        const res = await axiosClient.get(
            `/hr/owner/task-users/?role=${role}`
        );

        setUsers(res.data);
    } catch (err) {
        console.log(err);
    }
};
const handleType = (e) => {

    const value = e.target.value;

    setType(value);

    setUsers([]);

    setForm({
        ...form,
        assigned_to: ""
    });

    if (value) {
        loadUsers(value);
    }
};

    const submitTask = async (e) => {
    e.preventDefault();

    try {
        await axiosClient.post(
            "/hr/owner/tasks/create/",
            form
        );

        alert("Task Assigned Successfully");

        setForm({
            title: "",
            description: "",
            priority: "medium",
            due_date: "",
            assigned_to: "",
        });

        setType("");
        setUsers([]);

        fetchTasks();
    } catch (err) {
        console.log(err.response?.data);
    }
};
const staffTasks = tasks.filter(
    (task) =>
        task.assigned_role === "manager" ||
        task.assigned_role === "hr"
);

const employeeTasks = tasks.filter(
    (task) => task.assigned_role === "employee"
);

return (

<div className="owner-tasks-page">


<h2>
Owner Tasks
</h2>




<div className="task-form">


<form onSubmit={submitTask}>


<input

placeholder="Task Title"

value={form.title}

onChange={
e=>
setForm({

...form,

title:e.target.value

})
}

/>





<textarea

placeholder="Description"

value={form.description}

onChange={
e=>
setForm({

...form,

description:e.target.value

})
}

/>






<select

value={form.priority}

onChange={
e=>
setForm({

...form,

priority:e.target.value

})
}

>


<option value="low">
Low
</option>


<option value="medium">
Medium
</option>


<option value="high">
High
</option>


</select>







<select

value={type}

onChange={handleType}

>


<option value="">
Assign To
</option>


<option value="manager">
Manager
</option>


<option value="hr">
HR
</option>


</select>









{
type === "manager" && users.length > 0 && (
    <select
        value={form.assigned_to}
        onChange={(e) =>
            setForm({
                ...form,
                assigned_to: e.target.value,
            })
        }
    >
        <option value="">Select Manager</option>

        {users.map((user) => (
            <option key={user.id} value={user.id}>
                {user.name}
            </option>
        ))}
    </select>
)
}
{type === "hr" && (
    <select
        value={form.assigned_to}
        onChange={(e) =>
            setForm({
                ...form,
                assigned_to: e.target.value,
            })
        }
    >
        <option value="">Select HR</option>

        {users.map((user) => (
            <option key={user.id} value={user.id}>
                {user.name}
            </option>
        ))}
    </select>
)}

<input

type="date"

value={form.due_date}

onChange={
e=>
setForm({

...form,

due_date:e.target.value

})
}

/>





<button>

Assign Task

</button>




</form>


</div>
<hr />

<div className="task-tables">

  <div className="task-card">

    <h3>Manager & HR Tasks</h3>

    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Assigned To</th>
          <th>Role</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {staffTasks.length > 0 ? (
          staffTasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.assigned_to_name}</td>
              <td>{task.assigned_role}</td>
              <td>{task.status}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No tasks available.</td>
          </tr>
        )}
      </tbody>
    </table>

  </div>

  <div className="task-card">

    <h3>Employee Tasks</h3>

    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Employee</th>
          <th>Manager</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {employeeTasks.length > 0 ? (
          employeeTasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.assigned_to_name}</td>
                <td>{task.created_by_name}</td>
                <td>{task.status}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No employee tasks.</td>
          </tr>
        )}
      </tbody>
    </table>

  </div>

</div>



</div>


);


}
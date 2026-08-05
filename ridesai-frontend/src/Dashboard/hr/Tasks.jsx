import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./HRTasks.css";


export default function HRTasks(){

    const [tasks,setTasks] = useState([]);
    const [loading,setLoading] = useState(true);



    useEffect(()=>{

        fetchTasks();

    },[]);



    const fetchTasks = async()=>{

        try{

            const res = await axiosClient.get("/hr/hr/tasks/");
            setTasks(res.data);

        }
        catch(err){

            console.log(err);

        }
        finally{

            setLoading(false);

        }

    };




    const updateTask = async(id,status,completion)=>{

        try{

            await axiosClient.patch(
                `/hr/tasks/${id}/update/`,
                {
                    status,
                    completion
                }
            );


            setTasks(prev=>

                prev.map(task=>

                    task.id === id

                    ?

                    {
                        ...task,
                        status,
                        completion
                    }

                    :

                    task

                )

            );


        }
        catch(err){

            console.log(err);

        }

    };




return(

<div className="employee-task-page">



<div className="employee-task-header">


<div>

<h2>
My Tasks
</h2>


<p>
Tasks assigned to HR department
</p>

</div>



<div className="task-count">

{tasks.length} Tasks

</div>


</div>





<div className="employee-task-grid">



{

loading ?


<div className="empty-task">
Loading...
</div>



:

tasks.length === 0 ?


<div className="empty-task">
No tasks assigned yet
</div>



:


tasks.map(task=>(


<div
className="employee-task-card"
key={task.id}
>



<div className="task-card-top">


<h3>
{task.title}
</h3>



<span

className={
task.priority === "High"
?
"priority high"
:
task.priority === "Low"
?
"priority low"
:
"priority medium"
}

>

{task.priority}

</span>


</div>





<p className="description">

{task.description}

</p>






<div className="task-info">


<div>

<label>
Deadline
</label>


<span>
{task.due_date || "-"}
</span>

</div>





<div>

<label>
Assigned By
</label>


<span>
{task.created_by_name || "-"}
</span>


</div>



</div>








<div className="task-info">


<div>

<label>
Status
</label>


<select

value={task.status}

onChange={(e)=>
updateTask(
task.id,
e.target.value,
task.completion
)
}

>


<option value="todo">
Todo
</option>


<option value="in_progress">
In Progress
</option>


<option value="done">
Done
</option>


</select>


</div>





<div>

<label>
Progress
</label>


<span>
{task.completion}%
</span>


</div>


</div>







<input

type="range"

min="0"

max="100"

value={task.completion}

onChange={(e)=>

updateTask(
task.id,
task.status,
e.target.value
)

}

/>






<button

className="complete-btn"

disabled={task.status==="done"}

onClick={()=>


updateTask(
task.id,
"done",
100
)


}

>


{

task.status==="done"

?

"Completed ✓"

:

"Mark Completed"

}


</button>





</div>


))


}



</div>


</div>

)

}
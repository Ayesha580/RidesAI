import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./EmployeeTasks.css";


export default function EmployeeTasks(){
    const completeTask = (id)=>{
    if(!window.confirm("Mark this task as completed?"))
    return;
    axiosClient
    .put(`/hr/employee/tasks/${id}/complete/`)
    .then(()=>{
        alert("Task completed successfully");
        setTasks(prev=>
            prev.map(task=>
                task.id === id
                ?
                {
                    ...task,
                    status:"Completed"
                }
                :
                task
            )
        );
    })
    .catch(err=>{

        console.log(
            err.response?.data
        );

    });

};

    const [tasks,setTasks] = useState([]);


    useEffect(()=>{

        axiosClient
        .get("/hr/employee/tasks/")
        .then(res=>{

            setTasks(res.data);

        })
        .catch(err=>{

            console.log(err);

        });

    },[]);



    return (

        <div className="employee-task-page">


            <div className="employee-task-header">

                <div>

                    <h2>
                        My Tasks
                    </h2>

                    <p>
                        Tasks assigned by your manager
                    </p>

                </div>


                <div className="task-count">

                    {tasks.length} Tasks

                </div>


            </div>




            <div className="employee-task-grid">


            {
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
                                    Status
                                </label>


                                <span className="status">

                                    {task.status}

                                </span>


                            </div>


                        </div>





                        <button

className="complete-btn"

onClick={()=>completeTask(task.id)}

disabled={task.status==="Completed"}

>

{
task.status==="Completed"
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
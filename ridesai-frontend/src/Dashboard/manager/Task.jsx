import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./ManagerTask.css";

export default function ManagerTasks() {

    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        assigned_to: "",
        title: "",
        description: "",
        priority: "Medium",
        due_date: ""
    });

    useEffect(() => {
        loadTeam();
        loadTasks();
    }, []);

    const loadTeam = () => {
        axiosClient
            .get("/hr/manager/team/")
            .then((res) => {
                console.log("TEAM RESPONSE:", res.data);
                setEmployees(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const loadTasks = () => {
        axiosClient
            .get("/hr/manager/tasks/list/")
            .then((res) => {
                setTasks(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const assignTask = (e) => {
        e.preventDefault();

        axiosClient
            .post("/hr/manager/tasks/", form)
            .then(() => {
                alert("Task assigned successfully");
                loadTasks();
                setShowForm(false);
                setForm({
                    assigned_to: "",
                    title: "",
                    description: "",
                    priority: "Medium",
                    due_date: ""
                });
            })
            .catch((err) => {
                console.log(err.response?.data);
            });
    };

    const deleteTask = (id) => {
        if (!window.confirm("Are you sure you want to delete this task?"))
            return;

        axiosClient
            .delete(`/hr/manager/tasks/${id}/delete/`)
            .then(() => {
                alert("Task deleted");
                loadTasks();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <div className="rideai_mgrtask_page">

            <div className="rideai_mgrtask_header">
                <h2>Team Tasks</h2>

                <button
                    className="rideai_mgrtask_createbtn"
                    onClick={() => setShowForm(true)}
                >
                    + Create Task
                </button>
            </div>

            {showForm && (
                <div className="rideai_mgrtask_formcard">

                    <div className="rideai_mgrtask_formtop">
                        <h2>Assign Team Task</h2>

                        <button
                            className="rideai_mgrtask_closebtn"
                            onClick={() => setShowForm(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={assignTask}>

                        <div className="rideai_mgrtask_formgroup">
                            <label>Employee</label>

                            <select
                                name="assigned_to"
                                value={form.assigned_to}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Employee</option>

                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="rideai_mgrtask_formgroup">
                            <label>Task Title</label>

                            <input
                                type="text"
                                name="title"
                                placeholder="Enter task title"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="rideai_mgrtask_formgroup">
                            <label>Description</label>

                            <textarea
                                name="description"
                                placeholder="Describe task details"
                                value={form.description}
                                onChange={handleChange}
                                rows="4"
                                required
                            />
                        </div>

                        <div className="rideai_mgrtask_row">

                            <div className="rideai_mgrtask_formgroup">
                                <label>Priority</label>

                                <select
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>

                            <div className="rideai_mgrtask_formgroup">
                                <label>Deadline</label>

                                <input
                                    type="date"
                                    name="due_date"
                                    value={form.due_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>

                        <button className="rideai_mgrtask_assignbtn">
                            Assign Task
                        </button>

                    </form>

                </div>
            )}

            <div className="rideai_mgrtask_listcard">

                <h2>Assigned Tasks</h2>

                <table className="rideai_mgrtask_table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Employee</th>
                            <th>Priority</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tasks.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="rideai_mgrtask_empty">
                                    No tasks found
                                </td>
                            </tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.id}>
                                    <td data-label="Title">{task.title}</td>
                                    <td data-label="Employee">{task.assigned_to || "-"}</td>
                                    <td data-label="Priority">{task.priority}</td>
                                    <td data-label="Deadline">{task.due_date || "-"}</td>
                                    <td data-label="Status">{task.status}</td>
                                    <td data-label="Action">
                                        <button
                                            className="rideai_mgrtask_deletebtn"
                                            onClick={() => deleteTask(task.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

            </div>

        </div>
    );
}
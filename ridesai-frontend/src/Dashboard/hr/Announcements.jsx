import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Announcements.css";

export default function Announcements() {

    const [announcements,setAnnouncements]=useState([]);

    useEffect(()=>{
        loadAnnouncements();
    },[]);

    const loadAnnouncements=async()=>{

        const res=await axiosClient.get(
            "/hr/announcements/"
        );

        setAnnouncements(res.data);
    };

    return(

        <div className="announcement-page">

            <h2>Company Announcements</h2>

            {announcements.map(item=>(

                <div
                    key={item.id}
                    className="announcement-card"
                >

                    <h3>{item.title}</h3>

                    <p>{item.message}</p>

                    <div className="announcement-footer">

                        <span>
                            <strong>Company:</strong>{" "}
                            {item.company_name}
                        </span>

                        <span>
                            <strong>Posted By:</strong>{" "}
                            {item.created_by_name}
                        </span>

                        <span>
                            {new Date(item.created_at).toLocaleString()}
                        </span>

                    </div>

                </div>

            ))}

        </div>

    );

}
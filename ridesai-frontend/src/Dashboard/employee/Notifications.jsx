import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Notifications.css";

export default function Notifications() {

  const [notifications,setNotifications]=useState([]);

  useEffect(()=>{
      loadNotifications();
  },[]);

  const loadNotifications=async()=>{

      const res=await axiosClient.get(
          "/hr/employee/notifications/"
      );

      setNotifications(res.data);
  }

  return(

      <div className="notifications-page">

          <h2>Notifications</h2>

          {notifications.map(item=>(

              <div
                  key={item.id}
                  className={`notification-card ${item.is_read?"":"unread"}`}
              >

                  <div className="notification-header">

                      <h3>{item.title}</h3>

                      <span>
                          {new Date(item.created_at).toLocaleString()}
                      </span>

                  </div>

                  <p>{item.message}</p>

                  <div className="notification-footer">

                      <span>
                          <strong>Company:</strong>
                          {" "}
                          {item.company_name}
                      </span>

                      <span>
                          <strong>Manager:</strong>
                          {" "}
                          {item.manager_name}
                      </span>

                      <span className="badge">
                          {item.notification_type}
                      </span>

                  </div>

              </div>

          ))}

      </div>

  )

}
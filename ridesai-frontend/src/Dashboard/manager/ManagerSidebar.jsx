import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";


const menu = [
  { title: "Dashboard", path: "/manager/dashboard", icon: "📊" },
  { title: "My Team", path: "/manager/team", icon: "👨‍💼" },
  { title: "Tasks", path: "/manager/tasks", icon: "📋" },
    { title: "My Tasks", path: "/manager/mytasks", icon: "📋" },
   { title: "Announcements", path: "/manager/announcements", icon: "📋" },
//   { title: "Attendance", path: "/manager/attendance", icon: "🕒" },
];


export default function ManagerSidebar() {

  const navigate = useNavigate();


  const handleLogout = () => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    navigate("/login");

  };


  return (

    <aside className="sidebar">

      <div className="logo">

        <img
          src={logo}
          alt="Rides AI Logo"
          className="logo-img"
        />


        <div>

          <h2>
            Rides AI
          </h2>

          <p>
            Manager Panel
          </p>

        </div>


      </div>



      <ul className="menu">

        {
          menu.map((item)=>(

            <li key={item.path}>

              <NavLink

                to={item.path}

                className={({isActive}) =>
                  isActive ? "active" : ""
                }

              >

                <span>
                  {item.icon}
                </span>

                {item.title}


              </NavLink>


            </li>

          ))
        }


      </ul>



      <div className="sidebar-footer">

        <button
          className="logout-btn"
          onClick={handleLogout}
        >

          🚪 Logout

        </button>


      </div>


    </aside>

  )

}
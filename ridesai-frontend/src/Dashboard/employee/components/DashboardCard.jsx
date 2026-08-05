import "./DashboardCard.css";

export default function DashboardCard({
    title,
    value,
    subtitle,
    icon,
    color,
}) {

    return (

        <div className="dashboard-card">

            <div
                className="dashboard-card-icon"
                style={{ background: color }}
            >
                {icon}
            </div>

            <div>

                <span>{title}</span>

                <h2>{value}</h2>

                <small>{subtitle}</small>

            </div>

        </div>

    );

}
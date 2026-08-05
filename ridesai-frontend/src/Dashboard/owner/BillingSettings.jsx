import { useEffect, useState } from "react";
import { getPlanDetails, upgradePlan } from "../billing/billingApi";
import "./Settings.css";


const PLANS = {

    monthly: [
        {
            name: "Standard",
            price: 5,
            description: "Essential business tools"
        },
        {
            name: "Premium",
            price: 20,
            description: "Advanced management features"
        },
        {
            name: "Gold",
            price: 50,
            description: "Complete enterprise solution"
        }
    ],


    yearly: [
        {
            name: "Standard",
            price: 54,
            description: "Essential business tools"
        },
        {
            name: "Premium",
            price: 216,
            description: "Advanced management features"
        },
        {
            name: "Gold",
            price: 540,
            description: "Complete enterprise solution"
        }
    ]

};



export default function BillingSettings(){


const [tab,setTab] = useState("subscription");

const [current,setCurrent] = useState(null);

const [billing,setBilling] = useState("monthly");

const [selectedPlan,setSelectedPlan] = useState("");

const [seats,setSeats] = useState(1);

const [loading,setLoading] = useState(true);

const [processing,setProcessing] = useState(false);

const [message,setMessage] = useState("");





useEffect(()=>{


getPlanDetails()

.then(res=>{


console.log(
"PLAN DATA:",
res.data
);


const plan = res.data.plan;


setCurrent(plan);

setSelectedPlan(plan.name);

setBilling(
plan.billing || "monthly"
);

setSeats(
plan.seats || 1
);


})


.finally(()=>{

setLoading(false);

});


},[]);
async function handleUpgrade(planName, seatsToUse, billingToUse) {
  try {
    setProcessing(true);

    const res = await upgradePlan(planName, seatsToUse, billingToUse);

    setCurrent({
      name: res.data.plan,
      billing: billingToUse,
      seats: res.data.seats,
      price_per_seat: current.price_per_seat, // niche update ho jayega agar plan badla
    });

    // localStorage sync — sidebar ke hasFeature() ko naya plan dikhane ke liye
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      user.plan = res.data.plan;
      localStorage.setItem("user", JSON.stringify(user));
    }

    setMessage("Subscription updated successfully");
    setTimeout(() => window.location.reload(), 1000);
  } catch (error) {
    setMessage(
      error.response?.data?.error || "Something went wrong"
    );
  } finally {
    setProcessing(false);
  }
}
if(loading)

return (

<div>
Loading...
</div>

);





const plans = PLANS[billing];



const selectedPlanData =
plans.find(
p=>p.name===selectedPlan
);



const total =
selectedPlanData.price * seats;





const samePlan =

current.name === selectedPlan &&

current.billing === billing;






return (

<div className="billing-settings">





{/* Tabs */}

<div className="billing-tabs">


<button

className={
tab==="subscription"
?
"active"
:
""
}

onClick={()=>setTab("subscription")}

>

Subscription

</button>




<button

className={
tab==="seats"
?
"active"
:
""
}

onClick={()=>setTab("seats")}

>

Seat Management

</button>


</div>







{
tab==="subscription" &&

<>





{/* Current Plan */}


<div className="current-plan-box">


<div>


<span className="label">

Active Subscription

</span>


<h1>

{current.name}

</h1>


<p>

{current.seats} Seats

&nbsp; • &nbsp;

{current.billing}

</p>


</div>



<div className="current-price">

${current.price_per_seat}

<span>
/seat
</span>

</div>



</div>







{/* Billing Toggle */}


<div className="billing-toggle">


<button

className={
billing==="monthly"
?
"active"
:
""
}

onClick={()=>setBilling("monthly")}

>

Monthly

</button>




<button

className={
billing==="yearly"
?
"active"
:
""
}

onClick={()=>setBilling("yearly")}

>

Yearly

</button>



</div>








<h2>

Choose Plan

</h2>





<div className="plan-grid">

{
plans.map((p)=>(

<div
key={p.name}

className={`
plan-card

${selectedPlan===p.name ? "selected" : ""}

${
current.name===p.name &&
current.billing===billing
?
"current-plan-disabled"
:
""
}
`}


onClick={()=>{

if(
current.name!==p.name ||
current.billing!==billing
){
setSelectedPlan(p.name)
}

}}

>

<h3>
{p.name}
</h3>


<h2>
${p.price}
</h2>


<span>
per seat / {billing}
</span>



{
current.name===p.name &&
current.billing===billing &&

<span className="current-badge">
Current Plan
</span>

}


</div>

))
}

</div>
<h2>

Total:

${total}

/

{
billing==="monthly"
?
"month"
:
"year"
}

</h2>



<p>

{seats} seats × ${selectedPlanData.price}

</p>
<button
  className="upgrade-btn"
  disabled={samePlan || processing}
  onClick={() => handleUpgrade(selectedPlan, seats, billing)}
>
  {processing ? "Updating..." : "Upgrade Plan"}
</button>






</>

}
{
tab==="seats" &&

<div className="seat-management">

  <h2>Seat Management</h2>

  <p>Current Seats: <b>{current.seats}</b></p>

  <p>Price: <b>${current.price_per_seat}/seat</b></p>

  <div className="seat-control">
    <button
      onClick={() => setSeats((s) => Math.max(1, s - 1))}
      disabled={seats <= 1}
    >
      −
    </button>

    <h2>{seats}</h2>

    <button onClick={() => setSeats((s) => s + 1)}>
      +
    </button>
  </div>

  <h2>
    Additional Cost: $
    {Math.max(0, (seats - current.seats) * current.price_per_seat)}
  </h2>

  <button
    className="upgrade-btn"
    disabled={seats === current.seats || processing}
    onClick={() => handleUpgrade(current.name, seats, current.billing)}
  >
    {processing ? "Updating..." : "Update Seats"}
  </button>

</div>
}

{

message &&


<div className="success-message">

{message}

</div>


}




</div>


);


}
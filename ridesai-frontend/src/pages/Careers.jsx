import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";


export default function Careers(){


const [jobs,setJobs]=useState([]);



useEffect(()=>{


fetch(
"https://ridesai.cloud/api/hr/jobs/public/"
)

.then(res=>{

console.log("API STATUS:",res.status);

return res.json();

})

.then(data=>{

console.log("JOBS:",data);

setJobs(data);

})

.catch(error=>{

console.log("API ERROR:",error);

})


},[]);



return(

<div>


<Header/>


<section
style={{
padding:"50px"
}}
>


<h1>
Open Positions
</h1>



<div
style={{
display:"flex",
gap:"30px",
flexWrap:"wrap"
}}
>


{
jobs.length === 0 ?

<h3>
No Jobs Available
</h3>


:

jobs.map(job=>(


<div

key={job.id}

style={{
border:"1px solid #ddd",
padding:"20px",
borderRadius:"10px",
width:"300px"
}}

>


<h2>
{job.title}
</h2>


<p>
Department: {job.department}
</p>


<p>
Experience: {job.experience}
</p>


<p>
Deadline: {job.deadline}
</p>


<Link
to={`/careers/${job.id}`}
>

<button>
View Details
</button>


</Link>


</div>


))

}



</div>


</section>


<Footer/>


</div>

)

}
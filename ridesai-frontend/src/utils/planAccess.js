export const getUserPlan = () => {

 const user = JSON.parse(
  localStorage.getItem("user")
 );

 return user?.plan || "Standard";

};


export const hasFeature = (feature)=>{

 const plan = getUserPlan();


 const permissions = {

 Standard:[
   "employee",
   "attendance",
   "manager",
   "tasks"
 ],


 Premium:[
   "employee",
   "attendance",
   "manager",
   "hr",
   "tasks",
   "team_chat"
 ],


 Gold:[
   "employee",
   "attendance",
    "manager",
   "hr",
   "crm",
   "tasks",
   "mailbox",
   "team_chat"
 ]

 };


 return permissions[plan]?.includes(feature);

}
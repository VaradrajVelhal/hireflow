import { useEffect, useState } from "react";
import API from "../api/axios";

function MyApplications() {
  const [apps, setApps] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  useEffect(() => {
    API.get("my-applications/")
      .then((res) => setApps(res.data))
      .catch((err) => console.error(err));
  }, []);
  const getStatusColor = (status) => {
    switch (status) {
      case "applied":
        return "text-blue-500";
      case "interview":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

 return (
   <div className="p-6">
     <h2 className="text-xl mb-4">My Applications</h2>

     {apps.length === 0 ? (
       <p>No applications yet</p>
     ) : (
       apps.map((app) => (
         <div
           key={app.id}
           className={`border p-4 mb-3 rounded ${
             app.follow_up_date === today ? "bg-red-100" : ""
           }`}
         >
           <p>Job ID: {app.job}</p>
           <p className={getStatusColor(app.status)}>Status: {app.status}</p>
           <p>Follow-up: {app.follow_up_date || "N/A"}</p>
           <p>Applied via: {app.applied_via}</p>
         </div>
       ))
     )}
   </div>
 );
}

export default MyApplications;

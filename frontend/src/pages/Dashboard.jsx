import { useEffect, useState } from "react";
import API from "../api/axios";

function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    API.get("dashboard/")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  const [dueToday, setDueToday] = useState(0);

  useEffect(() => {
    API.get("due-today/")
      .then((res) => setDueToday(res.data.count))
      .catch((err) => console.error(err));
  }, []);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-blue-500 text-white rounded-xl shadow">
        Total: {data.total}
      </div>
      <div className="p-4 bg-green-500 text-white rounded-xl shadow">
        Applied: {data.applied}
      </div>
      <div className="p-4 bg-yellow-500 text-white rounded-xl shadow">
        Interview: {data.interview}
      </div>
      <div className="p-4 bg-red-500 text-white rounded-xl shadow">
        Rejected: {data.rejected}
      </div>
      <div className="p-4 bg-red-600 text-white rounded-xl shadow">
        Follow-ups Today: {dueToday}
      </div>
    </div>
  );
}

export default Dashboard;

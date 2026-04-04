import { useEffect, useState } from "react";
import API from "../api/axios";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  

  const checkMatch = async (jobId) => {
    const skills = prompt("Enter your skills (comma separated)");

    const res = await API.post("match-score/", {
      job_id: jobId,
      skills: skills,
    });

    alert(`Match Score: ${res.data.match_score}%`);
  };

  useEffect(() => {
    API.get("jobs/")
      .then((res) => setJobs(res.data))
      .catch((err) => console.error(err));
  }, []);

  const applyJob = async (jobId) => {
    try {
      await API.post("apply/", {
        job: jobId,
        status: "applied",
        applied_via: "Website",
      });

      alert("Applied and tracking started!");
    } catch (err) {
      console.error(err);
      alert("Error applying");
    }
  };
  return (
    <div className="border p-4 mb-3 rounded shadow hover:shadow-lg transition">
      <h2 className="text-xl mb-4">Jobs</h2>

      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white text-black p-5 rounded-xl shadow hover:shadow-lg transition mb-4"
        >
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
          <p className="text-sm text-gray-500">{job.location}</p>

          <button
            className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
            onClick={() => applyJob(job.id)}
          >
            Apply
          </button>
          <button
            onClick={() => checkMatch(job.id)}
            className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
          >
            Match Score
          </button>
          <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
            <button className="mt-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded">
              Apply on Website
            </button>
          </a>
        </div>
      ))}
    </div>
  );
}

export default Jobs;

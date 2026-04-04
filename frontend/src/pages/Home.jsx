function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">
        HireFlow – Job Tracker & Aggregator
      </h1>

      <p className="mb-6 max-w-xl">
        Discover jobs from multiple sources, apply on external websites, and
        track your application progress with reminders and insights.
      </p>

      <div className="space-x-4">
        <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </a>
        <a
          href="/register"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Register
        </a>
      </div>
    </div>
  );
}

export default Home;

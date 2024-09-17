const DashboardContent = () => {
  return (
    <div className="p-6 flex-1 overflow-auto">
      <div>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold">My Task</h3>
            <p className="text-2xl">12</p>
          </div>
          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold">Projects</h3>
            <p className="text-2xl">8</p>
          </div>
          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold">Teams</h3>
            <p className="text-2xl">4</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg">
            <h3 className="text-sm font-bold mb-4">Recent Task</h3>
            <ul>
              <li>My List 1</li>
              <li>My List 2</li>
              <li>My List 3</li>
              <li>My List 4</li>
              <li>My List 5</li>
            </ul>
            <button className="mt-4 flex items-center text-blue-600">
              View All Task
            </button>
          </div>

          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg">
            <h3 className="text-sm font-bold mb-4">Recent Projects</h3>
            <ul>
              <li>Project 1</li>
              <li>Project 2</li>
              <li>Project 3</li>
              <li>Project 4</li>
              <li>Project 5</li>
            </ul>
            <button className="mt-4 flex items-center text-blue-600">
              View All Projects
            </button>
          </div>

          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg">
            <h3 className="text-sm font-bold mb-4">All Members</h3>
            <ul>
              <li>John Doe</li>
              <li>Jane Smith</li>
              <li>Jane Smith</li>
              <li>Jane Smith</li>
              <li>Jane Smith</li>
            </ul>
            <button className="mt-4 flex items-center text-blue-600">
              View All Members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;

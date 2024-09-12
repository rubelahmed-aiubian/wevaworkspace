import MyList from './MyList';

const DashboardContent = ({ selectedComponent }) => {
  return (
    <div className="p-6 flex-1 overflow-auto">
      <h2 className="text-2xl font-bold mb-6">{selectedComponent}</h2>
      
      {/* Render MyList component if selectedComponent is 'My List' */}
      {selectedComponent === 'My List' && <MyList />}
      
      {/* Existing content for other components */}
      {selectedComponent === 'Dashboard' && (
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow-lg p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold">My Task</h3>
            <p className="text-2xl">12</p>
          </div>
          <div className="bg-white shadow-lg p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold">Projects</h3>
            <p className="text-2xl">8</p>
          </div>
          <div className="bg-white shadow-lg p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold">Teams</h3>
            <div className="flex justify-center items-center">
              <img src="/images/ryan.png" alt="User" className="w-10 h-10 rounded-full -ml-4" />
              <img src="/images/ryan.png" alt="User" className="w-10 h-10 rounded-full -ml-4" />
              <img src="/images/ryan.png" alt="User" className="w-10 h-10 rounded-full -ml-4" />
            </div>
          </div>
        </div>
      )}
      
      {selectedComponent === 'Projects' && (
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Projects</h3>
            <ul>
              <li>Project 1</li>
              <li>Project 2</li>
              <li>Project 3</li>
            </ul>
          </div>
        </div>
      )}

      {selectedComponent === 'Teams' && (
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Teams</h3>
            <ul>
              <li>Team A</li>
              <li>Team B</li>
            </ul>
          </div>
        </div>
      )}
      
      {selectedComponent === 'Members' && (
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Members</h3>
            <ul>
              <li>John Doe</li>
              <li>Jane Smith</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;

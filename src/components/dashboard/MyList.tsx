import React, { useState, useEffect, useRef } from 'react';
import { FaCheck, FaTimes, FaFilter, FaSort } from 'react-icons/fa';

export default function MyList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCollaborator, setSelectedCollaborator] = useState('');
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('Current List');
  const [sort, setSort] = useState('Newest');
  const tasksPerPage = 20;

  const newTaskInputRef = useRef(null);

  const collaborators = ['John Doe', 'Jane Smith', 'Ryan Howard', 'Pam Beesly'];

  // Fetch tasks from the database here instead of localStorage (e.g., API call)
  useEffect(() => {
    // Example: fetch tasks from database and setTasks
    const fetchTasks = async () => {
      // Placeholder for actual API call
      const fetchedTasks = [
        // Sample data structure
        { name: 'Sample Task 1', date: '2024-09-18', collaborator: 'John Doe' },
        { name: 'Sample Task 2', date: '2024-09-19', collaborator: 'Jane Smith' },
      ];
      setTasks(fetchedTasks);
    };

    fetchTasks();
  }, []);

  const addTask = () => {
    if (newTask) {
      const updatedTasks = [
        ...tasks,
        { name: newTask, date: selectedDate, collaborator: selectedCollaborator }
      ];
      setTasks(updatedTasks);

      // Save new task to the database here (e.g., API call)
      setNewTask('');
      setSelectedDate('');
      setSelectedCollaborator('');
    }
  };

  const completeTask = (taskIndex) => {
    const updatedTasks = tasks.filter((_, index) => index !== taskIndex);
    setTasks(updatedTasks);

    // Update the task status in the database (e.g., API call)
  };

  const updateDate = (date, index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, date } : task
    );
    setTasks(updatedTasks);

    // Update the task date in the database (e.g., API call)
  };

  const updateCollaborator = (collaborator, index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, collaborator } : task
    );
    setTasks(updatedTasks);

    // Update the task collaborator in the database (e.g., API call)
  };

  const paginateTasks = tasks
    .filter((task) => filter === 'Current List' || (filter === 'Completed' && !task.name))
    .sort((a, b) => (sort === 'Newest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)))
    .slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  const handleTaskDoubleClick = (index) => {
    setEditingTaskIndex(index);
  };

  const handleTaskEdit = (e, index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, name: e.target.value } : task
    );
    setTasks(updatedTasks);

    // Update the task name in the database (e.g., API call)
  };

  const handleTaskEditBlur = () => {
    setEditingTaskIndex(null);
  };

  const handleTaskEditKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      handleTaskEditBlur(); // Exit edit mode on Enter
    }
  };

  const focusNewTaskInput = () => {
    if (newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <button
          onClick={focusNewTaskInput}
          className="bg-gray-900 text-white px-4 py-2 rounded"
        >
          Add New Task
        </button>
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <FaFilter />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="Current List">Current List</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <FaSort />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr>
            <th className="border border-gray-300 font-normal p-2">Task</th>
            <th className="border border-gray-300 font-normal p-2">Due Date</th>
            <th className="border border-gray-300 font-normal p-2">Collaborator</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-200 p-2 flex items-center gap-1">
              <input
                ref={newTaskInputRef}
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add new task..."
                className="w-full p-2 border border-gray-300 rounded focus:border-gray-400"
                style={{ height: '40px' }}
              />
            </td>
            <td className="border border-gray-300 p-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:border-gray-400"
                style={{ height: '40px' }}
              />
            </td>
            <td className="border border-gray-300 p-2">
              <select
                value={selectedCollaborator}
                onChange={(e) => setSelectedCollaborator(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:border-gray-400"
                style={{ height: '40px' }}
              >
                <option value="">Select collaborator</option>
                {collaborators.map((collab, index) => (
                  <option key={index} value={collab}>
                    {collab}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          {paginateTasks.map((task, index) => (
            <tr key={index} className="h-12">
              <td
                className="border border-gray-200 p-2 relative h-full break-words hover:bg-gray-100"
                onDoubleClick={() => handleTaskDoubleClick(index)}
              >
                {editingTaskIndex === index ? (
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => handleTaskEdit(e, index)}
                    onKeyDown={(e) => handleTaskEditKeyDown(e, index)}
                    onBlur={handleTaskEditBlur}
                    className="w-full p-2 border border-gray-300 rounded"
                    autoFocus
                  />
                ) : (
                  <>
                    {task.name}
                    <FaCheck
                      className="text-gray-700 bg-gray-200 rounded-full p-1 text-xl cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100"
                      onClick={() => completeTask(index)}
                    />
                  </>
                )}
              </td>

              <td className="border border-gray-200 p-2 text-center relative hover:bg-gray-100">
                {task.date ? (
                  <>
                    {new Date(task.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                    })}
                    <FaTimes
                      className="text-gray-700 bg-gray-200 rounded-full p-1 text-xl cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100"
                      onClick={() => updateDate('', index)}
                    />
                  </>
                ) : (
                  <input
                    type="date"
                    onChange={(e) => updateDate(e.target.value, index)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                )}
              </td>

              <td className="border border-gray-200 p-2 relative hover:bg-gray-100">
                {task.collaborator || (
                  <select
                    value={task.collaborator}
                    onChange={(e) => updateCollaborator(e.target.value, index)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select collaborator</option>
                    {collaborators.map((collab, idx) => (
                      <option key={idx} value={collab}>
                        {collab}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

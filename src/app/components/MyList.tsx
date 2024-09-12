import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCheck, FaTrashAlt } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const MyList = () => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
    
    const storedCompletedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
    setCompletedTasks(storedCompletedTasks);
  }, []);
  
  const addTask = () => {
    if (newTask) {
      const updatedTasks = [...tasks, { name: newTask, date: selectedDate }];
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setNewTask('');
      setSelectedDate(new Date());
    }
  };
  
  const completeTask = (taskIndex) => {
    const task = tasks[taskIndex];
    const updatedTasks = tasks.filter((_, index) => index !== taskIndex);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    const updatedCompletedTasks = [...completedTasks, task];
    setCompletedTasks(updatedCompletedTasks);
    localStorage.setItem('completedTasks', JSON.stringify(updatedCompletedTasks));
  };

  const deleteTask = (taskIndex) => {
    const updatedCompletedTasks = completedTasks.filter((_, index) => index !== taskIndex);
    setCompletedTasks(updatedCompletedTasks);
    localStorage.setItem('completedTasks', JSON.stringify(updatedCompletedTasks));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.calendar-container') === null) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex gap-4 items-stretch">
      <div className="flex-1 shadow rounded-lg p-10 overflow-hidden">
        <h3 className="text-xl font-normal mb-4">Add Task</h3>
        <div className="relative flex-1 min-h-[50px]">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            className="w-full p-2 border border-gray-300 rounded"
          />
          <FaCalendarAlt
            className="absolute right-2 top-5 transform -translate-y-1/2 text-teal-500 cursor-pointer text-sm z-0 bg-gray-400"
            onClick={() => setShowCalendar(!showCalendar)}
          />
          {showCalendar && (
            <div className="calendar-container">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="custom-calendar"
              />
            </div>
          )}
        </div>
        <table className="w-full border-collapse">
          <tbody>
            {tasks.map((task, index) => (
              <tr key={index} className="border-b">
                <td className="text-center" style={{ width: '8%' }}>
                  <FaCheck
                    className="text-green-500 cursor-pointer border border-green-500 rounded-full p-1 text-xl"
                    onClick={() => completeTask(index)}
                  />
                </td>
                <td style={{ width: '75%' }}>{task.name}</td>
                <td className="text-center" style={{ width: '17%' }}>
                  {new Date(task.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex-1 shadow rounded-lg p-10">
        <h3 className="text-xl font-normal mb-4">Completed Tasks</h3>
        <table className="w-full border-collapse">
          <tbody>
            {completedTasks.map((task, index) => (
              <tr key={index} className="border-b">
                <td style={{ width: '75%' }}>{task.name}</td>
                <td className="text-center" style={{ width: '20%' }}>
                  {new Date(task.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short'
                  })}
                </td>
                <td className="text-center" style={{ width: '5%' }}>
                  <FaTrashAlt
                    className="text-red-500 cursor-pointer border border-gray-500 rounded-full p-1 text-2xl"
                    onClick={() => deleteTask(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyList;

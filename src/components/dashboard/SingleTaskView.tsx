import React, { useState, useRef, useEffect } from 'react';
import { FaTrash, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Comments from './Comments';

interface SingleTaskViewProps {
  task?: {
    id: string;
    taskDescription: string;
    status: string;
    createdAt: string;
    dueDate?: string;
    collaborator?: string;
    summary?: string; // Add this line
  };
  isLoading: boolean;
  onClose: () => void;
  onComplete: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
  onUpdateDescription: (taskId: string, newDescription: string) => void;
  onUpdateDueDate: (taskId: string, newDueDate: string | null) => void;
  onUpdateCollaborator: (taskId: string, newCollaborator: string | null) => void;
  collaboratorOptions: { id: string; name: string }[];
  onUpdateSummary: (taskId: string, newSummary: string) => void; // Add this line
}

const SingleTaskView: React.FC<SingleTaskViewProps> = ({ task, isLoading, onClose, onComplete, onDelete, onUpdateDescription, onUpdateDueDate, onUpdateCollaborator, collaboratorOptions, onUpdateSummary }) => {

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton height={40} className="mb-4" />
        <Skeleton count={3} className="mb-2" />
        <Skeleton width={150} className="mb-4" />
        <Skeleton height={100} />
      </div>
    );
  }

  if (!task) {
    return <div className="p-4">Task not found</div>;
  }

  const [localStatus, setLocalStatus] = useState(task?.status);

  useEffect(() => {
    setLocalStatus(task?.status);
  }, [task]);

  const isCompleted = localStatus === "Completed";
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(task.taskDescription);
  const [dueDate, setDueDate] = useState<Date | null>(task.dueDate ? new Date(task.dueDate) : null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCompleteToggle = () => {
    const newStatus = localStatus === "Completed" ? "In Queue" : "Completed";
    setLocalStatus(newStatus);
    onComplete(task.id, newStatus);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleDescriptionSave = () => {
    setIsEditing(false);
    if (description !== task.taskDescription) {
      onUpdateDescription(task.id, description);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDescriptionSave();
    }
  };

  const handleDueDateChange = (date: Date | null) => {
    setDueDate(date);
    onUpdateDueDate(task.id, date ? date.toISOString() : null);
    setIsDatePickerOpen(false);
  };

  const handleRemoveDueDate = () => {
    setDueDate(null);
    onUpdateDueDate(task.id, null);
    setIsDatePickerOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };

  const [isCollaboratorPickerOpen, setIsCollaboratorPickerOpen] = useState(false);
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const collaboratorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (collaboratorPickerRef.current && !collaboratorPickerRef.current.contains(event.target as Node)) {
        setIsCollaboratorPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCollaboratorChange = (newCollaborator: string) => {
    onUpdateCollaborator(task.id, newCollaborator);
    setIsCollaboratorPickerOpen(false);
    setCollaboratorSearch('');
  };

  const handleRemoveCollaborator = () => {
    onUpdateCollaborator(task.id, null);
  };

  const filteredCollaborators = collaboratorOptions.filter(
    (c) => c.name.toLowerCase().includes(collaboratorSearch.toLowerCase())
  );

  const [summary, setSummary] = useState(task?.summary || '');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const summaryInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingSummary && summaryInputRef.current) {
      summaryInputRef.current.focus();
    }
  }, [isEditingSummary]);

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value.slice(0, 180)); // Limit to 180 characters
  };

  const handleSummarySave = () => {
    setIsEditingSummary(false);
    if (summary !== task.summary) {
      onUpdateSummary(task.id, summary);
    }
  };

  const handleSummaryKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSummarySave();
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="bg-gray-200 flex justify-between items-center p-2 rounded">
        <button
          onClick={handleCompleteToggle}
          className={`px-3 py-1 text-sm rounded-full flex items-center ${
            isCompleted
              ? "bg-green-100 text-green-700 border border-green-500"
              : "bg-gray-100 text-gray-700 border border-gray-300"
          }`}
        >
          <FaCheck className={`mr-1 ${isCompleted ? 'text-green-700' : 'text-gray-400'}`} />
          {isCompleted ? "Completed" : "Mark as Complete"}
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 border border-red-500 rounded-full px-3 py-1 flex items-center text-sm"
        >
          <FaTrash className="mr-1" />
          Delete
        </button>
      </div>
      
      <div className="mt-4">
        <input
          ref={inputRef}
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          onBlur={handleDescriptionSave}
          onKeyDown={handleKeyDown}
          onClick={() => setIsEditing(true)}
          className={`text-xl font-bold w-full bg-transparent ${
            isEditing
              ? 'border border-blue-500 rounded px-2 py-1'
              : 'border-transparent hover:border-gray-300'
          } transition-all duration-200 ease-in-out`}
          readOnly={!isEditing}
        />
      </div>
      
      <div className="mt-4 space-y-2 text-sm">
        <p className="text-gray-600 text-md"><span className='font-bold'>Task Added At:</span> {formatDate(task.createdAt)}</p>
        
        <div className="flex items-center relative">
          <span className="text-gray-600 mr-2 font-bold">Due Date:</span>
          {dueDate ? (
            <div className="inline-flex items-center bg-gray-900 rounded-full px-3 py-1 text-white text-md">
              {formatDate(dueDate.toISOString())}
              <button onClick={handleRemoveDueDate} className="ml-2 text-white hover:text-red-500">
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="text-blue-500 hover:text-blue-700"
              >
                Add Due Date
              </button>
              {isDatePickerOpen && (
                <div 
                  ref={datePickerRef} 
                  className="absolute z-10 mt-1"
                  style={{
                    transform: 'scale(0.9)',
                    transformOrigin: 'top left'
                  }}
                >
                  <DatePicker
                    selected={dueDate}
                    onChange={handleDueDateChange}
                    minDate={new Date()}
                    inline
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center relative">
          <span className="text-gray-600 mr-2 font-bold">Collaborator:</span>
          {task.collaborator ? (
            <div className="inline-flex items-center bg-gray-900 rounded-full px-3 py-1 text-white text-md">
              {task.collaborator}
              <button onClick={handleRemoveCollaborator} className="ml-2 text-white hover:text-red-500">
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsCollaboratorPickerOpen(!isCollaboratorPickerOpen)}
                className="text-blue-500 hover:text-blue-700"
              >
                Add Collaborator
              </button>
              {isCollaboratorPickerOpen && (
                <div 
                  ref={collaboratorPickerRef} 
                  className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-lg"
                  style={{ width: '200px' }} // Increased width here
                >
                  <div className="p-2">
                    <div className="flex items-center border border-gray-300 rounded">
                      <FaSearch className="ml-2 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={collaboratorSearch}
                        onChange={(e) => setCollaboratorSearch(e.target.value)}
                        placeholder="Search Collaborators..."
                        className="p-2 w-full focus:outline-none"
                      />
                    </div>
                  </div>
                  <ul className="max-h-48 overflow-y-auto">
                    {filteredCollaborators.map((collaborator) => (
                      <li
                        key={collaborator.id}
                        onClick={() => handleCollaboratorChange(collaborator.name)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {collaborator.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col pb-4">
          <span className="text-gray-600 font-bold mb-1">Task Description:</span>
          <textarea
            ref={summaryInputRef}
            value={summary}
            onChange={handleSummaryChange}
            onBlur={handleSummarySave}
            onKeyDown={handleSummaryKeyDown}
            onClick={() => setIsEditingSummary(true)}
            className={`w-full p-2 rounded border ${
              isEditingSummary
                ? 'border-blue-500'
                : 'border-gray-300 hover:border-gray-400'
            } transition-all duration-200 ease-in-out`}
            readOnly={!isEditingSummary}
            rows={2}
            maxLength={180}
            placeholder="Add a summary..."
          />
          <span className="text-xs text-gray-500 mt-1">
            {summary.length}/180 characters
          </span>
        </div>
      </div>
      {/* Comment Section */}
      <Comments taskId={task.id} /> 
    </div>
  );
};

export default SingleTaskView;
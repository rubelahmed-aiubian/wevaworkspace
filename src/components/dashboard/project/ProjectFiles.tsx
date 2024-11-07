import React, { useState, useEffect } from "react";
import { FiUpload, FiFileText, FiXCircle, FiDownload } from "react-icons/fi";
import { db } from "@/utils/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

const ProjectFiles: React.FC<ProjectFilesProps> = ({ projectNo }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // Spinner state
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();
  const [loadingFile, setLoadingFile] = useState<string | null>(null); // Track loading state for files
  const loadingSpinnerStyle = `animate-spin inline-block w-5 h-5 border-4 border-t-transparent border-indigo-600 rounded-full`;
  const deletingSpinnerStyle = `animate-spin inline-block w-5 h-5 border-4 border-t-transparent border-red-400 rounded-full`;

  // Fetch files on initial load
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const projectDoc = doc(db, "projects", projectNo);
        const docSnap = await getDoc(projectDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const fileList = (data.projectFiles || []).map((fileName) => ({
            fileName,
            path: `/files/project/${projectNo}/${fileName}`,
          }));
          setFiles(fileList);
        } else {
          console.log("Project document not found");
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [projectNo]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Only PDF or DOCX files are supported.");
      return;
    }
    setErrorMessage("");
    setIsUploading(true); // Start spinner

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectNo", projectNo);
    formData.append("userEmail", user);

    try {
      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        const projectDoc = doc(db, "projects", projectNo);
        await updateDoc(projectDoc, {
          projectFiles: arrayUnion(result.fileName),
        });

        setFiles((prevFiles) => [
          ...prevFiles,
          {
            fileName: result.fileName,
            path: result.path,
          },
        ]);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false); // Stop spinner after upload completes
    }
  };

  const handleDelete = async (fileName) => {
    console.log("Attempting to delete:", fileName); // Log the file name to be deleted
    setLoadingFile(fileName); // Set loading state for the file being deleted
    try {
      const response = await fetch(
        `/api/delete-file?projectNo=${projectNo}&fileName=${fileName}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const projectDoc = doc(db, "projects", projectNo);
        await updateDoc(projectDoc, { projectFiles: arrayRemove(fileName) });

        setFiles((prevFiles) =>
          prevFiles.filter((file) => file.fileName !== fileName)
        );
      } else {
        const errorData = await response.json();
        console.error(
          "Error deleting file:",
          errorData.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setLoadingFile(null); // Reset loading state after operation
    }
  };

  return (
    <>
      <div className="w-full mb-5">
        <label className="block text-gray-700 text-sm font-bold mb-4 col-span-4">
          Project Files
        </label>
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center py-9 w-full border border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50"
        >
          {isUploading ? (
            <div className="mb-3 flex items-center justify-center">
              <div className={loadingSpinnerStyle} />
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-center">
                <FiUpload size={40} color="#4F46E5" />
              </div>
              <h2 className="text-center text-gray-400 text-xs font-normal leading-4 mb-1">
                PDF or DOC, smaller than 15MB
              </h2>
              <input
                id="dropzone-file"
                type="file"
                onChange={handleUpload}
                className="hidden"
              />
            </>
          )}
        </label>
        {errorMessage && (
          <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
        )}
      </div>

      <div className="w-full mb-4 rounded-lg overflow-hidden bg-white shadow">
        <table className="table-auto w-full overflow-hidden">
          <tbody>
            {files?.map((file, index) => (
              <tr
                key={file.path}
                className=" hover:bg-gray-50 odd:bg-white even:bg-gray-50"
              >
                <td className="p-2 text-gray-900">
                  <div className="flex items-center gap-2">
                    <FiFileText size={20} color="#4F46E5" />
                    <span className="text-sm">{file.fileName}</span>
                  </div>
                </td>
                <td className="flex items-center justify-end gap-2 p-2 text-center text-gray-400 hover:text-indigo-600">
                  <FiDownload
                    className="cursor-pointer"
                    size={20}
                    onClick={() => window.open(file.path)}
                  />
                  {loadingFile === file.fileName ? (
                    <div className={deletingSpinnerStyle} />
                  ) : (
                    <FiXCircle
                      className="cursor-pointer text-gray-400 hover:text-red-500"
                      size={20}
                      onClick={() => handleDelete(file.fileName)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProjectFiles;

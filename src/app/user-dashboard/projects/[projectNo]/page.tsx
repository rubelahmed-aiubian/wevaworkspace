"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import Skeleton from "react-loading-skeleton"; // Importing Skeleton

export default function ProjectDetail({
  params,
}: {
  params: { projectNo: string };
}) {
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const { projectNo } = params;

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, "projects", projectNo);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such project!");
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectNo]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        Project Details (Project ID: {projectNo})
      </h1>
      <div className="rounded-lg bg-white border border-gray-200">
        {loading ? (
          // Header Skeleton
          <div className="bg-gray-100 p-4 flex justify-between items-center rounded-t-lg">
            <Skeleton height={30} width={`300px`} className="mb-2" />
            <Skeleton height={20} width={`150px`} className="mb-2" />
          </div>
        ) : (
          <div className="bg-gray-100 p-4 flex justify-between items-center rounded-t-lg">
            <h2 className="text-lg font-semibold">{project.projectName}</h2>
            <span className="text-sm text-gray-600">
              Status: {project.projectStatus}
            </span>
          </div>
        )}
        {loading ? (
          // Body Skeleton
          <div className="p-4 min-h-[200px]">
            <Skeleton height={20} width={`80%`} className="mb-2" />
            <Skeleton height={20} width={`60%`} className="mb-4" />
          </div>
        ) : (
          <div className="p-4 min-h-[200px]">
            <p className="text-gray-800">{project.description}</p>
          </div>
        )}
      </div>
      <div className="p-4 text-center">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

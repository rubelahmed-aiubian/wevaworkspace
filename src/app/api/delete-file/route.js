// src/app/api/delete-file/route.js

import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { db } from "@/utils/firebase";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const projectNo = searchParams.get("projectNo");
  const fileName = searchParams.get("fileName");

  if (!projectNo || !fileName) {
    return NextResponse.json({ error: "Project number and file name are required" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "files", "project", projectNo, fileName);

  try {
    // Delete the file from the server
    await fs.unlink(filePath);

    // Remove the filename from Firestore
    const projectDoc = doc(db, "projects", projectNo);
    await updateDoc(projectDoc, {
      projectFiles: arrayRemove(fileName),
    });

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Error deleting file" }, { status: 500 });
  }
}

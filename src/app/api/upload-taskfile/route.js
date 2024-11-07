// src/app/api/upload-taskfile/route.js

import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const taskId = formData.get("taskId");
  const userEmail = formData.get("userEmail");

  if (!file || !taskId || !userEmail) {
    return NextResponse.json(
      { error: "File, task ID, or user email missing" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${file.name}`;
  const saveDir = path.join(process.cwd(), "public", "files", "tasks", userEmail, taskId);
  const publicPath = `/files/tasks/${userEmail}/${taskId}/${fileName}`;

  try {
    await fs.mkdir(saveDir, { recursive: true });
    await fs.writeFile(path.join(saveDir, fileName), buffer);

    return NextResponse.json({ path: publicPath, fileName });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json({ error: "Error saving file" }, { status: 500 });
  }
}

// src/app/api/upload-file/route.js

import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const projectNo = formData.get("projectNo");

  if (!file || !projectNo) {
    return NextResponse.json(
      { error: "File or project number missing" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${file.name}`;
  const saveDir = path.join(process.cwd(), "public", "files", "project", projectNo);
  const publicPath = `/files/project/${projectNo}/${fileName}`;

  try {
    await fs.mkdir(saveDir, { recursive: true });
    await fs.writeFile(path.join(saveDir, fileName), buffer);

    return NextResponse.json({ path: publicPath, fileName });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json({ error: "Error saving file" }, { status: 500 });
  }
}

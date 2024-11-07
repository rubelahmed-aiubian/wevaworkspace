// src/app/api/upload-photo/route.js

import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const userEmail = formData.get("userEmail");

  if (!file || !userEmail) {
    return NextResponse.json(
      { error: "Photo or user email missing" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${file.name}`;
  const saveDir = path.join(process.cwd(), "public", "images", "users", userEmail);
  const publicPath = `/images/users/${userEmail}/${fileName}`;

  try {
    await fs.mkdir(saveDir, { recursive: true });
    await fs.writeFile(path.join(saveDir, fileName), buffer);

    return NextResponse.json({ path: publicPath, fileName });
  } catch (error) {
    console.error("Error saving photo:", error);
    return NextResponse.json({ error: "Error saving photo" }, { status: 500 });
  }
}

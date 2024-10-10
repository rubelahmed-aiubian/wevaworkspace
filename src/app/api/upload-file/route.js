import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const userEmail = formData.get('userEmail');

  if (!file || !userEmail) {
    return NextResponse.json({ error: 'No file uploaded or user email missing' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;
  const userDir = path.join(process.cwd(), 'public', 'files', userEmail);
  const filePath = path.join(userDir, fileName);

  try {
    // Ensure the user directory exists
    await fs.mkdir(userDir, { recursive: true });

    // Save the file to the local file system
    await fs.writeFile(filePath, buffer);

    const publicPath = `/files/${userEmail}/${fileName}`;
    return NextResponse.json({ path: publicPath, filename: file.name });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
  }
}
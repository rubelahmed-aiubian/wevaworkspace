import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export async function POST(request) {
  const { email, name, password, code } = await request.json();

  // Fetch email settings from Firestore
  let emailSettings;
  try {
    const docRef = doc(db, 'settings', 'email_route');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      emailSettings = docSnap.data();
    } else {
      throw new Error("Email settings not found in the database.");
    }
  } catch (error) {
    console.error("Error fetching email settings:", error);
    return NextResponse.json({ error: "Failed to fetch email settings" }, { status: 500 });
  }

  // Configure your SMTP settings with fetched data
  const transporter = nodemailer.createTransport({
    host: emailSettings.host,
    port: parseInt(emailSettings.port, 10),
    secure: true,
    auth: {
      user: emailSettings.user,
      pass: emailSettings.password,
    },
  });

  let mailOptions = {};

  // Check if we're sending a welcome email (password provided) or reset code
  if (password) {
    // Sending the welcome email with the password
    mailOptions = {
      from: `"Weva Workspace" <${emailSettings.user}>`,
      to: email,
      subject: 'Welcome to Weva Workspace',
      text: `Hi ${name},\n\nWelcome to Weva Workspace! Your account has been created successfully. Here are your login details:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password as soon as possible.
      Click here to login: https://workspace.wevaapp.com/login
      \n\nThank you!`,
    };
  } else if (code) {
    // Sending the reset code email
    mailOptions = {
      from: `"Weva Workspace" <${emailSettings.user}>`,
      to: email,
      subject: 'Password Reset Code',
      text: `Your password reset code is: ${code}`,
    };
  }

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

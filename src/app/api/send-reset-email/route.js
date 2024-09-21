// src/app/api/send-reset-email/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  const { email, code } = await request.json();

  // Configure your SMTP settings
  const transporter = nodemailer.createTransport({
    host: 'mail.wevaapp.com', // Your mail server
    port: 465, // Your SMTP port
    secure: true,
    auth: {
      user: 'rubel.ahmed@wevaapp.com', // Your email
      pass: '60637@weva', // Your email password
    },
  });

  // Email options
  const mailOptions = {
    from: 'rubel.ahmed@wevaapp.com',
    to: email,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

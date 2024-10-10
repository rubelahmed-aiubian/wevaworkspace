import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  const { email, name, password, code } = await request.json();

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

  let mailOptions = {};

  // Check if we're sending a welcome email (password provided) or reset code
  if (password) {
    // Sending the welcome email with the password
    mailOptions = {
      from: 'rubel.ahmed@wevaapp.com',
      to: email,
      subject: 'Welcome to Weva App - Your Account Details',
      text: `Hi ${name},\n\nWelcome to Weva App! Your account has been created successfully. Here are your login details:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password as soon as possible.
      Click here to login: https://wevaapp.com/login
      \n\nThank you!`,
    };
  } else if (code) {
    // Sending the reset code email
    mailOptions = {
      from: 'rubel.ahmed@wevaapp.com',
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

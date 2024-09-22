"use client";

import React from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Weva Workspace</title>
        <meta name="description" content="Connect work to goals and automate workflows with your teammates." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative flex flex-col h-screen bg-gray-800 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-80"></div>

        {/* Main Content Row */}
        <div className="flex-grow flex items-center justify-center relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-6xl p-8">
            {/* First Column (3/4 width) */}
            <div className="flex flex-col items-center w-full sm:w-3/4">
              <Image
                src="/images/logo.png" // Update with your logo path
                alt="Weva Workspace Logo"
                width={120}
                height={60}
                className="object-contain"
              />
              <h1 className="text-2xl text-white font-bold mt-4">Weva Workspace</h1>
              <p className="text-gray-400 mt-2 text-center">
                Connect work to goals and automate workflows with your teammates.
              </p>

              {/* Download Buttons */}
              <div className="flex mt-6 space-x-4">
                <Link
                  href="https://play.google.com/store/apps/details?id=com.wevaapp.app&pli=1"
                  target="_blank"
                >
                  <Image
                    src="/images/google-play.png" // Update with your Google Play image path
                    alt="Download on Google Play"
                    width={120} // Adjust the size as needed
                    height={40}
                  />
                </Link>
                <Link
                  href="https://apps.apple.com/qa/app/weva/id6472152214"
                  target="_blank"
                >
                  <Image
                    src="/images/apple-store.png" // Update with your Apple Store image path
                    alt="Download on the App Store"
                    width={120} // Adjust the size as needed
                    height={40}
                  />
                </Link>
              </div>

              {/* Copyright (hidden on mobile) */}
              <div className="hidden sm:block mt-4 text-center text-gray-600 text-sm">
                <p>
                  &copy; 2024{" "}
                  <Link
                    href="https://wevaapp.com"
                    className="text-gray-300 hover:text-gray-800"
                  >
                    Weva Trading And Services LLC
                  </Link>
                </p>
              </div>
            </div>

            {/* Vertical Line (only visible on larger screens) */}
            <div className="hidden sm:block w-px bg-gray-400 mx-4 h-60"></div>

            {/* Second Column (1/4 width, Mid-aligned button) */}
            <div className="flex-grow flex items-center justify-center sm:w-1/4 mt-8 sm:mt-0">
              <Link
                href="/login"
                className="border border-gray-300 text-white text-lg font-semibold py-3 px-6 rounded-full shadow-lg bg-transparent hover:bg-gray-950 hover:text-white transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Fixed Copyright Row (visible only in mobile view) */}
        <div className="flex justify-center items-center text-center text-gray-600 text-sm mt-4 sm:hidden fixed bottom-0 w-full mb-8">
          <p>
            &copy; 2024{" "}
            <Link
              href="https://wevaapp.com"
              className="text-gray-300 hover:text-gray-800"
            >
              Weva Trading And Services LLC
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

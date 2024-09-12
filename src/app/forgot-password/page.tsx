import Link from 'next/link';
export default function ForgotPassword() {
  return (
    <div className="flex items-center justify-center bg-gray-800 w-full h-screen px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg sm:w-1/3">
        <h1 className="text-1xl font-bold mb-4 text-center">Forgot Password</h1>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          className="w-full text-sm p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="w-full bg-teal-500 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors duration-300"
        >
          Reset Password
        </button>
        <div className="mt-4 text-center">
          <Link href="/" className="text-teal-500 hover:text-gray-800">
            Go Back To Login
          </Link>
        </div>
      </div>
    </div>
  );
}

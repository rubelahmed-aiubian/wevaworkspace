import Image from 'next/image';
import Link from 'next/link';

const LoginForm = () => {
  return (
    <div className="flex items-center justify-center bg-gray-800 w-full h-screen">
      <div className="bg-white p-6 pt-16 rounded-lg shadow-lg sm:w-1/4 relative">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="bg-white p-6 rounded-full shadow-md">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <div className="font-semibold text-center text-gray-700 mt-6">Weva Workspace</div>
        </div>

        <div className="mt-20">
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter email..."
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter password..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-teal-500 text-white p-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors duration-300"
        >
          Sign In
        </button>
        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-teal-500 hover:text-gray-800">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

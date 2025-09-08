import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <p className="text-sm mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} Abdul. All rights reserved.
        </p>

        <div className="flex space-x-6">
          <a
            href="https://github.com/hannanghumsani"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-300"
          >
            <FaGithub size={24} />
          </a>

          <a
            href="https://linkedin.com/in/abdul-hannan-a34a4922a"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-300"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}

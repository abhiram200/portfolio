import { Github, Linkedin, FileDown, FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-primary text-gray-400 py-10 text-center text-sm">
      <p className="mb-6 text-base">&copy; 2025 Abhiram RS</p>
      <div className="flex justify-center items-center gap-8 text-gray-400">
        <a
          href="https://www.linkedin.com/in/abhiram-rs-183634300"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition duration-200"
          title="LinkedIn"
        >
          <Linkedin size={28} />
        </a>

        <a
          href="https://github.com/abhiram200"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition duration-200"
          title="GitHub"
        >
          <Github size={28} />
        </a>

        <a
          href="/portfolio/Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition duration-200"
          title="View Résumé"
        >
          <FileDown size={28} />
        </a>

        <a
          href="https://ijirt.org/publishedpaper/IJIRT180560_PAPER.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition duration-200"
          title="View Research Paper"
        >
          <FileText size={28} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;

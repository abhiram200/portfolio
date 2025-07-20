import * as Tooltip from "@radix-ui/react-tooltip";
import { Github, Linkedin, FileDown, FileText } from "lucide-react";

const IconTooltip = ({ label, children }) => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-gray-800 text-white px-2 py-1 rounded-md text-xs shadow-md"
          side="top"
          sideOffset={6}
        >
          {label}
          <Tooltip.Arrow className="fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

const Footer = () => {
  return (
    <footer className="w-full bg-primary text-gray-400 py-10 text-center text-sm">
      <p className="mb-6 text-base">&copy; 2025 Abhiram RS</p>
      <div className="flex justify-center items-center gap-8 text-gray-400">
        <IconTooltip label="LinkedIn">
          <a
            href="https://www.linkedin.com/in/abhiram-rs-183634300"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition duration-200"
          >
            <Linkedin size={28} />
          </a>
        </IconTooltip>

        <IconTooltip label="GitHub">
          <a
            href="https://github.com/abhiram200"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition duration-200"
          >
            <Github size={28} />
          </a>
        </IconTooltip>

        <IconTooltip label="View Résumé">
          <a
            href="/portfolio/Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition duration-200"
          >
            <FileDown size={28} />
          </a>
        </IconTooltip>

        <IconTooltip label="View Research Paper">
          <a
            href="https://ijirt.org/publishedpaper/IJIRT180560_PAPER.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition duration-200"
          >
            <FileText size={28} />
          </a>
        </IconTooltip>
      </div>
    </footer>
  );
};

export default Footer;

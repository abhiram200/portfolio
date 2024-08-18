import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  html,
  css,
  nodejs,
  mongodb,
  git,
  bendra,
  tedxriet,
  perusal,
  proj1,
  proj2,
  proj3,
  python,
  cprog,
  java,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "work",
    title: "Work",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "Web Developer",
    icon: web,
  },
  {
    title: "Android Developer",
    icon: mobile,
  },
  {
    title: "Backend Developer",
    icon: backend,
  },
  {
    title: "Wordpress Web Developer",
    icon: creator,
  },
];

const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "git",
    icon: git,
  },
  {
    name: "Python",
    icon: python,
  },
  {
    name: "C Programming",
    icon: cprog,
  },
  {
    name: "Java",
    icon: java,
  },
];

const experiences = [
  {
    title: "Web Developer Intern",
    company_name: "Bendra Aerospace Pvt. Ltd.",
    icon: bendra,
    iconBg: "#d9d9d9",
    date: "May 2022 - May 2022",
    points: [
      "Explored new technologies and approaches to streamline processes.",
      "Used content creation tools and digital media to design web sites.",
      "Wrote custom HTML, CSS, and Javascript for existing website.",
      "Conceived and built optimized landing pages in HTML and CSS for integration and cross-browser compatibility.",
    ],
  },
  {
    title: "Web Developer",
    company_name: "TEDxRIET",
    icon: tedxriet,
    iconBg: "#262626",
    date: "Sep 2023 - Sep 2023",
    points: [
      "Researched emerging web technologies and trends for possible incorporation into sites.",
      "Coded using HTML, CSS, and JavaScript to develop features for both mobile and desktop platforms.",
      "Produced websites compatible with multiple browsers.",
    ],
  },
  {
    title: "Full-Stack Web Developer",
    company_name: "Perusal Gulf",
    icon: perusal,
    iconBg: "#cceeff",
    date: "Jan 2022 - Jan 2023",
    points: [
      "Coded website using HTML, CSS, JavaScript as front-end and Node.js, MongoDB as back-end.",
      "Planned website development, converting mockups into usable web presence with HTML and JavaScript coding.",
      "Developed user-friendly web forms with validation and error handling.",
      "Conducted unit testing to deliver optimal browser functionality.",
    ],
  },
];

const projects = [
  {
    name: "Facial Recognition System Using Python",
    description:
      "Terminal-based system that allows users to detect already registered faces using the OpenCV library in Python.",
    tags: [
      {
        name: "Python",
        color: "blue-text-gradient",
      },
      {
        name: "OpenCV",
        color: "green-text-gradient",
      },
    ],
    image: proj1,
    source_code_link: "https://github.com/abhiram200/Face-Recognition-And-Registration",
  },
  {
    name: "A Basic Chess-Engine",
    description:
      "A Basic chess playing bot that can be used to generate pgn files (could be later used to train ai bots), It also includes self-play and VS Stockfish mode for generating pgn files.",
    tags: [
      {
        name: "Python",
        color: "blue-text-gradient",
      },
      {
        name: "python-chess",
        color: "green-text-gradient",
      },
      {
        name: "Stockfish",
        color: "pink-text-gradient",
      },
    ],
    image: proj2,
    source_code_link: "https://github.com/abhiram200/chessai",
  },
  {
    name: "A Basic Chatbot",
    description:
      "It's a simple and most basic chatbot that relies on a json file for it's dataset. You can download the bot customize the dataset and use it for your own tasks.",
    tags: [
      {
        name: "python",
        color: "blue-text-gradient",
      },
      {
        name: "chatbot",
        color: "green-text-gradient",
      },
    ],
    image: proj3,
    source_code_link: "https://github.com/abhiram200/Mahabharath-ChatBot",
  },
];

export { services, technologies, experiences, projects };

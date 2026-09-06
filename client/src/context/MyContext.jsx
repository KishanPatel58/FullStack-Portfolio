import { createContext, useContext } from "react"
import { RiGithubLine, RiLinkedinBoxLine } from "@remixicon/react"
import { aiwebsitebuilder, css, django, express, flask, git, github, google, html, js, ljlogo, microsoft, mongodb, myresume, myresumepdf, next, node, openrouter, postgresql, react, socialmediaautomation, tailwind, vscode, zernio } from "../assets/assets.js"

const MyContext = createContext();
export const MyContextProvider = ({ children }) => {

    const Skills = [
        {
            category: "Frontend",
            skills: [
                { name: "HTML", icon: html, percentage: "70" },
                { name: "CSS", icon: css, percentage: "60" },
                { name: "JS", icon: js, percentage: "60" },
                { name: "TailwindCSS", icon: tailwind, percentage: "65" },
                { name: "React", icon: react, percentage: "75" }
            ]
        },
        {
            category: "Backend",
            skills: [
                { name: "Node", icon: node, percentage: "55" },
                { name: "Express", icon: express, percentage: "65" }
            ]
        },
        {
            category: "Database",
            skills: [
                { name: "MongoDB", icon: mongodb, percentage: "55" },
                { name: "PostgreSql", icon: postgresql, percentage: "45" }
            ]
        },
        {
            category: "Tools",
            skills: [
                { name: "Git", icon: git, percentage: "60" },
                { name: "Github", icon: github, percentage: "75" },
                { name: "VsCode", icon: vscode, percentage: "80" }
            ]
        },
        {
            category: "Framework",
            skills: [
                { name: "Next.js", icon: next, percentage: "40" },
                { name: "Django", icon: django, percentage: "60" },
                { name: "flask", icon: flask, percentage: "55" }
            ]
        }
    ]

    const Experience = [
        {
            company: "Michrosoft",
            currentlyWorking: true,
            joiningDate: "10-11-2025",
            lastDate: "",
            designation: "Software Engineer",
            work: "offers an opportunity to learn, innovate, and work on technology that impacts people around the world. Microsoft promotes a growth mindset, collaboration, continuous learning, diversity, and innovation. Employees can work with talented teams, solve real-world problems, develop new skills, and contribute to meaningful products and services. It provides an environment where individuals are encouraged to grow both professionally and personally.",
            logo: microsoft
        },
        {
            company: "Google",
            currentlyWorking: false,
            joiningDate: "10-11-2023",
            lastDate: "7-11-2025",
            designation: "Full Stack Engineer",
            work: "offers an opportunity to learn, innovate, and work on technology that impacts people around the world. Google promotes a growth mindset, collaboration, continuous learning, diversity, and innovation. Employees can work with talented teams, solve real-world problems, develop new skills, and contribute to meaningful products and services. It provides an environment where individuals are encouraged to grow both professionally and personally.",
            logo: google
        },

    ]

    const Projects = [
        {
            _id: "2kj3h423kj4h23kj4h23kj4h",
            name: "Social-Media Automation",
            shortdesc: "This is the platform in which you can connect your social media platform like linkedin and instagram and you can post anything on your connected social media platforms.",
            desc: "Social Media Automation is a full-stack web application designed to simplify and automate the process of creating, scheduling, managing, and publishing content across multiple social media platforms from one centralized dashboard. The main goal of the project is to help users manage their social media presence efficiently without manually creating and publishing the same content separately on every platform.The platform provides a modern and user-friendly interface where users can create posts, attach single or multiple media files, choose the target social media platforms, and schedule the content for a specific date and time. Once the scheduled time is reached, the system automatically processes and publishes the post through connected social media accounts.",
            coreFeatures: [
                {
                    title: "🔐 Secure User Authentication",
                    description: [
                        {
                            desc: "Users can register, log in, maintain authenticated sessions, and securely access only their own social media accounts, posts, and activity. Authentication is handled using secure HTTP-only cookies, helping protect authentication tokens from direct JavaScript access.",
                            points: []
                        },
                        {
                            desc: "The system also supports protected routes on both the frontend and backend, ensuring that unauthorized users cannot access private dashboard functionality or user-specific data.",
                            points: []
                        }
                    ]
                },
                {
                    title: "📱 Social Media Account Integration",
                    description: [
                        {
                            desc: "Users can connect their social media accounts to the platform and manage them from a centralized dashboard.",
                            points: []
                        },
                        {
                            desc: "The platform is designed to work with multiple platforms, including:",
                            points: [
                                "Instagram",
                                "Instagram Business accounts",
                                "LinkedIn"
                            ]
                        },
                        {
                            desc: "After connecting an account, the platform stores the required account information and connection status. Only connected and authorized accounts are used when publishing scheduled posts.",
                            points: []
                        },
                        {
                            desc: "The system is designed around the idea that a user can start with a normal social media account and connect or upgrade the account when required by the publishing platform's API requirements.",
                            points: []
                        }
                    ]
                },
                {
                    title: "✍️ Create and Schedule Posts",
                    description: [
                        {
                            desc: "Users can create social media posts by providing:",
                            points: [
                                "Post content or caption",
                                "One or multiple media files",
                                "Images",
                                "Videos",
                                "Selected social media platforms",
                                "Scheduled publishing date and time"
                            ]
                        }
                    ]
                }
            ],
            image: socialmediaautomation,
            techStack: [
                { name: "MongoDB", icon: mongodb },
                { name: "Express", icon: express },
                { name: "React", icon: react },
                { name: "Node", icon: node },
                { name: "TailwindCss", icon: tailwind },
                { name: "zernio", icon: zernio }
            ],
            githubLink: "#",
            publicLink: "#"
        },
        {
            _id: "3kj4h356ghg465jhg4jhg42jgf",
            name: "AI Website Builder",
            shortdesc: "This is the platform in which user can generate landing page according their choice.",
            desc: "AI Website Builder is a full-stack, AI-powered web application that allows users to generate complete React websites simply by describing what they want in natural language.Instead of manually creating every component, CSS file, and page structure, the user can enter a prompt such as:\n “Create a modern and polished portfolio website for a web developer.”\n The system then uses AI to analyze the request, plan the website structure, generate multiple source files, validate the generated code, store the project in the database, and display the working result inside an interactive code editor and live preview.The project is designed to demonstrate a more advanced use of AI than simple text generation. The AI does not generate one large HTML file; instead, it follows a multi-stage software generation workflow.",
            coreFeatures: [
                {
                    title: "🔐 Secure User Authentication",
                    description: [
                        {
                            desc: "Users can register, log in, maintain authenticated sessions, and securely access only their own projects. Authentication ensures that each user's generated websites, files, and project data remain isolated from other users.",
                            points: []
                        },
                        {
                            desc: "The system supports protected routes and session checking, preventing unauthorized users from accessing the AI builder dashboard or project management features.",
                            points: []
                        }
                    ]
                },

                {
                    title: "🤖 AI-Powered Website Generation",
                    description: [
                        {
                            desc: "Users can generate complete React websites by simply describing their requirements in natural language.",
                            points: []
                        },
                        {
                            desc: "For example, a user can enter a prompt such as: \"Create a modern and polished portfolio website for a web developer.\" The AI analyzes the request and transforms it into a structured, functional website project.",
                            points: []
                        }
                    ]
                },
                {
                    title: "🧠 Intelligent Project Planning",
                    description: [
                        {
                            desc: "Before generating code, the AI first creates a structured project plan containing the required files, their paths, purposes, imports, and exports.",
                            points: []
                        },
                        {
                            desc: "Instead of generating the entire website as one large file, the system divides the project into organized components such as:",
                            points: [
                                "/App.js",
                                "/styles.css",
                                "Header Component",
                                "Hero Section",
                                "About Section",
                                "Skills Section",
                                "Projects Section",
                                "Contact Page",
                                "Footer Component"
                            ]
                        },
                        {
                            desc: "This structured planning approach produces more maintainable and modular React applications.",
                            points: []
                        }
                    ]
                },
                {
                    title: "⚡Parallel AI File Generation",
                    description: [
                        {
                            desc: "After creating the project plan, the system generates multiple files simultaneously instead of generating every component one by one.",
                            points: []
                        },
                        {
                            desc: "A controlled concurrency system manages how many AI generation requests can run at the same time, improving overall generation speed while avoiding unnecessary overload on the AI provider.",
                            points: []
                        }
                    ]
                },

                {
                    title: "🔄 Automatic Retry for Failed Files",
                    description: [
                        {
                            desc: "AI responses can occasionally fail or return invalid structured output. The system automatically detects failed file generations and retries only those specific files.",
                            points: []
                        },
                        {
                            desc: "Successfully generated files are preserved, so the entire project does not need to be regenerated when only one or two files fail.",
                            points: []
                        }
                    ]
                },

                {
                    title: "🛠️ Code Validation and Auto-Fixing",
                    description: [
                        {
                            desc: "Generated AI code passes through a processing pipeline before being saved to the project.",
                            points: []
                        },
                        {
                            desc: "The system normalizes generated content, checks for empty or invalid output, validates generated code, and applies automatic corrections where possible.",
                            points: []
                        },
                        {
                            desc: "This additional validation layer helps improve the reliability of AI-generated React applications.",
                            points: []
                        }
                    ]
                },

                {
                    title: "📐 Structured AI Output with Schemas",
                    description: [
                        {
                            desc: "The AI is guided to return structured data instead of uncontrolled text responses.",
                            points: []
                        },
                        {
                            desc: "The system uses schemas for project planning, file generation, and project revisions, helping ensure that generated data follows an expected format.",
                            points: []
                        },
                        {
                            desc: "This makes it easier to identify file paths, extract code, validate responses, and safely process AI-generated operations.",
                            points: []
                        }
                    ]
                },

                {
                    title: "💬 AI-Powered Website Revision",
                    description: [
                        {
                            desc: "After a website is generated, users can continue modifying it through natural language instructions.",
                            points: []
                        },
                        {
                            desc: "Users can request changes such as:",
                            points: [
                                "Make the hero section more modern",
                                "Add a dark mode toggle",
                                "Change the layout",
                                "Add a new section",
                                "Modify existing components"
                            ]
                        },
                        {
                            desc: "The AI analyzes the existing project and performs structured create, update, or delete operations instead of regenerating the entire website.",
                            points: []
                        }
                    ]
                },

                {
                    title: "📁 Intelligent Project Context Management",
                    description: [
                        {
                            desc: "During AI revisions, the system provides the AI with information about the current project structure and relevant file contents.",
                            points: []
                        },
                        {
                            desc: "A project manifest containing details such as file paths, hashes, and sizes helps the system represent the current project without unnecessarily sending every file to the AI.",
                            points: []
                        }
                    ]
                },

                {
                    title: "💻 Interactive Code Editor",
                    description: [
                        {
                            desc: "Users can view and manually edit the AI-generated project files directly inside the platform.",
                            points: []
                        },
                        {
                            desc: "The integrated development environment provides features such as file navigation, syntax highlighting, line numbers, inline errors, and an organized coding workspace.",
                            points: []
                        }
                    ]
                },

                {
                    title: "🔴 Live Website Preview",
                    description: [
                        {
                            desc: "Generated React websites can run directly inside the application, allowing users to instantly see the result of the AI-generated code.",
                            points: []
                        },
                        {
                            desc: "Users can switch between editing the source code and viewing the live website preview without downloading the project or manually running it on their computer.",
                            points: []
                        }
                    ]
                },

                {
                    title: "💾 Automatic Code Saving",
                    description: [
                        {
                            desc: "When users modify code inside the editor, their changes are automatically synchronized with the backend and saved to the project.",
                            points: []
                        },
                        {
                            desc: "A debounce mechanism prevents unnecessary API requests for every keystroke, improving performance while still keeping project files updated.",
                            points: []
                        }
                    ]
                },

                {
                    title: "📦 Automatic Dependency Detection",
                    description: [
                        {
                            desc: "The system analyzes imports used inside generated project files and detects required external dependencies.",
                            points: []
                        },
                        {
                            desc: "Detected dependencies can then be provided to the live preview environment, helping AI-generated React projects run correctly without manually configuring every package.",
                            points: []
                        }
                    ]
                },
                {
                    title: "⏳ Background AI Generation with Progress Tracking",
                    description: [
                        {
                            desc: "Website generation runs as a background process so the application does not need to wait for every AI request before responding to the user.",
                            points: []
                        },
                        {
                            desc: "The system tracks project states such as:",
                            points: [
                                "Pending",
                                "Revising",
                                "Generating",
                                "Completed or Failed"
                            ]
                        },
                        {
                            desc: "File-level progress can also be tracked, allowing the frontend to monitor the generation process while the AI creates the project.",
                            points: []
                        }
                    ]
                },

                {
                    title: "📂 Project Management and Versioning",
                    description: [
                        {
                            desc: "Users can create, access, manage, update, and delete multiple AI-generated website projects from a centralized dashboard.",
                            points: []
                        },
                        {
                            desc: "Each project stores information such as the original prompt, generated files, project description, status, and version-related data.",
                            points: []
                        }
                    ]
                }
            ],
            image: aiwebsitebuilder,
            techStack: [
                { name: "MongoDB", icon: mongodb },
                { name: "Express", icon: express },
                { name: "React", icon: react },
                { name: "Node", icon: node },
                { name: "TailwindCss", icon: tailwind },
                { name: "openrouter", icon: openrouter }
            ],
            githubLink: "#",
            publicLink: "#"
        }
    ]

    const Education = [
        {
            schoolOrCollege: "LJ University",
            address: "Ahmedabad, Gujarat",
            std: "present",
            grade: "6.5 CGPA",
            description: "i'm currently persuing Information & Technology @LJUniversity. and i just cleared 2nd year from this college.",
            logo: ljlogo,
            year: "2026",
            active: true
        },
        {
            schoolOrCollege: "Nilkanth Vidhyalay",
            address: "Limbdi, Surendranagar(Gujarat)",
            std: "12th",
            grade: "81.24%",
            description: "i was cleared 12th std in gujarati medium from @Nilkanth Vidhyalay, at Limbdi, Surendranagar, Gujarat.",
            logo: "",
            year: "2024",
            active: false
        },
        {
            schoolOrCollege: "Nilkanth Vidhyalay",
            address: "Limbdi, Surendranagar(Gujarat)",
            std: "10th",
            grade: "88.66%",
            description: "i was cleared 10th std in gujarati medium from @Nilkanth Vidhyalay, at Limbdi, Surendranagar, Gujarat.",
            logo: "",
            year: "2022",
            active: false
        }
    ]

    const Achievements = [
        {
            name: "odoo hackathon 2026",
            description: "in this hackathon we get task to build fullstack platform which can manage future trip plan. in this project we use PERN Stack to implement this thing.",
            certificate: ""
        }
    ]

    const Profile = {
        me: {
            _id: "4lk2342l3kj4kl34j",
            name: "Kishan Patel",
            email: "patelkishan3101@gmail.com",
            description: "Tech Enthuciest at L.J.University. i just complete 2nd year at this college and i want to deep die into tech world. i want to get knowledge about sarrounding technologies.",
            address: "Ahmedabad, Gujarat",
            mobileNo: "+91 8306333444",
            socialProfiles: [
                { name: "Linkedin", to: "#", icon: <RiLinkedinBoxLine size={45} color="rgba(255,255,255,1)" /> },
                { name: "Github", to: "#", icon: <RiGithubLine size={45} strokeWidth="2px" color="rgba(255,255,255,1)" /> }
            ],
            hobbies: ["Traveling", "Drawing", "Coding"],
            about: "I am Kishan, a student who is curious, creative, and always interested in learning new things. I enjoy exploring technology and understanding how things actually work instead of simply using them without knowing what happens behind the scenes. One of my biggest interests is programming and web development.",
            myImg: "/me.png",
            myResume: myresume,
            myResumePdf: myresumepdf
        }
    }

    return (
        <MyContext.Provider value={{ Skills, Experience, Projects, Education, Achievements, Profile }}>
            {children}
        </MyContext.Provider>
    )
}

export const UseMyContext = () => {
    if (!MyContext) return;
    const context = useContext(MyContext);
    return context;
}
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../database/db.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

const DEMO_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
];

const sampleInstructors = [
  {
    name: "Dr. Sarah Chen",
    email: "sarah.chen@skillstack.edu",
    password: "Password@123",
    role: "instructor",
    isVerified: true,
    photoURL: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Alex Rivera",
    email: "alex.rivera@skillstack.edu",
    password: "Password@123",
    role: "instructor",
    isVerified: true,
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Marcus Vance",
    email: "marcus.vance@skillstack.edu",
    password: "Password@123",
    role: "instructor",
    isVerified: true,
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  },
];

const coursesData = [
  // ==========================================
  // A. WEB DEVELOPMENT (4 courses)
  // ==========================================
  {
    courseTitle: "Full-Stack Web Development with MERN",
    subTitle: "Build Production-Ready Full Stack Web Applications with MongoDB, Express, React & Node.js",
    category: "Web Development",
    courseLevel: "Medium",
    coursePrice: 1499,
    courseThumbnail: "/images/courses/mern-full-stack.jpg",
    isPublished: true,
    instructorEmail: "sarah.chen@skillstack.edu",
    description: `
      <h3>Master Full-Stack Engineering from Foundations to Deployment</h3>
      <p>This comprehensive bootcamp takes you through the complete engineering lifecycle of modern web applications using MongoDB, Express.js, React, and Node.js. You will transition from basic syntax to architecting enterprise-grade full-stack systems.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Modern JavaScript (ES6+), asynchronous programming, and event loops</li>
        <li>Component-driven frontend design, custom hooks, and state management in React</li>
        <li>RESTful API design, middleware pipelines, and controller architecture in Express</li>
        <li>MongoDB document modeling, schema validation, indexing, and aggregation pipelines</li>
        <li>Secure authentication using JWTs, HTTP-only cookies, and bcrypt hashing</li>
        <li>Payment gateway integration with Stripe checkout sessions and webhooks</li>
        <li>Production build optimization, Docker containerization, and cloud deployment</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic understanding of HTML, CSS, and elementary JavaScript syntax. Prior backend experience is not required.</p>
      <h4>Intended Audience:</h4>
      <p>Aspiring full-stack developers, frontend engineers transitioning to backend, and computer science students building industry-grade portfolios.</p>
    `,
    lectures: [
      { title: "Introduction to Full-Stack Architecture & MERN Stack Overview", isPreviewFree: true },
      { title: "Node.js Fundamentals, Event Loop & Module Systems", isPreviewFree: true },
      { title: "Building Modular REST APIs with Express.js & Middleware", isPreviewFree: false },
      { title: "MongoDB Schemas, Mongoose ODM & Data Modeling", isPreviewFree: false },
      { title: "User Authentication with JWT & HTTP-Only Secure Cookies", isPreviewFree: false },
      { title: "React Component Hierarchy, Props, State & Hooks", isPreviewFree: false },
      { title: "Global State Management with Redux Toolkit & RTK Query", isPreviewFree: false },
      { title: "Connecting Frontend to Backend & Error Boundary Handling", isPreviewFree: false },
      { title: "Payment Processing with Stripe & Webhook Verification", isPreviewFree: false },
      { title: "Production Deployment, CI/CD & Performance Optimization", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Modern Frontend Development with React",
    subTitle: "Master React 19, Components, Hooks, State Management, and Tailwind CSS from the Ground Up",
    category: "Web Development",
    courseLevel: "Beginner",
    coursePrice: 999,
    courseThumbnail: "/images/courses/react-frontend.jpg",
    isPublished: true,
    instructorEmail: "alex.rivera@skillstack.edu",
    description: `
      <h3>Build Blazing Fast, Interactive User Interfaces</h3>
      <p>Step into the modern React ecosystem. Learn declarative UI composition, the React reconciliation engine, custom hooks, Tailwind CSS design patterns, and client-side routing to build sleek, production-ready single-page web applications.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>JSX syntax, Virtual DOM diffing, and component lifecycle paradigms</li>
        <li>React Hooks: useState, useEffect, useMemo, useCallback, and useRef</li>
        <li>Composing custom reusable hooks for asynchronous data fetching</li>
        <li>Responsive styling with Tailwind CSS, typography, and dark mode theming</li>
        <li>Client-side routing with React Router v6, protected routes, and loaders</li>
        <li>Optimizing web vitals: memoization, code-splitting, and lazy loading</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Familiarity with HTML, CSS, and basic JavaScript variables and functions.</p>
      <h4>Intended Audience:</h4>
      <p>Beginners entering modern web development and junior developers looking to modernize their React skillset.</p>
    `,
    lectures: [
      { title: "Welcome to React: Paradigm Shift & Development Environment Setup", isPreviewFree: true },
      { title: "JSX Deep Dive, Component Anatomy & Props Destructuring", isPreviewFree: true },
      { title: "Managing State with useState & Complex Object Handling", isPreviewFree: false },
      { title: "Lifecycle & Side Effects with useEffect", isPreviewFree: false },
      { title: "Modern Styling with Tailwind CSS & Responsive Layouts", isPreviewFree: false },
      { title: "Building Custom Hooks for Clean Reusable Code", isPreviewFree: false },
      { title: "Navigation & Dynamic Routing with React Router", isPreviewFree: false },
      { title: "Performance Profiling, React.memo & Lazy Loading", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Backend Development with Node.js and Express",
    subTitle: "Architect High-Performance REST APIs, JWT Authentication, Microservices & Database Pipelines",
    category: "Web Development",
    courseLevel: "Advance",
    coursePrice: 1299,
    courseThumbnail: "/images/courses/nodejs-backend.jpg",
    isPublished: true,
    instructorEmail: "sarah.chen@skillstack.edu",
    description: `
      <h3>Engineering Robust, Scalable Server-Side Architectures</h3>
      <p>Take your backend skills to senior level. Dive into Node.js runtime internals, asynchronous non-blocking I/O, Express middleware architectures, token-based authentication security, database connection pooling, and microservices design patterns.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>V8 engine mechanics, libuv, event loops, and worker threads</li>
        <li>Architecting scalable RESTful microservices with Express and TypeScript</li>
        <li>Rate limiting, CORS policies, helmet security headers, and CSRF protection</li>
        <li>Database indexing, connection pooling, and query performance tuning</li>
        <li>Handling streaming data and file uploads with Multer and Cloudinary</li>
        <li>Structured logging, error tracking, and automated unit/integration testing</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Solid grasp of JavaScript fundamentals and basic HTTP protocol concepts.</p>
      <h4>Intended Audience:</h4>
      <p>Frontend developers expanding into backend systems and software engineers building mission-critical APIs.</p>
    `,
    lectures: [
      { title: "Node.js Internals: Architecture, Event Loop & Thread Pool", isPreviewFree: true },
      { title: "Designing Resilient REST APIs with Express & Layered Architecture", isPreviewFree: true },
      { title: "Advanced Middleware: Validation, Sanitization & Error Handling", isPreviewFree: false },
      { title: "Stateless Authentication: Access Tokens, Refresh Tokens & Blacklisting", isPreviewFree: false },
      { title: "High-Throughput File Streaming & Cloud Storage Integration", isPreviewFree: false },
      { title: "Security Hardening: Rate Limiting, CORS & OWASP Defense", isPreviewFree: false },
      { title: "Database Optimization, Indexes & Aggregation Performance", isPreviewFree: false },
      { title: "Automated API Testing with Jest & Supertest", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Responsive Web Design with HTML, CSS, and JavaScript",
    subTitle: "Create Pixel-Perfect, Mobile-First Modern Web Layouts with Semantic HTML5, Flexbox & Grid",
    category: "Web Development",
    courseLevel: "Beginner",
    coursePrice: 0,
    courseThumbnail: "/images/courses/responsive-web-design.jpg",
    isPublished: true,
    instructorEmail: "alex.rivera@skillstack.edu",
    description: `
      <h3>Craft Beautiful Websites That Look Flawless on Any Screen</h3>
      <p>Master the foundational building blocks of the modern web. Learn semantic HTML5 markup, advanced CSS layout engines including Flexbox and CSS Grid, responsive media queries, interactive DOM manipulation with vanilla JavaScript, and web accessibility standards.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Semantic HTML5 tags for optimal SEO and screen-reader accessibility</li>
        <li>CSS Box Model, specificity, modern resets, and CSS custom properties</li>
        <li>Mastering CSS Flexbox for 1-dimensional component alignment</li>
        <li>Mastering CSS Grid for 2-dimensional macro page layout architecture</li>
        <li>Fluid typography, viewport units, and mobile-first media query breakpoints</li>
        <li>Interactive UI components with vanilla JavaScript DOM manipulation</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>No prior coding experience required. All tools are free and accessible.</p>
      <h4>Intended Audience:</h4>
      <p>Beginners, graphic designers transitioning to web design, and anyone wanting to code their own websites from scratch.</p>
    `,
    lectures: [
      { title: "The Web Ecosystem & Semantic HTML5 Foundations", isPreviewFree: true },
      { title: "CSS Fundamentals: Selectors, Specificity & Box Model", isPreviewFree: true },
      { title: "Flexbox Mastery: Aligning Content with Precision", isPreviewFree: false },
      { title: "CSS Grid Architecture: Complex Responsive Layouts", isPreviewFree: false },
      { title: "Mobile-First Design Principles & Fluid Media Queries", isPreviewFree: false },
      { title: "Web Typography, Colors & CSS Custom Properties", isPreviewFree: false },
      { title: "Interactive DOM Manipulation with Modern JavaScript", isPreviewFree: false },
      { title: "Final Project: Building a Multi-Page Responsive Portfolio", isPreviewFree: false },
    ],
  },

  // ==========================================
  // B. PROGRAMMING & SOFTWARE DEVELOPMENT (4 courses)
  // ==========================================
  {
    courseTitle: "Java Programming: Beginner to Advanced",
    subTitle: "Comprehensive Core Java, Collections, Multithreading, Streams, and Modern Enterprise Practices",
    category: "Programming & Software Development",
    courseLevel: "Beginner",
    coursePrice: 999,
    courseThumbnail: "/images/courses/java-programming.jpg",
    isPublished: true,
    instructorEmail: "marcus.vance@skillstack.edu",
    description: `
      <h3>Build a Solid Foundation in Enterprise Java Engineering</h3>
      <p>Java powers billions of enterprise devices and backend services worldwide. This masterclass covers the language from fundamental syntax and object-oriented principles to advanced concepts like lambda expressions, Streams API, multithreading, and memory management.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Java Virtual Machine (JVM), bytecode compilation, and memory architecture</li>
        <li>Object-Oriented Programming: Encapsulation, Inheritance, Polymorphism, Abstraction</li>
        <li>Java Collections Framework: Lists, Sets, Maps, and Big-O trade-offs</li>
        <li>Exception handling, custom exceptions, and resource management with try-with-resources</li>
        <li>Functional programming in Java with Lambdas, Method References & Streams API</li>
        <li>Concurrent programming: Threads, Executors, Synchronization, and Thread Safety</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic logical reasoning. No previous programming experience required.</p>
      <h4>Intended Audience:</h4>
      <p>Students preparing for software engineering roles and developers learning Java for backend systems.</p>
    `,
    lectures: [
      { title: "Introduction to Java, JDK, JVM & Setting Up IntelliJ", isPreviewFree: true },
      { title: "Variables, Primitive Types, Control Flow & Methods", isPreviewFree: true },
      { title: "Object-Oriented Core: Classes, Objects & Constructors", isPreviewFree: false },
      { title: "Inheritance, Interfaces & Abstract Classes", isPreviewFree: false },
      { title: "The Java Collections Framework in Depth", isPreviewFree: false },
      { title: "Robust Error Handling & Custom Exceptions", isPreviewFree: false },
      { title: "Functional Java: Lambdas & Streams API Processing", isPreviewFree: false },
      { title: "Multithreading, Concurrency & Thread Synchronization", isPreviewFree: false },
      { title: "Building a Complete Java Console Banking Application", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Data Structures and Algorithms in Java",
    subTitle: "Ace Technical Coding Interviews with Arrays, Trees, Graphs, Dynamic Programming & Complexity Analysis",
    category: "Programming & Software Development",
    courseLevel: "Advance",
    coursePrice: 1499,
    courseThumbnail: "/images/courses/data-structures-algorithms.jpg",
    isPublished: true,
    instructorEmail: "marcus.vance@skillstack.edu",
    description: `
      <h3>Conquer Top Tier Technical Coding Interviews</h3>
      <p>Designed for engineers aiming for top tech companies. Master the implementation and optimization of essential data structures, algorithmic patterns, recursive thinking, dynamic programming, and asymptotic complexity analysis.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Asymptotic notation: Big-O, Big-Omega, Big-Theta, and space-time trade-offs</li>
        <li>Arrays, Linked Lists, Stacks, Queues, Hash Tables, and Heaps</li>
        <li>Tree traversals: Binary Search Trees, AVL Trees, Tries, and Segment Trees</li>
        <li>Graph algorithms: BFS, DFS, Dijkstra, Bellman-Ford, Kruskal, and Prim</li>
        <li>Algorithmic strategies: Two Pointers, Sliding Window, Greedy, Backtracking</li>
        <li>Dynamic Programming: Memoization, Tabulation, and Knapsack variants</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Proficiency in Java or another object-oriented programming language.</p>
      <h4>Intended Audience:</h4>
      <p>Computer science students, bootcamp graduates, and developers preparing for FAANG/MNC coding interviews.</p>
    `,
    lectures: [
      { title: "Algorithmic Complexity & Big-O Master Theorem", isPreviewFree: true },
      { title: "Arrays, Strings & the Two-Pointer / Sliding Window Techniques", isPreviewFree: true },
      { title: "Linked Lists: Singly, Doubly & Cycle Detection Algorithms", isPreviewFree: false },
      { title: "Stacks, Queues & Monotonic Data Structures", isPreviewFree: false },
      { title: "Trees & Binary Search Tree Implementation from Scratch", isPreviewFree: false },
      { title: "Priority Queues, Heaps & Top-K Problems", isPreviewFree: false },
      { title: "Graph Representations, Breadth-First & Depth-First Search", isPreviewFree: false },
      { title: "Shortest Path & Minimum Spanning Tree Algorithms", isPreviewFree: false },
      { title: "Dynamic Programming: 1D & 2D Memoization and Tabulation", isPreviewFree: false },
      { title: "Mock Interview Problem Solving & Pattern Recognition", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Object-Oriented Programming and Design Patterns",
    subTitle: "Master SOLID Principles, Creational, Structural, and Behavioral Design Patterns in Clean Code",
    category: "Programming & Software Development",
    courseLevel: "Medium",
    coursePrice: 1199,
    courseThumbnail: "/images/courses/oop-design-patterns.jpg",
    isPublished: true,
    instructorEmail: "marcus.vance@skillstack.edu",
    description: `
      <h3>Write Clean, Extensible, and Maintainable Enterprise Software</h3>
      <p>Writing working code is easy; writing maintainable code that scales requires engineering discipline. Learn the timeless Gang of Four (GoF) design patterns and SOLID principles to architect loosely-coupled, high-cohesion software systems.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>The 5 SOLID principles applied to real-world code refactoring</li>
        <li>Creational Patterns: Singleton, Factory Method, Abstract Factory, Builder, Prototype</li>
        <li>Structural Patterns: Adapter, Decorator, Facade, Composite, Proxy</li>
        <li>Behavioral Patterns: Observer, Strategy, Command, State, Chain of Responsibility</li>
        <li>Code smells, antipatterns, and refactoring techniques</li>
        <li>Applying design patterns to modern microservices and web applications</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic knowledge of an object-oriented language like Java, C++, TypeScript, or Python.</p>
      <h4>Intended Audience:</h4>
      <p>Software engineers looking to advance their design capability and prepare for system design interviews.</p>
    `,
    lectures: [
      { title: "The Philosophy of Clean Code & Software Craftsmanship", isPreviewFree: true },
      { title: "Deconstructing SOLID Principles with Practical Code Examples", isPreviewFree: true },
      { title: "Creational Patterns: Factory, Builder & Singleton Deep Dive", isPreviewFree: false },
      { title: "Structural Patterns: Adapter, Facade & Decorator in Action", isPreviewFree: false },
      { title: "Behavioral Patterns: Strategy, Observer & State Machines", isPreviewFree: false },
      { title: "Refactoring Legacy Code: Identifying Code Smells & Antipatterns", isPreviewFree: false },
      { title: "Enterprise Case Study: Architecting an Extensible E-Commerce Engine", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Git, GitHub, and Collaborative Software Development",
    subTitle: "Master Version Control, Branching Strategies, Pull Requests, Merge Conflicts & Team Workflows",
    category: "Programming & Software Development",
    courseLevel: "Beginner",
    coursePrice: 0,
    courseThumbnail: "/images/courses/git-github-collaboration.jpg",
    isPublished: true,
    instructorEmail: "alex.rivera@skillstack.edu",
    description: `
      <h3>Essential Version Control for Modern Software Teams</h3>
      <p>Every software engineer must master Git. Learn how Git manages content under the hood, how to collaborate using GitHub, master branch workflows (Gitflow, Trunk-based), resolve complex merge conflicts with confidence, and write clean pull requests.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Git internal architecture: Blobs, Trees, Commits, and HEAD references</li>
        <li>Staging, committing, amending, and interactive rebasing</li>
        <li>Branching, fast-forward vs three-way merges, and conflict resolution</li>
        <li>Remote workflows: Clones, remotes, fetch, pull, push, and tracking branches</li>
        <li>GitHub best practices: Pull requests, code reviews, issues, and project boards</li>
        <li>Git stash, cherry-pick, reset, revert, and recovering lost commits with reflog</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic familiarity using a terminal or command prompt.</p>
      <h4>Intended Audience:</h4>
      <p>Developers of all levels, students, and engineers joining collaborative software teams.</p>
    `,
    lectures: [
      { title: "Why Version Control Matters & Git Architecture Under the Hood", isPreviewFree: true },
      { title: "Essential Git Workflow: Init, Stage, Commit & Status", isPreviewFree: true },
      { title: "Branching Strategies: GitFlow vs Trunk-Based Development", isPreviewFree: false },
      { title: "Merging Branches & Resolving Conflicts Confidently", isPreviewFree: false },
      { title: "GitHub Collaboration: Pull Requests, Code Reviews & Branch Protection", isPreviewFree: false },
      { title: "Advanced Git: Interactive Rebase, Cherry-Pick & Stashing", isPreviewFree: false },
      { title: "Time Travel: Reset, Revert & The Magic of Git Reflog", isPreviewFree: false },
    ],
  },

  // ==========================================
  // C. AI & MACHINE LEARNING (4 courses)
  // ==========================================
  {
    courseTitle: "Python for Artificial Intelligence",
    subTitle: "Essential Python Foundations, NumPy, Pandas, and Scientific Computing for Modern AI Engineering",
    category: "AI & Machine Learning",
    courseLevel: "Beginner",
    coursePrice: 899,
    courseThumbnail: "/images/courses/python-ai.jpg",
    isPublished: true,
    instructorEmail: "sarah.chen@skillstack.edu",
    description: `
      <h3>The Essential Scientific Python Toolkit for AI Practitioners</h3>
      <p>Get ready for artificial intelligence with Python. This course covers the exact programming paradigms, matrix mathematics, vectorized computations, and data wrangling tools needed before diving into machine learning and deep learning algorithms.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Python 3 idioms, list comprehensions, generators, and decorators</li>
        <li>Numerical computing with NumPy: N-dimensional arrays, broadcasting, vectorization</li>
        <li>Data manipulation with Pandas: Series, DataFrames, indexing, group-by operations</li>
        <li>Visualizing scientific data using Matplotlib and Seaborn</li>
        <li>Linear algebra basics for AI: Vectors, matrices, dot products, and transformations</li>
        <li>Object-oriented Python for modular machine learning pipelines</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic high school algebra. No prior programming background necessary.</p>
      <h4>Intended Audience:</h4>
      <p>Beginners, analysts, and engineers transitioning into artificial intelligence and machine learning.</p>
    `,
    lectures: [
      { title: "Setting Up Your AI Lab: Python 3, Anaconda & Jupyter Notebooks", isPreviewFree: true },
      { title: "Python Essentials for AI: Data Structures & Functional Paradigms", isPreviewFree: true },
      { title: "NumPy Arrays, Matrix Operations & Vectorized Math", isPreviewFree: false },
      { title: "Data Wrangling at Scale with Pandas DataFrames", isPreviewFree: false },
      { title: "Visual Data Storytelling with Matplotlib & Seaborn", isPreviewFree: false },
      { title: "Linear Algebra & Calculus Foundations for AI Engineers", isPreviewFree: false },
      { title: "Capstone Project: Processing and Normalizing Raw Scientific Datasets", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Machine Learning Fundamentals",
    subTitle: "Supervised and Unsupervised Learning, Regression, Classification, Model Evaluation with Scikit-Learn",
    category: "AI & Machine Learning",
    courseLevel: "Medium",
    coursePrice: 1499,
    courseThumbnail: "/images/courses/machine-learning-fundamentals.jpg",
    isPublished: true,
    instructorEmail: "sarah.chen@skillstack.edu",
    description: `
      <h3>Build Predictive Models from Real-World Data</h3>
      <p>Demystify the math and code behind machine learning. Learn how to formulate predictive problems, preprocess features, train regression and classification models, tune hyperparameters, and prevent overfitting using industry-standard Scikit-Learn.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>The Machine Learning workflow: Problem formulation, data splitting, baseline models</li>
        <li>Supervised Learning: Linear Regression, Logistic Regression, Decision Trees, Random Forests</li>
        <li>Ensemble methods: Gradient Boosting, XGBoost, and Stacking</li>
        <li>Unsupervised Learning: K-Means clustering, Hierarchical clustering, PCA dimensionality reduction</li>
        <li>Model evaluation: Precision, Recall, F1-Score, ROC-AUC, cross-validation</li>
        <li>Feature engineering: Imputation, scaling, one-hot encoding, and feature selection</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic Python programming and elementary algebra.</p>
      <h4>Intended Audience:</h4>
      <p>Software developers, data analysts, and researchers building intelligent predictive models.</p>
    `,
    lectures: [
      { title: "Introduction to Machine Learning: Paradigms & Industry Use Cases", isPreviewFree: true },
      { title: "Data Preprocessing, Imputation & Feature Scaling Pipelines", isPreviewFree: true },
      { title: "Linear & Polynomial Regression: Predicting Continuous Outcomes", isPreviewFree: false },
      { title: "Classification with Logistic Regression & Support Vector Machines", isPreviewFree: false },
      { title: "Decision Trees, Random Forests & Ensemble Learning", isPreviewFree: false },
      { title: "High-Performance Boosting: XGBoost & LightGBM", isPreviewFree: false },
      { title: "Unsupervised Clustering with K-Means & PCA Dimensionality Reduction", isPreviewFree: false },
      { title: "Cross-Validation, Hyperparameter Tuning with GridSearch & Metrics", isPreviewFree: false },
      { title: "End-to-End Capstone: Customer Churn Prediction System", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Deep Learning and Neural Networks",
    subTitle: "Build and Train Convolutional, Recurrent & Transformer Networks Using PyTorch and TensorFlow",
    category: "AI & Machine Learning",
    courseLevel: "Advance",
    coursePrice: 1999,
    courseThumbnail: "/images/courses/deep-learning-neural-networks.jpg",
    isPublished: true,
    instructorEmail: "sarah.chen@skillstack.edu",
    description: `
      <h3>Master Artificial Neural Networks and State-of-the-Art Deep Architectures</h3>
      <p>Explore the cutting edge of artificial intelligence. Master gradient descent backpropagation, multi-layer perceptrons, convolutional neural networks for computer vision, recurrent networks for sequence data, and modern attention-based Transformer models.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Mathematics of artificial neurons: Forward propagation, activation functions, loss functions</li>
        <li>Backpropagation and stochastic gradient descent optimization (Adam, RMSprop)</li>
        <li>Deep learning frameworks: PyTorch tensors, autograd, and modular training loops</li>
        <li>Convolutional Neural Networks (CNNs) for image classification and feature maps</li>
        <li>Transfer learning with pretrained architectures (ResNet, EfficientNet)</li>
        <li>Recurrent Neural Networks (RNNs, LSTMs, GRUs) and the Self-Attention mechanism</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Proficiency in Python and basic understanding of machine learning concepts.</p>
      <h4>Intended Audience:</h4>
      <p>AI engineers, data scientists, and researchers aiming to build state-of-the-art neural networks.</p>
    `,
    lectures: [
      { title: "Biological vs Artificial Neurons: The Perceptron & Activation Functions", isPreviewFree: true },
      { title: "Mathematics of Backpropagation & Gradient Descent Optimizers", isPreviewFree: true },
      { title: "Building Neural Networks in PyTorch: Tensors, Autograd & Modules", isPreviewFree: false },
      { title: "Mitigating Overfitting: Dropout, Batch Normalization & Weight Decay", isPreviewFree: false },
      { title: "Convolutional Neural Networks (CNNs) & Computer Vision Pipelines", isPreviewFree: false },
      { title: "Transfer Learning & Fine-Tuning State-of-the-Art Vision Models", isPreviewFree: false },
      { title: "Sequence Modeling: LSTMs, GRUs & Natural Language Processing", isPreviewFree: false },
      { title: "The Transformer Revolution: Multi-Head Self-Attention Demystified", isPreviewFree: false },
      { title: "Deploying PyTorch Models as Scalable Inference Microservices", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Generative AI and Large Language Model Fundamentals",
    subTitle: "Prompt Engineering, RAG Systems, Fine-Tuning LLMs, and Vector Embeddings with LangChain",
    category: "AI & Machine Learning",
    courseLevel: "Advance",
    coursePrice: 1999,
    courseThumbnail: "/images/courses/generative-ai-llms.jpg",
    isPublished: false, // Draft course for testing unpublished visibility!
    instructorEmail: "sarah.chen@skillstack.edu",
    description: `
      <h3>Harness the Power of LLMs, Prompt Engineering, and RAG Architecture</h3>
      <p>Understand the generative AI revolution from the ground up. Learn how transformer-based large language models work, explore advanced prompt engineering, generate embeddings, build Retrieval-Augmented Generation (RAG) applications, and orchestrate AI agents.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>LLM architecture: Pretraining, RLHF, alignment, tokens, and temperature parameters</li>
        <li>Advanced prompt engineering: Few-shot prompting, Chain-of-Thought, ReAct pattern</li>
        <li>Text embeddings and vector databases (Pinecone, ChromaDB, FAISS)</li>
        <li>Building enterprise RAG pipelines with LangChain and LlamaIndex</li>
        <li>Fine-tuning strategies: LoRA, QLoRA, and parameter-efficient tuning</li>
        <li>Evaluation benchmarks, hallucination mitigation, and AI safety guardrails</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Intermediate Python programming and familiarity with REST API integration.</p>
      <h4>Intended Audience:</h4>
      <p>Software developers and architects building enterprise generative AI applications and AI assistants.</p>
    `,
    lectures: [
      { title: "Introduction to Generative AI & Foundation Model Architecture", isPreviewFree: true },
      { title: "Mastering Prompt Engineering: Zero-Shot, Few-Shot & Chain-of-Thought", isPreviewFree: true },
      { title: "Tokens, Temperature, Top-P & API Integration with OpenAI & Claude", isPreviewFree: false },
      { title: "Vector Embeddings & Semantic Search with ChromaDB", isPreviewFree: false },
      { title: "Retrieval-Augmented Generation (RAG) Architecture from Scratch", isPreviewFree: false },
      { title: "Orchestrating Complex AI Workflows with LangChain", isPreviewFree: false },
      { title: "Fine-Tuning Open Source LLMs with LoRA & Hugging Face", isPreviewFree: false },
      { title: "Mitigating Hallucinations, Guardrails & Production Safety", isPreviewFree: false },
    ],
  },

  // ==========================================
  // D. DATA SCIENCE & ANALYTICS (4 courses)
  // ==========================================
  {
    courseTitle: "Python for Data Analysis",
    subTitle: "Clean, Wrangle, Analyze, and Visualize Large Datasets Using Pandas, NumPy, Matplotlib & Seaborn",
    category: "Data Science",
    courseLevel: "Beginner",
    coursePrice: 799,
    courseThumbnail: "/images/courses/python-data-analysis.jpg",
    isPublished: true,
    instructorEmail: "alex.rivera@skillstack.edu",
    description: `
      <h3>Turn Raw Data into Actionable Business Insights</h3>
      <p>Data is the new oil, but only if you can extract value from it. Master the practical Python toolset for extracting, cleaning, transforming, aggregating, and visualizing complex business datasets to answer high-stakes strategic questions.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Importing heterogeneous data from CSV, Excel, JSON, and SQL databases</li>
        <li>Handling missing values, outlier detection, and data type coercion</li>
        <li>Advanced filtering, slicing, grouping, and pivot tables in Pandas</li>
        <li>Time-series analysis: Resampling, rolling windows, and seasonality trends</li>
        <li>Statistical visualizations with Seaborn and interactive charts with Plotly</li>
        <li>Automating repetitive reporting workflows with clean Python scripts</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic familiarity with computer operations and spreadsheets.</p>
      <h4>Intended Audience:</h4>
      <p>Business analysts, spreadsheet users wanting to upgrade to Python, and aspiring data scientists.</p>
    `,
    lectures: [
      { title: "The Data Analyst Mindset & Setting Up Jupyter Notebooks", isPreviewFree: true },
      { title: "Ingesting Data: CSV, Excel, JSON & SQL Connections", isPreviewFree: true },
      { title: "Data Cleaning: Handling Missing Values, Duplicates & Outliers", isPreviewFree: false },
      { title: "Transforming Data: Groupby, Aggregations & Pivot Tables", isPreviewFree: false },
      { title: "Merging, Joining & Concatenating Multi-Source Datasets", isPreviewFree: false },
      { title: "Time Series Analysis: Trends, Seasonality & Moving Averages", isPreviewFree: false },
      { title: "Exploratory Data Analysis (EDA) with Seaborn & Plotly", isPreviewFree: false },
      { title: "Capstone Project: End-to-End Sales Performance Analytics Dashboard", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "SQL and Database Management",
    subTitle: "Master Relational Databases, Complex Queries, Joins, Indexing, and Schema Architecture in PostgreSQL",
    category: "Data Science",
    courseLevel: "Beginner",
    coursePrice: 699,
    courseThumbnail: "/images/courses/sql-database-management.jpg",
    isPublished: true,
    instructorEmail: "marcus.vance@skillstack.edu",
    description: `
      <h3>Query, Model, and Manage High-Performance Relational Databases</h3>
      <p>SQL is the universal language of data. Learn relational database theory, write intricate analytical queries, master all types of joins, optimize performance with indexes, and design normalized database schemas that scale.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Relational database concepts, tables, primary keys, and foreign keys</li>
        <li>Writing basic to advanced SELECT statements with filtering and sorting</li>
        <li>Mastering Joins: Inner, Left, Right, Full Outer, and Self Joins</li>
        <li>Window functions: ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG</li>
        <li>Common Table Expressions (CTEs), Subqueries, and recursive queries</li>
        <li>Database indexing, query execution plans (EXPLAIN ANALYZE), and transactions (ACID)</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>No prior database experience required.</p>
      <h4>Intended Audience:</h4>
      <p>Data analysts, backend developers, product managers, and business intelligence specialists.</p>
    `,
    lectures: [
      { title: "Introduction to Relational Databases & PostgreSQL Installation", isPreviewFree: true },
      { title: "Basic Querying: SELECT, WHERE, ORDER BY & LIMIT", isPreviewFree: true },
      { title: "Aggregating Data: GROUP BY, HAVING & Mathematical Functions", isPreviewFree: false },
      { title: "Mastering Table Joins: INNER, LEFT, RIGHT & FULL OUTER", isPreviewFree: false },
      { title: "Subqueries, Common Table Expressions (CTEs) & Clean Queries", isPreviewFree: false },
      { title: "Advanced Analytical Window Functions: RANK, LEAD & LAG", isPreviewFree: false },
      { title: "Database Schema Design, Normalization & Constraints", isPreviewFree: false },
      { title: "Performance Tuning: Indexes, B-Trees & EXPLAIN ANALYZE", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Data Visualization with Power BI",
    subTitle: "Build Executive Dashboards, Interactive KPI Reports, and DAX Calculations from Scratch",
    category: "Data Science",
    courseLevel: "Medium",
    coursePrice: 999,
    courseThumbnail: "/images/courses/power-bi-data-visualization.jpg",
    isPublished: true,
    instructorEmail: "alex.rivera@skillstack.edu",
    description: `
      <h3>Transform Raw Business Data into Executive-Ready Dashboards</h3>
      <p>Power BI is the global corporate standard for Business Intelligence. Learn how to connect to multiple disparate data sources, transform data using Power Query, build robust star-schema data models, write DAX calculations, and craft intuitive interactive dashboards.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Power BI Desktop interface, workflow, and core visualization components</li>
        <li>Data transformation with Power Query: Unpivoting, merging, custom columns</li>
        <li>Data modeling best practices: Star schema, fact tables, dimension tables</li>
        <li>DAX (Data Analysis Expressions): Measures, Calculated Columns, CALCULATE, Time Intelligence</li>
        <li>Designing modern UI layouts: Visual hierarchy, drill-throughs, tooltips, bookmarks</li>
        <li>Publishing reports, configuring row-level security (RLS), and scheduling automatic refreshes</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic spreadsheet or Excel knowledge.</p>
      <h4>Intended Audience:</h4>
      <p>Business analysts, financial analysts, BI developers, and managers seeking visual decision-making tools.</p>
    `,
    lectures: [
      { title: "Power BI Ecosystem Overview & Desktop Installation", isPreviewFree: true },
      { title: "Power Query ETL: Cleaning & Shaping Messy Data Sources", isPreviewFree: true },
      { title: "Data Modeling Foundations: Star Schemas & Relationship Cardinality", isPreviewFree: false },
      { title: "Introduction to DAX: Calculated Columns vs Measures", isPreviewFree: false },
      { title: "The Master DAX Function: CALCULATE, Filter Context & Overrides", isPreviewFree: false },
      { title: "Time Intelligence with DAX: YTD, QTD & Year-Over-Year Growth", isPreviewFree: false },
      { title: "Interactive Visuals: Drill-Throughs, Tooltips & Dynamic Bookmarks", isPreviewFree: false },
      { title: "Publishing to Power BI Service & Implementing Row-Level Security", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Statistics and Data Analysis for Beginners",
    subTitle: "Descriptive & Inferential Statistics, Probability Distributions, and Hypothesis Testing for Data Analysts",
    category: "Data Science",
    courseLevel: "Beginner",
    coursePrice: 499,
    courseThumbnail: "/images/courses/statistics-data-analysis.jpg",
    isPublished: true,
    instructorEmail: "sarah.chen@skillstack.edu",
    description: `
      <h3>Master the Statistical Thinking Behind Every Data-Driven Decision</h3>
      <p>Stop guessing and start validating. Gain a solid, intuitive understanding of statistical principles without getting lost in abstract mathematical notation. Learn how to interpret distributions, run hypothesis tests, calculate p-values, and avoid common statistical pitfalls.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Descriptive statistics: Mean, Median, Mode, Variance, Standard Deviation, IQR</li>
        <li>Probability concepts, conditional probability, and Bayes' Theorem</li>
        <li>Key probability distributions: Normal, Binomial, Poisson, and Central Limit Theorem</li>
        <li>Confidence intervals, margin of error, and sample size calculations</li>
        <li>Hypothesis testing: Null vs Alternative hypotheses, Type I & Type II errors</li>
        <li>Parametric and non-parametric tests: Z-tests, T-tests, ANOVA, and Chi-Square tests</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic secondary school arithmetic.</p>
      <h4>Intended Audience:</h4>
      <p>Aspiring data analysts, product managers evaluating A/B tests, and market researchers.</p>
    `,
    lectures: [
      { title: "The Role of Statistics in Modern Data Science & Analytics", isPreviewFree: true },
      { title: "Descriptive Statistics: Central Tendency & Measures of Dispersion", isPreviewFree: true },
      { title: "Probability Theory & The Intuition of Bayes Theorem", isPreviewFree: false },
      { title: "The Normal Distribution & The Magic of Central Limit Theorem", isPreviewFree: false },
      { title: "Sampling Methods, Margin of Error & Confidence Intervals", isPreviewFree: false },
      { title: "Hypothesis Testing: Formulation, Alpha Levels & p-Values", isPreviewFree: false },
      { title: "A/B Testing in Practice: Two-Sample T-Tests & Common Pitfalls", isPreviewFree: false },
    ],
  },

  // ==========================================
  // E. CLOUD COMPUTING & DEVOPS (4 courses)
  // ==========================================
  {
    courseTitle: "Cloud Computing Fundamentals",
    subTitle: "Understand Cloud Architecture, IaaS, PaaS, SaaS, Virtualization, Security & Global Infrastructure",
    category: "Cloud & DevOps",
    courseLevel: "Beginner",
    coursePrice: 599,
    courseThumbnail: "/images/courses/cloud-computing-fundamentals.jpg",
    isPublished: true,
    instructorEmail: "marcus.vance@skillstack.edu",
    description: `
      <h3>The Essential Blueprint to Modern Cloud Architecture</h3>
      <p>Understand how the cloud works before writing your first deployment script. Learn fundamental cloud service models (IaaS, PaaS, SaaS), deployment architectures (Public, Private, Hybrid, Multi-Cloud), shared responsibility models, and cloud networking fundamentals.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Core cloud concepts: Elasticity, Scalability, High Availability, Fault Tolerance</li>
        <li>Service models compared: Infrastructure, Platform, and Software as a Service</li>
        <li>Cloud deployment strategies: Public, Private, Hybrid, and Edge computing</li>
        <li>Virtualization, Hypervisors, Containers, and Serverless computing paradigms</li>
        <li>Cloud storage types: Object, Block, and File storage architectures</li>
        <li>Cloud security fundamentals: Shared Responsibility Model, IAM, encryption at rest/transit</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic familiarity with how websites and the internet function.</p>
      <h4>Intended Audience:</h4>
      <p>IT professionals, developers beginning their cloud journey, and technical managers.</p>
    `,
    lectures: [
      { title: "What is Cloud Computing? History, Drivers & Economic Benefits", isPreviewFree: true },
      { title: "Cloud Service Models: IaaS vs PaaS vs SaaS Explained", isPreviewFree: true },
      { title: "Global Cloud Infrastructure: Regions, Availability Zones & Edge Locations", isPreviewFree: false },
      { title: "Virtualization Mechanics, Hypervisors & Virtual Machines", isPreviewFree: false },
      { title: "Cloud Storage Solutions: Object vs Block vs File Systems", isPreviewFree: false },
      { title: "Cloud Networking: VPCs, Subnets, Gateways & Security Groups", isPreviewFree: false },
      { title: "The Shared Responsibility Security Model & Compliance", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Docker and Containerization",
    subTitle: "Containerize Microservices, Write Multi-Stage Dockerfiles, and Orchestrate with Docker Compose",
    category: "Cloud & DevOps",
    courseLevel: "Medium",
    coursePrice: 1199,
    courseThumbnail: "/images/courses/docker-containerization.jpg",
    isPublished: true,
    instructorEmail: "marcus.vance@skillstack.edu",
    description: `
      <h3>Eliminate 'It Works on My Machine' Forever</h3>
      <p>Containerization is the bedrock of modern software deployment. Master Docker from initial container commands to building production-grade multi-stage Dockerfiles, managing persistent volumes, networking isolated containers, and orchestrating full-stack applications with Docker Compose.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Containers vs Virtual Machines: Namespaces, cgroups, and layer caching</li>
        <li>Running, stopping, inspecting, and debugging Docker containers</li>
        <li>Writing production-ready, lean, multi-stage Dockerfiles</li>
        <li>Data persistence: Volumes, bind mounts, and tmpfs storage</li>
        <li>Container networking: Bridge, host, overlay, and custom bridge networks</li>
        <li>Multi-container orchestration with Docker Compose (Frontend, Backend, Database)</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic terminal/command line skills and elementary web development experience.</p>
      <h4>Intended Audience:</h4>
      <p>Full-stack developers, DevOps engineers, and QA engineers wanting predictable development and production environments.</p>
    `,
    lectures: [
      { title: "The Container Revolution: Why Docker Solved Deployment Chaos", isPreviewFree: true },
      { title: "Installing Docker & The Fundamental CLI Commands", isPreviewFree: true },
      { title: "Writing Clean Dockerfiles: Instructions, Layers & Caching", isPreviewFree: false },
      { title: "Multi-Stage Builds: Reducing Image Sizes by 90%", isPreviewFree: false },
      { title: "Persistent Data Management with Docker Volumes", isPreviewFree: false },
      { title: "Docker Networking: Inter-Container Communication", isPreviewFree: false },
      { title: "Docker Compose: Orchestrating a MERN App with One Command", isPreviewFree: false },
      { title: "Container Security, Non-Root Users & Vulnerability Scanning", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "CI/CD with GitHub Actions",
    subTitle: "Automate Automated Testing, Security Scans, Multi-Environment Builds, and Production Deployments",
    category: "Cloud & DevOps",
    courseLevel: "Medium",
    coursePrice: 999,
    courseThumbnail: "/images/courses/cicd-github-actions.jpg",
    isPublished: true,
    instructorEmail: "marcus.vance@skillstack.edu",
    description: `
      <h3>Build Automated Pipelines for Continuous Integration & Deployment</h3>
      <p>Ship software with speed and confidence. Learn to design, configure, and troubleshoot continuous integration and continuous deployment pipelines using native GitHub Actions. Automate linting, unit testing, docker builds, and cloud deployments on every commit.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>CI/CD core principles: Automated builds, automated tests, automated releases</li>
        <li>GitHub Actions anatomy: Workflows, triggers, events, jobs, steps, runners, actions</li>
        <li>Writing YAML workflows, matrix builds, environment variables, and repository secrets</li>
        <li>Automating JavaScript/TypeScript testing pipelines with caching for speed</li>
        <li>Building and publishing Docker images to Docker Hub and GitHub Container Registry</li>
        <li>Zero-downtime automated deployment to cloud hosting platforms (AWS, Vercel, Render)</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Familiarity with Git and basic web application development.</p>
      <h4>Intended Audience:</h4>
      <p>Developers and DevOps engineers looking to automate software testing and release cycles.</p>
    `,
    lectures: [
      { title: "CI/CD Concepts: From Manual Deploys to Continuous Delivery", isPreviewFree: true },
      { title: "GitHub Actions Architecture: Workflows, Jobs & Runners", isPreviewFree: true },
      { title: "Writing Your First Workflow: Syntax, Triggers & YAML Essentials", isPreviewFree: false },
      { title: "Automating Unit & Integration Tests with Dependency Caching", isPreviewFree: false },
      { title: "Matrix Builds: Testing Across Multiple Node.js & OS Versions", isPreviewFree: false },
      { title: "Secure Secret Management & Environment Configurations", isPreviewFree: false },
      { title: "Automating Docker Image Builds & Publishing to Container Registry", isPreviewFree: false },
      { title: "Continuous Deployment Pipeline: Auto-Deploying to Production", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "AWS Cloud Fundamentals",
    subTitle: "Hands-On EC2, S3, IAM, VPC, Lambda, RDS, and CloudWatch Essentials for Cloud Engineers",
    category: "Cloud & DevOps",
    courseLevel: "Beginner",
    coursePrice: 899,
    courseThumbnail: "/images/courses/aws-cloud-fundamentals.jpg",
    isPublished: true,
    instructorEmail: "marcus.vance@skillstack.edu",
    description: `
      <h3>Hands-On AWS Mastery for Modern Software Engineers</h3>
      <p>Amazon Web Services is the world's most comprehensive and broadly adopted cloud platform. This hands-on course teaches you the core building blocks: Identity and Access Management (IAM), EC2 compute instances, S3 storage, VPC networking, RDS relational databases, and serverless Lambda functions.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>AWS Global Infrastructure: Regions, Availability Zones, and Points of Presence</li>
        <li>Security first: IAM users, groups, roles, policies, and Multi-Factor Authentication</li>
        <li>Compute with Amazon EC2: Instance types, AMIs, key pairs, and Security Groups</li>
        <li>Storage with Amazon S3: Buckets, lifecycle policies, static site hosting, and versioning</li>
        <li>Managed databases with Amazon RDS: PostgreSQL/MySQL automated backups and replicas</li>
        <li>Serverless computing with AWS Lambda, API Gateway, and CloudWatch monitoring</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic understanding of operating systems and networking concepts.</p>
      <h4>Intended Audience:</h4>
      <p>Developers preparing for cloud engineering, system administrators, and AWS Certified Cloud Practitioner candidates.</p>
    `,
    lectures: [
      { title: "AWS Cloud Landscape & Navigating the AWS Management Console", isPreviewFree: true },
      { title: "IAM Deep Dive: Users, Roles, Policies & Least-Privilege Access", isPreviewFree: true },
      { title: "Amazon EC2: Provisioning, SSH Access & Web Server Deployment", isPreviewFree: false },
      { title: "Amazon S3: Object Storage, Static Hosting & Bucket Security", isPreviewFree: false },
      { title: "Networking with Amazon VPC: Subnets, Route Tables & NAT Gateways", isPreviewFree: false },
      { title: "Managed Databases with Amazon RDS: Provisioning & Connecting", isPreviewFree: false },
      { title: "Serverless Foundations: AWS Lambda & API Gateway Microservices", isPreviewFree: false },
      { title: "Monitoring & Observability with Amazon CloudWatch Alarms", isPreviewFree: false },
    ],
  },

  // ==========================================
  // F. UI/UX DESIGN (4 courses)
  // ==========================================
  {
    courseTitle: "UI/UX Design Fundamentals",
    subTitle: "Visual Hierarchy, Color Theory, Typography, Accessibility Standards, and Design Thinking",
    category: "UI/UX Design",
    courseLevel: "Beginner",
    coursePrice: 799,
    courseThumbnail: "/images/courses/ui-ux-design-fundamentals.jpg",
    isPublished: true,
    instructorEmail: "alex.rivera@skillstack.edu",
    description: `
      <h3>Create Intuitive, Delightful Digital Experiences</h3>
      <p>Design is not just what it looks like, it's how it works. Master core design principles including visual hierarchy, spacing systems, accessible color theory, typography pairing, usability heuristics, and the 5-stage Design Thinking process.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>The 5 stages of Design Thinking: Empathize, Define, Ideate, Prototype, Test</li>
        <li>Visual hierarchy: Size, weight, color contrast, whitespace, and layout scanning patterns (F & Z)</li>
        <li>Typography: Font pairing, line-height, kerning, and responsive typographic scales</li>
        <li>Color theory: Semantic color palettes, contrast ratios, and WCAG accessibility standards</li>
        <li>Form design, error state messaging, and microcopy best practices</li>
        <li>Evaluating digital products with Jakob Nielsen's 10 Usability Heuristics</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>No design experience needed. A passion for user empathy and aesthetics is all you need.</p>
      <h4>Intended Audience:</h4>
      <p>Beginner designers, developers wanting to improve UI aesthetics, and entrepreneurs designing their products.</p>
    `,
    lectures: [
      { title: "The Definition of Great Design: UI vs UX Dissected", isPreviewFree: true },
      { title: "The 5-Stage Design Thinking Framework in Action", isPreviewFree: true },
      { title: "Visual Hierarchy: Guiding the User's Eye Naturally", isPreviewFree: false },
      { title: "Typography Systems: Pairings, Scales & Readability", isPreviewFree: false },
      { title: "Color Theory & WCAG Accessibility Compliance", isPreviewFree: false },
      { title: "Micro-Interactions, Feedback States & Empty States", isPreviewFree: false },
      { title: "Heuristic Evaluation: Auditing Real-World Mobile Apps", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Figma for Modern Interface Design",
    subTitle: "Master Auto-Layout, Component Variants, Interactive Prototypes, and Developer Handoffs",
    category: "UI/UX Design",
    courseLevel: "Medium",
    coursePrice: 1199,
    courseThumbnail: "/images/courses/figma-interface-design.jpg",
    isPublished: true,
    instructorEmail: "alex.rivera@skillstack.edu",
    description: `
      <h3>Master Industry-Standard Collaborative Interface Design</h3>
      <p>Figma is the gold standard design tool used across the tech industry. Go from basic vector shapes to mastering responsive Auto Layout, designing component sets with properties and variants, building smart-animated prototypes, and preparing seamless developer handoffs.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Figma interface, canvas navigation, frames, shapes, and vector networks</li>
        <li>Auto Layout 5.0: Direction, gap, padding, constraints, and fluid resizing</li>
        <li>Reusable design tokens: Color styles, typography styles, and variable modes</li>
        <li>Component architecture: Master components, instances, overrides, and variants</li>
        <li>High-fidelity prototyping: Smart Animate, interactive components, hover states</li>
        <li>Developer Mode: Inspecting CSS code, assets export, and design tokens handoff</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Basic computer skills and an understanding of general design concepts.</p>
      <h4>Intended Audience:</h4>
      <p>Graphic designers transitioning to UI/UX, product designers, and frontend engineers collaborating with design teams.</p>
    `,
    lectures: [
      { title: "Figma Fundamentals: Workspace, Frames & Vector Tools", isPreviewFree: true },
      { title: "Auto Layout Deep Dive: Building Fluid, Responsive Components", isPreviewFree: true },
      { title: "Design Systems in Figma: Color Styles & Typography Tokens", isPreviewFree: false },
      { title: "Mastering Components, Variants & Component Properties", isPreviewFree: false },
      { title: "Interactive Prototyping & Smart Animate Transitions", isPreviewFree: false },
      { title: "Figma Variables: Creating Light & Dark Mode Switches", isPreviewFree: false },
      { title: "Developer Handoff: Specs, Assets & Dev Mode Best Practices", isPreviewFree: false },
      { title: "Capstone: Designing an End-to-End Modern Mobile Banking App", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "User Research and Wireframing",
    subTitle: "Conduct Qualitative User Interviews, Usability Testing, Information Architecture, and Wireframes",
    category: "UI/UX Design",
    courseLevel: "Medium",
    coursePrice: 899,
    courseThumbnail: "/images/courses/user-research-wireframing.jpg",
    isPublished: true,
    instructorEmail: "alex.rivera@skillstack.edu",
    description: `
      <h3>Validate Ideas with Real Users Before Writing a Single Line of Code</h3>
      <p>Building the wrong product is the most expensive mistake in software. Learn how to conduct rigorous user interviews, create evidence-based user personas, map customer journeys, architect intuitive information hierarchies, and sketch low-to-medium fidelity wireframes.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>User research methodologies: Qualitative vs Quantitative, generative vs evaluative</li>
        <li>Writing unbiased interview scripts and conducting empathetic user interviews</li>
        <li>Synthesizing research data: Affinity mapping, empathy maps, and user personas</li>
        <li>Customer Journey Mapping: Identifying pain points, drop-offs, and opportunities</li>
        <li>Information Architecture: Card sorting, sitemaps, and navigation hierarchy</li>
        <li>Rapid wireframing: Paper sketching, low-fidelity digital wireframes, and concept testing</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Curiosity about human behavior and an interest in product strategy.</p>
      <h4>Intended Audience:</h4>
      <p>UX researchers, product managers, startup founders, and designers seeking user-centered methodologies.</p>
    `,
    lectures: [
      { title: "Why User Research Prevents Expensive Product Failures", isPreviewFree: true },
      { title: "Planning & Conducting Effective User Discovery Interviews", isPreviewFree: true },
      { title: "Affinity Mapping & Creating Research-Backed User Personas", isPreviewFree: false },
      { title: "Customer Journey Mapping: Identifying Friction & Delight", isPreviewFree: false },
      { title: "Information Architecture: Card Sorting & Tree Testing", isPreviewFree: false },
      { title: "Rapid Low-Fidelity Wireframing & Paper Prototyping", isPreviewFree: false },
      { title: "Conducting Usability Tests & Synthesizing Actionable Feedback", isPreviewFree: false },
    ],
  },
  {
    courseTitle: "Responsive Design Systems and Prototyping",
    subTitle: "Scale Enterprise Design Tokens, Multimodal Libraries, Design Handoffs, and High-Fidelity Prototypes",
    category: "UI/UX Design",
    courseLevel: "Advance",
    coursePrice: 1499,
    courseThumbnail: "/images/courses/design-systems-prototyping.jpg",
    isPublished: false, // Draft course for testing unpublished visibility!
    instructorEmail: "alex.rivera@skillstack.edu",
    description: `
      <h3>Architect Scalable Design Systems for Enterprise Applications</h3>
      <p>Scale design across large teams and multi-platform applications. Learn how to build atomic design systems, manage semantic design tokens, write component documentation, align design with code repositories, and create production-grade high-fidelity prototypes.</p>
      <h4>What You Will Learn:</h4>
      <ul>
        <li>Atomic design methodology: Atoms, Molecules, Organisms, Templates, and Pages</li>
        <li>Structuring design tokens: Primitive, semantic, and component-level tokens</li>
        <li>Building comprehensive component libraries with states (Hover, Active, Focus, Disabled, Loading)</li>
        <li>Managing multi-brand and multi-theme design systems in enterprise Figma libraries</li>
        <li>Aligning design tokens with code (CSS variables, Tailwind themes, Storybook)</li>
        <li>Creating micro-interaction animations and complex interactive application prototypes</li>
      </ul>
      <h4>Prerequisites:</h4>
      <p>Proficiency with Figma and understanding of UI/UX design principles.</p>
      <h4>Intended Audience:</h4>
      <p>Lead designers, design systems engineers, and senior frontend developers scaling enterprise design.</p>
    `,
    lectures: [
      { title: "The Anatomy of an Enterprise Design System", isPreviewFree: true },
      { title: "Atomic Design Principles & Component Hierarchy", isPreviewFree: true },
      { title: "Design Tokens Architecture: Primitive vs Semantic Variables", isPreviewFree: false },
      { title: "Building a Bulletproof Component Library: Button & Input Sets", isPreviewFree: false },
      { title: "Complex Components: Modals, Navigation Bars & Data Tables", isPreviewFree: false },
      { title: "Multi-Theme Architecture: Seamless Dark Mode & Brand Theming", isPreviewFree: false },
      { title: "Bridging Design & Code: Storybook, Git & Developer Tokens Sync", isPreviewFree: false },
      { title: "Advanced High-Fidelity Prototypes with Variables & Conditional Logic", isPreviewFree: false },
    ],
  },
];

async function seedCourses() {
  console.log("=================================================");
  console.log("🚀 SkillStack LMS - Database Seed Script");
  console.log("=================================================");

  // 1. Safety Checks
  const env = process.env.NODE_ENV || "development";
  console.log(`Environment: ${env}`);

  if (env === "production" && !process.env.ALLOW_PROD_SEED) {
    console.error("❌ Refusing to run seed script in production without ALLOW_PROD_SEED flag.");
    process.exit(1);
  }

  try {
    await connectDB();
    console.log(`Connected to database: ${mongoose.connection.name}`);

    // 2. Instructors Handling
    const instructorMap = new Map();

    // Check existing instructors
    const existingInstructors = await User.find({ role: "instructor" });
    for (const inst of existingInstructors) {
      instructorMap.set(inst.email.toLowerCase(), inst);
    }

    // Ensure sample instructors exist
    for (const instData of sampleInstructors) {
      const emailLower = instData.email.toLowerCase();
      let instructor = instructorMap.get(emailLower);

      if (!instructor) {
        instructor = await User.findOne({ email: emailLower });
        if (instructor) {
          // If user exists, ensure they have instructor role
          if (instructor.role !== "instructor" && instructor.role !== "admin") {
            instructor.role = "instructor";
            await instructor.save();
          }
          console.log(`ℹ Reusing existing account for instructor: ${instructor.name} (${instructor.email})`);
        } else {
          const hashedPassword = await bcrypt.hash(instData.password, 10);
          instructor = await User.create({
            name: instData.name,
            email: emailLower,
            password: hashedPassword,
            role: "instructor",
            isVerified: true,
            photoURL: instData.photoURL,
          });
          console.log(`+ Created dedicated instructor: ${instructor.name} (${instructor.email})`);
        }
      }
      instructorMap.set(emailLower, instructor);
    }

    // Default instructor fallback if specific email not found
    const defaultInstructor =
      instructorMap.get("sarah.chen@skillstack.edu") ||
      Array.from(instructorMap.values())[0];

    // 3. Process Courses & Lectures Idempotently
    let stats = {
      coursesCreated: 0,
      coursesUpdated: 0,
      coursesUnchanged: 0,
      lecturesCreated: 0,
      lecturesUpdated: 0,
    };

    console.log(`\nProcessing ${coursesData.length} sample courses...`);

    for (let i = 0; i < coursesData.length; i++) {
      const c = coursesData[i];
      const instructor = instructorMap.get(c.instructorEmail?.toLowerCase()) || defaultInstructor;

      // Find by courseTitle for idempotency
      let course = await Course.findOne({ courseTitle: c.courseTitle });

      if (!course) {
        course = new Course({
          courseTitle: c.courseTitle,
          subTitle: c.subTitle,
          description: c.description.trim(),
          category: c.category,
          courseLevel: c.courseLevel,
          coursePrice: c.coursePrice,
          courseThumbnail: c.courseThumbnail,
          isPublished: c.isPublished,
          creator: instructor._id,
          lectures: [],
        });
        await course.save();
        stats.coursesCreated++;
        console.log(`+ [Course Created] ${course.courseTitle} (${course.category} | ${course.courseLevel} | ₹${course.coursePrice})`);
      } else {
        // Update metadata cleanly
        course.subTitle = c.subTitle;
        course.description = c.description.trim();
        course.category = c.category;
        course.courseLevel = c.courseLevel;
        course.coursePrice = c.coursePrice;
        course.courseThumbnail = c.courseThumbnail;
        course.isPublished = c.isPublished;
        if (!course.creator) {
          course.creator = instructor._id;
        }
        await course.save();
        stats.coursesUpdated++;
        console.log(`✓ [Course Updated] ${course.courseTitle}`);
      }

      // Process Lectures for this course
      const currentLectureIds = [];

      for (let j = 0; j < c.lectures.length; j++) {
        const lecData = c.lectures[j];
        const videoUrl = DEMO_VIDEOS[(i + j) % DEMO_VIDEOS.length];

        let lecture = await Lecture.findOne({
          courseId: course._id,
          lectureTitle: lecData.title,
        });

        if (!lecture) {
          lecture = await Lecture.create({
            lectureTitle: lecData.title,
            courseId: course._id,
            videoUrl: videoUrl,
            isPreviewFree: Boolean(lecData.isPreviewFree),
          });
          stats.lecturesCreated++;
        } else {
          lecture.videoUrl = videoUrl;
          lecture.isPreviewFree = Boolean(lecData.isPreviewFree);
          await lecture.save();
          stats.lecturesUpdated++;
        }

        currentLectureIds.push(lecture._id);
      }

      // Update course.lectures references
      course.lectures = currentLectureIds;
      await course.save();
    }

    // 4. Summary & Verification
    console.log("\n=================================================");
    console.log("📊 SEED SUMMARY REPORT");
    console.log("=================================================");
    console.log(`Total sample courses defined : ${coursesData.length}`);
    console.log(`Courses created              : ${stats.coursesCreated}`);
    console.log(`Courses updated              : ${stats.coursesUpdated}`);
    console.log(`Lectures created             : ${stats.lecturesCreated}`);
    console.log(`Lectures updated/verified    : ${stats.lecturesUpdated}`);

    // Quick verification query
    const totalInDb = await Course.countDocuments();
    const publishedCount = await Course.countDocuments({ isPublished: true });
    const draftCount = await Course.countDocuments({ isPublished: false });
    const totalLecturesInDb = await Lecture.countDocuments();
    const distinctCategories = await Course.distinct("category");

    console.log("-------------------------------------------------");
    console.log(`Total courses in DB          : ${totalInDb}`);
    console.log(`Published courses in DB      : ${publishedCount}`);
    console.log(`Draft courses in DB          : ${draftCount}`);
    console.log(`Total lectures in DB         : ${totalLecturesInDb}`);
    console.log(`Categories in DB             : ${distinctCategories.join(", ")}`);
    console.log("=================================================");

    console.log("✅ Seed process completed successfully.\n");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed script failed:", error);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

seedCourses();

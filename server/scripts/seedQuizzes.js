import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Quiz } from "../models/quiz.model.js";
import { Course } from "../models/course.model.js";

dotenv.config({ path: "./.env" });

const htmlQuestions = [
  {
    questionText: "What does HTML stand for?",
    options: [
      { optionId: "A", text: "Hyper Text Markup Language" },
      { optionId: "B", text: "High Text Machine Language" },
      { optionId: "C", text: "Hyperlink Text Management Language" },
      { optionId: "D", text: "Home Tool Markup Language" },
    ],
    correctOptionId: "A",
    explanation: "HTML stands for HyperText Markup Language, standard for structuring web pages.",
    marks: 1,
  },
  {
    questionText: "Which HTML tag is used to define an internal stylesheet?",
    options: [
      { optionId: "A", text: "<css>" },
      { optionId: "B", text: "<script>" },
      { optionId: "C", text: "<style>" },
      { optionId: "D", text: "<link>" },
    ],
    correctOptionId: "C",
    explanation: "The <style> element is used to include embedded CSS within the <head> of an HTML document.",
    marks: 1,
  },
  {
    questionText: "Which HTML element represents the independent, self-contained content on a page?",
    options: [
      { optionId: "A", text: "<section>" },
      { optionId: "B", text: "<article>" },
      { optionId: "C", text: "<aside>" },
      { optionId: "D", text: "<div>" },
    ],
    correctOptionId: "B",
    explanation: "The <article> tag specifies independent, self-contained content like blog posts, forum posts, or news stories.",
    marks: 1,
  },
  {
    questionText: "Which attribute is mandatory on an <img> tag for web accessibility?",
    options: [
      { optionId: "A", text: "title" },
      { optionId: "B", text: "alt" },
      { optionId: "C", text: "aria-hidden" },
      { optionId: "D", text: "caption" },
    ],
    correctOptionId: "B",
    explanation: "The 'alt' attribute provides alternative text for screen readers and when images fail to load.",
    marks: 1,
  },
  {
    questionText: "What is the correct HTML element for creating a dropdown list?",
    options: [
      { optionId: "A", text: "<input type='dropdown'>" },
      { optionId: "B", text: "<list>" },
      { optionId: "C", text: "<select>" },
      { optionId: "D", text: "<dropdown>" },
    ],
    correctOptionId: "C",
    explanation: "The <select> element creates a drop-down list combined with <option> tags.",
    marks: 1,
  },
  {
    questionText: "Which doctype declaration is correct for modern HTML5 documents?",
    options: [
      { optionId: "A", text: "<!DOCTYPE html5>" },
      { optionId: "B", text: "<!DOCTYPE html>" },
      { optionId: "C", text: "<!DOCTYPE HTML PUBLIC>" },
      { optionId: "D", text: "<!DOCTYPE XHTML 1.0>" },
    ],
    correctOptionId: "B",
    explanation: "HTML5 simplified the doctype declaration to just <!DOCTYPE html>.",
    marks: 1,
  },
  {
    questionText: "Which element is used to specify navigational links in semantic HTML5?",
    options: [
      { optionId: "A", text: "<navigate>" },
      { optionId: "B", text: "<navigation>" },
      { optionId: "C", text: "<nav>" },
      { optionId: "D", text: "<menu>" },
    ],
    correctOptionId: "C",
    explanation: "The <nav> element designates major navigation blocks in a document.",
    marks: 1,
  },
  {
    questionText: "Which HTML attribute specifies that an input field must be filled out before submitting?",
    options: [
      { optionId: "A", text: "validate" },
      { optionId: "B", text: "required" },
      { optionId: "C", text: "mandatory" },
      { optionId: "D", text: "must-fill" },
    ],
    correctOptionId: "B",
    explanation: "The 'required' boolean attribute prevents form submission if the field is empty.",
    marks: 1,
  },
  {
    questionText: "Which element is used to render 2D shapes and bitmap images via JavaScript?",
    options: [
      { optionId: "A", text: "<graphic>" },
      { optionId: "B", text: "<canvas>" },
      { optionId: "C", text: "<draw>" },
      { optionId: "D", text: "<render>" },
    ],
    correctOptionId: "B",
    explanation: "The <canvas> element provides a scriptable rendering surface for dynamic 2D and 3D graphics.",
    marks: 1,
  },
  {
    questionText: "In an HTML table, which tag represents a standard data cell?",
    options: [
      { optionId: "A", text: "<th>" },
      { optionId: "B", text: "<td>" },
      { optionId: "C", text: "<tr>" },
      { optionId: "D", text: "<tc>" },
    ],
    correctOptionId: "B",
    explanation: "The <td> tag defines a standard data cell in an HTML table.",
    marks: 1,
  },
];

const reactQuestions = [
  {
    questionText: "What is the primary purpose of the Virtual DOM in React?",
    options: [
      { optionId: "A", text: "Directly manipulate the browser DOM faster" },
      { optionId: "B", text: "Minimize direct DOM manipulation by computing minimal diffs" },
      { optionId: "C", text: "Provide a backend database for React state" },
      { optionId: "D", text: "Compile JSX into binary bytecode" },
    ],
    correctOptionId: "B",
    explanation: "The Virtual DOM computes differences in memory and efficiently updates only changed browser DOM nodes.",
    marks: 1,
  },
  {
    questionText: "Which React Hook is primarily used for handling side-effects such as API calls and subscriptions?",
    options: [
      { optionId: "A", text: "useState" },
      { optionId: "B", text: "useReducer" },
      { optionId: "C", text: "useEffect" },
      { optionId: "D", text: "useContext" },
    ],
    correctOptionId: "C",
    explanation: "useEffect lets you synchronize a component with an external system or perform side effects.",
    marks: 1,
  },
  {
    questionText: "Why must list items in React have a unique 'key' prop?",
    options: [
      { optionId: "A", text: "To style each element with CSS" },
      { optionId: "B", text: "To help React identify which items have changed, been added, or removed" },
      { optionId: "C", text: "Keys are mandatory HTML5 attributes" },
      { optionId: "D", text: "To enable two-way data binding" },
    ],
    correctOptionId: "B",
    explanation: "Keys give elements a stable identity, allowing React's reconciliation algorithm to efficiently track changes.",
    marks: 1,
  },
  {
    questionText: "How does data typically flow in a standard React component hierarchy?",
    options: [
      { optionId: "A", text: "Bidirectional from children to parents" },
      { optionId: "B", text: "Unidirectional top-down from parent to child via props" },
      { optionId: "C", text: "Through global window variables only" },
      { optionId: "D", text: "Randomly across peer components" },
    ],
    correctOptionId: "B",
    explanation: "React follows unidirectional data flow: data passes down from parent to child through props.",
    marks: 1,
  },
  {
    questionText: "Which hook should you use to preserve a mutable value that does NOT trigger a re-render when updated?",
    options: [
      { optionId: "A", text: "useState" },
      { optionId: "B", text: "useMemo" },
      { optionId: "C", text: "useRef" },
      { optionId: "D", text: "useCallback" },
    ],
    correctOptionId: "C",
    explanation: "useRef returns a mutable object whose .current property persists without triggering re-renders.",
    marks: 1,
  },
  {
    questionText: "What does JSX syntax compile to under the hood in modern React?",
    options: [
      { optionId: "A", text: "React.createElement or jsx runtime function calls" },
      { optionId: "B", text: "Raw HTML strings sent to innerHTML" },
      { optionId: "C", text: "WebAssembly instructions" },
      { optionId: "D", text: "Direct DOM appendChild calls" },
    ],
    correctOptionId: "A",
    explanation: "Babel/TypeScript compiles JSX into React element factory function calls.",
    marks: 1,
  },
  {
    questionText: "When should you pass an empty dependency array `[]` to `useEffect`?",
    options: [
      { optionId: "A", text: "When the effect should run on every re-render" },
      { optionId: "B", text: "When the effect should only run once on component mount" },
      { optionId: "C", text: "When the effect is never meant to execute" },
      { optionId: "D", text: "When the effect has errors" },
    ],
    correctOptionId: "B",
    explanation: "An empty dependency array indicates the effect doesn't depend on changing props/state, running only once on mount.",
    marks: 1,
  },
  {
    questionText: "What is the purpose of React.memo()?",
    options: [
      { optionId: "A", text: "To cache API response data" },
      { optionId: "B", text: "To memoize component rendering when props haven't changed" },
      { optionId: "C", text: "To store global application state" },
      { optionId: "D", text: "To prevent memory leaks in Redux" },
    ],
    correctOptionId: "B",
    explanation: "React.memo is a higher-order component that skips rendering if props have not changed.",
    marks: 1,
  },
  {
    questionText: "In React, what are controlled components?",
    options: [
      { optionId: "A", text: "Components controlled by Redux middleware" },
      { optionId: "B", text: "Form input elements whose value is driven by React state" },
      { optionId: "C", text: "Components rendered inside iframes" },
      { optionId: "D", text: "Components with strict error boundaries" },
    ],
    correctOptionId: "B",
    explanation: "In controlled components, form data is handled by a React component state rather than the DOM.",
    marks: 1,
  },
  {
    questionText: "What is the recommended hook to cache expensive calculations between renders?",
    options: [
      { optionId: "A", text: "useCallback" },
      { optionId: "B", text: "useMemo" },
      { optionId: "C", text: "useRef" },
      { optionId: "D", text: "useLayoutEffect" },
    ],
    correctOptionId: "B",
    explanation: "useMemo caches the result of a calculation between re-renders until dependencies change.",
    marks: 1,
  },
];

async function seedQuizzes() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for quiz seeding.");

  // Find HTML Course
  const htmlCourse = await Course.findOne({
    courseTitle: { $regex: /HTML5/i },
  });

  if (htmlCourse) {
    let htmlQuiz = await Quiz.findOne({ courseId: htmlCourse._id });
    if (!htmlQuiz) {
      htmlQuiz = await Quiz.create({
        courseId: htmlCourse._id,
        title: "HTML5 Comprehensive Final Assessment",
        description: "Official certification assessment evaluating semantics, web structure, tables, forms, and accessibility.",
        type: "final",
        duration: 20,
        passingPercentage: 60,
        maxAttempts: 3,
        randomizeQuestions: true,
        randomizeOptions: false,
        isPublished: true,
        questions: htmlQuestions,
      });
      console.log("Seeded HTML5 Final Assessment with 10 questions.");
    } else {
      htmlQuiz.questions = htmlQuestions;
      htmlQuiz.isPublished = true;
      await htmlQuiz.save();
      console.log("Updated existing HTML5 Final Assessment with questions.");
    }
  }

  // Find React Course
  const reactCourse = await Course.findOne({
    courseTitle: { $regex: /React/i },
  });

  if (reactCourse) {
    let reactQuiz = await Quiz.findOne({ courseId: reactCourse._id });
    if (!reactQuiz) {
      reactQuiz = await Quiz.create({
        courseId: reactCourse._id,
        title: "Modern React.js Comprehensive Final Assessment",
        description: "Professional certification assessment covering JSX, Virtual DOM, Hooks, state management, and component architecture.",
        type: "final",
        duration: 20,
        passingPercentage: 60,
        maxAttempts: 3,
        randomizeQuestions: true,
        randomizeOptions: false,
        isPublished: true,
        questions: reactQuestions,
      });
      console.log("Seeded React.js Final Assessment with 10 questions.");
    } else {
      reactQuiz.questions = reactQuestions;
      reactQuiz.isPublished = true;
      await reactQuiz.save();
      console.log("Updated existing React.js Final Assessment with questions.");
    }
  }

  console.log("Quiz seeding completed successfully!");
  process.exit(0);
}

seedQuizzes().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

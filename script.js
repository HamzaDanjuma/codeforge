import { basicSetup, EditorView } from "https://esm.sh/codemirror@6.0.1";
import { javascript } from "https://esm.sh/@codemirror/lang-javascript@6.2.2";
import { oneDark } from "https://esm.sh/@codemirror/theme-one-dark@6.1.2";

const filterBtns = document.querySelectorAll(".filter-btn");
const runBtn = document.getElementById("run-btn");
const previewFrame = document.getElementById("preview-frame");

const cardContainer = document.querySelector(".card-container");

//initializing editor 
const defaultCode = ` //Edit this code and run it!
function changeHeading(){
  const el = document.getElementById("heading");
  if(el)el.style.color = "#818cf8";
  console.log("Heading color updated to indigo!")};
  changeHeading()`;

const editorView = new EditorView({
  doc: defaultCode,
  extensions: [
    basicSetup,
    javascript(),
    oneDark
  ],
  parent: document.getElementById("editor-container")
})
//COURSES LIST
const courses = [
  {
    id: 1,
    title: "Responsive Web Design with HTML & CSS",
    level: "beginner",
    rating: "4.9 (1,240)",
    description:
      "Master the box model, Flexbox, CSS Grid, and responsive web layouts by building 4 real-world projects.",
    hours: 12,
    projects: 4,
  },
  {
    id: 2,
    title: "JavaScript Deep Dive & DOM Engine",
    level: "intermediate",
    rating: "4.8 (2.100)",
    description:
      "Understand closures, async/await, event loops, and build an interactive browser-based code-runner.",
    hours: 18,
    projects: 6,
  },
  {
    id: 3,
    title: "Advanced React & State Architecture",
    level: "advanced",
    rating: "5.0 (980)",
    description:
      "Component lifecycles, custom hooks, context performance, and building full-stack reactive applications.",
    hours: 24,
    projects: 5,
  },
];
//Render logic
function renderCourses(courseList) {
  cardContainer.innerHTML = "";
  courseList.forEach((course) => {
    return cardContainer.insertAdjacentHTML(
      "beforeend",
      `<article class="course-card" data-level= ${course.level}>
          <div class="card-header">
          <span class= "course-level level-${course.level}" >${course.level}</span>
            <span class="card-rating">&#9733; ${course.rating}</span>
          </div>
          <h3 class="course-title">${course.title}</h3>
          <p class="course-description">
          ${course.description}
          </p>
          <div class="card-meta">
            <span>
              &#9201; ${course.hours} Hours
            </span>
            <span>&verbar;</span>
            <span>&#128194; ${course.projects} Projects</span>
          </div>
          <button type="button" class="btn-primary view-course">Start Course &#9654;</button>
        </article>`,
    );
  });
}
renderCourses(courses);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((btn) => btn.classList.remove("active"));
    btn.classList.add("active");
    const filterValue = btn.dataset.filter;
    // const match =
    const filteredCourse = courses.filter(
      (course) => course.level === filterValue || filterValue === "all",
    );
    renderCourses(filteredCourse);
  });
});
//run btn logic
runBtn.addEventListener("click", function () {
  executeCode();
});

// code editor
function executeCode() {
  const userCode = `<h2 id="heading">Hello CodeForge</h2>
  <script>
    ${editorView.state.doc.toString()}
  <\/script>`;
  const interceptorScript = `
  <script>
  (function(){
    const _log = console.log;
    const _error = console.error;
    console.log = function(...args){
      const message = args.map(a =>(
        typeof a ===  "object" ? JSON.stringify(a) : String(a))
      ).join(' ');

      window.parent.postMessage({type: "CONSOLE_LOG",level:'info', log : message }, '*');

      _log.apply(console, args);
    };

    console.error = function(...args){
      const message = args.map(a =>( typeof a === 'object' ? JSON.stringify(a) : String(a))).join(" ");

      window.parent.postMessage({type: 'CONSOLE_LOG', level: "error", log: message}, "*");

      _error.apply(console, args);
    }
    window.onerror = function(msg, url, line){
      window.parent.postMessage({type:"CONSOLE_LOG", level:"error", log: msg + "(Line " + line + " )"}, "*")
    };
  })();
  <\/script>
  `;

  previewFrame.srcdoc = interceptorScript + userCode;
}
executeCode();

// Recieving the Message in the Parent Window
window.addEventListener("message", (event) => {
  //check if this message was sent by our interceptor
  if (event.data && event.data.type === "CONSOLE_LOG") {
    const sandboxOutput = document.querySelector(".output-text");
    sandboxOutput.textContent = `> ${event.data.log}`;
    sandboxOutput.style.color =
      event.data.level === "error" ? "#f87171" : "#38bdf8";
  }
});

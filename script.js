let currentUser = null;

const questionBank = {
  python: [
    { q: "Which keyword is used for decision making in Python?", choices: ["if", "loop", "switch", "case"], answer: 0 },
    { q: "What is the output of: print(2 + 3)?", choices: ["5", "23", "Error", "None"], answer: 0 }
  ],
  html: [
    { q: "What does HTML stand for?", choices: ["HyperText Markup Language", "HighText Machine Language", "Hyperlinks Text Machine Language", "Home Tool Markup Language"], answer: 0 }
  ],
  css: [
    { q: "What does CSS stand for?", choices: ["Cascading Style Sheets", "Computer Style System", "Creative Style Sheets", "Colorful Style System"], answer: 0 }
  ],
  java: [
    { q: "Which keyword defines a class in Java?", choices: ["class", "define", "struct", "object"], answer: 0 }
  ]
};

let currentQuestions = [];
let score = 0;
let streak = 0;
let timerInterval;
let time = 10;

const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");

/* ---------------- LOGIN ---------------- */

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "admin" && pass === "admin123") {
    currentUser = "admin";
    loginScreen.style.display = "none";
    mainApp.style.display = "block";

    adminPanel.style.display = "block";
    topicScreen.style.display = "none"; // hide user UI
  } 
  else if (user === "user" && pass === "1234") {
    currentUser = "user";
    loginScreen.style.display = "none";
    mainApp.style.display = "block";

    adminPanel.style.display = "none";
    topicScreen.style.display = "block";
  } 
  else {
    alert("Invalid login");
  }
}

function logout() {
  currentUser = null;

  document.getElementById("mainApp").style.display = "none";
  document.getElementById("loginScreen").style.display = "block";

  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("topicScreen").style.display = "block";
}

/* ---------------- QUIZ ---------------- */

function startQuiz(topic) {
  document.getElementById("topicScreen").style.display = "none";
  document.getElementById("quizScreen").style.display = "block";

  const stored = JSON.parse(localStorage.getItem("questions")) || {};

  if (stored[topic]) {
    currentQuestions = shuffle([...stored[topic]]);
  } else {
    currentQuestions = shuffle([...(questionBank[topic] || [])]);
  }

  score = 0;
  streak = 0;

  updateStats();
  loadQuestion();
}

function loadQuestion() {
  if (currentQuestions.length === 0) {
    questionEl.textContent = "🎉 Quiz Finished!";
    choicesEl.innerHTML = "<button onclick='goBack()'>Back</button>";
    return;
  }

  const q = currentQuestions.pop();

  // 🔀 Shuffle choices while tracking correct answer
  let choices = q.choices.map((c, i) => ({ text: c, correct: i === q.answer }));
  choices = shuffle(choices);

  const correctIndex = choices.findIndex(c => c.correct);

  questionEl.textContent = q.q;
  choicesEl.innerHTML = "";
  feedbackEl.textContent = "";

  choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;

    btn.onclick = () => checkAnswer(index, correctIndex);

    choicesEl.appendChild(btn);
  });

  startTimer();
}

function checkAnswer(selected, correct) {
  clearInterval(timerInterval);

  const buttons = choicesEl.querySelectorAll("button");

  buttons.forEach((btn, index) => {
    btn.disabled = true;

    if (index === correct) {
      btn.classList.add("correct");
    }

    if (index === selected && selected !== correct) {
      btn.classList.add("wrong");
    }
  });

  if (selected === correct) {
    score += 10;
    streak++;
    feedbackEl.textContent = "✅ Correct!";
  } else {
    streak = 0;
    feedbackEl.textContent = "❌ Incorrect!";
  }

  updateStats();
  setTimeout(loadQuestion, 1200);
}

function startTimer() {
  time = 10;
  document.getElementById("timer").textContent = "⏱ " + time;

  timerInterval = setInterval(() => {
    time--;
    document.getElementById("timer").textContent = "⏱ " + time;

    if (time === 0) {
      clearInterval(timerInterval);
      streak = 0;
      updateStats();
      loadQuestion();
    }
  }, 1000);
}

function updateStats() {
  document.getElementById("score").textContent = "Score: " + score;
  document.getElementById("streak").textContent = "Streak: " + streak;
}

function goBack() {
  document.getElementById("quizScreen").style.display = "none";
  document.getElementById("topicScreen").style.display = "block";
}

function adminAddQuestion() {
  const topic = adminTopic.value.trim().toLowerCase();
  const q = adminQ.value.trim();
  const choices = [
    adminC1.value.trim(),
    adminC2.value.trim(),
    adminC3.value.trim(),
    adminC4.value.trim()
  ];
  const answer = Number(adminAns.value);

  if (!topic || !q || choices.includes("") || isNaN(answer)) {
    alert("Fill all fields correctly");
    return;
  }

  let data = JSON.parse(localStorage.getItem("questions")) || {};

  if (!data[topic]) data[topic] = [];

  data[topic].push({ q, choices, answer });

  localStorage.setItem("questions", JSON.stringify(data));

  alert("✅ Question saved! Available to all users on this device.");
}

function generateFromLesson() {
  const file = document.getElementById("fileUpload").files[0];
  const textArea = document.getElementById("lessonText").value;

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      processText(e.target.result);
    };
    reader.readAsText(file);
  } 
  else if (textArea) {
    processText(textArea);
  } 
  else {
    alert("Upload file or paste text");
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
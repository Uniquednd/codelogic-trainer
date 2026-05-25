let currentUser = null;

/* ---------------- QUESTION BANK ---------------- */

const questionBank = {

  python: [
    {
      q: "Which keyword is used for decision making in Python?",
      choices: ["if", "loop", "switch", "case"],
      answer: 0
    },

    {
      q: "What is the output of print(2 + 3)?",
      choices: ["5", "23", "Error", "None"],
      answer: 0
    }
  ],

  html: [
    {
      q: "What does HTML stand for?",
      choices: [
        "HyperText Markup Language",
        "HighText Machine Language",
        "Hyperlinks Text Machine Language",
        "Home Tool Markup Language"
      ],
      answer: 0
    }
  ],

  css: [
    {
      q: "What does CSS stand for?",
      choices: [
        "Cascading Style Sheets",
        "Computer Style System",
        "Creative Style Sheets",
        "Colorful Style System"
      ],
      answer: 0
    }
  ],

  java: [
    {
      q: "Which keyword defines a class in Java?",
      choices: ["class", "define", "struct", "object"],
      answer: 0
    }
  ]
};

/* ---------------- VARIABLES ---------------- */

let currentQuestions = [];
let currentQuestion = null;

let score = 0;
let streak = 0;

let timerInterval;
let time = 10;

/* ---------------- ELEMENTS ---------------- */

const questionEl =
  document.getElementById("question");

const choicesEl =
  document.getElementById("choices");

const feedbackEl =
  document.getElementById("feedback");

/* ---------------- LOGIN ---------------- */

function login() {

  const user =
    document.getElementById("username").value;

  const pass =
    document.getElementById("password").value;

  /* ADMIN */

  if(user === "admin" && pass === "admin123") {

    currentUser = "admin";

    document.getElementById("loginScreen")
      .style.display = "none";

    document.getElementById("mainApp")
      .style.display = "block";

    document.getElementById("adminPanel")
      .style.display = "block";

    document.getElementById("topicScreen")
      .style.display = "none";

    return;
  }

  /* USER */

  if(user === "user" && pass === "1234") {

    currentUser = "user";

    document.getElementById("loginScreen")
      .style.display = "none";

    document.getElementById("mainApp")
      .style.display = "block";

    document.getElementById("adminPanel")
      .style.display = "none";

    document.getElementById("topicScreen")
      .style.display = "block";

    return;
  }

  alert("Invalid Login");
}

/* ---------------- LOGOUT ---------------- */

function logout() {

  currentUser = null;

  document.getElementById("mainApp")
    .style.display = "none";

  document.getElementById("loginScreen")
    .style.display = "block";

  document.getElementById("quizScreen")
    .style.display = "none";

  document.getElementById("topicScreen")
    .style.display = "block";
}

/* ---------------- START QUIZ ---------------- */

function startQuiz(topic) {

  removeExpiredQuestions();

  document.getElementById("topicScreen")
    .style.display = "none";

  document.getElementById("quizScreen")
    .style.display = "block";

  const stored =
    JSON.parse(localStorage.getItem("questions"))
    || {};

  if(stored[topic]) {

    currentQuestions =
      shuffle([...stored[topic]]);

  } else {

    currentQuestions =
      shuffle([...(questionBank[topic] || [])]);
  }

  score = 0;
  streak = 0;

  updateStats();

  loadQuestion();
}

/* ---------------- LOAD QUESTION ---------------- */

function loadQuestion() {

  if(currentQuestions.length === 0) {

    questionEl.textContent =
      "🎉 Quiz Finished!";

    choicesEl.innerHTML =
      "<button onclick='goBack()'>Back</button>";

    return;
  }

  const q = currentQuestions.pop();

  currentQuestion = q;

  let choices =
    q.choices.map((c, i) => ({
      text: c,
      correct: i === q.answer
    }));

  choices = shuffle(choices);

  const correctIndex =
    choices.findIndex(c => c.correct);

  questionEl.textContent = q.q;

  choicesEl.innerHTML = "";

  feedbackEl.textContent = "";

  choices.forEach((choice, index) => {

    const btn =
      document.createElement("button");

    btn.textContent = choice.text;

    btn.onclick = () =>
      checkAnswer(index, correctIndex);

    choicesEl.appendChild(btn);
  });

  startTimer();
}

/* ---------------- CHECK ANSWER ---------------- */

function checkAnswer(selected, correct) {

  if(currentQuestion) {
    currentQuestion.attempts =
      (currentQuestion.attempts || 0) + 1;
  }

  clearInterval(timerInterval);

  const buttons =
    choicesEl.querySelectorAll("button");

  buttons.forEach((btn, index) => {

    btn.disabled = true;

    if(index === correct) {
      btn.classList.add("correct");
    }

    if(index === selected &&
       selected !== correct) {

      btn.classList.add("wrong");
    }
  });

  if(selected === correct) {

    score += 10;
    streak++;

    feedbackEl.textContent =
      "✅ Correct!";

  } else {

    streak = 0;

    feedbackEl.textContent =
      "❌ Incorrect!";
  }

  updateStats();

  setTimeout(loadQuestion, 1200);
}

/* ---------------- TIMER ---------------- */

function startTimer() {

  time = 10;

  document.getElementById("timer")
    .textContent = "⏱ " + time;

  timerInterval = setInterval(() => {

    time--;

    document.getElementById("timer")
      .textContent = "⏱ " + time;

    if(time === 0) {

      clearInterval(timerInterval);

      streak = 0;

      updateStats();

      loadQuestion();
    }

  }, 1000);
}

/* ---------------- UPDATE SCORE ---------------- */

function updateStats() {

  document.getElementById("score")
    .textContent = "Score: " + score;

  document.getElementById("streak")
    .textContent = "Streak: " + streak;
}

/* ---------------- BACK BUTTON ---------------- */

function goBack() {

  document.getElementById("quizScreen")
    .style.display = "none";

  document.getElementById("topicScreen")
    .style.display = "block";
}

/* ---------------- ADMIN ADD QUESTION ---------------- */

function adminAddQuestion() {

  const topic =
    document.getElementById("adminTopic")
    .value.toLowerCase();

  const q =
    document.getElementById("adminQ").value;

  const choices = [

    document.getElementById("adminC1").value,

    document.getElementById("adminC2").value,

    document.getElementById("adminC3").value,

    document.getElementById("adminC4").value
  ];

  const answer =
    parseInt(
      document.getElementById("adminAns").value
    );

  const maxAttempts =
    parseInt(
      document.getElementById("maxAttempts").value
    ) || 9999;

  const expireDays =
    parseInt(
      document.getElementById("expireDays").value
    ) || 9999;

  const expireDate =
    Date.now() +
    (expireDays * 24 * 60 * 60 * 1000);

  const newQuestion = {

    q: q,

    choices: choices,

    answer: answer,

    attempts: 0,

    maxAttempts: maxAttempts,

    expireDate: expireDate
  };

  let stored =
    JSON.parse(localStorage.getItem("questions"))
    || {};

  if(!stored[topic]) {
    stored[topic] = [];
  }

  stored[topic].push(newQuestion);

  localStorage.setItem(
    "questions",
    JSON.stringify(stored)
  );

  alert("Question Added Successfully!");
}

/* ---------------- REMOVE EXPIRED QUESTIONS ---------------- */

function removeExpiredQuestions() {

  let stored =
    JSON.parse(localStorage.getItem("questions"))
    || {};

  for(let topic in stored) {

    stored[topic] =
      stored[topic].filter(q => {

        const notExpired =
          Date.now() < q.expireDate;

        const attemptsLeft =
          q.attempts < q.maxAttempts;

        return notExpired && attemptsLeft;
      });
  }

  localStorage.setItem(
    "questions",
    JSON.stringify(stored)
  );
}

/* ---------------- GENERATE FROM LESSON ---------------- */

function generateFromLesson() {

  const file =
    document.getElementById("fileUpload").files[0];

  const textArea =
    document.getElementById("lessonText").value;

  if(file) {

    const reader = new FileReader();

    reader.onload = function(e) {
      processText(e.target.result);
    };

    reader.readAsText(file);

  } else if(textArea) {

    processText(textArea);

  } else {

    alert("Upload file or paste text");
  }
}

/* ---------------- PROCESS TEXT ---------------- */

function processText(text) {

  const words =
    text.split(/\s+/)
    .filter(w => w.length > 4)
    .slice(0, 10);

  let stored =
    JSON.parse(localStorage.getItem("questions"))
    || {};

  if(!stored["python"]) {
    stored["python"] = [];
  }

  words.forEach(word => {

    stored["python"].push({

      q: `What is ${word}?`,

      choices: [
        `${word} is a keyword`,
        `${word} is a variable`,
        `${word} is a function`,
        `${word} is unrelated`
      ],

      answer: 0,

      attempts: 0,

      maxAttempts: 9999,

      expireDate:
        Date.now() + (9999 * 24 * 60 * 60 * 1000)
    });
  });

  localStorage.setItem(
    "questions",
    JSON.stringify(stored)
  );

  alert("Questions Generated!");
}

/* ---------------- SHUFFLE ---------------- */

function shuffle(array) {

  for(let i = array.length - 1; i > 0; i--) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] =
      [array[j], array[i]];
  }

  return array;
}

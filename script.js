// Quiz data
let quiz = {
  score: 0,
  questions: [],
  progress: 0,
  currentQuestion: {},
  acceptingInput: true,
  selectedAnswer: "",
  categoryChosen: "",
};

let currentQuestion = quiz.currentQuestion;
let acceptingInput = quiz.acceptingInput;
let selectedAnswer = quiz.selectedAnswer;
let categoryChosen = quiz.categoryChosen;

// Custom questions with pictures
const customQuestions = [
  {
    value: "11", // Movies
    image: "./assets/devil.png",
    question: "What is the name of the movie with this poster?",
    correct_answer: "The Devil Wears Prada",
    incorrect_answers: [ "Little Nicky", "The Witch", "Legend" ],
  },
  {
    value: "12", // Music
    image: "./assets/darkside.png",
    question: "What is the name of this album?",
    correct_answer: "The Dark Side of the Moon",
    incorrect_answers: [ "False Landing", "Lovers on Earth", "Obscured by Clouds" ],
  },
  {
    value: "15", // Video Games
    image: "./assets/slycooper.png",
    question: "What are the names of the Cooper Gang?",
    correct_answer: "Sly, Bentley & Murray",
    incorrect_answers: [ "Mask, Lens & Muscle", "Ronaldo, Shellz & Doppi", "Sneak, Fred & Little" ]
  }, 
];

document.addEventListener("DOMContentLoaded", function() {
  // Page toggle elements
  const category = document.querySelectorAll('.category');
  const showElement = document.getElementById('showOnLabelClick');
  const hideElement = document.getElementById('hideOnLabelClick');
  const returnElement = document.getElementById('return');
  // Quiz elements
  const timerElement = document.getElementById('timer');
  const submitElement = document.getElementById('submit');
  const nextElement = document.getElementById('next');
  const questionElement = document.getElementById('question');
  const answersElement = document.querySelectorAll('.answer');
  const scoreElement = document.getElementById('score');
  const progressElement = document.getElementById('total_questions');
  const correctElement = document.getElementById('correct');
  const incorrectElement = document.getElementById('incorrect');
  const endElement = document.getElementById('end');
  const timeoutElement = document.getElementById('timeout');
  const imageElement = document.getElementById('photo');

  // Choosing appropriate category for custom questions
  const pickCustomQuestion = (category) => {
    for (let i = 0; i < customQuestions.length; i++) {
      if (category === customQuestions[i].value) {
        quiz.questions.push(customQuestions[i]);
        break;
      }
    }
  };

  // Push quiz objects into quiz.questions
  const quizObjects = (array) => {
    for (const object of array) {
      quiz.questions.push(object)
    }
  };

  // Get the all answers from the question object
  const getAnswers = (question) => {
    let allAnswers = [];
    allAnswers = allAnswers.concat(question.incorrect_answers);
    allAnswers.push(question.correct_answer);
    if (question.image) {
      return {
        allAnswers,
        correct: question.correct_answer,
        incorrect: true,
        image: question.image,
      }
    }
    return {
      allAnswers,
      correct: question.correct_answer
    }
  };

  // Fetch Trivia Questions
  const fetchTriviaQuestions = async () => {
    try {
      const response = await fetch(`https://opentdb.com/api.php?amount=4&category=${categoryChosen}&difficulty=easy&type=multiple`);
      const data = await response.json();
      quizObjects(data.results);
      newQuestion();
    } catch (error) {
      console.error('Error fetching trivia questions:', error);
    }
  };

  // Quiz logic
  const newQuestion = () => {
    if (quiz.progress >= 5) {
      // Toggle pages
      showElement.style.display = "none";
      hideElement.style.display = "flex";
      // Reset timer
      clearInterval(intervalId);
      resetQuizElements();
    }
    // Array of the 5 questions
    let remainingQuestions = quiz.questions;
    // Update progress
    quiz.progress++;
    progressElement.textContent = `${quiz.progress} / 5 Questions`;
    // Display score
    scoreElement.textContent = `Score: ${quiz.score}`;
    // Find question
    const index = Math.floor(Math.random() * remainingQuestions.length);
    currentQuestion = remainingQuestions[index];
    const decodedQuestion = decodeHtml(currentQuestion.question);
    questionElement.textContent = decodedQuestion;
    // Reset if previous question had image
    imageElement.style.display = "none";
    imageElement.src = "";
    // Get image if it contains one
    hasImage(currentQuestion);
    // Populate answers
    let answers = getAnswers(currentQuestion);
    answers.allAnswers = shuffleArray(answers.allAnswers);
    answersElement.forEach((answer, index) => {
      // Decode HTML entities in the answer text
      const decodedAnswer = decodeHtml(answers.allAnswers[index]);
      answer.textContent = decodedAnswer;
    });
    // Remove current question from array
    remainingQuestions.splice(index, 1);
    // Reset
    acceptingInput = true;
    correctElement.style.display = "none";
    incorrectElement.style.display = "none";
    endElement.style.display = "none";
    timeoutElement.style.display = "none";
  };

  // Function to shuffle the answers array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  // Toggle between pages
  category.forEach(label => {
    label.addEventListener('click', function() {
      if (showElement.style.display === "none") {
        //Switch pages
        showElement.style.display = "flex";
        hideElement.style.display = "none";
        // Reset quiz
        quiz = {
          score: 0,
          questions: [],
          progress: 0
        };  
        // Start/Reset timer
        timer(20);
        timerElement.style.backgroundColor = "#ebb920";
        timerElement.style.setProperty('border', '2px solid #d5a209');
        // Fetch questions
        categoryChosen = label.getAttribute("value");
        pickCustomQuestion(categoryChosen)
        fetchTriviaQuestions();
      } else {
        showElement.style.display = "none";
        hideElement.style.display = "flex";
        // Stop/Reset timer
        clearInterval(intervalId); 
      }
    });
  });

  // Timer
  const timer = (seconds) => {
    if (seconds > 0) {
      timerElement.textContent = `Timer: ${seconds}`;
      intervalId = setInterval(() => {
        seconds--;
        timerElement.textContent = `Timer: ${seconds}`;
        if (seconds <= 0) {
          // Time is up!
          clearInterval(intervalId);
          timerElement.style.backgroundColor = "#c84343";
          timerElement.style.setProperty('border', '2px solid #9b2b2b');
          timerElement.textContent = 'TIME IS UP!';
          // Remove submit button
          submitElement.style.display = "none";
          nextElement.style.display = "block";
          acceptingInput = false;
          // Timeout message
          revealAnswers(selectedAnswer);
          timeoutElement.style.display = "block";
        }
      }, 1000);
    }
  };

  // Selecting an answer
  answersElement.forEach((answer) => {
    answer.addEventListener('click', function(event) {
      if (acceptingInput) {
        selectedAnswer = event.target.innerText;
        let id = event.target.id;
        highlightSelected(id);
      } 
    });
  });

  // Highlight the selected answer
  const highlightSelected = (id) => {
    answersElement.forEach((answer) => {
      answer.style.backgroundColor = '';
      answer.style.border = '';
    });
    let selectedAnswerElement = document.getElementById(id);
    if (selectedAnswerElement) {
      selectedAnswerElement.style.backgroundColor = '#c59a18';
      selectedAnswerElement.style.border = '2px solid #aa861a';
    }
  };

  // Highlight correct/incorrect after submit/timeout
  const revealAnswers = (finalAnswer) => {
    let answers = getAnswers(currentQuestion);
    answersElement.forEach((answer) => {
      if (answer.innerText === answers.correct) {
        // Highlight the correct answer green
        answer.style.backgroundColor = '#5eba7d';
        answer.style.border = '2px solid #498a5f';
      } else if (answer.innerText === finalAnswer) {
        // Highlight the selected incorrect choice red
        answer.style.backgroundColor = '#c84343';
        answer.style.border = '2px solid #9b2b2b';
      }
    });
  };

  // Results & updating score
  const isItCorrect = (answer) => {
    let answers = getAnswers(currentQuestion);
    if (answer === answers.correct && quiz.progress >= 5) {
      quiz.score++
      correctElement.style.display = "block";
      endElement.textContent = `FINAL SCORE: ${quiz.score}`;
      endElement.style.display = "block";
    } else if (answer === answers.correct) {
      quiz.score++
      correctElement.style.display = "block";
    } else if (answer !== answers.correct && quiz.progress >= 5) {
      incorrectElement.style.display = "block";
      endElement.textContent = `FINAL SCORE: ${quiz.score}`;
      endElement.style.display = "block";
    } else {
      incorrectElement.style.display = "block";
    }
  };

  // Reset answer styles when clicking next
  const resetAnswerStyles = () => {
    answersElement.forEach((answer) => {
      answer.style.backgroundColor = '';
      answer.style.border = '';
    });
  };

  // Reset quiz elements
  const resetQuizElements = () => {
    answersElement.forEach((answer) => {
      answer.textContent = "";
    });
    questionElement.textContent = "";
  };

  // If question has image
  const hasImage = (question) => {
    if (!question.image) return
    imageElement.src = question.image;
    imageElement.style.display = "block";
  };

  // Decode html from api
  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  // Click for submit button
  submitElement.addEventListener('click', function() {
    if (selectedAnswer !== "") {
      submitElement.style.display = "none";
      nextElement.style.display = "block";
      clearInterval(intervalId);
      isItCorrect(selectedAnswer); 
      revealAnswers(selectedAnswer);
      acceptingInput = false;
    }
  });

  // Click for next button
  nextElement.addEventListener('click', function() {
    submitElement.style.display = "block";
    nextElement.style.display = "none";
    timeoutElement.style.display = "none";
    clearInterval(intervalId); 
    timer(20);
    selectedAnswer = "";
    timerElement.style.backgroundColor = "#ebb920";
    timerElement.style.setProperty('border', '2px solid #d5a209');
    resetAnswerStyles();
    newQuestion();
  });

  // Click for return button
  returnElement.addEventListener('click', function() {
    // Reset quiz
    submitElement.style.display = "block";
    nextElement.style.display = "none";
    resetAnswerStyles();
    correctElement.style.display = "none";
    incorrectElement.style.display = "none";
    endElement.style.display = "none";
    timeoutElement.style.display = "none";
    quiz = {
      score: 0,
      questions: [],
      progress: 0
    };
    currentQuestion = {};
    resetQuizElements();
  });
});
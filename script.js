// Quiz data
let quiz = {
  score: 0,
  questions: [],
  progress: 0
};

let currentQuestion = {};


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
]

// Choosing appropriate question with category
const pickCustomQuestion = (category) => {
  for (let i = 0; i < customQuestions.length; i++) {
    if (category === customQuestions[i].value) {
      quiz.questions.push(customQuestions[i]);
      break;
    }
  }
}

document.addEventListener("DOMContentLoaded", function() {
  // Page toggle elements
  const category = document.querySelectorAll('.category');
  const showElement = document.getElementById('showOnLabelClick');
  const hideElement = document.getElementById('hideOnLabelClick');
  const returnElement = document.getElementById('return');
  let categoryChosen = "";
  // Quiz elements
  const timerElement = document.getElementById('timer');
  const submitElement = document.getElementById('submit');
  const nextElement = document.getElementById('next');
  const questionElement = document.getElementById('question');
  const answersElement = document.querySelectorAll('.answer');
  const scoreElement = document.getElementById('score');
  const progressElement = document.getElementById('total_questions');


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
        image: question.image,
        proof: console.log("The image: " + question.image)
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
      console.log(quiz.questions)
      beginQuiz();
    } catch (error) {
      console.error('Error fetching trivia questions:', error);
    }
  };

  const beginQuiz = () => {
    avaliableQuestions = [...quiz.questions];
    // Update progress
    quiz.progress++;
    progressElement.textContent = `${quiz.progress} / 5 Questions`;
    // Find question
    const index = Math.floor(Math.random() * avaliableQuestions.length);
    currentQuestion = avaliableQuestions[index];
    questionElement.textContent = currentQuestion.question;
    // Populate answers
    let answers = getAnswers(currentQuestion);
    console.log("All Answers:", answers.allAnswers);
    console.log("Correct Answer:", answers.correct);
  }

  const nextQuestion = (questions) => {
    if (questions.length === 0) {
      submitElement.style.display = "none";
      nextElement.style.display = "none";
    }
  }

  // Toggle between pages + Start Quiz
  category.forEach(label => {
    label.addEventListener('click', function() {
      if (showElement.style.display === "none") {
        //Switch pages
        showElement.style.display = "flex";
        hideElement.style.display = "none";
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

  // Timer + Autofail condition
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
          // Auto-select wrong answer
          // selectWrongAnswer()
        }
      }, 1000);
    }
  };

  const selectedAnswer = () => {
    // logic + turning it yellow
  }

  const selectWrongAnswer = () => {
    // put in timer to select a wrong answer if time is up
  }

  // Click for submit button
  submitElement.addEventListener('click', function() {
    submitElement.style.display = "none";
    nextElement.style.display = "block";
    clearInterval(intervalId); 
  });

  // Click for next button
  nextElement.addEventListener('click', function() {
    submitElement.style.display = "block";
    nextElement.style.display = "none";
    clearInterval(intervalId); 
    timer(20); // Restart the timer
    timerElement.style.backgroundColor = "#ebb920";
    timerElement.style.setProperty('border', '2px solid #d5a209');
    // nextQuestion()
  });

  // Click for return button
  returnElement.addEventListener('click', function() {
    // In case timer ran out
    submitElement.style.display = "block";
    nextElement.style.display = "none";
    // Reset quiz
    quiz = {
      score: 0,
      questions: [],
      progress: 0
    }
  });
});
let words = [];
let currentWord = null;
let stats = JSON.parse(localStorage.getItem('stats')) || {};
let direction = 'de-en'; // Default direction

const directionSelect = document.getElementById('direction');
const optionsDiv = document.getElementById('options');
const questionEl = document.getElementById('question');
const scoreEl = document.getElementById('score');
const feedbackEl = document.getElementById('feedback');
const statsModal = document.getElementById('stats-modal');
const statsContainer = document.getElementById('stats');
const toggleStatsBtn = document.getElementById('toggle-stats-btn');
const closeStatsBtn = document.getElementById('close-stats-btn');

directionSelect.addEventListener('change', (e) => {
  direction = e.target.value;
  nextQuestion();
});

fetch('words.json')
  .then(res => res.json())
  .then(data => {
    words = data;
    nextQuestion();
    renderStats();
  });

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function getWeightedRandomWord(words, stats) {
  const weights = words.map(word => {
    const key = `${word.german}::${word.english}`;
    const s = stats[key] || { correct: 0, wrong: 0 };
    const total = s.correct + s.wrong;
    const difficulty = total === 0 ? 1 : (s.wrong + 1) / (total + 2);
    return difficulty;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const rand = Math.random() * totalWeight;
  let cumulative = 0;

  for (let i = 0; i < words.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return words[i];
  }

  return words[words.length - 1];
}

function getQuestionData(word, words) {
  if (direction === 'de-en') {
    return {
      question: word.german,
      correct: word.english,
      options: shuffle([
        word.english,
        ...getRandomIncorrectOptions(words, word.english, 'english')
      ])
    };
  } else {
    return {
      question: word.english,
      correct: word.german,
      options: shuffle([
        word.german,
        ...getRandomIncorrectOptions(words, word.german, 'german')
      ])
    };
  }
}

function getRandomIncorrectOptions(words, correctAnswer, field) {
  // Filter out correct answer, shuffle, then pick first 3 unique
  const filtered = words.filter(w => w[field] !== correctAnswer);
  const shuffled = shuffle(filtered);
  const options = [];
  for (let w of shuffled) {
    if (options.length >= 3) break;
    options.push(w[field]);
  }
  return options;
}

function nextQuestion() {
  if (words.length === 0) {
    questionEl.textContent = 'Loading...';
    return;
  }

  currentWord = getWeightedRandomWord(words, stats);
  const { question, correct, options } = getQuestionData(currentWord, words);

  questionEl.textContent = question;
  feedbackEl.textContent = '';
  scoreEl.textContent = `Score: ${calculateScore()}`;

  optionsDiv.innerHTML = '';
  options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.onclick = () => handleAnswer(option === correct);
    optionsDiv.appendChild(btn);
  });
}

function handleAnswer(correctAnswer) {
  const key = `${currentWord.german}::${currentWord.english}`;
  if (!stats[key]) stats[key] = { correct: 0, wrong: 0 };
  stats[key][correctAnswer ? 'correct' : 'wrong']++;

  localStorage.setItem('stats', JSON.stringify(stats));
  renderStats();

  feedbackEl.textContent = correctAnswer ? '✅ Correct!' : '❌ Wrong!';

  setTimeout(() => {
    nextQuestion();
  }, 1000);
}

function calculateScore() {
  let totalCorrect = 0;
  let totalAttempts = 0;
  for (const key in stats) {
    totalCorrect += stats[key].correct;
    totalAttempts += stats[key].correct + stats[key].wrong;
  }
  return totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);
}

function renderStats() {
  statsContainer.innerHTML = '<h3>Word Stats</h3>';

  const summary = { mastered: 0, improving: 0, difficult: 0 };
  const rows = [];

  Object.entries(stats).forEach(([key, val]) => {
    const [german, english] = key.split('::');
    const total = val.correct + val.wrong;
    const pct = total > 0 ? Math.round((val.correct / total) * 100) : 0;

    let level = '';
    let color = '';
    if (pct >= 80) {
      summary.mastered++;
      level = 'Mastered';
      color = '#4caf50';
    } else if (pct >= 50) {
      summary.improving++;
      level = 'Improving';
      color = '#ff9800';
    } else {
      summary.difficult++;
      level = 'Difficult';
      color = '#f44336';
    }

    const row = `
      <div class="stat-card">
        <div class="stat-word">${german} → ${english}</div>
        <div class="stat-bar">
          <div class="stat-fill" style="width: ${pct}%; background-color: ${color};">
            ${val.correct}/${total} (${pct}%)
          </div>
        </div>
        <div class="stat-level">${level}</div>
      </div>
    `;
    rows.push({ html: row, score: pct });
  });

  rows.sort((a, b) => a.score - b.score);

  const summaryBlock = `
    <div class="summary">
      <span>✅ Mastered: ${summary.mastered}</span>
      <span>🔁 Improving: ${summary.improving}</span>
      <span>⚠️ Difficult: ${summary.difficult}</span>
    </div>
  `;

  statsContainer.innerHTML += summaryBlock + rows.map(r => r.html).join('');
}

document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('Reset all progress?')) {
    stats = {};
    localStorage.removeItem('stats');
    renderStats();
    nextQuestion();
  }
});

toggleStatsBtn.addEventListener('click', () => {
  if (statsModal.style.display === 'block') {
    statsModal.style.display = 'none';
    toggleStatsBtn.textContent = '📊 Show Stats';
  } else {
    renderStats();
    statsModal.style.display = 'block';
    toggleStatsBtn.textContent = '📉 Hide Stats';
  }
});

closeStatsBtn.addEventListener('click', () => {
  statsModal.style.display = 'none';
  toggleStatsBtn.textContent = '📊 Show Stats';
});

window.addEventListener('click', (event) => {
  if (event.target === statsModal) {
    statsModal.style.display = 'none';
    toggleStatsBtn.textContent = '📊 Show Stats';
  }
});


document.getElementById('export-btn').addEventListener('click', () => {
  const dataStr = JSON.stringify(stats, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'langlearn_stats.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
});

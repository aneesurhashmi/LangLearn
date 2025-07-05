let words = [];
let score = 0;
let stats = JSON.parse(localStorage.getItem('wordStats') || '{}');

async function loadWords() {
  const res = await fetch('words.json');
  words = await res.json();
  showCard();
  updateScore();
}

function updateScore() {
  document.getElementById('score').textContent = `Score: ${score}`;
}

function getWeightedWord() {
  const weighted = words.flatMap(word => {
    const s = stats[word.german] || { correct: 0, wrong: 0 };
    const weight = 1 + (s.wrong - s.correct);
    return Array(Math.max(1, weight)).fill(word);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function showCard() {
  const container = document.getElementById('choices');
  const feedback = document.getElementById('feedback');
  feedback.textContent = '';

  const correct = getWeightedWord();
  document.getElementById('german-word').textContent = correct.german;

  let options = [correct.english];
  while (options.length < 3) {
    const r = words[Math.floor(Math.random() * words.length)];
    if (!options.includes(r.english)) options.push(r.english);
  }

  options.sort(() => Math.random() - 0.5);
  container.innerHTML = '';

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.onclick = () => {
      const key = correct.german;
      stats[key] = stats[key] || { correct: 0, wrong: 0 };

      if (option === correct.english) {
        document.getElementById('feedback').textContent = '✅ Correct!';
        stats[key].correct++;
        score++;
      } else {
        document.getElementById('feedback').textContent = `❌ Wrong! Correct: ${correct.english}`;
        stats[key].wrong++;
        score = Math.max(0, score - 1);
      }

      localStorage.setItem('wordStats', JSON.stringify(stats));
      updateScore();
      setTimeout(showCard, 1500);
    };
    container.appendChild(btn);
  });
}

function resetStats() {
  if (confirm("Reset all stats and score?")) {
    stats = {};
    localStorage.removeItem('wordStats');
    score = 0;
    updateScore();
    showCard();
    renderStats();
  }
}

function toggleStats() {
  const statsDiv = document.getElementById('stats');
  if (statsDiv.style.display === 'none') {
    statsDiv.style.display = 'block';
    renderStats();
  } else {
    statsDiv.style.display = 'none';
  }
}

function renderStats() {
  const statsTable = document.getElementById('stats-table');
  statsTable.innerHTML = `<table>
    <tr><th>German</th><th>Correct</th><th>Wrong</th></tr>
    ${words.map(w => {
      const s = stats[w.german] || { correct: 0, wrong: 0 };
      return `<tr><td>${w.german}</td><td>${s.correct}</td><td>${s.wrong}</td></tr>`;
    }).join('')}
  </table>`;

  renderChart();
}

function renderChart() {
  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const chartData = words.map(w => {
    const s = stats[w.german] || { correct: 0, wrong: 0 };
    return { label: w.german, value: s.wrong };
  });

  const barWidth = 20;
  const gap = 10;
  const maxVal = Math.max(...chartData.map(d => d.value)) || 1;
  chartData.forEach((d, i) => {
    const height = (d.value / maxVal) * 150;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(i * (barWidth + gap), 180 - height, barWidth, height);
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.fillText(d.label, i * (barWidth + gap), 195);
  });
}

loadWords();

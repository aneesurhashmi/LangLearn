#  LangLearn

A simple, interactive flashcard web app to help you learn **A1-level German vocabulary**. Select the correct English meaning for a German word, track your progress, and focus on words you struggle with most.

- Easily extendable to other languages

---

## ✨ Features

- ✅ Multiple-choice quiz: Choose the correct English meaning
- 📊 Smart difficulty focus: Harder words appear more often
- 💾 Progress saved in browser (localStorage)
- 📈 Word-by-word stats with visual bar chart
- 🔁 Reset stats anytime
- 🔗 Vocabulary loaded from external `words.json` (easy to update!)

---

## 📁 File Structure

```
/project-folder
│
├── index.html # Main webpage
├── style.css # Basic styling
├── script.js # Game logic
└── words.json # Vocabulary list (external data source)

```


---

## 🔧 Setup Instructions

1. **Download or clone** this repo:
   ```bash
   git clone https://github.com/aneesurhashmi/langlearn.git
   
   ```


2. Open index.html in your browser:
    - Double-click it
    - Or run with a local server (e.g. VS Code Live Server)
3. Update words.json anytime with more words:
    - Format example:
    ```
    [
        { "german": "das Haus", "english": "house" },
        { "german": "der Apfel", "english": "apple" }
    ]
    ```
    

## 📚 Word Stats

- View per-word progress (correct/wrong)
- Difficult words appear more often
- Progress stored in your browser until reset
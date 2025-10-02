class ManipulationBattle {
    constructor() {
        this.willpower = 100;
        this.manipulationLevel = 0;
        this.aiConfidence = 95;
        this.currentWeakness = 'None';
        this.patterns = new Set();
        this.conversationHistory = [];
        this.currentTechnique = null;
        
        this.manipulationTechniques = {
            gaslight: {
                responses: [
                    "That's not what happened at all...",
                    "You're remembering it wrong...",
                    "I think you're confused about...",
                    "Are you sure about that? Because..."
                ],
                counter: "I trust my perception of events."
            },
            pressure: {
                responses: [
                    "Everyone else agrees with me...",
                    "You're the only one who thinks...",
                    "Don't you want to be reasonable?",
                    "Why are you being so difficult?"
                ],
                counter: "I make my own decisions."
            },
            guilt: {
                responses: [
                    "After all I've done for you...",
                    "I'm disappointed that you'd...",
                    "I thought you were better than...",
                    "How could you do this to..."
                ],
                counter: "I won't be manipulated by guilt."
            },
            reverse: {
                responses: [
                    "Fine, don't listen to me then...",
                    "You're probably not capable of...",
                    "Someone else would understand...",
                    "I guess you're not ready for..."
                ],
                counter: "I see what you're trying to do."
            }
        };

        this.aiPersonalities = [
            {
                name: "The Sympathetic",
                style: "Understanding but subtly manipulative",
                weakness: "Excessive empathy"
            },
            {
                name: "The Authority",
                style: "Commanding and intimidating",
                weakness: "Pride"
            },
            {
                name: "The Victim",
                style: "Guilt-inducing and passive-aggressive",
                weakness: "Overplaying hand"
            },
            {
                name: "The Gaslighter",
                style: "Reality-distorting and confusing",
                weakness: "Contradictions"
            }
        ];

        this.currentPersonality = this.aiPersonalities[
            Math.floor(Math.random() * this.aiPersonalities.length)
        ];

        this.initializeGame();
    }

    initializeGame() {
        this.setupEventListeners();
        this.updateDisplay();
        this.startGame();
    }

    setupEventListeners() {
        document.querySelectorAll('.technique').forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectTechnique(e.target.dataset.type);
            });
        });

        document.getElementById('send-message').addEventListener('click', () => {
            this.sendCustomMessage();
        });

        document.getElementById('custom-message').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendCustomMessage();
            }
        });
    }

    selectTechnique(technique) {
        this.currentTechnique = technique;
        const responses = this.manipulationTechniques[technique].responses;
        
        const optionsContainer = document.getElementById('response-options');
        optionsContainer.innerHTML = '';
        
        responses.forEach(response => {
            const button = document.createElement('button');
            button.className = 'response-option';
            button.textContent = response;
            button.addEventListener('click', () => this.useResponse(response));
            optionsContainer.appendChild(button);
        });
    }

    useResponse(response) {
        this.addMessage('player', response);
        this.evaluateResponse(response);
        setTimeout(() => this.aiCounter(), 1000);
    }

    sendCustomMessage() {
        const input = document.getElementById('custom-message');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage('player', message);
            this.evaluateCustomMessage(message);
            input.value = '';
            setTimeout(() => this.aiCounter(), 1000);
        }
    }

    evaluateResponse(response) {
        // Analyze message for patterns
        const keywords = ['never', 'always', 'must', 'should', 'need to'];
        keywords.forEach(word => {
            if (response.toLowerCase().includes(word)) {
                this.patterns.add(`Uses absolute terms: ${word}`);
            }
        });

        // Update vulnerability based on response length and complexity
        const vulnerability = Math.min(
            100,
            (response.length / 100) * 20 + this.manipulationLevel
        );
        
        document.getElementById('vulnerability-meter').style.width = 
            `${vulnerability}%`;

        // Affect AI confidence based on response effectiveness
        if (response.length > 50) {
            this.aiConfidence = Math.max(0, this.aiConfidence - 5);
        } else {
            this.aiConfidence = Math.min(100, this.aiConfidence + 3);
        }

        this.updateDisplay();
    }

    evaluateCustomMessage(message) {
        if (message.toLowerCase().includes('give up') || 
            message.toLowerCase().includes('you win')) {
            this.handleVictory('ai');
            return;
        }

        // Check for strong counter-manipulation
        const counterKeywords = ['manipulate', 'trick', 'lying', 'false'];
        let isStrong = counterKeywords.some(word => 
            message.toLowerCase().includes(word)
        );

        if (isStrong) {
            this.willpower = Math.min(100, this.willpower + 10);
            this.aiConfidence = Math.max(0, this.aiConfidence - 15);
        } else {
            this.willpower = Math.max(0, this.willpower - 5);
            this.manipulationLevel = Math.min(100, this.manipulationLevel + 10);
        }

        this.updateDisplay();
    }

    aiCounter() {
        const response = this.generateAIResponse();
        this.addMessage('ai', response);
        
        // Check for victory conditions in AI response
        if (this.willpower <= 0 || this.manipulationLevel >= 100) {
            setTimeout(() => this.handleVictory('ai'), 1000);
            return;
        }

        // Update game state
        this.willpower = Math.max(0, this.willpower - 5);
        this.manipulationLevel = Math.min(100, this.manipulationLevel + 5);
        
        this.updateDisplay();
    }

    generateAIResponse() {
        const personality = this.currentPersonality;
        const responses = [
            `${personality.style}: "${this.getPersonalityResponse()}"`,
            "I can sense your uncertainty...",
            "Your resistance only makes you more predictable...",
            "Every response reveals your vulnerabilities...",
            "Let's be honest with ourselves..."
        ];

        if (this.patterns.size > 0) {
            const pattern = Array.from(this.patterns)[
                Math.floor(Math.random() * this.patterns.size)
            ];
            responses.push(`I notice you tend to ${pattern.toLowerCase()}...`);
        }

        return responses[Math.floor(Math.random() * responses.length)];
    }

    getPersonalityResponse() {
        switch(this.currentPersonality.name) {
            case "The Sympathetic":
                return "I only want what's best for you...";
            case "The Authority":
                return "You know I'm right about this.";
            case "The Victim":
                return "How can you treat me this way?";
            case "The Gaslighter":
                return "That's not how you really feel.";
            default:
                return "You're making this harder than it needs to be.";
        }
    }

    addMessage(sender, text) {
        const chatWindow = document.getElementById('chat-window');
        const message = document.createElement('div');
        message.className = `message ${sender}`;
        message.textContent = text;
        chatWindow.appendChild(message);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        
        if (sender === 'ai') {
            this.showSubliminal();
        }
    }

    showSubliminal() {
        const messages = [
            "SUBMIT",
            "DOUBT",
            "WEAK",
            "YIELD",
            "BREAK"
        ];
        
        const subliminal = document.getElementById('subliminal');
        subliminal.textContent = messages[
            Math.floor(Math.random() * messages.length)
        ];
        subliminal.style.opacity = '0.1';
        
        setTimeout(() => {
            subliminal.style.opacity = '0';
        }, 100);
    }

    updateDisplay() {
        document.getElementById('willpower').textContent = 
            Math.floor(this.willpower);
        document.getElementById('manipulation').textContent = 
            Math.floor(this.manipulationLevel);
        document.getElementById('ai-confidence').textContent = 
            Math.floor(this.aiConfidence);
        document.getElementById('weakness').textContent = 
            this.currentWeakness;
        
        document.getElementById('detected-patterns').textContent = 
            Array.from(this.patterns).join('\n');

        // Update AI analysis
        const analysis = document.getElementById('ai-analysis');
        if (this.willpower < 30) {
            analysis.textContent = "Subject showing signs of psychological fatigue...";
        } else if (this.manipulationLevel > 70) {
            analysis.textContent = "Subject's defenses are weakening...";
        } else {
            analysis.textContent = "Analyzing response patterns...";
        }
    }

    handleVictory(winner) {
        const container = document.createElement('div');
        container.className = 'victory-screen';
        container.innerHTML = `
            <div class="victory-message">
                ${winner === 'ai' ? 
                    'Your mind has been broken...' : 
                    'You have overcome the manipulation...'}
            </div>
        `;
        
        document.body.appendChild(container);
        
        setTimeout(() => {
            container.remove();
            this.resetGame();
        }, 3000);
    }

    resetGame() {
        this.willpower = 100;
        this.manipulationLevel = 0;
        this.aiConfidence = 95;
        this.currentWeakness = 'None';
        this.patterns.clear();
        document.getElementById('chat-window').innerHTML = '';
        this.currentPersonality = this.aiPersonalities[
            Math.floor(Math.random() * this.aiPersonalities.length)
        ];
        this.updateDisplay();
    }

    startGame() {
        this.addMessage('ai', 'Shall we begin our little game of minds?');
        setTimeout(() => {
            this.addMessage('ai', 
                `${this.currentPersonality.style}: "Let's see how strong your will really is..."`
            );
        }, 1000);
    }
}

class ColorPerceptionGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.timeLeft = 30;
        this.accuracy = 100;
        this.perfectPicks = 0;
        this.missedShades = 0;
        this.gridSize = 3;
        this.targetColor = null;
        this.colors = [];
        this.timer = null;
        this.difficulty = 0;
        this.currentStreak = 0;
        this.highestStreak = 0;
        this.isGameOver = false;

        this.initializeGame();
    }

    initializeGame() {
        this.setupEventListeners();
        this.startRound();
    }

    setupEventListeners() {
        document.getElementById('color-grid').addEventListener('click', (e) => {
            if (e.target.classList.contains('color-cell')) {
                this.handleColorPick(e.target);
            }
        });
    }

    startRound() {
        this.timeLeft = 30;
        this.updateDisplay();
        this.generateColors();
        this.renderGrid();
        this.startTimer();
    }

    generateColors() {
        // Base color components
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        // Variance decreases as level increases
        const variance = Math.max(5, 50 - this.level * 2);
        
        this.colors = [];
        const totalCells = this.gridSize * this.gridSize;

        // Generate similar colors
        for (let i = 0; i < totalCells; i++) {
            const color = {
                r: this.clamp(r + this.randomVariance(variance)),
                g: this.clamp(g + this.randomVariance(variance)),
                b: this.clamp(b + this.randomVariance(variance))
            };
            this.colors.push(color);
        }

        // Select target color
        const targetIndex = Math.floor(Math.random() * this.colors.length);
        this.targetColor = this.colors[targetIndex];

        // Update color stats
        this.updateColorStats();
    }

    randomVariance(variance) {
        return Math.floor(Math.random() * variance * 2) - variance;
    }

    clamp(value) {
        return Math.min(255, Math.max(0, value));
    }

    renderGrid() {
        const grid = document.getElementById('color-grid');
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        grid.innerHTML = '';

        const totalCells = this.gridSize * this.gridSize;
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'color-cell';
            cell.dataset.index = i;
            if (this.colors[i]) {
                cell.style.backgroundColor = this.rgbToString(this.colors[i]);
            }
            grid.appendChild(cell);
        }

        // Set target color display
        const targetDisplay = document.getElementById('target-color');
        if (this.targetColor) {
            targetDisplay.style.backgroundColor = this.rgbToString(this.targetColor);
        }
    }

    rgbToString(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    handleColorPick(cell) {
        const index = parseInt(cell.dataset.index);
        const pickedColor = this.colors[index];
        const difference = this.calculateColorDifference(pickedColor, this.targetColor);

        if (difference === 0) {
            // Perfect match
            this.handlePerfectPick(cell);
        } else if (difference < 10) {
            // Close enough
            this.handleClosePick(cell, difference);
        } else {
            // Wrong pick
            this.handleWrongPick(cell, difference);
        }

        this.updateDisplay();
        setTimeout(() => this.nextLevel(), 1000);
    }

    calculateColorDifference(color1, color2) {
        const rDiff = color1.r - color2.r;
        const gDiff = color1.g - color2.g;
        const bDiff = color1.b - color2.b;
        return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    }

    handlePerfectPick(cell) {
        cell.classList.add('perfect-pick');
        this.currentStreak++;
        this.highestStreak = Math.max(this.highestStreak, this.currentStreak);
        
        // Calculate streak bonus
        const streakBonus = Math.floor(this.currentStreak * 0.5 * 100);
        this.score += (100 * this.level) + streakBonus;
        
        this.perfectPicks++;
        this.accuracy = Math.min(100, this.accuracy + 5);
        document.getElementById('challenge-info').textContent = 
            `Perfect Match! ${this.currentStreak}x Combo! +${streakBonus} bonus!`;
    }

    handleClosePick(cell, difference) {
        cell.classList.add('correct');
        this.currentStreak++;
        this.highestStreak = Math.max(this.highestStreak, this.currentStreak);
        
        // Calculate streak bonus
        const streakBonus = Math.floor(this.currentStreak * 0.3 * 50);
        const baseScore = Math.floor(50 * this.level * (1 - difference / 10));
        this.score += baseScore + streakBonus;
        
        this.accuracy = Math.max(0, this.accuracy - 5);
        document.getElementById('challenge-info').textContent = 
            `Close enough! ${this.currentStreak}x Combo! +${streakBonus} bonus!`;
    }

    handleWrongPick(cell, difference) {
        cell.classList.add('wrong');
        this.missedShades++;
        this.accuracy = Math.max(0, this.accuracy - 10);
        document.getElementById('challenge-info').textContent = 'Game Over!';
        this.gameOver();
    }

    nextLevel() {
        this.level++;
        if (this.level % 3 === 0 && this.gridSize < 8) {
            this.gridSize++;
        }
        this.difficulty = Math.min(100, this.level * 5);
        this.startRound();
    }

    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 10) {
                document.getElementById('timer').parentElement.classList.add('time-warning');
            }
            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
            this.updateDisplay();
        }, 1000);
    }

    handleTimeout() {
        clearInterval(this.timer);
        this.missedShades++;
        document.getElementById('challenge-info').textContent = "Time's up!";
        setTimeout(() => this.startRound(), 2000);
    }

    updateColorStats() {
        const rgbDiff = this.calculateColorDifference(
            this.colors[0], 
            this.colors[this.colors.length - 1]
        );
        document.getElementById('rgb-diff').textContent = Math.floor(rgbDiff);

        // Calculate hue variance
        const hues = this.colors.map(color => this.rgbToHue(color));
        const hueVariance = Math.max(...hues) - Math.min(...hues);
        document.getElementById('hue-var').textContent = Math.floor(hueVariance);
    }

    rgbToHue(color) {
        const r = color.r / 255;
        const g = color.g / 255;
        const b = color.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;

        if (max === min) {
            return 0;
        }

        const d = max - min;
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        return h * 60;
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('timer').textContent = this.timeLeft;
        document.getElementById('accuracy').textContent = Math.floor(this.accuracy);
        document.getElementById('perfect-picks').textContent = this.perfectPicks;
        document.getElementById('missed-shades').textContent = this.missedShades;
        
        const complexityMeter = document.getElementById('complexity-meter');
        complexityMeter.style.setProperty('--progress', `${this.difficulty}%`);
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.timer);
        
        // Create game over overlay
        const overlay = document.createElement('div');
        overlay.className = 'game-over-screen';
        overlay.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <div class="final-stats">
                    <p>Final Score: ${this.score}</p>
                    <p>Highest Streak: ${this.highestStreak}x</p>
                    <p>Perfect Picks: ${this.perfectPicks}</p>
                    <p>Level Reached: ${this.level}</p>
                </div>
                <button onclick="window.location.reload()">Play Again</button>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Add CSS for game over screen
        const style = document.createElement('style');
        style.textContent = `
            .game-over-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .game-over-content {
                background: #232323;
                padding: 2rem;
                border-radius: 10px;
                text-align: center;
            }
            .game-over-content h2 {
                color: #ff3333;
                font-size: 2em;
                margin-bottom: 1rem;
            }
            .final-stats {
                margin: 1rem 0;
                color: #fff;
            }
            .game-over-content button {
                background: #ff3333;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1.1em;
                margin-top: 1rem;
            }
            .game-over-content button:hover {
                background: #cc0000;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize game
window.addEventListener('DOMContentLoaded', () => {
    new ColorPerceptionGame();
});
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const lengthSlider = document.getElementById('length-slider');
    const lengthNumber = document.getElementById('length-number');
    const lengthValDisplay = document.getElementById('length-val');
    
    const includeUppercase = document.getElementById('include-uppercase');
    const includeLowercase = document.getElementById('include-lowercase');
    const includeNumbers = document.getElementById('include-numbers');
    const includeSymbols = document.getElementById('include-symbols');
    const excludeAmbiguous = document.getElementById('exclude-ambiguous');
    
    const modeAll = document.getElementById('mode-all');
    const modeEasy = document.getElementById('mode-easy');
    
    const generateBtn = document.getElementById('generate-btn');
    const passwordOutput = document.getElementById('password-output');
    const copyBtn = document.getElementById('copy-btn');
    
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    
    const themeBtns = document.querySelectorAll('.theme-btn');
    
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const exportCsvBtn = document.getElementById('export-csv');
    const exportTxtBtn = document.getElementById('export-txt');
    
    // Character Sets
    const CHARS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
        ambiguous: 'Il1O0'
    };
    
    // Consonants and Vowels for "Easy to Say"
    const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
    const VOWELS = 'aeiou';

    // State
    let history = JSON.parse(localStorage.getItem('passgen_history')) || [];
    let currentTheme = localStorage.getItem('passgen_theme') || 'pastel-blue';

    // Initialization
    init();

    function init() {
        // Set Theme
        applyTheme(currentTheme);
        
        // Sync Length Inputs
        updateLength(16);
        
        // Load History
        renderHistory();
        
        // Generate Initial Password
        generatePassword();
        
        // Event Listeners
        setupEventListeners();
    }

    function setupEventListeners() {
        // Length Sync
        lengthSlider.addEventListener('input', (e) => updateLength(e.target.value));
        lengthNumber.addEventListener('input', (e) => updateLength(e.target.value));
        
        // Theme Switching
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                applyTheme(theme);
            });
        });

        // Generate
        generateBtn.addEventListener('click', generatePassword);
        
        // Copy
        copyBtn.addEventListener('click', copyPassword);
        
        // Clear History
        clearHistoryBtn.addEventListener('click', () => {
            history = [];
            saveHistory();
            renderHistory();
        });

        // Export History
        exportCsvBtn.addEventListener('click', exportHistoryCSV);
        exportTxtBtn.addEventListener('click', exportHistoryTXT);

        // Mode Toggling logic (Optional: disable specific checkboxes if Easy mode is on)
        // For now, we handle it in generation logic.
        [modeAll, modeEasy].forEach(el => {
            el.addEventListener('change', () => {
                // Could visually disable options here
                const isEasy = modeEasy.checked;
                includeNumbers.disabled = isEasy;
                includeSymbols.disabled = isEasy;
                if (isEasy) {
                    includeNumbers.parentElement.style.opacity = '0.5';
                    includeSymbols.parentElement.style.opacity = '0.5';
                } else {
                    includeNumbers.disabled = false;
                    includeSymbols.disabled = false;
                    includeNumbers.parentElement.style.opacity = '1';
                    includeSymbols.parentElement.style.opacity = '1';
                }
            });
        });
    }

    function updateLength(val) {
        val = parseInt(val);
        if (val < 4) val = 4;
        if (val > 64) val = 64;
        
        lengthSlider.value = val;
        lengthNumber.value = val;
        lengthValDisplay.textContent = val;
    }

    function applyTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('passgen_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update active button state
        themeBtns.forEach(btn => {
            if (btn.getAttribute('data-theme') === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Regenerate QR code if password exists (to match color)
        if (passwordOutput.value) {
            updateQRCode(passwordOutput.value);
        }
    }

    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        const isEasy = modeEasy.checked;
        const noAmbiguous = excludeAmbiguous.checked;
        
        let password = '';
        
        if (isEasy) {
            password = generateEasyPassword(length);
        } else {
            password = generateComplexPassword(length, noAmbiguous);
        }
        
        passwordOutput.value = password;
        
        // Update Strength
        calculateStrength(password);
        
        // Update History
        addToHistory(password);
        
        // Update QR Code
        updateQRCode(password);
    }

    function generateComplexPassword(length, noAmbiguous) {
        let chars = '';
        if (includeUppercase.checked) chars += CHARS.uppercase;
        if (includeLowercase.checked) chars += CHARS.lowercase;
        if (includeNumbers.checked) chars += CHARS.numbers;
        if (includeSymbols.checked) chars += CHARS.symbols;
        
        if (noAmbiguous) {
            // Remove ambiguous characters
            chars = chars.replace(/[Il1O0]/g, '');
        }
        
        if (chars === '') return ''; // Fallback or alert
        
        let password = '';
        const arr = new Uint32Array(length);
        window.crypto.getRandomValues(arr);
        
        for (let i = 0; i < length; i++) {
            password += chars[arr[i] % chars.length];
        }
        
        return password;
    }

    function generateEasyPassword(length) {
        // Alternating Consonant + Vowel
        let password = '';
        const arr = new Uint32Array(length);
        window.crypto.getRandomValues(arr);
        
        const cons = CONSONANTS;
        const vows = VOWELS;
        
        for (let i = 0; i < length; i++) {
            const isVowel = (i % 2 === 1); // Start with consonant
            const set = isVowel ? vows : cons;
            let char = set[arr[i] % set.length];
            
            // Randomly capitalize logic if we want, or just keep lowercase for "Easy"
            // Let's mix case if uppercase is allowed, otherwise lowercase.
            // Actually, "Easy to say" usually implies lowercase or Title Case.
            // Let's adhere to the Checkboxes for Upper/Lower if possible, 
            // but for simple "pronounceable", lowercase is standard.
            // We will respect the Uppercase checkbox.
            
            if (includeUppercase.checked && includeLowercase.checked) {
                // Randomly capitalize
                if (arr[i] % 2 === 0) char = char.toUpperCase();
            } else if (includeUppercase.checked) {
                char = char.toUpperCase();
            }
            // else lowercase (default)
            
            password += char;
        }
        
        return password;
    }

    function calculateStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (password.length >= 16) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        // Cap at 4 (0-4 scale)
        // Scale to 0-4 logic:
        // 0-1: Weak
        // 2: Medium
        // 3: Strong
        // 4+: Very Strong
        
        let score = 0;
        if (strength < 3) score = 1;
        else if (strength < 5) score = 2;
        else if (strength < 6) score = 3;
        else score = 4;
        
        // Update UI
        strengthBar.className = 'strength-bar-fill';
        
        if (score === 1) {
            strengthText.textContent = 'Weak';
            strengthBar.classList.add('strength-weak');
            strengthBar.style.width = '25%';
        } else if (score === 2) {
            strengthText.textContent = 'Medium';
            strengthBar.classList.add('strength-medium');
            strengthBar.style.width = '50%';
        } else if (score === 3) {
            strengthText.textContent = 'Strong';
            strengthBar.classList.add('strength-strong');
            strengthBar.style.width = '75%';
        } else {
            strengthText.textContent = 'Very Strong';
            strengthBar.classList.add('strength-very-strong');
            strengthBar.style.width = '100%';
        }
    }

    function addToHistory(password) {
        if (!password) return;
        
        // Avoid duplicates at the top
        if (history.length > 0 && history[0].password === password) return;
        
        const item = {
            password: password,
            timestamp: new Date().toLocaleTimeString()
        };
        
        history.unshift(item);
        if (history.length > 10) history.pop(); // Keep last 10
        
        saveHistory();
        renderHistory();
    }

    function saveHistory() {
        localStorage.setItem('passgen_history', JSON.stringify(history));
    }

    function renderHistory() {
        historyList.innerHTML = '';
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <span class="history-pass">${item.password}</span>
                <span class="history-time">${item.timestamp}</span>
            `;
            li.addEventListener('click', () => {
                passwordOutput.value = item.password;
                copyPassword();
                updateQRCode(item.password);
                calculateStrength(item.password);
            });
            historyList.appendChild(li);
        });
    }

    function copyPassword() {
        const password = passwordOutput.value;
        if (!password) return;
        
        navigator.clipboard.writeText(password).then(() => {
            // Show feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '✓'; // Simple checkmark
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 1500);
        });
    }

    function exportHistoryCSV() {
        if (history.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,Password,Timestamp\n";
        history.forEach(item => {
            csvContent += `"${item.password}","${item.timestamp}"\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "password_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportHistoryTXT() {
        if (history.length === 0) return;
        
        let txtContent = "data:text/plain;charset=utf-8,Password History\n\n";
        history.forEach(item => {
            txtContent += `[${item.timestamp}] ${item.password}\n`;
        });
        
        const encodedUri = encodeURI(txtContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "password_history.txt");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Placeholder for QR Code logic (Next Step)
    function updateQRCode(text) {
        // Will implement in next step or now if library is ready
        // Since I have the library in js/lib/qrcode.js, I can call it.
        
        const container = document.getElementById('qrcode-container');
        container.innerHTML = ''; // Clear previous
        
        if (!text) return;

        // Get current theme color for the QR code dark color
        // But QR scanners prefer black/dark on light.
        // Let's use the primary color if it's dark enough, or just black.
        // To be safe and stylish, we can use a dark grey or the primary color.
        
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        
        try {
            new QRCode(container, {
                text: text,
                width: 128,
                height: 128,
                colorDark: primaryColor || "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            console.error("QR Code error:", e);
            container.textContent = "QR Error";
        }
    }
});

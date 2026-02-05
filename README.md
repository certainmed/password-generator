# PassGen - Advanced Password Generator

A secure, offline-capable password generator built with pure HTML, CSS, and JavaScript. Designed for GitHub Pages with a modern split-screen interface and 6 beautiful pastel themes.

![PassGen Interface](https://via.placeholder.com/800x400?text=PassGen+Interface)

## Features

- **Advanced Generation:**
  - Customizable length (4-64 characters).
  - Toggles for Uppercase, Lowercase, Numbers, and Symbols.
  - "Easy to Say" mode (pronounceable passwords).
  - Ambiguous character exclusion (e.g., `l` vs `1`, `O` vs `0`).
- **Security & Privacy:**
  - **100% Client-Side:** Passwords are generated using `window.crypto.getRandomValues`.
  - No internet connection required to function.
- **Tools:**
  - **Strength Meter:** Visual indicator of password entropy.
  - **QR Code Generator:** Instantly generate QR codes for easy mobile transfer.
  - **History:** Automatically saves the last 10 passwords (stored locally).
  - **Export:** Download your password history as CSV or TXT.
- **Design:**
  - 6 Pastel Color Themes (Blue, Pink, Green, Purple, Yellow, Peach).
  - Responsive Split-Screen Layout.

## Usage

1. **Select Theme:** Click the colored circles to switch between pastel themes.
2. **Configure:** Adjust the slider for length and toggle character types on the left panel.
3. **Generate:** Click "Generate Password".
4. **Use:**
   - Copy to clipboard with the copy icon.
   - Scan the QR code to transfer to mobile.
   - View recent passwords in the History section.

## Deployment

This project is ready for **GitHub Pages**.

1. Fork or clone this repository.
2. Go to `Settings` > `Pages`.
3. Select `main` branch and `/ (root)` folder.
4. Save. Your site will be live!

## Tech Stack

- **HTML5**
- **CSS3** (Variables, Flexbox, Grid)
- **JavaScript** (ES6+)
- **Libraries:** `qrcode.js` (Included locally)

## License

MIT License

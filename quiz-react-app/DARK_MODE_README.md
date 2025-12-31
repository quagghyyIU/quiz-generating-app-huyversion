# Dark Mode Implementation

This quiz app now includes a full dark mode implementation with smooth transitions and user preference persistence.

## Features

✅ **Toggle Button**: Sun/moon icon in the header to switch between light and dark modes  
✅ **System Detection**: Automatically detects user's system preference on first visit  
✅ **Persistence**: Remembers your theme choice across browser sessions  
✅ **Smooth Transitions**: All elements transition smoothly between themes  
✅ **Complete Coverage**: All components styled for both light and dark modes  

## How It Works

### Theme System
- **CSS Custom Properties**: Uses CSS variables for all colors and theme values
- **Data Attribute**: Applies `data-theme="dark"` to the document root in dark mode
- **Context Provider**: React Context manages theme state across the app

### Theme Variables
The app uses CSS custom properties defined in `src/css/App.css`:

**Light Theme (default):**
- Background: Light grays and whites
- Text: Dark colors for good contrast
- Accent: Blue theme colors

**Dark Theme:**
- Background: Dark grays and blacks  
- Text: Light colors for readability
- Accent: Adjusted blue colors for dark backgrounds

### Implementation Details

1. **ThemeContext** (`src/ThemeContext.js`): Manages theme state and localStorage persistence
2. **DarkModeToggle** (`src/components/DarkModeToggle.js`): Toggle button component
3. **CSS Variables**: All theme colors defined as CSS custom properties
4. **Auto-detection**: Respects user's system preference (`prefers-color-scheme`)

## Usage

Simply click the sun/moon icon in the header to toggle between light and dark modes. Your preference will be saved automatically.

## File Structure

```
src/
├── ThemeContext.js              # Theme state management
├── components/
│   └── DarkModeToggle.js       # Toggle button component
└── css/
    ├── App.css                 # Main theme variables and styles
    ├── Quiz.css                # Quiz components using theme variables
    └── DarkModeToggle.css      # Toggle button styles
```

## Customizing Themes

To modify theme colors, edit the CSS custom properties in `src/css/App.css`:

```css
:root {
  --bg-primary: #f0f2f5;    /* Light theme background */
  --text-primary: #333;      /* Light theme text */
  /* ... other variables */
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;    /* Dark theme background */
  --text-primary: #e0e0e0;   /* Dark theme text */
  /* ... other variables */
}
```

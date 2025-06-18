# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a GitHub Pages personal portfolio website for Shintaro Matsumoto, showcasing work in robotics, AI, and ROV engineering. The project consists of:

- **Root directory**: Contains the main GitHub Pages configuration
- **m-shinatro/**: The main React application directory with the portfolio website

## Development Commands

All development commands should be run from the `m-shinatro/` directory:

```bash
cd m-shinatro
```

### Core Commands
- `npm start` - Runs the development server at http://localhost:3000
- `npm run build` - Builds the production-ready application 
- `npm test` - Runs the test suite in interactive watch mode
- `npm run deploy` - Deploys to GitHub Pages (runs predeploy build automatically)

### Deployment
The site is configured for GitHub Pages deployment with:
- Homepage: https://m-shintaro.github.io
- Deploy command automatically builds and deploys to gh-pages branch

## Architecture

### React Application Structure
- **Single Page Application**: All content in one main App component
- **Scroll-based Navigation**: Sections are revealed with scroll animations using `useRef` and `useEffect`
- **Interactive Elements**: Custom cursor, floating particles, and loading screen animations
- **Responsive Design**: Built with CSS Grid and Flexbox

### Key Components
- **Hero Section**: Main landing with glitch text effect and scroll indicator
- **About Section**: Three-column grid showcasing developer qualities
- **Tech Stack Section**: Categorized technology skills with icons
- **Stats Section**: GitHub stats integration and achievement cards
- **Inspirations Section**: Animated cosmic background elements

### Styling Approach
- **CSS Variables**: Uses CSS custom properties for consistent theming (colors, fonts, spacing)
- **Grid System**: Fixed grid overlay with configurable grid size for visual consistency
- **Scroll Animations**: Sections use `in-view` class toggling based on scroll position
- **Scrolling Bands**: Animated horizontal text bands between sections with different directions
- **Typography System**: Utility classes for font sizes (.text-xs to .text-9xl) and weights
- **Modern Design**: Inspired by elevatormusic.live with clean, minimalist aesthetics

## Technology Stack

- **React 19.0.0** with Create React App
- **Testing**: Jest + React Testing Library setup
- **Deployment**: GitHub Pages with gh-pages package
- **Performance**: Web Vitals monitoring included

## Development Notes

### Animation Architecture
- **Scroll Detection**: Uses `useEffect` with scroll event listeners to detect when sections enter viewport
- **Ref Management**: Each major section has its own `useRef` for precise scroll position tracking
- **Memory Management**: Scroll event listeners are properly cleaned up in useEffect return function
- **CSS Classes**: Animations triggered by adding/removing `.in-view` class to sections

### Performance Considerations
- Single-page application with all content loaded at once for smooth scrolling experience
- CSS animations preferred over JavaScript animations for better performance
- Grid overlay uses CSS gradients instead of actual DOM elements for minimal impact

### Content Structure
- **Scrolling Bands**: Four animated text bands with different themes (EXPLORE/INNOVATE, ROBOTICS/AI, AWARDS/ACHIEVEMENTS, FUTURE/INNOVATION)
- **Section Transitions**: Each section has entrance animations triggered by scroll position
- **Footer Links**: External links to GitHub, LinkedIn, and portfolio with proper target="_blank" attributes
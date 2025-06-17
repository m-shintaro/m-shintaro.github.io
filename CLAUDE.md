# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a GitHub Pages personal portfolio website for Shintaro Matsumoto, showcasing work in robotics, AI, and ROV engineering. The project consists of:

- **Root directory**: Contains the main GitHub Pages configuration
- **m-shinatra/**: The main React application directory with the portfolio website

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
- CSS-in-JS approach with separate CSS files
- Animation-heavy design with scroll-triggered effects
- Custom cursor and particle system implementations
- Responsive grid layouts throughout

## Technology Stack

- **React 19.0.0** with Create React App
- **Testing**: Jest + React Testing Library setup
- **Deployment**: GitHub Pages with gh-pages package
- **Performance**: Web Vitals monitoring included

## Development Notes

- The application uses extensive `useEffect` hooks for DOM manipulation and animations
- Scroll event listeners are properly cleaned up to prevent memory leaks
- External GitHub stats are embedded via vercel.app API
- All animations have configurable delays and timing
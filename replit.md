# Delta OS - Web-Based Operating System (v9)

## Overview
Delta OS is a web-based operating system built with React, TypeScript, and Vite, simulating a desktop environment in the browser. It features a window management system, taskbar, start menu, and various built-in applications. Key capabilities include persistent user data storage, customizable themes, and a modular application architecture with an app marketplace (Delta Store) and game loader (Delta Games). The project aims to provide a modern, highly interactive, and customizable user experience comparable to leading desktop operating systems, with a focus on web-based accessibility and rich functionality.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Foundation
Built with **React 18.3.1** and **TypeScript** for a type-safe, component-based UI. **Vite** is used for rapid development and bundling. **React Router** handles client-side routing.

### UI/UX Design
The system features a modern aesthetic with enhanced glassmorphism and transparency throughout. Windows use high transparency (45-55% opacity) with 100px backdrop blur for a premium glass effect, styled after Windows 11 search with 20px rounded corners, clean minimal title bars, and subtle window controls that appear on hover. Windows open with a spring-in bounce animation for polished interaction feedback. The floating, rounded taskbar and redesigned Start Menu (inspired by Windows 11/macOS) feature matching transparency levels with subtle glow effects for depth. All applications incorporate strong glassmorphism, gradient effects, and smooth animations. 

**Animation System**: Optimized for performance on lower-end devices including Chromebooks. Desktop icons feature staggered bounce-in animations on load with smooth hover effects. The animated background includes optimized gradient orbs (500-600px) with reduced blur (blur-xl instead of blur-3xl) that float smoothly. Particle count reduced from 50 to 20 for better performance. Windows use simple scale-in animations. All animations include GPU acceleration hints (willChange: 'transform') for smoother performance.

**shadcn/ui** (built on Radix UI) and **Tailwind CSS** are used for UI components and styling, ensuring accessibility and customizability. The login page features a premium dark theme with animated mesh gradients, floating particles, and enhanced card designs with subtle animations and improved typography.

### Core Features and Technical Implementations
- **Window Management System**: Handles window positioning, sizing, layering (z-index), and minimization/maximization. Windows use responsive sizing (50% for large screens, 55% for medium, 65% for small) with maximum dimensions of 800x600, based on viewport dimensions with reserves for the taskbar and window chrome, ensuring fit across various screen sizes (320x480 to 1920x1080+).
- **Application Architecture**: Applications are dynamically loaded React components from a central registry, promoting modularity. The system includes 25 fully functional applications across productivity, communication/AI, multimedia, and utility/system categories. A universal desktop icon pinning system allows users to pin any app or game to the desktop for quick access, with persistence across sessions. The Delta Store enables installation and management of new apps.
- **Start Menu Shortcut**: Quick access to Start Menu activated via Alt+K keyboard shortcut (changed from Ctrl+K to avoid browser conflicts).
- **Personal Notes App**: Tab-syncing note-taking application using BroadcastChannel API and localStorage. Notes sync across all browser tabs within the same browser session (local-only, not multiplayer). Formerly labeled as "Chat" but renamed to clarify its personal, local-only nature.
- **Start Menu**: Responsive Windows 11-inspired interface with search-first UX and optimized glass effect. Automatically adapts to screen sizes from 11-inch to 32-inch displays using viewport-based sizing (95vw×75vh on small screens, 85vw×70vh on medium, fixed 540×580px on large). Features a clean, minimal design with responsive grid layout (3 columns on small screens, 4 on medium, 5 on large), medium transparency (55% opacity), 40px backdrop blur (optimized for Chromebook performance), and subtle gradient overlays. Pinned app cards feature optimized styling with gradient backgrounds (white/15 to white/5), responsive icon sizing (40px small, 48px large), simple scale animations on hover (105% scale), and fast 150ms transitions. Font styling optimized for readability with 0.7rem size, tight leading, wide tracking, 90% opacity, and proper text shadows for depth. Pin buttons appear on hover with smooth fade-in. Section headers feature gradient indicators and improved badges. Search results appear above pinned apps for improved discoverability. Features pin/unpin functionality for apps and dynamic filtering. "Add Apps" is always pinned at the bottom in a dedicated "Get More Apps" section with a green gradient indicator, and cannot be unpinned.
- **Theming System**: Comprehensive customization includes light/dark mode, custom colors, backgrounds, taskbar appearance, font settings, and rounded corners, managed via CSS variables.
- **Data Persistence**: All user data, settings, and application states are stored client-side in **localStorage**. A JSON-based import/export system supports data portability. Real data integration is used for apps like Email (localStorage), System Monitor (browser APIs), and Maps (OpenStreetMap).
- **Authentication**: Simple client-side password and optional PIN-based login.
- **Sound Effects**: Web Audio API generates synthetic tones for UI feedback. Users can enable or disable sound effects via a toggle in Settings > Appearance.
- **Accessibility**: Comprehensive `data-testid` attributes are integrated for automated testing and accessibility.
- **Browser App**: Features a fully functional Sandstone proxy browser with navigation controls, Wisp protocol support, sandboxed iframe execution, and theme integration.
- **About:Blank Cloaking**: Privacy feature that allows the entire application to run inside an "about:blank" window, hiding the domain URL in the browser's address bar. Accessible via a button in Settings > Cloaking, clicking it opens a new tab displaying "about:blank" with the app running in an embedded iframe. Users can optionally apply their selected disguise (title and favicon) to the about:blank tab itself via a toggle switch. Since the iframe is same-origin, it retains full access to localStorage, preserving user sessions and data. The implementation is a simple popup with an iframe - no complex session transfer needed.
- **Taskbar**: Floating, rounded taskbar with system tray icons (WiFi, Volume, Battery) all sized consistently at w-4 h-4. Custom battery icon displays level bar with color-coded indicators (green >30%, yellow 10-30%, red <10%).

## External Dependencies

### Core Technologies
- **React**: UI library.
- **TypeScript**: Language.
- **Vite**: Build tool.

### UI & Styling Libraries
- **Tailwind CSS**: Utility-first styling.
- **Radix UI**: Accessible component primitives.
- **lucide-react**: Icon set.

### Data Management & Utilities
- **@tanstack/react-query**: Data fetching and state management.
- **date-fns** & **date-fns-tz**: Date manipulation and timezone handling.
- **sonner**: Toast notifications.
- **react-hook-form**: Form management.

### Proxy & Browser Technologies
- **Sandstone** (v0.2.0): Web proxy framework using sandboxed iframes (Browser app).
- **libcurl.js**: HTTP client library with Wisp protocol support for Sandstone.
- **astray**: CSS rewriting library for Sandstone proxy.
- **meriyah**: JavaScript parser for Sandstone code rewriting.
- **webpack** & **terser-webpack-plugin**: Used to build Sandstone library.

### External APIs & Services
- **Llama 3.3 70B Instruct API**: For the Nexora Chat AI assistant.
- **TMDB API**: For movie and TV show data in the Movies app.
- **OpenWeather API**: (Optional) for real-time weather data in the Weather app.
- **Nominatim API (OpenStreetMap)**: For real-time geocoding and location search in the Maps app.
- **OpenStreetMap Tile Service**: For displaying real maps with markers and coordinates.
- **Unsplash**: For real photo content in the Photos app.
- **Sandstone Proxy**: For the integrated web browser.

### Browser APIs
- **localStorage**: Client-side data persistence, including email storage.
- **Web Audio API**: For sound effects.
- **MediaDevices API**: For webcam access (Camera app).
- **Performance API**: For real JavaScript heap memory metrics (System Monitor).
- **Storage API**: For browser storage quota information (System Monitor).
- **Network Information API**: For connection type and downlink speed (System Monitor).
- **Battery API**: For battery level and charging status (System Monitor).

This application is entirely client-side; there are no backend services or databases configured.
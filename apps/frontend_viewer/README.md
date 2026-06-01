# Viewer Frontend
This is the frontend for the viewer interface.

## Important Note
This project must be run using custom **Webpack** due to the VAD (Voice-activity detection) library constraints.  
Please do not use Vite or other bundlers.

## Installation
1. Initialize the project by installing the dependencies:
```bash
npm install
```
2. If dependency issues occur, run:
```bash
npm audit fix 
```
3. Build and start the development server:
```bash
npm run build
npm start
```

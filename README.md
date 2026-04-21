# ElectronProjectStartup

This is a desktop utility I built with **Electron** to speed up the process of starting new Electron projects. Instead of manually creating a folder, wiring up the base files, setting up a preload script, creating a VS Code launch config, and opening the project by hand, this app handles that flow for me through a simple GUI.

The goal of this project is straightforward: create a clean new Electron starter project from a desktop app, place it in a selected directory, and open it directly in VS Code.

---

## What This Project Is

ElectronProjectStartup is a lightweight project generator for Electron applications.

I built it to automate the repetitive setup work involved in creating a new Electron app, including:
- choosing a base directory
- entering a project folder name
- generating the core starter files
- creating a `.vscode` debug configuration
- opening the new project in VS Code automatically

This project is meant to be fast, simple, and practical. It is not a general-purpose scaffolding framework or CLI replacement. It is a focused desktop tool for spinning up an Electron starter project with a working structure immediately.

---

## Tech Stack

This project is built with:

- **Electron**
- **Node.js**
- **HTML**
- **CSS**
- **Vanilla JavaScript**
- **electron-builder**

---

## Core Features

## Desktop GUI for Project Creation

The application provides a simple desktop interface where I can:
- enter a new project folder name
- choose the parent directory through a folder picker
- create the project with one button press
- get status feedback directly in the UI

The interface is intentionally minimal. I wanted the tool to do one job clearly and quickly without unnecessary steps.

---

## Folder Picker Integration

I added a native directory picker so I do not need to type paths manually.

The app uses Electron IPC to open a system folder dialog and return the selected directory back to the renderer. Once selected, the chosen base path is displayed in the UI and used as the target location for project creation.

This makes the tool more user-friendly and avoids path-entry mistakes.

---

## Project Validation

Before creating anything, the app validates the requested project name and directory.

Validation includes:
- empty name checks
- invalid Windows filename character checks
- reserved Windows name checks
- base directory existence checks
- duplicate folder checks

That keeps the utility from generating broken folders or failing halfway through because of obvious input issues.

---

## Automatic Starter File Generation

When I create a project, the app generates a working Electron starter structure automatically.

The generated files currently include:
- `package.json`
- `main.js`
- `preload.js`
- `renderer.js`
- `styles.css`
- `index.html`
- `.vscode/launch.json`

This gives me a usable Electron project immediately instead of an empty folder.

---

## Generated Project Structure

The app creates a starter project with the following structure:

MyProject/
├── .vscode/
│   └── launch.json
├── index.html
├── main.js
├── package.json
├── preload.js
├── renderer.js
└── styles.css

The generated project includes:

a BrowserWindow setup
preload wiring with context isolation enabled
a basic renderer script
a simple HTML/CSS UI
a package file with Electron configured as a dev dependency
a VS Code debug profile for launching Electron
Secure Electron Defaults

I set the starter project up using safer Electron defaults rather than enabling everything by default.

The generated Electron window uses:

contextIsolation: true
nodeIntegration: false
a separate preload.js

This keeps the starter project aligned with a more standard and safer Electron structure instead of encouraging direct renderer access to Node APIs.

VS Code Launch Support

I included automatic generation of a .vscode/launch.json file so the created project is ready to debug in VS Code immediately.

That means once the folder opens in VS Code, I already have a launch configuration prepared for starting the Electron process from the editor.

This is one of the small quality-of-life things I specifically wanted from the tool.

Automatic VS Code Launch

After creating the project files, the app attempts to open the new folder in VS Code automatically using the code command.

If the project is created successfully but VS Code cannot be launched, the app still reports that clearly. That way project creation and editor launch are treated as separate outcomes instead of failing as one opaque step.

This makes the tool more reliable and easier to troubleshoot.

IPC Structure

I used Electron’s preload and IPC model to keep the renderer isolated from direct Node access.

Preload

The preload layer exposes a small API to the renderer:

pickDirectory
createElectronProject
Main Process

The main process handles:

native dialog access
folder validation
file generation
directory creation
launching VS Code
Renderer

The renderer handles:

user input
button clicks
directory selection requests
status display
create-project flow feedback

This keeps responsibilities separated cleanly across the app.

UI Behavior

The app UI includes:

a project name field
a read-only project directory field
a create button
a status output area

The directory field is clickable and keyboard accessible, which opens the native folder picker.

The status area displays:

validation errors
creation progress
success confirmation
VS Code launch issues if they occur

I kept the interface intentionally small and focused because this is a utility app, not a multi-screen workflow.

Packaging

I configured the project to build as a portable Windows executable using electron-builder.

The packaged app includes:

a Windows portable target
a custom app icon
a defined appId
a product name of ElectronProjectStartup

This lets me build and run the utility as a standalone desktop tool instead of only through development mode.

Project Purpose

The main purpose of this project is to remove repeated setup work from my Electron workflow.

Instead of doing the same startup steps over and over, this app lets me:

create a new project folder quickly
generate a consistent starter structure
avoid missing setup files
jump directly into development inside VS Code

It is a convenience tool, but it also reflects how I like building software: small utilities that remove friction from development workflows.

Running the Project
Install dependencies
npm install
Start in development
npm start
Build Windows portable executable
npm run dist:win
Generated Starter Project Behavior

The generated starter app includes:

a basic Electron window
linked index.html, styles.css, and renderer.js
a preload file exposing an empty API object
a minimal package.json
a starting UI with a text input and button

It is intentionally simple. The goal is to produce a clean baseline project that is ready to expand rather than a bloated template.

Main Files in This Project
main.js
Main Electron process logic, IPC handlers, file generation, validation, and VS Code launch flow
preload.js
Safe API bridge between the renderer and main process
renderer.js
Renderer-side UI logic for selecting directories and creating projects
index.html
Main utility UI layout
styles.css
Styling for the desktop interface
package.json
Project scripts, Electron config, and build setup
build/icon.ico
Windows application icon
What This Project Demonstrates

This project shows my ability to build:

practical Electron desktop tools
file and folder automation workflows
IPC-based Electron architecture
validation-driven user flows
native dialog integration
code generation utilities
packaged desktop applications for Windows

It also shows that I am comfortable building software that is meant to improve developer workflow, not just end-user consumer apps.

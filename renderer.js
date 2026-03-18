const projectNameInput = document.getElementById("projectName");
const projectDirectoryInput = document.getElementById("projectDirectory");
const createProjectBtn = document.getElementById("createProjectBtn");
const statusText = document.getElementById("statusText");

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
  statusText.classList.toggle("success", !isError && message.trim().length > 0);
}

async function pickDirectory() {
  try {
    const result = await window.electronAPI.pickDirectory();

    if (!result.canceled && result.directoryPath) {
      projectDirectoryInput.value = result.directoryPath;
      setStatus("");
    }
  } catch (error) {
    setStatus(error.message || "Failed to open folder picker.", true);
  }
}

async function createProject() {
  const folderName = projectNameInput.value.trim();
  const baseDirectory = projectDirectoryInput.value.trim();

  if (!folderName) {
    setStatus("Please enter a project folder name.", true);
    return;
  }

  if (!baseDirectory) {
    setStatus("Please choose a base directory.", true);
    return;
  }

  createProjectBtn.disabled = true;
  createProjectBtn.textContent = "Creating...";
  setStatus("Creating project files and opening VS Code...");

  try {
    const result = await window.electronAPI.createElectronProject(
      folderName,
      baseDirectory,
    );

    if (result.success) {
      setStatus(`Project created successfully:\n${result.projectPath}`);
      projectNameInput.value = "";
    } else {
      setStatus(result.error || "Something went wrong.", true);
    }
  } catch (error) {
    setStatus(error.message || "Unexpected error.", true);
  } finally {
    createProjectBtn.disabled = false;
    createProjectBtn.textContent = "Create Project";
  }
}

projectDirectoryInput.addEventListener("click", pickDirectory);

projectDirectoryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    pickDirectory();
  }
});

createProjectBtn.addEventListener("click", createProject);

projectNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    createProject();
  }
});

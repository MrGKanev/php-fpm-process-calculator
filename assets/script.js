document.addEventListener("DOMContentLoaded", function () {
  // Constants for localStorage
  const STORAGE_KEY = "phpFpmCalculatorSettings";

  // Function to validate numeric input
  function validateInput(input) {
    input.value = input.value.replace(/[^0-9.]/g, "");
  }

  // Apply validateInput to all number inputs
  document.querySelectorAll('input[type="number"]').forEach(function (input) {
    input.addEventListener("input", function () {
      validateInput(this);
    });
  });

  // Save current settings to localStorage
  function saveSettings() {
    const settings = {
      ramTotal: document.getElementById("ram-total").value,
      ramReserved: document.getElementById("ram-reserved").value,
      ramBuffer: document.getElementById("ram-buffer").value,
      processSize: document.getElementById("process-size").value,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      // Silent failure - localStorage might be disabled or full
    }
  }

  // Load settings from localStorage
  function loadSettings() {
    try {
      const savedSettingsStr = localStorage.getItem(STORAGE_KEY);

      if (savedSettingsStr) {
        const settings = JSON.parse(savedSettingsStr);

        // Apply saved settings to form elements one by one
        document.getElementById("ram-total").value = settings.ramTotal || 4;
        document.getElementById("ram-total-val").value = settings.ramTotal || 4;

        document.getElementById("ram-reserved").value =
          settings.ramReserved || 1;
        document.getElementById("ram-reserved-val").value =
          settings.ramReserved || 1;

        document.getElementById("ram-buffer").value = settings.ramBuffer || 10;
        document.getElementById("ram-buffer-val").value =
          settings.ramBuffer || 10;

        document.getElementById("process-size").value =
          settings.processSize || 32;
        document.getElementById("process-size-val").value =
          settings.processSize || 32;

        return true;
      }
    } catch (e) {
      // Silent failure - localStorage might be disabled or data corrupt
    }

    return false;
  }

  // Main function to update all fields
  function updateFields() {
    let ramTotal = parseFloat(document.getElementById("ram-total").value);
    let ramReserved = parseFloat(document.getElementById("ram-reserved").value);
    let ramBuffer = parseFloat(document.getElementById("ram-buffer").value);
    let processSize = parseFloat(document.getElementById("process-size").value);

    // Ensure reserved RAM doesn't exceed total RAM
    if (ramReserved > ramTotal) {
      ramReserved = ramTotal;
      document.getElementById("ram-reserved").value = ramTotal;
      document.getElementById("ram-reserved-val").value = ramTotal;
    }

    // Update display values
    document.getElementById("ram-total-val").value = ramTotal;
    document.getElementById("ram-reserved-val").value = ramReserved;
    document.getElementById("ram-buffer-val").value = ramBuffer;
    document.getElementById("process-size-val").value = processSize;

    // Calculate available RAM
    const buffer = 1 - ramBuffer / 100;
    const availableRam =
      Math.round((ramTotal - ramReserved) * buffer * 10) / 10;
    const availableRamMb = Math.round(availableRam * 1024);

    // Calculate PHP-FPM process settings
    const maxChildren = Math.floor(availableRamMb / processSize);
    const startServers = Math.floor(maxChildren * 0.25);
    const minSpare = Math.floor(maxChildren * 0.25);
    const maxSpare = Math.floor(maxChildren * 0.75);

    // Update result fields
    document.getElementById("ram-available").value = availableRam;
    document.getElementById("ram-available-mb").value = availableRamMb;
    document.getElementById("max-children").value = maxChildren;
    document.getElementById("start-servers").value = startServers;
    document.getElementById("min-spare").value = minSpare;
    document.getElementById("max-spare").value = maxSpare;

    // Generate configuration text for copy/paste
    generateConfigCopy();

    // Save settings to localStorage after a short delay (throttling)
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(saveSettings, 500);
  }

  // Function to generate the configuration text
  function generateConfigCopy() {
    const configText = `
pm.max_children = ${document.getElementById("max-children").value}
pm.start_servers = ${document.getElementById("start-servers").value}
pm.min_spare_servers = ${document.getElementById("min-spare").value}
pm.max_spare_servers = ${document.getElementById("max-spare").value}
`;
    document.getElementById("copyPasteArea").value = configText.trim();
  }

  // Function to copy text to clipboard
  function copyToClipboard() {
    const copyText = document.getElementById("copyPasteArea");
    copyText.select();
    document.execCommand("copy");
    alert("Copied to clipboard successfully.");
  }

  // Add event listeners to sliders and inputs
  const inputIds = ["ram-total", "ram-reserved", "ram-buffer", "process-size"];

  inputIds.forEach((id) => {
    const slider = document.getElementById(id);
    const valueInput = document.getElementById(`${id}-val`);

    // Update when slider changes
    slider.addEventListener("input", updateFields);
    slider.addEventListener("change", updateFields);

    // Update when value input changes
    valueInput.addEventListener("input", function () {
      slider.value = this.value;
      updateFields();
    });

    valueInput.addEventListener("change", function () {
      slider.value = this.value;
      updateFields();
    });
  });

  // Copy button event listener
  document
    .getElementById("buttonCopy")
    .addEventListener("click", copyToClipboard);

  // First try to load saved settings
  loadSettings();

  // Initial calculation on page load
  updateFields();

  // Add a subtle indicator that localStorage is working
  const container = document.querySelector(".container");
  const notice = document.createElement("div");
  notice.className =
    "bg-blue-500 text-white px-4 py-2 rounded-md mb-4 text-center";
  notice.textContent =
    "Your settings will be remembered when you return to this page";

  // Insert the notice at the top of the container
  if (container && container.firstChild) {
    container.insertBefore(notice, container.firstChild);

    // Auto-hide the notice after 5 seconds
    setTimeout(() => {
      notice.style.opacity = "0";
      notice.style.transition = "opacity 1s ease-out";

      // Remove from DOM after fade out
      setTimeout(() => {
        notice.remove();
      }, 1000);
    }, 5000);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Constants for localStorage
  const STORAGE_KEY_PREFIX = "phpFpmCalculatorSettings_";
  const DEFAULT_POOL = "www";

  // Data structure for storing pool configurations
  let pools = {};
  let currentPool = DEFAULT_POOL;

  // Function to get storage key for a specific pool
  function getStorageKey(poolName) {
    return STORAGE_KEY_PREFIX + poolName;
  }

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
      // Additional PHP-FPM parameters
      maxRequests: document.getElementById("max-requests").value,
      processIdleTimeout: document.getElementById("process-idle-timeout").value,
      maxSpawnRate: document.getElementById("max-spawn-rate").value,
      statusPath: document.getElementById("status-path").value,
    };

    try {
      localStorage.setItem(
        getStorageKey(currentPool),
        JSON.stringify(settings)
      );
      // Also save the list of pools
      localStorage.setItem(
        STORAGE_KEY_PREFIX + "pools",
        JSON.stringify(Object.keys(pools))
      );
    } catch (e) {
      console.error("Failed to save settings:", e);
      // Silent failure - localStorage might be disabled or full
    }
  }

  // Load settings from localStorage
  function loadSettings(poolName) {
    try {
      const savedSettingsStr = localStorage.getItem(getStorageKey(poolName));

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

        // Additional PHP-FPM parameters
        document.getElementById("max-requests").value =
          settings.maxRequests || 0;
        document.getElementById("process-idle-timeout").value =
          settings.processIdleTimeout || 10;
        document.getElementById("max-spawn-rate").value =
          settings.maxSpawnRate || 32;
        document.getElementById("status-path").value =
          settings.statusPath || "/status";

        return true;
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
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
    const maxRequests = document.getElementById("max-requests").value;
    const processIdleTimeout = document.getElementById(
      "process-idle-timeout"
    ).value;
    const maxSpawnRate = document.getElementById("max-spawn-rate").value;
    const statusPath = document.getElementById("status-path").value;

    let configText = `[${currentPool}]
pm = dynamic
pm.max_children = ${document.getElementById("max-children").value}
pm.start_servers = ${document.getElementById("start-servers").value}
pm.min_spare_servers = ${document.getElementById("min-spare").value}
pm.max_spare_servers = ${document.getElementById("max-spare").value}`;

    // Add additional parameters only if they're not empty
    if (maxRequests && maxRequests !== "0") {
      configText += `\npm.max_requests = ${maxRequests}`;
    }

    if (processIdleTimeout) {
      configText += `\npm.process_idle_timeout = ${processIdleTimeout}s`;
    }

    if (maxSpawnRate) {
      configText += `\npm.max_spawn_rate = ${maxSpawnRate}`;
    }

    if (statusPath) {
      configText += `\npm.status_path = ${statusPath}`;
    }

    // Update the hidden textarea for copying
    document.getElementById("copyPasteArea").value = configText.trim();

    // Update the visible code preview with syntax highlighting
    const codePreview = document.getElementById("codePreview");
    if (codePreview) {
      codePreview.textContent = configText.trim();
    }
  }

  // Function to copy text to clipboard with visual feedback
  function copyToClipboard() {
    const copyText = document.getElementById("copyPasteArea");
    copyText.select();
    document.execCommand("copy");

    // Get copy button
    const copyButton = document.getElementById("buttonCopy");
    const originalText = copyButton.textContent;

    // Show success feedback
    copyButton.textContent = "✓ Copied!";
    copyButton.classList.add("bg-green-500");
    copyButton.classList.remove("bg-blue-500");

    // Reset button after 2 seconds
    setTimeout(() => {
      copyButton.textContent = originalText;
      copyButton.classList.remove("bg-green-500");
      copyButton.classList.add("bg-blue-500");
    }, 2000);
  }

  // Add a new pool
  function addNewPool() {
    document.getElementById("pool-name-container").classList.remove("hidden");
  }

  // Save a new pool
  function savePoolName() {
    const poolNameInput = document.getElementById("pool-name");
    const poolName = poolNameInput.value.trim();

    if (!poolName) {
      alert("Please enter a valid pool name");
      return;
    }

    // Add to pools object if it doesn't exist
    if (!pools[poolName]) {
      pools[poolName] = true;

      // Add to dropdown
      const option = document.createElement("option");
      option.value = poolName;
      option.textContent = poolName;
      document.getElementById("current-pool").appendChild(option);

      // Select the new pool
      document.getElementById("current-pool").value = poolName;
      switchPool(poolName);
    }

    // Hide the input container
    document.getElementById("pool-name-container").classList.add("hidden");
    poolNameInput.value = "";
  }

  // Switch to a different pool
  function switchPool(poolName) {
    // Save current settings before switching
    saveSettings();

    // Update current pool
    currentPool = poolName;

    // Update UI to show current pool
    document.getElementById(
      "current-pool-name"
    ).textContent = `Current Pool: ${poolName}`;

    // Load settings for the selected pool
    const hasSettings = loadSettings(poolName);

    // If no settings found, use defaults
    if (!hasSettings) {
      resetToDefaults();
    }

    // Update calculations
    updateFields();
  }

  // Reset to default values
  function resetToDefaults() {
    document.getElementById("ram-total").value = 4;
    document.getElementById("ram-total-val").value = 4;
    document.getElementById("ram-reserved").value = 1;
    document.getElementById("ram-reserved-val").value = 1;
    document.getElementById("ram-buffer").value = 10;
    document.getElementById("ram-buffer-val").value = 10;
    document.getElementById("process-size").value = 32;
    document.getElementById("process-size-val").value = 32;

    // Additional PHP-FPM parameters
    document.getElementById("max-requests").value = 0;
    document.getElementById("process-idle-timeout").value = 10;
    document.getElementById("max-spawn-rate").value = 32;
    document.getElementById("status-path").value = "/status";
  }

  // Load saved pools from localStorage
  function loadSavedPools() {
    try {
      const savedPoolsStr = localStorage.getItem(STORAGE_KEY_PREFIX + "pools");

      if (savedPoolsStr) {
        const savedPools = JSON.parse(savedPoolsStr);

        // Add each saved pool to the dropdown
        const poolSelect = document.getElementById("current-pool");

        savedPools.forEach((poolName) => {
          if (poolName !== DEFAULT_POOL) {
            pools[poolName] = true;

            const option = document.createElement("option");
            option.value = poolName;
            option.textContent = poolName;
            poolSelect.appendChild(option);
          }
        });

        return true;
      }
    } catch (e) {
      console.error("Failed to load saved pools:", e);
    }

    return false;
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

  // Add event listeners for additional PHP-FPM parameters
  const additionalParams = [
    "max-requests",
    "process-idle-timeout",
    "max-spawn-rate",
    "status-path",
  ];
  additionalParams.forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", function () {
      updateFields();
    });
    input.addEventListener("change", function () {
      updateFields();
    });
  });

  // Pool management event listeners
  document.getElementById("add-pool").addEventListener("click", addNewPool);
  document
    .getElementById("save-pool-name")
    .addEventListener("click", savePoolName);
  document
    .getElementById("current-pool")
    .addEventListener("change", function () {
      switchPool(this.value);
    });

  // Copy button event listener
  document
    .getElementById("buttonCopy")
    .addEventListener("click", copyToClipboard);

  // Initialize pools object with default pool
  pools[DEFAULT_POOL] = true;

  // Load saved pools
  loadSavedPools();

  // First try to load saved settings for default pool
  loadSettings(currentPool);

  // Initial calculation on page load
  updateFields();

  // FAQ Accordion functionality
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", function () {
      // Toggle the active class on the question
      this.classList.toggle("active");

      // Find the associated answer
      const answer = this.nextElementSibling;

      // Toggle the answer visibility
      if (answer.classList.contains("hidden")) {
        answer.classList.remove("hidden");
        this.querySelector(".faq-arrow").classList.add("rotate-180");
      } else {
        answer.classList.add("hidden");
        this.querySelector(".faq-arrow").classList.remove("rotate-180");
      }
    });
  });
});

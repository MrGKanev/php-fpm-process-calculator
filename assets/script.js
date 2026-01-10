document.addEventListener("DOMContentLoaded", function () {
  // Constants for localStorage
  const STORAGE_KEY_PREFIX = "phpFpmCalculatorSettings_";
  const DEFAULT_POOL = "www";
  const DARK_MODE_KEY = "phpFpmCalculatorDarkMode";

  // Data structure for storing pool configurations
  let pools = {};
  let currentPool = DEFAULT_POOL;
  let pmMode = "dynamic"; // Default PM mode

  // Scoped timeout variable (not on window)
  let saveTimeout = null;

  // Initialize dark mode with system preference detection
  function initDarkMode() {
    const savedPreference = localStorage.getItem(DARK_MODE_KEY);
    let darkMode;

    if (savedPreference !== null) {
      // Use saved preference
      darkMode = savedPreference === "true";
    } else {
      // Check system preference
      darkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    applyDarkMode(darkMode);

    // Listen for system preference changes
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        // Only auto-switch if user hasn't set a preference
        if (localStorage.getItem(DARK_MODE_KEY) === null) {
          applyDarkMode(e.matches);
        }
      });
    }
  }

  // Apply dark mode state
  function applyDarkMode(isDark) {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    updateDarkModeButton(isDark);
  }

  // Toggle dark mode
  function toggleDarkMode() {
    const isDark = !document.documentElement.classList.contains("dark");
    localStorage.setItem(DARK_MODE_KEY, isDark.toString());
    applyDarkMode(isDark);
  }

  // Update dark mode button text and icons
  function updateDarkModeButton(isDark) {
    const darkModeText = document.getElementById("dark-mode-text");
    if (darkModeText) {
      darkModeText.textContent = isDark ? "Light Mode" : "Dark Mode";
    }
  }

  // Apply dark mode on load
  initDarkMode();

  // Toast notification system
  function showToast(message, type = "info") {
    // Remove existing toast
    const existingToast = document.getElementById("toast-notification");
    if (existingToast) {
      existingToast.remove();
    }

    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      warning: "bg-yellow-500",
      info: "bg-blue-500",
    };

    const toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 transform transition-all duration-300 translate-y-0 opacity-100`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "polite");

    // Create icon using DOM methods (safe)
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "w-5 h-5");
    icon.setAttribute("fill", "currentColor");
    icon.setAttribute("viewBox", "0 0 20 20");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (type === "success") {
      path.setAttribute("fill-rule", "evenodd");
      path.setAttribute("clip-rule", "evenodd");
      path.setAttribute(
        "d",
        "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      );
    } else if (type === "error") {
      path.setAttribute("fill-rule", "evenodd");
      path.setAttribute("clip-rule", "evenodd");
      path.setAttribute(
        "d",
        "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      );
    } else if (type === "warning") {
      path.setAttribute("fill-rule", "evenodd");
      path.setAttribute("clip-rule", "evenodd");
      path.setAttribute(
        "d",
        "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      );
    } else {
      path.setAttribute("fill-rule", "evenodd");
      path.setAttribute("clip-rule", "evenodd");
      path.setAttribute(
        "d",
        "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      );
    }
    icon.appendChild(path);

    const text = document.createElement("span");
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Function to get storage key for a specific pool
  function getStorageKey(poolName) {
    return STORAGE_KEY_PREFIX + poolName;
  }

  // Function to validate numeric input
  function validateInput(input) {
    input.value = input.value.replace(/[^0-9.]/g, "");
  }

  // Validate pool name
  function validatePoolName(name) {
    // Only allow alphanumeric, underscore, and hyphen
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!name || name.length === 0) {
      return { valid: false, message: "Pool name cannot be empty" };
    }
    if (name.length > 50) {
      return { valid: false, message: "Pool name is too long (max 50 characters)" };
    }
    if (!validPattern.test(name)) {
      return {
        valid: false,
        message: "Pool name can only contain letters, numbers, underscores, and hyphens",
      };
    }
    if (pools[name]) {
      return { valid: false, message: "A pool with this name already exists" };
    }
    return { valid: true };
  }

  // Apply validateInput to all number inputs
  document.querySelectorAll("input[type=\"number\"]").forEach(function (input) {
    input.addEventListener("input", function () {
      validateInput(this);
    });
  });

  // Validation warnings system
  function validateConfiguration(ramTotal, ramReserved, ramBuffer, processSize, maxChildren) {
    const warnings = [];
    const availableRam = ramTotal - ramReserved;

    // Warning: Reserved RAM is too high
    if (ramReserved / ramTotal > 0.5) {
      warnings.push(
        "Reserved RAM is more than 50% of total RAM. This may leave too little memory for PHP-FPM processes."
      );
    }

    // Warning: RAM buffer is too low
    if (ramBuffer < 5) {
      warnings.push("RAM buffer is below 5%. Consider leaving more headroom for system stability.");
    }

    // Warning: RAM buffer is too high
    if (ramBuffer > 30) {
      warnings.push("RAM buffer is above 30%. You may be underutilizing your server resources.");
    }

    // Warning: Process size seems too small
    if (processSize < 16) {
      warnings.push(
        "Process size below 16MB is unusual for PHP applications. Verify this is correct."
      );
    }

    // Warning: Process size seems very large
    if (processSize > 256) {
      warnings.push(
        "Process size above 256MB is very high. This may indicate memory leaks or inefficient code."
      );
    }

    // Warning: Too few max_children
    if (maxChildren < 5) {
      warnings.push(
        "Less than 5 max_children may not handle traffic spikes well. Consider increasing RAM or reducing process size."
      );
    }

    // Warning: Available RAM is very low
    if (availableRam < 1) {
      warnings.push(
        "Less than 1GB available RAM is very tight. Consider increasing total RAM or reducing reserved RAM."
      );
    }

    // Warning: Too many processes for RAM
    const estimatedMemoryUsage = (maxChildren * processSize) / 1024;
    if (estimatedMemoryUsage > availableRam * 0.9) {
      warnings.push(
        "Estimated memory usage exceeds 90% of available RAM. Risk of out-of-memory errors."
      );
    }

    return warnings;
  }

  // Display warnings in UI
  function displayWarnings(warnings) {
    const warningContainer = document.getElementById("warning-container");
    const warningList = document.querySelector("#warning-list ul");

    if (warnings.length === 0) {
      warningContainer.classList.add("hidden");
      return;
    }

    warningContainer.classList.remove("hidden");
    warningList.textContent = ""; // Clear safely

    warnings.forEach(warning => {
      const li = document.createElement("li");
      li.textContent = warning;
      warningList.appendChild(li);
    });
  }

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
      pmMode: pmMode,
    };

    try {
      localStorage.setItem(getStorageKey(currentPool), JSON.stringify(settings));
      // Also save the list of pools
      localStorage.setItem(STORAGE_KEY_PREFIX + "pools", JSON.stringify(Object.keys(pools)));
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

        document.getElementById("ram-reserved").value = settings.ramReserved || 1;
        document.getElementById("ram-reserved-val").value = settings.ramReserved || 1;

        document.getElementById("ram-buffer").value = settings.ramBuffer || 10;
        document.getElementById("ram-buffer-val").value = settings.ramBuffer || 10;

        document.getElementById("process-size").value = settings.processSize || 32;
        document.getElementById("process-size-val").value = settings.processSize || 32;

        // Additional PHP-FPM parameters
        document.getElementById("max-requests").value = settings.maxRequests || 0;
        document.getElementById("process-idle-timeout").value = settings.processIdleTimeout || 10;
        document.getElementById("max-spawn-rate").value = settings.maxSpawnRate || 32;
        document.getElementById("status-path").value = settings.statusPath || "/status";

        // Load PM mode if available
        if (settings.pmMode) {
          pmMode = settings.pmMode;
          updatePmModeUI();
        }

        return true;
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
      // Silent failure - localStorage might be disabled or data corrupt
    }

    return false;
  }

  // Function to update PM mode UI display
  function updatePmModeUI() {
    // Update PM mode selector if it exists
    const pmModeSelector = document.getElementById("pm-mode");
    if (pmModeSelector) {
      pmModeSelector.value = pmMode;
    }
    // Update radio buttons
    const radios = document.querySelectorAll("input[name=\"pm-mode\"]");
    radios.forEach(radio => {
      radio.checked = radio.value === pmMode;
    });
  }

  // Function to toggle PM mode between dynamic and static
  function togglePmMode(mode) {
    pmMode = mode;
    updateFields();
  }

  // Calculate optimal realpath_cache settings based on server size and available RAM
  function calculateOptimalRealpathCache(processSize, availableRamMb) {
    let baseCacheSize = Math.min(4096, Math.max(256, Math.floor(processSize * 2)));

    if (availableRamMb > 8192) {
      baseCacheSize = Math.max(baseCacheSize, 4096);
    } else if (availableRamMb > 4096) {
      baseCacheSize = Math.max(baseCacheSize, 2048);
    } else if (availableRamMb > 2048) {
      baseCacheSize = Math.max(baseCacheSize, 1024);
    }

    return {
      realpathCacheSize: baseCacheSize + "k",
      realpathCacheTTL: 120,
    };
  }

  // Calculate estimated concurrent users
  function calculateConcurrentUsers(maxChildren) {
    return maxChildren;
  }

  // Calculate memory leak impact
  function calculateMemoryLeakImpact(maxChildren, availableRamMb) {
    if (!maxChildren || maxChildren <= 0 || !availableRamMb || availableRamMb <= 0) {
      return "N/A";
    }

    const leakRateMbPerHour = maxChildren * 1;
    const hoursUntilFull = availableRamMb / leakRateMbPerHour;

    if (hoursUntilFull < 24) {
      return `~${Math.round(hoursUntilFull)} hours`;
    } else {
      return `~${Math.round(hoursUntilFull / 24)} days`;
    }
  }

  // Calculate burst traffic capacity
  function calculateBurstCapacity(maxChildren) {
    if (!maxChildren || maxChildren <= 0) {
      return "N/A";
    }

    const requestsPerSecond = maxChildren * 10;

    if (requestsPerSecond < 1000) {
      return `~${requestsPerSecond} req/s`;
    } else {
      return `~${(requestsPerSecond / 1000).toFixed(1)}k req/s`;
    }
  }

  // Improved calculation function
  function updateFields() {
    let ramTotal = parseFloat(document.getElementById("ram-total").value);
    let ramReserved = parseFloat(document.getElementById("ram-reserved").value);
    let ramBuffer = parseFloat(document.getElementById("ram-buffer").value);
    let processSize = parseFloat(document.getElementById("process-size").value);

    if (ramReserved > ramTotal) {
      ramReserved = ramTotal;
      document.getElementById("ram-reserved").value = ramTotal;
      document.getElementById("ram-reserved-val").value = ramTotal;
    }

    document.getElementById("ram-total-val").value = ramTotal;
    document.getElementById("ram-reserved-val").value = ramReserved;
    document.getElementById("ram-buffer-val").value = ramBuffer;
    document.getElementById("process-size-val").value = processSize;

    const buffer = 1 - ramBuffer / 100;
    const availableRam = Math.round((ramTotal - ramReserved) * buffer * 10) / 10;
    const availableRamMb = Math.round(availableRam * 1024);

    const maxChildren = Math.floor(availableRamMb / processSize);

    let startServers, minSpare, maxSpare;

    if (pmMode === "static") {
      startServers = maxChildren;
      minSpare = maxChildren;
      maxSpare = maxChildren;
    } else {
      startServers = Math.floor(maxChildren * 0.3);
      minSpare = startServers;
      maxSpare = Math.floor(maxChildren * 0.8);
    }

    document.getElementById("ram-available").value = availableRam;
    document.getElementById("ram-available-mb").value = availableRamMb;
    document.getElementById("max-children").value = maxChildren;
    document.getElementById("start-servers").value = startServers;
    document.getElementById("min-spare").value = minSpare;
    document.getElementById("max-spare").value = maxSpare;

    const realpathCacheSizeField = document.getElementById("realpath-cache-size");
    const realpathCacheTtlField = document.getElementById("realpath-cache-ttl");

    if (realpathCacheSizeField && realpathCacheTtlField) {
      const { realpathCacheSize, realpathCacheTTL } = calculateOptimalRealpathCache(
        processSize,
        availableRamMb
      );
      realpathCacheSizeField.value = realpathCacheSize;
      realpathCacheTtlField.value = realpathCacheTTL;
    }

    const concurrentUsersField = document.getElementById("concurrent-users");
    const memoryLeakImpactField = document.getElementById("memory-leak-impact");
    const burstCapacityField = document.getElementById("burst-capacity");

    if (concurrentUsersField) {
      concurrentUsersField.value = calculateConcurrentUsers(maxChildren);
    }

    if (memoryLeakImpactField) {
      memoryLeakImpactField.value = calculateMemoryLeakImpact(maxChildren, availableRamMb);
    }

    if (burstCapacityField) {
      burstCapacityField.value = calculateBurstCapacity(maxChildren);
    }

    const warnings = validateConfiguration(
      ramTotal,
      ramReserved,
      ramBuffer,
      processSize,
      maxChildren
    );
    displayWarnings(warnings);

    generateConfigCopy();

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveSettings, 500);
  }

  // Enhanced configuration generator
  function generateConfigCopy() {
    const maxRequests = document.getElementById("max-requests").value;
    const processIdleTimeout = document.getElementById("process-idle-timeout").value;
    const maxSpawnRate = document.getElementById("max-spawn-rate").value;
    const statusPath = document.getElementById("status-path").value;
    const processSize = document.getElementById("process-size").value;

    const availableRamMb = parseInt(document.getElementById("ram-available-mb").value || 0);

    const { realpathCacheSize, realpathCacheTTL } = calculateOptimalRealpathCache(
      parseInt(processSize),
      availableRamMb
    );

    const opcacheMemory = Math.min(512, Math.max(128, Math.floor(parseInt(processSize) * 4)));

    let configText = `; PHP-FPM Pool Configuration for ${currentPool}
; Optimized for high-traffic environments

[${currentPool}]
; Process manager mode (${pmMode})
pm = ${pmMode}

; Maximum number of child processes (based on available RAM)
pm.max_children = ${document.getElementById("max-children").value}`;

    if (pmMode === "dynamic") {
      configText += `

; Initial number of child processes created on startup
pm.start_servers = ${document.getElementById("start-servers").value}

; Minimum number of idle server processes
pm.min_spare_servers = ${document.getElementById("min-spare").value}

; Maximum number of idle server processes
pm.max_spare_servers = ${document.getElementById("max-spare").value}`;
    }

    if (maxRequests && maxRequests !== "0") {
      configText += `

; Maximum number of requests each child process handles before respawning
pm.max_requests = ${maxRequests}`;
    }

    if (processIdleTimeout) {
      configText += `

; Number of seconds after which an idle process will be killed
pm.process_idle_timeout = ${processIdleTimeout}s`;
    }

    if (maxSpawnRate) {
      configText += `

; Maximum rate of children spawned per second
pm.max_spawn_rate = ${maxSpawnRate}`;
    }

    if (statusPath) {
      configText += `

; URI path for PHP-FPM status page
pm.status_path = ${statusPath}`;
    }

    configText += `

; PHP Performance Settings
; ----------------------
php_admin_value[memory_limit] = ${processSize}M
php_admin_value[realpath_cache_size] = ${realpathCacheSize}
php_admin_value[realpath_cache_ttl] = ${realpathCacheTTL}

; OPcache settings
php_admin_value[opcache.enable] = 1
php_admin_value[opcache.memory_consumption] = ${opcacheMemory}
php_admin_value[opcache.interned_strings_buffer] = 16
php_admin_value[opcache.max_accelerated_files] = 10000
php_admin_value[opcache.revalidate_freq] = 0
php_admin_value[opcache.validate_timestamps] = 0
php_admin_value[opcache.save_comments] = 1
php_admin_value[opcache.enable_file_override] = 1
php_admin_value[opcache.huge_code_pages] = 1

; Error handling - production settings
php_admin_value[display_errors] = Off
php_admin_value[display_startup_errors] = Off
php_admin_value[log_errors] = On
php_admin_value[error_log] = /var/log/php/php-error.log

; Execution limits
php_admin_value[max_execution_time] = 60
php_admin_value[max_input_time] = 60
`;

    document.getElementById("copyPasteArea").value = configText.trim();

    const codePreview = document.getElementById("codePreview");
    if (codePreview) {
      codePreview.textContent = configText.trim();
    }
  }

  // Function to copy text to clipboard (modern Clipboard API)
  async function copyToClipboard() {
    const copyText = document.getElementById("copyPasteArea").value;
    const copyButton = document.getElementById("buttonCopy");

    try {
      await navigator.clipboard.writeText(copyText);

      // Show success feedback
      copyButton.classList.add("bg-green-500");
      copyButton.classList.remove("bg-blue-500");

      const originalText = copyButton.textContent;
      copyButton.textContent = "Copied!";

      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.classList.remove("bg-green-500");
        copyButton.classList.add("bg-blue-500");
      }, 2000);
    } catch (_unused) {
      // Fallback for older browsers
      const textarea = document.getElementById("copyPasteArea");
      textarea.select();
      try {
        document.execCommand("copy");
        showToast("Copied to clipboard!", "success");
      } catch (_fallbackUnused) {
        showToast("Failed to copy. Please copy manually.", "error");
      }
    }
  }

  // Add a new pool
  function addNewPool() {
    document.getElementById("pool-name-container").classList.remove("hidden");
    document.getElementById("pool-name").focus();
  }

  // Save a new pool
  function savePoolName() {
    const poolNameInput = document.getElementById("pool-name");
    const poolName = poolNameInput.value.trim();

    const validation = validatePoolName(poolName);
    if (!validation.valid) {
      showToast(validation.message, "error");
      return;
    }

    pools[poolName] = true;

    const option = document.createElement("option");
    option.value = poolName;
    option.textContent = poolName;
    document.getElementById("current-pool").appendChild(option);

    document.getElementById("current-pool").value = poolName;
    switchPool(poolName);

    document.getElementById("pool-name-container").classList.add("hidden");
    poolNameInput.value = "";

    showToast(`Pool "${poolName}" created successfully!`, "success");
  }

  // Delete current pool
  function deleteCurrentPool() {
    if (currentPool === DEFAULT_POOL) {
      showToast("Cannot delete the default pool", "warning");
      return;
    }

    const poolName = currentPool;

    delete pools[poolName];
    localStorage.removeItem(getStorageKey(poolName));

    localStorage.setItem(STORAGE_KEY_PREFIX + "pools", JSON.stringify(Object.keys(pools)));

    const poolSelect = document.getElementById("current-pool");
    const optionToRemove = Array.from(poolSelect.options).find(opt => opt.value === poolName);
    if (optionToRemove) {
      poolSelect.removeChild(optionToRemove);
    }

    poolSelect.value = DEFAULT_POOL;
    switchPool(DEFAULT_POOL);

    showToast(`Pool "${poolName}" deleted`, "success");
  }

  // Switch to a different pool
  function switchPool(poolName) {
    saveSettings();

    currentPool = poolName;

    document.getElementById("current-pool-name").textContent = `Current Pool: ${poolName}`;

    const deleteBtn = document.getElementById("delete-pool");
    if (deleteBtn) {
      if (poolName === DEFAULT_POOL) {
        deleteBtn.classList.add("hidden");
      } else {
        deleteBtn.classList.remove("hidden");
      }
    }

    const hasSettings = loadSettings(poolName);

    if (!hasSettings) {
      resetToDefaults();
    }

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

    document.getElementById("max-requests").value = 500;
    document.getElementById("process-idle-timeout").value = 10;
    document.getElementById("max-spawn-rate").value = 32;
    document.getElementById("status-path").value = "/status";

    pmMode = "dynamic";
    updatePmModeUI();
  }

  // Load saved pools from localStorage
  function loadSavedPools() {
    try {
      const savedPoolsStr = localStorage.getItem(STORAGE_KEY_PREFIX + "pools");

      if (savedPoolsStr) {
        const savedPools = JSON.parse(savedPoolsStr);
        const poolSelect = document.getElementById("current-pool");

        savedPools.forEach(poolName => {
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

  // Create PM mode toggle using DOM methods (safe)
  function createPmModeToggle() {
    if (document.getElementById("pm-mode-container")) return;

    const additionalParamsSection = document.querySelector(
      ".bg-gray-50.p-4.rounded-md.border.border-gray-200"
    );

    if (!additionalParamsSection) return;

    const pmModeContainer = document.createElement("div");
    pmModeContainer.id = "pm-mode-container";
    pmModeContainer.className = "mb-4";

    const h4 = document.createElement("h4");
    h4.className = "text-lg font-bold text-gray-800 dark:text-white mb-2";
    h4.textContent = "Process Manager Mode";

    const radioGroup = document.createElement("div");
    radioGroup.className = "flex flex-wrap gap-4";
    radioGroup.setAttribute("role", "radiogroup");
    radioGroup.setAttribute("aria-label", "Process Manager Mode");

    // Dynamic option
    const dynamicLabel = document.createElement("label");
    dynamicLabel.className = "inline-flex items-center cursor-pointer";

    const dynamicRadio = document.createElement("input");
    dynamicRadio.type = "radio";
    dynamicRadio.name = "pm-mode";
    dynamicRadio.value = "dynamic";
    dynamicRadio.className = "mr-2";
    dynamicRadio.checked = pmMode === "dynamic";

    const dynamicText = document.createElement("span");
    dynamicText.className = "text-gray-700 dark:text-gray-300";
    dynamicText.textContent = "Dynamic (variable load)";

    dynamicLabel.appendChild(dynamicRadio);
    dynamicLabel.appendChild(dynamicText);

    // Static option
    const staticLabel = document.createElement("label");
    staticLabel.className = "inline-flex items-center cursor-pointer";

    const staticRadio = document.createElement("input");
    staticRadio.type = "radio";
    staticRadio.name = "pm-mode";
    staticRadio.value = "static";
    staticRadio.className = "mr-2";
    staticRadio.checked = pmMode === "static";

    const staticText = document.createElement("span");
    staticText.className = "text-gray-700 dark:text-gray-300";
    staticText.textContent = "Static (high performance)";

    staticLabel.appendChild(staticRadio);
    staticLabel.appendChild(staticText);

    radioGroup.appendChild(dynamicLabel);
    radioGroup.appendChild(staticLabel);

    const description = document.createElement("p");
    description.id = "pm-mode-desc";
    description.className = "text-sm text-gray-600 dark:text-gray-400 mt-1";
    description.textContent = "Static mode provides better performance but uses more resources.";

    pmModeContainer.appendChild(h4);
    pmModeContainer.appendChild(radioGroup);
    pmModeContainer.appendChild(description);

    additionalParamsSection.parentNode.insertBefore(pmModeContainer, additionalParamsSection);

    // Add event listeners
    dynamicRadio.addEventListener("change", function () {
      if (this.checked) togglePmMode("dynamic");
    });
    staticRadio.addEventListener("change", function () {
      if (this.checked) togglePmMode("static");
    });
  }

  // Add realpath cache section using DOM methods (safe)
  function addRealpathCacheSection() {
    const phpfpmSettings = document.querySelector(".border-l-4.border-green-500.bg-green-50");

    if (!phpfpmSettings) return;

    const realpathSection = document.createElement("div");
    realpathSection.className = "mb-8";

    const container = document.createElement("div");
    container.className =
      "p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-md";

    const h3 = document.createElement("h3");
    h3.className = "text-lg font-bold text-gray-800 dark:text-white mb-4";
    h3.textContent = "Realpath Cache Settings";

    const p = document.createElement("p");
    p.className = "text-sm text-gray-600 dark:text-gray-400 mb-4";
    p.textContent =
      "The realpath cache stores file paths that PHP accesses, improving performance by avoiding repeated filesystem lookups.";

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-4";

    // Cache size field
    const sizeDiv = document.createElement("div");
    const sizeLabel = document.createElement("label");
    sizeLabel.setAttribute("for", "realpath-cache-size");
    sizeLabel.className = "block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1";
    sizeLabel.textContent = "realpath_cache_size";

    const sizeInput = document.createElement("input");
    sizeInput.id = "realpath-cache-size";
    sizeInput.type = "text";
    sizeInput.readOnly = true;
    sizeInput.setAttribute("aria-readonly", "true");
    sizeInput.className =
      "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 font-bold text-blue-800 dark:text-blue-400";

    sizeDiv.appendChild(sizeLabel);
    sizeDiv.appendChild(sizeInput);

    // TTL field
    const ttlDiv = document.createElement("div");
    const ttlLabel = document.createElement("label");
    ttlLabel.setAttribute("for", "realpath-cache-ttl");
    ttlLabel.className = "block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1";
    ttlLabel.textContent = "realpath_cache_ttl";

    const ttlInput = document.createElement("input");
    ttlInput.id = "realpath-cache-ttl";
    ttlInput.type = "text";
    ttlInput.readOnly = true;
    ttlInput.setAttribute("aria-readonly", "true");
    ttlInput.className =
      "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 font-bold text-blue-800 dark:text-blue-400";

    ttlDiv.appendChild(ttlLabel);
    ttlDiv.appendChild(ttlInput);

    grid.appendChild(sizeDiv);
    grid.appendChild(ttlDiv);

    container.appendChild(h3);
    container.appendChild(p);
    container.appendChild(grid);
    realpathSection.appendChild(container);

    phpfpmSettings.parentNode.insertBefore(realpathSection, phpfpmSettings.nextSibling);

    // Initialize values
    const availableRamMb = parseInt(document.getElementById("ram-available-mb").value || 0);
    const processSize = parseFloat(document.getElementById("process-size").value);
    const { realpathCacheSize, realpathCacheTTL } = calculateOptimalRealpathCache(
      processSize,
      availableRamMb
    );

    sizeInput.value = realpathCacheSize;
    ttlInput.value = realpathCacheTTL;
  }

  // Add event listeners to sliders and inputs
  const inputIds = ["ram-total", "ram-reserved", "ram-buffer", "process-size"];

  inputIds.forEach(id => {
    const slider = document.getElementById(id);
    const valueInput = document.getElementById(`${id}-val`);

    slider.addEventListener("input", updateFields);
    slider.addEventListener("change", updateFields);

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
  additionalParams.forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener("input", updateFields);
    input.addEventListener("change", updateFields);
  });

  // Export settings to JSON file
  function exportSettings() {
    const allSettings = {};

    Object.keys(pools).forEach(poolName => {
      const savedSettingsStr = localStorage.getItem(getStorageKey(poolName));
      if (savedSettingsStr) {
        allSettings[poolName] = JSON.parse(savedSettingsStr);
      }
    });

    const exportData = {
      version: "1.2.0",
      exportDate: new Date().toISOString(),
      pools: allSettings,
      currentPool: currentPool,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `php-fpm-settings-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Settings exported successfully!", "success");
  }

  // Import settings from JSON file
  function importSettings(file) {
    if (file.size > 1024 * 1024) {
      showToast("File is too large. Maximum size is 1MB.", "error");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const importData = JSON.parse(e.target.result);

        if (!importData.pools || typeof importData.pools !== "object") {
          showToast("Invalid settings file format", "error");
          return;
        }

        let importedCount = 0;
        Object.keys(importData.pools).forEach(poolName => {
          const validation = validatePoolName(poolName);
          if (!validation.valid && !pools[poolName]) {
            console.warn(`Skipping invalid pool name: ${poolName}`);
            return;
          }

          pools[poolName] = true;
          localStorage.setItem(getStorageKey(poolName), JSON.stringify(importData.pools[poolName]));

          const poolSelect = document.getElementById("current-pool");
          const existingOption = Array.from(poolSelect.options).find(opt => opt.value === poolName);

          if (!existingOption && poolName !== DEFAULT_POOL) {
            const option = document.createElement("option");
            option.value = poolName;
            option.textContent = poolName;
            poolSelect.appendChild(option);
          }
          importedCount++;
        });

        localStorage.setItem(STORAGE_KEY_PREFIX + "pools", JSON.stringify(Object.keys(pools)));

        const targetPool = importData.currentPool || Object.keys(pools)[0];
        document.getElementById("current-pool").value = targetPool;
        switchPool(targetPool);

        showToast(`Imported ${importedCount} pool(s) successfully!`, "success");
      } catch (error) {
        console.error("Import error:", error);
        showToast("Failed to import settings. Please check the file format.", "error");
      }
    };

    reader.onerror = function () {
      showToast("Failed to read file", "error");
    };

    reader.readAsText(file);
  }

  // Pool management event listeners
  document.getElementById("add-pool").addEventListener("click", addNewPool);
  document.getElementById("save-pool-name").addEventListener("click", savePoolName);

  document.getElementById("pool-name").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      savePoolName();
    }
  });

  document.getElementById("current-pool").addEventListener("change", function () {
    switchPool(this.value);
  });

  // Export/Import event listeners
  document.getElementById("export-settings").addEventListener("click", exportSettings);
  document.getElementById("import-settings").addEventListener("click", function () {
    document.getElementById("import-file").click();
  });
  document.getElementById("import-file").addEventListener("change", function (e) {
    if (e.target.files.length > 0) {
      importSettings(e.target.files[0]);
      e.target.value = "";
    }
  });

  // Copy button event listener
  document.getElementById("buttonCopy").addEventListener("click", copyToClipboard);

  // Dark mode toggle event listener
  document.getElementById("dark-mode-toggle").addEventListener("click", toggleDarkMode);

  // Initialize pools object with default pool
  pools[DEFAULT_POOL] = true;

  // Load saved pools
  loadSavedPools();

  // First try to load saved settings for default pool
  loadSettings(currentPool);

  // Add PM mode toggle to the UI
  createPmModeToggle();

  // Add realpath cache section to the UI
  addRealpathCacheSection();

  // Initial calculation on page load
  updateFields();

  // FAQ Accordion functionality with proper ARIA support
  function initFaqAccordion() {
    const faqContainer = document.getElementById("faqAccordion");
    if (!faqContainer) return;

    // Use event delegation
    faqContainer.addEventListener("click", function (e) {
      const question = e.target.closest(".faq-question");
      if (!question) return;
      toggleFaqItem(question);
    });

    faqContainer.addEventListener("keydown", function (e) {
      const question = e.target.closest(".faq-question");
      if (!question) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFaqItem(question);
      }
    });

    // Initialize ARIA attributes
    const faqQuestions = document.querySelectorAll(".faq-question");
    faqQuestions.forEach((question, index) => {
      const answer = question.nextElementSibling;
      const questionId = `faq-question-${index}`;
      const answerId = `faq-answer-${index}`;

      question.setAttribute("id", questionId);
      question.setAttribute("aria-expanded", "false");
      question.setAttribute("aria-controls", answerId);

      if (answer) {
        answer.setAttribute("id", answerId);
        answer.setAttribute("role", "region");
        answer.setAttribute("aria-labelledby", questionId);
      }
    });
  }

  function toggleFaqItem(question) {
    const answer = question.nextElementSibling;
    const isExpanded = question.getAttribute("aria-expanded") === "true";

    question.setAttribute("aria-expanded", (!isExpanded).toString());
    question.classList.toggle("active");

    if (answer) {
      answer.classList.toggle("hidden");
      const arrow = question.querySelector(".faq-arrow");
      if (arrow) {
        arrow.classList.toggle("rotate-180");
      }
    }
  }

  // Initialize FAQ accordion
  initFaqAccordion();

  // Add delete pool button
  function addDeletePoolButton() {
    const addPoolBtn = document.getElementById("add-pool");
    if (!addPoolBtn || document.getElementById("delete-pool")) return;

    const deleteBtn = document.createElement("button");
    deleteBtn.id = "delete-pool";
    deleteBtn.className =
      "px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors hidden";
    deleteBtn.textContent = "Delete Pool";
    deleteBtn.setAttribute("type", "button");
    deleteBtn.addEventListener("click", function () {
      if (confirm(`Are you sure you want to delete the pool "${currentPool}"?`)) {
        deleteCurrentPool();
      }
    });
    addPoolBtn.parentNode.insertBefore(deleteBtn, addPoolBtn.nextSibling);
  }

  addDeletePoolButton();
});

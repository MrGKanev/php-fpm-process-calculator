document.addEventListener("DOMContentLoaded", function () {
  // Constants for localStorage
  const STORAGE_KEY_PREFIX = "phpFpmCalculatorSettings_";
  const DEFAULT_POOL = "www";

  // Data structure for storing pool configurations
  let pools = {};
  let currentPool = DEFAULT_POOL;
  let pmMode = "dynamic"; // Default PM mode

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
      pmMode: pmMode,
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
  }

  // Function to toggle PM mode between dynamic and static
  function togglePmMode(mode) {
    pmMode = mode;
    updateFields();
  }

  // Calculate optimal realpath_cache settings based on server size and available RAM
  // Implementation based on recommendations from: https://linuxblog.io/set-monitor-phps-realpath_cache_size-correctly/
  function calculateOptimalRealpathCache(processSize, availableRamMb) {
    // First establish a baseline based on process size (correlates with application complexity)
    let baseCacheSize = Math.min(
      4096,
      Math.max(256, Math.floor(processSize * 2))
    );

    // Scale based on available RAM
    if (availableRamMb > 8192) {
      // More than 8GB RAM available
      baseCacheSize = Math.max(baseCacheSize, 4096); // At least 4MB
    } else if (availableRamMb > 4096) {
      // More than 4GB RAM available
      baseCacheSize = Math.max(baseCacheSize, 2048); // At least 2MB
    } else if (availableRamMb > 2048) {
      // More than 2GB RAM available
      baseCacheSize = Math.max(baseCacheSize, 1024); // At least 1MB
    }

    return {
      realpathCacheSize: baseCacheSize + "k",
      realpathCacheTTL: 120, // 2 minutes as recommended in the article
    };
  }

  // Improved calculation function based on high traffic optimization guidelines
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

    // Calculate PHP-FPM process settings with improved ratios for high traffic
    const maxChildren = Math.floor(availableRamMb / processSize);

    let startServers, minSpare, maxSpare;

    if (pmMode === "static") {
      // In static mode, all values are equal to max_children
      startServers = maxChildren;
      minSpare = maxChildren;
      maxSpare = maxChildren;
    } else {
      // Dynamic mode calculations
      // For high traffic sites, we want more aggressive scaling
      startServers = Math.floor(maxChildren * 0.3);
      minSpare = startServers;
      maxSpare = Math.floor(maxChildren * 0.8);
    }

    // Update result fields
    document.getElementById("ram-available").value = availableRam;
    document.getElementById("ram-available-mb").value = availableRamMb;
    document.getElementById("max-children").value = maxChildren;
    document.getElementById("start-servers").value = startServers;
    document.getElementById("min-spare").value = minSpare;
    document.getElementById("max-spare").value = maxSpare;

    // Update realpath cache fields if they exist
    const realpathCacheSizeField = document.getElementById(
      "realpath-cache-size"
    );
    const realpathCacheTtlField = document.getElementById("realpath-cache-ttl");

    if (realpathCacheSizeField && realpathCacheTtlField) {
      const { realpathCacheSize, realpathCacheTTL } =
        calculateOptimalRealpathCache(processSize, availableRamMb);
      realpathCacheSizeField.value = realpathCacheSize;
      realpathCacheTtlField.value = realpathCacheTTL;
    }

    // Generate configuration text for copy/paste
    generateConfigCopy();

    // Save settings to localStorage after a short delay (throttling)
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(saveSettings, 500);
  }

  // Enhanced configuration generator with comments for better user guidance
  function generateConfigCopy() {
    const maxRequests = document.getElementById("max-requests").value;
    const processIdleTimeout = document.getElementById(
      "process-idle-timeout"
    ).value;
    const maxSpawnRate = document.getElementById("max-spawn-rate").value;
    const statusPath = document.getElementById("status-path").value;
    const processSize = document.getElementById("process-size").value;

    // Get available RAM to better calculate optimal realpath_cache settings
    const availableRamMb = parseInt(
      document.getElementById("ram-available-mb").value || 0
    );

    // Get optimal realpath cache settings
    const { realpathCacheSize, realpathCacheTTL } =
      calculateOptimalRealpathCache(parseInt(processSize), availableRamMb);

    // Calculate optimal OPcache settings
    const opcacheMemory = Math.min(
      512,
      Math.max(128, Math.floor(parseInt(processSize) * 4))
    );

    let configText = `; PHP-FPM Pool Configuration for ${currentPool}
; Optimized for high-traffic environments

[${currentPool}]
; Process manager mode (${pmMode})
pm = ${pmMode}

; Maximum number of child processes (based on available RAM)
pm.max_children = ${document.getElementById("max-children").value}`;

    // Only add these settings for dynamic mode
    if (pmMode === "dynamic") {
      configText += `

; Initial number of child processes created on startup
pm.start_servers = ${document.getElementById("start-servers").value}

; Minimum number of idle server processes
pm.min_spare_servers = ${document.getElementById("min-spare").value}

; Maximum number of idle server processes
pm.max_spare_servers = ${document.getElementById("max-spare").value}`;
    }

    // Add additional parameters only if they're not empty
    if (maxRequests && maxRequests !== "0") {
      configText += `

; Maximum number of requests each child process handles before respawning
; Setting to ${maxRequests} helps prevent memory leaks
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
; Secure this location in your web server configuration
pm.status_path = ${statusPath}`;
    }

    // Add additional recommended settings for high traffic
    configText += `

; PHP Performance Settings
; ----------------------
; Memory settings
php_admin_value[memory_limit] = ${processSize}M

; Realpath cache optimization - improves file path resolution performance
; Optimized based on recommendations from: https://linuxblog.io/set-monitor-phps-realpath_cache_size-correctly/
php_admin_value[realpath_cache_size] = ${realpathCacheSize}  ; Optimized for ${availableRamMb}MB available RAM
php_admin_value[realpath_cache_ttl] = ${realpathCacheTTL}    ; 2 minutes is optimal for most sites

; OPcache settings for optimal performance
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
    document.getElementById("max-requests").value = 500; // Changed from 0 to 500 for high traffic
    document.getElementById("process-idle-timeout").value = 10;
    document.getElementById("max-spawn-rate").value = 32;
    document.getElementById("status-path").value = "/status";

    // Reset to dynamic mode by default
    pmMode = "dynamic";
    updatePmModeUI();
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

  // Add PM mode toggle button to the UI if it doesn't exist
  function createPmModeToggle() {
    // Check if we already have a PM mode selector
    if (!document.getElementById("pm-mode-container")) {
      // Find a good place to insert the toggle
      const additionalParamsSection = document.querySelector(
        ".bg-gray-50.p-4.rounded-md.border.border-gray-200"
      );

      if (additionalParamsSection) {
        // Create the toggle element
        const pmModeContainer = document.createElement("div");
        pmModeContainer.id = "pm-mode-container";
        pmModeContainer.className = "mb-4";

        pmModeContainer.innerHTML = `
          <h4 class="text-lg font-bold text-gray-800 mb-2">Process Manager Mode</h4>
          <div class="flex space-x-4">
            <label class="inline-flex items-center">
              <input type="radio" name="pm-mode" value="dynamic" class="mr-2" ${
                pmMode === "dynamic" ? "checked" : ""
              }>
              <span>Dynamic (variable load)</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" name="pm-mode" value="static" class="mr-2" ${
                pmMode === "static" ? "checked" : ""
              }>
              <span>Static (high performance)</span>
            </label>
          </div>
          <p class="text-sm text-gray-600 mt-1">Static mode provides better performance but uses more resources.</p>
        `;

        // Insert before the additional params section
        additionalParamsSection.parentNode.insertBefore(
          pmModeContainer,
          additionalParamsSection
        );

        // Add event listeners to the radio buttons
        const radios = pmModeContainer.querySelectorAll('input[type="radio"]');
        radios.forEach((radio) => {
          radio.addEventListener("change", function () {
            togglePmMode(this.value);
          });
        });
      }
    }
  }

  // Function to add realpath cache section to the UI
  function addRealpathCacheSection() {
    // Find a good place to insert the realpath cache section
    const phpfpmSettings = document.querySelector(
      ".border-l-4.border-green-500.bg-green-50"
    );

    if (phpfpmSettings) {
      // Create the realpath cache section
      const realpathSection = document.createElement("div");
      realpathSection.className = "mb-8";
      realpathSection.innerHTML = `
        <div class="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-md">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Realpath Cache Settings</h3>
          <p class="text-sm text-gray-600 mb-4">
            The realpath cache stores file paths that PHP accesses, improving performance by avoiding repeated filesystem lookups.
            Values are automatically optimized based on your server configuration.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="realpath-cache-size" class="block text-sm font-medium text-gray-600 mb-1">
                realpath_cache_size
              </label>
              <input id="realpath-cache-size" type="text" readonly 
                class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 font-bold text-blue-800">
            </div>
            
            <div>
              <label for="realpath-cache-ttl" class="block text-sm font-medium text-gray-600 mb-1">
                realpath_cache_ttl
              </label>
              <input id="realpath-cache-ttl" type="text" readonly 
                class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 font-bold text-blue-800">
            </div>
          </div>
        </div>
      `;

      // Insert the realpath cache section after the PHP-FPM Settings section
      phpfpmSettings.parentNode.insertBefore(
        realpathSection,
        phpfpmSettings.nextSibling
      );

      // Initialize the values
      const availableRamMb = parseInt(
        document.getElementById("ram-available-mb").value || 0
      );
      const processSize = parseFloat(
        document.getElementById("process-size").value
      );
      const { realpathCacheSize, realpathCacheTTL } =
        calculateOptimalRealpathCache(processSize, availableRamMb);

      document.getElementById("realpath-cache-size").value = realpathCacheSize;
      document.getElementById("realpath-cache-ttl").value = realpathCacheTTL;
    }
  }

  // Add new FAQ items related to PHP optimization
  function addOptimizationFAQs() {
    const faqAccordion = document.getElementById("faqAccordion");

    if (faqAccordion) {
      // Create new FAQ items
      const newFAQs = [
        {
          question: "What is realpath_cache_size and why is it important?",
          answer:
            "The realpath_cache stores the resolved file paths that PHP accesses, avoiding repeated file system lookups. This significantly improves performance, especially for applications with many included files (like WordPress or any framework). According to the Linux Blog, properly sizing this cache can lead to 10-30% performance improvements. Our calculator automatically recommends an optimal setting based on your RAM and process size.",
        },
        {
          question:
            "What is the difference between dynamic and static PM modes?",
          answer:
            "Dynamic mode adjusts the number of PHP-FPM processes based on demand, which is good for variable traffic. Static mode maintains a fixed number of processes at all times, providing better performance for high-traffic sites at the cost of higher resource usage.",
        },
        {
          question: "What is realpath_cache and why is it important?",
          answer:
            "The realpath cache stores the real file paths of files that PHP opens, avoiding the need for repeated file system lookups. Properly sizing this cache significantly improves performance, especially for applications with many included files like WordPress or frameworks.",
        },
        {
          question: "Why is OPcache important for PHP performance?",
          answer:
            "OPcache improves PHP performance by storing precompiled script bytecode in memory, eliminating the need for PHP to load and parse scripts on each request. This can result in a 30-70% performance improvement depending on your application.",
        },
        {
          question: "How does pm.max_requests help with memory leaks?",
          answer:
            "The pm.max_requests setting defines the number of requests each child process should execute before respawning. This helps mitigate memory leaks in PHP applications by periodically refreshing processes, preventing them from growing too large over time.",
        },
        {
          question:
            "Should I set memory_limit to the same value as process size?",
          answer:
            "Yes, it's good practice to set the memory_limit to match your estimated process size. This ensures PHP processes don't use more memory than you've planned for in your calculations, preventing potential server instability.",
        },
      ];

      // Add the new FAQs to the accordion
      newFAQs.forEach((faq) => {
        const faqItem = document.createElement("div");
        faqItem.className =
          "faq-item border border-gray-200 rounded-md overflow-hidden";

        faqItem.innerHTML = `
          <button class="faq-question w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center font-medium text-gray-700 focus:outline-none">
            <span>${faq.question}</span>
            <svg class="faq-arrow w-5 h-5 transform transition-transform duration-200" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div class="faq-answer hidden p-4 bg-white border-t border-gray-200">
            <p class="text-gray-600">${faq.answer}</p>
          </div>
        `;

        faqAccordion.appendChild(faqItem);
      });

      // Re-initialize FAQ accordion after adding new FAQs
      initFaqAccordion();
    }
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

  // Add PM mode toggle to the UI
  createPmModeToggle();

  // Add realpath cache section to the UI
  addRealpathCacheSection();

  // Add new FAQs about optimization
  addOptimizationFAQs();

  // Initial calculation on page load
  updateFields();

  // FAQ Accordion functionality - Reattach event listeners to all FAQ questions
  function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach((question) => {
      // Remove any existing event listeners first to prevent duplicates
      const questionClone = question.cloneNode(true);
      question.parentNode.replaceChild(questionClone, question);

      // Add event listeners to the cloned elements
      questionClone.addEventListener("click", function () {
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
  }

  // Initialize FAQ accordion
  initFaqAccordion();
});

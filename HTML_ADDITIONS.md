# HTML Additions Required

## 1. Warning Container (Add after line 106, after current-pool-name div)

```html
<!-- Warning Alert Container -->
<div id="warning-container" class="mb-6 hidden">
  <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Configuration Warnings</h3>
        <div id="warning-list" class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
          <ul class="list-disc list-inside space-y-1"></ul>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 2. Update Results Section (Replace existing results section around line 227)

Update the results section to include concurrent users estimate:

```html
<!-- Results Section - Mobile-First Approach -->
<div class="mb-8">
  <div class="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-md">
    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Calculated Results</h3>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="ram-available" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Available RAM</label>
        <div class="flex">
          <input id="ram-available" name="ram-available" type="text" readonly aria-readonly="true"
            class="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-100 dark:bg-gray-700 font-bold text-blue-800 dark:text-blue-400">
          <span class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-r-md flex items-center">GB</span>
        </div>
      </div>

      <div>
        <label for="ram-available-mb" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Available RAM</label>
        <div class="flex">
          <input id="ram-available-mb" name="ram-available-mb" type="text" readonly aria-readonly="true"
            class="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-100 dark:bg-gray-700 font-bold text-blue-800 dark:text-blue-400">
          <span class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-r-md flex items-center">MB</span>
        </div>
      </div>

      <div>
        <label for="concurrent-users" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
          Est. Concurrent Users
          <span class="inline-block ml-1 text-gray-400 cursor-help" title="Estimated concurrent users assuming 1 request per user with 1 second average response time">ⓘ</span>
        </label>
        <div class="flex">
          <input id="concurrent-users" name="concurrent-users" type="text" readonly aria-readonly="true"
            class="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 font-bold text-green-700 dark:text-green-400">
        </div>
      </div>
    </div>
  </div>
</div>
```

## 3. Add Advanced Metrics Section (Add after PHP-FPM Settings section, before Copy/Paste Area)

```html
<!-- Advanced Calculators -->
<div class="mb-8">
  <div class="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-md">
    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Advanced Metrics</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="memory-leak-impact" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
          Memory Leak Impact
          <span class="inline-block ml-1 text-gray-400 cursor-help" title="Time until server runs out of memory with a 1MB/hour per process memory leak">ⓘ</span>
        </label>
        <input id="memory-leak-impact" type="text" readonly
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 font-bold text-purple-700 dark:text-purple-400">
      </div>

      <div>
        <label for="burst-capacity" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
          Burst Traffic Capacity
          <span class="inline-block ml-1 text-gray-400 cursor-help" title="Maximum requests per second your configuration can handle">ⓘ</span>
        </label>
        <input id="burst-capacity" type="text" readonly
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 font-bold text-purple-700 dark:text-purple-400">
      </div>
    </div>
  </div>
</div>
```

## 4. Add Performance Monitoring Section (Add in sidebar, after PHP Hosting Providers section)

```html
<div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 mb-10">
  <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Performance Monitoring</h2>

  <div class="mb-4">
    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Metrics to Monitor</h3>
    <ul class="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
      <li>PHP-FPM pool status (active/idle/total processes)</li>
      <li>Memory usage per process</li>
      <li>Request queue length</li>
      <li>Slow request count</li>
      <li>Request duration (avg/p95/p99)</li>
      <li>OPcache memory usage and hit rate</li>
    </ul>
  </div>

  <div class="mb-4">
    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Monitoring Tools</h3>
    <ul class="list-disc pl-5 mb-4">
      <li><a href="https://www.netdata.cloud/" class="text-blue-800 dark:text-blue-400" target="_blank" rel="noopener noreferrer">Netdata</a> - Real-time monitoring</li>
      <li><a href="https://www.zabbix.com/" class="text-blue-800 dark:text-blue-400" target="_blank" rel="noopener noreferrer">Zabbix</a> - Enterprise monitoring</li>
      <li><a href="https://prometheus.io/" class="text-blue-800 dark:text-blue-400" target="_blank" rel="noopener noreferrer">Prometheus</a> - Metrics collection</li>
      <li><a href="https://grafana.com/" class="text-blue-800 dark:text-blue-400" target="_blank" rel="noopener noreferrer">Grafana</a> - Visualization</li>
    </ul>
  </div>

  <div>
    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">How to Monitor</h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Access PHP-FPM status page:</p>
    <code class="block bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-x-auto">
      curl http://localhost/status?full&json
    </code>
  </div>
</div>
```

## 5. Accessibility Improvements

### Add skip navigation link (at the very start of body, before dark mode toggle):

```html
<a href="#calculator-form" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md">
  Skip to calculator
</a>
```

### Add better focus styles (add to style.css):

```css
*:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

button:focus-visible,
input:focus-visible,
select:focus-visible {
  ring: 2px;
  ring-color: #3B82F6;
}
```

## Manual Steps:

1. Add the warning container after the `current-pool-name` div (line ~106)
2. Replace the results section with the updated 3-column version (line ~227)
3. Add the Advanced Metrics section after PHP-FPM Settings, before Copy/Paste Area (line ~304)
4. Add the Performance Monitoring section in the sidebar after PHP Hosting Providers (line ~622)
5. Add the skip navigation link at the start of body (line ~49)
6. Update all links to include `rel="noopener noreferrer"` for security
7. Add keyboard navigation support with proper tab indices

# PHP-FPM Process Calculator

This project is a PHP-FPM Process Calculator for optimizing PHP pool settings and Nginx configurations. It allows users to calculate the optimal settings for their PHP-FPM pool based on their server's RAM, buffer, and process size.

## Overview

The PHP-FPM Process Calculator helps system administrators and developers optimize their PHP-FPM configurations by providing an easy-to-use interface to calculate the maximum number of child processes, start servers, and spare servers. It includes sliders and input fields for various parameters and generates the configuration settings dynamically.

## Usage

1. Adjust the sliders or input fields for Total RAM, Reserved RAM, RAM Buffer, and Process Size.
2. The available RAM, available RAM in MB, and PHP-FPM settings will be calculated and displayed in real-time.
3. Use the "Copy to Clipboard" button to copy the generated PHP-FPM settings for use in your server configuration.

## Useful Commands

- Continuously watch for changes in the `style.css` file, updating the output file whenever changes occur.

```bash
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
```

- Generate a minified version of the CSS

```bash
npx tailwindcss -o ./src/output.css --minify 
```

Idea from: <https://github.com/spot13/pmcalculator>

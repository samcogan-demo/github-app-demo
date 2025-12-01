/**
 * GitHub App Demo Application
 * 
 * This is a simple demo application that showcases:
 * - GitHub App authentication for automation
 * - Publishing packages to GitHub Packages
 */

function greet(name = 'World') {
  return `Hello, ${name}! This package was published using GitHub App authentication.`;
}

module.exports = { greet };

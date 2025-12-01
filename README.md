# GitHub Packages Demo - Automated Package Publishing

This demo showcases **automated publishing of npm packages to GitHub Packages** using GitHub Actions.

## 🎯 What This Demonstrates

1. **GitHub Packages**: Publishing npm packages to GitHub's package registry
2. **GitHub Actions**: Automated workflow triggered on push to main branch
3. **GITHUB_TOKEN**: Using the built-in token for secure authentication

## 🏗️ Architecture

```
┌─────────────────┐
│  GitHub Action  │
└────────┬────────┘
         │
         ├─► Authenticate with GITHUB_TOKEN
         │
         ├─► Configure npm for GitHub Packages
         │
         └─► Publish Package to GitHub Packages
```

## 📋 Prerequisites

- A GitHub repository (organization or personal account)
- GitHub Actions enabled (enabled by default)
- Packages write permission for workflows (see setup below)

## 🔧 Setup Instructions

### Step 1: Enable Workflow Permissions

1. Go to your repository **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Ensure either:
   - "Read and write permissions" is selected, OR
   - "Read repository contents and packages permissions" is selected
4. Save changes

### Step 2: Run the Workflow

No secrets or configuration needed! The workflow uses the built-in `GITHUB_TOKEN` which automatically has the necessary permissions.

The workflow will automatically:
- Configure the package name based on your repository
- Set up npm authentication
- Publish to GitHub Packages

## 🚀 Usage

### Manual Trigger

1. Go to **Actions** tab in your repository
2. Select **Publish Package to GitHub Packages** workflow
3. Click **Run workflow**

### Automatic Trigger

Push to the `main` branch:

```bash
git add .
git commit -m "Update package"
git push origin main
```

The workflow will automatically publish your package to GitHub Packages.

## 📦 Viewing Published Packages

After successful publication:

1. Go to your repository page
2. Click on **Packages** (on the right sidebar)
3. You'll see your published package: `@owner/repo-name`

The package will be automatically linked to the repository.

## 🔐 Why GITHUB_TOKEN?

### Advantages of using GITHUB_TOKEN:

✅ **Zero Configuration**: No secrets to manage  
✅ **Automatic**: Built into every workflow run  
✅ **Secure**: Scoped to the repository, expires after job completion  
✅ **Permission Control**: Configurable per workflow  
✅ **No user dependency**: Workflow doesn't break if a user leaves  
✅ **Auditable**: All actions tracked in workflow logs

## 📚 Package Structure

```
├── .github/
│   └── workflows/
│       └── publish-package.yml  # GitHub Action workflow
├── .npmrc                       # npm registry configuration
├── index.js                     # Simple demo module
├── package.json                 # Package metadata
└── README.md                    # This file
```

## 🧪 Testing Locally

Install the package in another project:

```bash
npm install @samcogan-demo/github-app-demo --registry=https://npm.pkg.github.com
```

Or configure in `.npmrc`:

```
@samcogan-demo:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

## 🔍 Workflow Breakdown

The GitHub Action performs these steps:

1. **Checkout**: Gets the repository code
2. **Setup Node.js**: Configures Node.js environment with registry URL
3. **Update package.json**: Ensures correct scope and repository URL
4. **Publish**: Publishes to GitHub Packages using `GITHUB_TOKEN`
5. **Verify**: Confirms successful publication

The `GITHUB_TOKEN` is automatically provided by GitHub Actions and has the necessary permissions to publish packages.

## 🛠️ Troubleshooting

### Package already exists

If you need to publish a new version, update the `version` field in `package.json`.

### Permission denied when publishing

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, ensure:
   - "Read and write permissions" is selected
   - "Allow GitHub Actions to create and approve pull requests" can be checked (optional)
3. Save and re-run the workflow

### Authentication failed

- The `GITHUB_TOKEN` is automatically provided by GitHub Actions
- Ensure your workflow has `permissions: packages: write` set
- Check that Actions are enabled for your repository

### npm publish fails

- Ensure your package name matches the scope: `@YOUR_ORG/package-name`
- Verify the `repository` field in `package.json` is correct
- Check that the package doesn't already exist at that version

## 📖 Learn More

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [Publishing npm packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [GITHUB_TOKEN permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)

## 📄 License

MIT

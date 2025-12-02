# GitHub App Authentication Demo for Azure DevOps

This repository demonstrates how to use **GitHub App authentication** in Azure DevOps pipelines to securely interact with GitHub APIs. The demo showcases an automated release notes generator that queries GitHub Issues and Pull Requests to create formatted release notes.

## 🎯 Demo Scenario: Automated Release Notes Generator

This application demonstrates a real-world use case where an Azure DevOps pipeline:
1. **Authenticates** to GitHub using a GitHub App (not a Personal Access Token)
2. **Queries** GitHub Issues and Pull Requests
3. **Generates** formatted release notes based on closed items
4. **Creates or updates** a GitHub Release with the generated notes

## 🏗️ Architecture

```
┌──────────────────────┐
│  Azure DevOps        │
│  Pipeline            │
└──────────┬───────────┘
           │
           ├─► Authenticate with GitHub App
           │   (App ID + Private Key + Installation ID)
           │
           ├─► Generate Installation Token
           │
           ├─► Query GitHub API
           │   • Fetch closed issues
           │   • Fetch merged PRs
           │
           ├─► Generate Release Notes
           │   • Group by type (features, bugs, etc.)
           │   • Format markdown
           │
           └─► Create/Update GitHub Release
```

## 🔐 Why GitHub Apps?

GitHub Apps offer several advantages over Personal Access Tokens (PATs):

| Feature | GitHub App | Personal Access Token |
|---------|------------|----------------------|
| **Scope** | Repository/Organization level | User account level |
| **Permissions** | Fine-grained, specific permissions | Broad access |
| **Expiration** | Tokens expire (1 hour), auto-renewable | Manual rotation required |
| **User Independence** | Not tied to a specific user | Breaks if user leaves |
| **Audit Trail** | Clear attribution to the app | Attributed to the user |
| **Rate Limits** | Higher rate limits | Standard user limits |

## 📋 Prerequisites

### 1. GitHub App Setup

You need to create a GitHub App with the following permissions:

#### Required Permissions:
- **Contents**: Read & Write (to create releases)
- **Issues**: Read (to query issues)
- **Pull Requests**: Read (to query PRs)
- **Metadata**: Read (automatic)

#### Installation:
The app must be installed on the organization or repository where you want to generate release notes.

### 2. Azure DevOps Setup

- An Azure DevOps organization and project
- Pipeline configuration access

## 🚀 Setup Instructions

### Step 1: Create a GitHub App

1. Go to GitHub Settings → Developer settings → GitHub Apps → **New GitHub App**
2. Fill in the details:
   - **App Name**: `Azure DevOps Release Notes Generator` (or your choice)
   - **Homepage URL**: Your Azure DevOps project URL
   - **Webhook**: Uncheck "Active" (not needed for this demo)
3. Set **Repository permissions**:
   - Contents: Read & Write
   - Issues: Read
   - Pull requests: Read
4. Click **Create GitHub App**
5. Note down the **App ID**
6. Generate and download a **private key** (you'll get a `.pem` file)
7. Install the app:
   - Go to the app settings → Install App
   - Select your organization/account
   - Choose "All repositories" or select specific repositories
   - Note the **Installation ID** from the URL: `https://github.com/settings/installations/{INSTALLATION_ID}`

### Step 2: Configure Azure DevOps Pipeline Variables

1. In your Azure DevOps project, go to **Pipelines** → **Library** → **New variable group** (or use an existing one)
2. Add the following variables:

   | Variable Name | Value | Secret? |
   |--------------|-------|---------|
   | `APP_ID` | Your GitHub App ID | No |
   | `INSTALLATION_ID` | Your installation ID | No |
   | `APP_PRIVATE_KEY` | Base64-encoded private key | **Yes** |

3. To encode your private key:
   ```bash
   # On macOS/Linux:
   base64 -i path/to/your-app.pem | tr -d '\n'
   
   # On Windows (PowerShell):
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\your-app.pem"))
   ```

4. Link this variable group to your pipeline

### Step 3: Create the Azure DevOps Pipeline

1. In Azure DevOps, go to **Pipelines** → **New Pipeline**
2. Choose **GitHub** as the source
3. Select this repository: `samcogan-demo/github-app-demo`
4. Azure DevOps will detect the `azure-pipelines.yml` file
5. Review and save the pipeline

### Step 4: Create Sample Issues and PRs

To see the demo in action, create some sample issues and pull requests:

```bash
# Clone the repository
git clone https://github.com/samcogan-demo/github-app-demo.git
cd github-app-demo

# Create a feature branch
git checkout -b feature/sample-feature

# Make a change
echo "console.log('New feature');" >> generate-release-notes.js
git add .
git commit -m "Add sample feature"
git push origin feature/sample-feature
```

Then:
1. Create a Pull Request on GitHub
2. Add labels like `feature`, `bug`, or `enhancement`
3. Merge the PR
4. Create some issues and close them

### Step 5: Run the Pipeline

You can trigger the pipeline in two ways:

#### Option A: Tag-based trigger (automatic)
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### Option B: Manual trigger
1. Go to **Pipelines** in Azure DevOps
2. Select your pipeline
3. Click **Run pipeline**
4. Enter parameters:
   - **Tag Name**: `v1.0.0` (or your desired version)
   - **Previous Tag**: (optional) `v0.9.0` for filtering changes
5. Click **Run**

## 📊 What the Pipeline Does

The pipeline executes these steps:

1. **Install Node.js**: Sets up the runtime environment
2. **Checkout Repository**: Retrieves the code
3. **Install Dependencies**: Installs `@octokit/auth-app` and `@octokit/rest`
4. **Extract Repository Info**: Determines owner and repo name from the source
5. **Determine Tag Name**: Uses either the Git tag or manual parameter
6. **Generate Release Notes**: 
   - Authenticates with the GitHub App
   - Queries closed issues and merged PRs
   - Groups items by type (features, bugs, other)
   - Formats markdown
   - Creates or updates the GitHub Release

## 📝 Generated Release Notes Format

The generated release notes follow this structure:

```markdown
# Release v1.0.0

Released on 12/2/2025

## Changes since v0.9.0

### ✨ New Features

- Add user authentication (#42)
- Implement dark mode (#45)

### 🐛 Bug Fixes

- Fix login redirect issue (#38)
- Resolve memory leak in cache (#41)

### 🔀 Merged Pull Requests

- Update dependencies (#43) by @username
- Refactor API client (#44) by @username

### 👥 Contributors

Thank you to all contributors: @user1, @user2, @user3
```

## 🧪 Testing Locally

You can test the release notes generator locally:

```bash
# Install dependencies
npm install

# Set environment variables
export APP_ID="your_app_id"
export INSTALLATION_ID="your_installation_id"
export APP_PRIVATE_KEY="your_base64_encoded_key"
export GITHUB_OWNER="samcogan-demo"
export GITHUB_REPO="github-app-demo"
export TAG_NAME="v1.0.0"
export PREVIOUS_TAG="v0.9.0"  # optional

# Run the script
node generate-release-notes.js
```

## 🔍 How It Works

### Authentication Flow

1. The pipeline provides the GitHub App credentials (App ID, Private Key, Installation ID)
2. The Node.js script uses `@octokit/auth-app` to generate a short-lived installation token
3. This token is used to authenticate API requests via `@octokit/rest`
4. The token expires after 1 hour (automatically handled by Octokit)

### API Queries

The script makes the following GitHub API calls:

- `GET /repos/{owner}/{repo}/issues` - Fetch closed issues
- `GET /repos/{owner}/{repo}/pulls` - Fetch merged pull requests
- `POST /repos/{owner}/{repo}/releases` - Create a release
- `PATCH /repos/{owner}/{repo}/releases/{id}` - Update existing release

## 🛠️ Troubleshooting

### "Authentication failed"

- Verify your `APP_ID`, `INSTALLATION_ID`, and `APP_PRIVATE_KEY` are correct
- Ensure the private key is properly base64-encoded
- Check that the GitHub App is installed on the repository

### "Resource not accessible by integration"

- The GitHub App doesn't have the required permissions
- Go to GitHub App settings and verify permissions:
  - Contents: Read & Write
  - Issues: Read
  - Pull requests: Read

### "Release already exists"

- This is expected behavior - the script will update the existing release
- If you want to create a new release, use a different tag name

### No issues or PRs found

- Ensure you have closed issues or merged PRs in your repository
- Check the date range if using `PREVIOUS_TAG`
- Verify the repository name and owner are correct

## 📚 Additional Resources

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Azure Pipelines Documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [Octokit Authentication](https://github.com/octokit/auth-app.js)

## 🤝 Contributing

This is a demo repository. Feel free to fork and adapt it for your own use cases!

## 📄 License

MIT

## 🎓 Learning Outcomes

After working through this demo, you'll understand:

- ✅ How to create and configure a GitHub App
- ✅ How to authenticate to GitHub from Azure DevOps using a GitHub App
- ✅ How to use the GitHub REST API with Octokit
- ✅ How to securely store and use credentials in Azure DevOps
- ✅ Best practices for CI/CD automation with GitHub and Azure DevOps
- ✅ Why GitHub Apps are superior to PATs for automation scenarios

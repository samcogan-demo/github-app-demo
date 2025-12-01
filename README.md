# GitHub App Demo - Automation Auth & Package Publishing

This demo showcases how to use **GitHub Apps for automation authentication** and **publishing packages to GitHub Packages**.

## 🎯 What This Demonstrates

1. **GitHub App Authentication**: Using a GitHub App instead of personal access tokens for automation
2. **GitHub Packages**: Publishing npm packages to GitHub's package registry
3. **GitHub Actions**: Automated workflow triggered on push to main branch

## 🏗️ Architecture

```
┌─────────────────┐
│  GitHub Action  │
└────────┬────────┘
         │
         ├─► Generate App Token (using App ID + Private Key)
         │
         ├─► Configure npm with App Token
         │
         └─► Publish Package to GitHub Packages
```

## 📋 Prerequisites

You'll need to create a GitHub App with the following:

### GitHub App Permissions

- **Repository Permissions:**
  - Contents: Read
  - Packages: Read & Write
- **Organization Permissions:**
  - Packages: Read & Write (required for publishing to organization-level packages)

**Important:** After updating permissions, you may need to accept the new permissions in your organization's GitHub App installation settings.

### Installation

Install the GitHub App on your repository or organization.

## 🔧 Setup Instructions

### Step 1: Create a GitHub App

1. Go to your GitHub organization settings (or personal settings)
2. Navigate to **Developer settings** → **GitHub Apps** → **New GitHub App**
3. Fill in the details:
   - **Name**: `Package Publisher Demo` (or your preferred name)
   - **Homepage URL**: Your repository URL
   - **Webhook**: Uncheck "Active" (not needed for this demo)
4. Set permissions:
   - Repository permissions → Contents: Read
   - Repository permissions → Packages: Read and write
   - Organization permissions → Packages: Read and write
5. Click **Create GitHub App**
6. Note down the **App ID**
7. Generate and download a **Private Key**

### Step 2: Install the GitHub App

1. After creating the app, go to **Install App**
2. Install it on your account/organization
3. Select the repository where this demo will run

### Step 3: Configure Repository Secrets

#### For GitHub Actions

Add the following secrets to your repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `APP_ID`: Your GitHub App's ID
   - `APP_PRIVATE_KEY`: Contents of the private key file you downloaded (entire PEM content)

#### For Azure DevOps

Add the following variables to your pipeline:

1. Go to **Pipelines** → Select your pipeline → **Edit** → **Variables**
2. Add these secret variables:
   - `APP_ID`: Your GitHub App's ID
   - `APP_PRIVATE_KEY`: Base64-encoded contents of your private key file - mark as secret
   - `INSTALLATION_ID`: Your GitHub App's installation ID

**Encoding the APP_PRIVATE_KEY:**

GitHub Apps may generate keys in PKCS#1 format (`-----BEGIN RSA PRIVATE KEY-----`), but Node.js crypto library works better with PKCS#8 format. Convert and encode your key:

```bash
# Step 1: Convert PKCS#1 to PKCS#8 (if needed)
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt \
  -in your-app-private-key.pem -out converted-key.pem

# Step 2: Base64 encode for Azure DevOps
# On macOS/Linux:
cat converted-key.pem | base64 | tr -d '\n'

# On Windows (PowerShell):
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("converted-key.pem"))
```

Copy the base64 output and paste it as the `APP_PRIVATE_KEY` variable value.

**Quick check:** If your key starts with `-----BEGIN PRIVATE KEY-----` (not RSA), you can skip the conversion step.

**Finding the Installation ID:**
1. Go to your GitHub App settings
2. Click **Install App** or **Advanced**
3. The installation ID is in the URL: `https://github.com/settings/installations/{INSTALLATION_ID}`
   Or use the GitHub API:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://api.github.com/app/installations
   ```

### Step 4: Update Configuration (if needed)

The workflow automatically configures the package name and scope based on your repository. No manual updates needed!

## 🚀 Usage

### GitHub Actions

#### Manual Trigger

1. Go to **Actions** tab in your repository
2. Select **Publish Package with GitHub App** workflow
3. Click **Run workflow**

#### Automatic Trigger

Push to the `main` branch:

```bash
git add .
git commit -m "Update package"
git push origin main
```

### Azure DevOps Pipelines

#### Setup

1. Create a new pipeline in Azure DevOps
2. Connect to your GitHub repository
3. Select existing pipeline file: `azure-pipelines.yml`
4. Add pipeline variables (see Azure DevOps Setup section below)

#### Manual Trigger

1. Go to **Pipelines** in Azure DevOps
2. Select your pipeline
3. Click **Run pipeline**

#### Automatic Trigger

Push to the `main` branch (configured in `azure-pipelines.yml`)

## 📦 Viewing Published Packages

After successful publication:

1. Go to your repository or organization page
2. Click on **Packages** (on the right sidebar)
3. You'll see your published package: `@YOUR_ORG/YOUR_REPO`

## 🔐 Why GitHub Apps?

### Advantages over PATs (Personal Access Tokens):

✅ **Granular Permissions**: Only grant necessary permissions  
✅ **Organization-wide**: Not tied to a single user account  
✅ **Auditable**: Clear attribution in audit logs  
✅ **Scalable**: Better rate limits  
✅ **Secure**: Tokens are short-lived (default 1 hour)  
✅ **No user dependency**: Workflow doesn't break if a user leaves

## 📚 Package Structure

```
├── .github/
│   └── workflows/
│       └── publish-package.yml  # GitHub Action workflow
├── azure-pipelines.yml          # Azure DevOps pipeline
├── .npmrc                       # npm registry configuration
├── index.js                     # Simple demo module
├── package.json                 # Package metadata
└── README.md                    # This file
```

## 🧪 Testing Locally

Install the package in another project:

```bash
npm install @YOUR_ORG/YOUR_REPO --registry=https://npm.pkg.github.com
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "@YOUR_ORG/YOUR_REPO": "^1.0.0"
  }
}
```

Make sure you have a `.npmrc` file with GitHub authentication:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@YOUR_ORG:registry=https://npm.pkg.github.com/
```

## 🔍 Workflow Breakdown

### GitHub Actions Workflow

The GitHub Action performs these steps:

1. **Checkout**: Gets the repository code
2. **Setup Node.js**: Configures Node.js environment
3. **Generate App Token**: Uses `actions/create-github-app-token` to get a temporary token
4. **Configure npm**: Sets up authentication for GitHub Packages
5. **Update package.json**: Ensures correct scope and repository URL
6. **Publish**: Publishes to GitHub Packages using the app token
7. **Verify**: Confirms successful publication

### Azure DevOps Pipeline

The Azure Pipeline performs these steps:

1. **Install Node.js**: Sets up Node.js environment
2. **Checkout**: Gets the repository code
3. **Install Dependencies**: Installs `@octokit/auth-app` for token generation
4. **Generate App Token**: Uses Octokit to create installation token from App credentials
5. **Configure npm**: Sets up `.npmrc` with authentication
6. **Update package.json**: Dynamically updates package name and repository URL
7. **Publish**: Publishes to GitHub Packages
8. **Verify**: Confirms successful publication

## 🛠️ Troubleshooting

### GitHub Actions

#### Package already exists

If you need to publish a new version, update the `version` field in `package.json`.

#### Authentication failed

- Verify `APP_ID` and `APP_PRIVATE_KEY` secrets are correctly set
- Ensure the GitHub App is installed on the repository
- Check that the app has correct permissions (Contents: Read, Packages: Write)

#### npm publish fails

- Ensure your package name matches the scope: `@YOUR_ORG/package-name`
- Verify the repository has packages enabled

### Azure DevOps

#### Token generation fails

- Verify all three variables are set: `APP_ID`, `APP_PRIVATE_KEY`, `INSTALLATION_ID`
- Ensure `APP_PRIVATE_KEY` is base64 encoded (should be a long single-line string)
- Make sure the variable is marked as "secret" in Azure DevOps
- Verify the original PEM file includes headers (`-----BEGIN RSA PRIVATE KEY-----`)

#### Installation ID not found

- Navigate to your GitHub App → Install App
- Check the URL or use the API to find the installation ID
- Ensure the app is installed on the correct organization/repository

#### Pipeline cannot access npm.pkg.github.com

- Verify the generated token has packages:write permission
- Check that the `.npmrc` file is correctly configured
- Ensure the package name scope matches your GitHub organization

#### Permission denied: installation not allowed to Create organization package

This means the GitHub App lacks organization-level package permissions:
1. Go to your GitHub App settings
2. Navigate to **Permissions** → **Organization permissions**
3. Set **Packages** to **Read and write**
4. Click **Save changes**
5. Go to your organization's **Settings** → **GitHub Apps**
6. Find your app and click **Review request** to approve the new permissions
7. Re-run the pipeline

## 📖 Learn More

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [GitHub Packages](https://docs.github.com/en/packages)
- [actions/create-github-app-token](https://github.com/actions/create-github-app-token)

## 📄 License

MIT

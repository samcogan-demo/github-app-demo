# Quick Setup Guide

This guide walks you through setting up the GitHub App authentication demo step-by-step.

## ⏱️ Time Required

Approximately 15-20 minutes for complete setup.

## 📝 Step-by-Step Instructions

### Part 1: Create the GitHub App (5 minutes)

1. **Navigate to GitHub App creation**:
   - Go to https://github.com/organizations/samcogan-demo/settings/apps
   - Click **"New GitHub App"**

2. **Configure Basic Information**:
   ```
   GitHub App name: Azure DevOps Release Notes Generator
   Homepage URL: https://dev.azure.com/your-org/your-project
   Webhook: [ ] Active (unchecked - not needed)
   ```

3. **Set Permissions** (Repository permissions):
   ```
   Contents: Read and write
   Issues: Read-only
   Pull requests: Read-only
   Metadata: Read-only (auto-selected)
   ```

4. **Create and Configure**:
   - Click **"Create GitHub App"**
   - **Save the App ID** (displayed at the top)
   - Scroll down to **"Private keys"**
   - Click **"Generate a private key"**
   - A `.pem` file will download - **keep this safe**

5. **Install the App**:
   - Click **"Install App"** in the left sidebar
   - Click **"Install"** next to your organization
   - Select: **"All repositories"** or choose specific repositories
   - Click **"Install"**
   - **Note the Installation ID** from the URL: 
     ```
     https://github.com/settings/installations/12345678
                                                ^^^^^^^^
                                                This is your Installation ID
     ```

### Part 2: Prepare Credentials (3 minutes)

1. **Locate your downloaded `.pem` file** (e.g., `azure-devops-release-notes-generator.2024-12-02.private-key.pem`)

2. **Encode the private key to base64**:

   **On macOS/Linux**:
   ```bash
   # Remove line breaks and encode
   base64 -i your-app-name.private-key.pem | tr -d '\n' > encoded-key.txt
   
   # Verify the output
   cat encoded-key.txt
   ```

   **On Windows (PowerShell)**:
   ```powershell
   # Read the file and encode
   $bytes = [System.IO.File]::ReadAllBytes("your-app-name.private-key.pem")
   $encoded = [Convert]::ToBase64String($bytes)
   
   # Save to file
   $encoded | Out-File -FilePath encoded-key.txt -NoNewline
   
   # Display the output
   Get-Content encoded-key.txt
   ```

   **Alternative: Use the PEM file directly (Advanced)**
   
   Instead of base64 encoding, you can use the raw PEM content:
   ```bash
   # On macOS/Linux - convert to single line with \n
   awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' your-app-name.private-key.pem
   ```
   
   However, **base64 encoding is recommended** as it's simpler and less error-prone.

3. **Copy the encoded output** - you'll need it in the next step

   ⚠️ **Important**: Make sure the base64 string:
   - Has NO line breaks or spaces
   - Is a single continuous string
   - Starts with a letter/number (not whitespace)

### Part 3: Configure Azure DevOps (5 minutes)

1. **Go to your Azure DevOps project**:
   - Navigate to **Pipelines** → **Library**
   - Click **"+ Variable group"**

2. **Create a variable group**:
   ```
   Variable group name: GitHub-App-Credentials
   Description: Credentials for GitHub App authentication
   ```

3. **Add variables**:

   Click **"+ Add"** for each variable:

   | Variable name | Value | Keep secret? |
   |--------------|-------|--------------|
   | `APP_ID` | (Your App ID from Step 1.4) | No |
   | `INSTALLATION_ID` | (Your Installation ID from Step 1.5) | No |
   | `APP_PRIVATE_KEY` | (Your base64-encoded key from Step 2) | **Yes** ✓ |

   ⚠️ **Critical**: When pasting `APP_PRIVATE_KEY`:
   - Make sure it's the complete base64 string
   - No extra spaces before or after
   - Click the lock icon to mark it as secret
   - Double-check the value was pasted correctly

4. **Save the variable group**

### Part 4: Create the Pipeline (5 minutes)

1. **In Azure DevOps**, go to **Pipelines** → **Pipelines** → **"New pipeline"**

2. **Select source**:
   - Choose **"GitHub"**
   - Authenticate if prompted
   - Select repository: **`samcogan-demo/github-app-demo`**

3. **Configure pipeline**:
   - Azure DevOps will detect `azure-pipelines.yml`
   - Click **"Existing Azure Pipelines YAML file"**
   - Branch: `main`
   - Path: `/azure-pipelines.yml`
   - Click **"Continue"**

4. **Link the variable group**:
   - Click **"Variables"** → **"Variable groups"**
   - Click **"Link variable group"**
   - Select **"GitHub-App-Credentials"**
   - Click **"Link"**

5. **Save the pipeline**:
   - Click **"Save"** (don't run yet)
   - Optionally rename the pipeline to "Release Notes Generator"

### Part 5: Test the Demo (5 minutes)

1. **Create test data in GitHub**:
   
   ```bash
   # Clone the repo (if you haven't)
   git clone https://github.com/samcogan-demo/github-app-demo.git
   cd github-app-demo
   ```

2. **Create a sample issue**:
   - Go to https://github.com/samcogan-demo/github-app-demo/issues
   - Click **"New issue"**
   - Title: `Add user profile page`
   - Add label: `feature`
   - Click **"Submit new issue"**
   - **Close the issue** (this simulates completed work)

3. **Create and merge a PR**:
   ```bash
   git checkout -b feature/demo-feature
   echo "// Demo feature" >> generate-release-notes.js
   git add .
   git commit -m "Add demo feature"
   git push origin feature/demo-feature
   ```
   - Create a PR on GitHub
   - Add label: `enhancement`
   - Merge the PR

4. **Trigger the pipeline**:
   - Go to your pipeline in Azure DevOps
   - Click **"Run pipeline"**
   - Enter parameters:
     - Tag Name: `v1.0.0`
     - Previous Tag: (leave empty)
   - Click **"Run"**

5. **Watch the magic happen**:
   - The pipeline will run through all steps
   - Check the logs for the generated release notes
   - Go to https://github.com/samcogan-demo/github-app-demo/releases
   - You should see a new release `v1.0.0` with your issues and PRs listed!

## ✅ Verification Checklist

After setup, verify:

- [ ] GitHub App created with correct permissions
- [ ] GitHub App installed on the repository
- [ ] Variable group created in Azure DevOps with all 3 variables
- [ ] Pipeline created and linked to variable group
- [ ] Pipeline runs successfully
- [ ] Release created on GitHub with formatted notes

## 🎯 Next Steps

Now that the demo is working, you can:

1. **Customize the format**: Edit `generate-release-notes.js` to change how notes are formatted
2. **Add more groupings**: Enhance the script to group by more label types
3. **Integrate with other tools**: Use the GitHub App token for other GitHub API calls
4. **Automate on tags**: Push a git tag to auto-trigger: `git tag v1.0.1 && git push origin v1.0.1`

## ❓ Troubleshooting

### Pipeline fails with "error:1E08010C:DECODER routines::unsupported"

**Problem**: Private key format issue - the base64-encoded key wasn't decoded properly.

**Solutions**:
1. Re-encode the private key using the exact commands in Part 2
2. Verify the base64 string has NO line breaks
3. Make sure you marked `APP_PRIVATE_KEY` as secret in Azure DevOps
4. Try this verification:
   ```bash
   # Decode and verify your base64 string
   echo "YOUR_BASE64_STRING" | base64 -d
   # Should output a valid PEM key starting with -----BEGIN
   ```

### Pipeline fails with "Authentication failed"

**Problem**: GitHub App credentials are incorrect or expired.

**Solutions**:
- Verify `APP_ID` matches the GitHub App settings
- Verify `INSTALLATION_ID` is from the installation URL
- Re-encode the private key and update `APP_PRIVATE_KEY`
- Ensure the variable group is linked to the pipeline

### No issues or PRs in release notes

**Problem**: No closed issues or merged PRs found.

**Solutions**:
- Create and close at least one issue
- Create and merge at least one pull request
- Check the date filter if using `PREVIOUS_TAG`

### "Resource not accessible by integration"

**Problem**: GitHub App lacks required permissions.

**Solutions**:
- Go to GitHub App settings
- Verify permissions: Contents (Read & Write), Issues (Read), Pull requests (Read)
- Re-install the app if you changed permissions

### "Missing required credentials"

**Problem**: One or more environment variables are not set.

**Solutions**:
- Verify all three variables exist in the variable group: `APP_ID`, `INSTALLATION_ID`, `APP_PRIVATE_KEY`
- Ensure the variable group is linked to the pipeline
- Check that variable names match exactly (case-sensitive)

## 📞 Need Help?

- Check the main [README.md](README.md) for detailed explanations
- Review Azure DevOps pipeline logs for specific error messages
- Verify each credential value is correct and properly formatted
- The script now includes detailed debugging output to help identify issues

## 🎉 Success!

Once you see the release created on GitHub, you've successfully completed the demo! You now know how to:

- Create and configure GitHub Apps
- Use GitHub Apps for authentication in Azure DevOps
- Query GitHub APIs securely
- Automate release note generation

This pattern can be adapted for many other automation scenarios!

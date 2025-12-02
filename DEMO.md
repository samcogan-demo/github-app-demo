# Demo Presentation Guide

This guide helps you present the GitHub App authentication demo effectively.

## 🎯 Demo Objective

Show how GitHub Apps provide a secure, scalable way to authenticate Azure DevOps pipelines to GitHub, superior to Personal Access Tokens.

## ⏱️ Demo Duration

**10-15 minutes** (full walkthrough)  
**5 minutes** (abbreviated version)

## 📋 Demo Outline

### 1. Introduction (2 minutes)

**Problem Statement**:
> "When Azure DevOps pipelines need to interact with GitHub - creating releases, updating issues, or querying data - how should they authenticate?"

**Common Approaches**:
- ❌ Personal Access Tokens (PATs) - tied to individual users, broad permissions
- ✅ **GitHub Apps** - organization-level, fine-grained permissions, auto-rotating tokens

### 2. Show the Scenario (3 minutes)

**What we're building**:
> "An automated release notes generator that runs in Azure DevOps and:
> - Queries GitHub for closed issues and merged PRs
> - Groups them by type (features, bugs, improvements)
> - Creates a GitHub Release with formatted notes"

**Why it matters**:
- Saves time manually writing release notes
- Ensures consistency across releases
- Provides accountability (who contributed what)
- Demonstrates real-world GitHub API usage

### 3. Architecture Walkthrough (2 minutes)

Show the architecture diagram in README.md:

```
Azure DevOps Pipeline → GitHub App Auth → Installation Token → GitHub API
```

Key points:
1. **GitHub App** installed on the org/repo
2. **Azure DevOps** stores App credentials securely
3. **Node.js script** generates short-lived token
4. **Token** used to call GitHub REST API
5. **Release** created/updated with formatted notes

### 4. Live Demo (5-8 minutes)

#### Option A: Full Demo (8 minutes)

**Step 1**: Show the GitHub App configuration
- Navigate to GitHub App settings
- Point out the permissions (Contents, Issues, PRs)
- Show the installation

**Step 2**: Show Azure DevOps pipeline configuration
- Open the pipeline in Azure DevOps
- Show the variable group with credentials
- Highlight the security (masked variables)

**Step 3**: Show existing issues/PRs
- Open GitHub Issues, show closed issues with labels
- Open Pull Requests, show merged PRs
- Explain these will be included in release notes

**Step 4**: Trigger the pipeline
- Click "Run pipeline"
- Enter tag name: `v1.0.0`
- Start the run

**Step 5**: Watch the execution
- Show the pipeline stages
- Expand the "Generate Release Notes" step
- Point out the authentication success message
- Show the formatted release notes in the log

**Step 6**: Show the result
- Navigate to GitHub Releases
- Show the newly created release
- Point out the sections: Features, Bugs, PRs, Contributors

#### Option B: Quick Demo (5 minutes)

**Pre-run**: Have a pipeline already running or completed

1. Show the pipeline run (2 min)
   - Open the completed pipeline
   - Show the logs with generated notes
   
2. Show the GitHub Release (2 min)
   - Navigate to the release
   - Explain each section
   
3. Quick code review (1 min)
   - Open `generate-release-notes.js`
   - Highlight the authentication code
   - Show the API calls

### 5. Key Takeaways (2 minutes)

**Emphasize**:

✅ **Security**
- Fine-grained permissions (only what's needed)
- Short-lived tokens (1 hour, auto-refresh)
- Organization-level control

✅ **Reliability**
- Not tied to individual users
- Higher rate limits
- Better audit trail

✅ **Flexibility**
- Can be used for many scenarios
- Easy to adapt for other GitHub API operations
- Works with any CI/CD system

**Example scenarios**:
- Creating releases (like this demo)
- Updating issue status
- Creating/merging pull requests
- Syncing repositories
- Generating reports
- Managing project boards

## 🎬 Presentation Tips

### Before the Demo

- [ ] Run the pipeline once to ensure it works
- [ ] Create 2-3 sample issues with different labels
- [ ] Merge at least one PR
- [ ] Have browser tabs pre-opened:
  - GitHub repository
  - Azure DevOps pipeline
  - GitHub App settings (optional)
  - README.md with architecture diagram

### During the Demo

- **Start with the problem** - why not use PATs?
- **Keep it conversational** - ask if audience has faced similar needs
- **Explain as you go** - don't just click, narrate the "why"
- **Show, don't just tell** - actually run the pipeline if time permits
- **Have a backup** - screenshot of successful run if live demo fails

### Common Questions & Answers

**Q: How is this different from a Service Principal or Managed Identity?**
> A: GitHub Apps are GitHub's native authentication mechanism. Service Principals are Azure-specific. GitHub Apps give you GitHub-specific features like installation-level permissions and higher rate limits.

**Q: Can I use this with GitHub Actions instead of Azure DevOps?**
> A: You can! GitHub Actions has the `GITHUB_TOKEN` built-in, but for cross-repo or cross-org scenarios, a GitHub App is still useful. This demo focuses on Azure DevOps since it's external to GitHub.

**Q: What if the GitHub App is deleted or misconfigured?**
> A: The pipeline will fail with a clear authentication error. GitHub Apps have audit logs showing all configuration changes.

**Q: Do I need a separate GitHub App for each project?**
> A: No! One GitHub App can be installed on multiple repositories. You can even have different permissions per installation.

**Q: How do I rotate the private key?**
> A: In GitHub App settings, generate a new private key, update the Azure DevOps variable, test, then revoke the old key.

**Q: Can I use this in production?**
> A: Absolutely! This is a production-ready pattern. Many enterprises use GitHub Apps for automation. Just ensure proper secret management and monitoring.

## 🎭 Demo Variants

### For Developers
- Deep dive into the code
- Show how to extend with additional API calls
- Discuss error handling and retry logic

### For DevOps/Platform Engineers
- Focus on the pipeline configuration
- Discuss secret management best practices
- Show how to set up in different Azure DevOps organizations

### For Security/Compliance
- Emphasize the security benefits
- Show the audit trail in GitHub
- Discuss permission scoping

### For Management
- Focus on the business value (time savings)
- Show the improved release notes quality
- Discuss scalability across teams

## 📊 Success Metrics

After the demo, participants should be able to:

1. ✅ Explain why GitHub Apps are better than PATs for automation
2. ✅ Create a basic GitHub App with appropriate permissions
3. ✅ Configure Azure DevOps to use GitHub App credentials
4. ✅ Understand the authentication flow
5. ✅ Identify other scenarios where this pattern applies

## 🔗 Follow-Up Resources

Share with attendees:
- Repository: https://github.com/samcogan-demo/github-app-demo
- Setup Guide: [SETUP.md](SETUP.md)
- GitHub Apps Docs: https://docs.github.com/en/apps
- Azure Pipelines Docs: https://docs.microsoft.com/en-us/azure/devops/pipelines/

## 📝 Post-Demo

Encourage participants to:
1. Clone the repository and try it themselves
2. Adapt the pattern for their own use cases
3. Share their experiences and improvements
4. Contribute enhancements back to the demo repo

## 🎉 Closing

End with a call to action:
> "This is just one example. GitHub Apps can power many automation scenarios. What will you build with them?"

---

**Good luck with your demo!** 🚀

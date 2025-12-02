#!/usr/bin/env node

/**
 * GitHub App Demo - Automated Release Notes Generator
 * 
 * This application demonstrates using GitHub App authentication to:
 * - Query GitHub Issues and Pull Requests
 * - Generate formatted release notes
 * - Create or update GitHub Releases
 */

const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');

async function generateReleaseNotes() {
  try {
    // Get configuration from environment variables
    const appId = process.env.APP_ID;
    const installationId = process.env.INSTALLATION_ID;
    let privateKey = process.env.APP_PRIVATE_KEY;
    const owner = process.env.GITHUB_OWNER || 'samcogan-demo';
    const repo = process.env.GITHUB_REPO || 'github-app-demo';
    const tagName = process.env.TAG_NAME || 'v1.0.0';
    const previousTag = process.env.PREVIOUS_TAG || null;

    console.log('🚀 Starting Release Notes Generator');
    console.log(`📦 Repository: ${owner}/${repo}`);
    console.log(`🏷️  Tag: ${tagName}`);

    // Validate required credentials
    if (!appId || !installationId || !privateKey) {
      throw new Error('Missing required credentials: APP_ID, INSTALLATION_ID, and APP_PRIVATE_KEY must be set');
    }

    // Decode base64 private key if needed
    console.log('🔑 Processing private key...');
    if (!privateKey.includes('BEGIN')) {
      console.log('   Detected base64-encoded key, decoding...');
      try {
        privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
      } catch (decodeError) {
        throw new Error(`Failed to decode base64 private key: ${decodeError.message}`);
      }
    }

    // Validate the key format
    if (!privateKey.includes('BEGIN') || !privateKey.includes('PRIVATE KEY')) {
      throw new Error('Invalid private key format. Key must be in PEM format and contain BEGIN PRIVATE KEY');
    }

    // Ensure proper line breaks (sometimes they get lost in base64 encoding/decoding)
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    console.log(`   ✓ Private key format validated`);
    console.log(`   Key type: ${privateKey.includes('RSA') ? 'RSA' : 'PKCS8'}`);

    // Authenticate using GitHub App
    console.log('🔐 Authenticating with GitHub App...');
    console.log(`   App ID: ${appId}`);
    console.log(`   Installation ID: ${installationId}`);
    
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey,
        installationId,
      },
    });

    // Verify authentication
    const { data: installation } = await octokit.apps.getInstallation({
      installation_id: installationId,
    });
    console.log(`✅ Authenticated as: ${installation.account.login}`);

    // Get the date range for filtering
    let sinceDate = null;
    if (previousTag) {
      try {
        const { data: previousRelease } = await octokit.repos.getReleaseByTag({
          owner,
          repo,
          tag: previousTag,
        });
        sinceDate = previousRelease.published_at;
        console.log(`📅 Filtering changes since: ${sinceDate}`);
      } catch (error) {
        console.log(`⚠️  Previous tag ${previousTag} not found, including all items`);
      }
    }

    // Fetch closed issues
    console.log('🔍 Fetching closed issues...');
    const issuesQuery = {
      owner,
      repo,
      state: 'closed',
      per_page: 100,
    };
    if (sinceDate) {
      issuesQuery.since = sinceDate;
    }
    const { data: issues } = await octokit.issues.listForRepo(issuesQuery);
    
    // Filter out pull requests (they appear in issues API too)
    const actualIssues = issues.filter(issue => !issue.pull_request);
    console.log(`📋 Found ${actualIssues.length} closed issues`);

    // Fetch merged pull requests
    console.log('🔍 Fetching merged pull requests...');
    const { data: pullRequests } = await octokit.pulls.list({
      owner,
      repo,
      state: 'closed',
      per_page: 100,
    });
    const mergedPRs = pullRequests.filter(pr => pr.merged_at && (!sinceDate || new Date(pr.merged_at) > new Date(sinceDate)));
    console.log(`🔀 Found ${mergedPRs.length} merged pull requests`);

    // Generate release notes
    console.log('📝 Generating release notes...');
    let releaseNotes = `# Release ${tagName}\n\n`;
    releaseNotes += `Released on ${new Date().toLocaleDateString()}\n\n`;
    
    if (previousTag) {
      releaseNotes += `## Changes since ${previousTag}\n\n`;
    }

    // Group issues by labels
    const bugFixes = actualIssues.filter(issue => 
      issue.labels.some(label => label.name.toLowerCase().includes('bug'))
    );
    const features = actualIssues.filter(issue => 
      issue.labels.some(label => label.name.toLowerCase().includes('feature') || label.name.toLowerCase().includes('enhancement'))
    );
    const otherIssues = actualIssues.filter(issue => 
      !bugFixes.includes(issue) && !features.includes(issue)
    );

    if (features.length > 0) {
      releaseNotes += `### ✨ New Features\n\n`;
      features.forEach(issue => {
        releaseNotes += `- ${issue.title} (#${issue.number})\n`;
      });
      releaseNotes += '\n';
    }

    if (bugFixes.length > 0) {
      releaseNotes += `### 🐛 Bug Fixes\n\n`;
      bugFixes.forEach(issue => {
        releaseNotes += `- ${issue.title} (#${issue.number})\n`;
      });
      releaseNotes += '\n';
    }

    if (mergedPRs.length > 0) {
      releaseNotes += `### 🔀 Merged Pull Requests\n\n`;
      mergedPRs.forEach(pr => {
        releaseNotes += `- ${pr.title} (#${pr.number}) by @${pr.user.login}\n`;
      });
      releaseNotes += '\n';
    }

    if (otherIssues.length > 0) {
      releaseNotes += `### 📋 Other Changes\n\n`;
      otherIssues.forEach(issue => {
        releaseNotes += `- ${issue.title} (#${issue.number})\n`;
      });
      releaseNotes += '\n';
    }

    if (actualIssues.length === 0 && mergedPRs.length === 0) {
      releaseNotes += `No issues or pull requests were closed in this release.\n\n`;
    }

    // Add contributors
    const contributors = new Set();
    mergedPRs.forEach(pr => contributors.add(pr.user.login));
    actualIssues.forEach(issue => {
      if (issue.closed_by) {
        contributors.add(issue.closed_by.login);
      }
    });

    if (contributors.size > 0) {
      releaseNotes += `### 👥 Contributors\n\n`;
      releaseNotes += `Thank you to all contributors: ${Array.from(contributors).map(c => `@${c}`).join(', ')}\n\n`;
    }

    console.log('\n📄 Generated Release Notes:');
    console.log('─'.repeat(80));
    console.log(releaseNotes);
    console.log('─'.repeat(80));

    // Create or update the release
    console.log(`\n🚀 Creating release ${tagName}...`);
    try {
      const { data: release } = await octokit.repos.createRelease({
        owner,
        repo,
        tag_name: tagName,
        name: `Release ${tagName}`,
        body: releaseNotes,
        draft: false,
        prerelease: tagName.includes('beta') || tagName.includes('alpha') || tagName.includes('rc'),
      });
      console.log(`✅ Release created successfully!`);
      console.log(`🔗 URL: ${release.html_url}`);
    } catch (error) {
      if (error.status === 422 && error.message.includes('already_exists')) {
        console.log(`⚠️  Release ${tagName} already exists, updating...`);
        const { data: existingRelease } = await octokit.repos.getReleaseByTag({
          owner,
          repo,
          tag: tagName,
        });
        const { data: updatedRelease } = await octokit.repos.updateRelease({
          owner,
          repo,
          release_id: existingRelease.id,
          body: releaseNotes,
        });
        console.log(`✅ Release updated successfully!`);
        console.log(`🔗 URL: ${updatedRelease.html_url}`);
      } else {
        throw error;
      }
    }

    console.log('\n✅ Release notes generation complete!');
    return 0;

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.error('\nStack trace:', error.stack);
    return 1;
  }
}

// Run the script
if (require.main === module) {
  generateReleaseNotes().then(code => process.exit(code));
}

module.exports = { generateReleaseNotes };

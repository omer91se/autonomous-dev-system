#!/usr/bin/env tsx

/**
 * Add UI integration instructions to all agent prompts
 */

import fs from 'fs';
import path from 'path';

const agentsDir = path.join(process.cwd(), 'agents');

const agentConfig = [
  { file: 'pm-agent-prompt.md', name: 'PM Agent', type: 'pm', task: 'Creating detailed product specification with UX research' },
  { file: 'designer-agent-prompt.md', name: 'Designer Agent', type: 'designer', task: 'Creating design system and UI mockups' },
  { file: 'architect-agent-prompt.md', name: 'Architect Agent', type: 'architect', task: 'Designing system architecture and API contracts' },
  { file: 'backend-developer-prompt.md', name: 'Backend Developer', type: 'backend', task: 'Implementing backend APIs and database' },
  { file: 'frontend-developer-prompt.md', name: 'Frontend Developer', type: 'frontend', task: 'Implementing UI components and pages' },
  { file: 'qa-agent-prompt.md', name: 'QA Agent', type: 'qa', task: 'Running tests and quality assurance' },
  { file: 'requirements-agent-prompt.md', name: 'Requirements Agent', type: 'requirements', task: 'Analyzing requirements and gathering specifications' },
  { file: 'coding-agent-prompt.md', name: 'Coding Agent', type: 'coding', task: 'Generating application code' },
  { file: 'analysis-agent-prompt.md', name: 'Analysis Agent', type: 'analysis', task: 'Analyzing codebase and identifying improvements' },
  { file: 'marketing-strategist-prompt.md', name: 'Marketing Strategist', type: 'marketing-strategist', task: 'Creating marketing strategy and go-to-market plan' },
  { file: 'content-creator-prompt.md', name: 'Content Creator', type: 'content', task: 'Creating marketing content and copy' },
  { file: 'seo-specialist-prompt.md', name: 'SEO Specialist', type: 'seo', task: 'Optimizing SEO and keyword research' },
  { file: 'social-media-manager-prompt.md', name: 'Social Media Manager', type: 'social', task: 'Creating social media strategy and content' },
  { file: 'email-marketing-prompt.md', name: 'Email Marketing Agent', type: 'email', task: 'Creating email campaigns and sequences' },
  { file: 'marketing-developer-prompt.md', name: 'Marketing Developer', type: 'marketing-dev', task: 'Implementing marketing pages and features' },
];

function createUISection(agentName: string, agentType: string, task: string): string {
  return `
## 🎨 UI Integration - DO THIS FIRST!

**STEP 1: Register yourself with the UI dashboard**

Before you begin your work, register yourself:

\`\`\`bash
AGENT_ID=$(npx tsx scripts/notify-ui.ts start "${agentName}" "${agentType}" "${task}" | jq -r .agentId)
echo "My Agent ID: $AGENT_ID"
\`\`\`

**STEP 2: When you complete successfully, notify the UI:**

\`\`\`bash
npx tsx scripts/notify-ui.ts complete "$AGENT_ID" "${agentName}" "${agentType}" "Task completed successfully"
\`\`\`

**STEP 3: If you encounter errors, notify the UI:**

\`\`\`bash
npx tsx scripts/notify-ui.ts error "$AGENT_ID" "${agentName}" "${agentType}" "Error message here"
\`\`\`

**IMPORTANT:** Save your AGENT_ID at the start and use it when you complete!

`;
}

function main() {
  for (const agent of agentConfig) {
    const filePath = path.join(agentsDir, agent.file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${agent.file} - file not found`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if already has UI integration
    if (content.includes('## 🎨 UI Integration')) {
      console.log(`✓ ${agent.file} - already has UI integration`);
      continue;
    }

    // Find the first ## heading after the title
    const lines = content.split('\n');
    let insertIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      // Skip the first heading (title)
      if (i > 0 && lines[i].startsWith('## ')) {
        insertIndex = i;
        break;
      }
    }

    if (insertIndex === -1) {
      console.log(`⚠️  Could not find insertion point in ${agent.file}`);
      continue;
    }

    // Insert UI integration section
    const uiSection = createUISection(agent.name, agent.type, agent.task);
    lines.splice(insertIndex, 0, uiSection);

    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent);

    console.log(`✅ Updated ${agent.file}`);
  }

  console.log('\n🎉 Done! All agent prompts updated with UI integration.');
}

main();

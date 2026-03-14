#!/usr/bin/env node

/**
 * Archive Project Script
 *
 * Moves a completed app from output/generated-project/ to projects/{app-name}/
 * and updates the registry with path, port, and metadata.
 *
 * Usage: node scripts/archive-project.js [project-name]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(process.cwd(), 'output');
const GENERATED_PROJECT_DIR = path.join(OUTPUT_DIR, 'generated-project');
const PROJECTS_DIR = path.join(process.cwd(), 'projects');
const REGISTRY_FILE = path.join(process.cwd(), 'shared-infrastructure.json');
const REQUIREMENTS_FILE = path.join(OUTPUT_DIR, 'requirements.json');
const IMPLEMENTATION_FILE = path.join(OUTPUT_DIR, 'implementation.json');

function loadRegistry() {
  if (fs.existsSync(REGISTRY_FILE)) {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  }
  return { projects: [], nextPort: 3100 };
}

function saveRegistry(registry) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

function generateProjectId() {
  return `proj-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getProjectName() {
  // Try to get from requirements.json
  if (fs.existsSync(REQUIREMENTS_FILE)) {
    const requirements = JSON.parse(fs.readFileSync(REQUIREMENTS_FILE, 'utf-8'));
    if (requirements.projectName) {
      return toKebabCase(requirements.projectName);
    }
  }

  // Try to get from implementation.json
  if (fs.existsSync(IMPLEMENTATION_FILE)) {
    const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_FILE, 'utf-8'));
    if (implementation.projectName) {
      return toKebabCase(implementation.projectName);
    }
  }

  // Default
  return `app-${Date.now()}`;
}

function getProjectDisplayName() {
  if (fs.existsSync(REQUIREMENTS_FILE)) {
    const requirements = JSON.parse(fs.readFileSync(REQUIREMENTS_FILE, 'utf-8'));
    return requirements.projectName || 'Unnamed Project';
  }
  return 'Unnamed Project';
}

function archiveProject(projectNameArg) {
  console.log('📦 Starting project archival...\n');

  // Check if generated-project exists
  if (!fs.existsSync(GENERATED_PROJECT_DIR)) {
    console.error('❌ Error: No project found in output/generated-project/');
    process.exit(1);
  }

  // Determine project name
  const projectName = projectNameArg || getProjectName();
  const displayName = getProjectDisplayName();
  const projectPath = path.join(PROJECTS_DIR, projectName);

  console.log(`📋 Project: ${displayName}`);
  console.log(`📁 Name: ${projectName}`);

  // Check if project already exists
  if (fs.existsSync(projectPath)) {
    console.error(`❌ Error: Project already exists at projects/${projectName}/`);
    console.error('   Please delete it first or use a different name.');
    process.exit(1);
  }

  // Ensure projects directory exists
  if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  }

  // Move project
  console.log(`\n🚚 Moving files to projects/${projectName}/...`);
  try {
    // Use cp -R instead of mv to preserve original
    execSync(`cp -R "${GENERATED_PROJECT_DIR}" "${projectPath}"`, { stdio: 'inherit' });
    console.log('✅ Files copied successfully');
  } catch (error) {
    console.error('❌ Failed to move project files:', error.message);
    process.exit(1);
  }

  // Copy metadata files if they exist
  const metadataFiles = [
    { src: REQUIREMENTS_FILE, dest: path.join(projectPath, 'requirements.json') },
    { src: IMPLEMENTATION_FILE, dest: path.join(projectPath, 'implementation.json') }
  ];

  console.log('\n📄 Copying metadata files...');
  for (const { src, dest } of metadataFiles) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied ${path.basename(src)}`);
    }
  }

  // Load registry
  const registry = loadRegistry();

  // Assign port
  const port = registry.nextPort || 3100;
  registry.nextPort = port + 1;

  // Find existing project entry in registry (from infrastructure setup)
  let existingProject = null;
  if (fs.existsSync(REQUIREMENTS_FILE)) {
    const requirements = JSON.parse(fs.readFileSync(REQUIREMENTS_FILE, 'utf-8'));
    const dbName = toSnakeCase(requirements.projectName || projectName);
    existingProject = registry.projects.find(p => p.database === dbName);
  }

  // Create or update project entry
  const projectEntry = {
    id: existingProject?.id || generateProjectId(),
    name: projectName,
    displayName: displayName,
    path: `projects/${projectName}`,
    port: port,
    database: existingProject?.database || toSnakeCase(projectName),
    s3Bucket: existingProject?.s3Bucket || `${projectName}-uploads`,
    s3Region: existingProject?.s3Region || 'us-east-1',
    status: 'active',
    createdAt: existingProject?.createdAt || new Date().toISOString().split('T')[0],
    archivedAt: new Date().toISOString(),
    deletedAt: null,
    lastStartedAt: null
  };

  // Update or add to registry
  if (existingProject) {
    Object.assign(existingProject, projectEntry);
  } else {
    registry.projects.push(projectEntry);
  }

  // Save registry
  saveRegistry(registry);

  console.log('\n✅ Project archived successfully!');
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 Project Details');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Name:       ${displayName}`);
  console.log(`Path:       ${projectPath}`);
  console.log(`Port:       ${port}`);
  console.log(`Database:   ${projectEntry.database}`);
  console.log(`S3 Bucket:  ${projectEntry.s3Bucket}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('🎯 Next Steps:');
  console.log(`   1. View in dashboard: http://localhost:3000/apps`);
  console.log(`   2. Start the app from the dashboard`);
  console.log(`   3. Or manually: cd ${projectPath} && npm install && npm run dev -p ${port}`);
  console.log('');

  return projectEntry;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectName = process.argv[2];
  archiveProject(projectName);
}

export { archiveProject };

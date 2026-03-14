#!/usr/bin/env node

/**
 * Create Project Database Script
 *
 * Automatically creates a new database for a project using shared credentials
 * Called by the coding agent when generating new projects
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// AWS SDK v3 imports (will be installed when needed)
let S3Client, CreateBucketCommand, PutBucketCorsCommand, HeadBucketCommand;
let s3Available = false;

try {
  const awsS3 = await import('@aws-sdk/client-s3');
  S3Client = awsS3.S3Client;
  CreateBucketCommand = awsS3.CreateBucketCommand;
  PutBucketCorsCommand = awsS3.PutBucketCorsCommand;
  HeadBucketCommand = awsS3.HeadBucketCommand;
  s3Available = true;
} catch (error) {
  // AWS SDK not installed - will warn user if they try to create bucket
}

function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

async function createDatabase(projectName) {
  const dbName = toSnakeCase(projectName);
  const bucketName = `${toKebabCase(projectName)}-uploads`;
  const envPath = path.join(__dirname, '..', '.env.shared');

  console.log(`\n🗄️  Creating infrastructure for: ${projectName}`);
  console.log(`   Database name: ${dbName}`);
  console.log(`   S3 Bucket name: ${bucketName}`);

  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env.shared not found!');
    console.error('   Please run: node scripts/setup-infrastructure.js');
    process.exit(1);
  }

  const env = loadEnvFile(envPath);

  // Build connection string
  let connectionString;

  if (env.SHARED_DATABASE_URL) {
    // Cloud database
    connectionString = env.SHARED_DATABASE_URL;
    console.log('   Using cloud database connection');
  } else {
    // Local database
    const host = env.SHARED_DB_HOST || 'localhost';
    const port = env.SHARED_DB_PORT || '5432';
    const user = env.SHARED_DB_USER || 'postgres';
    const password = env.SHARED_DB_PASSWORD || '';

    connectionString = `postgresql://${user}:${password}@${host}:${port}/postgres`;
    console.log('   Using local PostgreSQL');
  }

  // Create database
  try {
    const createCmd = `psql "${connectionString}" -c "CREATE DATABASE ${dbName};"`;
    execSync(createCmd, { stdio: 'pipe' });
    console.log(`✅ Database created: ${dbName}`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`ℹ️  Database already exists: ${dbName}`);
    } else {
      console.error(`❌ Error creating database: ${error.message}`);
      console.error('   Make sure PostgreSQL is running and credentials are correct');
      process.exit(1);
    }
  }

  // Create S3 bucket
  let s3BucketCreated = false;
  if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
    s3BucketCreated = await createS3Bucket(bucketName, env);
  } else {
    console.log('⚠️  No AWS credentials configured - skipping S3 bucket creation');
  }

  // Update shared-infrastructure.json
  const configPath = path.join(__dirname, '..', 'shared-infrastructure.json');

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Check if project already exists
      const existingProject = config.projects.find(p => p.database === dbName);

      if (!existingProject) {
        config.projects.push({
          name: toKebabCase(projectName),
          database: dbName,
          s3Bucket: bucketName,
          s3Region: env.AWS_REGION || 'us-east-1',
          createdAt: new Date().toISOString().split('T')[0],
          status: 'active'
        });

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(`✅ Registered project in shared-infrastructure.json`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not update shared-infrastructure.json: ${error.message}`);
    }
  }

  // Return infrastructure info
  const projectConnectionString = connectionString.replace(/\/\w+$/, `/${dbName}`);

  console.log(`\n📋 Infrastructure ready!`);
  console.log(`   Database: ${projectConnectionString}`);
  if (s3BucketCreated) {
    console.log(`   S3 Bucket: s3://${bucketName}`);
  }

  return {
    dbName,
    bucketName,
    connectionString: projectConnectionString,
    env
  };
}

async function createS3Bucket(bucketName, env) {
  console.log(`\n📦 Creating S3 bucket: ${bucketName}`);

  if (!s3Available) {
    console.warn('⚠️  AWS SDK not installed. Installing...');
    try {
      execSync('npm install @aws-sdk/client-s3', { stdio: 'inherit' });
      console.log('✅ AWS SDK installed');
      // Reload the module
      const awsS3 = await import('@aws-sdk/client-s3');
      S3Client = awsS3.S3Client;
      CreateBucketCommand = awsS3.CreateBucketCommand;
      PutBucketCorsCommand = awsS3.PutBucketCorsCommand;
      HeadBucketCommand = awsS3.HeadBucketCommand;
    } catch (error) {
      console.error(`❌ Failed to install AWS SDK: ${error.message}`);
      return false;
    }
  }

  const region = env.AWS_REGION || 'us-east-1';

  const s3Client = new S3Client({
    region: region,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Check if bucket already exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`ℹ️  Bucket already exists: ${bucketName}`);
      return true;
    } catch (headError) {
      // Bucket doesn't exist, create it
    }

    // Create bucket
    const createParams = {
      Bucket: bucketName,
    };

    // For regions other than us-east-1, we need to specify LocationConstraint
    if (region !== 'us-east-1') {
      createParams.CreateBucketConfiguration = {
        LocationConstraint: region,
      };
    }

    await s3Client.send(new CreateBucketCommand(createParams));
    console.log(`✅ S3 bucket created: ${bucketName}`);

    // Set CORS configuration for web uploads
    const corsParams = {
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'], // In production, restrict this to your domain
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    };

    await s3Client.send(new PutBucketCorsCommand(corsParams));
    console.log(`✅ CORS configured for bucket`);

    return true;
  } catch (error) {
    console.error(`❌ Error creating S3 bucket: ${error.message}`);

    if (error.name === 'BucketAlreadyOwnedByYou') {
      console.log(`ℹ️  Bucket already exists: ${bucketName}`);
      return true;
    }

    if (error.name === 'InvalidAccessKeyId' || error.name === 'SignatureDoesNotMatch') {
      console.error('   Check your AWS credentials in .env.shared');
    }

    if (error.message.includes('Access Denied')) {
      console.error('   Your AWS credentials need S3 bucket creation permissions');
      console.error('   Required IAM permissions: s3:CreateBucket, s3:PutBucketCORS');
    }

    return false;
  }
}

// CLI usage
const projectName = process.argv[2];

if (!projectName) {
  console.error('Usage: node create-project-db.js "Project Name"');
  process.exit(1);
}

await createDatabase(projectName);

export { createDatabase, toSnakeCase, toKebabCase };

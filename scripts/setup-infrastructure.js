#!/usr/bin/env node

/**
 * Infrastructure Setup Script
 *
 * This script helps you set up the shared infrastructure for all generated projects.
 * Run once to configure database, S3, Stripe, email, etc.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`),
};

async function main() {
  console.clear();
  log.header('╔════════════════════════════════════════════════════════════════╗');
  log.header('║       Autonomous Dev System - Infrastructure Setup            ║');
  log.header('╚════════════════════════════════════════════════════════════════╝');

  const envPath = path.join(__dirname, '..', '.env.shared');

  // Check if .env.shared already exists
  if (fs.existsSync(envPath)) {
    log.success('.env.shared already exists!\n');

    const envContent = fs.readFileSync(envPath, 'utf8');

    // Check if it has real values (not placeholders)
    const hasRealValues =
      !envContent.includes('your_aws_access_key') &&
      !envContent.includes('generate_with_openssl');

    if (hasRealValues) {
      log.info('Your infrastructure is already configured.');
      log.info('Current configuration found.\n');

      const choice = await question('What would you like to do?\n  1. Keep existing configuration (recommended)\n  2. Reconfigure everything\n  3. View current configuration\n\nChoice (1-3): ');

      if (choice === '1') {
        log.success('\n✅ Keeping existing configuration!');
        log.info('\nYour shared infrastructure is ready to use.');
        log.info('To generate a new app, run: /build-app\n');
        rl.close();
        return;
      } else if (choice === '3') {
        console.log('\n' + '='.repeat(70));
        console.log('CURRENT CONFIGURATION:');
        console.log('='.repeat(70));

        // Show sanitized version (hide secrets)
        const lines = envContent.split('\n');
        lines.forEach(line => {
          if (line.includes('PASSWORD') || line.includes('SECRET') || line.includes('KEY')) {
            const [key] = line.split('=');
            console.log(`${key}=***hidden***`);
          } else if (!line.startsWith('#') && line.trim()) {
            console.log(line);
          }
        });
        console.log('='.repeat(70) + '\n');

        const confirm = await question('Continue with existing configuration? (y/n): ');
        if (confirm.toLowerCase() === 'y') {
          log.success('\n✅ Keeping existing configuration!\n');
          rl.close();
          return;
        }
      }

      log.warning('\nReconfiguring infrastructure...\n');
    }
  }

  log.info('This wizard will help you set up shared infrastructure for all projects.\n');
  log.info('You only need to do this once. All generated apps will use these settings.\n');

  const config = {};

  // Load existing config if reconfiguring
  let existingEnv = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          existingEnv[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }

  // Database Setup
  log.header('📊 DATABASE SETUP');

  const hasExistingDb = existingEnv.SHARED_DATABASE_URL ||
                        (existingEnv.SHARED_DB_HOST && !existingEnv.SHARED_DB_HOST.includes('your_'));

  if (hasExistingDb) {
    log.success('Existing database configuration found!');
    if (existingEnv.SHARED_DATABASE_URL) {
      const maskedUrl = existingEnv.SHARED_DATABASE_URL.replace(/:[^:@]+@/, ':***@');
      console.log(`   Current: ${maskedUrl}\n`);
    } else {
      console.log(`   Current: ${existingEnv.SHARED_DB_HOST}:${existingEnv.SHARED_DB_PORT}\n`);
    }

    const keepDb = await question('Keep existing database configuration? (y/n): ');

    if (keepDb.toLowerCase() === 'y') {
      log.success('✓ Keeping existing database configuration\n');
      // Copy existing config
      if (existingEnv.SHARED_DATABASE_URL) {
        config.dbConnectionString = existingEnv.SHARED_DATABASE_URL;
      } else {
        config.dbHost = existingEnv.SHARED_DB_HOST;
        config.dbPort = existingEnv.SHARED_DB_PORT;
        config.dbUser = existingEnv.SHARED_DB_USER;
        config.dbPassword = existingEnv.SHARED_DB_PASSWORD;
      }
    } else {
      log.info('\nChoose your database option:');
      console.log('  1. Local PostgreSQL (recommended for development)');
      console.log('  2. Supabase (cloud, free tier available)');
      console.log('  3. Railway (cloud, free trial)\n');

      const dbChoice = await question('Enter choice (1-3): ');

      if (dbChoice === '1') {
        config.dbHost = await question('PostgreSQL host [localhost]: ') || 'localhost';
        config.dbPort = await question('PostgreSQL port [5432]: ') || '5432';
        config.dbUser = await question('PostgreSQL user [postgres]: ') || 'postgres';
        config.dbPassword = await question('PostgreSQL password: ');
      } else {
        config.dbConnectionString = await question('Enter database connection string: ');
      }
    }
  } else {
    log.info('Choose your database option:');
    console.log('  1. Local PostgreSQL (recommended for development)');
    console.log('  2. Supabase (cloud, free tier available)');
    console.log('  3. Railway (cloud, free trial)\n');

    const dbChoice = await question('Enter choice (1-3): ');

    if (dbChoice === '1') {
      config.dbHost = await question('PostgreSQL host [localhost]: ') || 'localhost';
      config.dbPort = await question('PostgreSQL port [5432]: ') || '5432';
      config.dbUser = await question('PostgreSQL user [postgres]: ') || 'postgres';
      config.dbPassword = await question('PostgreSQL password: ');
    } else {
      config.dbConnectionString = await question('Enter database connection string: ');
    }
  }

  // S3 Setup
  log.header('📦 FILE STORAGE SETUP (AWS S3)');
  log.info('The system will auto-create a separate S3 bucket for each project.\n');

  const hasExistingAws = existingEnv.AWS_ACCESS_KEY_ID &&
                         !existingEnv.AWS_ACCESS_KEY_ID.includes('your_aws');

  if (hasExistingAws) {
    log.success('Existing AWS configuration found!');
    console.log(`   Access Key: ${existingEnv.AWS_ACCESS_KEY_ID.substring(0, 8)}...`);
    console.log(`   Region: ${existingEnv.AWS_REGION}\n`);

    const keepAws = await question('Keep existing AWS configuration? (y/n): ');

    if (keepAws.toLowerCase() === 'y') {
      log.success('✓ Keeping existing AWS configuration\n');
      config.awsAccessKey = existingEnv.AWS_ACCESS_KEY_ID;
      config.awsSecretKey = existingEnv.AWS_SECRET_ACCESS_KEY;
      config.awsRegion = existingEnv.AWS_REGION;
    } else {
      config.awsAccessKey = await question('AWS Access Key ID: ');
      config.awsSecretKey = await question('AWS Secret Access Key: ');
      config.awsRegion = await question('AWS Region [us-east-1]: ') || 'us-east-1';
      log.info('\n✓ Each project will get its own bucket: {project-name}-uploads');
    }
  } else {
    log.info('You need AWS credentials with S3 bucket creation permissions.\n');

    const hasAws = await question('Do you have AWS credentials? (y/n): ');

    if (hasAws.toLowerCase() === 'y') {
      config.awsAccessKey = await question('AWS Access Key ID: ');
      config.awsSecretKey = await question('AWS Secret Access Key: ');
      config.awsRegion = await question('AWS Region [us-east-1]: ') || 'us-east-1';
      log.info('\n✓ Each project will get its own bucket: {project-name}-uploads');
    } else {
      log.warning('Skipping S3 setup. You can configure this later in .env.shared');
    }
  }

  // Stripe Setup
  log.header('💳 PAYMENT SETUP (Stripe)');

  const hasExistingStripe = existingEnv.STRIPE_SECRET_KEY &&
                            !existingEnv.STRIPE_SECRET_KEY.includes('your_key');

  if (hasExistingStripe) {
    log.success('Existing Stripe configuration found!');
    console.log(`   Secret Key: ${existingEnv.STRIPE_SECRET_KEY.substring(0, 12)}...\n`);

    const keepStripe = await question('Keep existing Stripe configuration? (y/n): ');

    if (keepStripe.toLowerCase() === 'y') {
      log.success('✓ Keeping existing Stripe configuration\n');
      config.stripeSecretKey = existingEnv.STRIPE_SECRET_KEY;
      config.stripePublishableKey = existingEnv.STRIPE_PUBLISHABLE_KEY;
    } else {
      config.stripeSecretKey = await question('Stripe Secret Key (sk_test_...): ');
      config.stripePublishableKey = await question('Stripe Publishable Key (pk_test_...): ');
    }
  } else {
    log.info('Get test keys from: https://dashboard.stripe.com/test/apikeys\n');

    const hasStripe = await question('Do you have Stripe test keys? (y/n): ');

    if (hasStripe.toLowerCase() === 'y') {
      config.stripeSecretKey = await question('Stripe Secret Key (sk_test_...): ');
      config.stripePublishableKey = await question('Stripe Publishable Key (pk_test_...): ');
    } else {
      log.warning('Skipping Stripe setup. You can configure this later in .env.shared');
    }
  }

  // Email Setup
  log.header('📧 EMAIL SETUP');

  const hasExistingEmail = existingEnv.EMAIL_PROVIDER ||
                           (existingEnv.SENDGRID_API_KEY && !existingEnv.SENDGRID_API_KEY.includes('your_'));

  if (hasExistingEmail) {
    log.success('Existing email configuration found!');
    console.log(`   Provider: ${existingEnv.EMAIL_PROVIDER || 'sendgrid'}`);
    console.log(`   From: ${existingEnv.EMAIL_FROM}\n`);

    const keepEmail = await question('Keep existing email configuration? (y/n): ');

    if (keepEmail.toLowerCase() === 'y') {
      log.success('✓ Keeping existing email configuration\n');
      config.emailProvider = existingEnv.EMAIL_PROVIDER;
      config.emailFrom = existingEnv.EMAIL_FROM;
      config.sendgridApiKey = existingEnv.SENDGRID_API_KEY;
      config.resendApiKey = existingEnv.RESEND_API_KEY;
      config.emailHost = existingEnv.EMAIL_SERVER_HOST;
      config.emailPort = existingEnv.EMAIL_SERVER_PORT;
      config.emailUser = existingEnv.EMAIL_SERVER_USER;
      config.emailPassword = existingEnv.EMAIL_SERVER_PASSWORD;
    } else {
      log.info('Choose your email provider:');
      console.log('  1. SendGrid (recommended, 100 emails/day free)');
      console.log('  2. Resend (modern, 100 emails/day free)');
      console.log('  3. Gmail (testing only)');
      console.log('  4. Mailtrap (testing only - captures emails)\n');

      const emailChoice = await question('Enter choice (1-4) or skip: ');

      if (emailChoice === '1') {
        config.emailProvider = 'sendgrid';
        config.sendgridApiKey = await question('SendGrid API Key: ');
        config.emailFrom = await question('From email address: ');
      } else if (emailChoice === '2') {
        config.emailProvider = 'resend';
        config.resendApiKey = await question('Resend API Key: ');
        config.emailFrom = await question('From email address: ');
      } else if (emailChoice === '3') {
        config.emailProvider = 'smtp';
        config.emailHost = 'smtp.gmail.com';
        config.emailPort = '587';
        config.emailUser = await question('Gmail address: ');
        config.emailPassword = await question('Gmail App Password: ');
        config.emailFrom = config.emailUser;
      } else if (emailChoice === '4') {
        config.emailProvider = 'mailtrap';
        config.emailHost = 'smtp.mailtrap.io';
        config.emailPort = '2525';
        config.emailUser = await question('Mailtrap username: ');
        config.emailPassword = await question('Mailtrap password: ');
      }
    }
  } else {
    log.info('Choose your email provider:');
    console.log('  1. SendGrid (recommended, 100 emails/day free)');
    console.log('  2. Resend (modern, 100 emails/day free)');
    console.log('  3. Gmail (testing only)');
    console.log('  4. Mailtrap (testing only - captures emails)\n');

    const emailChoice = await question('Enter choice (1-4) or skip: ');

    if (emailChoice === '1') {
      config.emailProvider = 'sendgrid';
      config.sendgridApiKey = await question('SendGrid API Key: ');
      config.emailFrom = await question('From email address: ');
    } else if (emailChoice === '2') {
      config.emailProvider = 'resend';
      config.resendApiKey = await question('Resend API Key: ');
      config.emailFrom = await question('From email address: ');
    } else if (emailChoice === '3') {
      config.emailProvider = 'smtp';
      config.emailHost = 'smtp.gmail.com';
      config.emailPort = '587';
      config.emailUser = await question('Gmail address: ');
      config.emailPassword = await question('Gmail App Password: ');
      config.emailFrom = config.emailUser;
    } else if (emailChoice === '4') {
      config.emailProvider = 'mailtrap';
      config.emailHost = 'smtp.mailtrap.io';
      config.emailPort = '2525';
      config.emailUser = await question('Mailtrap username: ');
      config.emailPassword = await question('Mailtrap password: ');
    }
  }

  // Generate NextAuth Secret
  log.header('🔐 AUTHENTICATION SETUP');

  const hasExistingSecret = existingEnv.NEXTAUTH_SECRET &&
                            !existingEnv.NEXTAUTH_SECRET.includes('generate_with');

  if (hasExistingSecret) {
    log.success('Existing NextAuth secret found!');
    console.log(`   Secret: ${existingEnv.NEXTAUTH_SECRET.substring(0, 8)}...\n`);

    const keepSecret = await question('Keep existing NextAuth secret? (y/n): ');

    if (keepSecret.toLowerCase() === 'y') {
      log.success('✓ Keeping existing NextAuth secret\n');
      config.nextauthSecret = existingEnv.NEXTAUTH_SECRET;
    } else {
      log.info('Generating new NextAuth secret...');
      try {
        config.nextauthSecret = execSync('openssl rand -base64 32').toString().trim();
        log.success('NextAuth secret generated!');
      } catch (error) {
        log.warning('Could not auto-generate secret. Please run: openssl rand -base64 32');
      }
    }
  } else {
    log.info('Generating NextAuth secret...');
    try {
      config.nextauthSecret = execSync('openssl rand -base64 32').toString().trim();
      log.success('NextAuth secret generated!');
    } catch (error) {
      log.warning('Could not auto-generate secret. Please run: openssl rand -base64 32');
    }
  }

  // Write .env.shared file
  log.header('💾 SAVING CONFIGURATION');

  const envContent = generateEnvFile(config);

  fs.writeFileSync(envPath, envContent);
  log.success(`Configuration saved to: ${envPath}`);

  // Summary
  log.header('✅ SETUP COMPLETE!');
  console.log('\nYour shared infrastructure is configured. Next steps:\n');
  console.log('  1. Review and edit .env.shared if needed');
  console.log('  2. Generate new projects - they will automatically use this config');
  console.log('  3. Each project gets its own database within your PostgreSQL instance\n');

  log.info('To generate a new app, run: /build-app\n');

  rl.close();
}

function generateEnvFile(config) {
  let content = `# Shared Infrastructure Configuration
# Generated on ${new Date().toISOString()}
# DO NOT commit this file to version control

# ============================================================================
# DATABASE
# ============================================================================
`;

  if (config.dbConnectionString) {
    content += `SHARED_DATABASE_URL=${config.dbConnectionString}\n`;
  } else {
    content += `SHARED_DB_HOST=${config.dbHost || 'localhost'}
SHARED_DB_PORT=${config.dbPort || '5432'}
SHARED_DB_USER=${config.dbUser || 'postgres'}
SHARED_DB_PASSWORD=${config.dbPassword || ''}
`;
  }

  content += `
# ============================================================================
# AWS S3 (Auto-creates bucket per project)
# ============================================================================
AWS_ACCESS_KEY_ID=${config.awsAccessKey || 'your_aws_access_key'}
AWS_SECRET_ACCESS_KEY=${config.awsSecretKey || 'your_aws_secret_key'}
AWS_REGION=${config.awsRegion || 'us-east-1'}
# Note: Buckets are auto-created per project as: {project-name}-uploads

# ============================================================================
# AUTHENTICATION
# ============================================================================
NEXTAUTH_SECRET=${config.nextauthSecret || 'generate_with_openssl_rand_base64_32'}

# ============================================================================
# STRIPE
# ============================================================================
STRIPE_SECRET_KEY=${config.stripeSecretKey || 'sk_test_your_key'}
STRIPE_PUBLISHABLE_KEY=${config.stripePublishableKey || 'pk_test_your_key'}
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ============================================================================
# EMAIL
# ============================================================================
`;

  if (config.emailProvider === 'sendgrid') {
    content += `EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=${config.sendgridApiKey}
EMAIL_FROM=${config.emailFrom}
`;
  } else if (config.emailProvider === 'resend') {
    content += `EMAIL_PROVIDER=resend
RESEND_API_KEY=${config.resendApiKey}
EMAIL_FROM=${config.emailFrom}
`;
  } else if (config.emailProvider === 'smtp' || config.emailProvider === 'mailtrap') {
    content += `EMAIL_PROVIDER=${config.emailProvider}
EMAIL_SERVER_HOST=${config.emailHost}
EMAIL_SERVER_PORT=${config.emailPort}
EMAIL_SERVER_USER=${config.emailUser}
EMAIL_SERVER_PASSWORD=${config.emailPassword}
EMAIL_FROM=${config.emailFrom || config.emailUser}
`;
  }

  return content;
}

main().catch((error) => {
  log.error(`Error: ${error.message}`);
  process.exit(1);
});

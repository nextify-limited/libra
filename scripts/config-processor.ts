#!/usr/bin/env bun

/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * config-processor.ts
 * Copyright (C) 2025 Nextify Limited
 *
 * Simple configuration file processor - replaces {{placeholder}} with actual values
 * No sed/perl needed - just simple string replacement
 */

import { readFileSync, writeFileSync } from 'node:fs'

/**
 * Simple placeholder replacement - replaces {{KEY}} with environment variable values
 */
function replaceConfigPlaceholders(templatePath: string, outputPath: string): void {
  // Read template
  let content = readFileSync(templatePath, 'utf-8')
  
  // Get all environment variables
  const env = process.env
  
  // Default values for missing environment variables
  const defaults: Record<string, string> = {
    // Environment
    ENVIRONMENT: 'production',

    // Application URLs
    NEXT_PUBLIC_APP_URL: 'https://libra.dev',
    NEXT_PUBLIC_CDN_URL: 'https://cdn.libra.dev',

    // Cloudflare
    CLOUDFLARE_AIGATEWAY_NAME: 'azure-ai',

    // Logging
    LOG_LEVEL: 'info',

    // Placeholder values for type generation when real values are missing
    DATABASE_ID: '00000000-0000-0000-0000-000000000000',
    KV_NAMESPACE_ID: '0000000000000000000000000000000000',
    HYPERDRIVE_ID: '00000000-0000-0000-0000-000000000000',

    // Security placeholder
    TURNSTILE_SECRET_KEY: '0x0000000000000000000000000000000000000000',

    // Payment placeholders (optional)
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',

    // Admin placeholder (optional)
    ADMIN_USER_IDS: '',

    // Email service placeholders (optional)
    RESEND_API_KEY: '',
    RESEND_FROM: '',

    // Dispatcher-specific defaults
    DISPATCH_NAMESPACE_NAME: 'libra-dispatcher',

    // AI API Keys placeholders (for type generation)
    ANTHROPIC_API_KEY: 'sk-ant-api03-placeholder',
    OPENAI_API_KEY: 'sk-proj-placeholder',
    GEMINI_API_KEY: 'AIzaSyPlaceholder',
    XAI_API_KEY: 'xai-placeholder',
    DEEPSEEK_API_KEY: 'sk-placeholder',
    OPENROUTER_API_KEY: 'sk-or-v1-placeholder',
    CUSTOM_API_KEY: 'placeholder',

    // Azure AI configuration defaults
    AZURE_DEPLOYMENT_NAME: 'gpt-5',
    AZURE_RESOURCE_NAME: 'libra-o4-mini',
    AZURE_API_KEY: 'placeholder-azure-key',
    AZURE_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/',

    // Additional services placeholders
    E2B_API_KEY: 'e2b_placeholder',
    LIBRA_GITHUB_TOKEN: 'ghp_placeholder',

    // Security placeholders
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAABgQW7OpphMdlFWn',

    // Feature flags
    REASONING_ENABLED: 'FALSE',
    ENHANCED_PROMPT: 'TRUE',
    NEXT_PUBLIC_SCAN: '1',

    // GitHub configuration
    LIBRA_GITHUB_OWNER: 'nextify-limted',
    LIBRA_GITHUB_REPO: 'libra',

    // Analytics placeholders
    NEXT_PUBLIC_POSTHOG_KEY: 'phc_placeholder',
    NEXT_PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com',

    // Authentication placeholders (for type generation)
    BETTER_AUTH_SECRET: 'placeholder-auth-secret-32-chars-min',
    BETTER_GITHUB_CLIENT_ID: 'Ov23placeholder',
    BETTER_GITHUB_CLIENT_SECRET: 'placeholder-github-client-secret',
    GITHUB_OAUTH_CLIENT_ID: 'Ov23oauth_placeholder',
    GITHUB_OAUTH_CLIENT_SECRET: 'placeholder-oauth-client-secret',

    // Database placeholder (for type generation)
    POSTGRES_URL: 'postgresql://user:password@localhost:5432/placeholder_db',
  }
  
  // Replace all {{KEY}} placeholders
  content = content.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = env[key] || defaults[key]
    if (value === undefined) {
      console.warn(`⚠️  No value found for placeholder: ${match}`)
      return match // Keep placeholder if no value found
    }
    return value
  })
  
  // Write output
  writeFileSync(outputPath, content, 'utf-8')
}

// CLI usage - check if this script is being run directly
async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error('Usage: bun config-processor.ts <template-path> <output-path>')
    console.error('Example: bun config-processor.ts wrangler.jsonc.example wrangler.jsonc')
    process.exit(1)
  }

  const [templatePath, outputPath] = args

  // Ensure arguments are defined before calling the function
  if (!templatePath || !outputPath) {
    console.error('Error: Both template-path and output-path must be provided')
    process.exit(1)
  }

  replaceConfigPlaceholders(templatePath, outputPath)
}

// Only run main if this script is executed directly (not imported)
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error)
} else if (typeof import.meta !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

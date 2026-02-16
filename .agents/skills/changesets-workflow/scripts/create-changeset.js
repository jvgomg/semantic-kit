#!/usr/bin/env node

/**
 * Create a changeset programmatically without interactive prompts
 *
 * Usage:
 *   node create-changeset.js "@webspecs/core:minor,@webspecs/cli:patch" "Add new feature"
 *   node create-changeset.js "@webspecs/core:major" "Breaking change in API" "Detailed description here"
 *
 * Format:
 *   First argument: Comma-separated list of package:bumpType pairs
 *   Second argument: Summary (first line of changeset)
 *   Third argument (optional): Additional details for summary
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

// Parse command line arguments
const [, , releasesArg, summary, details] = process.argv;

if (!releasesArg || !summary) {
  console.error('Usage: node create-changeset.js "pkg1:type,pkg2:type" "Summary" ["Details"]');
  console.error('Example: node create-changeset.js "@webspecs/core:minor,@webspecs/cli:patch" "Add new feature"');
  process.exit(1);
}

// Parse releases argument
const releases = releasesArg.split(',').map(release => {
  const [name, type] = release.trim().split(':');
  if (!name || !type) {
    console.error(`Invalid release format: ${release}`);
    console.error('Expected format: package-name:major|minor|patch');
    process.exit(1);
  }
  if (!['major', 'minor', 'patch'].includes(type)) {
    console.error(`Invalid bump type: ${type}. Must be major, minor, or patch`);
    process.exit(1);
  }
  return { name, type };
});

// Generate random changeset ID (similar to how changesets does it)
const adjectives = ['big', 'small', 'fast', 'slow', 'happy', 'sad', 'bright', 'dark', 'quick', 'lazy', 'cool', 'warm', 'brave', 'calm', 'wise', 'wild'];
const nouns = ['lions', 'tigers', 'bears', 'wolves', 'eagles', 'foxes', 'owls', 'hawks', 'cats', 'dogs', 'birds', 'fish', 'trees', 'rocks'];
const verbs = ['run', 'jump', 'dance', 'sing', 'fly', 'swim', 'walk', 'sleep', 'play', 'work', 'rest', 'smile'];

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const changesetId = `${randomElement(adjectives)}-${randomElement(nouns)}-${randomElement(verbs)}`;

// Build changeset content
const frontmatter = releases
  .map(({ name, type }) => `"${name}": ${type}`)
  .join('\n');

const fullSummary = details ? `${summary}\n\n${details}` : summary;

const changesetContent = `---
${frontmatter}
---

${fullSummary}
`;

// Write changeset file
const changesetDir = join(process.cwd(), '.changeset');
mkdirSync(changesetDir, { recursive: true });

const changesetPath = join(changesetDir, `${changesetId}.md`);
writeFileSync(changesetPath, changesetContent, 'utf8');

console.log(`✅ Created changeset: ${changesetId}`);
console.log(`   Path: ${changesetPath}`);
console.log(`\nReleases:`);
releases.forEach(({ name, type }) => {
  console.log(`   ${name}: ${type}`);
});
console.log(`\nSummary:\n${fullSummary}`);

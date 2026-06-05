const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo (hoisted node_modules & @company/shared)
config.watchFolders = [workspaceRoot];

// 2. Let Metro look for dependencies in the workspace root first, then project root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve hoisted packages correctly
config.resolver.disableHierarchicalLookup = true;

module.exports = config;

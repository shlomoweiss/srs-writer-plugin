/**
 * FindInFiles Tool Functional Tests
 * Tests real-world end-to-end usage scenarios and workflows
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { findInFiles } from '../../tools/atomic/smart-edit-tools';
import { FindInFilesArgs } from '../../tools/atomic/findInFiles/types';

describe('FindInFiles - Functional Tests', () => {
  let testProjectDir: string;
  let originalCwd: string;

  beforeAll(async () => {
    originalCwd = process.cwd();
    
    // Create a complex test project structure simulating a real development project
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'findinfiles-functional-test-'));
    testProjectDir = tempDir;
    
    // Create typical project structure
    await fs.mkdir(path.join(testProjectDir, 'src', 'components'), { recursive: true });
    await fs.mkdir(path.join(testProjectDir, 'src', 'utils'), { recursive: true });
    await fs.mkdir(path.join(testProjectDir, 'src', 'types'), { recursive: true });
    await fs.mkdir(path.join(testProjectDir, 'tests', 'unit'), { recursive: true });
    await fs.mkdir(path.join(testProjectDir, 'tests', 'integration'), { recursive: true });
    await fs.mkdir(path.join(testProjectDir, 'docs'), { recursive: true });
    await fs.mkdir(path.join(testProjectDir, 'config'), { recursive: true });
    
    // Create SRS-related files
    await fs.writeFile(path.join(testProjectDir, 'SRS.md'), `
# Software Requirements Specification

## 1. Introduction
This document describes the requirements for our e-commerce platform.

### 1.1 Purpose
The purpose is to define functional requirements (FR-001, FR-002) and use cases (UC-001, UC-002).

## 2. Functional Requirements
- FR-001: User authentication system
- FR-002: Product catalog management  
- FR-003: Shopping cart functionality

## 3. Use Cases
- UC-001: User login process
- UC-002: Product browsing
- UC-003: Checkout process

TODO: Add more detailed specifications
`);

    await fs.writeFile(path.join(testProjectDir, 'requirements.yaml'), `
version: "1.0"
project_name: "E-commerce Platform"
requirements:
  FR-001:
    title: "User Authentication"
    description: "System shall provide secure user login"
    priority: "high"
    depends_on: []
  FR-002:
    title: "Product Catalog"
    description: "System shall manage product information"
    priority: "medium"
    depends_on: ["FR-001"]
`);

    // Create code files
    await fs.writeFile(path.join(testProjectDir, 'src', 'components', 'LoginForm.tsx'), `
import React from 'react';

interface LoginFormProps {
  onSubmit: (credentials: UserCredentials) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form validation
    console.log('Login form submitted');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
`);

    await fs.writeFile(path.join(testProjectDir, 'src', 'utils', 'api.ts'), `
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint: string): Promise<any> {
    return fetch(\`\${this.baseUrl}/\${endpoint}\`);
  }

  async post(endpoint: string, data: any): Promise<any> {
    return fetch(\`\${this.baseUrl}/\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

// FIXME: Add proper error handling
export const API_BASE_URL = 'https://api.example.com';
`);

    await fs.writeFile(path.join(testProjectDir, 'src', 'types', 'index.ts'), `
export interface UserCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};
`);

    // Create test files
    await fs.writeFile(path.join(testProjectDir, 'tests', 'unit', 'auth.test.ts'), `
import { validateEmail } from '../../src/utils/api';

describe('Authentication Utils', () => {
  test('validateEmail should work correctly', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });
});

// TODO: Add more comprehensive tests
`);

    // Create configuration files
    await fs.writeFile(path.join(testProjectDir, 'config', 'database.json'), `
{
  "development": {
    "host": "localhost",
    "port": 5432,
    "database": "ecommerce_dev"
  },
  "production": {
    "host": "prod-db.example.com",
    "port": 5432,
    "database": "ecommerce_prod"
  }
}
`);

    // Create documentation files
    await fs.writeFile(path.join(testProjectDir, 'docs', 'api-guide.md'), `
# API Guide

## Authentication Endpoints
- POST /auth/login - User login
- POST /auth/logout - User logout
- GET /auth/profile - Get user profile

## Product Endpoints  
- GET /products - List all products
- GET /products/:id - Get specific product
- POST /products - Create new product (admin only)

TODO: Document error responses
FIXME: Update authentication flow
`);

    await fs.writeFile(path.join(testProjectDir, 'README.md'), `
# E-commerce Platform

A full-featured e-commerce application built with modern web technologies.

## Features
- User authentication (FR-001)
- Product catalog (FR-002)
- Shopping cart (FR-003)

## Getting Started
1. Clone the repository
2. Install dependencies: npm install
3. Start the development server: npm run dev

## API Documentation
See docs/api-guide.md for detailed API documentation.

## Requirements
See SRS.md and requirements.yaml for detailed requirements.
`);

    // Create files and directories that should be ignored
    await fs.mkdir(path.join(testProjectDir, 'node_modules', 'react'), { recursive: true });
    await fs.writeFile(path.join(testProjectDir, 'node_modules', 'react', 'index.js'), 'module.exports = React;');
    await fs.writeFile(path.join(testProjectDir, 'debug.log'), 'Debug logging information...');
    await fs.writeFile(path.join(testProjectDir, '.env'), 'SECRET_KEY=abc123');

    // Create .gitignore
    await fs.writeFile(path.join(testProjectDir, '.gitignore'), `
node_modules/
*.log
.env*
dist/
build/
coverage/
`);
  });

  afterAll(async () => {
    process.chdir(originalCwd);
    try {
      await fs.rm(testProjectDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean up test directory:', error);
    }
  });

  // Mock session manager
  beforeEach(() => {
    jest.doMock('../../../core/session-manager', () => ({
      SessionManager: {
        getInstance: () => ({
          getCurrentSession: async () => ({ baseDir: testProjectDir })
        })
      }
    }));
  });

  describe('End-to-End Workflow Tests', () => {
    test('Workflow 1: New developer understanding project structure', async () => {
      // Simulate scenario: New developer wants to understand the project's main features
      
      // Step 1: Find all exported functions and classes
      const exportsResult = await findInFiles({
        pattern: 'export\\s+(function|class|interface)',
        regex: true,
        outputMode: 'files'
      });

      expect(exportsResult.success).toBe(true);
      expect(exportsResult.matches!.length).toBeGreaterThan(0);

      // Step 2: Find all TODO items to understand pending work
      const todoResult = await findInFiles({
        pattern: 'TODO|FIXME',
        regex: true,
        outputMode: 'content',
        context: 2
      });

      expect(todoResult.success).toBe(true);
      
      if (todoResult.matches && todoResult.matches.length > 0) {
        // Verify that context information is present
        const firstMatch = todoResult.matches[0] as any;
        expect(firstMatch.context).toBeDefined();
        expect(firstMatch.context.length).toBeGreaterThan(0);
      }
    });

    test('Workflow 2: Requirements analyst tracking requirement implementation', async () => {
      // Simulate scenario: Requirements analyst wants to understand how FR-001 is implemented in code

      // Step 1: Find all requirement ID references
      const requirementsResult = await findInFiles({
        pattern: '(FR|UC|US)-\\d+',
        regex: true,
        outputMode: 'content'
      });

      expect(requirementsResult.success).toBe(true);

      // Step 2: Specifically search for FR-001 references
      const fr001Result = await findInFiles({
        pattern: 'FR-001',
        outputMode: 'files'
      });

      expect(fr001Result.success).toBe(true);
      
      if (fr001Result.matches && fr001Result.matches.length > 0) {
        const files = (fr001Result.matches as any[]).map(m => path.basename(m.file));
        // Should be found in SRS.md and requirements.yaml
        expect(files.some(f => f.includes('SRS.md') || f.includes('requirements.yaml'))).toBe(true);
      }
    });

    test('Workflow 3: Code review to find potential issues', async () => {
      // Simulate scenario: Code reviewer searching for potential issues in code

      // Step 1: Find all console.log statements (may need cleanup)
      const consoleResult = await findInFiles({
        pattern: 'console\\.(log|warn|error)',
        regex: true,
        type: 'ts',
        outputMode: 'count'
      });

      expect(consoleResult.success).toBe(true);

      // Step 2: Find hardcoded configuration values
      const hardcodedResult = await findInFiles({
        pattern: '(http://|https://|localhost|127\\.0\\.0\\.1)',
        regex: true,
        outputMode: 'content',
        context: 1
      });

      expect(hardcodedResult.success).toBe(true);

      // Step 3: Find all FIXME markers
      const fixmeResult = await findInFiles({
        pattern: 'FIXME',
        outputMode: 'files'
      });

      expect(fixmeResult.success).toBe(true);
    });

    test('Workflow 4: Technical documentation maintenance', async () => {
      // Simulate scenario: Technical writer maintaining project documentation

      // Step 1: Find all API references in documentation files
      const apiRefsResult = await findInFiles({
        pattern: '/(auth|products|users)/',
        regex: true,
        type: 'md',
        outputMode: 'content'
      });

      expect(apiRefsResult.success).toBe(true);

      // Step 2: Find broken links and content needing updates in documentation
      const docIssuesResult = await findInFiles({
        pattern: 'TODO|TBD|\\[TBD\\]|\\?\\?\\?',
        regex: true,
        path: 'docs/',
        outputMode: 'count'
      });

      expect(docIssuesResult.success).toBe(true);

      // Step 3: Verify consistency between code and documentation
      const functionRefsResult = await findInFiles({
        pattern: 'validateEmail|LoginForm|ApiClient',
        regex: true,
        glob: '*.{ts,tsx,md}',
        outputMode: 'files'
      });

      expect(functionRefsResult.success).toBe(true);
    });
  });

  describe('Performance and Reliability Tests', () => {
    test('should maintain performance in projects with many files', async () => {
      // Arrange - Create more files to simulate a large project
      const largeProjectDir = path.join(testProjectDir, 'large-scale');
      await fs.mkdir(largeProjectDir, { recursive: true });

      // Create 50 files
      for (let i = 0; i < 50; i++) {
        await fs.writeFile(
          path.join(largeProjectDir, `module-${i}.ts`),
          `export function func${i}() {
  console.log('Function ${i}');
  return ${i};
}

export interface Interface${i} {
  value: number;
  name: string;
}

// TODO: Implement feature ${i}
`
        );
      }

      // Mock session to use large project
      jest.doMock('../../../core/session-manager', () => ({
        SessionManager: {
          getInstance: () => ({
            getCurrentSession: async () => ({ baseDir: largeProjectDir })
          })
        }
      }));

      // Act - Search for all function definitions
      const startTime = Date.now();
      const result = await findInFiles({
        pattern: 'export\\s+function\\s+\\w+',
        regex: true,
        outputMode: 'count'
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(result.totalMatches).toBe(50); // Should find 50 functions
    });

    test('should correctly handle various file encodings', async () => {
      // Arrange - Create files containing special characters
      await fs.writeFile(
        path.join(testProjectDir, 'unicode-test.md'),
        `# 中文测试文档

## 功能描述
这是一个包含中文的function测试文档。

### API说明
- 用户认证接口：POST /auth/login
- 产品目录接口：GET /products

TODO: 添加更多中文文档
`
      );

      // Act
      const result = await findInFiles({
        pattern: '中文|function|TODO',
        regex: true,
        path: 'unicode-test.md'
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.totalMatches).toBeGreaterThan(0);
      
      if (result.matches && result.matches.length > 0) {
        const chineseMatches = (result.matches as any[]).filter(
          match => match.text.includes('中文')
        );
        expect(chineseMatches.length).toBeGreaterThan(0);
      }
    });

    test('should gracefully handle search limits', async () => {
      // Arrange - Test various boundary conditions
      const testCases = [
        { pattern: 'function', limit: 1 },    // Minimum limit
        { pattern: '.*', regex: true, limit: 10 }, // Match all content but limit results
        { pattern: 'nonexistent_pattern' }    // No matching results
      ];

      // Act & Assert
      for (const testCase of testCases) {
        const result = await findInFiles(testCase);
        expect(result.success).toBe(true);
        
        if (testCase.limit && result.matches) {
          expect(result.matches.length).toBeLessThanOrEqual(testCase.limit);
        }
      }
    });
  });

  describe('Complex Search Pattern Tests', () => {
    test('should support complex regular expression patterns', async () => {
      // Arrange - Various complex search patterns
      const complexPatterns = [
        {
          name: 'Function definitions',
          pattern: 'export\\s+(function|const\\s+\\w+\\s*=\\s*\\([^)]*\\)\\s*=>)',
          regex: true
        },
        {
          name: 'Interface definitions',
          pattern: 'interface\\s+\\w+\\s*{',
          regex: true
        },
        {
          name: 'HTTP method calls',
          pattern: '\\.(get|post|put|delete)\\(',
          regex: true
        },
        {
          name: 'Comment markers',
          pattern: '(TODO|FIXME|HACK|BUG)\\s*:',
          regex: true
        }
      ];

      // Act & Assert
      for (const patternTest of complexPatterns) {
        const result = await findInFiles({
          pattern: patternTest.pattern,
          regex: patternTest.regex,
          outputMode: 'count'
        });

        expect(result.success).toBe(true);
        // No matches required, but execution should succeed
      }
    });

    test('should support combined file type searches', async () => {
      // Arrange - Test searching different file types
      const fileTypeTests = [
        { type: 'ts', expectedPattern: /\.(ts|tsx)$/ },
        { type: 'js', expectedPattern: /\.(js|jsx)$/ },
        { type: 'md', expectedPattern: /\.md$/ },
        { type: 'json', expectedPattern: /\.json$/ }
      ];

      // Act & Assert
      for (const fileTypeTest of fileTypeTests) {
        const result = await findInFiles({
          pattern: '.*',
          regex: true,
          type: fileTypeTest.type,
          outputMode: 'files'
        });

        expect(result.success).toBe(true);
        
        if (result.matches && result.matches.length > 0) {
          // Verify all results are of the correct file type
          const allCorrectType = (result.matches as any[]).every(
            match => fileTypeTest.expectedPattern.test(match.file)
          );
          expect(allCorrectType).toBe(true);
        }
      }
    });
  });

  describe('Cursor Parity Tests', () => {
    test('should provide search results similar to Cursor grep', async () => {
      // This test verifies that our search result quality matches expectations
      
      // Arrange - Simulate typical Cursor usage patterns
      const cursorStyleSearches = [
        {
          description: 'Find all function definitions',
          args: { pattern: 'function', outputMode: 'count' as const }
        },
        {
          description: 'Find TODO in specific directory',
          args: { pattern: 'TODO', path: 'src/', outputMode: 'files' as const }
        },
        {
          description: 'Find TypeScript interfaces',
          args: { pattern: 'interface', type: 'ts' as const }
        },
        {
          description: 'Regex search for import statements',
          args: { pattern: 'import.*from', regex: true }
        }
      ];

      // Act & Assert
      for (const search of cursorStyleSearches) {
        const result = await findInFiles(search.args);
        
        expect(result.success).toBe(true);
        expect(result.matches).toBeDefined();
        expect(result.totalMatches).toBeGreaterThanOrEqual(0);
        
        // Verify output format meets expectations
        if (search.args.outputMode === 'count' && result.matches!.length > 0) {
          expect((result.matches![0] as any).count).toBeDefined();
        } else if (search.args.outputMode === 'files' && result.matches!.length > 0) {
          expect((result.matches![0] as any).line).toBeUndefined();
        } else if (result.matches!.length > 0) { // content mode
          expect((result.matches![0] as any).line).toBeDefined();
        }
      }
    });
  });

  describe('SRS Project-Specific Tests', () => {
    test('should efficiently search SRS document structure', async () => {
      // Arrange - Search patterns specific to SRS projects
      const srsSearches = [
        {
          description: 'Find all requirement IDs',
          args: { pattern: '(FR|UC|US|NFR)-\\d+', regex: true, outputMode: 'files' as const }
        },
        {
          description: 'Find SRS section headers',
          args: { pattern: '^##\\s+\\d+\\.', regex: true, type: 'md' as const }
        },
        {
          description: 'Find dependencies in requirements.yaml',
          args: { pattern: 'depends_on', type: 'yaml' as const }
        }
      ];

      // Act & Assert
      for (const search of srsSearches) {
        const result = await findInFiles(search.args);
        
        expect(result.success).toBe(true);
        // Should be able to find these patterns in SRS projects
        expect(result.totalMatches).toBeGreaterThan(0);
      }
    });

    test('should support cross-document requirement reference search', async () => {
      // Arrange
      const args: FindInFilesArgs = {
        pattern: 'FR-001',
        outputMode: 'content',
        context: 3
      };

      // Act
      const result = await findInFiles(args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.totalMatches).toBeGreaterThan(0);
      
      // Verify references are found in multiple files
      const fileSet = new Set((result.matches as any[]).map(m => path.basename(m.file)));
      expect(fileSet.has('SRS.md')).toBe(true);
      expect(fileSet.has('requirements.yaml')).toBe(true);
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    test('should handle empty files', async () => {
      // Arrange - Create an empty file
      await fs.writeFile(path.join(testProjectDir, 'empty.txt'), '');

      const args: FindInFilesArgs = {
        pattern: 'anything',
        path: 'empty.txt'
      };

      // Act
      const result = await findInFiles(args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.totalMatches).toBe(0);
      expect(result.matches).toEqual([]);
    });

    test('should handle very long lines', async () => {
      // Arrange - Create a file with very long lines
      const longLine = 'x'.repeat(10000) + ' function test() {}';
      await fs.writeFile(path.join(testProjectDir, 'long-lines.js'), longLine);

      const args: FindInFilesArgs = {
        pattern: 'function',
        path: 'long-lines.js'
      };

      // Act
      const result = await findInFiles(args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.totalMatches).toBe(1);
    });

    test('should correctly handle special characters', async () => {
      // Arrange - Create a file containing special characters
      await fs.writeFile(path.join(testProjectDir, 'special-chars.ts'), `
const specialString = "Hello (world) [test] {data} $var @user #tag %percent";
const regexPattern = /^[a-zA-Z]+$/;
const template = \`function \${name}() { return true; }\`;
`);

      const args: FindInFilesArgs = {
        pattern: '\\$\\{\\w+\\}',
        regex: true,
        path: 'special-chars.ts'
      };

      // Act
      const result = await findInFiles(args);

      // Assert
      expect(result.success).toBe(true);
      expect(result.totalMatches).toBeGreaterThan(0);
    });
  });
});

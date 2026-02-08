# FindInFiles Tool

A powerful multi-file search tool inspired by Cursor's grep functionality, providing concise and efficient cross-file content search capabilities.

## 🎯 Core Features

- **Multi-file Search** - Search content across the entire project baseDir
- **Regular Expression Support** - Full JavaScript RegExp syntax support
- **Flexible File Filtering** - Support for glob patterns and file type filtering
- **Multiple Output Formats** - Three output modes: content/files/count
- **Smart Scope Detection** - Automatically detects search scope without complex parameters

## 📖 Usage

### Basic Search

```typescript
// Search across the entire project
await findInFiles({pattern: "TODO"});

// Search in a specific directory
await findInFiles({pattern: "function", path: "src/"});

// Regular expression search
await findInFiles({pattern: "function\\s+\\w+", regex: true});
```

### File Filtering

```typescript
// Filter by file type
await findInFiles({pattern: "class", type: "ts"});

// Filter by glob pattern
await findInFiles({pattern: "import", glob: "**/*.{js,ts}"});

// Search YAML configuration files
await findInFiles({pattern: "version", type: "yaml"});
```

### Output Modes

```typescript
// content mode: Display detailed match content (default)
await findInFiles({
  pattern: "function", 
  outputMode: "content",
  context: 3  // Display 3 lines of context
});

// files mode: Only display matched file paths
await findInFiles({
  pattern: "TODO",
  outputMode: "files"
});

// count mode: Display the number of matches per file
await findInFiles({
  pattern: "class.*extends",
  regex: true,
  outputMode: "count"
});
```

## 📊 Parameter Description

| Parameter | Type | Default | Description |
|------|------|--------|------|
| `pattern` | string | *Required* | Search pattern (text or regex) |
| `regex` | boolean | false | Whether to use regular expressions |
| `caseSensitive` | boolean | false | Case sensitive |
| `path` | string | - | File or directory path (relative to baseDir) |
| `glob` | string | - | File matching pattern |
| `type` | string | - | File type (js/ts/md/yaml/json/html/css) |
| `outputMode` | string | "content" | Output format (content/files/count) |
| `context` | number | 5 | Number of context lines (0-20) |
| `limit` | number | 100 | Maximum number of results (1-1000) |

## 📤 Output Format

### Content Mode
```json
{
  "success": true,
  "totalMatches": 3,
  "matches": [
    {
      "file": "src/main.ts",
      "line": 15,
      "text": "export function createApp() {",
      "context": [
        "import { Logger } from './logger';",
        "// App factory",
        "export function createApp() {",
        "  return new App();",
        "}"
      ]
    }
  ]
}
```

### Files Mode
```json
{
  "success": true,
  "totalMatches": 5,
  "matches": [
    {"file": "src/main.ts"},
    {"file": "src/utils.ts"},
    {"file": "README.md"}
  ]
}
```

### Count Mode
```json
{
  "success": true,
  "totalMatches": 8,
  "matches": [
    {"file": "src/main.ts", "count": 3},
    {"file": "src/utils.ts", "count": 2},
    {"file": "README.md", "count": 1}
  ]
}
```

## 🚨 Error Handling

The tool provides clear error messages and resolution suggestions:

```json
{
  "success": false,
  "error": "Invalid regex pattern: [unclosed",
  "errorType": "INVALID_REGEX",
  "suggestions": [
    "Try text search without regex",
    "Check regex syntax"
  ]
}
```

### Common Error Types

- `INVALID_REGEX` - Regular expression syntax error
- `PATH_NOT_FOUND` - Specified path does not exist
- `PERMISSION_DENIED` - Insufficient file permissions
- `WORKSPACE_ERROR` - Workspace unavailable
- `SEARCH_ERROR` - General search error

## 🎯 Use Cases

### 1. Content Specialist Project Analysis
```typescript
// Find all requirement ID references
await findInFiles({
  pattern: "(FR|UC|US|NFR)-\\d+",
  regex: true,
  outputMode: "files"
});

// Find TODO items
await findInFiles({
  pattern: "TODO|FIXME",
  regex: true,
  type: "md"
});
```

### 2. Process Specialist Quality Check
```typescript
// Find code quality markers
await findInFiles({
  pattern: "HACK|FIXME|XXX|BUG",
  regex: true
});

// Check configuration consistency
await findInFiles({
  pattern: "version",
  type: "json"
});
```

### 3. Code Structure Analysis
```typescript
// Find all exported functions
await findInFiles({
  pattern: "export\\s+function\\s+\\w+",
  regex: true,
  type: "ts",
  outputMode: "count"
});

// Find class inheritance relationships
await findInFiles({
  pattern: "class\\s+(\\w+)\\s+extends\\s+(\\w+)",
  regex: true,
  context: 5
});
```

## ⚡ Performance Characteristics

- **Moderate Performance** - Optimized for small to medium projects (10-1000 files)
- **Batch Processing** - Parallel processing in batches of 50 files
- **Large File Skipping** - Automatically skips files larger than 10MB
- **Smart Ignore** - Automatically respects .gitignore and .cursorignore rules

## 🔗 Tool Integration

findInFiles works seamlessly with other tools:

```typescript
// Combined with enhanced-readfile-tools
const searchResult = await findInFiles({pattern: "FR-001", outputMode: "files"});
for (const file of searchResult.matches) {
  const docStructure = await readMarkdownFile({path: file.file, parseMode: "toc"});
  // Analyze document structure...
}

// Combined with listAllFiles
const allFiles = await listAllFiles({searchKeywords: ["requirements"]});
const searchResults = await findInFiles({
  pattern: "priority.*high",
  regex: true,
  path: allFiles.structure.paths[0]
});
```

## 🛠️ Technical Architecture

```
FindInFiles Tool Architecture:
├── FindInFilesEngine          # Main coordination engine
├── StandardMultiFileSearchEngine  # Multi-file search executor
├── PatternMatcher            # Regex and text matcher
├── FileScanner              # File discovery and filter
├── ResultFormatter          # Result formatter
└── SimpleErrorHandler       # Error handler
```

## 🎯 Comparison with Cursor

| Feature | Cursor grep | FindInFiles |
|------|-------------|-------------|
| **Search Scope** | Entire workspace | Project baseDir (more precise) |
| **Parameter Style** | Concise command-line style | JSON object style (easier for programmatic use) |
| **Output Format** | Text format | Structured JSON |
| **Error Handling** | Command-line errors | Structured errors + suggestions |
| **Integration** | Standalone tool | Deeply integrated with existing tool ecosystem |

## 📋 Best Practices

1. **Choose the Appropriate Output Mode**
   - Use `content` mode when detailed content is needed
   - Use `files` mode when only caring about which files match
   - Use `count` mode when performing statistical analysis

2. **Optimize Search Performance**
   - Use the `path` parameter to narrow the search scope
   - Use `type` or `glob` to filter irrelevant files
   - Set a reasonable `limit` to avoid excessive results

3. **Regular Expression Usage**
   - Don't enable `regex` for simple text searches
   - Use `regex: true` for complex pattern matching
   - Pay attention to JavaScript RegExp syntax rules

4. **Error Handling**
   - Check the `success` field to determine execution status
   - Utilize the `suggestions` field to get resolution suggestions
   - Categorize handling based on `errorType`

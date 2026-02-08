# Distributed Tool Access Control Design Document

**Document Version**: 3.0  
**Last Updated**: 2025-10-02  
**Author**: SRS Writer Plugin Architecture Team  
**Status**: 🚧 In Planning - v3.0 Refactoring Design

## 📖 Overview

This document defines the tool permission management system based on **distributed access control** in SRS Writer Plugin. Each tool declares access permissions through its own `accessibleBy` property, implementing code-level mandatory access control to ensure system architecture clarity, security, and maintainability.

## 🏗️ Architecture Upgrade History

**v1.0 → v2.0 Major Changes**:
- ❌ **Deprecated**: Centralized permission matrix
- ✅ **Adopted**: Distributed tool autonomous permission control
- 🔒 **Enhanced**: Code-level permission enforcement
- 🚀 **Added**: Fine-grained control based on CallerType

**v2.0 → v3.0 Planned Changes** (🚧 Current Refactoring):
- 🚀 **Added**: Support for individual Specialist-level access control
- 🔀 **Hybrid**: Support for mixed CallerType (type) and CallerName (individual) declarations
- 🤖 **Dynamic**: Utilize SpecialistRegistry for dynamic specialist identification
- 💰 **Optimized**: Reduce token noise from specialized tools to other specialists

### **New Architecture Hierarchy**

SRS Writer Plugin adopts a four-layer tool architecture + AI caller types:

#### **🤖 AI Caller Hierarchy**
- **🎯 orchestrator:TOOL_EXECUTION**: Intelligent routing center - execution mode
- **🧠 orchestrator:KNOWLEDGE_QA**: Intelligent routing center - knowledge Q&A and general conversation mode  
- **🔬 specialist**: Expert executor, responsible for specific SRS business logic

#### **🛠️ Tool Implementation Hierarchy**
- **📄 document**: Document business layer, responsible for specific operations and business rules of SRS documents
- **⚛️ atomic**: Atomic operation layer, responsible for basic file system operations
- **🔧 internal**: System tool layer, responsible for logging, user interaction, process control and other system functions

## 🚀 Distributed Access Control Implementation

### **Core Type System (v2.0)**

```typescript
// src/types/index.ts
export enum CallerType {
    // Different modes of Orchestrator AI
    ORCHESTRATOR_TOOL_EXECUTION = 'orchestrator:TOOL_EXECUTION',
    ORCHESTRATOR_KNOWLEDGE_QA = 'orchestrator:KNOWLEDGE_QA',
    
    // Specialist AI (type level)
    SPECIALIST_CONTENT = 'specialist:content',
    SPECIALIST_PROCESS = 'specialist:process',
    
    // Code hierarchy
    DOCUMENT = 'document',
    ATOMIC = 'atomic', 
    INTERNAL = 'internal'
}
```

### **Core Type System (v3.0 Planned)**

```typescript
// src/types/index.ts

// CallerType remains unchanged
export enum CallerType {
    ORCHESTRATOR_TOOL_EXECUTION = 'orchestrator:TOOL_EXECUTION',
    ORCHESTRATOR_KNOWLEDGE_QA = 'orchestrator:KNOWLEDGE_QA',
    SPECIALIST_CONTENT = 'specialist:content',
    SPECIALIST_PROCESS = 'specialist:process',
    DOCUMENT = 'document',
    INTERNAL = 'internal'
}

// 🚀 New: CallerName - Individual Specialist identifier
// Dynamically obtained from SpecialistRegistry, no need to manually maintain enums
export type CallerName = string;  // Specialist ID (e.g.: "prototype_designer", "fr_writer")

// 🚀 New: Hybrid access control type
export type AccessControl = CallerType | CallerName;
```

### **Tool Definition Extension (v2.0)**

```typescript
// src/tools/index.ts
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: any;
    layer?: 'atomic' | 'specialist' | 'document' | 'internal';
    category?: string;
    // v2.0: Distributed access control
    accessibleBy?: CallerType[];
}
```

### **Tool Definition Extension (v3.0 Planned)**

```typescript
// src/tools/index.ts
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: any;
    layer?: 'atomic' | 'specialist' | 'document' | 'internal';
    category?: string;
    
    // 🚀 v3.0: Hybrid access control - supports CallerType and CallerName
    accessibleBy?: Array<CallerType | CallerName>;
    
    // Other properties remain unchanged
    interactionType?: 'autonomous' | 'confirmation' | 'interactive';
    riskLevel?: 'low' | 'medium' | 'high';
    requiresConfirmation?: boolean;
}
```

### **Access Controller (v2.0)**

```typescript
// src/core/orchestrator/ToolAccessController.ts
export class ToolAccessController {
    getAvailableTools(caller: CallerType): ToolDefinition[]
    validateAccess(caller: CallerType, toolName: string): boolean
    generateAccessReport(caller: CallerType): string
}
```

### **Access Controller (v3.0 Planned)**

```typescript
// src/core/orchestrator/ToolAccessController.ts
export class ToolAccessController {
    private specialistRegistry: SpecialistRegistry;  // 🚀 New
    
    constructor() {
        this.specialistRegistry = getSpecialistRegistry();
    }
    
    /**
     * Get the list of tools accessible to the specified caller
     * 🚀 v3.0: Support passing specialist ID
     */
    getAvailableTools(
        caller: CallerType, 
        specialistId?: string  // 🚀 New: specific specialist ID
    ): ToolDefinition[]
    
    /**
     * Verify if the caller can access the specified tool
     * 🚀 v3.0: Support passing specialist ID
     */
    validateAccess(
        caller: CallerType, 
        toolName: string,
        specialistId?: string  // 🚀 New
    ): boolean
    
    /**
     * Generate access control report
     * 🚀 v3.0: Support specialist-level reports
     */
    generateAccessReport(
        caller: CallerType,
        specialistId?: string  // 🚀 New
    ): string
    
    /**
     * 🚀 v3.0 New: Check the type of access control value
     */
    private isCallerType(value: AccessControl): value is CallerType
    
    /**
     * 🚀 v3.0 New: Check if tool is accessible to specified caller
     */
    private isToolAccessible(
        tool: ToolDefinition, 
        caller: CallerType,
        specialistId?: string
    ): boolean {
        if (!tool.accessibleBy || tool.accessibleBy.length === 0) {
            return this.getDefaultAccess(tool, caller);
        }
        
        for (const accessor of tool.accessibleBy) {
            // 1. Check CallerType (enum value)
            if (this.isCallerType(accessor)) {
                if (accessor === caller) return true;
            }
            // 2. Check CallerName (specialist ID string)
            else if (typeof accessor === 'string' && specialistId) {
                if (accessor === specialistId) {
                    // Verify if specialist exists
                    if (this.specialistRegistry.isSpecialistAvailable(accessor)) {
                        return true;
                    } else {
                        this.logger.warn(`⚠️ Tool references non-existent specialist: ${accessor}`);
                    }
                }
            }
        }
        
        return false;
    }
}
```

## 🔐 Specific Permission Definitions

### **🎯 orchestrator:TOOL_EXECUTION** 
**Permissions**: Highest privileges, can access all marked tools

**Accessible Tool Examples**:
```typescript
// 🧠 Expert tools - intelligent routing responsibilities
createComprehensiveSRS: {
    accessibleBy: [CallerType.ORCHESTRATOR_TOOL_EXECUTION]
}

// 📄 Document tools - can also directly handle simple operations
addNewRequirement: {
    accessibleBy: [CallerType.ORCHESTRATOR_TOOL_EXECUTION, CallerType.SPECIALIST]
}

// ⚛️ Atomic tools - basic operations
readFile: {
    accessibleBy: [
        CallerType.ORCHESTRATOR_TOOL_EXECUTION,
        CallerType.ORCHESTRATOR_GENERAL_CHAT,
        CallerType.SPECIALIST
    ]
}

// 🔧 Internal tools - system control
finalAnswer: {
    accessibleBy: [CallerType.ORCHESTRATOR_TOOL_EXECUTION, CallerType.SPECIALIST]
}
```

### **🧠 orchestrator:KNOWLEDGE_QA**
**Permissions**: Knowledge retrieval + safe query operations, includes general conversation functionality

**Accessible Tool Examples**:
```typescript
// 🔧 Knowledge retrieval tools
customRAGRetrieval: {
    accessibleBy: [
        CallerType.ORCHESTRATOR_TOOL_EXECUTION,
        CallerType.ORCHESTRATOR_KNOWLEDGE_QA,    // ✅ Core capability
        CallerType.SPECIALIST
    ]
}

// ⚛️ Safe query tools (merged from original GENERAL_CHAT)
readFile: {
    accessibleBy: [
        CallerType.ORCHESTRATOR_TOOL_EXECUTION,
        CallerType.ORCHESTRATOR_KNOWLEDGE_QA,    // ✅ "Help me check config.json"
        CallerType.SPECIALIST
    ]
}

listFiles: {
    accessibleBy: [
        CallerType.ORCHESTRATOR_TOOL_EXECUTION,
        CallerType.ORCHESTRATOR_KNOWLEDGE_QA,    // ✅ "What files are in the project?"
        CallerType.SPECIALIST
    ]
}

internetSearch: {
    accessibleBy: [
        CallerType.ORCHESTRATOR_TOOL_EXECUTION,
        CallerType.ORCHESTRATOR_KNOWLEDGE_QA     // ✅ "Latest tech trends?"
    ]
}

// ❌ All dangerous operations are inaccessible
// writeFile, createDirectory, deleteFile etc. are all invisible
```



### **🔬 specialist**
**Permissions**: Business tools + system control, cannot recursively call experts

**Accessible Tool Examples**:
```typescript
// 📄 Document layer tools - core business capabilities
addNewRequirement: {
    accessibleBy: [CallerType.ORCHESTRATOR_TOOL_EXECUTION, CallerType.SPECIALIST]
}

updateRequirement: {
    accessibleBy: [CallerType.ORCHESTRATOR_TOOL_EXECUTION, CallerType.SPECIALIST]
}

// 🔧 Internal tools - process control
customRAGRetrieval: {
    accessibleBy: [
        CallerType.ORCHESTRATOR_TOOL_EXECUTION,
        CallerType.ORCHESTRATOR_KNOWLEDGE_QA,
        CallerType.SPECIALIST                     // ✅ Required for expert content generation
    ]
}

finalAnswer: {
    accessibleBy: [CallerType.ORCHESTRATOR_TOOL_EXECUTION, CallerType.SPECIALIST]
}

// ⚛️ Some atomic tools - indirect access through document layer
readFile: {
    accessibleBy: [/* ..., */ CallerType.SPECIALIST]
}

// ❌ Expert tools cannot be called recursively
// createComprehensiveSRS, editSRSDocument etc. are invisible

// ❌ No need for external information
// internetSearch is invisible
```

## 🏗️ Implementation Architecture

### **Tool Registration and Filtering**

```typescript
// src/core/orchestrator/ToolCacheManager.ts
export class ToolCacheManager {
    private accessController = new ToolAccessController();
    private toolsCache: Map<CallerType, { definitions: any[], jsonSchema: string }> = new Map();
    
    /**
     * Get tools accessible to specified caller (with caching)
     */
    public async getTools(caller: CallerType): Promise<{ definitions: any[], jsonSchema: string }> {
        if (this.toolsCache.has(caller)) {
            return this.toolsCache.get(caller)!;
        }
        
        const filteredDefinitions = this.accessController.getAvailableTools(caller);
        const jsonSchema = JSON.stringify(filteredDefinitions, null, 2);
        
        const result = { definitions: filteredDefinitions, jsonSchema };
        this.toolsCache.set(caller, result);
        
        return result;
    }
}
```

### **Intelligent Intent Detection**

```typescript
// src/core/orchestrator/PromptManager.ts  
private detectIntentType(userInput: string): CallerType {
    const input = userInput.toLowerCase();
    
    // Detect knowledge Q&A
    const knowledgePatterns = [
        /^(how|what|why|when|where|which)/,
        /如何|怎么|什么是|为什么|怎样/,
        /best practices?|最佳实践/
    ];
    
    // Detect chat
    const chatPatterns = [
        /^(hi|hello|hey|thanks)/,
        /^(你好|谢谢|感谢)/,
        /weather|天气/
    ];
    
    if (chatPatterns.some(pattern => pattern.test(input))) {
        return CallerType.ORCHESTRATOR_GENERAL_CHAT;
    }
    
    if (knowledgePatterns.some(pattern => pattern.test(input))) {
        return CallerType.ORCHESTRATOR_KNOWLEDGE_QA;
    }
    
    return CallerType.ORCHESTRATOR_TOOL_EXECUTION;
}
```

### **Access Control Verification**

```typescript
// Verify during tool execution
public async executeTool(toolName: string, params: any, caller: CallerType): Promise<any> {
    // 🔒 Critical: Access control verification
    if (!this.accessController.validateAccess(caller, toolName)) {
        throw new Error(`🚫 Access denied: ${caller} cannot access tool: ${toolName}`);
    }
    
    // Execute tool
    const implementation = toolRegistry.getImplementation(toolName);
    return await implementation(params);
}
```

## 📋 Tool Permission Quick Reference

### **By Caller Category**

| Caller | Accessible Tool Types | Typical Use Cases |
|--------|----------------------|-------------------|
| **TOOL_EXECUTION** | All marked tools | "Create SRS", "Add requirement", "Check file" |
| **KNOWLEDGE_QA** | Knowledge retrieval + safe query tools | "How to write requirements?", "What files in project?", "What's the weather?" |
| **SPECIALIST** | Business + system tools | Tool calls during expert rule execution |

### **By Tool Risk Classification**

| Risk Level | Tool Examples | Access Permissions |
|------------|--------------|-------------------|
| **🟢 Low Risk** | readFile, listFiles | Accessible to most callers |
| **🟡 Medium Risk** | internetSearch, customRAGRetrieval | Accessible in specific scenarios |
| **🔴 High Risk** | writeFile, deleteFile | Only accessible in execution mode |
| **⚫ System Critical** | finalAnswer, expert tools | Strictly restricted access |

## 🎯 Usage Examples

### **v2.0 Permission Declaration Examples**

```typescript
// ✅ Safe query tool - multi-mode access
export const readFileDefinition = {
    name: "readFile",
    description: "Read file content", 
    accessibleBy: [
        CallerType.ORCHESTRATOR_TOOL_EXECUTION,
        CallerType.ORCHESTRATOR_KNOWLEDGE_QA,
        CallerType.SPECIALIST_CONTENT,
        CallerType.SPECIALIST_PROCESS,
        CallerType.DOCUMENT
    ]
};

// ✅ Dangerous operation tool - restricted access
export const writeFileDefinition = {
    name: "writeFile",
    description: "Write file content",
    accessibleBy: [
        CallerType.SPECIALIST_PROCESS,
        CallerType.DOCUMENT
    ]
};
```

### **v3.0 Permission Declaration Examples (Planned)**

```typescript
// ✅ Example 1: Only for specific specialists (individual-level control)
export const writePrototypeThemeDefinition = {
    name: "writePrototypeTheme",
    description: `Generate prototype theme CSS file.
    
    Must include the following CSS variables:
    - --background, --foreground (base colors)
    - --primary, --primary-foreground (brand colors)
    - --secondary, --muted, --accent (semantic colors)
    - --destructive, --border, --input, --ring (UI elements)
    - --font-sans, --font-serif, --font-mono (font system)
    - --radius, --spacing (spacing and shapes)
    - --shadow-xs, --shadow-sm, --shadow-md, --shadow-lg, --shadow-xl (shadow system)
    `,
    parameters: {
        type: "object",
        properties: {
            themeName: { type: "string", description: "Theme name" },
            cssContent: { type: "string", description: "Complete CSS content" }
        },
        required: ["themeName", "cssContent"]
    },
    // 🚀 v3.0: Only for two specific specialists
    accessibleBy: [
        "prototype_designer",      // CallerName
        "project_initializer"      // CallerName
    ],
    layer: "atomic"
};

// ✅ Example 2: Mixed type and individual control
export const writeFileDefinition = {
    name: "writeFile",
    description: "Write file content",
    parameters: { /* ... */ },
    // 🚀 v3.0: Mixed CallerType and CallerName
    accessibleBy: [
        CallerType.SPECIALIST_PROCESS,    // All process specialists
        "prototype_designer",             // Specific content specialist
        CallerType.DOCUMENT               // Document layer
    ],
    layer: "atomic"
};

// ✅ Example 3: General tool (keeping v2.0 approach)
export const readFileDefinition = {
    name: "readFile",
    description: "Read file content",
    parameters: { /* ... */ },
    // Using CallerType, all specialists of the same type can access
    accessibleBy: [
        CallerType.ORCHESTRATOR_KNOWLEDGE_QA,
        CallerType.SPECIALIST_CONTENT,
        CallerType.SPECIALIST_PROCESS,
        CallerType.DOCUMENT
    ],
    layer: "atomic"
};

// ✅ Example 4: Preview tool (new)
export const previewPrototypeDefinition = {
    name: "previewPrototype",
    description: "Preview HTML prototype file in VSCode or browser",
    parameters: {
        type: "object",
        properties: {
            fileName: { type: "string", description: "Prototype file name" },
            mode: { 
                type: "string", 
                enum: ["vscode", "browser", "both"],
                default: "vscode"
            }
        },
        required: ["fileName"]
    },
    // 🚀 v3.0: Only for prototype_designer
    accessibleBy: ["prototype_designer"],
    layer: "atomic",
    interactionType: 'autonomous',
    riskLevel: 'low'
};
```

### **Incorrect Permission Declaration Examples**

```typescript
// ❌ Too permissive - security risk
export const deleteFileDefinition = {
    name: "deleteFile",
    // ...
    accessibleBy: [
        CallerType.ORCHESTRATOR_GENERAL_CHAT     // Dangerous! Chat mode should not delete files
    ]
};

// ❌ Too restrictive - limited functionality
export const listFilesDefinition = {
    name: "listFiles", 
    // ...
    accessibleBy: [
        CallerType.ORCHESTRATOR_TOOL_EXECUTION   // Too strict! Cannot respond to "What files in project?"
    ]
};

// ❌ Recursive call - architecture violation
export const createComprehensiveSRSDefinition = {
    name: "createComprehensiveSRS",
    // ...
    accessibleBy: [
        CallerType.SPECIALIST                     // Wrong! Experts cannot call other experts
    ]
};
```

## 🔍 Debugging and Monitoring

### **Access Control Report**

```typescript
// Generate access control report
const report = toolAccessController.generateAccessReport(CallerType.ORCHESTRATOR_GENERAL_CHAT);

/*
Output example:
# Access Control Report for orchestrator:GENERAL_CHAT

**Summary**: 4/25 tools accessible

**By Layer**:
- atomic: 3 tools
- internal: 1 tools

**Accessible Tools**:
- readFile (atomic/File Operations)
- listFiles (atomic/File Operations) 
- internetSearch (atomic/Internet Access)
- customRAGRetrieval (atomic/RAG Tools)
*/
```

### **Access Statistics**

```typescript
const stats = toolAccessController.getAccessStats(CallerType.ORCHESTRATOR_KNOWLEDGE_QA);
/*
{
    totalTools: 25,
    accessibleTools: 1,
    deniedTools: 24,
    byLayer: { internal: 1 }
}
*/
```

## 🔄 Maintenance Guide

### **Adding New Tools**

1. **Define Tool**: Add tool definition at the corresponding layer
2. **Declare Permissions**: Explicitly set the `accessibleBy` property
3. **Verify Permissions**: Run access control tests
4. **Update Documentation**: Synchronize updates to this document

```typescript
// New tool template
export const newToolDefinition = {
    name: "newTool",
    description: "Tool description",
    parameters: { /* ... */ },
    layer: "atomic",  // or other layer
    // 🚀 Required: Declare access permissions
    accessibleBy: [
        CallerType.ORCHESTRATOR_TOOL_EXECUTION,
        // Add other callers based on tool nature
    ]
};
```

### **Permission Change Workflow**

1. **Assess Impact**: Analyze the impact of permission changes on existing functionality
2. **Update Definition**: Modify the tool's `accessibleBy` property
3. **Test Verification**: Run the complete permission test suite
4. **Documentation Update**: Update related documentation and examples

### **Permission Audit**

Run permission audit scripts regularly:

```bash
# Generate access permission report for all tools
node scripts/audit-tool-permissions.js

# Verify consistency of permission configuration
npm run test:permissions
```

## 🚧 v3.0 Refactoring Implementation Plan

### Refactoring Motivation

**Problem**: Current CallerType only supports type-level control (e.g., SPECIALIST_CONTENT), cannot perform access control for specific specialists.

**Scenario**: When creating dedicated semantic tools for `prototype_designer`:
- Tool definitions are lengthy (including detailed CSS variable requirements)
- Only `prototype_designer` will use them
- If visible to all content specialists, will generate token noise

**Solution**: Support hybrid access control, can specify both type (CallerType) and individual (specialist ID)

### Implementation Steps

#### Phase 1: Type System Extension

**File**: `src/types/index.ts`

```typescript
// New type definitions
export type CallerName = string;  // Specialist ID
export type AccessControl = CallerType | CallerName;
```

**Effort**: ~10 lines of code, 30 minutes

#### Phase 2: Tool Definition Interface Update

**File**: `src/tools/index.ts`

```typescript
export interface ToolDefinition {
    // Update accessibleBy type
    accessibleBy?: Array<CallerType | CallerName>;  // ← Support hybrid
}
```

**Effort**: ~5 lines of code, 15 minutes

#### Phase 3: Access Controller Refactoring

**File**: `src/core/orchestrator/ToolAccessController.ts`

**Changes**:
1. Add `specialistRegistry` member
2. Update `getAvailableTools` method signature (add specialistId parameter)
3. Update `validateAccess` method signature (add specialistId parameter)
4. Refactor `isToolAccessible` method (support hybrid checking)
5. Add `isCallerType` helper method

**Effort**: ~40 lines of code, 2 hours

#### Phase 4: Tool Cache Manager Update

**File**: `src/core/orchestrator/ToolCacheManager.ts`

**Changes**:
1. Update cache key design (`${callerType}:${specialistId || 'any'}`)
2. Update `getTools` method signature
3. Add `buildCacheKey` helper method

**Effort**: ~30 lines of code, 1.5 hours

#### Phase 5: Call Site Updates

**Files**: 
- `src/core/specialistExecutor.ts`
- `src/core/toolExecutor.ts`

**Changes**: Pass `specialistId` when calling `getAvailableTools` and `validateAccess`

**Effort**: ~10 lines of code, 30 minutes

#### Phase 6: Testing and Verification

- Unit tests: Access control logic
- Integration tests: Specialist tool visibility
- End-to-end tests: Actual usage scenarios

**Effort**: 3-4 hours

### Overall Assessment

| Metric | Assessment |
|--------|-----------|
| **Code Changes** | ~95 lines |
| **File Count** | 5 core files |
| **Complexity** | 🟡 Medium |
| **Risk** | 🟢 Low (backward compatible) |
| **Development Time** | 4-5 hours |
| **Testing Time** | 3-4 hours |
| **Total Time** | 1 day |
| **Benefits** | 🟢 High (supports specialized tools, reduces token noise) |

### Key Design Decisions

1. **Utilize SpecialistRegistry**: No need to manually maintain specialist list, dynamically obtained
2. **Backward Compatibility**: Existing tools do not need modification, continue using CallerType
3. **Hybrid Support**: New tools can use both CallerType and CallerName simultaneously
4. **Runtime Verification**: Verify specialist ID validity through SpecialistRegistry

### Usage Scenarios

**Scenario 1**: Create dedicated tool for prototype_designer
```typescript
accessibleBy: ["prototype_designer"]  // Only this specialist can see it
```

**Scenario 2**: Multiple specialists share tool
```typescript
accessibleBy: ["prototype_designer", "project_initializer"]
```

**Scenario 3**: Hybrid control
```typescript
accessibleBy: [
    CallerType.SPECIALIST_PROCESS,  // All process specialists
    "prototype_designer"             // Plus this one content specialist
]
```

## 📊 Current Tool Permission Assignment Table

**Last Updated**: 2025-10-02  
**Based on**: Actual configuration after v3.0 refactoring

### Atomic Layer Tools (File System)

| Tool Name | Layer | Category | Access Permissions | Description |
|-----------|-------|----------|-------------------|-------------|
| **readTextFile** | atomic | File Ops | `ORCHESTRATOR_TOOL_EXECUTION`<br/>`ORCHESTRATOR_KNOWLEDGE_QA`<br/>`SPECIALIST_CONTENT`<br/>`SPECIALIST_PROCESS`<br/>`DOCUMENT` | Safe read operation, wide access |
| **writeFile** | atomic | File Ops | `SPECIALIST_PROCESS`<br/>`DOCUMENT` | Dangerous write operation, restricted access |
| **appendTextToFile** | atomic | File Ops | `DOCUMENT` | Append operation, document layer only |
| **createDirectory** | atomic | File Ops | `project_initializer`<br/>`INTERNAL` | Directory creation, project initializer only |
| **listFiles** | atomic | File Ops | `ORCHESTRATOR_KNOWLEDGE_QA`<br/>`SPECIALIST_PROCESS`<br/>`SPECIALIST_CONTENT`<br/>`DOCUMENT` | 🚀 Unified directory listing tool (supports single-level/recursive), returns full relative paths |
| **deleteFile** | atomic | File Ops | `INTERNAL` | High-risk operation, internal tools only |
| **moveAndRenameFile** | atomic | File Ops | `INTERNAL` | File refactoring, restricted access |
| **copyAndRenameFile** | atomic | File Ops | `project_initializer`<br/>`INTERNAL` | File copying, project initializer only |

### Atomic Layer Tools (Editor)

| Tool Name | Layer | Category | Access Permissions | Description |
|-----------|-------|----------|-------------------|-------------|
| **getActiveDocumentContent** | atomic | Editor | `ORCHESTRATOR_KNOWLEDGE_QA`<br/>`DOCUMENT` | Get current document content |
| **openAndShowFile** | atomic | Editor | `DOCUMENT` | Open and display file |

### Atomic Layer Tools (Interaction)

| Tool Name | Layer | Category | Access Permissions | Description |
|-----------|-------|----------|-------------------|-------------|
| **showInformationMessage** | atomic | User Interaction | `ORCHESTRATOR_KNOWLEDGE_QA`<br/>`DOCUMENT` | Display information |
| **showWarningMessage** | atomic | User Interaction | `ORCHESTRATOR_KNOWLEDGE_QA`<br/>`DOCUMENT` | Display warning |
| **askQuestion** | atomic | User Interaction | `ORCHESTRATOR_KNOWLEDGE_QA`<br/>`SPECIALIST_PROCESS` | Ask user for input |
| **suggestNextAction** | atomic | User Interaction | `ORCHESTRATOR_KNOWLEDGE_QA`<br/>`SPECIALIST_PROCESS` | Provide action suggestions |

### Atomic Layer Tools (Knowledge Retrieval)

| Tool Name | Layer | Category | Access Permissions | Description |
|-----------|-------|----------|-------------------|-------------|
| **readLocalKnowledge** | atomic | RAG | `ORCHESTRATOR_KNOWLEDGE_QA` | Local knowledge retrieval |
| **internetSearch** | atomic | RAG | | Internet search |
| **enterpriseRAGCall** | atomic | RAG | `ORCHESTRATOR_KNOWLEDGE_QA`<br/>`ORCHESTRATOR_TOOL_EXECUTION` | Enterprise knowledge base |
| **customRAGRetrieval** | atomic | RAG | `SPECIALIST_CONTENT`<br/>`SPECIALIST_PROCESS`<br/>`ORCHESTRATOR_TOOL_EXECUTION` | Custom RAG retrieval |

### Atomic Layer Tools (Smart Editing)

| Tool Name | Layer | Category | Access Permissions | Description |
|-----------|-------|----------|-------------------|-------------|
| **findAndReplace** | atomic | Smart Edit | `DOCUMENT` | Find and replace |
| **findInFiles** | atomic | Smart Edit | `ORCHESTRATOR_TOOL_EXECUTION, ORCHESTRATOR_KNOWLEDGE_QA, SPECIALIST_CONTENT` | 🚀 Multi-file search (Cursor style, replaces original findInFile) |
| **replaceInSelection** | atomic | Smart Edit | `DOCUMENT` | Replace in selection |

### Document Layer Tools

| Tool Name | Layer | Category | Access Permissions | Description |
|-----------|-------|----------|-------------------|-------------|
| **readMarkdownFile** | document | Markdown | `ORCHESTRATOR_TOOL_EXECUTION`<br/>`ORCHESTRATOR_KNOWLEDGE_QA`<br/>`SPECIALIST_CONTENT`<br/>`SPECIALIST_PROCESS`<br/>`DOCUMENT` | Enhanced Markdown reading |
| **executeMarkdownEdits** | document | Markdown | `SPECIALIST_CONTENT`<br/>`SPECIALIST_PROCESS`<br/>`DOCUMENT` | Markdown semantic editing |
| **readYAMLFiles** | document | YAML | `ORCHESTRATOR_TOOL_EXECUTION`<br/>`ORCHESTRATOR_KNOWLEDGE_QA`<br/>`SPECIALIST_CONTENT`<br/>`SPECIALIST_PROCESS`<br/>`DOCUMENT` | YAML file reading |
| **executeYAMLEdits** | document | YAML | `SPECIALIST_CONTENT`<br/>`SPECIALIST_PROCESS`<br/>`DOCUMENT` | YAML semantic editing |
| **executeTextFileEdits** | document | Text Editing | `"prototype_designer"` | Text file editing (CSS/HTML/JS)<br/>**v3.0 new tool** |
| **syntax-checker** | document | Quality | `document_formatter` | Syntax checking tool |
| **traceability-completion-tool** | document | Quality | `document_formatter` | Traceability synchronization tool |

### Internal Layer Tools

| Tool Name | Layer | Category | Access Permissions | Description |
|-----------|-------|----------|-------------------|-------------|
| **finalAnswer** | internal | System | `ORCHESTRATOR_TOOL_EXECUTION`<br/>`ORCHESTRATOR_KNOWLEDGE_QA` | Final answer (orchestrator only) |
| **getSystemStatus** | internal | System | `ORCHESTRATOR_TOOL_EXECUTION`<br/>`ORCHESTRATOR_KNOWLEDGE_QA` | System status query |
| **createNewProjectFolder** | internal | Project | `project_initializer` | Create new project |
| **recordThought** | internal | Thinking | `SPECIALIST_CONTENT`<br/>`SPECIALIST_PROCESS` | Record thoughts |
| **taskComplete** | internal | Task | `SPECIALIST_CONTENT`<br/>`SPECIALIST_PROCESS` | Task completion |

### Permission Assignment Statistics

| Caller Type | Accessible Tool Count | Percentage |
|-------------|----------------------|------------|
| **ORCHESTRATOR_TOOL_EXECUTION** | 9 | 26% |
| **ORCHESTRATOR_KNOWLEDGE_QA** | 14 | 41% |
| **SPECIALIST_CONTENT** | 11 | 32% |
| **SPECIALIST_PROCESS** | 14 | 41% |
| **DOCUMENT** | 16 | 47% |
| **INTERNAL** | 3 | 9% |

### Classification by Risk Level

| Risk Level | Tool Count | Typical Tools |
|------------|-----------|---------------|
| **Low Risk (Read Operations)** | 11 | readFile, listFiles (refactored), readMarkdownFile |
| **Medium Risk (Write Operations)** | 8 | writeFile, executeMarkdownEdits |
| **High Risk (Delete/Move)** | 3 | deleteFile, moveAndRenameFile |
| **System Critical** | 8 | finalAnswer, createNewProjectFolder |

### v3.0 Individual-Level Control Examples

| Tool Name | Access Permissions (v3.0 format) | Description |
|-----------|----------------------------------|-------------|
| **askQuestion** | `ORCHESTRATOR_KNOWLEDGE_QA`<br/>`SPECIALIST_PROCESS`<br/>`"overall_description_writer"` | Hybrid control example:<br/>Type + Individual |

**Note**: More individual-level control tools will be added when creating dedicated tools for prototype_designer.

## 📚 Related Documentation

- [Tool Registry Implementation (src/tools/index.ts)](../src/tools/index.ts)
- [Access Controller Implementation (src/core/orchestrator/ToolAccessController.ts)](../src/core/orchestrator/ToolAccessController.ts)
- [Specialist Registry (src/core/specialistRegistry.ts)](../src/core/specialistRegistry.ts)
- [Orchestrator Rules (rules/orchestrator.md)](../rules/orchestrator.md)  
- [Specialist Rules Directory (rules/specialists/)](../rules/specialists/)
- [v3.0 Test Report (docs/TOOL_ACCESS_CONTROL_V3_TEST_REPORT.md)](./TOOL_ACCESS_CONTROL_V3_TEST_REPORT.md)

---

**Document Status**: 
- ✅ v2.0 Completed - Distributed access control implementation
- ✅ v3.0 Completed - Hybrid access control (CallerType + CallerName)
- 📊 Permission Assignment Table - Updated (2025-10-02)
**Next Review**: 2025-Q1  
**Maintainer**: SRS Writer Plugin Architecture Team 
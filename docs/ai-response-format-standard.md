# AI Response Format Standard (SRS Writer Plugin)

## Overview

This document defines the unified response format standard that all AI components (Orchestrator and Specialist) in SRS Writer Plugin must follow.

## Core Interface Definitions

### AIPlan Interface (TypeScript)

```typescript
export interface AIPlan {
    thought: string;                           // Detailed thinking process and reasoning logic
    response_mode: AIResponseMode;             // Response mode
    direct_response: string | null;            // Direct response content (only used in specific modes)
    tool_calls: Array<{ name: string; args: any }>; // Tool call list
}

export enum AIResponseMode {
    TOOL_EXECUTION = 'TOOL_EXECUTION',        // Execute tool operations
    KNOWLEDGE_QA = 'KNOWLEDGE_QA'             // Knowledge Q&A (includes general conversation)
}
```

## Standard Response Format

### Basic Structure

All AI components must return a JSON object in the following format, wrapped in a markdown code block:

```json
{
  "thought": "<Detailed thinking process>",
  "response_mode": "<TOOL_EXECUTION | KNOWLEDGE_QA>",
  "direct_response": "<String content or null>",
  "tool_calls": [
    {
      "name": "<Tool name>",
      "args": {
        "<Parameter name>": "<Parameter value>"
      }
    }
  ]
}
```

### Field Detailed Descriptions

#### `thought` (Required)
- **Type**: `string`
- **Purpose**: Record AI's thinking process, analysis logic, and decision basis
- **Requirements**: 
  - Detailed explanation of why a certain mode was chosen
  - Explain specialist routing logic (if applicable)
  - Describe understanding of user request
  - Explain next steps plan

#### `response_mode` (Required)
- **Type**: `AIResponseMode`
- **Possible Values**:
  - `TOOL_EXECUTION`: Need to execute tool operations
  - `KNOWLEDGE_QA`: Provide knowledge Q&A and general conversation

#### `direct_response` (Conditionally Required)
- **Type**: `string | null`
- **Usage Rules**:
  - `TOOL_EXECUTION` mode: Must be `null`
  - `KNOWLEDGE_QA` mode: Must be complete answer string (including general conversation)

#### `tool_calls` (Conditionally Required)
- **Type**: `Array<{name: string, args: any}>`
- **Usage Rules**:
  - `TOOL_EXECUTION` mode: Must contain at least one tool call
  - `KNOWLEDGE_QA` mode: Can contain knowledge retrieval tool calls, or be empty array `[]`

## Response Mode Detailed Guide

### TOOL_EXECUTION Mode

**When to Use**: User request requires actual operations (create, modify, delete, analyze files, etc.)

**Format Requirements**:
```json
{
  "thought": "User requested to create SRS document, this is a clear creation task...",
  "response_mode": "TOOL_EXECUTION", 
  "direct_response": null,
  "tool_calls": [
    {
      "name": "createComprehensiveSRS",
      "args": {
        "userInput": "Create e-commerce platform SRS",
        "projectName": "E-commerce Platform"
      }
    }
  ]
}
```

### KNOWLEDGE_QA Mode

**When to Use**: User inquires about knowledge, methods, best practices, etc., or engages in general conversation (greetings, thanks, small talk)

**Format Requirements (Knowledge Q&A)**:
```json
{
  "thought": "User asking how to write non-functional requirements, this is knowledge consultation...",
  "response_mode": "KNOWLEDGE_QA",
  "direct_response": "Non-functional requirements should follow SMART principles...",
  "tool_calls": []
}
```

**Format Requirements (General Conversation)**:
```json
{
  "thought": "User is greeting, this is general conversation, categorized as KNOWLEDGE_QA mode...",
  "response_mode": "KNOWLEDGE_QA",
  "direct_response": "Hello! I'm SRS Writer, happy to serve you...",
  "tool_calls": []
}
```

**Format Requirements (Knowledge Retrieval with Tool Calls)**:
```json
{
  "thought": "User asking about latest technology trends, need to retrieve relevant knowledge...",
  "response_mode": "KNOWLEDGE_QA",
  "direct_response": null,
  "tool_calls": [
    {
      "name": "internetSearch",
      "args": {
        "query": "Latest software engineering trends 2024"
      }
    }
  ]
}
```

## Specialist Tool Calling Specification

### Available Specialist Tools

1. **`createComprehensiveSRS`** - Create complete SRS document
2. **`editSRSDocument`** - Edit existing SRS document
3. **`classifyProjectComplexity`** - Analyze project complexity
4. **`lintSRSDocument`** - Execute SRS quality check

### Tool Call Parameter Specification

All specialist tools accept the following standard parameters:

```json
{
  "name": "<Specialist tool name>",
  "args": {
    "userInput": "<User's original request>",
    "projectName": "<Project name>",
    "sessionData": {
      "domain": "<Business domain>",
      "features": ["<Feature list>"],
      "timestamp": "<Timestamp>"
    }
  }
}
```

## Error Handling Standard

### Fallback Format on Parsing Failure

When unable to parse to standard format, return safe fallback:

```json
{
  "thought": "Error parsing response format, using safe fallback mode",
  "response_mode": "KNOWLEDGE_QA",
  "direct_response": "Sorry, there's an issue with my response format, please retry your request.",
  "tool_calls": []
}
```

## Validation Rules

### Required Field Validation
- All 4 fields must be present
- `thought` cannot be empty string
- `response_mode` must be valid enum value

### Logical Consistency Validation
- `TOOL_EXECUTION` mode: `direct_response` is null, `tool_calls` non-empty
- `KNOWLEDGE_QA` mode: Can be `direct_response` has content and `tool_calls` is empty array, or `direct_response` is null and `tool_calls` contains knowledge retrieval tools

### Tool Call Validation
- Tool name must be in registered tools list
- Tool parameters must conform to corresponding tool's schema

## Implementation Guidelines

### For Orchestrator
- Reference this standard in `rules/orchestrator.md`
- All examples must conform to this format

### For Specialist Rules
- Reference this standard at the beginning of each `rules/specialists/*.md` file
- Replace existing skill call format
- Ensure all examples conform to standard format

### Code Implementation
- `PlanGenerator.parseAIPlanFromResponse()` method based on this standard
- Add format validation logic
- Unified error handling mechanism

## Version History

| Version | Date | Changes |
|------|------|----------|
| 1.0 | 2024-01 | Initial version, unified response format standard |

## Related Documentation

- [Tool Access Control Matrix](./tool-access-control-matrix.md) - Tool calling permission matrix
- [Orchestrator Rules](../rules/orchestrator.md) - Orchestrator rules
- [Specialist Rules](../rules/specialists/) - Specialist rules collection 
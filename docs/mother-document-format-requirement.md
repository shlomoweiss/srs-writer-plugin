# SRS Writer Plugin - AI-Generated Mother Document Format Specification (v1.2 AST-Enhanced)

## Overview

This document provides format specifications and requirements for prompt engineers when AI generates `mother_document.md`.

🚀 **v1.2 Major Upgrade**: Parser upgraded to **AST-based architecture**, using marked.js for intelligent parsing, greatly improving format tolerance and robustness.

**New Architecture Advantages**:

- ✅ **Semantic Parsing**: Based on markdown syntax tree, not strict string matching
- ✅ **Format Flexibility**: Supports blank lines, description text, subheadings between headings and tables
- ✅ **Intelligent Matching**: Automatically recognizes heading variants, no need for exact format requirements
- ✅ **Robust Tolerance**: AI-generated format adjustments won't cause parsing failures

## 🏗️ Top-Level Block Identifiers (New Format, Recommended)

AI-generated mother documents must contain the following three top-level blocks in order:

```markdown
### --- AI_CLASSIFICATION_DECISION ---
### --- SOFTWARE_REQUIREMENTS_SPECIFICATION_CONTENT ---
### --- QUESTIONS_AND_SUGGESTIONS_CONTENT ---
```

## 📊 SRS Internal Section Identifiers (AST Intelligent Recognition)

🎯 **v1.2 New Feature**: AST parser can intelligently recognize various variants of section headings, no need to strictly follow fixed formats.

### Functional Requirements Section (Recommended Format, Supports Variants)

**Recommended Format**:

```markdown
## 3. 功能需求
## Functional Requirements
```

**AST Parser Automatically Supports Variants**:

- `## 3.功能需求` (no space)
- `## 3 功能需求` (no period)
- `### 3. 功能需求` (heading level 3)
- `## 三、功能需求` (Chinese numbering)
- And other headings containing "功能需求" or "Functional Requirements"

### Non-Functional Requirements Section (Recommended Format, Supports Variants)

**Recommended Format**:

```markdown
## 4. 非功能性需求
## Non-Functional Requirements
```

**AST Parser Automatically Supports**: Any heading containing "非功能性需求" or "Non-Functional Requirements"

### Glossary Section (Recommended Format, Supports Variants)

**Recommended Format**:

```markdown
## 术语表
## Glossary
```

**AST Parser Automatically Supports**: Any heading containing "术语表", "Glossary", "词汇表", "术语定义", "Terms"

## 🎯 Table Format Requirements (AST Flexible Positioning)

🚀 **v1.2 Major Improvement**: Table positioning is completely flexible! AST parser can intelligently locate the first table under a section, regardless of how much content is in between.

### ✅ Supported Flexible Format Examples

```markdown
## 3. 功能需求

本系统需要实现以下功能：

### 3.1 核心功能
系统的核心功能包括用户管理、数据处理等。

### 3.2 详细需求列表
以下是详细的功能需求：

| FR-ID | 需求名称 | 优先级 | 详细描述 | 验收标准 | 备注 |
|-------|---------|--------|----------|----------|------|
| FR-001 | 用户登录 | 高 | 用户可以登录系统 | 成功跳转主页 | 支持记住密码 |
```

**AST Parser's Intelligent Recognition**:

- ✅ Automatically skips descriptive text
- ✅ Automatically skips subheadings
- ✅ Automatically skips blank lines
- ✅ Precisely locates the first table

### Functional Requirements Table Format

```markdown
| FR-ID | 需求名称 | 优先级 | 详细描述 | 验收标准 | 备注 |
|-------|---------|--------|----------|----------|------|
| FR-LOGIN-001 | 示例需求 | 高 | 具体描述... | 验收条件... | 额外说明... |
```

### Non-Functional Requirements Table Format

```markdown
| NFR-ID | 类别 | 优先级 | 详细描述 | 衡量指标 | 备注 |
|--------|------|--------|----------|----------|------|
| NFR-PERF-001 | 性能 | 高 | 具体描述... | 具体指标... | 额外说明... |
```

### Glossary Format

```markdown
| 术语 | 定义 | 备注 |
|------|------|------|
| API | 应用程序编程接口 | 用于系统间通信 |
```

## 🔄 Backward Compatibility Support (Old Format)

The system also supports the following old format identifiers, but the new format is recommended:

```markdown
--- AI CLASSIFICATION DECISION ---
--- SOFTWARE REQUIREMENTS SPECIFICATION ---
--- QUESTIONS FOR CLARIFICATION ---
--- FUNCTIONAL REQUIREMENTS ---
--- NON-FUNCTIONAL REQUIREMENTS ---
--- GLOSSARY ---
```

## 📋 Complete Mother Document Structure Example (v1.2 Flexible Format)

### ✅ Recommended Format (Demonstrating AST Parser Flexibility)

```markdown
# AI-Generated Project Artifacts Bundle

### --- AI_CLASSIFICATION_DECISION ---
Project Type: Web Application
Complexity: Medium
Tech Stack: React + Node.js
Recommended Architecture: Microservices
Deployment: Containerized
...

### --- SOFTWARE_REQUIREMENTS_SPECIFICATION_CONTENT ---
# 《Sample Project》Software Requirements Specification

## 1. Introduction
This system aims to provide a modern user management platform...

## 2. System Overview
The system uses a front-end and back-end separation architecture...

## 3. Functional Requirements

This system needs to implement the following core functionalities:

### 3.1 User Management Functions
The system should provide complete user lifecycle management, including registration, login, permission control, etc.

### 3.2 Detailed Functional Requirements List
The following table describes the functional requirements of the system in detail:

| FR-ID | 需求名称 | 优先级 | 详细描述 | 验收标准 | 备注 |
|-------|---------|--------|----------|----------|------|
| FR-001 | 用户注册 | 高 | 新用户可以创建账户 | 注册成功跳转到验证页面 | 需要邮箱验证 |
| FR-002 | 用户登录 | 高 | 用户可以通过邮箱密码登录 | 登录成功后跳转到主页 | 支持记住密码 |

## 4. 非功能性需求

The system's non-functional requirements focus on performance, security, availability, etc.

### 4.1 Performance Requirements
The system should maintain good performance under various load conditions.

### 4.2 Security Requirements
The system must comply with industry security standards.

### 4.3 Specific Non-Functional Requirements
| NFR-ID | 类别 | 优先级 | 详细描述 | 衡量指标 | 备注 |
|--------|------|--------|----------|----------|------|
| NFR-001 | 性能 | 高 | 页面加载时间 | <2秒 | 在正常网络条件下 |
| NFR-002 | 安全 | 高 | 数据加密 | AES-256 | 敏感数据必须加密 |

## 5. System Architecture
...

## 术语表

To ensure document consistency, key terms used in the system are defined here:

| 术语 | 定义 | 备注 |
|------|------|------|
| SRS | 软件需求规格说明书 | Software Requirements Specification |
| API | 应用程序编程接口 | Application Programming Interface |
| JWT | JSON Web Token | 用于身份验证的令牌格式 |

### --- QUESTIONS_AND_SUGGESTIONS_CONTENT ---
## Questions Requiring Clarification

The following questions require further clarification:

1. How should user role permissions be divided?
2. Is third-party login support needed (e.g., WeChat, Alipay)?
3. Does the system need to support multiple languages?

## Improvement Suggestions

Based on best practices, consider the following improvements:

1. It is recommended to add a data backup strategy to ensure data security
2. Consider adding user behavior analysis to optimize user experience
3. It is recommended to implement API rate limiting to prevent malicious attacks
```

**🚀 AST Parser's Power**:

- ✅ Automatically recognizes heading "3. 功能需求", even if there's much content before it
- ✅ Intelligently skips subheadings "3.1 用户管理功能" and "3.2 详细需求列表"
- ✅ Precisely locates the functional requirements table, regardless of how much descriptive text is in between
- ✅ Also applies to parsing non-functional requirements and glossary

## ⚠️ Important Notes (v1.2 Update)

### ✅ Requirements That Still Need Strict Compliance

1. **Top-Level Block Identifier Exact Match**: `### --- XXX ---` format must be complete
2. **Table Format Integrity**: Header row and separator row must be complete
3. **Block Order Matters**: It is recommended to arrange in the order shown in examples
4. **Table Content Escaping**: If cell content contains `|` character, it will be automatically converted to `&#124;`

### 🚀 v1.2 Relaxed Requirements (AST Parser Advantages)

1. **Section Heading Flexible Matching**: No longer need exact punctuation and spacing
2. **Table Position Flexibility**: Can add descriptive text, subheadings, blank lines between headings and tables
3. **Heading Level Flexibility**: Supports different levels such as level 2, level 3 headings
4. **Strong Format Tolerance**: AI-generated format adjustments won't cause parsing failures

### 💡 Best Practice Recommendations

1. **Headings Contain Keywords**: Ensure headings contain keywords like "功能需求", "非功能性需求", "术语表"
2. **Clear Logical Structure**: Although format is flexible, maintaining clear logical structure aids understanding
3. **Table Integrity**: Ensure tables contain all required columns
4. **Content Richness**: Can add explanatory text between headings and tables to improve document readability

## 📍 Parsing Process Description (v1.2 AST-Enhanced)

### 🚀 New Architecture: AST-based Intelligent Parsing Flow

1. **Top-Level Parsing**: Recognize three main blocks (using regular expressions to match identifiers)
2. **SRS Content Extraction**: Extract complete SRS document from `SOFTWARE_REQUIREMENTS_SPECIFICATION_CONTENT` block  
3. **🆕 AST Parsing**: Use marked.js to parse SRS content into abstract syntax tree
4. **🆕 Intelligent Positioning**: Intelligently search for heading nodes and table nodes in AST
   - Find heading nodes containing keywords (e.g., "功能需求")
   - Look for the first table node after that heading
   - Automatically skip descriptive text, subheadings, blank lines in between
5. **Table Extraction**: Extract structured data from AST table nodes
6. **YAML Conversion**: Convert table data into structured YAML files
7. **File Generation**: Generate SRS.md, fr.yaml, nfr.yaml, glossary.yaml, etc.

### 🎯 Core Advantages of AST Architecture

- **Semantic Understanding**: Based on markdown syntax tree, understands document structure rather than string matching
- **Intelligent Tolerance**: Automatically adapts to format changes, improving parsing success rate
- **Precise Positioning**: Accurately finds tables corresponding to headings, even with complex content in between
- **Future Expansion**: Lays foundation for more complex document structure parsing

### 📋 Prompt Engineer Guide

**Core Requirements** (Must comply):

- Include correct top-level block identifiers
- Section headings contain keywords (功能需求, 非功能性需求, 术语表)
- Complete table format

**Recommended Practices** (Enhance experience):

- Add explanatory text between headings and tables
- Use subheadings to organize content
- Maintain clear logical structure

The AST parser will automatically handle format variations, ensuring stable parsing results.

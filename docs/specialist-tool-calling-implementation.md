# Specialist Tool Calling Capability Implementation Documentation

**Document Version**: 1.0  
**Implementation Date**: 2024-12-19  
**Author**: SRS Writer Plugin Architecture Team  

## 📖 Overview

This document details the complete implementation process of the **Specialist Layer Tool Calling Capability** in SRS Writer Plugin. This is the last key component of the architecture upgrade, marking the full activation of the dual-layer AI architecture, with the system officially upgraded from a "pure text generation tool" to an "intelligent business execution platform".

## 🎯 Implementation Goals

### **Core Objectives**
- Provide real tool calling capability for Specialist AI
- Integrate distributed access control system
- Implement intelligent orchestration of Document layer fat tools
- Ensure clear and maintainable architecture

### **Technical Objectives**
- VSCode native tool calling API integration
- Multi-turn interaction support (AI → Tool → Result → AI)
- Automatic injection of calling guides
- Backward compatibility guarantee

## 🏗️ 架构设计

### **最终架构图**
```
用户输入 → Orchestrator AI → Specialist AI → Document 胖工具 → 原子操作 → 文件系统
              ↓                    ↓               ↓
        智能意图分诊        业务决策执行      内部工具编排
        工具路由选择        工具调用序列      原子操作聚合
```

### **工具调用流程**
```
1. SpecialistExecutor.executeSpecialist()
2. 加载 specialist 规则 + 获取可用工具列表
3. VSCode API 调用 (包含工具定义)
4. AI 返回 tool_calls 数组
5. 执行工具调用 + 访问权限验证
6. 将工具结果反馈给 AI
7. AI 生成最终响应
```

### **关键设计决策**

#### **胖工具 vs 细粒度工具**
**选择**: 胖工具模式  
**原因**: 
- AI 专注高级业务决策，不需要管理低级工具编排
- 业务逻辑封装在代码中，而非 AI 提示词中
- 符合分层架构原则，职责分离清晰

#### **Document 层不访问 LLM**
**选择**: Document 层纯编程逻辑  
**原因**:
- 避免三层AI架构的复杂性
- 确保性能和可靠性
- 将智能决策留给 Specialist AI

## 🚀 Core Implementation

### **1. SpecialistExecutor Upgrade**

#### **Tool Calling Integration**
```typescript
// src/core/specialistExecutor.ts (Key additions)

// Get tools available to Specialist
const toolsInfo = await this.toolCacheManager.getTools(CallerType.SPECIALIST);
const toolsForVSCode = this.convertToolsToVSCodeFormat(toolsInfo.definitions);

// If tools are available, provide them to AI
if (toolsForVSCode.length > 0) {
    requestOptions.toolMode = vscode.LanguageModelChatToolMode.Required;
    requestOptions.tools = toolsForVSCode;
}

// Handle tool calls
if (response.toolCalls && response.toolCalls.length > 0) {
    return await this.handleToolCallsWorkflow(response, messages, model, requestOptions);
}
```

#### **Multi-Turn Interaction Handling**
```typescript
private async handleToolCallsWorkflow(
    response: vscode.LanguageModelChatResponse,
    messages: vscode.LanguageModelChatMessage[],
    model: vscode.LanguageModelChat,
    requestOptions: vscode.LanguageModelChatRequestOptions
): Promise<string> {
    // Execute all tool calls
    const toolResults: vscode.LanguageModelChatMessage[] = [];
    
    for (const toolCall of response.toolCalls) {
        const result = await this.executeToolCall(toolCall);
        toolResults.push(vscode.LanguageModelChatMessage.Tool(result, toolCall.id));
    }

    // Second turn: Feed tool results back to AI
    const updatedMessages = [...messages, ...toolResults];
    const secondResponse = await model.sendRequest(updatedMessages, requestOptions);
    
    return finalResult;
}
```

#### **Access Control Verification**
```typescript
private async executeToolCall(toolCall: vscode.LanguageModelChatToolCall): Promise<string> {
    const { name: toolName, parameters } = toolCall;
    
    // Verify access permissions
    if (!this.toolAccessController.validateAccess(CallerType.SPECIALIST, toolName)) {
        throw new Error(`🚫 Access denied: Specialist cannot access tool: ${toolName}`);
    }

    // Get tool implementation and execute
    const toolImplementation = toolRegistry.getImplementation(toolName);
    const result = await toolImplementation(parameters);
    
    return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
}
```

### **2. Calling Guide Injection System**

#### **Template Variable Extension**
```typescript
// Supported calling guide placeholders
{{TOOL_CALLING_GUIDE.toolName}}    // Single tool guide
{{ALL_TOOL_GUIDES}}                // All tool guides
```

#### **Guide Formatting**
```typescript
private formatCallingGuide(tool: any): string {
    const guide = tool.callingGuide;
    
    let formatted = `**When to Use**: ${guide.whenToUse || 'Not specified'}\n\n`;
    
    if (guide.prerequisites) {
        formatted += `**Prerequisites**: ${guide.prerequisites}\n\n`;
    }
    
    if (guide.inputRequirements) {
        formatted += `**Input Requirements**:\n`;
        for (const [key, desc] of Object.entries(guide.inputRequirements)) {
            formatted += `- ${key}: ${desc}\n`;
        }
    }
    
    return formatted.trim();
}
```

### **3. Document Layer Tool Enhancement**

#### **Tool Definition Extension**
```typescript
export const addNewRequirementToolDefinition = {
    name: "addNewRequirement",
    description: "Add a new functional requirement to the project",
    parameters: { /* JSON Schema */ },
    
    // 🚀 New: Distributed access control
    accessibleBy: [CallerType.SPECIALIST, CallerType.DOCUMENT],
    
    // 🚀 New: Calling guide
    callingGuide: {
        whenToUse: "When adding a new functional requirement to an existing project",
        prerequisites: "Project must have existing SRS.md file",
        inputRequirements: {
            projectPath: "Required: Project directory path",
            requirement: "Required: Requirement object with complete fields"
        },
        internalWorkflow: [
            "1. Verify project status and SRS.md file existence",
            "2. Create backup file to ensure transactional safety",
            "3. Read existing functional requirements list",
            "4. Generate new requirement ID (FR-XXX format)",
            "5. Update functional requirements table in both fr.yaml and SRS.md",
            "6. Atomic commit or automatic rollback"
        ],
        commonPitfalls: [
            "Don't call this tool when project doesn't exist",
            "Ensure requirement object contains all required fields",
            "priority must be one of 'High', 'Medium', 'Low'"
        ]
    }
};
```

## 🔐 Access Control Matrix

### **Specialist Accessible Tools**
| Tool Name | Layer | Purpose | Call Scenario |
|---------|------|------|----------|
| `addNewRequirement` | document | Add functional requirement | Requirement management |
| `listRequirements` | document | List existing requirements | Status check |
| `generateFullSrsReport` | document | Generate complete report | Document generation |
| `customRAGRetrieval` | atomic | Enterprise knowledge retrieval | Content enhancement |
| `readFile` | atomic | Read file | Document inspection |
| `writeFile` | atomic | Write file | Document creation |
| `finalAnswer` | internal | Task completion | Process termination |

### **Access Control Verification**
Test results confirm tool access permissions for each caller:
- **SPECIALIST**: 6 tools ✅
- **ORCHESTRATOR_TOOL_EXECUTION**: 4 tools ✅  
- **ORCHESTRATOR_KNOWLEDGE_QA**: 3 tools (customRAGRetrieval, readLocalKnowledge, internetSearch) ✅
- **ORCHESTRATOR_GENERAL_CHAT**: 1 tool (only readFile) ✅

## 📋 Usage Guide

### **Specialist Rule Writing**

#### **Basic Template**
```markdown
# rules/specialists/your_specialist.md

## Workflow
1. **Knowledge Retrieval Phase**
   - Call customRAGRetrieval or readLocalKnowledge to get relevant knowledge and templates
   
2. **Content Generation Phase**
   - Generate complete content based on retrieved knowledge
   
3. **Tool Execution Phase**
   - Call appropriate Document layer fat tools
   
## Available Tool Calling Guides
{{ALL_TOOL_GUIDES}}

## Example Call Sequence
```json
{
  "tool_calls": [
    {
      "name": "customRAGRetrieval",
      "args": {
        "query": "{{USER_INPUT}} related best practices",
        "contextType": "content_generation"
      }
    }
  ]
}
```

After retrieving results:
```json
{
  "tool_calls": [
    {
      "name": "addNewRequirement",
      "args": {
        "projectPath": "extracted-project-path",
        "requirement": {
          "name": "Requirement Name",
          "priority": "High",
          "description": "Detailed description",
          "acceptance_criteria": "Acceptance criteria"
        }
      }
    }
  ]
}
```
```

### **Tool Development Guide**

#### **New Document Tool Template**
```typescript
export const newToolDefinition = {
    name: "newTool",
    description: "Tool description",
    parameters: { /* JSON Schema */ },
    
    // 🚀 Required: Access control
    accessibleBy: [
        CallerType.SPECIALIST,
        CallerType.DOCUMENT  // If same-layer calling is needed
    ],
    
    // 🚀 Required: Calling guide
    callingGuide: {
        whenToUse: "When to use this tool",
        prerequisites: "Prerequisites",
        inputRequirements: {
            param1: "Parameter 1 description",
            param2: "Parameter 2 description"
        },
        internalWorkflow: [
            "1. Workflow step 1",
            "2. Workflow step 2"
        ],
        commonPitfalls: [
            "Common mistake 1",
            "Common mistake 2"
        ]
    }
};

export async function newTool(args: NewToolArgs): Promise<ToolResult> {
    // Implement fat tool logic:
    // 1. Parameter validation
    // 2. Call other same-layer tools (if needed)
    // 3. Call atomic tools to execute operations
    // 4. Return structured result
}
```

## 🔧 Maintenance Guide

### **Adding New Specialist Rules**
1. Create new `.md` file in `rules/specialists/`
2. Use calling guide placeholders: `{{TOOL_CALLING_GUIDE.toolName}}`
3. Add mapping in `SpecialistExecutor.getSpecialistFileName()`
4. Test tool calling permissions

### **Extending Document Layer Tools**
1. Add `accessibleBy` and `callingGuide` properties for new tools
2. Ensure tools return unified result format
3. Register tool implementation in `toolRegistry`
4. Run access control tests

### **Debugging Tool Calling Issues**
```typescript
// Generate access control report
const report = toolAccessController.generateAccessReport(CallerType.SPECIALIST);
console.log(report);

// Verify specific tool access
const hasAccess = toolAccessController.validateAccess(CallerType.SPECIALIST, 'toolName');
console.log(`Access: ${hasAccess}`);
```

## 🚨 Important Notes

### **Important Constraints**
1. **Document Layer Cannot Access LLM**: Maintain pure programming logic
2. **Same-Layer Tool Calling**: Document tools can call other same-layer tools
3. **Access Permissions**: Must explicitly define `accessibleBy` for all new tools
4. **Backward Compatibility**: Retain all fallback degradation logic

### **Performance Considerations**
1. **Tool Caching**: `ToolCacheManager` caches tool lists by caller type
2. **Multi-Turn Interaction**: Each tool call is a new VSCode API request
3. **Calling Guides**: Generated during template replacement, not cached

### **Error Handling**
1. **Access Denied**: Return clear permission error messages
2. **Tool Failure**: Continue executing other tools, collect all errors
3. **Fallback Mechanism**: Fall back to pure text mode when tool calling fails

## 📈 Performance Data

### **Build Verification**
- ✅ TypeScript Compilation: No errors
- ✅ Webpack Build: No warnings  
- ✅ Access Control Tests: 100% passed
- ✅ Backward Compatibility: Fully maintained

### **Access Control Statistics**
- Total Tools: ~25
- SPECIALIST Accessible: 6 core business tools
- ORCHESTRATOR Various Modes: 1-4 tools
- Permission Verification: Code-layer enforcement

## 🎯 Future Extensions

### **Short-term Plans**
1. Add more Document layer fat tools
2. Enhance Specialist rule library
3. Improve error handling and logging

### **Long-term Plans**
1. Tool calling performance optimization
2. Advanced tool orchestration capabilities
3. Visualize tool calling chains

## 📚 Related Documentation

- [Distributed Tool Access Control Design](./tool-access-control-matrix.md)
- [Orchestrator Decision Engine Rules](../rules/orchestrator.md)
- [Tool Registry Implementation](../src/tools/index.ts)
- [Specialist Rules Directory](../rules/specialists/)

---

**Document Status**: ✅ Implementation Complete  
**Next Review**: 2024-Q1  
**Maintainer**: SRS Writer Plugin Architecture Team

**🎉 Important Milestone**: This implementation marks the full activation of SRS Writer Plugin's dual-layer AI architecture, upgrading from a text generation tool to an intelligent business execution platform! 
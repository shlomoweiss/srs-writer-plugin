import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
import { toolRegistry } from '../../tools/index';
import { AgentState, InteractionRequest, ExecutionStep, ToolCallResult } from './AgentState';

/**
 * 工具执行处理器 - 负责各种类型工具的执行逻辑
 */
export class ToolExecutionHandler {
  private logger = Logger.getInstance();

  /**
   * 自主工具处理 - 透明执行 🚀 Code Review完整优化版本
   */
  public async handleAutonomousTool(
    toolCall: { name: string; args: any },
    stream: vscode.ChatResponseStream,
    state: AgentState,
    hasRecentToolExecution: (toolName: string, args: any) => ExecutionStep | null,
    recordExecution: (
      type: ExecutionStep['type'], 
      content: string, 
      success?: boolean,
      toolName?: string,
      result?: any,
      args?: any,
      duration?: number,
      errorCode?: string,
      retryCount?: number
    ) => void,
    toolExecutor?: any,
    selectedModel?: any  // 🚀 新增：selectedModel 参数
  ): Promise<void> {
    // 🚀 架构师新增：重复检测机制
    const recentExecution = hasRecentToolExecution(toolCall.name, toolCall.args);
    if (recentExecution) {
      stream.markdown(vscode.l10n.t('⏭️ **Skipping duplicate call**: {0} (already executed within 30 seconds)\n', toolCall.name));
      recordExecution(
        'tool_call_skipped',
        vscode.l10n.t('Skipping duplicate tool call: {0}', toolCall.name),
        true,
        toolCall.name,
        { reason: 'duplicate_in_time_window' },
        toolCall.args
      );
      return;
    }

    stream.markdown(vscode.l10n.t('🔧 **Executing tool**: {0}\n', toolCall.name));
    
    // 🚀 Code Review新增：记录开始时间
    const startTime = Date.now();
    // 🚀 修复：移除重复记录，只保留最终结果记录
    
    try {
      const result = await this.executeTool(toolCall, toolExecutor, selectedModel);  // 🚀 修复：传递 selectedModel
      const duration = Date.now() - startTime;
      
      // 🚀 新增：检查工具是否需要聊天交互（特别是askQuestion工具）
      if (result.success && result.output && typeof result.output === 'object' && 
          'needsChatInteraction' in result.output && (result.output as any).needsChatInteraction) {
        const chatOutput = result.output as any; // 类型断言以访问聊天交互属性
        this.logger.info(`💬 Tool ${toolCall.name} needs chat interaction: ${chatOutput.chatQuestion}`);
        
        // 设置引擎状态为等待用户输入
        state.stage = 'awaiting_user';
        state.pendingInteraction = {
          type: 'input',
          message: chatOutput.chatQuestion,
          toolCall: toolCall,
          originalResult: result.output
        };
        
        // 在聊天中显示问题
        stream.markdown(`💬 **${chatOutput.chatQuestion}**\n\n`);
        stream.markdown(vscode.l10n.t('Please enter your response below...\n\n'));

        recordExecution(
          'user_interaction',
          vscode.l10n.t('Tool {0} needs chat interaction: {1}', toolCall.name, chatOutput.chatQuestion),
          true,
          toolCall.name,
          result.output,
          toolCall.args,
          duration
        );
        
        return; // 暂停执行，等待用户回复
      }
      
      // 🚀 修复：正确检查工具执行结果状态
      if (!result.success) {
        // 工具执行失败的处理
        const errorMsg = result.error || vscode.l10n.t('Unknown error');
        stream.markdown(vscode.l10n.t('❌ **{0}** execution failed ({1}ms): {2}\n\n', toolCall.name, duration, errorMsg));

        recordExecution(
          'tool_call',
          vscode.l10n.t('{0} execution failed: {1}', toolCall.name, errorMsg),
          false,
          toolCall.name,
          result,
          toolCall.args,
          duration
        );

        return;
      }

      // 工具执行成功的处理
      stream.markdown(vscode.l10n.t('✅ **{0}** execution succeeded ({1}ms)\n', toolCall.name, duration));
      if (result.output) {
        // 🚀 修复：正确处理对象输出，避免 [object Object] 问题
        let outputText: string;
        if (typeof result.output === 'string') {
          outputText = result.output;
        } else {
          // 对象类型需要序列化
          try {
            outputText = JSON.stringify(result.output, null, 2);
          } catch (serializeError) {
            outputText = vscode.l10n.t('[Output serialization failed: {0}]', (serializeError as Error).message);
          }
        }
        stream.markdown(`\`\`\`json\n${outputText}\n\`\`\`\n\n`);
      }
      
      // 🚀 Code Review优化：记录完整的执行结果包含duration
      recordExecution(
        'tool_call',
        vscode.l10n.t('{0} execution succeeded', toolCall.name),
        true,
        toolCall.name,
        result,
        toolCall.args,
        duration // 🚀 新增：执行耗时
      );
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = (error as Error).message;
      
      // 🚀 Code Review新增：智能错误分类
      let errorCode = 'EXECUTION_FAILED';
      if (errorMsg.includes('not found')) {
        errorCode = 'TOOL_NOT_FOUND';
      } else if (errorMsg.includes('permission') || errorMsg.includes('access')) {
        errorCode = 'PERMISSION_DENIED';
      } else if (errorMsg.includes('timeout')) {
        errorCode = 'TIMEOUT';
      } else if (errorMsg.includes('network')) {
        errorCode = 'NETWORK_ERROR';
      }
      
      stream.markdown(vscode.l10n.t('❌ **{0}** execution failed ({1}ms): {2}\n\n', toolCall.name, duration, errorMsg));

      // 🚀 Code Review优化：记录详细的错误信息包含duration和errorCode
      recordExecution(
        'tool_call',
        vscode.l10n.t('{0} execution failed: {1}', toolCall.name, errorMsg),
        false,
        toolCall.name,
        { error: errorMsg, stack: (error as Error).stack },
        toolCall.args,
        duration, // 🚀 执行耗时
        errorCode // 🚀 错误代码
      );
    }
  }

  /**
   * 交互工具处理 - 智能暂停
   */
  public async handleInteractiveTool(
    toolCall: { name: string; args: any },
    stream: vscode.ChatResponseStream,
    state: AgentState,
    recordExecution: (type: ExecutionStep['type'], content: string, success?: boolean) => void
  ): Promise<void> {
    state.stage = 'awaiting_user';
    
    // 创建交互请求
    const interaction: InteractionRequest = {
      type: this.determineInteractionType(toolCall),
      message: this.generateInteractionMessage(toolCall),
      options: toolCall.args.options,
      timeout: 300000, // 5分钟超时
      toolCall: toolCall
    };
    
    state.pendingInteraction = interaction;
    
    // 流式显示交互请求
    stream.markdown(vscode.l10n.t('✋ **Your input is required**\n\n'));
    
    // 🚀 新增：Null 安全检查
    if (interaction.message) {
      stream.markdown(`${interaction.message}\n\n`);
    }
    
    if (interaction.options) {
      interaction.options.forEach((option, index) => {
        stream.markdown(`${index + 1}. ${option}\n`);
      });
    }
    
    // 🚀 修复：记录时也要处理 null
    const messageForLog = interaction.message || vscode.l10n.t('(no message prompt)');
    recordExecution('user_interaction', vscode.l10n.t('Waiting for user input: {0}', messageForLog));
  }

  /**
   * 确认工具处理 - 智能确认
   */
  public async handleConfirmationTool(
    toolCall: { name: string; args: any }, 
    classification: { type: string; riskLevel: 'low' | 'medium' | 'high'; requiresConfirmation: boolean },
    stream: vscode.ChatResponseStream,
    state: AgentState,
    recordExecution: (type: ExecutionStep['type'], content: string, success?: boolean) => void,
    handleAutonomousTool: (toolCall: { name: string; args: any }) => Promise<void>
  ): Promise<void> {
    // 使用新的分类信息（如果提供）或回退到旧的评估方式
    let riskLevel: 'low' | 'medium' | 'high' = classification.riskLevel;
    
    if (riskLevel === 'low') {
      // 低风险操作直接执行
      await handleAutonomousTool(toolCall);
    } else {
      // 高风险操作需要确认
      const riskIcon = riskLevel === 'high' ? '🔴' : '🟡';
      stream.markdown(vscode.l10n.t('{0} **Confirmation required** ({1} risk): About to execute {2}\n', riskIcon, riskLevel, toolCall.name));
      stream.markdown(vscode.l10n.t('Parameters: {0}\n\n', JSON.stringify(toolCall.args, null, 2)));
      stream.markdown(vscode.l10n.t('Continue? (enter \'yes\' to continue, \'no\' to cancel)\n\n'));

      state.stage = 'awaiting_user';
      state.pendingInteraction = {
        type: 'confirmation',
        message: vscode.l10n.t('Confirm execution of {0}?', toolCall.name),
        options: ['yes', 'no'],
        toolCall: toolCall
      };

      recordExecution('user_interaction', vscode.l10n.t('Waiting for user confirmation: {0} ({1} risk)', toolCall.name, riskLevel));
    }
  }

  /**
   * 处理finalAnswer工具
   */
  public async handleFinalAnswer(
    toolCall: { name: string; args: any },
    stream: vscode.ChatResponseStream,
    recordExecution: (
      type: ExecutionStep['type'], 
      content: string, 
      success?: boolean,
      toolName?: string,
      result?: any,
      args?: any,
      duration?: number,
      errorCode?: string,
      retryCount?: number
    ) => void,
    toolExecutor?: any,
    selectedModel?: any  // 🚀 新增：selectedModel 参数
  ): Promise<void> {
    stream.markdown(vscode.l10n.t('🎯 **AI final answer**\n\n'));
    
    const startTime = Date.now();
    try {
      const result = await this.executeTool(toolCall, toolExecutor, selectedModel);  // 🚀 修复：传递 selectedModel
      const duration = Date.now() - startTime;
      
      // 🚀 修复：使用正确的字段名 result.output
      if (result.success && result.output) {
        // 解析finalAnswer的结构化输出
        try {
          let finalResult;
          
          // 🚀 修复：检查返回值是否已经是对象
          if (typeof result.output === 'string') {
            finalResult = JSON.parse(result.output);
          } else {
            finalResult = result.output; // 已经是对象了
          }
          
          if (finalResult.summary) {
            stream.markdown(vscode.l10n.t('### ✅ Task completed\n\n{0}\n\n', finalResult.summary));
          }

          if (finalResult.result) {
            stream.markdown(vscode.l10n.t('**Execution result**: {0}\n\n', finalResult.result));
          }

          if (finalResult.achievements && finalResult.achievements.length > 0) {
            stream.markdown(vscode.l10n.t('**Work completed:**\n'));
            finalResult.achievements.forEach((achievement: string, index: number) => {
              stream.markdown(`${index + 1}. ${achievement}\n`);
            });
            stream.markdown('\n');
          }

          if (finalResult.nextSteps) {
            stream.markdown(vscode.l10n.t('**Recommended next steps:** {0}\n\n', finalResult.nextSteps));
          }
          
        } catch (parseError) {
          // 🚀 修复：如果解析失败，安全地输出字符串
          const outputText = typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2);
          stream.markdown(`${outputText}\n\n`);
        }
      } else if (result.success) {
        // 如果成功但没有output，显示简单完成消息
        stream.markdown(vscode.l10n.t('✅ Task completed\n\n'));
      }

      recordExecution('result', vscode.l10n.t('finalAnswer execution completed'), true, toolCall.name, result, toolCall.args, duration);

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = (error as Error).message;
      stream.markdown(vscode.l10n.t('❌ **finalAnswer execution failed**: {0}\n\n', errorMsg));
      recordExecution('result', vscode.l10n.t('finalAnswer execution failed: {0}', errorMsg), false, toolCall.name, { error: errorMsg }, toolCall.args, duration, 'EXECUTION_FAILED');
    }
  }

  /**
   * 执行工具 - 调用ToolExecutor 🚀 Code Review优化版本
   */
  private async executeTool(
    toolCall: { name: string; args: any },
    toolExecutor?: any,
    selectedModel?: any  // 🚀 新增：selectedModel 参数
  ): Promise<ToolCallResult> {
    if (!toolExecutor) {
      throw new Error(vscode.l10n.t('ToolExecutor not initialized'));
    }
    
    try {
      // 🚀 修复：传递 selectedModel 参数给 ToolExecutor
      const result = await toolExecutor.executeTool(
        toolCall.name, 
        toolCall.args,
        undefined,  // caller 参数
        selectedModel  // 🚀 新增：selectedModel 参数
      );
      
      return {
        success: result.success || false,
        output: result.result || result.output,
        toolName: toolCall.name,
        args: toolCall.args
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        toolName: toolCall.name,
        args: toolCall.args
      };
    }
  }

  /**
   * 辅助方法
   */
  private determineInteractionType(toolCall: { name: string; args: any }): 'confirmation' | 'choice' | 'input' {
    if (toolCall.args.options && Array.isArray(toolCall.args.options)) {
      return 'choice';
    }
    if (toolCall.name.includes('confirm') || toolCall.name.includes('Confirm')) {
      return 'confirmation';
    }
    return 'input';
  }

  private generateInteractionMessage(toolCall: { name: string; args: any }): string {
    if (toolCall.args.message) {
      return toolCall.args.message;
    }
    return vscode.l10n.t('Tool {0} needs your input. Please provide the required information.', toolCall.name);
  }
} 
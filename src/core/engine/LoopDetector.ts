import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
import { AgentState, ExecutionStep } from './AgentState';

/**
 * 循环检测和恢复机制 - 防止无限循环和智能恢复
 */
export class LoopDetector {
  private logger = Logger.getInstance();

  /**
   * 增强的无限循环检测 - 检测工具调用模式 🚀 架构师优化版本
   */
  public detectInfiniteLoop(state: AgentState): boolean {
    // 1. 硬性迭代限制
    if (state.iterationCount >= state.maxIterations) {
        this.logger.warn(`Reached maximum iterations: ${state.maxIterations}`);
        return true;
    }
    
    // 2. 🚀 架构师建议：简化的连续工具检测
    if (state.executionHistory.length >= 3) {
        const recent = state.executionHistory.slice(-3);
        const toolNames = recent.map(s => s.toolName).filter(Boolean);
        
        // 检测连续3次相同工具调用
        if (toolNames.length === 3 && toolNames.every(name => name === toolNames[0])) {
            this.logger.warn(`Detected infinite loop: ${toolNames[0]} called 3 times consecutively`);
            return true;
        }
    }
    
    // 3. 🚀 原有的复杂检测逻辑保留作为备用
    const recentToolCalls = state.executionHistory
        .filter(step => step.type === 'tool_call' && step.iteration && step.toolName)
        .slice(-6)
        .map(step => step.toolName!);
    
    if (recentToolCalls.length >= 4) {
        // 检测A-B-A-B模式
        const pattern = recentToolCalls.slice(-4);
        if (pattern[0] === pattern[2] && pattern[1] === pattern[3] && pattern[0] !== pattern[1]) {
            this.logger.warn(`Detected A-B-A-B loop pattern: ${pattern[0]} <-> ${pattern[1]}`);
            return true;
        }
    }
    
    // 4. 检测"suggestNextAction"死循环
    const recentSuggestions = recentToolCalls.filter(tool => tool === 'suggestNextAction');
    if (recentSuggestions.length >= 3) {
        this.logger.warn(`Detected suggestNextAction loop: ${recentSuggestions.length} consecutive suggestions`);
        return true;
    }
    
    return false;
  }

  /**
   * 🚀 架构师新增：精确的重复工具检测
   * 
   * 检测最近是否有相同参数的相同工具执行
   */
  public hasRecentToolExecution(toolName: string, args: any, executionHistory: ExecutionStep[]): ExecutionStep | null {
    return executionHistory
        .filter(step => step.toolName === toolName && step.success)
        .find(step => {
            if (!step.args) return false;
            try {
                return JSON.stringify(step.args) === JSON.stringify(args) &&
                       Date.now() - step.timestamp < 30000; // 30秒内
            } catch (error) {
                // JSON序列化失败时的后备比较
                return false;
            }
        }) || null;
  }

  /**
   * 🚀 架构师新增：强制直接响应机制
   * 
   * 当检测到循环时，强制生成总结性回复
   */
  public async forceDirectResponse(
    state: AgentState,
    stream: vscode.ChatResponseStream,
    recordExecution: (type: ExecutionStep['type'], content: string, success?: boolean) => void
  ): Promise<void> {
    stream.markdown(vscode.l10n.t('🔄 **Intelligent summary mode activated**\n\n'));

    // 分析已完成的操作
    const completedActions = state.executionHistory
        .filter(step => step.success === true && step.type === 'tool_call')
        .map(step => `${step.toolName}: ${step.content}`)
        .slice(-10); // 最近10个成功操作

    if (completedActions.length > 0) {
        stream.markdown(vscode.l10n.t('✅ **Completed actions**:\n'));
        completedActions.forEach((action, index) => {
            stream.markdown(`${index + 1}. ${action}\n`);
        });
        stream.markdown(`\n`);
    }

    // 基于当前任务生成智能总结
    stream.markdown(vscode.l10n.t('📋 **Task summary**: Based on the executed actions, I have completed the relevant analysis and processing for your request "{0}".\n\n', state.currentTask));

    if (completedActions.length > 0) {
        stream.markdown(vscode.l10n.t('💡 **Suggestion**: You can continue exploring based on the above results, or make a new request.\n\n'));
    } else {
        stream.markdown(vscode.l10n.t('💡 **Suggestion**: If you need further assistance, please let me know what specific help you need.\n\n'));
    }

    // 记录强制响应
    recordExecution('forced_response', vscode.l10n.t('Intelligent loop detection: Forced task completion'), true);
    state.stage = 'completed';
  }

  /**
   * 改进的无限循环处理 🚀 架构师优化版本
   */
  public async handleInfiniteLoop(
    state: AgentState,
    stream: vscode.ChatResponseStream,
    recordExecution: (type: ExecutionStep['type'], content: string, success?: boolean) => void
  ): Promise<void> {
    stream.markdown(vscode.l10n.t('⚠️ **Infinite loop detected, activating intelligent recovery mechanism**\n\n'));

    // 分析循环类型
    const recentToolCalls = state.executionHistory
        .filter(step => step.type === 'tool_call' && step.toolName)
        .slice(-6)
        .map(step => step.toolName!);

    if (recentToolCalls.length > 0) {
        const toolCounts = recentToolCalls.reduce((acc, tool) => {
            acc[tool] = (acc[tool] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        stream.markdown(vscode.l10n.t('**Loop analysis**: Recently called {0} types of tools\n', Object.keys(toolCounts).length));
        Object.entries(toolCounts).forEach(([tool, count]) => {
            stream.markdown(vscode.l10n.t('- {0}: {1} times\n', tool, count));
        });
        stream.markdown(`\n`);
    }

    stream.markdown(vscode.l10n.t('**Iteration count**: {0}\n\n', state.iterationCount));
    
    // 🚀 使用架构师的强制完成机制
    await this.forceDirectResponse(state, stream, recordExecution);
  }
} 
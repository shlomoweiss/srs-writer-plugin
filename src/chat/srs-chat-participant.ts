import * as vscode from 'vscode';
import { SessionContext, ISessionObserver } from '../types/session';
import { Logger } from '../utils/logger';
import { CHAT_PARTICIPANT_ID } from '../constants';
import { Orchestrator } from '../core/orchestrator';
import { SessionManager } from '../core/session-manager';
import { SRSAgentEngine } from '../core/srsAgentEngine';
import { toolExecutor } from '../core/toolExecutor';

/**
 * SRS Chat Participant v6.0 - Global Engine Architecture
 * 
 * 🚀 Architectural Features:
 * - Global Singleton Engine: One engine per plugin instance
 * - Dynamic Session Adaptation: Engine automatically adapts to session changes
 * - State Memory Persistence: Maintains execution state across interactions
 * - Transparent Proxy Pattern: Full delegation to SRSAgentEngine
 */
export class SRSChatParticipant implements ISessionObserver {
    private logger = Logger.getInstance();
    
    //Core Dependency Components
    private orchestrator: Orchestrator;
    private sessionManager: SessionManager;
    
    // 🚀 Global Singleton Engine
    private static globalEngine: SRSAgentEngine | null = null;
    private static globalEngineLastActivity: number = 0;
    
    // 🚀 Track current session ID, used to detect session changes
    private currentSessionId: string | null = null;
    
    private constructor() {
        this.logger.info('🚀 SRSChatParticipant v6.0 initialized - Global Engine Architecture');
        
        this.orchestrator = new Orchestrator();
        this.sessionManager = SessionManager.getInstance();
        
        // 🚀 Subscribe to SessionManager's session change notifications
        this.sessionManager.subscribe(this);
        
        // 🚀 Asynchronously initialize the session manager
        this.sessionManager.autoInitialize().catch(error => {
            this.logger.error('Failed to auto-initialize session manager', error as Error);
        });
    }

    /**
     * Register chat participant
     */
    public static register(context: vscode.ExtensionContext): SRSChatParticipant {
        const participant = new SRSChatParticipant();
        
        // Register chat participant
        const disposable = vscode.chat.createChatParticipant(
            CHAT_PARTICIPANT_ID, 
            participant.handleRequest.bind(participant)
        );
        
        // Set participant properties
        disposable.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media/logo.png');
        disposable.followupProvider = {
            provideFollowups: participant.provideFollowups.bind(participant)
        };
        
        context.subscriptions.push(disposable);
        
        return participant;
    }

    /**
     * Handle chat request
     */
    private async handleRequest(
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        const startTime = Date.now();
        this.logger.info(`📥 处理聊天请求: ${request.prompt}`);

        try {
            
            await this.processRequestCore(request.prompt, request.model, stream, token);

        } catch (error) {
            this.logger.error('聊天请求处理失败', error as Error);
            
          
            if (error instanceof vscode.LanguageModelError) {
                this.logger.error(`Language Model API Error - Code: ${error.code}, Message: ${error.message}`);
                
                stream.markdown(vscode.l10n.t('❌ **AI Model Service Error**\n\n'));
                stream.markdown(vscode.l10n.t('**Error Code**: `{0}`\n\n', error.code || 'unknown'));
                stream.markdown(vscode.l10n.t('**Error Message**: {0}\n\n', error.message));
                stream.markdown(vscode.l10n.t('This is an error from VSCode Language Model API. Please check your GitHub Copilot configuration and subscription status.\n\n'));
                stream.markdown(vscode.l10n.t('💡 **Suggestion**: Search for solutions using error code `{0}`.\n\n', error.code));
            } else {
                
                const errorMessage = error instanceof Error ? error.message : vscode.l10n.t('Unknown error');

                stream.markdown(vscode.l10n.t('❌ **Error processing request**\n\n'));
                stream.markdown(vscode.l10n.t('**Error Message**: {0}\n\n', errorMessage));
                stream.markdown(vscode.l10n.t('Please try again later or rephrase your question.\n\n'));
            }
        } finally {
            const duration = Date.now() - startTime;
            this.logger.info(`⏱️ 聊天请求处理完成，耗时: ${duration}ms`);
        }
    }

    
    private async processRequestCore(
        prompt: string,
        model: vscode.LanguageModelChat | undefined,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<void> {
        // 检查用户选择的模型
        if (!model) {
            stream.markdown(vscode.l10n.t('⚠️ **No AI model found**\n\nPlease select an AI model from the dropdown menu in the Chat interface.'));
            return;
        }

        // 在进入主流程前验证模型可用性，并在必要时回退
        const validatedModel = await this.ensureModelIsUsable(model, stream);
        if (!validatedModel) {
            return;
        }
        
        stream.progress(vscode.l10n.t('🧠 AI intelligent engine starting...'));

       
        const sessionContext = await this.getOrCreateSessionContext();

        if (token.isCancellationRequested) { return; }

       
        const agentEngine = this.getOrCreateGlobalEngine(stream, validatedModel);

        if (token.isCancellationRequested) { return; }

      
        const isAwaitingUser = agentEngine.isAwaitingUser();
        
        if (isAwaitingUser) {
           
            this.logger.info(`📥 Processing user response`);
            await agentEngine.handleUserResponse(prompt);
        } else {
            
            this.logger.info(`🚀 Starting new task`);
            await agentEngine.executeTask(prompt);
        }
    }

    
    private getOrCreateGlobalEngine(
        stream: vscode.ChatResponseStream,
        model: vscode.LanguageModelChat
    ): SRSAgentEngine {
       
        SRSChatParticipant.globalEngineLastActivity = Date.now();
        
        if (!SRSChatParticipant.globalEngine) {
            this.logger.info(`🌐 Creating new global engine instance`);
            
           
            SRSChatParticipant.globalEngine = new SRSAgentEngine(stream, model);
            SRSChatParticipant.globalEngine.setDependencies(this.orchestrator, toolExecutor);
            
            this.logger.info(`🌐 Global engine created successfully`);
        } else {
            
            SRSChatParticipant.globalEngine.updateStreamAndModel(stream, model);
            this.logger.info(`♻️ Reusing global engine with updated stream/model`);
        }
        
        return SRSChatParticipant.globalEngine;
    }
    
    
    private getGlobalEngineStatus(): { exists: boolean; state?: string; lastActivity?: number } {
        if (!SRSChatParticipant.globalEngine) {
            return { exists: false };
        }
        
        const engineState = SRSChatParticipant.globalEngine.getState();
        return {
            exists: true,
            state: engineState.stage,
            lastActivity: SRSChatParticipant.globalEngineLastActivity
        };
    }

    /**
     * Validate selected model against available providers and fall back when necessary.
     */
    private async ensureModelIsUsable(
        selectedModel: vscode.LanguageModelChat,
        stream: vscode.ChatResponseStream
    ): Promise<vscode.LanguageModelChat | null> {
        const selectedName = selectedModel.name;

        try {
            const availableModels = await vscode.lm.selectChatModels();

            if (!availableModels || availableModels.length === 0) {
                stream.markdown(vscode.l10n.t('⚠️ **No language models available**\n\nPlease configure GitHub Copilot or another language model provider.'));
                this.logger.warn('No language models available from VS Code provider');
                return null;
            }

            const matched = availableModels.find(m => m.name.toLowerCase() === selectedName.toLowerCase());
            if (matched) {
                this.logger.info(`✅ Using user-selected model: ${matched.name}`);
                return matched;
            }

            const preferredFallbacks = this.getPreferredFallbackModels();
            let fallback: vscode.LanguageModelChat | undefined;

            for (const candidate of preferredFallbacks) {
                fallback = availableModels.find(m => m.name.toLowerCase() === candidate.toLowerCase());
                if (fallback) {
                    break;
                }
            }

            if (!fallback) {
                fallback = availableModels[0];
            }

            this.logger.warn(`Selected model "${selectedName}" is not available. Falling back to "${fallback.name}".`);
            stream.markdown(
                vscode.l10n.t('⚠️ Selected model `{0}` is not available via your provider.\nSwitched to `{1}` for this conversation.', selectedName, fallback.name)
            );

            return fallback;
        } catch (error) {
            this.logger.error('Failed to validate selected model availability', error as Error);
            stream.markdown(vscode.l10n.t('❌ Failed to validate language model availability. Please retry or re-open VS Code.'));
            return null;
        }
    }

    /**
     * Get preferred fallback models from configuration or defaults.
     */
    private getPreferredFallbackModels(): string[] {
        const config = vscode.workspace.getConfiguration('srs-writer');
        const configured = config.get<string[]>('fallbackModels', []);
        return configured && configured.length > 0 ? configured : [];
    }
    
  
    private getSessionId(sessionContext: SessionContext): string {
        return sessionContext.sessionContextId;
    }

    
    private async getOrCreateSessionContext(): Promise<SessionContext> {
        try {
            const session = await this.sessionManager.getCurrentSession();
            
            if (session) {
                return session;
            }
            
          
            return await this.sessionManager.createNewSession();
        } catch (error) {
            this.logger.error('Failed to get current session, creating new one', error as Error);
           
            return await this.sessionManager.createNewSession();
        }
    }

  
    private async provideFollowups(
        result: vscode.ChatResult,
        context: vscode.ChatContext,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatFollowup[]> {
        try {
            const sessionContext = await this.getOrCreateSessionContext();
            const followups: vscode.ChatFollowup[] = [];

           
            if (sessionContext.projectName) {
              
                followups.push(
                    { label: vscode.l10n.t('📊 View project status'), prompt: '/status' },
                    { label: vscode.l10n.t('✏️ Edit project'), prompt: '/edit' },
                    { label: vscode.l10n.t('🆕 Archive and create new project'), prompt: '/new' },
                    { label: vscode.l10n.t('💡 Get help'), prompt: '/help' }
                );
            } else {
              
                followups.push(
                    { label: vscode.l10n.t('🆕 Create new project'), prompt: '/new' },
                    { label: vscode.l10n.t('💡 Get help'), prompt: '/help' },
                    { label: vscode.l10n.t('📊 View project status'), prompt: '/status' }
                );
            }

            return followups;
        } catch (error) {
            this.logger.error('Error providing followups', error as Error);
            return [
                { label: vscode.l10n.t('💡 Get help'), prompt: '/help' }
            ];
        }
    }

   
    private async refreshGlobalEngineSession(): Promise<void> {
        if (SRSChatParticipant.globalEngine) {
            this.logger.info('🔄 Refreshing global engine session context');
           
        }
    }

   
    public onSessionChanged(newContext: SessionContext | null): void {
        const newSessionId = newContext?.sessionContextId || null;
        const oldSessionId = this.currentSessionId;
        
        this.logger.info(`🔄 Session changed: ${oldSessionId} → ${newSessionId}`);
        this.logger.info(`🌐 Global engine will dynamically adapt to new session context`);
        
      
        if (SRSChatParticipant.globalEngine && oldSessionId !== newSessionId) {
            SRSChatParticipant.globalEngine.onSessionContextChanged(newContext);
        }
        
       
        this.currentSessionId = newSessionId;
    }

   
    public isPlanExecuting(): boolean {
        if (!SRSChatParticipant.globalEngine) {
            return false;
        }
        
        const state = SRSChatParticipant.globalEngine.getState();
       
        return state.stage === 'planning' || 
               state.stage === 'executing' || 
               state.stage === 'awaiting_user';
    }

    
    public getCurrentPlanDescription(): string | null {
        if (!SRSChatParticipant.globalEngine || !this.isPlanExecuting()) {
            return null;
        }
        
        const state = SRSChatParticipant.globalEngine.getState();
        if (state.currentTask) {
            return vscode.l10n.t('Executing task: "{0}" (stage: {1})', state.currentTask, state.stage);
        }

        return vscode.l10n.t('Engine is executing (stage: {0})', state.stage);
    }

    
    public async cancelCurrentPlan(): Promise<void> {
        if (!SRSChatParticipant.globalEngine) {
            this.logger.info('ℹ️ No global engine to cancel');
            return;
        }
        
        if (!this.isPlanExecuting()) {
            this.logger.info('ℹ️ No plan currently executing');
            return;
        }
        
        this.logger.info('🛑 Sending cancellation signal to current plan...');
        await SRSChatParticipant.globalEngine.cancelCurrentExecution();
        
        
        this.logger.info('⏳ Waiting for specialist to actually stop...');
        let waitCount = 0;
        const maxWaitTime = 30000; // 最多等待30秒
        const pollInterval = 100; // 每100ms检查一次（更频繁）
        const maxPolls = maxWaitTime / pollInterval;
        
        while (waitCount < maxPolls) {
            const isStillExecuting = this.isPlanExecuting();
            const engineState = SRSChatParticipant.globalEngine?.getState();
            
         
            if (waitCount % 10 === 0) {
                this.logger.info(`⏳ Waiting... (${(waitCount * pollInterval / 1000).toFixed(1)}s) - ` +
                    `isPlanExecuting: ${isStillExecuting}, ` +
                    `engineStage: ${engineState?.stage}, ` +
                    `cancelled: ${engineState?.cancelled}`);
            }
            
           
            if (!isStillExecuting) {
                this.logger.info('✅ Plan execution confirmed stopped');
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            waitCount++;
        }
        
        if (this.isPlanExecuting()) {
            this.logger.warn('⚠️ Plan did not stop within timeout period, proceeding anyway');
            this.logger.warn(`⚠️ Final state: stage=${SRSChatParticipant.globalEngine?.getState()?.stage}, cancelled=${SRSChatParticipant.globalEngine?.getState()?.cancelled}`);
        } else {
            this.logger.info('✅ Plan execution fully stopped');
        }
        
        this.logger.info('✅ Plan cancellation process completed');
    }

    
    public clearProjectContext(): void {
        this.logger.info('🧹 Clearing project context for clean project switch...');
        
        
        this.orchestrator.clearProjectContext();
        
        this.logger.info('✅ Project context cleared successfully');
    }

    
    public async getStatus(): Promise<string> {
        try {
            const sessionContext = await this.getOrCreateSessionContext();
            const orchestratorStatus = await this.orchestrator.getSystemStatus();
            
           
            const baseInfo = [
                '=== SRS Chat Participant v6.0 Status ===',
                'Architecture Mode: Global Engine (v6.0)',
                `Current Project: ${sessionContext.projectName || 'None'}`,
                `Base Directory: ${sessionContext.baseDir || 'None'}`,
                `Active Files: ${sessionContext.activeFiles?.length || 0}`,
                `Session ID: ${sessionContext.sessionContextId}`,
                `Session Version: ${sessionContext.metadata.version}`,
                `Orchestrator Status: ${orchestratorStatus.aiMode ? 'Active' : 'Inactive'}`,
                `Available Tools: ${orchestratorStatus.availableTools?.length || 0}`
            ];
            
            
                const globalStatus = this.getGlobalEngineStatus();
                const engineInfo = [
                    '--- Global Engine Status ---',
                    `Global Engine: ${globalStatus.exists ? 'Active' : 'Inactive'}`,
                    `Engine State: ${globalStatus.state || 'None'}`,
                    `Last Activity: ${globalStatus.lastActivity ? new Date(globalStatus.lastActivity).toISOString() : 'Never'}`,
                    `Awaiting User: ${globalStatus.exists && SRSChatParticipant.globalEngine ? SRSChatParticipant.globalEngine.isAwaitingUser() : false}`,
                `Plan Executing: ${this.isPlanExecuting() ? 'Yes' : 'No'}`
                ];
                
                return [...baseInfo, ...engineInfo].join('\n');
        } catch (error) {
            return `Status Error: ${error}`;
        }
    }
    
    
    public static disposeGlobalEngine(): void {
        const logger = Logger.getInstance();
        
        if (SRSChatParticipant.globalEngine) {
            logger.info(`🌐 Disposing global engine at plugin shutdown`);
            
            try {
                const engineState = SRSChatParticipant.globalEngine.getState();
                logger.info(`🌐 Final engine state: stage=${engineState.stage}, task="${engineState.currentTask}"`);
                
                
                SRSChatParticipant.globalEngine.dispose();
                SRSChatParticipant.globalEngine = null;
                SRSChatParticipant.globalEngineLastActivity = 0;
                
                logger.info(`✅ Global engine disposed successfully`);
            } catch (error) {
                logger.error(`❌ Failed to dispose global engine: ${(error as Error).message}`);
            }
        } else {
            logger.info(`ℹ️ No global engine to dispose`);
        }
    }
}

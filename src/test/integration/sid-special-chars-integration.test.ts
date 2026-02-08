/**
 * SID Special Characters Processing Integration Test
 * 
 * 🎯 Objective: Test complete readMarkdownFile → executeMarkdownEdits workflow
 * 
 * Test Scenario: Simulate real Specialist workflow, from reading documents containing special characters,
 * to successfully executing semantic edits.
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { readMarkdownFile } from '../../tools/document/enhanced-readfile-tools';
import { semanticEditEngineToolImplementations } from '../../tools/document/semantic-edit-engine';

describe('SID Special Characters Processing Integration Test', () => {
    let tempDir: string;
    let testFile: vscode.Uri;

    beforeEach(async () => {
        // Create temporary directory
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sid-integration-test-'));
        testFile = vscode.Uri.file(path.join(tempDir, 'test.md'));
    });

    afterEach(async () => {
        // 清理临时文件
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
            // 忽略清理错误
        }
    });

    // Helper: 扁平化TOC树
    const flattenToc = (nodes: any[]): any[] => {
        let result: any[] = [];
        for (const node of nodes) {
            result.push(node);
            if (node.children && node.children.length > 0) {
                result = result.concat(flattenToc(node.children));
            }
        }
        return result;
    };

    /**
     * 🎯 End-to-end test of original Bug scenario
     */
    it('Bug fix verification: Titles containing & symbol should be successfully editable', async () => {
        // 1. Create document containing & symbol (original bug scenario)
        const originalContent = `# SRS Document

## 1. 非功能需求 (Non-Functional Requirements)

### 数据隐私与安全需求 (Data Privacy & Security Requirements)

Current content here.

## 2. 其他需求

Some other content.
`;
        await fs.writeFile(testFile.fsPath, originalContent, 'utf-8');

        // 2. Specialist首先调用readMarkdownFile获取TOC
        const readResult = await readMarkdownFile({
            path: testFile.fsPath,
            parseMode: 'toc'
        });

        expect(readResult.success).toBe(true);
        expect(readResult.tableOfContentsToCTree).toBeDefined();
        
        const toc = flattenToc(readResult.tableOfContentsToCTree!);

        // 3. 找到包含 & 的章节
        const targetSection = toc.find((s: any) => 
            s.title.includes('Data Privacy & Security')
        );
        expect(targetSection).toBeDefined();
        
        const targetSid = targetSection.sid;
        console.log(`📍 Target section SID: ${targetSid}`);

        // 4. Specialist uses this SID to edit (original bug fails here)
        const editResult = await semanticEditEngineToolImplementations.executeMarkdownEdits({
            targetFile: testFile.fsPath,
            intents: [{
                type: 'replace_section_content_only',
                target: {
                    sid: targetSid,
                    lineRange: { startLine: 1, endLine: 1 }
                },
                content: 'Updated content: Security measures implemented.',
                reason: 'Update data privacy and security requirements content',
                priority: 1
            }]
        });

        // 5. 🎯 Key assertion: Edit should succeed (would fail before fix)
        expect(editResult.success).toBe(true);
        expect(editResult.successfulIntents).toBe(1);
        expect(editResult.failedIntents.length).toBe(0);

        // 6. Verify file content has been updated
        const updatedContent = await fs.readFile(testFile.fsPath, 'utf-8');
        expect(updatedContent).toContain('Updated content: Security measures implemented.');
        expect(updatedContent).toContain('数据隐私与安全需求 (Data Privacy & Security Requirements)');
    });

    /**
     * 🎯 Comprehensive test of multiple special characters
     */
    it('Should successfully edit sections containing various special characters', async () => {
        const originalContent = `# Document

## Section @ 符号

Content 1

## Section # 符号

Content 2

## Section $ 符号

Content 3

## Section & | * 组合

Content 4
`;
        await fs.writeFile(testFile.fsPath, originalContent, 'utf-8');

        // 读取TOC
        const readResult = await readMarkdownFile({
            path: testFile.fsPath,
            parseMode: 'toc'
        });

        expect(readResult.success).toBe(true);
        const toc = flattenToc(readResult.tableOfContentsToCTree!);

        // 对每个特殊字符章节进行编辑
        const sectionsToEdit = toc.filter((s: any) => s.title.includes('Section'));
        expect(sectionsToEdit.length).toBe(4);

        for (const section of sectionsToEdit) {
            const editResult = await semanticEditEngineToolImplementations.executeMarkdownEdits({
                targetFile: testFile.fsPath,
                intents: [{
                    type: 'replace_section_content_only',
                    target: {
                        sid: section.sid,
                        lineRange: { startLine: 1, endLine: 1 }
                    },
                    content: `Updated: ${section.title}`,
                    reason: `Update ${section.title}`,
                    priority: 1
                }]
            });

            // Each edit should succeed
            expect(editResult.success).toBe(true);
            expect(editResult.successfulIntents).toBe(1);
            expect(editResult.failedIntents.length).toBe(0);
        }

        // Verify all content has been updated
        const updatedContent = await fs.readFile(testFile.fsPath, 'utf-8');
        expect(updatedContent).toContain('Updated: Section @ 符号');
        expect(updatedContent).toContain('Updated: Section # 符号');
        expect(updatedContent).toContain('Updated: Section $ 符号');
        expect(updatedContent).toContain('Updated: Section & | * 组合');
    });

    /**
     * 🎯 嵌套章节的特殊字符处理
     */
    it('应正确处理嵌套章节中的特殊字符', async () => {
        const originalContent = `# Document

## Parent Section

### Child A & B

Content A

### Child C | D

Content C

## Another Parent

### Child E @ F

Content E
`;
        await fs.writeFile(testFile.fsPath, originalContent, 'utf-8');

        const readResult = await readMarkdownFile({
            path: testFile.fsPath,
            parseMode: 'toc'
        });

        expect(readResult.success).toBe(true);
        const toc = flattenToc(readResult.tableOfContentsToCTree!);

        // 找到所有子章节
        const childSections = toc.filter((s: any) => s.level === 3);
        expect(childSections.length).toBe(3);

        // 编辑所有子章节
        for (const section of childSections) {
            const editResult = await semanticEditEngineToolImplementations.executeMarkdownEdits({
                targetFile: testFile.fsPath,
                intents: [{
                    type: 'replace_section_content_only',
                    target: {
                        sid: section.sid,
                        lineRange: { startLine: 1, endLine: 1 }
                    },
                    content: `Nested updated: ${section.title}`,
                    reason: `Update nested section ${section.title}`,
                    priority: 1
                }]
            });

            expect(editResult.success).toBe(true);
            expect(editResult.successfulIntents).toBe(1);
        }

        const updatedContent = await fs.readFile(testFile.fsPath, 'utf-8');
        expect(updatedContent).toContain('Nested updated: Child A & B');
        expect(updatedContent).toContain('Nested updated: Child C | D');
        expect(updatedContent).toContain('Nested updated: Child E @ F');
    });

    /**
     * 🎯 批量编辑测试
     */
    it('应支持批量编辑包含特殊字符的多个章节', async () => {
        const originalContent = `# Document

## API & SDK

Content 1

## Error Handling & Recovery

Content 2

## Configuration (key=value)

Content 3
`;
        await fs.writeFile(testFile.fsPath, originalContent, 'utf-8');

        const readResult = await readMarkdownFile({
            path: testFile.fsPath,
            parseMode: 'toc'
        });

        expect(readResult.success).toBe(true);
        const toc = flattenToc(readResult.tableOfContentsToCTree!);

        // 构建批量编辑intents
        const sections = toc.filter((s: any) => s.level === 2);
        const intents = sections.map((section, index) => ({
            type: 'replace_section_content_only' as const,
            target: {
                sid: section.sid,
                lineRange: { startLine: 1, endLine: 1 }
            },
            content: `Batch updated ${index + 1}`,
            reason: `Batch update ${section.title}`,
            priority: 1
        }));

        // Execute batch edit
        const editResult = await semanticEditEngineToolImplementations.executeMarkdownEdits({
            targetFile: testFile.fsPath,
            intents
        });

        // 验证批量编辑成功
        expect(editResult.success).toBe(true);
        expect(editResult.successfulIntents).toBe(3);
        expect(editResult.failedIntents.length).toBe(0);

        const updatedContent = await fs.readFile(testFile.fsPath, 'utf-8');
        expect(updatedContent).toContain('Batch updated 1');
        expect(updatedContent).toContain('Batch updated 2');
        expect(updatedContent).toContain('Batch updated 3');
    });

    /**
     * 🎯 插入新章节测试
     */
    it('应支持在包含特殊字符的章节后插入新内容', async () => {
        const originalContent = `# Document

## API & SDK

Existing content
`;
        await fs.writeFile(testFile.fsPath, originalContent, 'utf-8');

        const readResult = await readMarkdownFile({
            path: testFile.fsPath,
            parseMode: 'toc'
        });

        expect(readResult.success).toBe(true);
        const toc = flattenToc(readResult.tableOfContentsToCTree!);

        const targetSection = toc.find((s: any) => s.title.includes('API & SDK'));
        expect(targetSection).toBeDefined();

        // 在章节末尾插入新内容
        const editResult = await semanticEditEngineToolImplementations.executeMarkdownEdits({
            targetFile: testFile.fsPath,
            intents: [{
                type: 'insert_section_content_only',
                target: {
                    sid: targetSection!.sid,
                    insertionPosition: 'after'
                },
                content: '\nNew API documentation here.',
                reason: '在API & SDK章节末尾插入新内容',
                priority: 1
            }]
        });

        expect(editResult.success).toBe(true);
        expect(editResult.successfulIntents).toBe(1);

        const updatedContent = await fs.readFile(testFile.fsPath, 'utf-8');
        expect(updatedContent).toContain('Existing content');
        expect(updatedContent).toContain('New API documentation here.');
    });

    /**
     * 🎯 Section deletion test
     */
    it('Should support deleting sections containing special characters', async () => {
        const originalContent = `# Document

## Keep This

Content to keep

## Delete @ This

Content to delete

## Keep That

Content to keep
`;
        await fs.writeFile(testFile.fsPath, originalContent, 'utf-8');

        const readResult = await readMarkdownFile({
            path: testFile.fsPath,
            parseMode: 'toc'
        });

        expect(readResult.success).toBe(true);
        const toc = flattenToc(readResult.tableOfContentsToCTree!);

        const targetSection = toc.find((s: any) => s.title.includes('Delete @ This'));
        expect(targetSection).toBeDefined();

        // Delete section
        const editResult = await semanticEditEngineToolImplementations.executeMarkdownEdits({
            targetFile: testFile.fsPath,
            intents: [{
                type: 'delete_section_content_only',
                target: {
                    sid: targetSection!.sid
                },
                content: '',
                reason: 'Delete section content containing @',
                priority: 1
            }]
        });

        expect(editResult.success).toBe(true);
        expect(editResult.successfulIntents).toBe(1);

        const updatedContent = await fs.readFile(testFile.fsPath, 'utf-8');
        expect(updatedContent).toContain('Keep This');
        expect(updatedContent).toContain('Keep That');
        expect(updatedContent).toContain('Delete @ This'); // Title preserved
        expect(updatedContent).not.toContain('Content to delete'); // Content deleted
    });

    /**
     * 🎯 Multi-language mixed test
     */
    it('Should correctly handle special characters in mixed Chinese-English-Japanese-Korean titles', async () => {
        const originalContent = `# Document

## データ & 分析 (Data & Analysis)

Japanese content

## 데이터 @ 분석 (Data @ Analysis)

Korean content

## 数据 # 分析 (Data # Analysis)

Chinese content
`;
        await fs.writeFile(testFile.fsPath, originalContent, 'utf-8');

        const readResult = await readMarkdownFile({
            path: testFile.fsPath,
            parseMode: 'toc'
        });

        expect(readResult.success).toBe(true);
        const toc = flattenToc(readResult.tableOfContentsToCTree!);

        const sections = toc.filter((s: any) => s.level === 2);
        expect(sections.length).toBe(3);

        // Edit all multilingual sections
        for (const section of sections) {
            const editResult = await semanticEditEngineToolImplementations.executeMarkdownEdits({
                targetFile: testFile.fsPath,
                intents: [{
                    type: 'replace_section_content_only',
                    target: {
                        sid: section.sid,
                        lineRange: { startLine: 1, endLine: 1 }
                    },
                    content: `Multilingual updated: ${section.title}`,
                    reason: `Update multilingual section ${section.title}`,
                    priority: 1
                }]
            });

            expect(editResult.success).toBe(true);
            expect(editResult.successfulIntents).toBe(1);
        }

        const updatedContent = await fs.readFile(testFile.fsPath, 'utf-8');
        expect(updatedContent).toContain('Multilingual updated: データ & 分析');
        expect(updatedContent).toContain('Multilingual updated: 데이터 @ 분석');
        expect(updatedContent).toContain('Multilingual updated: 数据 # 分析');
    });
});


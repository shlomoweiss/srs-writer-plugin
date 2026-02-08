/**
 * Jest setup file for all tests
 * Initializes mocks and global test configuration
 */

// Mock vscode.l10n for localization support
import * as vscode from 'vscode';

// Ensure vscode.l10n is available in all tests
if (!(vscode as any).l10n) {
    (vscode as any).l10n = {
        t: (key: string, ...args: any[]) => key
    };
}

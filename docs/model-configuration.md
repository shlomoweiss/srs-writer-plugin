# 🚀 Dynamic Model Configuration System

The SRS Writer plugin uses an intelligent dynamic model configuration system that can adapt to various AI model context limits without hardcoding.

## How It Works

### 1. Multi-tier Adaptive Strategy

The system determines model configuration in the following priority order:

1. **👤 User Configuration Override** (highest priority)
2. **🎯 Error Learning Cache** (high confidence)
3. **📋 General Inference Cache** (valid for 24 hours)
4. **🔍 Heuristic Inference** (based on model name patterns)

### 2. Heuristic Inference Rules

The system intelligently infers context window size based on keywords in model names:

- **Large Context Models** (128k tokens): `turbo`, `128k`, `200k`, `long`, `extended`, `claude-3`, `gemini-pro`, `2024`, `2023`
- **Medium Context Models** (32k tokens): `gpt-4`, `claude-2`, `gemini`, `16k`, `32k`
- **Small Context Models** (4k tokens): `gpt-3.5`, `4k`, `2k`, `2022`, `2021`
- **Default Conservative Estimate** (8k tokens): Other unknown models

### 3. Error Feedback Learning

When the system encounters a context limit error, it will automatically:
- Identify the error type
- Reduce the token limit for that model (conservative strategy)
- Cache the learning result (high confidence)
- Avoid the same error happening again

## User-Defined Configuration

### VSCode Settings Configuration

Add to VSCode's `settings.json`:

```json
{
    "srs-writer.modelConfigs": {
        "gpt-4-custom": {
            "maxTokens": 8000,
            "warningThreshold": 6000,
            "compressionThreshold": 4000
        },
        "claude-3-opus": {
            "maxTokens": 200000,
            "warningThreshold": 150000,
            "compressionThreshold": 120000
        },
        "custom-local-model": {
            "maxTokens": 2048,
            "warningThreshold": 1500,
            "compressionThreshold": 1000
        }
    }
}
```

### Configuration Parameter Description

- **maxTokens**: Maximum context window size of the model
- **warningThreshold**: Token threshold to start warning
- **compressionThreshold**: Threshold to start compressing conversation history

### Workspace Configuration

You can also configure project-specific model settings in the project's `.vscode/settings.json`:

```json
{
    "srs-writer.modelConfigs": {
        "project-specific-model": {
            "maxTokens": 16000,
            "warningThreshold": 12000,
            "compressionThreshold": 8000
        }
    }
}
```

## System Monitoring

### Log Monitoring

The system logs the configuration decision process:

```
📋 Using cached config for gpt-4-turbo (confidence: medium)
🔍 Inferred config for unknown-model: 8000 tokens (medium confidence)
👤 Using user config for custom-model: 4000 tokens
🎯 Using learned config for gpt-3.5-turbo: 3200 tokens (high confidence)
🔧 Learned from context error for gpt-4: 8000 → 6400 tokens
```

### Configuration Cache

- **Cache Location**: Static Map in memory
- **Cache Duration**: 24 hours (error learning cache is permanent)
- **Confidence Levels**: low < medium < high

## Best Practices

### 1. First-time Use of New Models

For brand new unknown models:
```json
{
    "srs-writer.modelConfigs": {
        "new-experimental-model": {
            "maxTokens": 4000,
            "warningThreshold": 3000,
            "compressionThreshold": 2000
        }
    }
}
```

### 2. Local Small Models

For resource-constrained local models:
```json
{
    "srs-writer.modelConfigs": {
        "local-llama-7b": {
            "maxTokens": 2048,
            "warningThreshold": 1500,
            "compressionThreshold": 1000
        }
    }
}
```

### 3. Enterprise Internal Models

For custom models deployed by enterprises:
```json
{
    "srs-writer.modelConfigs": {
        "company-internal-gpt": {
            "maxTokens": 16384,
            "warningThreshold": 12000,
            "compressionThreshold": 8000
        }
    }
}
```

## Troubleshooting

### Common Issues

1. **Context Still Exceeds Limit**
   - Check if user configuration is too high
   - System will automatically learn and adjust

2. **Compression Too Frequent**
   - Lower `compressionThreshold`
   - Or increase `maxTokens`

3. **Configuration Not Taking Effect**
   - Confirm model name matches
   - Restart VSCode to refresh configuration

### Reset Learning Cache

Currently, you need to restart VSCode to clear the learning cache. Future versions will provide command-line reset functionality.

## Technical Details

### Token Estimation Algorithm

```typescript
// Intelligent estimation for mixed Chinese-English text
const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
const englishWords = text.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(w => w.length > 0).length;
return Math.ceil(chineseChars + englishWords * 1.3);
```

### Error Detection Pattern

The system identifies the following error patterns as context limit errors:
- `context length`
- `token limit`
- `maximum context`
- `too long`
- `context size`
- Common token numbers: `4096`, `8192`, `16384`, `32768`

---

This dynamic configuration system ensures that the plugin can adapt to any existing or future AI models without requiring code updates! 
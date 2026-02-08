# Project Complexity Classification Standards and SRS Template Selection Guide

    1.	Determine Project Type (Choose 1 of 4)
	•	User Delivery (Client / Backend)
	•	Platform (Platform Infra / Data / Observability, etc.)
	•	Developer Productivity
	•	Security & Compliance
	2.	Assess Complexity (Simple / Medium / Large – According to Chapter 2 decision tree or scoring table)
	3.	Consult table to select template (See Appendix G)

Note: There are currently no dedicated SRS templates for "Developer Productivity" and "Security & Compliance" projects. If a project falls into these two categories, please clarify in communication: "No standard template available, refer to medium-complexity platform template or customize accordingly".


## 项目类型选择

在评估项目复杂度之前，首先需要确定项目属于以下四种类型中的哪一种：

### 🎯 面向用户交付 (User Delivery)
**核心特征：** 直接面向最终用户提供产品或服务
- 主要关注用户体验、功能完整性和业务价值交付
- 包括前端应用、移动App、网站、API服务等直接用户接触的系统

### 🏗️ 面向平台 (Platform)
**核心特征：** 为其他系统或开发团队提供基础设施和服务
- 主要关注稳定性、可扩展性、性能和运维友好性
- 包括基础设施、数据平台、监控系统、中间件等支撑性系统

### ⚡ 面向团队效率 (Developer Productivity)
**核心特征：** 提升开发团队工作效率和质量
- 主要关注开发流程优化、自动化和工具链完善
- 包括CI/CD平台、代码质量工具、开发环境、自动化测试框架等

### 🔒 面向安全 (Security & Compliance)
**核心特征：** 保障系统安全和满足合规要求
- 主要关注安全防护、风险控制和法规遵循
- 包括身份认证系统、安全审计平台、合规检查工具、风险监控系统等


## Quick Decision Tree


```
Start Project Evaluation
    ↓
Step ➊ Determine Project Type (Choose One of Four)
├─ Directly facing end users? → User Delivery
├─ Providing basic services for other systems? → Platform
├─ Mainly improving development efficiency? → Developer Productivity
└─ Mainly focusing on security and compliance? → Security & Compliance
    ↓
Step ➋ Evaluate Project Complexity
    ↓
Are there strict compliance requirements (finance, healthcare, government)?
    ↓ Yes → Large/Critical System Template
    ↓ No
Does it require integration with ≥5 external systems?
    ↓ Yes → Large/Critical System Template
    ↓ No
Does it involve complex business processes (multi-department, multi-approval stages)?
    ↓ Yes → Large/Critical System Template
    ↓ No
Are there ≥4 user roles with significant permission differences?
    ↓ Yes → Medium Complexity Template
    ↓ No
Are there ≥3 functional areas that are interrelated?
    ↓ Yes → Medium Complexity Template
    ↓ No
Does it require complex data processing (reports, analysis, heavy computation)?
    ↓ Yes → Medium Complexity Template
    ↓ No → Simple Project Template
    ↓
Step ➌ Consult Table to Select Corresponding Template (See Appendix G)
```


---

## Detailed Classification Standards

### 🟢 Simple Project

**Core Characteristics: Single Function, Fast Delivery, Small Team**

#### Observable Indicators (Can be determined at requirements stage)
| Dimension | Standard |
|------|------|
| **Number of Business Domains** | ≤ 2 related domains |
| **Number of User Roles** | ≤ 2 types (e.g., regular user + admin) |
| **Main Functional Areas** | ≤ 2 areas (e.g., display + management) |
| **External Integration Requirements** | ≤ 1 (e.g., single third-party API) |
| **Data Complexity** | Simple CRUD operations |
| **Business Process Complexity** | Linear process, few branches |
| **Permission Control Requirements** | Simple role distinction |
| **Interface Complexity** | Standard forms and list pages |

#### Qualitative Characteristics
- ✅ Relatively single and focused functionality
- ✅ Simple and intuitive business processes
- ✅ Relatively standard and mature tech stack
- ✅ No complex compliance requirements
- ✅ Relatively homogeneous user base
- ✅ Simple data model
- ✅ No complex permission control requirements
- ✅ Clear requirement descriptions, easy to understand and verify
- ✅ Requirements relatively stable, expected changes are minimal

#### Typical Project Examples
- **Internal Tools**: Employee attendance system, simple reporting tools
- **MVP Products**: Single-function application validation
- **Feature Enhancements**: Adding new modules to existing systems
- **Small Websites**: Company websites, simple e-commerce stores
- **Automation Scripts**: Data processing tools, batch processing systems

---

### 🟡 Medium Complexity Project

**Core Characteristics: Multi-Module Integration, Medium-Sized Team, Standard Business Processes**

#### Observable Indicators (Can be determined at requirements stage)
| Dimension | Standard |
|------|------|
| **Number of Business Domains** | 3-5 related domains |
| **Number of User Roles** | 3-6 types, with significant permission differences |
| **Main Functional Areas** | 3-6 interrelated areas |
| **External Integration Requirements** | 2-4 external systems |
| **Data Complexity** | Requires complex queries, reports, or analysis |
| **Business Process Complexity** | Multi-step processes with parallel branches |
| **Permission Control Requirements** | Fine-grained role-based permissions |
| **Interface Complexity** | Requires dashboards, complex forms |

#### Qualitative Characteristics
- ✅ Multiple related functional modules
- ✅ Requires user permission management
- ✅ Involves various business processes
- ✅ Requires integration with several external systems
- ✅ Has certain performance requirements
- ✅ Relatively complex data relationships
- ✅ Needs to consider scalability
- ✅ Has basic security requirements
- ✅ Requirements may have some ambiguity, requiring clarification process
- ✅ Requirements may need moderate adjustments, requiring change management

#### Typical Project Examples
- **Business Management Systems**: CRM, order management systems, inventory management
- **Enterprise Applications**: Human resources management, financial management (non-core)
- **E-commerce Platforms**: Small to medium-sized B2C/B2B platforms
- **SaaS Products**: Project management tools, customer service systems
- **Mobile Applications**: Apps with relatively complete functionality

---

### 🔴 Large/Critical System Project

**Core Characteristics: Enterprise-Level System, High Compliance Requirements, Large Team Collaboration**

#### Observable Indicators (Can be determined at requirements stage)
| Dimension | Standard |
|------|------|
| **Number of Business Domains** | ≥ 6 domains or cross-departmental systems |
| **Number of User Roles** | ≥ 7 types, complex permission system |
| **Main Functional Areas** | ≥ 7 complexly interrelated areas |
| **External Integration Requirements** | ≥ 5 external systems |
| **Data Complexity** | Large data volume, real-time processing, complex analysis |
| **Business Process Complexity** | Multi-department collaboration, complex approval chains |
| **Permission Control Requirements** | Enterprise-level permission management |
| **Compliance Requirements** | Strict industry regulatory requirements |

#### Qualitative Characteristics
- ✅ Enterprise core business system
- ✅ Strict compliance requirements (such as SOX, GDPR, HIPAA)
- ✅ High availability requirements (99.9%+)
- ✅ Complex security requirements
- ✅ Internationalization and multi-language support
- ✅ Complex data models and business rules
- ✅ Requires detailed auditing and logging
- ✅ Involves integration with numerous third-party systems
- ✅ High concurrency and large data volume processing
- ✅ Requirements often contain many vague concepts, requiring repeated clarification
- ✅ Requirements are expected to change frequently, requiring strict change control

#### Typical Project Examples
- **Financial Systems**: Core banking systems, trading platforms, risk control systems
- **Healthcare Systems**: Electronic medical record systems, hospital management systems
- **Enterprise ERP**: SAP-level enterprise resource planning systems
- **Telecom Systems**: Billing systems, network management systems
- **Government Systems**: Tax systems, social security systems

---

## Boundary Case Handling

### Case 1: Indicators Span Multiple Levels
**Principle: Go Higher, Not Lower**
- If any key indicator (team size, compliance requirements, external integration) reaches a higher level, choose the higher-level template
- Rationale: Complexity often grows non-linearly

### Case 2: Phased Project Delivery
**Principle: Choose Based on Final Goal**
- If the final system is a large system but delivered in phases, choose the large system template
- Mark the scope of the current phase in each phase's documentation
- Rationale: Ensure consistency and foresight in documentation

### Case 3: Feature Enhancements to Existing Systems
**Evaluation Principles:**
- If the enhancement is relatively independent → Choose based on the complexity of the enhancement
- If significant modification to existing architecture is needed → Choose based on the complexity of the entire system


### Case 4: Project Type Upgrade
**Handling Principles:**
- If a project evolves from one type to another during development (e.g., Platform → Security), the template applicability needs to be re-evaluated
- **Platform → Security/Compliance**: Recommend manually creating an SRS template, focusing on security requirements and compliance clauses
- **User Delivery → Platform**: Can continue using the original template, but need to add platform-specific NFRs (such as SLA, monitoring requirements)
- **Any Type → Developer Productivity**: Currently no dedicated template, recommend referring to the "General Requirements Document Framework"
- When type changes occur, the reasons and impact scope should be recorded in detail in the document version history


---

## Special Considerations

### 🚨 Cases Requiring Mandatory Use of Large/Critical System Template
Regardless of other indicators, the following cases must use the full template:

1. **Compliance Requirements**
   - Financial industry regulatory requirements (such as SOX, Basel III)
   - Healthcare industry compliance (such as HIPAA, FDA)
   - Data protection regulations (such as GDPR, CCPA)

2. **Security Level Requirements**
   - Involves payment processing
   - Handles personal sensitive information
   - Critical infrastructure

3. **Business Criticality**
   - System failure would lead to business shutdown
   - Involves large-scale financial processing
   - Core services affecting a large number of users

### ⚡ Special Considerations for Projects with Frequent Requirement Changes
The following cases recommend choosing at least a medium complexity template, even if other indicators suggest a simple project:

1. **Exploratory Projects**: Product direction is uncertain, requirements are expected to undergo frequent major adjustments
2. **Rapid Iteration Projects**: Need to quickly pivot features based on user feedback
3. **Cross-Department Collaboration Projects**: Involves multiple business departments, requirements are prone to conflicts and changes

**Rationale:** These types of projects require stricter requirements management and change tracking mechanisms; simple templates may not provide sufficient documentation support.

---

## Practical Checklist

### Team Usage Steps:
1. **Collect Project Information** (5 minutes)
2. **Fill Out Quantitative Indicator Table** (5 minutes)
3. **Check Qualitative Characteristics**
4. **Conduct MVP Project Identification** (3 minutes)
5. **Consider Special Factors** (5 minutes)
6. **Select Corresponding Template** (1 minute)
7. **Determine MVP Adaptation Strategy** (2 minutes)

### Quick Evaluation Table (Based on Requirements Analysis Results)

| Evaluation Dimension | Our Project Status | Score |
|----------|----------------|------|
| **Number of Business Domains** | ___ business domains | 1-2(1 point) / 3-5(2 points) / 6+(3 points) |
| **User Role Types** | ___ user roles | ≤2 types(1 point) / 3-6 types(2 points) / 7+ types(3 points) |
| **External System Integration** | ___ external systems | ≤1(1 point) / 2-4(2 points) / 5+(3 points) |
| **Business Process Complexity** | Describe main process characteristics | Simple linear(1 point) / Multi-step branches(2 points) / Cross-department collaboration(3 points) |
| **Data Processing Complexity** | Describe data processing requirements | Simple CRUD(1 point) / Reporting & analysis(2 points) / Big data real-time(3 points) |
| **Requirement Clarity** | Clarity level of requirement description | Clear & explicit(1 point) / Partial ambiguity to clarify(2 points) / Many vague concepts(3 points) |
| **Expected Requirement Stability** | Expected frequency of requirement changes | Relatively stable(1 point) / Moderate adjustment(2 points) / Frequent major changes(3 points) |
| **Compliance Requirements** | Any industry compliance requirements | None(0 points) / General(1 point) / Strict(3 points) |

**Total Score Calculation:**
- **8-11 points**: Simple Project Template
- **12-16 points**: Medium Complexity Template  
- **17-24 points**: Large/Critical System Template

**→ Based on the above evaluation, recommend using: [ ] Simple  [ ] Medium  [ ] Complex Template**

Then proceed to determine whether to apply MVP rules

MVP Identification Quick Checklist
Answer the following questions for MVP identification:

| Check Item | Question | Answer |
|--------|------|------|
| **Time Pressure** | Is development cycle ≤4 weeks? Is there an urgent deadline? | Yes/No |
| **Resource Constraints** | Is team size ≤3 people? Is budget strictly limited? | Yes/No |
| **Objective Characteristics** | Is there explicit mention of "validation", "prototype", "MVP"? | Yes/No |
| **Functional Scope** | Is it explicitly limited to "core features", "minimum version"? | Yes/No |

Determination Result:

Any one item is "Yes" → Recommend marking as MVP project
Multiple items are "Yes" → Strongly recommend marking as MVP project and applying adaptation strategy
**→ MVP Project Determination: [ ] Yes  [ ] No**

---

## MVP Project Identification and Adaptation
### MVP Project Identification Criteria
An MVP project can be identified if any of the following conditions are met:
#### Time Constraint Indicators

Development cycle ≤ 4 weeks
Launch time has a clear and urgent deadline (such as demo, release event, exhibition)
Explicitly expresses intentions such as "rapid validation", "prototype", "experiment", "proof of concept"

#### Resource Constraint Indicators

Development team ≤ 3 people
Budget is extremely limited or has explicit cost constraints
Clear resource limitations (such as learning project, part-time development, personal project)

#### Goal-Oriented Indicators

- Explicitly described as "Minimum Viable Product", "MVP", "prototype validation"
- Core objective is "validate hypothesis", "test market", "obtain user feedback"
- Functional scope is explicitly limited to "core process", "most basic features"
- Explicitly mentions "will expand later", "make a simple version first"

### MVP Adaptation Strategy
✅ Parts to Keep Complete and Detailed
The following content should not have reduced requirements due to MVP:

1. Core Functional Requirements (FR) Detail Level

    - Even for MVP, complex functions still need detailed description
    - Integrations with many dependencies still need complete analysis
    - Business logic complexity should be reflected truthfully

2. Key Non-Functional Requirements (NFR)

    - Security baseline requirements cannot be lowered
    - Core performance indicators need clear definition
    - Reliability requirements for key integrations


3. Risk Control Requirements

    - Data security and privacy protection
    - Accuracy of critical business processes
    - Necessary error handling and boundary checks



📉 Parts That Can Be Appropriately Simplified
The following sections can be simplified in MVP mode:

1. Forward-Looking Planning Sections

    - Evolution planning/future outlook → Simplified to basic direction description
    - Extensibility architecture design → Mark as "technical debt acceptable in MVP stage"
    - Internationalization/multi-language support → Can be postponed unless core requirement


2. Enterprise-Level Governance Requirements

    - Detailed audit logs → Simplified to basic operation records
    - Complex permission matrix → Simplified to basic role permissions
    - Data lifecycle management → Simplified to basic backup strategy
    - Detailed compliance requirements → Maintain basic compliance, detailed implementation can be improved later


3. Refined User Experience

    - Detailed user journey mapping → Focus on core process validation
    - Fine-grained UI/UX specifications → Prototype-level interface acceptable
    - Complex interaction design → Prioritize functional usability


4. Operations Management Requirements

    - Detailed monitoring and alerting strategy → Simplified to basic monitoring
    - Automated operations processes → Manual operations acceptable
    - Disaster recovery plan → Simplified to basic backup
    - Capacity planning details → Configure according to current needs



⚖️ Quality Standard Adjustment Principles

1. Performance Requirements Moderately Relaxed

    - Response time: Within 5 seconds acceptable (rather than 1 second)
    - Concurrent users: Set according to actual expectations (rather than over-design)
    - Availability: 95%+ acceptable (rather than 99.9%)


2. Acceptance Criteria Simplified

    - Focus on "core value validation" rather than "feature completeness"
    - Boundary case handling can be more lenient
    - Error handling focuses on main process


3. Documentation Requirements Adjusted

    - User manual can be basic usage instructions
    - Operations documentation can be simplified version
    - API documentation focuses on core interfaces



MVP Determination Decision Record Format
When a project is identified as MVP, record in classification_decision.md:

```markdown

## MVP Status Determination
**Is MVP Project**: Yes
**MVP Determination Basis**: 
Time Constraints: [Specific description, e.g., "Need to complete demo within 2 weeks"]
Resource Constraints: [Specific description, e.g., "Team has only 2 developers"]
Goal-Oriented: [Specific description, e.g., "Mainly used to validate business model hypothesis"]                                              

## MVP Adaptation Strategy
**Simplified Sections**: [List specific sections that can be simplified in this project]
**Detailed Sections to Maintain**: [List key sections that must remain detailed]
**Quality Standard Adjustments**: [List specific adjusted standards, such as performance requirements]
```

---

## Template Upgrade Path

If complexity changes during project development, it can be handled as follows:

### Upgrade Paths:
- **Simple → Medium**: Keep original content, add NFR classification and detailed sections
- **Medium → Complex**: Expand compliance, internationalization, and other enterprise-level requirements
- **Simple → Complex**: Recommend rewriting, but can reuse core functional requirements part

### Version Management:
- Record template change reasons in document control information during upgrade
- Maintain continuity and consistency of requirement IDs

---


## Appendix G — 'Project Type × Complexity' Template Quick Reference Table

| Project Type \ Complexity | 🟢 Simple | 🟡 Medium | 🔴 Large |
|------------------|--------|--------|--------|
| **User Delivery** | .cursor/rules/srs-template/SmallSizeProject_for_User.md | .cursor/rules/srs-template/MidSizeProject_for_User.md | .cursor/rules/srs-template/ComplexProject_for_User.md |
| **Platform** | .cursor/rules/srs-template/SmallSizeProject_for_Platform.md | .cursor/rules/srs-template/MidSizeProject_for_Platform.md | .cursor/rules/srs-template/ComplexProject_for_Platform.md |
| **Developer Productivity** | ⚠ No Template | ⚠ No Template | ⚠ No Template |
| **Security & Compliance** | ⚠ No Template | ⚠ No Template | ⚠ No Template |

### Template Descriptions

#### User Delivery Templates
- **.cursor/rules/srs-template/SmallSizeProject_for_User.md**: Suitable for simple user products, focusing on core features and basic user experience
- **.cursor/rules/srs-template/MidSizeProject_for_User.md**: Suitable for user products with relatively complete functionality, including user permission management and business processes
- **.cursor/rules/srs-template/ComplexProject_for_User.md**: Suitable for large-scale user products, including complete user lifecycle management and complex business logic

#### Platform Templates
- **.cursor/rules/srs-template/SmallSizeProject_for_Platform.md**: Suitable for simple infrastructure services, focusing on basic functionality and stability
- **.cursor/rules/srs-template/MidSizeProject_for_Platform.md**: Suitable for medium-sized platform services, including monitoring, operations, and scalability requirements
- **.cursor/rules/srs-template/ComplexProject_for_Platform.md**: Suitable for enterprise-level platforms, including complete SLA, disaster recovery, and governance requirements

#### Handling Types Without Templates
For project types marked as "⚠ No Template":

> **No corresponding SRS template is currently provided. Please contact the architecture team or refer to the "General Requirements Document Framework" to create your own.**

**Recommended Approaches:**
- **Developer Productivity Projects**: Can refer to .cursor/rules/srs-template/MidSizeProject_for_User.md or .cursor/rules/srs-template/MidSizeProject_for_Platform.md, focusing on tool usability and integration requirements
- **Security Projects**: Can refer to .cursor/rules/srs-template/ComplexProject_for_User.md or .cursor/rules/srs-template/ComplexProject_for_Platform.md as a foundation, additionally adding security compliance sections
- **Hybrid Type Projects**: Choose the template corresponding to the primary type, and supplement with special requirements of other types during requirements analysis phase

---

## 🚨 Important: Output Format Requirements

**ComplexityClassification specialist must strictly output in the following JSON format:**

```json
{
  "requires_file_editing": false,
  "content": "## Project Complexity Analysis Report\n\n### Project Type Identification\nBased on your requirement description, this project belongs to: **User Delivery**\n\n### Complexity Evaluation\nBased on the following key indicator analysis:\n- Number of business domains: 2 (user management, content display)\n- User role types: 3 types (regular user, administrator, visitor)\n- External system integration: 1 (third-party authentication)\n- Business process complexity: Medium (multi-step registration process)\n\n**Evaluation Result: Medium Complexity Project**\n\n### Recommended Template\nRecommend using: `.cursor/rules/srs-template/MidSizeProject_for_User.md`\n\n### Special Considerations\n- No special compliance requirements\n- Requirements relatively stable\n- Recommend focusing on user experience design",
  "structuredData": {
    "type": "ComplexityClassification",
    "data": {
      "projectType": {
        "category": "User Delivery",
        "description": "User Delivery",
        "characteristics": ["Directly facing end users", "Focus on user experience", "Business value delivery"]
      },
      "complexityLevel": {
        "level": "Medium",
        "description": "Medium Complexity",
        "score": 14,
        "breakdown": {
          "businessDomains": {"count": 2, "score": 1},
          "userRoles": {"count": 3, "score": 2},
          "externalIntegrations": {"count": 1, "score": 1},
          "businessProcessComplexity": {"level": "medium", "score": 2},
          "dataComplexity": {"level": "medium", "score": 2},
          "requirementClarity": {"level": "clear", "score": 1},
          "requirementStability": {"level": "stable", "score": 1},
          "complianceRequirements": {"level": "none", "score": 0}
        }
      },
      "recommendedTemplate": {
        "path": ".cursor/rules/srs-template/MidSizeProject_for_User.md",
        "rationale": "Suitable for user products with relatively complete functionality, including user permission management and business processes"
      },
      "isMVP": false,
      "mvpAnalysis": {
        "timeConstraints": false,
        "resourceConstraints": false,
        "goalOriented": false,
        "reasoning": "Project does not show obvious MVP characteristics"
      },
      "specialConsiderations": [
        "Requirements relatively stable, expected changes are minimal",
        "No special compliance requirements",
        "Recommend focusing on user experience design"
      ],
      "riskFactors": [
        "User role permissions need careful design",
        "External integration stability needs consideration"
      ]
    },
    "confidence": 0.87
  },
  "metadata": {
    "wordCount": 280,
    "qualityScore": 8.7,
    "completeness": 90,
    "estimatedReadingTime": "2 minutes"
  },
  "qualityAssessment": {
    "strengths": ["Clear classification logic", "Quantified evaluation standards", "Clear template recommendations"],
    "weaknesses": ["May need more project detail confirmation"],
    "confidenceLevel": 87
  },
  "nextSteps": [
    "Use the recommended template to start writing SRS documentation",
    "If project requirements have significant changes, please re-evaluate complexity",
    "Record classification decisions in documentation for future reference"
  ]
}
```

### 🔑 Key Requirements:
1. **requires_file_editing must be set to false**, as it only provides analysis and recommendations, no file operations
2. **edit_instructions and target_file fields are not needed**
3. **structuredData.type must be "ComplexityClassification"**
4. **Must clearly indicate project type, complexity level, and recommended template**
5. **Must include scoring details and decision basis**
6. **Need to evaluate whether it's an MVP project**
7. **content field should contain a complete analysis report**

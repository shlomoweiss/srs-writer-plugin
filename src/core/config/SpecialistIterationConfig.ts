

export type SpecialistCategory = 'content' | 'process';

export interface HistoryManagementConfig {
    
    compressionEnabled: boolean;
   
    tokenBudget: number;
    
    tierRatios: {
        immediate: number;  
        recent: number;     
        milestone: number;  
    };
}

/**
 * Specialist
 */
export interface SpecialistIterationConfig {
   
    categoryDefaults: {
        [K in SpecialistCategory]: number;
    };
    
    
    specialistOverrides: {
        [specialistId: string]: number;
    };
    
    
    globalDefault: number;
    
    
    historyConfig?: HistoryManagementConfig;
}


export const DEFAULT_SPECIALIST_ITERATION_CONFIG: SpecialistIterationConfig = {
    categoryDefaults: {
        content: 15,  
        process: 8    
    },
    
    specialistOverrides: {
       
        'fr_writer': 10,           
        'nfr_writer': 10,          
        'overall_description_writer': 10, 
        'user_journey_writer': 10, 
        'summary_writer': 10,       
        'prototype_designer': 20,  
        
       
        'project_initializer': 3,  
        'git_operator': 10,         
        'document_formatter': 5,   
        'requirement_syncer': 30,  
        
       
        'help_response': 3,        
    },
    
    globalDefault: 10, 
    
    
    historyConfig: {
        compressionEnabled: true,
        tokenBudget: 40000,
        tierRatios: {
            immediate: 0.55,  
            recent: 0.30,    
            milestone: 0.15   
        }
    }
};

/**
 * 🔄 Legacy: Specialis
 * 用于将specialist ID映
 */
export const SPECIALIST_CATEGORY_MAPPING_LEGACY: { [specialistId: string]: SpecialistCategory } = {
 
    'fr_writer': 'content',
    'nfr_writer': 'content', 
    'overall_description_writer': 'content',
    'user_journey_writer': 'content',
    'summary_writer': 'content',
    'prototype_designer': 'content',
    
  
    'project_initializer': 'process',
    'git_operator': 'process',
    'document_formatter': 'process', 
    'requirement_syncer': 'process',
    
   
};


export function getSpecialistCategory(specialistId: string): SpecialistCategory {
    try {
       
        const { getSpecialistRegistry } = require('../specialistRegistry');
        const registry = getSpecialistRegistry();
        
        const specialist = registry.getSpecialist(specialistId);
        if (specialist && specialist.config.enabled) {
            return specialist.config.category;
        }
    } catch (error) {
       
        console.warn(`Failed to get specialist category from registry for ${specialistId}, using legacy mapping`);
    }
    
   
    return SPECIALIST_CATEGORY_MAPPING_LEGACY[specialistId] || 'content';
}

/**
 * 🔄 向后兼容：保持原有的导出名称
 * @deprecated 建议使用 getSpecialistCategory() 函数
 */
export const SPECIALIST_CATEGORY_MAPPING = SPECIALIST_CATEGORY_MAPPING_LEGACY; 

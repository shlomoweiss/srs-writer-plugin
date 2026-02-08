/**
 * Debug github-slugger's handling of Chinese
 */

import GithubSlugger from 'github-slugger';

function testSlugger() {
  const slugger = new GithubSlugger();
  
  console.log('=== GitHub Slugger Chinese Test ===');
  
  const testTitles = [
    '项目文档',
    '概述', 
    '项目介绍',
    '需求分析',
    'Introduction',
    'Project Overview',
    '1. 引言',
    '1.1 目的'
  ];
  
  testTitles.forEach(title => {
    const slug = slugger.slug(title);
    console.log(`"${title}" -> "${slug}"`);
  });
  
  // Reset slugger and test again
  console.log('\\n=== Test Again After Reset ===');
  const slugger2 = new GithubSlugger();
  testTitles.forEach(title => {
    const slug = slugger2.slug(title);
    console.log(`"${title}" -> "${slug}"`);
  });
}

testSlugger();

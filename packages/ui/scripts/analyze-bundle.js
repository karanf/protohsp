#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes imports and identifies potential bundle size optimizations
 */

const fs = require('fs')
const path = require('path')

// Heavy dependencies that should be optimized
const HEAVY_DEPS = {
  'recharts': '~500KB',
  '@tanstack/react-table': '~300KB', 
  'lucide-react': '~400KB',
  'date-fns': '~150KB',
  'motion': '~200KB',
  '@radix-ui': '~200KB (total)',
}

// Analyze view files for import patterns
function analyzeImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const imports = []
  
  // Extract import statements
  const importRegex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g
  let match
  
  while ((match = importRegex.exec(content)) !== null) {
    const moduleName = match[1]
    
    // Check if it's a heavy dependency
    if (Object.keys(HEAVY_DEPS).some(dep => moduleName.includes(dep))) {
      imports.push({
        module: moduleName,
        line: content.substring(0, match.index).split('\n').length,
        statement: match[0],
        isHeavy: true,
        estimatedSize: HEAVY_DEPS[Object.keys(HEAVY_DEPS).find(dep => moduleName.includes(dep))]
      })
    }
  }
  
  return imports
}

// Find all view files
function findViewFiles(dir) {
  const files = []
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true })
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name)
      
      if (item.isDirectory() && !item.name.startsWith('.')) {
        scan(fullPath)
      } else if (item.isFile() && item.name.endsWith('.tsx') && item.name.includes('view')) {
        files.push(fullPath)
      }
    }
  }
  
  scan(dir)
  return files
}

// Generate recommendations
function generateRecommendations(analysisResults) {
  const recommendations = []
  
  // Check for heavy imports that could be dynamic
  const heavyImports = analysisResults.filter(result => 
    result.imports.some(imp => imp.isHeavy)
  )
  
  if (heavyImports.length > 0) {
    recommendations.push({
      type: 'dynamic-import',
      message: 'Consider using dynamic imports for heavy components',
      files: heavyImports.map(r => r.file),
      impact: 'High - can reduce initial bundle by 1-2MB'
    })
  }
  
  // Check for icon import patterns
  const iconImports = analysisResults.filter(result =>
    result.imports.some(imp => imp.module.includes('lucide-react'))
  )
  
  if (iconImports.length > 0) {
    recommendations.push({
      type: 'icon-optimization',
      message: 'Icon imports detected - ensure tree shaking is working',
      files: iconImports.map(r => r.file),
      impact: 'Medium - can reduce bundle by 200-400KB'
    })
  }
  
  return recommendations
}

// Main analysis
function main() {
  console.log('🔍 Analyzing bundle size opportunities...\n')
  
  // Find view files in the workspace
  const viewFiles = [
    ...findViewFiles('./apps/greenheart/app'),
    ...findViewFiles('./packages/ui/components')
  ]
  
  console.log(`Found ${viewFiles.length} view files to analyze\n`)
  
  const analysisResults = []
  
  for (const file of viewFiles) {
    if (fs.existsSync(file)) {
      const imports = analyzeImports(file)
      analysisResults.push({
        file: path.relative(process.cwd(), file),
        imports
      })
    }
  }
  
  // Generate report
  console.log('📊 Bundle Analysis Report\n')
  console.log('=' * 50)
  
  let totalHeavyImports = 0
  
  for (const result of analysisResults) {
    const heavyImports = result.imports.filter(imp => imp.isHeavy)
    
    if (heavyImports.length > 0) {
      console.log(`\n📁 ${result.file}`)
      totalHeavyImports += heavyImports.length
      
      for (const imp of heavyImports) {
        console.log(`  ⚠️  ${imp.module} (${imp.estimatedSize}) - Line ${imp.line}`)
      }
    }
  }
  
  console.log(`\n📈 Summary:`)
  console.log(`Total heavy imports found: ${totalHeavyImports}`)
  
  // Generate recommendations
  const recommendations = generateRecommendations(analysisResults)
  
  if (recommendations.length > 0) {
    console.log('\n💡 Recommendations:')
    
    for (const rec of recommendations) {
      console.log(`\n${rec.type.toUpperCase()}:`)
      console.log(`  ${rec.message}`)
      console.log(`  Impact: ${rec.impact}`)
      console.log(`  Files: ${rec.files.length}`)
    }
  }
  
  console.log('\n✅ Analysis complete!')
}

if (require.main === module) {
  main()
}

module.exports = { analyzeImports, findViewFiles, generateRecommendations } 
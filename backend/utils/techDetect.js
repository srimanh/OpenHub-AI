export const extensionToBadge = (file) => {
    const map = {
      '.js': { label: 'JS', color: 'yellow' },
      '.jsx': { label: 'React', color: 'blue' },
      '.ts': { label: 'TS', color: 'blue' },
      '.tsx': { label: 'React', color: 'cyan' },
      '.md': { label: 'MD', color: 'gray' },
      '.css': { label: 'CSS', color: 'sky' },
      '.scss': { label: 'SCSS', color: 'pink' },
      '.sass': { label: 'Sass', color: 'pink' },
      '.html': { label: 'HTML', color: 'orange' },
      '.py': { label: 'Python', color: 'green' },
      '.go': { label: 'Go', color: 'cyan' },
      '.rs': { label: 'Rust', color: 'orange' },
      '.java': { label: 'Java', color: 'red' },
      '.rb': { label: 'Ruby', color: 'red' },
      '.php': { label: 'PHP', color: 'purple' },
      '.c': { label: 'C', color: 'blue' },
      '.cpp': { label: 'C++', color: 'blue' },
      '.cs': { label: 'C#', color: 'purple' },
      '.swift': { label: 'Swift', color: 'orange' },
      '.kt': { label: 'Kotlin', color: 'purple' },
      '.sql': { label: 'SQL', color: 'blue' },
      '.sh': { label: 'Shell', color: 'green' },
      '.bat': { label: 'Batch', color: 'gray' },
      '.ps1': { label: 'PowerShell', color: 'blue' },
      '.yml': { label: 'YAML', color: 'gray' },
      '.yaml': { label: 'YAML', color: 'gray' },
      '.toml': { label: 'TOML', color: 'blue' },
      '.ini': { label: 'INI', color: 'gray' },
      '.cfg': { label: 'Config', color: 'gray' },
      '.conf': { label: 'Config', color: 'gray' },
      '.lock': { label: 'Lock', color: 'gray' },
      '.log': { label: 'Log', color: 'gray' },
      '.txt': { label: 'Text', color: 'gray' },
      '.json': { label: 'JSON', color: 'yellow' },
      '.xml': { label: 'XML', color: 'orange' },
      '.svg': { label: 'SVG', color: 'green' },
      '.png': { label: 'Image', color: 'blue' },
      '.jpg': { label: 'Image', color: 'blue' },
      '.jpeg': { label: 'Image', color: 'blue' },
      '.gif': { label: 'Image', color: 'blue' },
      '.ico': { label: 'Icon', color: 'blue' },
      '.woff': { label: 'Font', color: 'purple' },
      '.woff2': { label: 'Font', color: 'purple' },
      '.ttf': { label: 'Font', color: 'purple' },
      '.eot': { label: 'Font', color: 'purple' }
    }
    const ext = file.slice(file.lastIndexOf('.'))
    return map[ext] || null
  }
  
  export const detectTechnologies = (filePath) => {
    const technologies = new Set()
    const fileName = filePath.toLowerCase()
    
    // File extension based detection
    const ext = filePath.slice(filePath.lastIndexOf('.'))
    if (ext === '.js') technologies.add('JavaScript')
    if (ext === '.jsx') technologies.add('React')
    if (ext === '.ts') technologies.add('TypeScript')
    if (ext === '.tsx') technologies.add('React TypeScript')
    if (ext === '.css') technologies.add('CSS')
    if (ext === '.scss') technologies.add('Sass')
    if (ext === '.sass') technologies.add('Sass')
    if (ext === '.py') technologies.add('Python')
    if (ext === '.go') technologies.add('Go')
    if (ext === '.rs') technologies.add('Rust')
    if (ext === '.java') technologies.add('Java')
    if (ext === '.rb') technologies.add('Ruby')
    if (ext === '.php') technologies.add('PHP')
    if (ext === '.c') technologies.add('C')
    if (ext === '.cpp') technologies.add('C++')
    if (ext === '.cs') technologies.add('C#')
    if (ext === '.swift') technologies.add('Swift')
    if (ext === '.kt') technologies.add('Kotlin')
    if (ext === '.sql') technologies.add('SQL')
    if (ext === '.sh') technologies.add('Shell')
    if (ext === '.bat') technologies.add('Batch')
    if (ext === '.ps1') technologies.add('PowerShell')
    if (ext === '.yml' || ext === '.yaml') technologies.add('YAML')
    if (ext === '.toml') technologies.add('TOML')
    if (ext === '.json') technologies.add('JSON')
    if (ext === '.xml') technologies.add('XML')
    if (ext === '.svg') technologies.add('SVG')
    if (ext === '.md') technologies.add('Markdown')
    
    // Filename based detection
    if (fileName.includes('package.json')) technologies.add('Node.js')
    if (fileName.includes('next.config')) technologies.add('Next.js')
    if (fileName.includes('tailwind.config')) technologies.add('TailwindCSS')
    if (fileName.includes('vite.config')) technologies.add('Vite')
    if (fileName.includes('webpack.config')) technologies.add('Webpack')
    if (fileName.includes('rollup.config')) technologies.add('Rollup')
    if (fileName.includes('tsconfig')) technologies.add('TypeScript')
    if (fileName.includes('dockerfile')) technologies.add('Docker')
    if (fileName.includes('docker-compose')) technologies.add('Docker Compose')
    if (fileName.includes('requirements.txt')) technologies.add('Python')
    if (fileName.includes('pyproject.toml')) technologies.add('Python')
    if (fileName.includes('cargo.toml')) technologies.add('Rust')
    if (fileName.includes('go.mod')) technologies.add('Go')
    if (fileName.includes('pom.xml')) technologies.add('Maven')
    if (fileName.includes('build.gradle')) technologies.add('Gradle')
    if (fileName.includes('gemfile')) technologies.add('Ruby')
    if (fileName.includes('composer.json')) technologies.add('Composer')
    if (fileName.includes('pnpm-lock.yaml')) technologies.add('pnpm')
    if (fileName.includes('yarn.lock')) technologies.add('Yarn')
    if (fileName.includes('package-lock.json')) technologies.add('npm')
    if (fileName.includes('.gitignore')) technologies.add('Git')
    if (fileName.includes('.env')) technologies.add('Environment')
    if (fileName.includes('readme')) technologies.add('Documentation')
    if (fileName.includes('license')) technologies.add('License')
    if (fileName.includes('changelog')) technologies.add('Changelog')
    if (fileName.includes('contributing')) technologies.add('Contributing')
    
    return Array.from(technologies)
  }
  
  export const getTechnologyColor = (tech) => {
    const colorMap = {
      'JavaScript': 'yellow',
      'React': 'blue',
      'TypeScript': 'blue',
      'React TypeScript': 'cyan',
      'CSS': 'sky',
      'Sass': 'pink',
      'Python': 'green',
      'Go': 'cyan',
      'Rust': 'orange',
      'Java': 'red',
      'Ruby': 'red',
      'PHP': 'purple',
      'C': 'blue',
      'C++': 'blue',
      'C#': 'purple',
      'Swift': 'orange',
      'Kotlin': 'purple',
      'SQL': 'blue',
      'Shell': 'green',
      'Batch': 'gray',
      'PowerShell': 'blue',
      'YAML': 'gray',
      'TOML': 'blue',
      'JSON': 'yellow',
      'XML': 'orange',
      'SVG': 'green',
      'Markdown': 'gray',
      'Node.js': 'green',
      'Next.js': 'black',
      'TailwindCSS': 'cyan',
      'Vite': 'yellow',
      'Webpack': 'blue',
      'Rollup': 'red',
      'Docker': 'blue',
      'Docker Compose': 'blue',
      'Maven': 'orange',
      'Gradle': 'green',
      'Composer': 'yellow',
      'pnpm': 'orange',
      'Yarn': 'blue',
      'npm': 'red',
      'Git': 'orange',
      'Environment': 'gray',
      'Documentation': 'blue',
      'License': 'gray',
      'Changelog': 'gray',
      'Contributing': 'green'
    }
    
    return colorMap[tech] || 'gray'
  }
  
  
  
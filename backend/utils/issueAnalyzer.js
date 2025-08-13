const fs = require('fs');
const path = require('path');

class IssueAnalyzer {
  constructor(issueData) {
    this.issueData = issueData;
    this.projectRoot = path.join(__dirname, '../../');
  }

  async analyzeIssue() {
    try {
      // 1. Extract keywords from issue title and description
      const titleKeywords = this.extractKeywords(this.issueData.title);
      const descriptionKeywords = this.extractKeywords(this.issueData.description || '');
      const keywords = [...new Set([...titleKeywords, ...descriptionKeywords])];

      // 2. Find relevant files based on keywords
      const files = await this.findRelevantFiles(keywords);
      
      // 3. Generate solution suggestions
      const suggestions = this.generateSuggestions(files);
      
      // 4. Create branch and commit
      const branchName = this.createBranchName(this.issueData.title);
      this.createBranchAndCommit(files, branchName, suggestions);
      
      return {
        success: true,
        files,
        suggestions,
        branchName
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  extractKeywords(text) {
    // Simple keyword extraction using regex
    const keywords = text.toLowerCase().match(/[a-zA-Z]+/g) || [];
    return keywords.filter(word => word.length > 3);
  }

  async findRelevantFiles(keywords) {
    const results = [];
    
    // Search through project files
    const files = await this.getAllProjectFiles();
    const relevantFiles = files.filter(file => {
      const filePath = file.replace(this.projectRoot, '');
      return keywords.some(keyword => 
        filePath.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    return relevantFiles;
  }

  async getAllProjectFiles() {
    const files = [];
    const queue = [this.projectRoot];
    
    while (queue.length) {
      const dir = queue.shift();
      const dirFiles = await fs.promises.readdir(dir);
      
      dirFiles.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          queue.push(filePath);
        } else {
          files.push(filePath);
        }
      });
    }
    
    return files;
  }

  generateSuggestions(files) {
    return files.map(file => ({
      file,
      suggestions: [
        `Modify ${file} to address the issue`,
        `Check for related issues in ${file}`,
        `Consider refactoring ${file} for better maintainability`
      ]
    }));
  }

  createBranchName(title) {
    return `fix/${this.slugify(title)}`;
  }

  slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  async createBranchAndCommit(files, branchName, suggestions) {
    // Implement git operations using simple-git
    const git = require('simple-git')();
    await git.checkoutLocal(branchName, /* start */ true);
    
    files.forEach(file => {
      git.add(file);
    });
    
    await git.commit(`fix: ${this.issueData.title}`);
    await git.push('origin', branchName);
  }
}

module.exports = IssueAnalyzer;
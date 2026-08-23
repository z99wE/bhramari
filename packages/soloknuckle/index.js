#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const ignore = require('ignore');

const API_URL = process.env.BHRAMARI_API_URL || 'https://bhramari-api-235116528765.us-central1.run.app/api/v1/scorecard';
const MAX_CODE_SIZE = 80000; // API limit

async function collectFiles(dir, ig) {
    let results = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (let entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(process.cwd(), fullPath);
        
        if (ig.ignores(relPath) || entry.name === '.git' || entry.name === 'node_modules') continue;
        
        if (entry.isDirectory()) {
            results.push(...await collectFiles(fullPath, ig));
        } else {
            results.push(fullPath);
        }
    }
    return results;
}

async function run() {
    const args = process.argv.slice(2);
    if (!args.includes('check')) {
        console.error("Usage: npx soloknuckle check [--strict]");
        process.exit(1);
    }
    
    const isStrict = args.includes('--strict');
    
    console.log("Soloknuckle: Analyzing codebase...");
    
    const ig = ignore();
    if (fs.existsSync('.gitignore')) {
        ig.add(fs.readFileSync('.gitignore', 'utf8'));
    }
    
    const files = await collectFiles(process.cwd(), ig);
    let combinedCode = "";
    
    for (let file of files) {
        if (combinedCode.length > MAX_CODE_SIZE) break;
        try {
            const ext = path.extname(file);
            if (['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip'].includes(ext)) continue;
            
            const content = fs.readFileSync(file, 'utf8');
            combinedCode += `\n\n--- File: ${path.relative(process.cwd(), file)} ---\n`;
            combinedCode += content.slice(0, 5000); // Take up to 5k chars per file
        } catch (e) {
            // skip binary/unreadable
        }
    }
    
    console.log("Soloknuckle: Generating 7-Domain Scorecard via Bhramari API...");
    
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: combinedCode.slice(0, MAX_CODE_SIZE) })
        });
        
        if (!res.ok) {
            console.error("API Error:", await res.text());
            process.exit(1);
        }
        
        const data = await res.json();
        const domains = data.domains || [];
        
        let failedGates = [];
        console.log("\n================ 7-DOMAIN SCORECARD ================\n");
        
        domains.forEach(d => {
            console.log(`[${d.domain}] Score: ${d.score}/100`);
            console.log(`Reasoning: ${d.reasoning}\n`);
            
            if (isStrict) {
                if (d.domain.includes("Security") && d.score < 70) failedGates.push("Security (min 70)");
                if (d.domain.includes("Testing") && d.score < 70) failedGates.push("Testing (min 70)");
                if (d.domain.includes("Reliability") && d.score < 60) failedGates.push("Reliability (min 60)");
                if (d.domain.includes("Supply Chain") && d.score < 50) failedGates.push("Supply Chain (min 50)");
            }
        });
        
        if (isStrict && failedGates.length > 0) {
            console.error("\n❌ STRICT MODE: Hard gates failed!");
            failedGates.forEach(g => console.error(` - ${g}`));
            process.exit(1);
        } else if (isStrict) {
            console.log("✅ STRICT MODE: All gates passed! Proceeding with CI/CD.");
        }
        
    } catch (e) {
        console.error("Failed to connect to Bhramari API:", e);
        process.exit(1);
    }
}

run();

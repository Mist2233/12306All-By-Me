#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.resolve(__dirname, '../packages/frontend/public/deconstructed_site')

function walk(dir) {
    const results = []
    const list = fs.readdirSync(dir, { withFileTypes: true })
    for (const ent of list) {
        const full = path.join(dir, ent.name)
        if (ent.isDirectory()) results.push(...walk(full))
        else results.push(full)
    }
    return results
}

function injectBase(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    // If already has <base href, skip
    if (/\<base\s+href=/i.test(content)) return false

    const dir = path.dirname(filePath)
    // compute web path from PUBLIC_DIR
    let rel = path.relative(PUBLIC_DIR, dir).split(path.sep).join('/')
    if (!rel) rel = ''
    const baseHref = '/' + (rel ? `deconstructed_site/${rel}/` : 'deconstructed_site/')

    // insert after <head> open
    const replaced = content.replace(/(<head[^>]*>)/i, `$1\n    <base href="${baseHref}">`)
    if (replaced === content) return false
    fs.writeFileSync(filePath, replaced, 'utf8')
    return true
}

function main() {
    if (!fs.existsSync(PUBLIC_DIR)) {
        console.error('Public deconstructed_site not found at', PUBLIC_DIR)
        process.exit(1)
    }

    const files = walk(PUBLIC_DIR).filter(f => f.toLowerCase().endsWith('.html'))
    let patched = 0
    for (const f of files) {
        try {
            if (injectBase(f)) patched++
        } catch (err) {
            console.error('Error patching', f, err.message)
        }
    }

    console.log(`Processed ${files.length} HTML files, patched ${patched} files.`)
}

main()

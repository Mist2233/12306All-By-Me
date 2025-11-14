#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

async function copyDir(src, dest) {
    await fs.promises.rm(dest, { recursive: true, force: true }).catch(() => { })
    await fs.promises.mkdir(path.dirname(dest), { recursive: true })
    // Node 18+ supports fs.cp
    if (fs.cp) {
        await fs.promises.cp(src, dest, { recursive: true })
    } else {
        // fallback: manual copy
        const entries = await fs.promises.readdir(src, { withFileTypes: true })
        await fs.promises.mkdir(dest, { recursive: true })
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name)
            const destPath = path.join(dest, entry.name)
            if (entry.isDirectory()) {
                await copyDir(srcPath, destPath)
            } else {
                await fs.promises.copyFile(srcPath, destPath)
            }
        }
    }
}

async function main() {
    const arg = process.argv[2]
    if (!arg) {
        console.error('Usage: node tools/import_deconstructed.js <path-to-deconstructed_site>')
        process.exit(2)
    }

    const src = path.resolve(arg)
    const dest = path.resolve(__dirname, '../packages/frontend/public/deconstructed_site')

    try {
        const stat = await fs.promises.stat(src)
        if (!stat.isDirectory()) throw new Error('Source is not a directory')
    } catch (err) {
        console.error('Source directory not found:', src)
        process.exit(3)
    }

    console.log(`Copying deconstructed site from:\n  ${src}\nto:\n  ${dest}`)
    try {
        await copyDir(src, dest)
        console.log('Copy complete. Start frontend dev server and open /deconstructed to preview.')
    } catch (err) {
        console.error('Copy failed:', err)
        process.exit(4)
    }
}

main()

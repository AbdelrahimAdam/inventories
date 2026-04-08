import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const outputDir = join(process.cwd(), 'public/icons')
const sourceIcon = join(process.cwd(), 'public/icon-source.png')

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
  console.log('Created icons directory')
}

if (!existsSync(sourceIcon)) {
  console.log('No source icon found at public/icon-source.png')
  console.log('Required sizes:', sizes.join(', '))
  console.log('Please add icons manually to public/icons/ with these names:')
  sizes.forEach(size => {
    console.log(`  - icon-${size}x${size}.png`)
  })
  process.exit(0)
}

try {
  const sharp = await import('sharp')
  console.log('Generating PWA icons...')
  
  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}x${size}.png`)
    
    await sharp.default(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath)
    
    console.log(`Generated ${size}x${size} icon`)
  }
  
  console.log('All icons generated successfully')
} catch (error) {
  console.log('Sharp package not installed. Run: npm install sharp')
  console.log('Required sizes:', sizes.join(', '))
  console.log('Please add icons manually to public/icons/ with these names:')
  sizes.forEach(size => {
    console.log(`  - icon-${size}x${size}.png`)
  })
}
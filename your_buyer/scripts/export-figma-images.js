/**
 * Script to export images from Figma design
 * 
 * To use this script:
 * 1. Get your Figma Personal Access Token from https://www.figma.com/developers/api#access-tokens
 * 2. Set FIGMA_TOKEN environment variable: export FIGMA_TOKEN=your_token_here
 * 3. Run: node scripts/export-figma-images.js
 * 
 * The script will download images from Figma and save them to public/images/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const FIGMA_FILE_KEY = 'GgvThj8CrZbvXq4beuHs1p';
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

if (!FIGMA_TOKEN) {
  console.error('Error: FIGMA_TOKEN environment variable is not set');
  console.error('Get your token from: https://www.figma.com/developers/api#access-tokens');
  console.error('Then run: export FIGMA_TOKEN=your_token_here');
  process.exit(1);
}

// Mapping of image names to their expected node IDs
// Note: You may need to find the actual node IDs by inspecting the Figma file
const imageMapping = {
  // Hero section
  'hero-image.jpg': '3225:5596', // Main hero image node ID - adjust based on actual structure
  
  // Categories - you'll need to find these node IDs
  'casual-wear.jpg': null, // Find node ID for Casual Wear image
  'women-top.jpg': null,   // Find node ID for Women Top image
  'ethnic-wear.jpg': null, // Find node ID for Ethnic Wear image
  'kids-wear.jpg': null,   // Find node ID for Kids Wear image
  
  // Products - you'll need to find these node IDs
  'product-1.jpg': null,
  'product-2.jpg': null,
  'product-3.jpg': null,
  'product-4.jpg': null,
  'product-5.jpg': null,
  'product-6.jpg': null,
  'product-7.jpg': null,
  'product-8.jpg': null,
  
  // Deals
  'deals-image.jpg': null,
  
  // Instagram
  'instagram-1.jpg': null,
  'instagram-2.jpg': null,
  'instagram-3.jpg': null,
  'instagram-4.jpg': null,
  
  // Testimonials
  'avatar-1.jpg': null,
  'avatar-2.jpg': null,
  'avatar-3.jpg': null,
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

function getImageUrls(nodeIds) {
  return new Promise((resolve, reject) => {
    const nodeIdsString = nodeIds.join(',');
    const url = `https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${nodeIdsString}&format=png&scale=2`;
    
    const options = {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.err) {
            reject(new Error(response.err));
            return;
          }
          resolve(response.images || {});
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function exportFigmaImages() {
  console.log('Starting Figma image export...\n');
  
  // Filter out null node IDs
  const validMappings = Object.entries(imageMapping).filter(([_, nodeId]) => nodeId !== null);
  
  if (validMappings.length === 0) {
    console.error('Error: No valid node IDs found in imageMapping');
    console.error('Please update the script with actual node IDs from your Figma file.');
    console.error('\nTo find node IDs:');
    console.error('1. Open your Figma file');
    console.error('2. Select an element');
    console.error('3. Look at the URL - node-id parameter contains the ID');
    console.error('4. Or use Figma DevTools plugin');
    return;
  }
  
  const nodeIds = validMappings.map(([_, nodeId]) => nodeId);
  const nodeIdToFilename = {};
  validMappings.forEach(([filename, nodeId]) => {
    nodeIdToFilename[nodeId] = filename;
  });
  
  try {
    console.log(`Requesting ${nodeIds.length} images from Figma...`);
    const imageUrls = await getImageUrls(nodeIds);
    
    console.log(`Received ${Object.keys(imageUrls).length} image URLs\n`);
    
    // Determine output directories based on filename
    const getOutputPath = (filename) => {
      if (filename.startsWith('hero-')) {
        return path.join(__dirname, '..', 'public', 'images', 'hero', filename);
      } else if (filename.startsWith('casual-wear') || filename.startsWith('women-top') || 
                 filename.startsWith('ethnic-wear') || filename.startsWith('kids-wear')) {
        return path.join(__dirname, '..', 'public', 'images', 'categories', filename);
      } else if (filename.startsWith('product-')) {
        return path.join(__dirname, '..', 'public', 'images', 'products', filename);
      } else if (filename.startsWith('deals-')) {
        return path.join(__dirname, '..', 'public', 'images', 'deals', filename);
      } else if (filename.startsWith('instagram-')) {
        return path.join(__dirname, '..', 'public', 'images', 'instagram', filename);
      } else if (filename.startsWith('avatar-')) {
        return path.join(__dirname, '..', 'public', 'images', 'testimonials', filename);
      }
      return path.join(__dirname, '..', 'public', 'images', filename);
    };
    
    // Download all images
    const downloadPromises = Object.entries(imageUrls).map(async ([nodeId, url]) => {
      if (!url) {
        console.warn(`⚠ No URL for node ${nodeId}`);
        return;
      }
      
      const filename = nodeIdToFilename[nodeId];
      if (!filename) {
        console.warn(`⚠ No filename mapping for node ${nodeId}`);
        return;
      }
      
      const outputPath = getOutputPath(filename);
      try {
        await downloadImage(url, outputPath);
      } catch (error) {
        console.error(`✗ Failed to download ${filename}:`, error.message);
      }
    });
    
    await Promise.all(downloadPromises);
    console.log('\n✓ Export complete!');
    
  } catch (error) {
    console.error('Error exporting images:', error.message);
    if (error.message.includes('403') || error.message.includes('401')) {
      console.error('\nAuthentication error. Please check your FIGMA_TOKEN.');
    }
  }
}

exportFigmaImages();

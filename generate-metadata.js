const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

// Configuration
const songsFolder = path.join(__dirname, 'public', 'songs');
const outputFile = path.join(__dirname, 'public', 'songs.json');

async function main() {
  try {
    // Read all files in the songs folder
    const files = fs.readdirSync(songsFolder);
    const songs = [];

    for (const file of files) {
      const filePath = path.join(songsFolder, file);
      const stats = fs.statSync(filePath);
      
      // Only process files (not directories) and skip non-audio files
      if (!stats.isFile() || !isAudioFile(file)) {
        continue;
      }

      try {
        const metadata = await mm.parseFile(filePath);
        const { common, format } = metadata;
        
        let pictureData = null;
        if (common.picture && common.picture.length > 0) {
          const picture = common.picture[0];
          pictureData = `data:${picture.format};base64,${picture.data.toString('base64')}`;
        }

        songs.push({
          title: common.title || path.parse(file).name,
          artist: common.artist || 'Unknown Artist',
          album: common.album || '',
          duration: format.duration || 0,
          cover: pictureData || 'https://via.placeholder.com/300?text=No+Cover',
          file: `songs/${file}`
        });
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
      }
    }

    // Write the songs array to a JSON file
    fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2));
    console.log(`Successfully generated metadata for ${songs.length} songs.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

function isAudioFile(filename) {
  const audioExtensions = ['.mp3', '.m4a', '.flac', '.wav', '.aac', '.ogg', '.wma'];
  const ext = path.extname(filename).toLowerCase();
  return audioExtensions.includes(ext);
}

main();

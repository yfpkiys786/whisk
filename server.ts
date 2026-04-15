import express from 'express';
import cors from 'cors';
import { Whisk } from './dist/Whisk.js';
import { ImageAspectRatio, ImageGenerationModel, VideoGenerationModel } from './dist/Constants.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Whisk API Server is running', version: '1.0.0' });
});

// Generate image
app.post('/api/generate', async (req, res) => {
  try {
    const { cookie, prompt, aspect = 'LANDSCAPE', seed = 0 } = req.body;
    
    if (!cookie || !prompt) {
      return res.status(400).json({ error: 'cookie and prompt are required' });
    }

    const whisk = new Whisk(cookie);
    await whisk.account.refresh();
    
    const project = await whisk.newProject(`Web-Gen-${Date.now()}`);
    
    const aspectKey = aspect as keyof typeof ImageAspectRatio;
    const aspectVal = ImageAspectRatio[aspectKey];
    
    const media = await project.generateImage({
      prompt,
      model: ImageGenerationModel.IMAGEN_3_5,
      aspectRatio: aspectVal,
      seed
    });

    res.json({
      success: true,
      mediaId: media.mediaGenerationId,
      imageUrl: media.url,
      projectId: project.projectId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Animate to video
app.post('/api/animate', async (req, res) => {
  try {
    const { cookie, mediaId, script, model = 'VEO_3_1' } = req.body;
    
    if (!cookie || !mediaId || !script) {
      return res.status(400).json({ error: 'cookie, mediaId and script are required' });
    }

    const whisk = new Whisk(cookie);
    await whisk.account.refresh();
    
    const originalMedia = await Whisk.getMedia(mediaId, whisk.account);
    const videoMedia = await originalMedia.animate(
      script,
      VideoGenerationModel[model as keyof typeof VideoGenerationModel]
    );

    res.json({
      success: true,
      videoId: videoMedia.mediaGenerationId,
      videoUrl: videoMedia.url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get media info
app.get('/api/media/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { cookie } = req.query;
    
    if (!cookie) {
      return res.status(400).json({ error: 'cookie is required' });
    }

    const whisk = new Whisk(cookie as string);
    await whisk.account.refresh();
    
    const media = await Whisk.getMedia(mediaId, whisk.account);

    res.json({
      success: true,
      mediaId: media.mediaGenerationId,
      url: media.url,
      type: media.type
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Whisk API Server running on port ${port}`);
});
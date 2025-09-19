import { db } from '../config/firebase.js';
import { parseCsv } from '../utils/csv.js';

export const uploadData = async (req, res) => {
  try {
    const contentType = req.headers['content-type'] || '';
    let payload = req.body;

    if (typeof payload === 'string' && contentType.includes('text/csv')) {
      payload = await parseCsv(payload);
    }

    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
      return res.status(400).json({ error: 'No data provided' });
    }

    const { filename = 'upload.json', uploadedBy = 'system', collection = 'uploads' } = req.query;

    const uploadDoc = {
      filename,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      data: payload,
    };

    const ref = await db.collection('uploads').add(uploadDoc);

    return res.status(201).json({ id: ref.id, ...uploadDoc });
  } catch (err) {
    console.error('Error uploading data', err);
    res.status(500).json({ error: 'Failed to upload data' });
  }
};



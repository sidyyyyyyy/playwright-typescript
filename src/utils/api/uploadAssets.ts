
import * as fs from 'fs';
import * as path from 'path';
import mime from 'mime-types';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getAssetIds(
  instance: string,
  token: string,
  assetEndpoint: string,
  folderRelativePath: string
): Promise<string[]> {
    const uploadUrl = `https://${instance}/rest/asset/v2/upload`;
  const folderPath = path.resolve(__dirname, '..', folderRelativePath);
  const assetIds: string[] = [];

  for (const filename of fs.readdirSync(folderPath)) {
    if (filename === '.DS_Store' || filename.startsWith('.')) continue;
    const filePath = path.join(folderPath, filename);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
      filename,
      contentType: mimeType,
    });

    const headers = {
      tokenId: token,
      fileName: filename,
      ...formData.getHeaders(), // sets correct boundary headers
    };
    console.log('upload headers', headers);
    try {
      console.log(`Uploading ${filename} to ${uploadUrl}`);
      const res = await axios.post(uploadUrl, formData, { headers });
      const assetId = res.data?.trim(); // Plain string, not JSON
      const ext = path.extname(filename); // e.g., ".pdf"

      if (assetId) {
        const assetIdWithExt = `${assetId}${ext}`;
        assetIds.push(assetId);
        console.log(`Uploaded: ${filename}, Asset ID: ${assetIdWithExt}`);
      } else {
        console.warn(`No assetId in response for ${filename}`, res.data);
      }
    } catch (err: any) {
      console.error(`Failed to upload ${filename}:`, err?.response?.status || err.message);
    }
  }
  console.log('== Final assetIds ==', assetIds);
  return  assetIds;
}

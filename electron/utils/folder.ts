import { extname } from 'node:path';
import { readdir } from 'node:fs/promises';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];

/**
 * 扫描文件夹获取图片文件
 */
export const scanFolderForImages = async (folderPath: string): Promise<string[]> => {
  try {
    const files = await readdir(folderPath, { withFileTypes: true });
    return files
      .filter((file) => file.isFile())
      .map((file) => file.name)
      .filter((filename) => {
        const ext = extname(filename).toLowerCase();
        return IMAGE_EXTENSIONS.includes(ext);
      });
  } catch (error) {
    console.error(`Error scanning folder: ${folderPath}`, error);
    return [];
  }
};

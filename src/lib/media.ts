import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

export interface MediaAnalysis {
    duration: number;
    width: number;
    height: number;
    format: string;
}

export async function analyzeMedia(filePath: string): Promise<MediaAnalysis> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(err);
            }

            const stream = metadata.streams.find(s => s.width && s.height);
            const format = metadata.format;

            resolve({
                duration: format.duration || 0,
                width: stream?.width || 0,
                height: stream?.height || 0,
                format: format.format_name || 'unknown'
            });
        });
    });
}

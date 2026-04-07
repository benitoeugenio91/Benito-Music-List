export interface Track {
  id: string;
  name: string;
  mimeType: string;
  type: 'audio' | 'video';
}

export type PlayerState = 'idle' | 'loading' | 'buffering' | 'playing' | 'paused' | 'error';

export interface PlayerSettings {
  apiKey: string;
  folderId: string;
}

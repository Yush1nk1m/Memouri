export interface Group {
  groupId: string;
  groupName: string;
  password: string;
}
export interface TokenProps {
  loggedInId: string;
}
export interface VideoWithThumbnail {
  videoId: string;
  title: string;
  description: string;
  like: number;
  view: number;
  lengthInSeconds: number;
  markInSeconds: number;
  createdAt: Date;
  pinnedAt: Date;
  likedAt: Date;
  thumbnail: string;
}

export interface UploadListProps {
  videos: VideoWithThumbnail[];
  onDelete: (videoId: string) => void;
}

export interface UploadFieldProps {
  selectedGroupId: string | undefined;
  loggedInId: string;
}


export interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  type: 'image' | 'text';
}

export interface Point {
  x: number;
  y: number;
}

export interface ViewportState {
  scale: number;
  translateX: number;
  translateY: number;
  activeSlideId: string | null;
  isManual?: boolean;
}

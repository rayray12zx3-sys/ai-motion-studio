export const DELIVERY_PROFILES = {
  landscapeDemo: {
    id: 'landscape-demo',
    width: 1920,
    height: 1080,
    fps: 30,
    codec: 'h264',
    container: 'mp4',
  },
  verticalSocial: {
    id: 'vertical-social-1080x1920-30',
    width: 1080,
    height: 1920,
    fps: 30,
    codec: 'h264',
    container: 'mp4',
  },
} as const;

export type DeliveryProfile = (typeof DELIVERY_PROFILES)[keyof typeof DELIVERY_PROFILES];

# M11 exact operator-supplied alpha-mask verification

The actual 1080x1920 PNG includes transparent pink RGB pixels with Alpha = 0 and opaque gray UI overlays with Alpha = 255. Alpha, not the visible RGB matte color, is authoritative: the pink area is video-open and the gray blocks video.

Use auditOverlayMask() with matching RGBA arrays, in the private production environment. The public engine has synthetic data only. The original operator reference and company media are never committed to public GitHub.

Private reference-mask comparison at 540x960: S07 71/71, S10 274/274 and S12 376/376 V3 frames show zero overlap against opaque gray. This is a technical geometric mask pass, not human visual acceptance or a guarantee that a changing live app UI is unobstructed. Do final Premiere on-plate and ad placement checks separately.

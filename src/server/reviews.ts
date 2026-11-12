import type { z } from "zod";
import type { reviewSchema } from "@/lib/validation";

type Input = z.infer<typeof reviewSchema>;

export function reviewData(input: Input) {
  const { avatar, images, packageId, ...rest } = input;
  return {
    ...rest,
    location: rest.location || null,
    packageId: packageId || null,
    avatarUrl: avatar?.url ?? null,
    avatarPublicId: avatar?.publicId ?? null,
    images: {
      create: images.map((i) => ({
        url: i.url,
        publicId: i.publicId ?? null,
        width: i.width ?? null,
        height: i.height ?? null,
        bytes: i.bytes ?? null,
      })),
    },
  };
}

import { utapi } from "../assets/uploadthing";

export const saveImage = async (image: Buffer, fileName: string) => {
  const file = new File([image], fileName, {
    type: "image/webp",
  });
  const uploadResponse = await utapi.uploadFiles([file]);

  if (!uploadResponse?.[0]?.data) {
    throw new Error("Failed to upload image");
  }

  return uploadResponse[0].data;
};

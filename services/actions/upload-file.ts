"use server";

import { UTApi } from "uploadthing/server";

export async function uploadFileToUploadThing(file: File) {
  try {
    const utapi = new UTApi({
      token: process.env.UPLOADTHING_SECRET!,
    });

    const response = await utapi.uploadFiles(file);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return {
      success: true as const,
      url: response.data?.url,
    };
  } catch (error) {
    return {
      success: false as const,
      error: (error as Error).message,
    };
  }
}

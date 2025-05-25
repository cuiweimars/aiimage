import { NextRequest, NextResponse } from "next/server";
import { generateFileKey, uploadFileToR2, getSignedFileUrl } from "@/lib/cloudflare-r2";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileKey = generateFileKey("anonymous"); // 可用用户ID替换
    const uploadRes = await uploadFileToR2(buffer, fileKey, file.type);
    if (!uploadRes.success) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    const signedUrlRes = await getSignedFileUrl(fileKey);
    if (!signedUrlRes.success || !signedUrlRes.url) {
      return NextResponse.json({ error: "Get URL failed" }, { status: 500 });
    }
    return NextResponse.json({ url: signedUrlRes.url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload error" }, { status: 500 });
  }
} 
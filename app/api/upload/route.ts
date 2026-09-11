import { v2 as cloudinary } from "cloudinary";
import { getAdmin } from "@/lib/admin-auth";

type CloudinaryUploadResult = { secure_url: string };

cloudinary.config({
    secure: true,
});

export async function POST(request: Request) {
    const admin = await getAdmin();
    if (!admin) {
        return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder: "rt18-products" }, (error, result) => {
                if (error) reject(error);
                else resolve(result as CloudinaryUploadResult);
            })
            .end(buffer);
    });

    return Response.json({
        success: true,
        url: result.secure_url,
    });
}
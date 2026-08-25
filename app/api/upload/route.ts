import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    secure: true,
});

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder: "rt18-products" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            })
            .end(buffer);
    });

    return Response.json({
        success: true,
        url: result.secure_url,
    });
}
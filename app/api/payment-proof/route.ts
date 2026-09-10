import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    secure: true,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return Response.json(
                {
                    success: false,
                    message: "Payment proof file is required",
                },
                { status: 400 }
            );
        }

        if (file.size === 0) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid payment screenshot",
                },
                { status: 400 }
            );
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            return Response.json(
                {
                    success: false,
                    message: "Only JPG, PNG and WebP images are allowed",
                },
                { status: 400 }
            );
        }

    
        const fileName = file.name.toLowerCase();

        const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

        if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid payment screenshot format",
                },
                { status: 400 }
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return Response.json(
                {
                    success: false,
                    message: "Payment screenshot must be less than 5 MB",
                },
                { status: 400 }
            );
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "rt18-payment-proofs",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                )
                .end(buffer);
        });

        return Response.json({
            success: true,
            url: result.secure_url,
        });
    } catch (error) {
        console.error("Payment proof upload error:", error);

        return Response.json(
            {
                success: false,
                message: "Payment proof upload failed",
            },
            { status: 500 }
        );
    }
}
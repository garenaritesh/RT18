import Razorpay from "razorpay";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
    const token = (await cookies()).get("auth_token")?.value;
    const user = token ? await verifyToken(token) : null;

    if (!user?.id) {
        return Response.json(
            { success: false, message: "Please login before creating a payment" },
            { status: 401 }
        );
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        return Response.json(
            { success: false, message: "Invalid payment amount" },
            { status: 400 }
        );
    }

    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `RT18_${Date.now()}`,
    });

    return Response.json({
        success: true,
        order,
    });
}
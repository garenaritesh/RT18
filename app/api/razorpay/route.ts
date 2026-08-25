import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
    const body = await request.json();

    const order = await razorpay.orders.create({
        amount: Math.round(body.amount * 100),
        currency: "INR",
        receipt: `RT18_${Date.now()}`,
    });

    return Response.json({
        success: true,
        order,
    });
}
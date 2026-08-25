import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET
);

export async function createToken(user: {
    id: number;
    name: string;
    email: string;
}) {
    return await new SignJWT({
        id: user.id,
        name: user.name,
        email: user.email,
    })
        .setProtectedHeader({
            alg: "HS256",
        })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(
            token,
            secret
        );

        return payload;
    } catch {
        return null;
    }
}
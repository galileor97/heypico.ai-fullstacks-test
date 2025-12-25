import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "HeyPico",
    description: "Welcome to HeyPico",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

export default function Home() {
    return (
        <main
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                padding: "2rem",
                textAlign: "center",
            }}
        >
            <h1
                style={{
                    fontSize: "3rem",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: "1rem",
                }}
            >
                Welcome to HeyPico
            </h1>
            <p style={{ fontSize: "1.25rem", opacity: 0.7, maxWidth: "600px" }}>
                Your Next.js + Elysia monorepo is ready to go! 🚀
            </p>
        </main>
    );
}

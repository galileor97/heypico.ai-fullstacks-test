import { ChatInterface } from "../components";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Home() {
  return (
    <main>
      <ThemeToggle />
      <ChatInterface />
    </main>
  );
}

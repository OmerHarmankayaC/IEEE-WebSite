import { notFound } from "next/navigation";

// Any address that matches no page shows the styled 404 of its language.
export default function CatchAll() {
  notFound();
}

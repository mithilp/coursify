import { auth } from "@clerk/nextjs/server";
import Navbar from "./Navbar";

export default async function NavbarWrapper() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return <Navbar isSignedIn={isSignedIn} />;
}

import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "../utils/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Coursify",
	description: "Generated a course about anything!",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}

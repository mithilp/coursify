import { Center } from "@chakra-ui/react";
import { SignIn } from "@clerk/remix";

export default function SignInPage() {
	return (
		<Center py={10}>
			<SignIn routing={"path"} path={"/login"} />
		</Center>
	);
}

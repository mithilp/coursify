import { Center } from "@chakra-ui/react";
import { SignUp } from "@clerk/remix";

export default function SignUpPage() {
	return (
		<Center py={10}>
			<SignUp routing={"path"} path={"/signup"} />
		</Center>
	);
}

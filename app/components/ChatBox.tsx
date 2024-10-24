import { Avatar, Box, HStack, Input, Spacer, Stack, Text, Textarea } from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import { SetStateAction, useEffect, useState } from "react";

import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { FaRobot } from "react-icons/fa6";


const ChatBox = ({ chapterInfo, id, chapter, unit }: { chapterInfo: any, id: string, chapter: number, unit: number }) => {

  const fetcher = useFetcher();
  const [chat, setChat] = useState<{ content: string; from: "user" | "bot"; }[]>([
  ])

  const [input, setInput] = useState("")

  const sendMessage = async () => {
    console.log("sending message");

    const formData = new FormData();
    formData.append("previousMessages", JSON.stringify(chat));
    formData.append("chapterInfo", JSON.stringify(chapterInfo));
    formData.append("courseId", id);
    formData.append("unitId", unit.toString());
    formData.append("message", input);
    fetcher.submit(formData, { method: "post" });
    const newChat: { content: string; from: "user" | "bot"; }[] = [...chat, { content: input, from: "user" }];
    setChat(newChat);
    setInput("");
  };

  let newData = false;

  useEffect(() => {
    console.log("fetcher state", fetcher.state);

    if (fetcher.data && !chat.some(message => message.content === fetcher.data)) {
      const newChat: { content: string; from: "user" | "bot"; }[] = [...chat, { content: fetcher.data, from: "bot" }];
      setChat(newChat);
    }
  }, [fetcher, chat]);

  return (
    <Stack w="100%" h={"100%"}>
      <Box height={"500px"} overflow={"hidden"} overflowY={"scroll"}>
        {chat.map((message: { content: string, from: "user" | "bot" }, i: number) => (
          <Stack w="100%" my={2} key={i}>
            {message.from == "user" ? (
              <HStack>
                <Spacer />
                <Box
                  width={"280px"}
                  backgroundColor={"blue.800"}
                  borderRadius={"8px"}
                >
                  <Text
                    wordBreak={"break-word"}
                    padding={"8px"}
                    overflowY={"hidden"}
                  >
                    {message.content}
                  </Text>
                </Box>
                <Stack>
                  <Spacer />
                  <Avatar
                    size="sm"
                  ></Avatar>
                </Stack>
              </HStack>
            ) :
              (
                <HStack>
                  <Avatar
                    size="sm"
                    icon={<FaRobot fontSize='1.15rem' />}
                  ></Avatar>

                  <Stack>
                    <Box
                      width={"280px"}
                      backgroundColor={"blue.800"}
                      borderRadius={"8px"}
                    >
                      <Text
                        wordBreak={"break-word"}
                        padding={"8px"}
                        overflowY={"hidden"}
                      >
                        {message.content}
                      </Text>
                      <Spacer />
                    </Box>
                  </Stack>
                </HStack>
              )
            }
          </Stack>

        )
        )}
      </Box>
      <Spacer />
      <Form method="post">
        <Input type="hidden" value={JSON.stringify(chapterInfo)} name="chapterInfo" />
        <Input type="hidden" value={JSON.stringify(chat)} name="previousMessages" />
        <Input type="hidden" value={id} name="courseId" />
        <Input type="hidden" value={unit} name="unitId" />
        <Textarea
          placeholder="Send Message"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          name="message"
          onKeyDown={(e) => {
            if (e.code == "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Box height={"2px"} />
      </Form>
    </Stack>
  );

}

export default ChatBox
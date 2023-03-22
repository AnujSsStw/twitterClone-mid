import axios from "axios";
import { type NextApiRequest, type NextApiResponse } from "next";

const github = async (req: NextApiRequest, res: NextApiResponse) => {
  const a = req.body.sender.login;
  const content = `:wave: Hi ${a}!`;
  const avatarUrl = req.body.sender.avatar_url;
  axios
    .post(process.env.DISCORD_WEBHOOK_URL as string, {
      content: content,
      embeds: [
        {
          image: {
            url: avatarUrl,
          },
        },
      ],
    })
    .then((discordResponse) => {
      console.log("Success!");
      res.status(200).send("ok");
    })
    .catch((err) => console.error(`Error sending to Discord: ${err}`));
};

export default github;

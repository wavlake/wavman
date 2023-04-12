import { Event } from "nostr-tools";
import { useEffect, useState } from "react";

const Comment: React.FC<{ event: Event }> = ({
  event: { content, tags, pubkey },
}) => {
  const [tagType, amount] = tags.find(([tag]) => tag === "amount") || [];
  return (
    <div className="flex">
      <div>{pubkey.slice(0, 4)},</div>
      <div>{amount},</div>
      <div>{content}</div>
    </div>
  );
};

const CommentsScreen: React.FC<{
  loading: boolean;
  comments: Event[];
}> = ({ loading, comments = [] }) => {
  const descriptionTags = comments
    .map(({ tags }) => {
      // grab the first tag that is a description
      const [descTag] = tags.filter(([tag]) => tag === "description");
      // grab the second element of the tag, which is the zap request event
      const [tagType, jsonEvent] = descTag;
      return jsonEvent || undefined;
      // filter out undefined values (TS still things they can exist so need to cast as string[] below)
    })
    .filter((desc) => desc !== undefined);

  const [parsedZapRequests, setParsedZapRequests] = useState<Event[]>([]);

  const parseZapRequestJSON = async (json: string[]) =>
    await Promise.all(json.map(async (content) => JSON.parse(content)));

  useEffect(() => {
    parseZapRequestJSON(descriptionTags as string[]).then((events) =>
      setParsedZapRequests(events)
    );
  }, [comments]);

  if (loading) return <div>Comments Loading Screen</div>;

  return (
    <div className="flex-col justify-start">
      {!comments ? (
        <div>No comments yet...</div>
      ) : (
        parsedZapRequests.map((event) => (
          <Comment event={event} key={event.id} />
        ))
      )}
    </div>
  );
};

export default CommentsScreen;

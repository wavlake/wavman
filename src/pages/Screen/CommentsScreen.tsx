import { useNIP07Login } from "@/nostr/useNip07Login";
import { Event } from "nostr-tools";
import { useFormContext } from "react-hook-form";

const Comment: React.FC<{ comment: Event }> = ({ comment }) => (
  <div>{comment.content}</div>
);

const CommentsScreen: React.FC<{
  loading: boolean;
  comments: Event[];
}> = ({ loading, comments }) => {
  const { register } = useFormContext();

  if (loading) return <div>Comments Loading Screen</div>;
  const { publicKey } = useNIP07Login();
  return (
    <div className="">
      {publicKey && 
        <>
          <input {...register("comment")} />
          <button type="submit">Add Comment</button>
        </>
      }
      {!comments.length ? (
        <div>No comments yet...</div>
      ) : (
        comments.map((comment) => (
          <Comment comment={comment} key={comment.id} />
        ))
      )}
    </div>
  );
};

export default CommentsScreen;

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

  return (
    <div className="flex-col">
      <input {...register("comment")} />
      {/* TODO - disable when not logged in */}
      <button type="submit">Add Comment</button>
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

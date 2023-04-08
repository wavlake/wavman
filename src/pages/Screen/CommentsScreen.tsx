import { Event } from "nostr-tools";

const Comment: React.FC<{ comment: Event }> = ({ comment }) => (
  <div>{comment.content}</div>
);

const CommentsScreen: React.FC<{
  loading: boolean;
  comments: Event[];
}> = ({ loading, comments }) => {
  if (loading) return <div>Comments Loading Screen</div>;

  return (
    <div className="">
      {/* <input {...register("comment")} /> */}
      {/* TODO - disable when not logged in */}
      <button type="submit">Add Comment</button>
      {!comments ? (
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

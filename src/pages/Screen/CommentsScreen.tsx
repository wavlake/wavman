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

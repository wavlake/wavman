import { usePostComment } from "@/nostr/usePostComment";
import { Event } from "nostr-tools";
import useSWRMutation from "swr/mutation";

const Comment: React.FC<{ comment: Event }> = ({ comment }) => (
  <div>{comment.content}</div>
);

const Comments: React.FC<{
  loading: boolean;
  submitCommentHandler: (comment: string) => void;
  comments?: Event[];
}> = ({ loading, submitCommentHandler, comments }) => {
  if (loading) return <div>Loading...</div>;
  if (!comments) return <div>No comments yet...</div>;

  return (
    <div className="flex-col">
      <input></input>
      <button onClick={() => submitCommentHandler("Test comment")}>
        Add Comment
      </button>
      {comments.map((comment) => (
        <Comment comment={comment} key={comment.id} />
      ))}
    </div>
  );
};

export default Comments;

import { usePostComment } from "@/nostr/usePostComment";
import { Event } from "nostr-tools";
import { useFormContext } from "react-hook-form";
import useSWRMutation from "swr/mutation";

const Comment: React.FC<{ comment: Event }> = ({ comment }) => (
  <div>{comment.content}</div>
);

const Comments: React.FC<{
  loading: boolean;
  comments?: Event[];
}> = ({ loading, comments }) => {
  const { register } = useFormContext();

  if (loading) return <div>Loading...</div>;
  if (!comments) return <div>No comments yet...</div>;

  return (
    <div className="flex-col">
      <input {...register("comment")} />
      <button type="submit">
        Add Comment
      </button>
      {comments.map((comment) => (
        <Comment comment={comment} key={comment.id} />
      ))}
    </div>
  );
};

export default Comments;

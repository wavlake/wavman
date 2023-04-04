import { usePostComment } from "@/nostr/usePostComment";
import { Event } from "nostr-tools";
import useSWRMutation from 'swr/mutation'

const Comment: React.FC<{ comment: Event }> = ({ comment }) => (
  <div>
    {comment.content}
  </div>
)

const Comments: React.FC<{
  loading: boolean;
  comments?: Event[];
}> = ({
  loading,
  comments,
}) => {
  const submitCommentHandler = () => {
    console.log('submit comment')
  };
  if (loading) return (<div>Loading...</div>);
  if (!comments) return (<div>No comments yet...</div>);

  return (
    <div className="flex-col">
      {comments.map(comment => <Comment comment={comment} key={comment.id} />)}
      <button onClick={submitCommentHandler} />
    </div>
  )
}

export default Comments;
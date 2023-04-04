import { Event } from "nostr-tools";

const Comment: React.FC<{ comment: Event }> = ({ comment }) => (
  <div>
    {comment.content}
  </div>
)

const Comments: React.FC<{
  comments: Event[];
}> = ({
  comments,
}) => {
  const submitCommentHandler = () => {
    console.log('submit comment')
  };
  return (
    <div className="flex-col">
      {comments.map(comment => <Comment comment={comment} key={comment.id} />)}
      <button onClick={submitCommentHandler} />
    </div>
  )
}

export default Comments;
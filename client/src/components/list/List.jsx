import './list.scss'
import Card from"../card/Card"

function List({ posts = [] }){
  console.log("=== LIST COMPONENT DEBUG ===");
  console.log("Posts received:", posts);
  console.log("Posts length:", posts.length);
  console.log("Posts type:", typeof posts);
  console.log("Is posts array?", Array.isArray(posts));

  if (!posts || posts.length === 0) {
    console.log("No posts found - showing empty message");
    return (
      <div className='list'>
        <p>No posts found.</p>
      </div>
    );
  }

  console.log("Rendering posts:", posts.length, "items");
  return (
    <div className='list'>
      {posts.map((item, index) => {
        console.log(`Rendering post ${index}:`, item);
        return <Card key={item.id} item={item}/>;
      })}
    </div>
  )
}

export default List
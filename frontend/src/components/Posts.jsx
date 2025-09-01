import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux'

const Posts = () => {
  const {posts} = useSelector(store=>store.post);

  if(!posts||posts&&posts.length===0) return (<div>Post not found</div>);

  return (
    <div>
        {
            posts.map((post) => <Post key={post?._id} post={post}/>)
        }
    </div>
  )
}

export default Posts
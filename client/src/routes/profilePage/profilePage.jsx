import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import "./profilePage.scss";
import apiRequest from"../../lib/apiRequest"
import { useNavigate, Link, useLoaderData, Await } from "react-router-dom";
import { useContext, Suspense } from "react";
import {AuthContext} from "../../context/AuthContext"

function ProfilePage() {
  const data = useLoaderData();
  const {updateUser, currentUser} = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = async ()=>{
    try{
      await apiRequest.post("/auth/logout")
      updateUser(null)
      navigate("/")
    }catch(err){
      console.log(err)
    }
  };

  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to="/profile/update">
            <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img
                src={currentUser.avatar || "noavatar.jpg"}
                alt=""
              />
            </span>
            <span>
              Username: <b>{currentUser.username}</b>
            </span>
            <span>
              E-mail: <b>{currentUser.email}</b>
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="title">
            <h1>My List</h1>
            <Link to="/add">
            <button>Create New Post</button>
            </Link>
          </div>
          <Suspense fallback={<p>Loading posts...</p>}>
            <Await resolve={data.postResponse}>
              {(postsData) => {
                console.log("=== PROFILE PAGE DEBUG ===");
                console.log("Full postsData:", postsData);
                console.log("postsData keys:", Object.keys(postsData));
                console.log("postsData.data:", postsData.data);
                console.log("postsData.data.userPosts:", postsData.data?.userPosts);
                console.log("postsData.data.savedPosts:", postsData.data?.savedPosts);
                console.log("User posts length:", postsData.data?.userPosts?.length);
                return (
                  <List posts={postsData.data?.userPosts || []} />
                );
              }}
            </Await>
          </Suspense>
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <Suspense fallback={<p>Loading saved posts...</p>}>
            <Await resolve={data.postResponse}>
              {(postsData) => {
                console.log("=== SAVED POSTS DEBUG ===");
                console.log("Saved posts:", postsData.data?.savedPosts);
                console.log("Saved posts length:", postsData.data?.savedPosts?.length);
                console.log("Saved posts type:", typeof postsData.data?.savedPosts);
                console.log("Is savedPosts array?", Array.isArray(postsData.data?.savedPosts));
                console.log("All postsData keys:", Object.keys(postsData));
                console.log("postsData.data keys:", Object.keys(postsData.data || {}));
                if (postsData.data?.savedPosts && postsData.data.savedPosts.length > 0) {
                  console.log("First saved post:", postsData.data.savedPosts[0]);
                }
                return (
                  <List posts={postsData.data?.savedPosts || []} />
                );
              }}
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

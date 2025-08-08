import { defer } from "react-router-dom";
import apiRequest from "./apiRequest";

export const singlePageLoader = async ({ request, params }) => {
  const token = localStorage.getItem("token");
  const res = await apiRequest("/posts/" + params.id,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Send as Bearer token
      },
    }
  );
  return res.data.post;
};

export const listPageLoader = async ({ request, params }) => {
  const query = request.url.split("?")[1];
  const token = localStorage.getItem("token");
  const postPromise = apiRequest("/posts?" + query, {
      headers: {
        Authorization: `Bearer ${token}`, // Send as Bearer token
      },
    }).then(res => res.data.posts);
  return defer({
    postResponse: postPromise,
  });
};

export const profilePageLoader = async () => {
  const token = localStorage.getItem("token");
  const postPromise = apiRequest("/users/profilePosts", {
      headers: {
        Authorization: `Bearer ${token}`, // Send as Bearer token
      },
    });
  const chatPromise = apiRequest("/chats",{
      headers: {
        Authorization: `Bearer ${token}`, // Send as Bearer token
      },
    });
  return defer({
    postResponse: postPromise,
    chatResponse: chatPromise,
  });
};
import prisma from "../lib/prisma.js";

export const getPosts = async(req, res) => {
  const query = req.query;
  console.log("Search query parameters:", query);
  
  try{
      const whereClause = {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price:{
          gte:parseInt(query.minPrice) || 0,
          lte:parseInt(query.maxPrice) || 1000000000,
        }
      };

      // Remove undefined values
      Object.keys(whereClause).forEach(key => {
        if (whereClause[key] === undefined) {
          delete whereClause[key];
        }
      });

      // Handle price filter separately
      if (whereClause.price) {
        if (whereClause.price.gte === 0 && whereClause.price.lte === 1000000000) {
          delete whereClause.price;
        }
      }

      console.log("Final where clause:", whereClause);

      const posts = await prisma.post.findMany({
        where: whereClause,
        include: {
          postDetail: true,
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      });

      console.log("Found posts count:", posts.length);
      res.status(200).json({posts});
  }catch(err){
      console.log(err);
      res.status(500).json({message:"failed to get posts"});
  }
}

export const getPost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId; // This will be undefined if no token provided
  
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the post is saved by the current user
    let isSaved = false;
    if (tokenUserId) {
      const savedPost = await prisma.savedPost.findFirst({
        where: {
          userId: tokenUserId,
          postId: id,
        },
      });
      isSaved = !!savedPost;
    }

    res.status(200).json({ 
      post: {
        ...post,
        isSaved
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async(req, res) => {
    try{
        res.status(200).json({})
    }catch(err){
        console.log(err)
        res.status(500).json({message:"failed to update posts"})
    }
}

export const deletePost = async(req, res) => {
    const id = req.params.id;
    const tokenUserId=req.userId
    try{
        const post = await prisma.post.findUnique({
            where:{id}
        })
        if (post.userId !== tokenUserId){
            return res.status(403).json({message:"not authorized!"})
        }

        await prisma.post.delete({
            where: {id},
        });
        res.status(200).json({message: "Post Deleted!"})
    }catch(err){
        console.log(err)
        res.status(500).json({message:"failed to delete posts"})
    }
}

export const createSampleData = async (req, res) => {
  const tokenUserId = req.userId;
  
  try {
    // Create a sample post
    const samplePost = await prisma.post.create({
      data: {
        title: "Sample Property",
        price: 250000,
        images: ["https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"],
        address: "123 Sample Street",
        city: "Sample City",
        bedroom: 3,
        bathroom: 2,
        latitude: "40.7128",
        longitude: "-74.0060",
        type: "buy",
        property: "house",
        userId: tokenUserId,
        postDetail: {
          create: {
            desc: "This is a sample property description",
            utilities: "owner",
            pet: "allowed",
            income: "Not specified",
            size: 1500,
            school: 500,
            bus: 200,
            restaurant: 300,
          },
        },
      },
    });

    // Save this post for the user
    await prisma.savedPost.create({
      data: {
        userId: tokenUserId,
        postId: samplePost.id,
      },
    });

    res.status(200).json({ 
      message: "Sample data created successfully",
      post: samplePost 
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create sample data!" });
  }
};
import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
  const tokenUserId = req.userId;

  try {
    // Get all chats where the current user is a participant
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: tokenUserId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            receiver: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get only the latest message
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format the response to include the other participant and latest message
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(
        participant => participant.userId !== tokenUserId
      );
      
      return {
        id: chat.id,
        otherUser: otherParticipant?.user,
        latestMessage: chat.messages[0] || null,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      };
    });

    res.status(200).json(formattedChats);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chats!" });
  }
};

export const getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  const tokenUserId = req.userId;

  try {
    // Verify the user is a participant in this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: tokenUserId,
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or access denied!" });
    }

    // Get all messages for this chat
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get messages!" });
  }
};

export const createChat = async (req, res) => {
  const tokenUserId = req.userId;
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({ message: "Receiver ID is required!" });
  }

  if (tokenUserId === receiverId) {
    return res.status(400).json({ message: "Cannot create chat with yourself!" });
  }

  try {
    // Check if a chat already exists between these users
    const existingChat = await prisma.chat.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [tokenUserId, receiverId],
            },
          },
        },
        AND: {
          participants: {
            some: {
              userId: tokenUserId,
            },
          },
          participants: {
            some: {
              userId: receiverId,
            },
          },
        },
      },
    });

    if (existingChat) {
      return res.status(200).json({ 
        message: "Chat already exists!", 
        chatId: existingChat.id 
      });
    }

    // Create new chat
    const newChat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            { userId: tokenUserId },
            { userId: receiverId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({ 
      message: "Chat created successfully!", 
      chat: newChat 
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create chat!" });
  }
};

export const sendMessage = async (req, res) => {
  const tokenUserId = req.userId;
  const { chatId, content, receiverId } = req.body;

  if (!chatId || !content || !receiverId) {
    return res.status(400).json({ message: "Chat ID, content, and receiver ID are required!" });
  }

  try {
    // Verify the user is a participant in this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: tokenUserId,
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or access denied!" });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: tokenUserId,
        receiverId,
        chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(message);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send message!" });
  }
}; 
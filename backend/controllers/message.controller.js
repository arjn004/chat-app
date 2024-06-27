import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async(req, res) => {
    console.log("Message", req.body)
    try{
        const {message} = req.body;
        const {id: recieverId} = req.params;
        const senderId = req.user._id;
        let conversation = await Conversation.findOne({
            participants:{
                $all: [senderId, recieverId],
            }
        })
        if(!conversation){
            conversation = await Conversation.create({
                participants: 
                   [senderId, recieverId]
            })
        }
        const newMessage = new Message({
            message,
            senderId,
            recieverId 
        })

        if(newMessage){
            conversation.messages.push(newMessage._id);
        }

        // await conversation.save()
        // await newMessage.save()
        await Promise.all([conversation.save(), newMessage.save()])

        const recieverSocketId = getReceiverSocketId(recieverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage) 
        }

        res.status(201).json(newMessage); 
    }
    catch(error){
        console.log("Error in message controller", error.message)
        res.status(500).json({error: "Internal Sever Error"})
    }
}

export const getMessage = async (req, res) => {
    try{
        const {id: userToChatId} = req.params;
        const senderId = req.user._id;
        let conversation = await Conversation.findOne({
            participants:{
                $all: [senderId, userToChatId],
            }
        }).populate("messages")

        if(!conversation){
           return res.status(200).json([])
        }

        const messages = conversation.messages

        res.status(200).json(messages)
    }
    catch(error){
        console.log("Error in message controller", error.message)
        res.status(500).json({error: "Internal Sever Error"})
    }
}
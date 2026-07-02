import mongoose, { Types } from "mongoose";

const messageSchema =new mongoose.Schema({
    content:{
        type:String,
        required:function(){
            return !this.attachments.length
        }
    },
    attachments:[String],
    senderId:{
        type:Types.ObjectId,
        ref:"User",
    },
    receiverId:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    }
},{
    timestamps:true
})
const messageModel = mongoose.model("Message",messageSchema);
export default messageModel;
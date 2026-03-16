import {Mongoose, Schema, model} from "mongoose"


const messageSchema = new Schema({
    sender:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    receiver:{
         type:Schema.Types.ObjectId,
        ref:"user"
    },
    message:{
        type:String,
    },
    isEdited:{
        type:Boolean,
        default:false,
    }

},{
    strict:"throw",
    timestamps:true,
    versionKey:false
})

export const MessageModel = model("message",messageSchema);
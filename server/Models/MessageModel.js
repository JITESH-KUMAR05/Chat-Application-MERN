import mongoose, {Mongoose, Schema, model} from "mongoose"


const messageSchema = new Schema({
    sender:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    receiver:{
         type:Schema.Types.ObjectId,
        ref:"user"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "channel"
    },
    // For Thread replies, point to the parent message
    parentMessage: {
        type: Schema.Types.ObjectId,
        ref: "message",
        default: null
    },
    content:{
        type:String,
    },
    isEdited:{
        type:Boolean,
        default:false,
    },
    reactions: {
        type: [
            {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "user"
            },
            emoji: String
            }
        ],
        default: []
    }
},{
    strict:"throw",
    timestamps:true,
    versionKey:false
})

export const MessageModel = model("message",messageSchema);
import {Schema, model} from "mongoose"


const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    username: {              
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    profilePic:{
        type:String,

    },
    tagLine:{
        type:String,
    }
    
},{
    strict:"throw",
    timestamps:true,
    versionKey:false
})

export const UserModel = model("user",userSchema);
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({

user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
title:{
    type:String,
    required:true,
},
priority:{
    type:String,
    default:"General"
},
durationMin:{
    type:Number,
    default:30
},
completed:{
    type:Boolean,
    default:false
},
createdAt:{
    type:Date,
    default:Date.now
}

})

module.exports=mongoose.model("Task",TaskSchema)
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Register a new user

exports.register = async (req,res)=>{

    try{
        const{name,email,password}= req.body;
        
        if(!email || !password){

            return res.status(400).json({error:"Email and password are required"})

            const exists = await User.findOne({email});
            if(exists) return res.status(400).json({error:"User already exists with this email"}) 
            
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password,salt);

            const user = await User.create(
                {name,email,passwordHash}
            )

            const token = jwt.sign(
                {id:user._id},process.env.JWT_SECRET,{
                    expiresIn:'7d'
                }
            )

            return res.json({
                message:"User registered successfully",
                token,
                user:{
                    id:user._id,name:user.name,email:user.email
                },
            })
        }


    }catch(err){
        return res.status(500).json({error:"Server error"})
    }

}
exports.login = async(req,res)=>{
    try{
        const{email,password}= req.body;

        const user = await User.find({email})
        if(!user) return res.status(400).json({error:"Invalid email or password"})
         
        const isMatch = await bcrypt.compare(password,user.passwordHash)
        if(!isMatch) return res.status(400).json({error:"Invalid email or password"})

        const token = jwt.sign(
            {id:user._id},process.env.JWT_SECRET,{
                expiresIn:'7d'
            }
        )

        return res.json({
            message:"User logged in successfully",
            token,
            user:{
                id:user._id,name:user.name,email:user.email
            },
        })    
            
    
    }
    catch(err){
        return res.status(500).json({error:"Server error"})
    }

}   

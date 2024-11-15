import {db} from "../db.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'



export const login=(req,res)=>{
    //check if users already registered

    const q = "SELECT * FROM users WHERE username=?"

    db.query(q,[req.body.username],(err,data)=>{
        if(err){
            return res.json(err)
        }
        if(data.length===0){
            
            return res.status(404).json("user doesn't exist");
        }

        //check passwpord
        const isPasswordCorrect = bcrypt.compareSync(req.body.password,data[0].password);

        if(!isPasswordCorrect){
            return res.status(400).json("wrong username or password!")
        }
        
        const token = jwt.sign({id:data[0].id},"jwtkey")
        console.log(token)
        const {password ,...other} = data[0]
        
        res.cookie("access_token", token, {
            httpOnly: true,        // Prevent client-side JavaScript from accessing the cookie
        }).status(200).json(other); // Respond after setting the cookie
        
        // res.cookie("access_token",token, {
        //     httpOnly: true,// Prevent access to the cookie from client-side scripts
        //     sameSite:"strict",
        //     secure: false, 
           
        // }).status(200).json(other); // Send response after setting the cookie

        console.log("Cookies set:", req.cookies);
        
    });
};






export const register=(req,res)=>{
    //check existing user
    const q = "SELECT * FROM users WHERE email= ? OR username= ?"

    db.query(q,[req.body.email,req.body.username],(err,data)=>{//********* */
        if(err){
            return res.json(err)
        }
        if(data.length){
            return res.status(409).json("user already exists!!")
        }
        //if user doesnt exist hash the password and create user

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password,salt)

        const q = "INSERT INTO users (`username`,`email`,`password`) VALUES (?)"
        const values = [req.body.username,
                req.body.email,
                hash]

        db.query(q,[values],(err,data)=>{
            if(err){
                return res.json(err)
            }
            return res.status(200).json("user has been created")
        })

    })
}




export const logout=(req,res)=>{
    res.clearCookie("access_token",{
    
        sameSite:"none",
        secure:true
    }).status(200).json("User has been logged out")
}
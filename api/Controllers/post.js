import { db } from "../db.js";
import jwt from "jsonwebtoken";


export const getPosts =(req,res)=>{
    const q = req.query.cat ?"SELECT * FROM posts WHERE cat=?":"SELECT * FROM posts";

    db.query(q,[req.query.cat],(err,data)=>{
        if(err) return res.send(err);
        else {
            return res.status(200).json(data);
        }
    })   
}


export const getPost = (req, res) => {
    const q =  "SELECT p.id,u.username, p.title, p.desc, p.img, u.img as userImg, p.cat, p.date FROM users u JOIN posts p ON p.uid = u.id WHERE p.id=?"
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.send(err);

        return res.status(200).json(data[0]);
    });
};




export const addPost = (req, res) => {
    const token = req.cookies.access_token; // Get token from cookies

    if (!token) {
        return res.status(401).json("User NOT authenticated!!"); // If no token, return an error
    }

    // jwt.verify checks if the token is valid
    jwt.verify(token, "jwtkey", (err, userInfo) => { 
        if (err) return res.status(403).json("Invalid token"); // If token is invalid, return an error
        
        // Now we can use `userInfo` because it's inside the callback, after the token was verified
        const q = "INSERT INTO posts(`title`,`desc`,`img`,`cat`,`date`,uid) VALUES(?)"; // SQL query to insert the post

        const values = [
            req.body.title,    // Title of the post
            req.body.desc,     // Description of the post
            req.body.img,      // Image URL for the post
            req.body.cat,      // Category of the post
            req.body.date,     // Date of the post
            userInfo.id        // User ID from the token (now we can safely use `userInfo`)
        ];

        // Execute the query to insert the post into the database
        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err); // If there's an error, return it
            return res.json("Post has been created"); // If successful, send success message
        });
    });
};





export const deletePost =(req,res)=>{
    console.log("Delete endpoint reached");

    const token = req.cookies.access_token
    console.log("Token:", token); 
    
    
    if(!token) return res.status(401).json("User NOT authenticated!!");

    jwt.verify(token,"jwtkey",(err,userInfo)=>{
        if(err) return res.status(403).json("invalid token")

        console.log("Decoded user information:", userInfo);

        const postId = req.params.id
        console.log(postId,userInfo)
        const q = "DELETE FROM posts WHERE `id`=? AND `uid`=?"

        db.query(q,[postId,userInfo.id],(err,data)=>{
            if(err) return res.status(403).json("you can delete only your own post")

            return res.status(200).json("post has been delete")
        })
    })

}



export const updatePost = (req, res) => {
    const token = req.cookies.access_token; // Get token from cookies

    if (!token) {
        return res.status(401).json("User NOT authenticated!!"); // If no token, return an error
    }

    // jwt.verify checks if the token is valid
    jwt.verify(token, "jwtkey", (err, userInfo) => { 
        if (err) return res.status(403).json("Invalid token"); // If token is invalid, return an error
        
        // Now we can use `userInfo` because it's inside the callback, after the token was verified
        const q = "UPDATE posts SET `title`=?, `desc`=?, `img`=?, `cat`=? WHERE `id`=? AND `uid`=?";
        const postId = req.params.id; // Get the post ID from the request params
        const values = [
            req.body.title,   // Title of the post
            req.body.desc,    // Description of the post
            req.body.img,     // Image URL for the post
            req.body.cat,     // Category of the post
        ];

        // Execute the query to update the post in the database
        db.query(q, [...values, postId, userInfo.id], (err, data) => {
            if (err) return res.status(500).json(err); // If there's an error, return it
            return res.json("Post has been updated"); // If successful, send success message
        });
    });
};

